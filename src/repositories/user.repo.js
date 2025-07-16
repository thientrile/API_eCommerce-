/** @format */

'use strict';

const userModel = require('../models/user.model');
const { isValidation, convertToObjectIdMongoose } = require('../utils');

const checkUserExistById = async (id) => {
	return userModel.findById(id).lean();
};
const userDeleteById = async (id) => {
	return userModel.deleteOne({ _id: id });
};
const userFindByusername = async (username) => {
	let filter;
	if (isValidation.isEmail(username)) {
		filter = { usr_email: username };
	} else if (isValidation.isPhoneNumber(username)) {
		filter = { usr_phone: username };
	} else {
		filter = { usr_slug: username };
	}

	return userModel.findOne(filter).lean();
};
const getRoleNameByUserId = async (id) => {
	return userModel
		.findById(convertToObjectIdMongoose(id))
		.populate({
			path: 'usr_role',
			select: { rol_name: 1, _id: 1, rol_slug: 1 }
		})
		.select('usr_role')
		.lean();
};

module.exports = {
	checkUserExistById,
	userDeleteById,
	userFindByusername,
	getRoleNameByUserId
};
