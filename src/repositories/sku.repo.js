"use strict";
const SkuModel = require("../models/sku.model");
const { convertToObjectIdMongoose, getSelectData } = require("../utils");

const checkSkuExist = async (filter) => {
  return SkuModel.findOne(filter).exec();
};
const getListSkus = async (filter ,select) => {
  return SkuModel.find(filter)
    .select(getSelectData(select))
    .exec();
};
module.exports = { checkSkuExist, getListSkus };
