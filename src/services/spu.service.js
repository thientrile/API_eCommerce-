"use strict";
const SkuService = require("./sku.service");
const { AuthFailureError, BadRequestError } = require("../core/error.response");
const { checkPermission } = require("../middlewares/rbac.middleware");
const SpuModel = require("../models/spu.model");
const {
  addPrefixToKeys,
  removePrefixFromKeys,
  getErrorMessageMongose,
  omitInfoData,
  randomId,
  convertToObjectIdMongoose,
  getInfoData,
  filterConvert,
  createJoiSchemaFromMongoose,
} = require("../utils");
const { checkUserExistById } = require("../repositories/user.repo");
const { brandCheckExistById } = require("../repositories/brand.repo");
const { cateCheckEistById } = require("../repositories/category.repo");
const { checkSpuExistBySpuId } = require("../repositories/spu.repo");
const {
  addDocument,
  updateByQueryDocument,
  searchDocument,
} = require("./elasticsearch.service");

const Joi = require("joi");
const index = "product_v001";
class SpuService {
  
  static getShema(){
    return createJoiSchemaFromMongoose(SpuModel,"spu_");
  }
  /**
   * Edits an SPU (Single Product Unit) with the provided user ID and payload.
   * If the SPU ID does not exist, a new SPU is created.
   * If the SPU ID exists, the existing SPU is updated.
   *
   * @param {string} userId - The ID of the user performing the action.
   * @param {Object} payload - The payload containing the SPU data to be edited.
   * @returns {Object} - The edited SPU object along with the list of SKUs.
   * @throws {AuthFailureError} - If the user does not have permission to perform this action.
   * @throws {BadRequestError} - If the 'id' field is not found or if the category or brand is not found.
   */
  static async editSpu(userId, payload) {
    payload.thumb = payload.thumb || payload.images[0]; // Assign default thumb
    let permission;
    if (!payload.id) {
      permission = await checkPermission(userId, "createOwn", "product");
      payload.id = randomId();
    } else {
      permission = await checkPermission(userId, "updateOwn", "product");
      //check spu_id exist
      const checkSpu = await checkSpuExistBySpuId(payload.id, userId);
      if (!checkSpu) {
        throw new BadRequestError("The field 'id' is not found");
      }
    }
    // Check permissions (admin or shop owner)
    if (!permission) {
      throw new AuthFailureError(
        "You don't have permission to perform this action"
      );
    }
    const arrStatus = SpuModel.schema.path("spu_status").enumValues;
    if (
      !payload.status ||
      payload.status === "block" ||
      !arrStatus.includes(payload.status)
    ) {
      payload.status = "draft";
    }
    const filter = permission.filter(payload);
    filter.shopId = userId;

    // Check category and brand existence
    const checkCateExist = await cateCheckEistById(payload.category._id);
    if (!checkCateExist) {
      throw new BadRequestError("Category not found");
    } else {
      filter.category = {};
      filter.category.name = checkCateExist.cate_name;
      filter.category._id = checkCateExist._id;
    }

    if (payload.brand._id) {
      
      const checkBrandExist = await brandCheckExistById(payload.brand._id);
     
      
      if (!checkBrandExist) {
        throw new BadRequestError("Brand not found");
      }
      filter.brand = {};
      filter.brand.name = checkBrandExist.brand_name;
      filter.brand._id = checkBrandExist._id;
    }
    filter.status = payload.status === "active" ? payload.status : "draft";

    // Validate list_sku
    if (!payload.id&&payload.list_sku.length === 0) {
      throw new BadRequestError("The list_sku is not blank");
    }
   
    // create a new spu if spu_id is not exist
    // update spu if spu_id is exist
    const resultSpu = await SpuModel.findOneAndUpdate(
      { spu_id: payload.id },
      addPrefixToKeys(filter, "spu_"),
      { new: true, upsert: true }
    );
    const skuDefault = filter.variations.length === 0; // Determine if it's a default SKU
    // Create SKUs for the SPU
    const resultSku = await SkuService.editSku({
      spu_id: resultSpu.spu_id,
      payload: filter.list_sku,
      sku_default: skuDefault,
      indexElastic: index,
      userId,
    });
    const result = {
      ...omitInfoData({
        fields: ["_id", "__v"],
        object: removePrefixFromKeys(resultSpu.toObject(), "spu_"),
      }),
      list_sku: resultSku,
    };

    // ... (your Elasticsearch sync logic here)
    // resultSku.forEach(async (sku) => {
    //   let sku_name = "";

    //   for (let i = 0; i < resultSpu.spu_variations.length; i++) {
    //     sku_name += ` ${
    //       resultSpu.spu_variations[i].options[sku.sku_tier_idx[i]]
    //     }`;
    //   }
    //   const name = `${resultSpu.spu_name} ${sku_name}`;
    //   await addDocument({
    //     index,
    //     id: sku.sku_id,
    //     payload: {
    //       name,
    //       product_shopId: userId,
    //       prodduct_id: resultSpu.spu_id,
    //       product_name: resultSpu.spu_name,
    //       price: sku.sku_amout.price,
    //       thumbnail: sku.sku_thumb ? sku.sku_thumb : resultSpu.spu_thumb,
    //       status: resultSpu.spu_status,
    //       // stock: sku.sku_inventory.quantity || 0,
    //     },
    //   });
    // });
    // Return response object
    return result;
  }
  // update status

