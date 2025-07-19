/** @format */

'use strict';
const { AuthFailureError, NotAcceptableError } = require('../core/error.response');
const JWT = require('jsonwebtoken');
const HEADERS = require('../utils/header');
const cors = require('cors');
const {
	findByClientId,
	deleteByClientId
} = require('../services/keyToken.services');
const { tk_checkKeyTokenVerify } = require('../repositories/keyToken.repo');
const { getData, setData } = require('../services/redis.service');
const createTokenPair = async (payload, publicKey, privateKey) => {
	// accessToken
	const accessToken = await JWT.sign(payload, privateKey, {
		algorithm: 'RS256',
		expiresIn: '2 days',
		header: {
			typ: 'JWT',
			alg: 'RS256'
		}
	});

	const refreshToken = await JWT.sign(payload, privateKey, {
		algorithm: 'RS256',
		expiresIn: '14 days',
		header: {
			typ: 'JWT',
			alg: 'RS256'
		}
	});

	JWT.verify(accessToken, publicKey, (err) => {
		if (err) throw new AuthFailureError(' Invalid User');
	});
	return { accessToken, refreshToken };
};
const authertication = async (req, res, next) => {
	try {
		//check clientID
		const clientId = req.headers[HEADERS.CLIENT_ID];
		//get accecess token
		if (!clientId) throw new AuthFailureError('Token has expired');
		let keyStore = (await tk_checkKeyTokenVerify(clientId))[0];
		if (!keyStore) throw new NotAcceptableError('Token has expired');

		const userId = keyStore.tk_userId.valueOf();
		// verify refresh token
		const refreshToken = req.headers[HEADERS.REFRESHTOKEN];
		if (refreshToken) {
			if (keyStore.tk_refreshTokensUsed.includes(refreshToken)) {
				await deleteByClientId(clientId);
				throw new AuthFailureError('Refresh Token has expired');
			}
			return JWT.verify(refreshToken, keyStore.tk_publicKey, (err, decoded) => {
				if (err) {
					throw new AuthFailureError('Refresh Token has expired');
				}
				if (userId !== decoded._id)
					throw new AuthFailureError(' Invalid User ');
				req.keyStore = keyStore;
				req.user = decoded;
				req.refreshToken = refreshToken;

				next();
			});
		}
		// verify acccesstoken
		const accessToken = req.headers[HEADERS.AUTHORIZATION];
		if (!accessToken) throw new AuthFailureError('Invalid Token');

		return JWT.verify(accessToken, keyStore.tk_publicKey, (err, decoded) => {
			if (err) {
				throw new AuthFailureError(' Token has expired');
			}

			if (userId !== decoded._id) throw new AuthFailureError(' Invalid User');
			req.keyStore = keyStore;
			req.user = decoded;
			next();
		});
	} catch (err) {
		return next(err);
	}
};

module.exports = { createTokenPair, authertication };
