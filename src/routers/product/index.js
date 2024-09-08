"use strict";

const express = require("express");
const router = express.Router();
const {
  newCategory,
  updateCategory,
  getListCategory,
  newBrand,
  getListBrand,
  newProduct,
  updateProduct,
  statusProduct,
} = require("../../controllers/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authertication } = require("../../auth/utils.auth");
router.use(authertication);

//category
router.post("/category", asyncHandler(newCategory));
router.patch("/category", asyncHandler(updateCategory));
router.get("/categories", asyncHandler(getListCategory));
//brand
router.post("/brand", asyncHandler(newBrand));
router.get("/brands", asyncHandler(getListBrand));
// product
router.post("", asyncHandler(newProduct));
router.put("", asyncHandler(updateProduct));
router.patch("/productStatus",asyncHandler(statusProduct));

module.exports = router;
