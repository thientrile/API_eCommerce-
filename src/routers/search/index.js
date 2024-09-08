"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authertication } = require("../../auth/utils.auth");
const { forShop } = require("../../controllers/search.controller");

router.use(authertication)
router.get("/shop", asyncHandler(forShop));

module.exports = router;
