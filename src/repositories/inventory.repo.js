"use strict";

const inventoryModel = require("../models/inventory.mode");
const { convertToObjectIdMongoose } = require("../utils");

const reservationInventory = async ({ sku_id, quantity, cartId }) => {
  const query = {
      inv_skuId: sku_id,
      inv_amount: { $gte: quantity },
    },
    updateSet = {
      $inc: {
        inv_amount: -quantity,
      },
      $push: {
        inv_reservations: {
          cartId: convertToObjectIdMongoose(cartId),
          quantity,
          createOn: new Date(),
        },
      },
    };
  return await inventoryModel.updateOne(query, updateSet);
};
module.exports = {
  reservationInventory,
};
