"use strict";
const { model, Schema } = require("mongoose");
const Document_name = "Brand";
const Collection_name = "brands";
const BrandSchema = new Schema(
  {
    brand_name: {
      type: String,
      required: true,
      unique: true,
    },
    brand_image: {
      type: String,
      default: "",
    },
    brand_status: {
      type: Boolean,
      default: true,
    },
    brand_cate_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    brand_created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: Collection_name,
  }
);
module.exports = model(Document_name, BrandSchema);
