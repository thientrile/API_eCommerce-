"use strict";
const { Schema, model } = require("mongoose");

const documentName = "Discount";
const collectionName = "Discounts";

const discountSchema = new Schema(
  {
    disc_name: {
      type: String,
      required: [true, "The {PATH} field cannot be left blank"],
    },
    disc_description: {
      type: String,
    },
    disc_type: {
      type: String,
      required: [true, "The {PATH} field cannot be left blank"],
      enum: ["percent", "fixed_amount"],
    }, // or fixed_amount
    disc_value: {
      type: Number,
      required: [true, "The {PATH} field cannot be left blank"],
    }, // value is minimized
    disc_code: {
      type: String,
      required: [true, "The {PATH} field cannot be left blank"],
      unique: true,
    },
    disc_start_date: {
      type: Date,
      required: [true, "The {PATH} field cannot be left blank"],
    },
    disc_end_date: {
      type: Date,
      required: [true, "The {PATH} field cannot be left blank"],
    },
    disc_max_uses: {
      type: Number,
      default: 1,
    }, // maximum  uses
    disc_uses_count: { type: Number, default: 0 }, // how many users count of this discount has been used
    disc_users_used: {
      type: Array,
      default: [],
    }, // who used this discount
    disc_max_uses_per_user: {
      type: Number,
      default: 0,
    }, // maximum user usage
    disc_min_order: {
      value: { type: Number, default: 0 },
      currency: {
        type: String,
        default: "VN",
        enum: ["US", "GB", "ID", "TH", "MY", "PH", "VN", "SG"],
      },
    }, // minimum order amount to use this discount
    disc_shopId: { type: Schema.Types.ObjectId, ref: "Shops" },
    disc_status: {
      type: String,
      enum: ["active", "inactive", "expired", "deleted"],
    },
    disc_applies_to: {
      type: String,
      required: [true, "The {PATH} field cannot be left blank"],
      enum: ["all_products", "specific_products", "specific_collections"],
    },
    disc_product_ids: {
      type: Array,
      default: [],
    },
    disc_collection_ids: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: collectionName,
  }
);
module.exports = model(documentName, discountSchema);
