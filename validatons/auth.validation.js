const Joi = require("joi");

const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/;
const mobileNumberRegex = /^[6-9]\d{9}$/;

const validatePassword = (value) => {
  if (!passwordRegex.test(String(value))) {
    throw new Error(
      "Password should contains a lowercase, a uppercase character and a digit.",
    );
  }
};
const validateMobileNumber = (value) => {
  if (!mobileNumberRegex.test(String(value))) {
    throw new Error("Invalid mobile number entered.");
  }
};

module.exports = {
  register: Joi.object().keys({
    name: Joi.string().required(),
    otpId: Joi.string().required(),
    password: Joi.string().min(8).max(16).required().external(validatePassword),
    organization: Joi.string(),
    gender: Joi.number().required(),
    phoneNumber: Joi.string()
      .min(10)
      .max(10)
      .required()
      .external(validateMobileNumber),
    designation: Joi.string(),
    dob: Joi.string().required(),
    maritalStatus: Joi.number().required(),
  }),
  login: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  refreshToken: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
  sendEmailVerificationOtp: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  verifyEmailOtp: Joi.object().keys({
    email: Joi.string().email().required(),
    otpId: Joi.string().required(),
    code: Joi.string().required(),
  }),
};
