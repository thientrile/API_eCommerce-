"use strict";
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "Carts";
const cartSchema = new Schema(
  {
    cart_userId: { type: Schema.Types.ObjectId, ref: "User" },
    cart_item: [
      {
        shopId: { type: Schema.Types.ObjectId, ref: "User" },
        products: [
          {
            spu_id: { Type: String },
            sku_id: { Type: String },
            quantity: { Type: Number },
            name: { Type: String },
            thumbnail: { Type: String },
          },
        ],
      },
    ],
    cart_state: {
      type: String,
      default: "active",
      enum: ["active", "completed", "pending", "failed"],
    },
    cart_count: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, cartSchema);
