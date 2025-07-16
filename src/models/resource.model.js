/** @format */

'use strict';

const { model, Schema } = require('mongoose');
const { randomId } = require('../utils');

const DOCUMENT_NAME = 'Resource';
const COLLECTTION_NAME = 'Resources';
const resourceSchema = new Schema(
	{
		src_name: { type: String, required: true, unique: true }, //profile
		src_slug: { type: String, unique: true, default: `sui${randomId()}` }, // 000001
		src_description: { type: String, default: '' },
		src_isRoot: { type: Boolean, default: false },
		src_menu:[{
			
		}]
	},
	{
		timestamps: true,
		collection: COLLECTTION_NAME
	}
);

resourceSchema.pre('save', function (next) {
	this.src_slug = `srcui${randomId()}`;
	next();
});
module.exports = model(DOCUMENT_NAME, resourceSchema);
