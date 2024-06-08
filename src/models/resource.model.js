/** @format */

"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Resource";
const COLLECTTION_NAME = "Resources";
const resourceSchema = new Schema(
  {
    src_name: { type: String, required: true, unique: true }, //profile
    src_slug: { type: String, unique: true }, // 000001
    src_description: { type: String, default: "" },
  },
  {
    timestamps: true,
    collection: COLLECTTION_NAME,
  }
);
resourceSchema.pre("save", async function (next) {
  if (!this.src_slug || this.src_slug === "") {
    this.src_slug = `sui${Date.now()}`;
  }

  next();
});
module.exports = model(DOCUMENT_NAME, resourceSchema);
