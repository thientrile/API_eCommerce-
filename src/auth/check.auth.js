"use strict";
const { findByCode } = require("../services/apiKey.service");
const headers = require("../utils/header");
const {
  ForbiddenError,
  NotAcceptableError,
  RequestTimeoutErro,
} = require("../core/error.response");

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[headers.API_KEY];
    const apiKey = await findByCode(key);
    if (!apiKey) {
      throw new ForbiddenError("Error: Key is invalid");
    }

  } catch (err) {
   return next(err);
  }
  next()
};
const permission = async (permission) => {
  return (req, res, next) => {
    try {
      if (!req.objKey.permissions) {
        throw new NotAcceptableError("Error: Permission denied");
      }
      const validPermissions = req.objKey.permissions.includes(permission);
      if (!validPermissions) {
        throw new NotAcceptableError("Error: Permission denied");
      }
     
    } catch (err) {
      return next(err);
    }
    next();
  };

};
module.exports = { apiKey, permission };