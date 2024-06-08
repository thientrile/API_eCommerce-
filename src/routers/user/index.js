"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { signup,logIn,refretshToken,logOut } = require("../../controllers/user.controller");
const { authertication } = require("../../auth/utils.auth");
router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(logIn));
router.use(authertication)
router.get("/refresh", asyncHandler(refretshToken));
router.get("/logout", asyncHandler(logOut));
module.exports = router;
