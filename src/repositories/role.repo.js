"use strict";

const roleModel = require("../models/role.model");

const getId = async (name) => {
  return roleModel.findOne({ rol_name: name }).select("_id");
};
const getAllGrants = async () => {
  return roleModel.aggregate([
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
  return roleModel.aggregate([
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
    {
      $match: {
        $or: [{ role: { $regex: search, $options: "i" } }],
      },
    },
    { $sort: { createdAt: -1 } }, // Sort by creation date, newest first
    { $skip: parseInt(offset) },
    { $limit: parseInt(limit) },
  ]);
};
module.exports = {
  getId,
  getAllGrants,getGrants
};
