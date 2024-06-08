"use strict";
const { model, Schema } = require("mongoose");
const Document_name = "Sku";
const Collection_name = "Skus";
const skuSchema = new Schema(
  {
    sku_id: { type: String, unique: true, requeired: true },
    sku_tier_idx: { type: Array, default: [0] },
    sku_default: { type: Boolean, default: false },
    sku_slug: { type: String, default: "" },
    sku_sort:{type:Number,default:0},
    // sku_price: { type: Number, default: 0 },
    // sku_stock: { type: Number, default: 0 },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
  },
  {
    collection: Collection_name,
    timestamps: true,
  }
);
