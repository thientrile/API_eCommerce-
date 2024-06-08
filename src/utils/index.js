/**
 * The code you provided is a JavaScript module that exports several utility functions. Here's a
 * breakdown of what each function does:
 *
 * @format
 */

/** @format */

"use strict";
const _ = require("lodash");
const { Types } = require("mongoose");
const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};
const omitInfoData = ({ fields = [], object = {} }) => {
  return _.omit(object, fields);
};

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};
const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};
const removeUndefineObject = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] === null || obj === undefined) {
      delete obj[k];
    }
  });
  return obj;
};
const updateNestedObject = (obj) => {
  const final = {};

  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === "object" && !Array.isArray(obj[k])) {
      const respone = updateNestedObject(obj[k]);
      Object.keys(respone).forEach((a) => {
        final[`${k}.${a}`] = respone[a];
      });
    } else {
      final[k] = obj[k];
    }
  });

  return final;
};
const convertToObjectIdMongoose = (id) => new Types.ObjectId(id);
const converToUUIDMongoose = (id) => new Types.UUID(id);
const convertToArray = (arr) => {
  if (!Array.isArray(arr)) {
    return arr.trim().split();
  }
  return arr;
};

/**
 *
 * @param {oldKey:newKey} field
 * @param {Object} obj
 */
const renameObjectKey = (field = {}, obj) => {
  const processObject = (target) => {
    Object.keys(field).forEach((oldKey) => {
      target[field[oldKey]] = target[oldKey];
      delete target[oldKey];
    });
  };

  if (Array.isArray(obj)) {
    obj.forEach(processObject);
  } else {
    processObject(obj);
  }

  return obj;
};
const getErrorMessageMongose = (error, model, message = "") => {
  const obj = Object.keys(model.schema.obj);
  if (error.errors) {
    const path = obj.find(
      (k) => typeof error.errors[k]?.properties.message !== "undefined"
    );

    return error.errors[path].properties.message;
  }
  return message;
};
const isValidation = {
  isEmail: (input) => {
    // Biểu thức chính quy kiểm tra email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(input);
  },
  isPhoneNumber: (input) => {
    var phonePattern =
      /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return phonePattern.test(input);
  },
  isUserName: (input) => {
    // Biểu thức chính quy kiểm tra username
    var usernamePattern = /^\w{4,16}$/;
    return usernamePattern.test(input);
  },
};
module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefineObject,
  updateNestedObject,
  omitInfoData,
  convertToObjectIdMongoose,
  renameObjectKey,
  getErrorMessageMongose,
  convertToArray,
  isValidation,
  converToUUIDMongoose,
};
