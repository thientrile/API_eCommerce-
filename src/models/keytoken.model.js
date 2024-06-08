/** @format */

"use strict";
const { randomUUID } = require("crypto");
const { Schema, model } = require("mongoose"); // Erase if already required
const { token } = require("morgan");
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
      type: "UUID",
      default: () => randomUUID(),
      unique: true,
      index: true,
    },
    tk_publicKey: {
      type: String,
      required: true,
    },
    tk_privateKey: {
      type: String,
      required: true,
    },
    tk_accessToken: {
      type: String,
      required: true,
    },
    tk_refreshTokensUsed: {
      // nhung RT da duoc su dung
      type: Array,
      default: [],
    },
    
  },
  {
    collection: COLLECTON_NAME,
    timestamps: true,
  }
);

// Export the model
module.exports = model(DOCUMENT_NAME, KeyTokenSchema);
