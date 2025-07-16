"use strict";

const { grantAccess } = require("../middlewares/rbac.middleware");
const discountModel = require("../models/discount.model");
const { BadRequestError } = require("../core/error.response");
const {
  getErrorMessageMongose,
  addPrefixToKeys,
  removePrefixFromKeys,
  convertToObjectIdMongoose,
  filterConvert,
  createJoiSchemaFromMongoose,

  getCurrency,
  getSelectData,
} = require("../utils");
const spuModel = require("../models/spu.model");
const { checkDiscountExist } = require("../repositories/discount.repo");
const {
  checkSkuExist,
  getListSkus,
  checkListSkusActive,
} = require("../repositories/sku.repo");
const skuModel = require("../models/sku.model");
const { setData, getData } = require("./redis.service");

/**
 * Creates a discount for a user.
 *
 * @param {string} userId - The ID of the user creating the discount.
 * @param {Object} data - The discount data.
 * @param {string} [data.shopId] - The ID of the shop (optional).
 * @param {Date} data.start_date - The start date of the discount.
 * @param {Date} data.end_date - The end date of the discount.
 * @param {string} [data.applies_to] - The type of discount application (optional).
 * @param {Array<string>} [data.product_ids] - The IDs of the products the discount applies to (optional).
 * @param {Array<string>} [data.collection_ids] - The IDs of the collections the discount applies to (optional).
 * @param {string} [data.type] - The type of discount (optional).
 * @returns {Promise<Object>} The created discount object.
 * @throws {BadRequestError} If the start date is not greater than the current date or if there is an error creating the discount.
 */
const createDiscount = async (userId, data) => {
  // check permission
  let grants;
  if (data.shopId) {
    grants = await grantAccess(userId, "createAny", "discount");
  } else {
    grants = await grantAccess(userId, "createOwn", "discount");
    data.shopId = userId;
  }
  // check date
  if (
    new Date() < new Date(data.start_date) ||
    new Date() > new Date(data.end_date)
  ) {
    throw new BadRequestError("Start date must be greater than current date");
  }
  // check discount type
  const discountAppliesTo =
    discountModel.schema.path("disc_applies_to").enumValues;
  if (!data.applies_to || !discountAppliesTo.includes(data.applies_to)) {
    data.applies_to = discountAppliesTo[0];
  }
  switch (data.applies_to) {
    case discountAppliesTo[1]: {
      data.collection_ids = [];
      break;
    }
    case discountAppliesTo[2]: {
      data.product_ids = [];

      break;
    }
    default: {
      data.product_ids = [];
      data.collection_ids = [];
      break;
    }
  }
  // get discount type enum.
  const discountType = discountModel.schema.path("disc_type").enumValues;
  // check discount type in enum

  data.type = data.type || discountType[1];
  if (data.type === discountType[0] && (data.value > 100 || data.value < 0)) {
    throw new BadRequestError("Discount value must be between 0 and 100");
  }

  // get discount status enum.
  const discountStatus = discountModel.schema.path("disc_status").enumValues;
  data.status = discountStatus[0];
  // add prefix to keys
  const discountData = addPrefixToKeys(data, "disc_");
  //  create discount
  const discountResut = await discountModel
    .create(discountData)
    .catch((err) => {
      throw new BadRequestError(
        getErrorMessageMongose(err, "Discount code already exists")
      );
    });
  const result = removePrefixFromKeys(discountResut.toObject(), "disc_");
  return filterConvert(result, grants);
};

/**
 * Retrieves all discount codes with associated products for a given user.
 *
 * @async
 * @function getAllDiscountsCodeWithProducts
 * @param {string} userId - The ID of the user requesting the discount codes.
 * @param {Object} data - The data containing pagination and discount code information.
 * @param {number} [data.page=1] - The page number for pagination.
 * @param {number} [data.limit=100] - The number of items per page for pagination.
 * @param {string} data.code - The discount code to check.
 * @param {string} data.shopId - The ID of the shop to which the discount code belongs.
 * @throws {BadRequestError} If the discount code is not found.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of products with the discount applied.
 */
