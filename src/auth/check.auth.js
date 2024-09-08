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
      throw new ForbiddenError(" Key is invalid");
    }
    if (!apiKey.app_status) {
      throw new ForbiddenError(" Key is invalid");
    }
    req.objKey = apiKey;
  } catch (err) {
    return next(err);
  }
  next();
};
const permission = (permission) => {

  return (req, res, next) => {
    
    if (!req.objKey.app_permissions) {
      return next(new NotAcceptableError(" Permission denied"));
    }
    const validPermissions = req.objKey.app_permissions.includes(permission);

    if (!validPermissions) {
      return next(new NotAcceptableError(" Permission denied"));
    }

    return next();
  };
};

module.exports = { apiKey, permission };
