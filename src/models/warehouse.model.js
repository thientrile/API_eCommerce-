"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Warehouse";
const COLLECTION_NAME = "Warehouses";
const warehouseSchema = new Schema(
  {
    ware_name: {
      type: String,
      required: [true, "The {PATH} field cannot be left blank"],
      unique: true,
    },
    ware_type: {
      type: String,
      required: [true, "The {PATH} field cannot be left blank"],
      enum: ["SALES_WAREHOUSE", "RETURN_WAREHOUSE", "RECEIVE_WAREHOUSE"],
    },
    ware_effect_status: {
      type: String,
      required: [true, "The {PATH} field cannot be left blank"],
      enum: ["ACTIVE", "INACTIVE"],
    },
    ware_shopId: { type: Schema.Types.ObjectId, ref: "Shops" },
    ware_is_default: { type: Boolean, default: false },
    ware_is_deleted: { type: Boolean, default: false },
    ware_address: {
      region: {
        type: String,
        required: [true, "The {PATH} field cannot be left blank"],
      },
      state: {
        type: String,
        required: [true, "The {PATH} field cannot be left blank"],
      },
      city: {
        type: String,
        required: [true, "The {PATH} field cannot be left blank"],
      },
      district: {
        type: String,
        required: [true, "The {PATH} field cannot be left blank"],
      },
      town: {
        type: String,
        required: [true, "The {PATH} field cannot be left blank"],
      },
      contact_person: {
        type: String,
        required: [true, "The {PATH} field cannot be left blank"],
      },
      postal_code: {
        type: String,
        required: [true, "The {PATH} field cannot be left blank"],
      },
      full_address: {
        type: String,
        required: [true, "The {PATH} field cannot be left blank"],
      },
      region_code: {
        type: String,
        required: [true, "The {PATH} field cannot be left blank"],
      },
      phone_number: {
        type: String,
        required: [true, "The {PATH} field cannot be left blank"],
      },
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = model(DOCUMENT_NAME, warehouseSchema);