const getAllDiscountsCodeWithProducts = async (userId, data) => {
  // check permission
  const grants = await grantAccess(userId, "readAny", "discount");
  // set default value
  const { page = 1, limit = 100 } = data;
  // get discount status enum.
  const discountStatus = discountModel.schema.path("disc_status").enumValues;
  // check discount code exist
  const foundDiscount = await checkDiscountExist({
    disc_code: data.code,
    disc_shopId: convertToObjectIdMongoose(data.shopId),
    disc_status: discountStatus[0],
  });
  // if discount code not found
  if (!foundDiscount) {
    throw new BadRequestError("Discount code not found");
  }
  //  get discount type in enum
  const discountAppliesTo =
    discountModel.schema.path("disc_applies_to").enumValues;
  let resultProducts;
  // check discount type
  // type = all products
  if (foundDiscount.disc_applies_to == discountAppliesTo[0]) {
    resultProducts = await spuModel
      .find({
        spu_shopId: convertToObjectIdMongoose(data.shopId),
        spu_status: { $in: ["active", "active_only_on_shop"] },
      })
      .select(getSelectData(["spu_id", "spu_name", "spu_thumb"]))
      .skip((page - 1) * limit)
      .limit(limit);
    // type = specific products
  } else if (foundDiscount.disc_applies_to == discountAppliesTo[1]) {
    const spuIds = foundDiscount.disc_product_ids.map((id) => {
      return id.split(".")[0];
    });
    // const spuIds=""
    resultProducts = await spuModel
      .find({
        spu_status: { $in: ["active", "active_only_on_shop"] },
        spu_shopId: convertToObjectIdMongoose(data.shopId),
        spu_id: { $in: spuIds },
      })
      .select(getSelectData(["spu_id", "spu_name", "spu_thumb"]))
      .skip((page - 1) * limit)
      .limit(limit);
  } else {
    // type = specific collections
    const collection_ids = foundDiscount.disc_collection_ids.map((id) =>
      convertToObjectIdMongoose(id)
    );
    resultProducts = await spuModel
      .find({
        spu_status: { $in: ["active", "active_only_on_shop"] },
        spu_shopId: convertToObjectIdMongoose(data.shopId),
        "spu_category._id": { $in: collection_ids },
      })
      .select(getSelectData(["spu_id", "spu_name", "spu_thumb"]))
      .skip((page - 1) * limit)
      .limit(limit);
  }
  // remove prefix from keys in array result
  const result = resultProducts.map((product) => {
    const removePrefix = removePrefixFromKeys(product.toObject(), "spu_");
    return filterConvert(removePrefix, grants);
  });
  return result;
};

/**
 * Retrieves all discount codes for a specific shop.
 *
 * @param {string} userId - The ID of the user requesting the discount codes.
 * @param {Object} data - The data containing shopId, page, and limit.
 * @param {string} [data.shopId] - The ID of the shop. Defaults to userId if not provided.
 * @param {number} [data.page=1] - The page number for pagination. Defaults to 1.
 * @param {number} [data.limit=100] - The number of items per page. Defaults to 100.
 * @returns {Promise<Array>} - A promise that resolves to an array of discount codes.
 */
const getAllDiscountCodeByShop = async (userId, data) => {
  const grants = await grantAccess(userId, "readOwn", "discount");
  data.shopId = data.shopId || userId;
  const { page = 1, limit = 100 } = data;
  const foundDiscount = await discountModel
    .find({ disc_shopId: convertToObjectIdMongoose(data.shopId) })
    .skip((page - 1) * limit)
    .limit(limit);
  const result = foundDiscount.map((discount) => {
    const removePrefix = removePrefixFromKeys(discount.toObject(), "disc_");
    return filterConvert(removePrefix, grants);
  });
  return result;
};
//  get  list sku_id from products of dicount code
/**
 * Retrieves a list of SKU IDs that are eligible for a discount based on the provided data.
 *
 * @param {Object} data - The data object containing discount criteria.
 * @param {string} data.disc_applies_to - The type of discount application (e.g., all products, specific products, collections).
 * @param {string} data.disc_shopId - The ID of the shop where the discount is applied.
 * @param {Array<string>} [data.disc_product_ids] - An array of product IDs to which the discount applies (if applicable).
 * @param {Array<string>} [data.disc_collection_ids] - An array of collection IDs to which the discount applies (if applicable).
 * @returns {Promise<Array<string>>} A promise that resolves to an array of SKU IDs eligible for the discount.
 */