  /**
   * Checks if the user has permission to update their own product and activates the specified SPU.
   * @param {string} userId - The ID of the user.
   * @param {string} spuId - The ID of the SPU (Product).
   * @returns {Promise<Object>} The updated SPU object.
   * @throws {AuthFailureError} If the user doesn't have permission to perform this action.
   */
  static async statusSpu(userId, spuId, status) {
    // check status existed
    const arrStatus = SpuModel.schema.path("spu_status").enumValues;
    if (!arrStatus.includes(status)) {
      throw new BadRequestError("Status is not exist");
    }
    const permission =
      status === "block"
        ? await checkPermission(userId, "updateAny", "product")
        : await checkPermission(userId, "updateOwn", "product");

    if (!permission) {
      throw new AuthFailureError(
        "You don't have permission to perform this action"
      );
    }

    const spu = await SpuModel.findOneAndUpdate(
      { spu_id: spuId, spu_shopId: convertToObjectIdMongoose(userId) },
      { spu_status: status },
      { new: true }
    );
    if (!spu) {
      throw new BadRequestError("The field 'id' is not found");
    }
    await updateByQueryDocument({
      index,
      payload: {
        script: {
          source: `ctx._source.status = '${status}'`,
          lang: "painless",
        },
        query: {
          match: {
            product_id: spuId,
          },
        },
      },
    });
    return getInfoData({
      fields: ["name", "id", "status"],
      object: removePrefixFromKeys(spu.toObject(), "spu_"),
    });
  }
  static async getListSeller(userId, status = "all", limit = 100, page = 1) {
    const permission = await checkPermission(userId, "readOwn", "product");
    if (!permission) {
      throw new AuthFailureError(
        "You don't have permission to perform this action"
      );
    }
    const query = { spu_shopId: convertToObjectIdMongoose(userId) };
    if (status !== "all") {
      query.spu_status = status;
    }
    const result = await SpuModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    return result.map((spu) => {
      const resultSpu = removePrefixFromKeys(spu.toObject(), "spu_");

      return filterConvert(
        getInfoData({
          fields: ["name", "thumb", "viewed", "selled","id","status"],
          object: resultSpu,
        }),
        permission
      );
    });
  }
  static async getProductDetail(userId, spuId) {
    const permission = await checkPermission(userId, "readAny", "product");
    if (!permission) {
      throw new AuthFailureError(
        "You don't have permission to perform this action"
      );
    }

    const spu = await SpuModel.findOneAndUpdate(
      { spu_id: spuId },
      { $inc: { spu_viewed: 1 } },
      { new: true }
    );
    const result= {...removePrefixFromKeys(spu.toObject(), "spu_"),list_sku: await SkuService.getSkuBySpuId(spuId)}
    return filterConvert(result, permission);
  }
}

module.exports = SpuService; // Directly export an instance for convenience
