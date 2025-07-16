/** @format */

'use strict';
const { model, Schema } = require('mongoose');
const { randomId } = require('../utils');
const documentName = 'Shop';
const collectionName = 'Shops';
const shopSchema = new Schema(
	{
		shop_userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		shop_avatar:{
			type: String,
			default: ''
		},
		shop_code: {
			type: String,
			required: true,
			unique: true
		},
		shop_name: {
			type: String,
			required: true,
			unique: true
		},
		shop_description: {
			type: String,
			required: true
		},
		shop_status: {
			type: String,
			enum: ['active', 'inactive', 'pending'],
			default: 'active'
		},
		shop_verify: {
			type: Boolean,
			default: false
		},
		shop_type:{
			type: String,
			enum: ['single', 'multi'],
			default: 'single'
		},		
		shop_slug: {
			type: String,
			unique: true
		}
	},
	{
		timestamps: true,
		collection: collectionName
	}
);
shopSchema.pre('save', function (next) {
	this.shop_slug = `shopui${randomId()}`;

	next();
});
module.exports = model(documentName, shopSchema);
