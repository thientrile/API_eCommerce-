const { randomId, omitInfoData } = require("../utils/index");
const skuModel = require("../models/sku.model");
class SkuService {
    // constructor() {}
  async newSku({ spu_id, sku_list, sku_default,permission }) {
    try {
      const convertSkuList = sku_list.map((sku) => {
        return { ...sku, spu_id: spu_id, sku_default };
      });
      console.log(convertSkuList);
      const skus = await skuModel.create(convertSkuList);
      return skus.map(sku=>{
        return omitInfoData({fields:["spu_id"],object:permission.filter(sku.toJSON())}) 
      });
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}
module.exports = SkuService;
