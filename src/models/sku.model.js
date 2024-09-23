"use strict";
const {model, Schema} = require("mongoose");
const {randomId} = require("../utils");
const Document_name = "Sku";
const Collection_name = "Skus";
const skuSchema = new Schema({
    sku_shopId: {type: Schema.Types.ObjectId, ref: "User"},
    sku_id: {type: String, unique: true}, //spu_id.randomId()
    sku_tier_idx: {type: Array, default: [0]},
    sku_default: {type: Boolean, default: false},
    sku_slug: {type: String, default: ""},
    sku_sort: {type: Number, default: 0},
    sku_thumb: {type: String, default: ""},
    sku_amout: {
        price: {type: Number, default: 0}, /*{US: USD
            GB: GBP,
            ID: IDR,
            TH: THB,
            MY: MYR,
            PH: PHP,
            VN: VND,
            SG: SGD}*/
        currency: {
            type: String, default: "VN", enum: ["US", "GB", "ID", "TH", "MY", "PH", "VN", "SG"],
        },
    },
    sku_inventory: {
        quantity: {type: Number, default: 0},
    },
    spu_id: {type: String},
    is_deleted: {type: Boolean, default: false},
}, {
    collection: Collection_name, timestamps: true,
});
skuSchema.pre("save", function (next) {
    this.sku_id = `${this.spu_id}.${randomId()}`;
    next();
});
module.exports = model(Document_name, skuSchema);
