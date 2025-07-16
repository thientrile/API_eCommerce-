"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { signup,logIn,refretshToken,logOut, ctrGetInfobyid, ctrGetInfo } = require("../../controllers/user.controller");
const { authertication } = require("../../auth/utils.auth");
router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(logIn));
router.use(authertication)
router.get("/refresh", asyncHandler(refretshToken));
router.get("/logout", asyncHandler(logOut));
router.get("/profile/:id", asyncHandler(ctrGetInfobyid));
router.get("/profile", asyncHandler(ctrGetInfo));
module.exports = router;
