"use strict";

const roleModel = require("../models/role.model");

const getId = async (name) => {
  return roleModel.findOne({ rol_name: name }).select("_id");
};
const getAllGrants = async () => {
  return roleModel.aggregate([
    {
      $match: {
        rol_status: "active",
      },
    },

    {
      $unwind: "$rol_grants",
    },
    {
      $lookup: {
        from: "Resources",
        localField: "rol_grants.resourceId",
        foreignField: "_id",
        as: "resource",
      },
    },
    {
      $unwind: "$resource",
    },
    {
      $project: {
        role: "$rol_name",
        resource: "$resource.src_name",
        action: "$rol_grants.actions",
        attributes: "$rol_grants.attributes",
        _id: 0,
      },
    },
    {
      $unwind: "$action",
    },
    {
      $project: {
        role: 1,
        resource: 1,
        action: "$action",
        attributes: 1,
        _id: 0,
      },
    },
  ]);
};

const getGrants = async (limit, offset, search) => {
  // Flexible search logic: Match search string to role OR resource OR action
  const matchStage = search
    ? {
        $or: [
          { role: { $regex: search, $options: "i" } }, // Case-insensitive search
          { resource: { $regex: search, $options: "i" } },
          { action: { $regex: search, $options: "i" } },
        ],
      }
    : {}; // If no search term, match all documents

  return roleModel.aggregate([
    { $unwind: "$rol_grants" }, // Unwind to work with individual grants
    {
      $lookup: {
        // Join with resources
        from: "Resources",
        localField: "rol_grants.resourceId",
        foreignField: "_id",
        as: "resource",
      },
    },
    { $unwind: "$resource" }, // Unwind resources for projection
    {
      // Project the desired fields
      $project: {
        role: "$rol_name",
        resource: "$resource.src_name",
        action: "$rol_grants.actions",
        attributes: "$rol_grants.attributes",
        _id: 0, // Exclude _id
      },
    },
    { $unwind: "$action" }, // Unwind actions for filtering
    {
      // Re-project after unwinding
      $project: {
        role: 1,
        resource: 1,
        action: 1,
        attributes: 1,
      },
    },
    { $match: matchStage }, // Apply filtering
    { $sort: { createdAt: -1 } },
    { $skip: parseInt(offset) || 0 }, // Default to 0 if not provided
    { $limit: parseInt(limit) || 10 }, // Default to 10 if not provided
  ]);
};
const getListRole = async () => {
  return roleModel.aggregate([
    {
      // Join with the Role collection to get parent details
      $lookup: {
        from:"Roles", // Replace with the collection name storing roles
        localField: "rol_parentId",
        foreignField: "_id",
        as: "parentRole",
      },
    },
    {
      // Unwind to ensure we work with individual parent documents
      $unwind: {
        path: "$parentRole",
        preserveNullAndEmptyArrays: true, // Keep roles without a parent
      },
    },
    {
      // Project the desired fields and replace rol_parentId with parent name
      $project: {
        name: "$rol_name",
        _id: 0,
        parent: "$parentRole.rol_name", // Replace with parent's name
        grants:{$size:"$rol_grants"}
      },
    },
  ]);
};

module.exports = {
  getId,
  getAllGrants,
  getGrants,
  getListRole,
};
