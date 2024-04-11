const { DataTypes } = require("sequelize");
const sequelize = require("./connection");

const User = sequelize.define(
  "user",
  {
    name: {
      type: DataTypes.STRING,
    },
    otpId: {
      type: DataTypes.INTEGER, // Adjust the data type according to your needs
    },
    password: {
      type: DataTypes.STRING,
    },
    organization: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.NUMBER,
    },
    phoneNumber: {
      type: DataTypes.STRING,
    },
    designation: {
      type: DataTypes.STRING,
    },
    dob: {
      type: DataTypes.STRING,
    },
    maritalStatus: {
      type: DataTypes.NUMBER,
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);
module.exports = User;
