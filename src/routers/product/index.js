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
  getlistSpuSeller,
  getProductDetail,
} = require("../../controllers/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authertication } = require("../../auth/utils.auth");
const { validateSchema } = require("../../middlewares/joi.middleware");
const SpuService = require("../../services/spu.service");
router.use(authertication);

//category
router.post("/category", asyncHandler(newCategory));
router.patch("/category", asyncHandler(updateCategory));
router.get("/categories", asyncHandler(getListCategory));
//brand
router.post("/brand", asyncHandler(newBrand));
router.get("/brands", asyncHandler(getListBrand));
// product
router.post("/_new", asyncHandler(newProduct));
router.put("/_edit/:id", asyncHandler(updateProduct));
router.patch("/status/:id",asyncHandler(statusProduct));
router.get("/_seller", asyncHandler(getlistSpuSeller));
router.get("/_detail/:id", asyncHandler(getProductDetail));
module.exports = router;
