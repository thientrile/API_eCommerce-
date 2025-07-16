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
const Joi = require("joi");
/**
 * Retrieves specified fields from an object.
 *
 * @param {Object} options - The options object.
 * @param {Array} options.fields - The fields to retrieve from the object.
 * @param {Object} options.object - The object to retrieve fields from.
 * @returns {Object} - An object containing only the specified fields from the original object.
 */
const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};
/**
 * Omit specified fields from an object.
 *
 * @param {Object} options - The options object.
 * @param {Array} options.fields - The fields to omit from the object.
 * @param {Object} options.object - The object to omit fields from.
 * @returns {Object} - The object with specified fields omitted.
 */
const omitInfoData = ({ fields = [], object = {} }) => {
  return _.omit(object, fields);
};

/**
 * Converts an array of select options into an object with each option as a key and value 1.
 *
 * @param {Array} select - The array of select options.
 * @returns {Object} - The object with select options as keys and value 1.
 */
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};
/**
 * Creates an object with keys from the given array and sets their values to 0.
 *
 * @param {Array} select - The array of keys.
 * @returns {Object} - The object with keys from the array and values set to 0.
 */
const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};
/**
 * Removes properties with null or undefined values from an object.
 *
 * @param {Object} obj - The object to remove properties from.
 * @returns {Object} - The object with null or undefined properties removed.
 */
const removeUndefineObject = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] === null || obj === undefined) {
      delete obj[k];
    }
  });
  return obj;
};
/**
 * Recursively updates a nested object by flattening it.
 *
 * @param {Object} obj - The object to be updated.
 * @returns {Object} - The updated object with flattened properties.
 */
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
/**
 * Converts a string ID to a Mongoose ObjectId.
 *
 * @param {string} id - The string ID to convert.
 * @returns {ObjectId} The converted Mongoose ObjectId.
 */
const convertToObjectIdMongoose = (id) => new Types.ObjectId(id);
/**
 * Converts a string ID to a Mongoose UUID object.
 *
 * @param {string} id - The string ID to convert.
 * @returns {Types.UUID} - The converted Mongoose UUID object.
 */
const converToUUIDMongoose = (id) => new Types.UUID(id);
/**
 * Converts the input to an array.
 *
 * @param {Array|string} arr - The input to be converted to an array.
 * @returns {Array} - The converted array.
 */
const convertToArray = (arr) => {
  if (!Array.isArray(arr)) {
    return arr.trim().split();
  }
  return arr;
};

/**
 * Renames the keys of an object based on a provided mapping.
 *
 * @param {Object} field - An object containing the mapping of old keys to new keys.
 * @param {Object|Array} obj - The object or array of objects to rename the keys for.
 * @returns {Object|Array} - The object or array of objects with renamed keys.
 */
const renameObjectKey = (field, obj) => {
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
/**
 * Retrieves the error message from a Mongoose error object.
 * @param {Error} error - The Mongoose error object.
 * @param {Model} model - The Mongoose model.
 * @param {string} [message=""] - The default error message.
 * @returns {string} - The error message.
 */
const getErrorMessageMongose = (error, message = "") => {
  if (error.errors) {
    for (const key in error.errors) {
      return error.errors[key]?.properties.message;
    }
  }
  return message;
};
/**
 * Object containing validation methods.
 * @namespace isValidation
 */
const isValidation = {
  /**
   * Checks if the input is a valid email address.
   * @memberof isValidation
   * @param {string} input - The input to be validated.
   * @returns {boolean} - Returns true if the input is a valid email address, otherwise false.
   */
  isEmail: (input) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(input);
  },
  /**
   * Checks if the input is a valid phone number.
   * @memberof isValidation
   * @param {string} input - The input to be validated.
   * @returns {boolean} - Returns true if the input is a valid phone number, otherwise false.
   */
  isPhoneNumber: (input) => {
    var phonePattern =
      /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return phonePattern.test(input);
  },
  /**
   * Checks if the input is a valid username.
   * @memberof isValidation
   * @param {string} input - The input to be validated.
   * @returns {boolean} - Returns true if the input is a valid username, otherwise false.
   */
  isUserName: (input) => {
    var usernamePattern = /^\w{4,16}$/;
    return usernamePattern.test(input);
  },
};

/**
 * Adds a prefix to the keys of an object, excluding specified keys.
 *
 * @param {Object} obj - The object to modify.
 * @param {string} prefix - The prefix to add to the keys.
 * @param {Array} excludedKeys - The keys to exclude from prefixing.
 * @returns {Object} - The modified object with prefixed keys.
 */
