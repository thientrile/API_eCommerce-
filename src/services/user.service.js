/** @format */

'use strict';
const { number } = require('joi');
const { grantAccess } = require('../middlewares/rbac.middleware');
const userModel = require('../models/user.model');
const {
	removePrefixFromKeys,
	filterConvert,
	convertToObjectIdMongoose
} = require('../utils');

const getUserInfoById = async (userId, id = 0) => {
	const grants = await grantAccess(userId, 'readAny', 'Users');
	const result = await userModel.findOne({ usr_id: id }).exec();
	const removePreFix = removePrefixFromKeys(result.toObject(), 'usr_');
	return filterConvert(removePreFix, grants);
};

const getUserInfo = async (userId) => {
	const grants = await grantAccess(userId, 'readOwn', 'Users');
	const result = await userModel
		.findOne({ _id: convertToObjectIdMongoose(userId) })
		.populate('usr_role', 'rol_name')
		.exec();
	
	const removePreFix = removePrefixFromKeys(result.toObject(), 'usr_');
	return filterConvert(removePreFix, grants);
};

module.exports = {
	getUserInfoById,
	getUserInfo
};
