"use strict";
const ResourceModel = require("../models/resource.model");
const RoleModel = require("../models/role.model");
const {
  convertToObjectIdMongoose,
  renameObjectKey,
  addPrefixToKeys,
  removePrefixFromKeys,
} = require("../utils");
const { BadRequestError } = require("../core/error.response");
const { grantAccess } = require("../middlewares/rbac.middleware");
const roleRepo = require("../repositories/role.repo");
const { setData } = require("./redis.service");

// Create Resource
async function createResource({ name, slug, description, userId }) {
  await grantAccess(userId, "createAny", "resource");

  try {
    const resource = await ResourceModel.create({
      src_name: name,
      src_slug: slug,
      src_description: description,
    });

    return renameObjectKey(
      {
        src_name: "name",
        src_slug: "slug",
        src_description: "description",
        _id: "resourceId",
      },
      resource.toObject()
    );
  } catch (err) {
    if (err.code === 11000) {
      // Check for duplicate key error
      throw new BadRequestError("Resource already exists");
    } else {
      throw err; // Rethrow other errors for potential handling
    }
  }
}

// Get Resource List
async function resourceList({ userId, limit = 30, offset = 0, search = "" }) {
  await grantAccess(userId, "readAny", "resource");

  const resources = await ResourceModel.aggregate([
    {
      $project: {
        name: "$src_name",
        slug: "$src_slug",
        description: "$src_description",
        _id: 0,
        resourceId: "$_id",
        createdAt: 1,
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
    { $sort: { createdAt: -1 } },
    { $skip: parseInt(offset) },
    { $limit: parseInt(limit) },
  ]);

  return resources;
}

// Create Role
async function createRole(payload, userId) {
  await grantAccess(userId, "createAny", "role");

  const checkExist = await RoleModel.findOne({
    rol_name: payload.name,
    rol_parentId: convertToObjectIdMongoose(payload.parentId),
  });
  if (checkExist) {
    throw new BadRequestError("Role already exists");
  }

  const data = addPrefixToKeys(payload, "rol_");
  console.log("data", data);
  const role = await RoleModel.create(data);
  const roles = await roleRepo.getListRole();
  await setData("listRole", roles, 86400);
  return removePrefixFromKeys(role.toObject(), "rol_");
}

// Add Grants to Role
async function addGrantsToRole({ userId, arr }) {
  await grantAccess(userId, "updateAny", "role");

  for (const { roleId, grants } of arr) {
    await RoleModel.findOneAndUpdate(
      { _id: convertToObjectIdMongoose(roleId) },
      { $push: { rol_grants: grants } } // Use $push to add elements to array
    );
  }
  const result = await roleRepo.getAllGrants();
  await setData("grants", result, 86400);
  return result;
}

// Get  list grants access control
async function listGrants({ userId = 0, limit = 30, offset = 0, search = "" }) {
  // You might want to consider adding the access control check here as well
  await grantAccess(userId, "readAny", "role");

  return await roleRepo.getGrants(limit, offset, search);
}
// get all list role
const getListAllRole = async ({ userId, parentId = null }) => {};
module.exports = {
  resourceList,
  createResource,
  createRole,
  listGrants,
  addGrantsToRole,
};