const getListSkuIdsOfDiscount = async (data) => {
  let resultRedis = await getData("disc_" + data.disc_code);
  if (!resultRedis) {
    let discountSkuIds;
    const discountAppliesTo =
      discountModel.schema.path("disc_applies_to").enumValues;
    if (data.disc_applies_to === discountAppliesTo[0]) {
      const spus = (
        await spuModel
          .find({
            spu_shopId: convertToObjectIdMongoose(data.disc_shopId),
            spu_status: { $in: ["active", "active_only_on_shop"] },
          })
          .select({ spu_id: 1 })
      ).map((spu) => spu.spu_id);

      discountSkuIds = (
        await skuModel
          .find({
            spu_id: { $in: spus },
            sku_shopId: convertToObjectIdMongoose(data.disc_shopId),
            is_deleted: false,
          })
          .select({ sku_id: 1 })
      ).map((sku) => sku.sku_id);
    } else if (data.disc_applies_to === discountAppliesTo[1]) {
      const spuIds = data.disc_product_ids.map((id) => {
        return id.split(".")[0];
      });
      const spus = await spuModel
        .find({
          spu_id: { $in: spuIds },
          spu_shopId: convertToObjectIdMongoose(data.disc_shopId),
          spu_status: { $in: ["active", "active_only_on_shop"] },
        })
        .select({ spu_id: 1 });
      const removeItemsIvalid = data.disc_product_ids.map((id) => {
        for (let i in spus) {
          if (id.includes(spus[i].spu_id)) {
            return id;
          }
        }
      });
      discountSkuIds = (
        await skuModel
          .find({
            $or: [
              { spu_id: { $in: removeItemsIvalid } },
              { sku_id: { $in: removeItemsIvalid } },
            ],

            sku_shopId: convertToObjectIdMongoose(data.disc_shopId),
            is_deleted: false,
          })
          .select({ sku_id: 1 })
      ).map((sku) => sku.sku_id);
    } else {
      const collection_ids = data.disc_collection_ids.map((id) =>
        convertToObjectIdMongoose(id)
      );
      const spus = (
        await spuModel
          .find({
            spu_shopId: convertToObjectIdMongoose(data.disc_shopId),
            spu_status: { $in: ["active", "active_only_on_shop"] },
            "spu_category._id": { $in: collection_ids },
          })
          .select({ spu_id: 1 })
      ).map((spu) => spu.spu_id);
      discountSkuIds = (
        await skuModel
          .find({
            spu_id: { $in: spus },
            sku_shopId: convertToObjectIdMongoose(data.disc_shopId),
            is_deleted: false,
          })
          .select({ sku_id: 1 })
      ).map((sku) => sku.sku_id);
    }
    await setData("disc_" + data.disc_code, discountSkuIds, 60);
    return discountSkuIds;
  }
  return resultRedis;
};

//  get amount of discount code  with productId in a shop

