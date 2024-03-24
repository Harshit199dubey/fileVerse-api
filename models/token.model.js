const { DataTypes } = require("sequelize");
const sequelize = require("./connection");

const Token = sequelize.define(
  "token",
  {
    userId: {
      type: DataTypes.STRING,
    },
    token: {
      type: DataTypes.STRING,
    },
    refresh_token: {
      type: DataTypes.STRING,
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);
module.exports = Token;
