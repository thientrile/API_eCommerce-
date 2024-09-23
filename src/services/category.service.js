"use strict";
const cateogoryModel = require("../models/category.model");
const { grantAccess } = require("../middlewares/rbac.middleware");
const {
  addPrefixToKeys,
  removePrefixFromKeys,
  convertToObjectIdMongoose,
  filterConvert,
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
  const checkExist = await cateogoryModel.findOne({
    cate_name: payload.name,
    cate_parentId: payload.parentId
      ? convertToObjectIdMongoose(payload.parentId)
      : null,
  });
  if (checkExist) {
    throw new BadRequestError("Category already exist");
  }
  let rightValue;
  if (payload.parentId) {
    const parentCategory = await cateogoryModel.findOneAndUpdate(
      {
        _id: convertToObjectIdMongoose(payload.parentId),
      },
      { cate_is_leaf: false },
      { new: true }
    );
    if (!parentCategory) {
      throw new Error("Parent category not found");
    }

    rightValue = parentCategory.cate_right;
    await cateogoryModel.updateMany(
      {
        cate_right: { $gte: rightValue },
      },
      {
        $inc: { cate_right: 2 },
      }
    );
    await cateogoryModel.updateMany(
      {
        cate_left: { $gt: rightValue },
      },
      {
        $inc: { cate_left: 2 },
      }
    );
  } else {
    const maxRightValue = await cateogoryModel.findOne(
      { cate_parentId: null },
      "cate_right",
      {
        sort: { cate_right: -1 },
      }
    );
    rightValue = maxRightValue ? maxRightValue.cate_right + 1 : 1;
  }
  payload.left = rightValue;
  payload.right = rightValue + 1;
  const data = addPrefixToKeys(payload, "cate_");
  const category = (
    await cateogoryModel.create(data).catch((_) => {
      throw new BadRequestError("Category already exist");
    })
  ).toObject();

  const result = removePrefixFromKeys(category, "cate_");

  result.parentId = !result.parentId ? null : result.parentId.toString();
  result.rootId = !result.rootId ? null : result.parentId.toString();
  return filterConvert(result, permission);
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
  cateogoryModel.updateMany(
    {
      cate_left: { $gte: category.cate_left },
      cate_right: { $lte: category.cate_right },
    },
    {
      $set: {
        cate_is_active: payload.is_active,
      },
    }
  );

  return filterConvert(removePrefixFromKeys(category, "cate_"), permission);
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
  await grantAccess(userId, "readAny", "category");

  //get all category
  const category = await cateogoryModel.aggregate([
    {
      $match: {
        cate_is_active: true,
      },
    },
    {
      $project: {
        _id: 1,
        name: "$cate_name",
        parentId: "$cate_parentId",
        is_leaf: "$cate_is_leaf",
        is_active: "$cate_is_active",
      },
    },
  ]);

  return category;
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
