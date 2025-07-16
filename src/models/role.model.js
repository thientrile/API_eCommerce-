/** @format */

'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Role';
const COLLECTTION_NAME = 'Roles';

const roleSchema = new Schema(
	{
		rol_name: {
			type: String,
			require: [true, 'Role name is required']
		},
		rol_slug: { type: String },
		rol_status: {
			type: String,
			default: 'active',
			enum: ['active', 'block', 'pending']
		},
		rol_userId: { type: Schema.Types.ObjectId, ref: 'User' },
		rol_description: { type: String, default: '' },
		rol_grants: [
			{
				resourceId: {
					type: Schema.Types.ObjectId,
					ref: 'Resource',
					required: true
				},
				actions: [{ type: String, required: true }],
				attributes: { type: String, default: '*' },
				isRoot: { type: Boolean, default: false }
			}
		],
		rol_parents: [{ _id: { type: Schema.Types.ObjectId, ref: DOCUMENT_NAME } }],
		rol_isRoot: { type: Boolean, default: false }
	},
	{
		timestamps: true,
		collection: COLLECTTION_NAME
	}
);
roleSchema.pre('save', async function (next) {
	if (!this.rol_slug) {
		this.rol_slug = `rui${Date.now()}${Math.floor(Math.random() * 10 + 1)}`;
	}

	next();
});
module.exports = model(DOCUMENT_NAME, roleSchema);
