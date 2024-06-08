/** @format */

"use strict";

const { model, Schema } = require("mongoose");
const counterModel = require("./counter.model");
const DOCUMENT_NAME = "User";
const COLLECTTION_NAME = "Users";
const userSchema = new Schema(
  {
    urs_id: { type: Number }, //user
    usr_slug: { type: String, unique: true },
    usr_email: {
      type: String,
      unique: [true, "Email already exists"],
      sparse: true,
    },
    usr_phone: {
      type: String,
      unique: [true, "Phone number already exists"],
      sparse: true,
    },
    usr_name: { type: String, default: "" },
    usr_salt: { type: String, default: "" },
  
    usr_sex: { type: String, default: "" },
    usr_avatar: { type: String, default: "" },
    usr_date_of_birth: { type: Date, default: null },
    usr_role: { type: Schema.Types.ObjectId, ref: "Role" },
    usr_status: {
      type: String,
      default: "active",
      enum: ["pending", "active", "block"],
    },
  },
  {
    timestamps: true,
    collection: COLLECTTION_NAME,
  }
);
userSchema.pre("save", async function (next) {
  
  const counter = await counterModel
    .findOneAndUpdate(
      { name: "urs_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    )
    .lean();
  this.urs_id = counter.seq;

  if (!this.usr_slug) {
    this.usr_slug = `uid${Date.now()}${Math.floor(Math.random() * 10 + 1)}`;
  }
  next();
});
module.exports = model(DOCUMENT_NAME, userSchema);
