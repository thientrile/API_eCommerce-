"use strict";
const { Schema, model } = require("mongoose");
const Document_name = "Category";
const Collection_name = "Categories";
const categorySchema = new Schema(
  {
    cate_name: { type: String, required: true, unique: true },
    cate_parent_id: {
      type: Schema.Types.ObjectId,
      ref: Document_name,
      default: null,
    },
    cate_is_active: { type: Boolean, default: true },
    cate_is_leaf: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: Collection_name,
  }
);

module.exports = model(Document_name, categorySchema);
