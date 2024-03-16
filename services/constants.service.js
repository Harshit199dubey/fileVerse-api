const Gender = require("../models/gender");
const Maritalstatus = require("../models/maritalstatus");

exports.getGenders = async () => {
  const data = await Gender.findAll();

  return data;
};
exports.getMaritalstatus = async () => {
  const data = await Maritalstatus.findAll();

  return data;
};
