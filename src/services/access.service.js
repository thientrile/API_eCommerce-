/** @format */

'use strict';
const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const {
	isValidation,
	getErrorMessageMongose,
	omitInfoData,
	removePrefixFromKeys,
	addPrefixToKeys
} = require('../utils/index');
const { generateKeyPairSync } = require('node:crypto');
const { getId } = require('../repositories/role.repo');
const { ForbiddenError } = require('../core/error.response');
const {
	createKeyToken,
	deleteByClientId,
	findByClientId,
	updateById
} = require('./keyToken.services');
const { createTokenPair } = require('../auth/utils.auth');
const {
	userDeleteById,
	userFindByusername
} = require('../repositories/user.repo');
const { AuthFailureError } = require('../core/error.response');
const { setData } = require('./redis.service');

// refetch token
/**
 * Handles the refresh token logic.
 *
 * @param {Object} keyStore - The key store object.
 * @param {Object} user - The user object.
 * @param {string} refreshToken - The refresh token.
 * @returns {Promise<Object>} - A promise that resolves to an object containing uniqueId, username, and tokens.
 * @throws {AuthFailureError} - Throws an AuthFailureError if the refresh token has expired.
 */
const handlerRefreshToken = async (keyStore, user, refreshToken) => {
	const key = await findByClientId(keyStore.tk_clientId);
	const { publicKey, privateKey } = generateKeyPairSync('rsa', {
		modulusLength: 2048,
		publicKeyEncoding: {
			type: 'pkcs1',
			format: 'pem'
		},
		privateKeyEncoding: {
			type: 'pkcs1',
			format: 'pem'
		}
	});
	const [tokens] = await Promise.all([
		createTokenPair(
			{ _id: user._id, slug: user.slug, role: user.role },
			publicKey,
			privateKey
		),
		updateById(key._id, {
			$push: {
				tk_refreshTokensUsed: refreshToken // Mark as used,
			},
			tk_publicKey: publicKey,
			expiresAt: Date.now() + 1209600000
		})
	]);

	return {
		uniqueId: key.tk_clientId,
		tokens
	};
};

//login user
/**
 * Logs in a user with the provided username and password.
 * @param {Object} credentials - The user's login credentials.
 * @param {string} credentials.username - The username of the user.
 * @param {string} credentials.password - The password of the user.
 * @returns {Promise<Object>} A promise that resolves to an object containing the uniqueId, username, and tokens of the logged-in user.
 * @throws {AuthFailureError} If the user is not found or the password is incorrect.
 * @throws {AuthFailureError} If there is an error creating the token pair or saving the key token.
 * @throws {AuthFailureError} If there is an error deleting the user after a failed login attempt.
 */
const login = async ({ username, password }) => {
	const user = await userFindByusername(username);
	if (!user) {
		throw new AuthFailureError(' User is not signin');
	}
	const comparePassword = await bcrypt.compare(password, user.usr_salt);
	if (!comparePassword) {
		throw new AuthFailureError(' Password is not correct');
	}


	const { publicKey, privateKey } = generateKeyPairSync('rsa', {
		modulusLength: 2048,
		publicKeyEncoding: {
			type: 'pkcs1',
			format: 'pem'
		},
		privateKeyEncoding: {
			type: 'pkcs1',
			format: 'pem'
		}
	});

	//create token pair

	const [result, tokens] = await Promise.all([
		createKeyToken({
			userId: user._id,
			publicKey: publicKey
		}),
		createTokenPair(
			{
				_id: user._id,
				username,
				slug: user.usr_slug,
				role: user.usr_role
			},
			publicKey.toString(),
			privateKey
		)
	]);
	if (!result) {
		throw new AuthFailureError(' Unable to login account');
	}

	return {
		uniqueId: result.clientId,
		tokens
	};
};
// Sign Up user
/**
 * Signs up a user with the provided information.
 *
 * @param {Object} options - The user information.
 * @param {string} options.name - The name of the user.
 * @param {string} options.sex - The sex of the user.
 * @param {string} options.date - The date of birth of the user.
 * @param {string} options.username - The username, email, or phone number of the user.
 * @param {string} options.password - The password of the user.
 * @param {string} options.role - The role of the user.
 * @returns {Promise<Object>} A promise that resolves to an object containing the uniqueId, username, and tokens of the created user.
 * @throws {ForbiddenError} If the username or email or phone number already exists.
 * @throws {AuthFailureError} If unable to create the account.
 */
const signUP = async (payload) => {
	// hash the password
	const [passwordHash, roleId] = await Promise.all([
    await bcrypt.hash(payload.password, 10),
    await getId("rui17218138790576"),
  ]);

	// check type username
	payload.salt = passwordHash;
	payload.role = roleId;
	let userData = addPrefixToKeys(payload, 'usr_');
	if (payload.username) {
		const { username } = payload;
		if (isValidation.isEmail(username)) {
			userData.usr_email = username;
		} else if (isValidation.isPhoneNumber(username)) {
			userData.usr_phone = username;
		} else {
			userData.usr_slug = username;
		}
	}

	const user = await userModel.create(userData).catch((err) => {
		throw new ForbiddenError(
			getErrorMessageMongose(
				err,

				' Username or email or phone number already exists'
			)
		);
	});
	//create public key and private key

	const { publicKey, privateKey } = generateKeyPairSync('rsa', {
		modulusLength: 2048,
		publicKeyEncoding: {
			type: 'pkcs1',
			format: 'pem'
		},
		privateKeyEncoding: {
			type: 'pkcs1',
			format: 'pem'
		}
	});

	const [result, tokens] = await Promise.all([
		createKeyToken({
			userId: user._id,
			publicKey: publicKey
		}),
		createTokenPair(
			{ _id: user._id, slug: user.urs_slug, role: roleId },
			publicKey.toString(),
			privateKey
		)
	]);
	if (!result) {
		userDeleteById(user._id);
		throw new AuthFailureError(' Unable to create account');
	}
	return {
		uniqueId: result.clientId,
		tokens
	};
};
// logout
const logout = async (keyStore) => {
	return await deleteByClientId(keyStore.tk_clientId)
		.then(() => 1)
		.catch(() => {
			throw new AuthFailureError(' Unable to logout account');
		});
};


module.exports = { signUP, login, handlerRefreshToken, logout };
