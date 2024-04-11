const { Op } = require("sequelize");
const speakeasy = require("speakeasy");
const Verificationtable = require("../models/emailVerification");
const Token = require("../models/token.model");
const UserModel = require("../models/user.model");
const cacheUtil = require("../utils/cache.util");
const jwtUtil = require("../utils/jwt.util");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: true,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.createUser = (user) => UserModel.create(user);

exports.findUserByEmail = async (email) => {
  const otpId = (
    await Verificationtable.findOne({
      where: {
        email: email,
      },
    })
  )?.id;
  if (!otpId) {
    return false;
  }
  return await UserModel.findOne({
    where: {
      otpId,
    },
  });
};

exports.findEmailByOtpId = async (otpId) => {
  const email = (
    await Verificationtable.findOne({
      where: {
        id: otpId,
        isVerified: true,
      },
    })
  )?.email;
  if (!email) {
    throw Error("Email not verified.");
  }
  return email;
};

exports.findUserById = (id) => UserModel.findByPk(id);

exports.logoutUser = async (token, exp) => {
  const now = new Date();
  const expire = new Date(exp * 1000);
  const milliseconds = expire.getTime() - now.getTime();
  const tokenData = await Token.destroy({
    where: {
      [Op.or]: [{ token }, { refresh_token: token }],
    },
  });
  /* ----------------------------- BlackList Token ---------------------------- */
  return cacheUtil.set(token, token, milliseconds);
};

const destroyUserToken = async (userId) => {
  await Token.destroy({
    where: {
      userId,
    },
  });
  const user = await Token.findOne({
    where: {
      userId,
    },
  });
  if (user) {
    return destroyUserToken(userId);
  }
  return "success";
};

exports.createToken = async (user) => {
  await destroyUserToken(user.id);

  const token = await jwtUtil.createToken(
    { id: user.id },
    parseInt(process.env.TOKEN_EXP),
  );
  const refresh_token = await jwtUtil.createToken(
    { id: user.id, isRefresh: true },
    parseInt(process.env.TOKEN_EXP) * 24,
  );

  return Token.create({
    userId: user.id,
    token,
    refresh_token,
  });
};

exports.refreshToken = async (refreshToken) => {
  const data = await Token.findOne({
    where: {
      refresh_token: refreshToken,
    },
  });
  if (!data) {
    throw new Error("Invalid Refresh Token");
  }

  return this.createToken({ id: data.userId });
};

exports.isUserExists = async (email) => {
  console.log(email, "dd");
  const emailData = await Verificationtable.findOne({
    where: {
      email: email,
      isVerified: true,
    },
  });
  if (emailData) {
    console.log(emailData.id, "dd");
    const email = await UserModel.findOne({
      where: {
        otpId: emailData.id,
      },
    });

    if (!email) {
      emailData.destroy();
    }

    return !!email;
  }
  return false;
};

exports.sendEmailVerificationOtp = async (email) => {
  // of 20 characters
  const secret = speakeasy.generateSecret({ length: 20 }).base32;

  // Generate a TOTP code using the secret key
  const code = speakeasy.totp({
    // Use the Base32 encoding of the secret key
    secret: secret,

    // Tell Speakeasy to use the Base32
    // encoding format for the secret key
    encoding: "base32",
    window: 10,
  });
  const mailOptions = {
    from: process.env.EMAIL_ID,
    to: email,
    subject: "Email Verificaion Code",
    text: "Code: " + code + "\n This code is vaild for one minute only.",
  };
  return new Promise((res, rej) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        rej(error);
      } else {
        Verificationtable.create({
          email,
          otpToken: secret,
          isVerified: false,
        }).then((data) => {
          setTimeout(async () => {
            const da = await Verificationtable.findOne({
              where: {
                id: data.id,
              },
            });
            if (!da.isVerified)
              Verificationtable.destroy({
                where: {
                  id: da.id,
                },
              });
          }, process.env.CODE_VERIFICATION_TIME * 1000);
          res({ id: data.id });
        });
      }
    });
  });
};

exports.verifyEmailOtp = async (id, email, otp) => {
  const data = await Verificationtable.findOne({
    where: {
      id: id,
      email: email,
    },
  });
  if (!data) {
    throw Error("Invalid OTP");
  }

  const verified = speakeasy.totp.verify({
    secret: data.otpToken,
    encoding: "base32",
    window: 10,
    token: otp,
  });
  if (verified) {
    data.isVerified = true;
    await data.save();
    return "Email Verified";
  }

  throw Error("Invalid OTP");
};
