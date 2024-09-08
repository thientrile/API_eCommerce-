"use strict";
const { Schema, model } = require("mongoose");
const Document_name = "Comment";
const Collection_name = "Comments";
const commentSchema = new Schema(
  {
    comment_userId: { type: Schema.Types.ObjectId, ref: "User" },
    comment_productId: { type: Schema.Types.ObjectId, ref: "Product" },
    comment_left: { type: number, default: 0 },
    comment_right: { type: number, default: 0 },
    comment_parentId: {
      type: Schema.Types.ObjectId,
      ref: Document_name,
      default: null,
    },
    comment_content: { type: String, required: true },
    comment_isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: Collection_name,
  }
);

module.exports = model(Document_name, commentSchema);