function addPrefixToKeys(obj, prefix, excludedKeys = []) {
  const newObj = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Kiểm tra xem key có nằm trong danh sách excludedKeys không
      if (excludedKeys.includes(key)) {
        newObj[key] = obj[key]; // Giữ nguyên key nếu có trong danh sách loại trừ
      } else {
        newObj[prefix + key] = obj[key]; // Thêm tiền tố nếu không có trong danh sách loại trừ
      }
    }
  }
  return newObj;
}

/**
 * Removes a prefix from the keys of an object.
 *
 * @param {Object} obj - The object from which to remove the prefix.
 * @param {string} prefix - The prefix to remove from the keys.
 * @returns {Object} - A new object with the prefix removed from the keys.
 */
const removePrefixFromKeys = (obj, prefix) => {
  const newObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && key.startsWith(prefix)) {
      newObj[key.slice(prefix.length)] = obj[key];
    } else {
      newObj[key] = obj[key]; // Giữ nguyên các key không có tiền tố
    }
  }
  return newObj;
};
/**
 * Generates a random ID by combining the current timestamp with a random number.
 * @returns {string} The generated random ID.
 */
const randomId = () => {
  return `${Date.now()}${Math.floor(Math.random() * 999)}`;
};

function findAndConvertObjectIds(doc) {
  if (doc instanceof Types.ObjectId) {
    return doc.toString(); // Chuyển đổi ObjectId đơn lẻ
  }

  if (Array.isArray(doc)) {
    return doc.map(findAndConvertObjectIds); // Xử lý mảng
  }

  if (typeof doc === "object" && doc !== null) {
    for (const key in doc) {
      doc[key] = findAndConvertObjectIds(doc[key]); // Duyệt qua các thuộc tính
    }
  }

  return doc;
}
const filterConvert = (data, grant) => {
  for (const key in data) {
    
    if (data[key] instanceof Types.ObjectId) {
      data[key] = data[key].toString();
    } else if (Array.isArray(data[key])) {
      // Nếu là mảng, xử lý từng phần tử
      data[key] = data[key].map((item) =>
        typeof item === "object" && item !== null
          ? filterConvert(item, grant)
          : item.toString()
      );
    } else if (typeof data[key] === "object" && data[key] !== null) {
      // Nếu là object, đệ quy xử lý
      for (const k in data[key]) {
        if (data[key][k] instanceof Types.ObjectId) {
          data[key][k] = data[key][k].toString();
        }
      }
    }
  }

  return grant.filter(data);
};

function createJoiSchemaFromMongoose(model, prefix = "") {
  const mongooseSchema = model.schema; // Lấy schema từ model

  const joiSchemaDefinition = {};

  for (const key in mongooseSchema.obj) {
    const field = mongooseSchema.obj[key];
    let joiField;
    switch (field.type) {
      case String:
        joiField = Joi.string();
        break;
      case Number:
        joiField = Joi.number();
        break;
      case Boolean:
        joiField = Joi.boolean();
        break;
      case Date:
        joiField = Joi.date();
        break;
      default:
        joiField = Joi.any(); // Nếu không biết kiểu, mặc định là Joi.any()
    }
    if (field.required) {
      joiField = joiField.required();
    }
    // // Kiểm tra các ràng buộc khác như min hoặc max (nếu có)
    if (field.min) {
      joiField = joiField.min(field.min[0]);
    }
    if (field.max) {
      joiField = joiField.max(field.max[0]);
    }
    joiSchemaDefinition[key.slice(prefix.length)] = joiField;
  }
  return Joi.object(joiSchemaDefinition);
}
const getCurrency = (currency) => {
  switch (currency) {
    case "US":
      return "USD";
    case "GB":
      return "GBP";
    case "ID":
      return "IDR";
    case "TH":
      return "THB";
    case "MY":
      return "MYR";
    case "PH":
      return "PHP";
    case "VN":
      return "VND";
    case "SG":
      return "SGD";
    default:
      return "VND";
  }
};
const createMongoObjectId=()=>{
  return new Types.ObjectId();
}
module.exports = {
  filterConvert,
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
  addPrefixToKeys,
  removePrefixFromKeys,
  randomId,
  findAndConvertObjectIds,
  createJoiSchemaFromMongoose,
  getCurrency,
  createMongoObjectId
};
