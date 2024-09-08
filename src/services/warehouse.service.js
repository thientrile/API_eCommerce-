"use strict";

const { grantAccess } = require("../middlewares/rbac.middleware");
const warehouseModel = require("../models/warehouse.model");
const {
  getErrorMessageMongose,
  addPrefixToKeys,
  removePrefixFromKeys,
} = require("../utils");

const createWarehouse = async (userId, data) => {
  const grantAccess = await grantAccess(userId, "createOwn", "warehouse");
  data.userId = userId;
  const dataWarehouse = addPrefixToKeys(data, "ware_");
  const warehouse = (
    await warehouseModel.create(dataWarehouse).catch((err) => {
      throw new BadRequestError(getErrorMessageMongose(err, warehouseModel));
    })
  ).toObject();
  return grantAccess.filters(removePrefixFromKeys(warehouse, "ware_"));
};
const editWarehouse = async (userId, data) => {
  const grantAccess = await grantAccess(userId, "updateOwn", "warehouse");
  data.userId = userId;
  const dataWarehouse = addPrefixToKeys(data, "ware_");
  const warehouse = (
    await warehouseModel
      .findOneAndUpdate(
        { $and: [{ _id: data.id }, { userId: userId }] },
        data,
        { new: true }
      )
      .catch((err) => {
        throw new BadRequestError(getErrorMessageMongose(err, warehouseModel));
      })
  ).toObject();
  return grantAccess.filters(removePrefixFromKeys(warehouse, "ware_"));
};
const deleteWarehouse = async (userId, id) => {
  const grantAccess = await grantAccess(userId, "deleteOwn", "warehouse");
  const warehouse = (
    await warehouseModel
      .findByIdAndUpdate(id, {
        is_deleted: true,
      })
      .catch((err) => {
        throw new BadRequestError(getErrorMessageMongose(err, warehouseModel));
      })
  ).toObject();
  return grantAccess.filters(removePrefixFromKeys(warehouse, "ware_"));
};
const getListWarehouse = async (userId) => {
  const grantAccess = await grantAccess(userId, "readOwn", "warehouse");
  const warehouses = await warehouseModel
    .find({ is_deleted: false })
    .catch((err) => {
      throw new BadRequestError(getErrorMessageMongose(err, warehouseModel));
    });
  return grantAccess.filters(
    warehouses.map((warehouse) =>
      removePrefixFromKeys(warehouse.toObject(), "ware_")
    )
  );
};
module.exports = { createWarehouse };
