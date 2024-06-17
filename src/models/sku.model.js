"use strict";
const { model, Schema } = require("mongoose");
const { randomId } = require("../utils");
const Document_name = "Sku";
const Collection_name = "Skus";
const skuSchema = new Schema(
  {
    sku_id: { type: String, unique: true }, //spu_id.randomId()
    sku_tier_idx: { type: Array, default: [0] },
    sku_default: { type: Boolean, default: false },
    sku_slug: { type: String, default: "" },
    sku_sort: { type: Number, default: 0 },
    sku_amout: {
      price: { type: Number, default: 0 },
      /*{US: USD
      GB: GBP,
      ID: IDR,
      TH: THB,
      MY: MYR,
      PH: PHP,
      VN: VND,
      SG: SGD}*/
      currency: {
        type: String,
        default: "VN",
        enum: ["US", "GB", "ID", "TH", "MY", "PH", "VN", "SG"],
      },
    },
    // sku_inventory: {
    //   warehouse_id: { type: String, default: "" },
    //   quantity: { type: Number, default: 0 },
    // },
    spu_id: { type: String },
  },
  {
    collection: Collection_name,
    timestamps: true,
  }
);
skuSchema.pre("save", function (next) {
  this.sku_id = `${this.spu_id}.${randomId()}`;
  next();
});
module.exports = model(Document_name, skuSchema);
