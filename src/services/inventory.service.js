"use strict";
const { BadRequestError } = require("../core/error.response");
const inventoryMode = require("../models/inventory.mode");
const { checkExistWarehouse } = require("../repositories/warehouse.repo");
const { convertToObjectIdMongoose, filterConvert } = require("../utils");
const { grantAccess } = require("../middlewares/rbac.middleware");
const skuModel = require("../models/sku.model");

/**
 * Import inventory for a user.
 *
 * @param {string} userId - The ID of the user.
 * @param {Object} data - The data containing warehouse ID and SKU list.
 * @param {string} data.warehouseId - The ID of the warehouse.
 * @param {Array} data.sku_list - The list of SKUs.
 * @param {string} data.sku_list[].sku_id - The ID of the SKU.
 * @param {number} data.sku_list[].quantity - The quantity of the SKU.
 * @returns {boolean} - Returns true if the inventory is exported successfully.
 * @throws {BadRequestError} - Throws an error if the warehouse is not found, SKU list is missing, or quantity is invalid.
 */
const importInventory = async (userId, data) => {
  const grants = await grantAccess(userId, "createOwn", "inventory");
  const { warehouseId, sku_list } = data;
  const checkWareExist = await checkExistWarehouse({
    _id: convertToObjectIdMongoose(warehouseId),
    ware_userId: convertToObjectIdMongoose(userId),
  });
  if (!checkWareExist) throw new BadRequestError("Warehouse not found");
  if (!sku_list) throw new BadRequestError("The 'Sku_list' feld is required");
  let result = [];
  for (let item of sku_list) {
    if (item.quantity < 0)
      throw new BadRequestError(
        `the Quantity of item with sku_id:'${item.sku_id}'must be greater than 0`
      );
    const checkSku = await skuModel.findOneAndUpdate(
      {
        sku_id: item.sku_id,
        sku_shopId: convertToObjectIdMongoose(userId),
      },
      {
        $inc: {
          "sku_inventory.quantity": item.quantity,
        },
      },
      {
        new: true,
      }
    );
    if (!checkSku) throw new BadRequestError("Product not found");
    const inv = await inventoryMode.findOneAndUpdate(
      {
        inv_skuId: item.sku_id,
        inv_warehouseId: convertToObjectIdMongoose(warehouseId),
        inv_shopId: convertToObjectIdMongoose(userId),
      },
      {
        $inc: {
          inv_amount: item.quantity || 0,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    result.push(filterConvert(inv.toObject(), grants));
  }
  return result;
};
/**
 * Export inventory for a user.
 *
 * @param {string} userId - The ID of the user.
 * @param {Object} data - The data containing warehouse ID and SKU list.
 * @param {string} data.warehouseId - The ID of the warehouse.
 * @param {Array} data.sku_list - The list of SKUs.
 * @param {string} data.sku_list[].sku_id - The ID of the SKU.
 * @param {number} data.sku_list[].quantity - The quantity of the SKU.
 * @returns {boolean} - Returns true if the inventory is exported successfully.
 * @throws {BadRequestError} - Throws an error if the warehouse is not found, SKU list is missing, or quantity is invalid.
 */
const exportInventory = async (userId, data) => {
  await grantAccess(userId, "createOwn", "inventory");
  const { warehouseId, sku_list } = data;
  const checkWareExist = await checkExistWarehouse({
    _id: convertToObjectIdMongoose(warehouseId),
    ware_userId: convertToObjectIdMongoose(userId),
  });
  if (!checkWareExist) throw new BadRequestError("Warehouse not found");
  if (!sku_list) throw new BadRequestError("The 'Sku_list' feld is required");
  for (let item of sku_list) {
    if (item.quantity > 0)
      throw new BadRequestError(
        `the Quantity of item with sku_id:'${item.sku_id}'must be greater than 0`
      );
    const checkSku = await skuModel.findOneAndUpdate(
      {
        sku_id: item.sku_id,
        sku_shopId: convertToObjectIdMongoose(userId),
      },
      {
        $inc: {
          "sku_inventory.quantity": -item.quantity,
        },
      },
      {
        new: true,
      }
    );
    if (!checkSku) throw new BadRequestError("Product not found");
    await inventoryMode.findOneAndUpdate(
      {
        inv_skuId: item.sku_id,
        inv_warehouseId: convertToObjectIdMongoose(warehouseId),
      },
      {
        $inc: {
          inv_amount: -item.quantity || 0,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
  }
  return true;
};

module.exports = { importInventory, exportInventory };
