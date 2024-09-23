"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const {
  createWarehouse,
  updateWarehouse,
  getListWare,
  deleteWare,
  setDefaultWare, importInv,
  exportInv,
} = require("../../controllers/logistic.controller");
const { authertication } = require("../../auth/utils.auth");
const router = express.Router();
router.use(authertication);

router.post("/warehouse", asyncHandler(createWarehouse));
router.put("/warehouse/:id", asyncHandler(updateWarehouse));
router.get("/warehouse", asyncHandler(getListWare));
router.delete("/warehouse/:id", asyncHandler(deleteWare));
router.patch("/warehouse/:id", asyncHandler(setDefaultWare));
router.post("/inventory/_import",asyncHandler(importInv))
router.patch("/inventory/_export",asyncHandler(exportInv))
module.exports = router;
