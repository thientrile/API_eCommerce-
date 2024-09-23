const {
  omitInfoData,
  randomId,
  convertToObjectIdMongoose,
} = require("../utils/index");
const skuModel = require("../models/sku.model");
const { deleteDocument } = require("./elasticsearch.service");

class SkuService {
  // constructor() {}

  static async updateSkuAmout(sku_id, amount) {
    if (!amount.price) {
      throw new Error("price is required");
    }
    return await skuModel.findOneAndUpdate(
      { sku_id },
      {
        sku_amount: amount,
        $inc: {
          __v: 0.1,
        },
      },
      { new: true }
    );
  }
  static async editSku({
    userId,
    spu_id,
    payload,
    sku_default = false,
    indexElastic,
  }) {
    // update all sku exist by spu_id to is_deleted = true
    await skuModel.updateMany(
      { spu_id, sku_shopId: convertToObjectIdMongoose(userId) },
      { is_deleted: true },
      { new: true }
    );
    // const list_sku = await skuModel.find({ spu_id });
    // delete all product exist by id in elasticsearch
    // list_sku.forEach(async (sku) => {
    //   await deleteDocument({ index: indexElastic, id: sku.sku_id });
    // });
    let result = [];
    for (let sku of payload) {
      sku.sku_default = sku_default;
      if (!sku.sku_id) {
        sku.sku_id = `${spu_id}.${randomId()}`;
      }
      sku.sku_shopId = convertToObjectIdMongoose(userId);
      sku.spu_id = spu_id;
      sku.is_deleted = false;

      const resultSku = await skuModel.findOneAndUpdate(
        { spu_id, sku_id: sku.sku_id },
        {
          $inc: {
            __v: 0.1,
          },
          ...sku,
        },
        { upsert: true, new: true }
      );

      const resultOmit = omitInfoData({
        fields: [
          "spu_id",
          "is_deleted",
          "createdAt",
          "updatedAt",
          "_id",
          "sku_default",
          "sku_sort",
          "sku_shopId",
        ],
        object: resultSku.toJSON(),
      });
      result.push(resultOmit);
    }

    return result;
  }
  static async getSkuBySpuId(spu_id) {
    const result = (await skuModel.find({ spu_id }).exec()).map((sku) => {
      return omitInfoData({
        fields: [
          "spu_id",
          "is_deleted",
          "createdAt",
          "updatedAt",
          "_id",
          "sku_default",
          "sku_sort",
          "sku_shopId",
        ],
        object: sku.toObject(),
      });
    });
    return result;
  }
}
module.exports = SkuService;
