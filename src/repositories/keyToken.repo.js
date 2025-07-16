/** @format */

'use strict';

const keyTokenModel = require('../models/keytoken.model');
const { converToUUIDMongoose } = require('../utils');

const tk_findOne = async (filter) => {
	return keyTokenModel.findOne(filter).lean();
};
const tk_deleteOne = async (filter) => {
	return keyTokenModel.deleteOne(filter);
};
const tk_updateOne = async (filter, data) => {
	const option = { new: true, upsert: true };
	return keyTokenModel.findOneAndUpdate(filter, data, option).exec();
};
const tk_checkKeyTokenVerify = async (clientId) => {
	return keyTokenModel.aggregate([
		{
			$match: {
				tk_clientId: converToUUIDMongoose(clientId)
			}
		},
		{
			$lookup: {
				from: 'Users',
				localField: 'tk_userId',
				foreignField: '_id',
				as: 'user'
			}
		},
		{
			$unwind: '$user'
		},
		{
			$project: {
				_id: 0,
				tk_clientId: 1,
				tk_userId: 1,
				tk_publicKey: 1,
				tk_refreshTokensUsed: 1,
				status: '$user.usr_status'
			}
		},
		{
			$match: {
				status: 'active'
			}
		}
	]);
};
module.exports = {
	tk_findOne,
	tk_deleteOne,
	tk_updateOne,
	tk_checkKeyTokenVerify
};
