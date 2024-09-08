"use strict";

const { SuccessReponse } = require("../core/success.response");
const {
  signUP,
  login,
  handlerRefreshToken,
  logout,
} = require("../services/access.service");

const signup = async (req, res, next) => {

  new SuccessReponse({
    message: "User created successfully",
    metadata: await  signUP({ role:  req.query.role||'user', ...req.body }),
  }).send(res);
};
const logIn = async (req, res, next) => {
  new SuccessReponse({
    message: "User log in successfully",
    metadata: await login({ ...req.body }),
  }).send(res);
};
const refretshToken = async (req, res, next) => {
  new SuccessReponse({
    message: "User refretsh token successfully",
    metadata: await handlerRefreshToken(
      req.keyStore,
      req.user,
      req.refreshToken
    ),
  }).send(res);
};
const logOut = async (req, res, next) => {

  new SuccessReponse({
    message: "User log out successfully",
    metadata: await logout(req.keyStore),
  }).send(res);
};
module.exports = {
  signup,
  logIn,
  refretshToken,
  logOut,
};
