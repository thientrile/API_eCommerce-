"use strict";
const SpuModel = require("../models/spu.model");
const { convertToObjectIdMongoose } = require("../utils");

const checkSpuExistBySpuId = async (spuId, shopId) => {
  return SpuModel.findOne({
    spu_id: spuId,
    spu_shopId: convertToObjectIdMongoose(shopId),
  });
};
module.exports = {checkSpuExistBySpuId}
