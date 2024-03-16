const Verificationtable = require('../models/emailVerification');
const Token = require('../models/token.model');
const UserModel = require('../models/user.model');
const cacheUtil = require('../utils/cache.util');
const jwtUtil = require('../utils/jwt.util');
const { Op } = require('sequelize');
const speakeasy = require('speakeasy'); 
exports.createUser = (user) => {
    return UserModel.create(user);
}

exports.findUserByEmail = (email) => {
    return UserModel.findOne({
        where: {
            email: email
        }
    })
}

exports.findUserById = (id) => {
    return UserModel.findByPk(id);
}

exports.logoutUser = async (token, exp) => {
    const now = new Date();
    const expire = new Date(exp * 1000);
    const milliseconds = expire.getTime() - now.getTime();
    const tokenData = await Token.destroy({
        where: {
            [Op.or]: [
                { token: token },
                { refresh_token: token }
            ]
        }
    });
    /* ----------------------------- BlackList Token ---------------------------- */
    return cacheUtil.set(token, token, milliseconds);
}


const destroyUserToken = async (userId) => {
    await Token.destroy({
        where: {
            userId: userId
        }
    });
    const user = await Token.findOne({
        where: {
            userId: userId
        }
    });
    if (user) {
        return destroyUserToken(userId);
    }
    return "success";
}

exports.createToken = async (user) => {
    await destroyUserToken(user.id);

    const token = await jwtUtil.createToken({ id: user.id }, parseInt(process.env.TOKEN_EXP)),
        refresh_token = await jwtUtil.createToken({ id: user.id, isRefresh:true }, parseInt(process.env.TOKEN_EXP) * 24);

    return Token.create({
        userId: user.id,
        token: token,
        refresh_token: refresh_token
    });
}

exports.refreshToken = async (refreshToken) =>{
   const data = await Token.findOne({
    where:{
        refresh_token:refreshToken
    }
   });
   if(!data){
    throw new Error('Invalid Refresh Token');
   }
   
    return this.createToken({id:data.userId});
}
exports.sendEmailVerificationOtp = async (email) =>{
// of 20 characters 
const secret = speakeasy.generateSecret({ length: 20 }); 
  
// Generate a TOTP code using the secret key 
const code = speakeasy.totp({ 
  
    // Use the Base32 encoding of the secret key 
    secret: secret.base32, 
  
    // Tell Speakeasy to use the Base32  
    // encoding format for the secret key 
    encoding: 'base32'
}); 
//TODO: send email login

await Verificationtable.create({
    email:email, 
    otpToken:secret.base32
});
   return "otp sent";
}