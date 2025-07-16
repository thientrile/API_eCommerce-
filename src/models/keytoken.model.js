/** @format */

"use strict";
const { randomUUID } = require("crypto");
const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Key";
const COLLECTON_NAME = "Keys";
// Declare the Schema of the Mongo model
const KeyTokenSchema = new Schema(
  {
    tk_userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    tk_clientId: {
      type: Schema.Types.UUID,
      default: () => randomUUID(),
      unique: true,
      index: true,
    },
    tk_publicKey: {
      type: String,
      required: true,
    },

    tk_refreshTokensUsed: {
      // nhung RT da duoc su dung
      type: Array,
      default: [],
    },
    expiresAt: {
      // Thêm trường để theo dõi thời gian hết hạn
      type: Date,
      default: () => Date.now() + 1209600000, // 14 ngày trong milliseconds
      expires: "14d", // Tạo TTL index để tự động xóa sau 14 ngày
    },
  },
  {
    collection: COLLECTON_NAME,
    timestamps: true,
  }
);

// Export the model
module.exports = model(DOCUMENT_NAME, KeyTokenSchema);
