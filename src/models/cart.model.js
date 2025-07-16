"use strict";
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "Carts";
const cartSchema = new Schema(
  {
    cart_userId: { type: Schema.Types.ObjectId, ref: "User" },
    cart_items: [
      {
        shopId: { type: Schema.Types.ObjectId, ref: "User" },
        products: [
          {
            sku_id: { type: String },
            quantity: { type: Number, default: 0 },
          },
        ],
      },
    ],
    cart_state: {
      type: String,
      default: "active",
      enum: ["active", "completed", "pending", "failed"],
    },
    cart_deleted_items: { type: Array, default: [] },
    cart_count: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, cartSchema);