const getAmoutDiscountCode = async (userId, data) => {
  //  check permission
  const grants = await grantAccess(userId, "readAny", "discount");
  const { products, code, shopId } = data;

  const discountStatus = discountModel.schema.path("disc_status").enumValues;
  // check discount code exist
  const foundDiscount = await checkDiscountExist({
    disc_code: code,
    disc_shopId: convertToObjectIdMongoose(shopId),
    disc_status: discountStatus[0],
  });
  if (!foundDiscount) {
    throw new BadRequestError("Discount code not found");
  }
  const {
    type,
    start_date,
    end_date,
    max_uses,
    min_order,
    max_uses_per_user,
    users_used,
    value,
  } = removePrefixFromKeys(foundDiscount.toObject(), "disc_");
  //  check discount code is expired
  if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
    foundDiscount.disc_status = "expired";
    throw new BadRequestError("Discount code is expired");
  }
  //  check discount code have uses of maximum
  if (max_uses <= 0) {
    foundDiscount.disc_status = "expired";
    throw new BadRequestError("Discount code is expired");
  }
  //  get líst sku_id from products of dicount code
  let discountSkuIds = await getListSkuIdsOfDiscount(foundDiscount);
  let totalOrder = 0;
  const skuIds = products.map((product) => product.sku_id);
  // get list of
  const listSkus = await checkListSkusActive(skuIds, shopId);
  //  create result have sku_id, price, quantity
  const resultProducts = listSkus.map((item) => {
    let result = {};
    result.name = item.spu_name;
    result.sku_id = item.sku_id;
    result.price = item.sku_amout.price;
    result.currency = item.sku_amout.currency;
    let options = "";
    result.thumb = item.spu_thumb;
    for (let idx in item.sku_tier_idx) {
      if (item.spu_vatiants[idx].images[item.sku_tier_idx[idx]]) {
        result.thumb = item.spu_vatiants[idx].images[item.sku_tier_idx[idx]];
      }

      options += item.spu_vatiants[idx].options[item.sku_tier_idx[idx]];
    }
    result.option = options;
    for (let i in products) {
      if (item.sku_id == products[i].sku_id) {
        totalOrder += products[i].quantity * item.sku_amout.price;
        result.quantity = products[i].quantity;
        break;
      }
    }
    return result;
  });

  //  check discount code have minimum order amount

  let totalAmout = 0;
  for (let i in resultProducts) {
    if (discountSkuIds.includes(resultProducts[i].sku_id)) {
      totalAmout += resultProducts[i].price * resultProducts[i].quantity;
    }
  }
  if (min_order.value > 0 && totalOrder < min_order.value) {
    throw new BadRequestError(
      `Discount code is required minimum order amount ${
        min_order.value
      } in ${getCurrency(min_order.currency)}`
    );
  }
  // check if the discount code has been used by user
  if (max_uses_per_user > 0) {
    const countUserUsed = users_used.filter((user) => user == userId).length;
    if (countUserUsed >= max_uses_per_user) {
      throw new BadRequestError("Discount code has been used");
    }
  }

  foundDiscount.save();

  // get discount type enum.
  const discountType = discountModel.schema.path("disc_type").enumValues;

  let amount;
  if (type === discountType[1]) {
    if (totalAmout > 0) {
      amount = value;
    } else {
      amount = 0;
    }
  } else {
    amount = (totalAmout * value) / 100;
  }
  const result = {
    items: resultProducts,
    discount_code: code,
    totalOrder,
    discountAmout: amount,
    total: totalOrder - amount,
    currency: getCurrency(min_order.currency),
  };
  return filterConvert(result, grants);
};
const updateDiscountStauts = async (userId, data) => {
  // check permisstion
  const grants = await grantAccess(userId, "updateOwn", "discount");
  // get discount status enum.
  const discountStatus = discountModel.schema.path("disc_status").enumValues;
  // check discount code exist
  const result = await discountModel.findOneAndUpdate(
    {
      disc_code: data.code,
      disc_shopId: convertToObjectIdMongoose(data.shopId),
      disc_status: discountStatus[0],
    },
    { disc_status: data.status || discountStatus[2] },
    { new: true }
  );
  return filterConvert(result, grants);
};
/**
 * Cancels a discount code for a user.
 *
 * @param {string} userId - The ID of the user.
 * @param {Object} data - The data containing discount code and shop ID.
 * @param {string} data.code - The discount code to be cancelled.
 * @param {string} data.shopId - The ID of the shop where the discount code is used.
 * @returns {Promise<Object>} - The updated discount document after cancellation.
 * @throws {BadRequestError} - If the discount code is not found.
 */
