"use strict";
const { SuccessReponse, CREATED } = require("../core/success.response");
const {
  addToCart,
  updateQuantityCart,
  getListUserCart,
} = require("../services/cart.service");
const { checkoutReview, orderByUser } = require("../services/checkout.service");
const {
  createDiscount,
  getAllDiscountsCodeWithProducts,
  getAllDiscountCodeByShop,
  getAmoutDiscountCode,
} = require("../services/discount.service");

const newDiscount = async (req, res, next) => {
  new CREATED({
    message: "Discount created successfully",
    metadata: await createDiscount(req.user._id, req.body),
  }).send(res);
};
const getAllProductBydiscountCode = async (req, res, next) => {
  new SuccessReponse({
    message: "All discount codes with products",
    metadata: await getAllDiscountsCodeWithProducts(req.user._id, req.body),
  }).send(res);
};
const GetAllDiscountCodeByShop = async (req, res, next) => {
  new SuccessReponse({
    message: "All discount codes by shop",
    metadata: await getAllDiscountCodeByShop(req.user._id, req.query),
  }).send(res);
};
const GetAmoutAfterDiscount = async (req, res, next) => {
  new SuccessReponse({
    message: "Amout after discount",
    metadata: await getAmoutDiscountCode(req.user._id, req.body),
  }).send(res);
};

const CrlAddToCart = async (req, res, next) => {
  new SuccessReponse({
    message: "Cart Updated successfully",
    metadata: await addToCart(req.user._id, req.body),
  }).send(res);
};
const CtrlGetCartByUser = async (req, res, next) => {
  new SuccessReponse({
    message: "Get cart of user successfully",
    metadata: await getListUserCart(req.user._id),
  }).send(res);
};
const CtrlCheckReviewOrder = async (req, res, next) => {
  new SuccessReponse({
    message: "Check review order",
    metadata: await checkoutReview(req.user._id, req.body),
  }).send(res);
};
const CtrlOrderByUser = async (req, res, next) => {
  new SuccessReponse({
    message: "Order by user",
    metadata: await orderByUser(req.user._id, req.body),
  }).send(res);
};
module.exports = {
  newDiscount,
  getAllProductBydiscountCode,
  GetAllDiscountCodeByShop,
  GetAmoutAfterDiscount,
  CrlAddToCart,
  CtrlGetCartByUser,
  CtrlCheckReviewOrder,
  CtrlOrderByUser,
};
