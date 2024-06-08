/** @format */

"use strict";

const { Mongoose } = require("mongoose");
const resourceModel = require("../models/resource.model");
const roleModel = require("../models/role.model");
const {
  convertToObjectIdMongoose,
  omitInfoData,
  renameObjectKey,
} = require("../utils");
const { BadRequestError } = require("../core/error.response");
const { grantAccess } = require("../middlewares/rbac.middleware");
const { getGrants } = require("../repositories/role.repo");
/**
 * create resource by admin
 * @param {string} name
 * @param {string} slug
 * @param {string} description
 * @param {string} userId
 */
const createResource = async (payload) => {
  const { name, slug, description, userId } = payload;
  // middleware check premission
  await grantAccess(userId, "createAny", "resource");
  try {
    //new resource

    const resource = await resourceModel.create({
      src_name: name,
      src_slug: slug,
      src_description: description,
    });
    const result = renameObjectKey(
      {
        src_name: "name",
        src_slug: "slug",
        src_description: "description",
        _id: "resourceId",
      },
      resource.toObject()
    );
    return result;
  } catch (err) {
    console.log(err);
    throw new BadRequestError("Resoucre already exists");
  }
};

/**
 * get resource list by admin
 * @param {Mongoose.ObjectId}
 * @param {number} limit
 * @param {number} offset
 * @param {string} search
 */
const resourceList = async ({
  userId,
  limit = 30,
  offset = 0,
  search = "",
}) => {
  // 1. check admin ? middleware function
  await grantAccess(userId, "readAny", "resource");
  try {
    // 2. get list of resources
    const resources = await resourceModel.aggregate([
      {
        $project: {
          name: "$src_name",
          slug: "$src_slug",
          description: "$src_description",
          _id: 0,
          resourceId: "$_id",
          createAt: 1,
        },
      },
      {
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by creation date, newest first
      { $skip: parseInt(offset) },
      { $limit: parseInt(limit) },
    ]);

    return resources;
  } catch (err) {
    console.log(err);
    return [];
  }
};
/**
 * create role by admin
 * @param {string} name
 * @param {string} slug
 * @param {string} description
 *
 */
const createRole = async (payload) => {
  const { name, slug, description, grants, userId } = payload;
  // middleware check premission admin
  await grantAccess(userId, "createAny", "role");
  try {
    // create role
    const role = await roleModel.create({
      rol_name: name,
      rol_slug: slug,
      rol_description: description,
      rol_grants: grants,
    });
    return role;
  } catch (err) {
    throw new BadRequestError("Role already exists");
  }
};
const addGrantsToRole = async ({ userId, roleId, grants }) => {
  await grantAccess(userId, "updateAny", "role"); 
  try {
    const role = await roleModel.findOneAndUpdate(
      { _id: convertToObjectIdMongoose(roleId) },
      { $push: { rol_grants: grants } },
      { new: true }
    );
    return role;
  } catch (err) {
    throw new BadRequestError("Role already exists");
  }
};
const roleList = async ({
  userId = 0,
  limit = 30,
  offset = 0,
  search = "",
}) => {
  await grantAccess(userId, "readAny", "role");
  try {
    return await getGrants(limit, offset, search);
  } catch (err) {
    return [];
  }
};

module.exports = {
  resourceList,
  createResource,
  createRole,
  roleList,
  addGrantsToRole,
};
