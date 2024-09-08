"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Warehouse";
const COLLECTION_NAME = "Warehouses";
const warehouseSchema = new Schema(
  {
    ware_name: { type: String, required: true, unique: true },
    ware_type: {
      type: String,
      required: true,
      enum: [" SALES_WAREHOUSE", "RETURN_WAREHOUSE"],
    },
    ware_effect_status: {
      type: String,
      required: true,
      enum: ["ACTIVE", "INACTIVE"],
    },
    ware_userId: { type: Schema.Types.ObjectId, ref: "Users" },
    ware_is_default: { type: Boolean, default: false },
    ware_is_deleted: { type: Boolean, default: false },
    ware_address: {
      region: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
      town: { type: String, required: true },
      contact_person: { type: String, required: true },
      postal_code: { type: String, required: true },
      full_address: { type: String, required: true },
      region_code: { type: String, required: true },
      phone_number: { type: String, required: true },
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = model(DOCUMENT_NAME, warehouseSchema);
