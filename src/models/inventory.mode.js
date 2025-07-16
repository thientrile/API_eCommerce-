"use strict";

const { model, Schema } = require("mongoose");
const Document_name = "Inventory";
const Collection_name = "Inventories";
const inventorySchema = new Schema(
  {
    inv_skuId: {
      type: String,
      required: [true, "The {PATH} field cannot be left blank"],
    },
    inv_amount: { type: Number, default: 0 },
    inv_warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    inv_reservations: { type: Array, default: [] },
    inv_shopId: { type: Schema.Types.ObjectId, ref: "Shops" },
  },
  {
    collection: Collection_name,
    timestamps: true,
  }
);

module.exports = model(Document_name, inventorySchema);
