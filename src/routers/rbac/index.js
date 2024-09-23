"use strict";

const express = require("express");
const router = express.Router();
const {
  newRole,
  newResource,
  CtrlListGrants,
  listResource,
  addGrant
} = require("../../controllers/rbac.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authertication } = require("../../auth/utils.auth");

router.use(authertication)
router.post(
  "/role",

  asyncHandler(newRole)
);
router.post("/resource", asyncHandler(newResource));
router.patch("/grants",asyncHandler(addGrant))
router.get("/grants", asyncHandler(CtrlListGrants));
router.get("/resources", asyncHandler(listResource));

// admin

module.exports = router;
