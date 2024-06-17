"use strict";
const { checkPermission } = require("../middlewares/rbac.middleware");
const { AuthFailureError,BadRequestError } = require("../core/error.response");
const { addPrefixToKeys, removePrefixFromKeys } = require("../utils");
const brandModel = require("../models/brand.model");
const createBrand = async (userId, payload) => {
  //check middleware permission
  const permission = await checkPermission(userId, "createOwn", "brand");
  if (!permission) {
    throw new AuthFailureError("You do not have permission to create brand");
  }

  const data = addPrefixToKeys(payload, "brand_");
  const brand = (
    await brandModel.create(data).catch((_) => {
      throw new BadRequestError("Brand already exist");
    })
  ).toJSON();
  const result = removePrefixFromKeys(brand, "brand_");
  result._id = result._id.toString();
  result.cate_id = result.cate_id.toString();
  return permission.filter(result);
};

/**
 * Retrieves a list of brands based on the provided parameters.
 *
 * @param {string} userId - The ID of the user making the request.
 * @param {number} limit - The maximum number of brands to retrieve. Defaults to 100 if not provided.
 * @param {number} offset - The number of brands to skip. Defaults to 0 if not provided.
 * @param {string} search - The search query to filter brands by name.
 * @param {string} cate_id - The category ID to filter brands by.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of brand objects.
 * @throws {AuthFailureError} - If the user does not have permission to read brands.
 */
const brandList = async (userId, limit, offset, search, cate_id) => {
  const permission = await checkPermission(userId, "readOwn", "brand");
  if (!permission) {
    throw new AuthFailureError("You do not have permission to read brand");
  }
  const brand = await brandModel.aggregate([
    {
      $match: cate_id
        ? { brand_cate_id: convertToObjectIdMongoose(cate_id) }
        : {},
    },
    {
      $match: { brand_status: true },
    },
    {
      $project: {
        name: "$brand_name",
        image: "$brand_image",
        _id: 1,
        cate_id: "$brand_cate_id",
      },
    },
    { $match: search ? { name: { $regex: search } } : {} },

    { $sort: { createdAt: -1 } },
    { $skip: parseInt(offset) || 0 }, // Default to 0 if not provided
    { $limit: parseInt(limit) || 100 }, // Default to 10 if not provided
  ]);
  const result = brand.map((item) => {
    item._id = item._id.toString();
    item.cate_id=item.cate_id.toString();
    return permission.filter(item);
  });
  return result;
};
module.exports = { createBrand, brandList };
