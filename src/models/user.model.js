/** @format */

'use strict';

const { model, Schema } = require('mongoose');
const { randomId } = require('../utils');
const DOCUMENT_NAME = 'User';
const COLLECTTION_NAME = 'Users';
const userSchema = new Schema(
	{
		usr_id: { type: Number }, //user
		usr_slug: { type: String, unique: true },
		usr_email: {
			type: String,
			unique: [true, 'Email already exists'],
			sparse: true
		},
		usr_phone: {
			type: String,
			unique: [true, 'Phone number already exists'],
			sparse: true
		},
		usr_name: { type: String, default: '' },
		usr_salt: { type: String, default: '' },

		usr_sex: { type: String, default: '' },
		usr_avatar: { type: String, default: '' },
		usr_date_of_birth: { type: Date, default: null },
		usr_role: { type: Schema.Types.ObjectId, ref: 'Role', default: null },
		usr_status: {
			type: String,
			default: 'active',
			enum: ['pending', 'active', 'block']
		}
	},
	{
		timestamps: true,
		collection: COLLECTTION_NAME
	}
);
userSchema.pre('save', async function (next) {
	this.usr_id = parseInt(randomId());

	if (!this.usr_slug) {
		this.usr_slug = `uid${randomId()}`;
	}

	next();
});
module.exports = model(DOCUMENT_NAME, userSchema);
