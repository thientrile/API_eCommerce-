"use strict";
const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const { isValidation, getErrorMessageMongose } = require("../utils/index");
const { generateKeyPairSync } = require("node:crypto");
const { getId } = require("../repositories/role.repo");
const { ForbiddenError } = require("../core/error.response");
const {
  createKeyToken,
  deleteByClientId,
  findByClientId,
  updateById,
} = require("./keyToken.services");
const { createTokenPair } = require("../auth/utils.auth");
const {
  userDeleteById,
  userFindByusername,
} = require("../repositories/user.repo");
const { AuthFailureError } = require("../core/error.response");

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

  if (!key || key.tk_refreshTokensUsed.includes(refreshToken)) {
    await deleteById(keyStore._id);
    throw new AuthFailureError(" Refresh Token has expired");
  }
  const tokens = await createTokenPair(
    { _id: user._id, slug: user.slug, role: user.role },
    key.tk_publicKey,
    key.tk_privateKey
  );
  return updateById(key._id, {
    $addToSet: {
      tk_refreshTokensUsed: refreshToken, // Mark as used,
    },

    tk_accessToken: tokens.accessToken,
    expiresAt: Date.now() + 1209600000,
  }).then(() => ({
    uniqueId: key.tk_clientId,
    // username: user.username,
    tokens,
  }));
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
  const foundUser = await userFindByusername(username);
  if (!foundUser) {
    throw new AuthFailureError(" User is not signin");
  }
  const comparePassword = await bcrypt.compare(password, foundUser.usr_salt);
  if (!comparePassword) {
    throw new AuthFailureError(" Password is not correct");
  }
  //create public key and private key
  const user = foundUser;
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });

  //create token pair

  const tokens = await createTokenPair(
    {
      _id: user._id,
      username,
      slug: user.usr_slug,
      role: user.usr_role,
    },
    publicKey.toString(),
    privateKey
  );

  return await createKeyToken({
    userId: user._id,
    publicKey: publicKey,
    token: tokens,
    privateKey: privateKey,
  })
    .then((result) => ({
      uniqueId: result.clientId,
      // username: username,
      tokens,
    }))
    .catch((err) => {
      userDeleteById(user._id);
      throw new AuthFailureError(" Unable to login account");
    });
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
const signUP = async ({ name, sex, date, username, password, role }) => {
  // hash the password
  const passwordHash = await bcrypt.hash(password, 10);
  // get role _id
  const roleId = await getId(role === "user" ? "user" : "seller");
  // check type username
  let userData = {
    usr_name: name,
    usr_role: roleId,
    usr_salt: passwordHash,
    usr_sex: sex,
    usr_date_of_birth: date,
  };

  if (isValidation.isEmail(username)) {
    userData.usr_email = username;
  } else if (isValidation.isPhoneNumber(username)) {
    userData.usr_phone = username;
  } else {
    userData.usr_slug = username;
  }

  const user = await userModel.create(userData).catch((err) => {
    throw new ForbiddenError(
      getErrorMessageMongose(
        err,
        userModel,
        " Username or email or phone number already exists"
      )
    );
  });
  //create public key and private key

  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });

  //create token pair
  const tokens = await createTokenPair(
    { _id: user._id, username: username, slug: user.urs_slug, role: roleId },
    publicKey.toString(),
    privateKey
  );

  return await createKeyToken({
    userId: user._id,
    publicKey: publicKey,
    token: tokens,
    privateKey: privateKey,
  })
    .then((result) => ({
      uniqueId: result.clientId,
      // username: username,
      tokens,
    }))
    .catch((err) => {
      userDeleteById(user._id);
      throw new AuthFailureError(" Unable to create account");
    });
};
// logout
const logout = async (keyStore) => {
  return await deleteByClientId(keyStore.tk_clientId)
    .then(() => 1)
    .catch(() => {
      throw new AuthFailureError(" Unable to logout account");
    });
};
module.exports = { signUP, login, handlerRefreshToken, logout };