const cancelDiscountCode = async (userId, data) => {
  // check permisstion
  const grants = await grantAccess(userId, "readAny", "discount");
  const { code, shopId } = data;
  // check discount code exist
  const foundDiscount = await checkDiscountExist({
    disc_code: code,
    disc_shopId: convertToObjectIdMongoose(shopId),
  });
  if (!foundDiscount) {
    throw new BadRequestError("Discount code not found");
  }
  const result = await discountModel.findOneAndUpdate(
    {
      _id: foundDiscount._id,
    },
    {
      $pull: {
        disc_users_used: userId,
      },
      $inc: {
        disc__max_uses: 1,
        disc_uses_count: -1,
      },
    }
  );
  return filterConvert(result, grants);
};

const getAmoutDiscountCodes = async (userId, data) => {
  const { products, codes, shopId } = data;
  let totalOrder = 0;
  let totalAmount = 0;
  const skuIds = products.map((product) => product.sku_id);
  // get list of
  const listSkus = await checkListSkusActive(skuIds, shopId);
  //  create result have sku_id, price, quantity
  const resultProducts = listSkus.map((item) => {
    let result = {};
    result.name = item.spu_name;
    result.sku_id = item.sku_id;
    result.price = item.sku_amout.price;
    result.currency = item.sku_amout.currency;
    let options = "";
    result.thumb = item.spu_thumb;
    for (let idx in item.sku_tier_idx) {
      if (item.spu_vatiants[idx].images[item.sku_tier_idx[idx]]) {
        result.thumb = item.spu_vatiants[idx].images[item.sku_tier_idx[idx]];
      }

      options += item.spu_vatiants[idx].options[item.sku_tier_idx[idx]];
    }
    result.option = options;
    for (let i in products) {
      if (item.sku_id == products[i].sku_id) {
        totalOrder += products[i].quantity * item.sku_amout.price;
        result.quantity = products[i].quantity;
        break;
      }
    }
    return result;
  });

  if (data.codes) {
    const discountStatus = discountModel.schema.path("disc_status").enumValues;

    // check discount code exist

    const foundDiscounts = await discountModel.find({
      disc_code: { $in: codes },
      disc_shopId: convertToObjectIdMongoose(shopId),
      disc_status: discountStatus[0],
    });

    for (const i of foundDiscounts) {
      let discountSkuIds = await getListSkuIdsOfDiscount(i);
      let totalAmout = 0;
      for (let i in resultProducts) {
        if (discountSkuIds.includes(resultProducts[i].sku_id)) {
          totalAmout += resultProducts[i].price * resultProducts[i].quantity;
        }
      }
      const {
        type,
        start_date,
        end_date,
        max_uses,
        min_order,
        max_uses_per_user,
        users_used,
        value,
      } = removePrefixFromKeys(i.toObject(), "disc_");
      //  check discount code is expired
      if (
        new Date() < new Date(start_date) ||
        new Date() > new Date(end_date)
      ) {
        i.disc_status = "expired";
        continue;
      }
      //  check discount code have uses of maximum
      if (max_uses <= 0) {
        i.disc_status = "expired";
        continue;
      }
      //  check discount code have minimum order amount
      if (min_order.value > 0 && totalOrder < min_order.value) {
        continue;
      }
      // check if the discount code has been used by user
      if (max_uses_per_user > 0) {
        const countUserUsed = users_used.filter(
          (user) => user == userId
        ).length;
        if (countUserUsed >= max_uses_per_user) {
          continue;
        }
      }
      const discountType = discountModel.schema.path("disc_type").enumValues;
      let amount;
      if (type === discountType[1]) {
        if (totalAmout > 0) {
          amount = value;
        } else {
          amount = 0;
        }
      } else {
        amount = (totalAmout * value) / 100;
      }
      totalAmount += amount;
    }
  }

  return {
    shopId,
    codes,
    products: resultProducts,
    total: totalOrder,
    discount: totalAmount,
    amount: totalOrder - totalAmount > 0 ? totalOrder - totalAmount : 0,
  };
};

module.exports = {
  createDiscount,
  updateDiscountStauts,
  getAllDiscountsCodeWithProducts,
  getAllDiscountCodeByShop,
  cancelDiscountCode,
  getAmoutDiscountCode,
  getAmoutDiscountCodes,
};
