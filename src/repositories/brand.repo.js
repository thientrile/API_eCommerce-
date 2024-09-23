"use strict";

const brandModel = require("../models/brand.model");
const { convertToObjectIdMongoose } = require("../utils");

const brandCheckExistById = async (id) => {

  return await brandModel.findById(convertToObjectIdMongoose(id)).exec();
};

module.exports = { brandCheckExistById };
