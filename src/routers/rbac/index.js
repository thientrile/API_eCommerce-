"use strict";

const express = require("express");
const router = express.Router();
const {
  newRole,
  newResource,
  listRole,
  listResource,
  addGrant
} = require("../../controllers/rbac.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { permission } = require("../../auth/check.auth");
const { authertication } = require("../../auth/utils.auth");
// router.use(permission("777"));
router.use(authertication)
router.post(
  "/role",

  asyncHandler(newRole)
);
router.post("/resource", asyncHandler(newResource));
router.patch("/grants",asyncHandler(addGrant))
router.get("/roles", asyncHandler(listRole));
router.get("/resources", asyncHandler(listResource));

// admin

module.exports = router;
