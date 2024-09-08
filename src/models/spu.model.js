"use strict";
const slugify = require("slugify");
const { model, Schema } = require("mongoose");
const { randomId } = require("../utils");
const Document_name = "Spu";
const Collection_name = "Spus";

const spuSchema = new Schema(
  {
    spu_id: { type: String, unique: true },
    spu_name: {
      type: String,
      required: [true, "The {PATH} field cannot be left blank"],
    },
    spu_brand: {
      type: Schema.Types.Mixed,
    },
    spu_slug: String,
    spu_description: String,
    spu_category: {
      type: Schema.Types.Mixed,
    },

    spu_shopId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    spu_thumb: String,
    spu_images: {
      // nhung RT da duoc su dung
      type: Array,
      default: [],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "Image listing must have at least one product ",
      },
    },
    spu_video: { type: String, default: "" },
    spu_attributes: [
      {
        attribute_id: {
          type: Schema.Types.ObjectId,
          // default: null,
        },
        attribute_name: {
          type: String,
          default: null,
        },
        attribute_values: [
          new Schema({
            value_id: {
              type: Schema.Types.ObjectId,
              // default: null,
            },
            value_name: {
              type: String,

              default: null,
            },
          }),
        ],
      },
    ],

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
    spu_ratingsAverage: {
      //only admin can set, edit
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    spu_variations: [
      {
        images: [
          {
            type: String,
          },
        ],
        options: [
          {
            type: String,
            required: [true, "The {PATH} field cannot be left blank"],
          },
        ],
        name: {
          type: String,
          required: [true, "The {PATH} field cannot be left blank"],
        },
      },
    ],
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
    //Only administrators can adjust deleted, locked, and pending status
    spu_status: {
      type: String,
     
      enum: ["draft", "active", "active_only_on_shop","pending", "block", "deleted", "hide"], //draft: chưa hoàn thiện, active: đã hoàn thiện, pending: chờ duyệt, block: bị chặn, deleted: đã xóa
    },
    spu_selled: { type: Number, default: 0 }, //only admin can set, edit
    spu_viewed: { type: Number, default: 0 }, //only admin can set, edit
  },
  {
    collection: Collection_name,
    timestamps: true,
  }
);

spuSchema.index({ spu_name: "text", spu_description: "text" });
spuSchema.pre("save", async function (next) {
  this.spu_slug = slugify(this.spu_name, { lower: true });
  if (!this.spu_id) {
    this.spu_id = randomId();
  }
  if (!this.spu_thumb) {
    this.spu_thumb = this.spu_images[0];
  }
  next();
});
module.exports = model(Document_name, spuSchema);
