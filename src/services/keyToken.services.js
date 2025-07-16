/** @format */

'use strict';

const keytokenModel = require('../models/keytoken.model');
const { randomUUID } = require('crypto');
const {
	getErrorMessageMongose,
	converToUUIDMongoose,
	convertToObjectIdMongoose
} = require('../utils/index');
const {
	tk_findOne,
	tk_deleteOne,
	tk_updateOne
} = require('../repositories/keyToken.repo');
const { setData } = require('./redis.service');
/**
 *
 * @param {String} userId
 * @param {String} publicKey
 * @param {String} token
 * @param {String} privateKey
 * @todo   create a key token for some deviect
 * @returns {clientId,token}
 */

const createKeyToken = async ({ userId, publicKey }) => {
	const tokens = await keytokenModel.create({
		tk_userId: userId,
		tk_publicKey: publicKey
	});

	return tokens ? { clientId: tokens.tk_clientId } : null;
};

const findByClientId = async (clientId) => {
	return tk_findOne({ tk_clientId: converToUUIDMongoose(clientId) });
};
const deleteByClientId = async (clientId) => {
	return tk_deleteOne({ tk_clientId: converToUUIDMongoose(clientId) });
};
const updateById = async (id, data) => {
	return tk_updateOne(
		{
			_id: convertToObjectIdMongoose(id)
		},
		data
	);
};
module.exports = {
	createKeyToken,
	findByClientId,
	deleteByClientId,
	updateById
};
