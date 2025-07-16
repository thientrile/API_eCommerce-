/** @format */

'use strict';

const {
	grantAccess,
	checkPermission
} = require('../middlewares/rbac.middleware');
const shopModel = require('../models/shop.model');
const { addPrefixToKeys } = require('../utils');

const registerShop = async (userId, payload) => {
	const grant = await checkPermission(userId, 'createOwn', 'Shops');

	const data = addPrefixToKeys(grant.filter(payload), 'shop_');
	
	data.userId = userId;
	return shopModel.create(data);
};

module.exports = {
	registerShop
}