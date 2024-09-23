"use strict";
const DiscountModel = require("../models/discount.model");

const checkDiscountExist= async (filter) => {
  return await DiscountModel.findOne(filter);
}
module.exports = { checkDiscountExist };

