"use strict";
const { AuthFailureError } = require("../core/error.response");
const JWT = require("jsonwebtoken");
const HEADERS = require("../utils/header");
const { findByClientId } = require("../services/keyToken.services");
const createTokenPair = async (payload, publicKey, privateKey) => {
  // accessToken
  const accessToken = await JWT.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "7 days",
  });

  const refreshToken = await JWT.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "14 days",
  });

  JWT.verify(accessToken, publicKey, (err) => {
    if (err) throw new AuthFailureError(" Invalid User");
  });
  return { accessToken, refreshToken };
};
const authertication = async (req, res, next) => {
  try {
    //check clientID
    const clientId = req.headers[HEADERS.CLIENT_ID];
    //get accecess token
    if (!clientId) throw new AuthFailureError(" Invalid client id");
    const keyStore = await findByClientId(clientId);
    if (!keyStore) throw new AuthFailureError(" Invalid client id");
    const userId = keyStore.
    tk_userId
    .valueOf();
    // verify refresh token
    const refreshToken = req.headers[HEADERS.REFRESHTOKEN];
    if (refreshToken) {
   return  JWT.verify(
        refreshToken,
        keyStore.tk_privateKey,
        (err, decoded) => {
          if (err) {
            throw new AuthFailureError(" Refresh Token has expired");
          }
          if (userId !== decoded._id)
            throw new AuthFailureError(" Invalid User ");
          req.keyStore = keyStore;
          req.user = decoded;
          req.refreshToken = refreshToken;
          next();
        }
      );
    }
    // verify acccesstoken
    const accessToken = req.headers[HEADERS.AUTHORIZATION];
    if(!accessToken)
    if (accessToken !== keyStore.tk_accessToken) {
      throw new AuthFailureError(" Invalid Token");
    }

 return   JWT.verify(accessToken, keyStore.tk_publicKey, (err, decoded) => {
      if (err) {
        throw new AuthFailureError(" Token has expired");
      }

      if (userId !== decoded._id)
        throw new AuthFailureError(" Invalid User");
      req.keyStore = keyStore;
      req.user = decoded;
      next();
    });
  } catch (err) {
    return next(err);
  }
 
};

module.exports = { createTokenPair, authertication };
