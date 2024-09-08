"use strict";
const { Schema, model } = require("mongoose");
const Document_name = "Category";
const Collection_name = "Categories";
const categorySchema = new Schema(
  {
    cate_name: { type: String, required: [true,"The {PATH} field cannot be left blank"] },
    cate_parentId: {
      type: Schema.Types.ObjectId,
      ref: Document_name,
      default: null,
    },
    cate_is_active: { type: Boolean, default: true },
    cate_is_leaf: { type: Boolean, default: true },
    cate_left: { type: Number, default: 0 },
    cate_right: { type: Number, default: 0 },

  },
  {
    timestamps: true,
    collection: Collection_name,
  }
);

module.exports = model(Document_name, categorySchema);
