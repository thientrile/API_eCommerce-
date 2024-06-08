"use strict";
const slugify = require("slugify");
const { model, Schema } = require("mongoose");
const { min, uniq } = require("lodash");
const Document_name = "Spu";
const Collection_name = "Spus";

const spuSchema = new Schema(
  {
    pro_id: { type: String, unique: true },
    pro_name: {
      type: String,
      required: true,
    },
    pro_slug: String,
    pro_description: String,
    pro_category: { type: Array, default: [] },
    pro_shop: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    pro_thumb: String,
    pro_images: { type: Array, default: [] },
    pro_attributes: { type: Schema.Types.Mixed, required: true },

    /*{

   attribute_id: 1234,// style t-shirt korean
   atribute_name: "t-shirt",
   attribute_values:[
   {
   value_id: 1234,
 value_name:"korean"
   }

   ]

   }*/
    pro_ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    pro_variations: { type: Array, default: [] },
    /*
    {
  tier_variation:[
    {
        images:[]
        name:"color",
        options:["red","blue","green"]
    },
    {
        name:"size",
        options:["S","M","L"]
    }
  ]
  }
  */
    pro_status: {
      type: String,
      default: "draft",
      enum: ["draft", "active", "pending", "block", "deleted"],//draft: chưa hoàn thiện, active: đã hoàn thiện, pending: chờ duyệt, block: bị chặn, deleted: đã xóa
    },
    pro_selled: { type: Number, default: 0 },
    pro_viewed: { type: Number, default: 0 },
  },
  {
    collection: Collection_name,
    timestamps: true,
  }
);

spuSchema.index({ pro_name: "text", pro_description: "text" });
spuSchema.pre("save", async function (next) {
  if(!this.pro_id){

      this.pro_id = `proid${Date.now()}${Math.floor(Math.random() * 10 + 1)}`;
  }
  next();
});
module.exports = model(Document_name, spuSchema);
