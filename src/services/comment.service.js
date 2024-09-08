"use strict";
const CommentModel = require("../models/comment.model");
const {
  addPrefixToKeys,
  convertToObjectIdMongoose,
  removePrefixFromKeys,
} = require("../utils");

class CommentService {
  static async create(payload, userId) {
    payload.userId = userId;

    let rightValue;
    if (payload.parentId) {
      // Reply comment
      const parentComment = await CommentModel.findOne({
        _id: convertToObjectIdMongoose(payload.parentId),
      });
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }

      rightValue = parentComment.comment_right;

      await CommentModel.updateMany(
        {
          comment_productId: convertToObjectIdMongoose(payload.productId),
          comment_right: { $gte: rightValue },
        },
        { $inc: { comment_right: 2 } },
      );

      await CommentModel.updateMany(
        {
          comment_productId: convertToObjectIdMongoose(payload.productId),
          comment_left: { $gt: rightValue },
        },
        { $inc: { comment_left: 2 } },
      );
    } else {
      // New comment thread
      const maxRightValue = await CommentModel.findOne(
        { comment_productId: convertToObjectIdMongoose(payload.productId) },
        "comment_right",
        { sort: { comment_right: -1 } }
      );
      rightValue = maxRightValue ? maxRightValue.comment_right + 1 : 1;
    }

    // Update the payload with correct left and right values
    payload.left = rightValue;
    payload.right = rightValue + 1;
    const data = addPrefixToKeys(payload, "comment_"); // Use consistent prefix
    const comment = await CommentModel.create(data);
    return removePrefixFromKeys(comment, "comment_"); // Return the created comment object
  }
}

module.exports = CommentService;
