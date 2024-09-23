const express = require("express");
const router = express.Router();
const { authertication } = require("../../auth/utils.auth");
const { asyncHandler } = require("../../helpers/asyncHandler");
const {
  newDiscount,
  getAllProductBydiscountCode,
  GetAllDiscountCodeByShop,
  GetAmoutAfterDiscount,
} = require("../../controllers/order.controller");
router.use(authertication);
router.post("/discount/_new", asyncHandler(newDiscount));
router.get("/discount/_product", asyncHandler(getAllProductBydiscountCode));
router.get("/discount/_code", asyncHandler(GetAllDiscountCodeByShop));
router.post("/discount/_amout", asyncHandler(GetAmoutAfterDiscount));
module.exports = router;
