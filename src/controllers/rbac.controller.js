/** @format */

"use strict";

const { SuccessReponse } = require("../core/success.response");
const {
  createRole,
  createResource,

  roleList,
  resourceList,
  addGrantsToRole,
} = require("../services/rbac.service");

/**
 * @desc create a new Role
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const newRole = async (req, res, next) => {
  new SuccessReponse({
    message: "Role created successfully",
    metadata: await createRole({ userId: req.user._id, ...req.body }),
  }).send(res);
};

/**
 * @desc create a new Resource
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const newResource = async (req, res, next) => {
  new SuccessReponse({
    message: "Resource created successfully",
    metadata: await createResource({ userId: req.user._id, ...req.body }),
  }).send(res);
};

/**
 * @description get list all roles by admin
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const listRole = async (req, res, next) => {
  new SuccessReponse({
    message: "list role successfully",
    metadata: await roleList({
      userId: req.user._id,
      limit: req.query.limit,
      offset: req.query.offset,
      search: req.query.search,
    }),
  }).send(res);
};

/**
 * @description get list all resource by admin
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const listResource = async (req, res, next) => {
  new SuccessReponse({
    message: "get list resource successfully",
    metadata: await resourceList({
      userId: req.user._id,
      limit: req.query.limit,
      offset: req.query.offset,
      search: req.query.search,
    }),
  }).send(res);
};
/**
 * Add grant to role.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the grant is added to the role.
 */
const addGrant = async (req, res, next) => {
  new SuccessReponse({
    message: "Add grant to role successfully",
    metadata: await addGrantsToRole({ userId: req.user._id, arr:req.body }),
  }).send(res);
};
module.exports = {
  newRole,
  newResource,
  listRole,
  listResource,
  addGrant,
};
