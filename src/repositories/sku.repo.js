"use strict";
const SkuModel = require("../models/sku.model");
const { convertToObjectIdMongoose, getSelectData } = require("../utils");

const checkSkuExist = async (filter) => {
  return SkuModel.findOne(filter).exec();
};
const getListSkus = async (filter, select) => {
  return SkuModel.find(filter).select(getSelectData(select)).exec();
};
const checkListSkusActive = async (skuIds, shopId) => {
  return SkuModel.aggregate([
    {
      $match: {
        sku_id: { $in: skuIds },
        sku_shopId: convertToObjectIdMongoose(shopId),
        is_deleted: false,
      },
    },
    {
      $lookup: {
        from: "Spus",
        localField: "spu_id",
        foreignField: "spu_id",
        as: "spu",
      },
    },
    {
      $unwind: "$spu",
    },
    {
      $match: {
        "spu.spu_status": { $in: ["active", "active_only_on_shop"] },
      },
    },
    {
      $project: {
        sku_id: 1,
        spu_name: "$spu.spu_name",
        sku_amout: 1,
        sku_thumb: 1,
        _id:0,
        sku_tier_idx:1,
        spu_thumb: "$spu.spu_thumb",
        spu_vatiants: "$spu.spu_variations",

        
      },
    },
  ]);
};
module.exports = { checkSkuExist, getListSkus, checkListSkusActive };
