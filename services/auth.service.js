const { Op } = require("sequelize");
const speakeasy = require("speakeasy");
const Verificationtable = require("../models/emailVerification");
const Token = require("../models/token.model");
const UserModel = require("../models/user.model");
const cacheUtil = require("../utils/cache.util");
const jwtUtil = require("../utils/jwt.util");

exports.createUser = (user) => UserModel.create(user);

exports.findUserByEmail = (email) =>
  UserModel.findOne({
    where: {
      email,
    },
  });

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
exports.sendEmailVerificationOtp = async (email) => {
  // of 20 characters
  const secret = speakeasy.generateSecret({ length: 20 });

  // Generate a TOTP code using the secret key
  const code = speakeasy.totp({
    // Use the Base32 encoding of the secret key
    secret: secret.base32,

    // Tell Speakeasy to use the Base32
    // encoding format for the secret key
    encoding: "base32",
  });
  // TODO: send email login

  await Verificationtable.create({
    email,
    otpToken: secret.base32,
  });
  return "otp sent";
};
