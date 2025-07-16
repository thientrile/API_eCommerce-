/** @format */

'use strict';
const { findByCode } = require('../services/apiKey.service');
const headers = require('../utils/header');
const {
	ForbiddenError,
	NotAcceptableError,
	RequestTimeoutErro
} = require('../core/error.response');
const { incr, getData, setData } = require('../services/redis.service');

const apiKey = async (req, res, next) => {
	try {
		const key = req.headers[headers.API_KEY];
		const keyRedis = await getData(key);
		if (keyRedis) {
			req.objKey = keyRedis;
			return next();
		}
		const apiKey = await findByCode(key);
		if (!apiKey) {
			throw new ForbiddenError(' Key is invalid');
		}
		if (!apiKey.app_status) {
			throw new ForbiddenError(' Key is invalid');
		}
		await setData(key, apiKey, 3600);
		req.objKey = apiKey;
	} catch (err) {
		return next(err);
	}
	next();
};
const permission = (permission) => {
	return (req, res, next) => {
		if (!req.objKey.app_permissions) {
			return next(new NotAcceptableError(' Permission denied'));
		}
		const validPermissions = req.objKey.app_permissions.includes(permission);

		if (!validPermissions) {
			return next(new NotAcceptableError(' Permission denied'));
		}
		req.permission = permission;
		return next();
	};
};
const limitReq = async (req, res, next) => {
	const limit = 60;
	const pathName = req._parsedUrl.pathname;
	const getIPUser =
		req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	const numberReq = await incr(`${getIPUser}:${pathName}`);
	if (numberReq > limit) {
		return next(new NotAcceptableError('Too many requests'));
	}
	return next();
};
module.exports = { apiKey, permission, limitReq };
