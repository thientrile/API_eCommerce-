/** @format */

'use strict';
const { connection } = require('mongoose');
const ResourceModel = require('../models/resource.model');
const { grantAccess } = require('../middlewares/rbac.middleware');
const { convertToObjectIdMongoose } = require('../utils');
const { BadRequestError } = require('../core/error.response');

const autoGenerateResource = async (userId) => {
	await grantAccess(userId, 'createAny', 'Resources');
	const colls = await connection.db.listCollections().toArray();
	const collectionNames = colls.map((col) => col.name);
	const createdResource = collectionNames.map(async (name) => {
		const check = await ResourceModel.findOne({ src_name: name });
		if (!check) {
			await ResourceModel.create({
				src_name: name,
				src_isRoot: true,
				src_description: `created by system`
			});
		}
	});
	await Promise.all(createdResource);
	return collectionNames;
};
const deleteResource = async (userId, payload) => {
	await grantAccess(userId, 'deleteAny', 'Resources');
	const { resourceId } = payload;
	const result = await ResourceModel.findOneAndDelete({
		_id: convertToObjectIdMongoose(resourceId)
	});
	if (!result) {
		throw new BadRequestError('Resource not found');
	}
	return true;
};
const autoGenerateResourceByModel = async (modelName,code) => {
	
}
module.exports = { autoGenerateResource, deleteResource };
