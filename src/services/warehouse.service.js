"use strict";

const { grantAccess } = require("../middlewares/rbac.middleware");
const warehouseModel = require("../models/warehouse.model");
const { BadRequestError } = require("../core/error.response");
const {
  getErrorMessageMongose,
  addPrefixToKeys,
  removePrefixFromKeys,
  convertToObjectIdMongoose,
  filterConvert,
} = require("../utils");
const { checkExistWarehouse } = require("../repositories/warehouse.repo");

const createWare = async (userId, data) => {
  const grant = await grantAccess(userId, "createOwn", "warehouse");
  
  data.userId = userId;
  data.type = data.type ? data.type : "SALES_WAREHOUSE";
  data.effect_status = data.effect_status ? data.effect_status : "ACTIVE";
  const dataWarehouse = addPrefixToKeys(grant.filter(data), "ware_");
  const warehouse = (
    await warehouseModel.create(dataWarehouse).catch((err) => {
      throw new BadRequestError(
        getErrorMessageMongose(err, "The warehouse name already exists")
      );
    })
  ).toObject();
  if (data.is_default) {
    await setDefaultWarehouse(userId, warehouse._id);
  }
  return filterConvert(removePrefixFromKeys(warehouse, "ware_"), grant);
};
const editWare = async (userId, id, data) => {
  const grant = await grantAccess(userId, "updateOwn", "warehouse");
  const dataWarehouse = addPrefixToKeys(data, "ware_");

  const warehouse = (
    await warehouseModel
      .findOneAndUpdate(
        {
          _id: convertToObjectIdMongoose(id),
          ware_userId: convertToObjectIdMongoose(userId),
        },
        dataWarehouse,
        { new: true }
      )
      .catch((err) => {
        throw new BadRequestError(getErrorMessageMongose(err));
      })
  ).toObject();
  if (data.is_default) {
    await setDefaultWarehouse(userId, warehouse._id);
  }
  return filterConvert(removePrefixFromKeys(warehouse, "ware_"), grant);
};
const deleteWarehouse = async (userId, id) => {
  await grantAccess(userId, "deleteOwn", "warehouse");

  await warehouseModel
    .findOneAndUpdate(
      {
        _id: convertToObjectIdMongoose(id),
        ware_userId: convertToObjectIdMongoose(userId),
      },
      {
        ware_is_deleted: true,
        ware_is_default: false,
      },
      { new: true }
    )
    .catch((err) => {
      throw new BadRequestError(getErrorMessageMongose(err));
    });

  await warehouseModel.findOneAndUpdate(
    {
      ware_userId: convertToObjectIdMongoose(userId),
      ware_is_deleted: false,
    },
    { ware_is_default: true }
  );
  return 1;
};
const getListWarehouse = async (userId, limit = 100, page = 0) => {
  const grant = await grantAccess(userId, "readOwn", "warehouse");
  const warehouses = await warehouseModel
    .find({
      ware_is_deleted: false,
      ware_userId: convertToObjectIdMongoose(userId),
    })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  return warehouses.map((warehouse) => {
    const result = removePrefixFromKeys(warehouse.toObject(), "ware_");
    return filterConvert(result, grant);
  });
};

const setDefaultWarehouse = async (userId, id) => {
  await grantAccess(userId, "updateOwn", "warehouse");
  await warehouseModel.updateMany(
    { ware_userId: convertToObjectIdMongoose(userId) },
    { ware_is_default: false }
  );
  await warehouseModel.findOneAndUpdate(
    {
      _id: convertToObjectIdMongoose(id),
      ware_userId: convertToObjectIdMongoose(userId),
      ware_is_deleted: false,
    },
    { ware_is_default: true }
  );
  return true;
};
module.exports = {
  editWare,
  createWare,
  getListWarehouse,
  deleteWarehouse,
  setDefaultWarehouse,
};
