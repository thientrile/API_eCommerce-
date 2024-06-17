"use strict";
const cateogoryModel = require("../models/category.model");
const { grantAccess } = require("../middlewares/rbac.middleware");
const {
  addPrefixToKeys,
  removePrefixFromKeys,
  convertToObjectIdMongoose,
} = require("../utils");
const { cateFindByIdAndUpdate } = require("../repositories/category.repo");
const {
  NotFoundError,
  AuthFailureError,
  BadRequestError,
} = require("../core/error.response");
/**
 * Creates a new category.
 * @param {string} userId - The ID of the user creating the category.
 * @param {Object} payload - The payload containing the category data.
 * @returns {Promise<Object|string>} - A promise that resolves to the created category object, or a string indicating permission error.
 */
const createCategory = async (userId, payload) => {
  //check the middleware's permissions are admin
  const permission = await grantAccess(userId, "createAny", "category");

  if (payload.parent_id) {
    payload.parent_id = convertToObjectIdMongoose(payload.parent_id);
  }
  //create category
  const category = (
    await cateogoryModel

      .create(addPrefixToKeys(payload, "cate_"))
      .catch((_) => {
        throw new BadRequestError("Category already exist");
      })
  ).toJSON();
  // return  category

  const result = removePrefixFromKeys(category, "cate_");
  result._id = result._id.toString();
  result.parent_id = result.parent_id.toString();
  return permission.filter(result);
};
/**
 * Edits a category.
 *
 * @param {string} userId - The ID of the user performing the action.
 * @param {object} payload - The payload containing the category ID and updated data.
 * @returns {Promise<string|object>} - A promise that resolves to a string if the user doesn't have permission, or an object representing the updated category.
 * @throws {NotFoundError} - If the category is not found.
 */
const editCategory = async (userId, payload) => {
  //check the middleware's permissions are admin
  const permission = await grantAccess(userId, "updateAny", "category");

  //check the category is exist and update
  const category = await cateFindByIdAndUpdate(
    payload.id,
    addPrefixToKeys(payload, "cate_", ["id"])
  ).catch((_) => {
    throw new NotFoundError("Category not found");
  });
  category._id = category._id.toString();
  return permission.filter(removePrefixFromKeys(category, "cate_"));
};
/**
 * Retrieves a list of categories.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<Object>>} The list of categories.
 * @throws {AuthFailureError} If the user doesn't have permission to perform this action.
 */
const categoryList = async (userId) => {
  //check the middleware's permissions
  const permission = await grantAccess(userId, "readAny", "category");
  if (!permission) {
    throw new AuthFailureError(
      "You dont have permission to perform this action"
    );
  }
  //get all category
  const category = await cateogoryModel.aggregate([
    {
      $project: {
        _id: 0,
        id: "$_id",
        name: "$cate_name",
        parent_id: "$cate_parent_id",
        is_active: "$cate_is_active",
        is_leaf: "$cate_is_leaf",
      },
    },
  ]);
  const result = category.map((item) => {
    item.id = item.id.toString();
    item.parent_id = item.parent_id ? item.parent_id.toString() : null;
    return permission.filter(item);
  });
  return result;
};
// const delCategory= async (userId,payload)=>{
//   //check the middleware's permissions
//   const permission = await grantAccess(userId, "deleteAny", "category");
//   if (!permission) {
//     throw new AuthFailureError(
//       "You dont have permission to perform this action"
//     );
//   }
//   //check the category is exist and update
//   const category = await cateFindByIdAndUpdate(
//     payload.id,
//     addPrefixToKeys(payload, "cate_", ["id"])
//   ).catch((_) => {
//     throw new NotFoundError("Category not found");
//   });
//   category._id = category._id.toString();
//   return permission.filter(removePrefixFromKeys(category, "cate_"));

// }
module.exports = { createCategory, editCategory, categoryList };
