const { DataTypes } = require("sequelize");
const sequelize = require("./connection");

const Verificationtable = sequelize.define(
  "verificationtable",
  {
    email: {
      type: DataTypes.STRING,
    },
    otpToken: {
      type: DataTypes.STRING,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);
module.exports = Verificationtable;
