"use strict";

const Joi = require("joi");
const { grantAccess } = require("../middlewares/rbac.middleware");
const { getAmoutDiscountCodes } = require("./discount.service");
const { filterConvert, convertToObjectIdMongoose } = require("../utils");
const { checkExistingCart } = require("../repositories/cart.repo");
const { BadRequestError } = require("../core/error.response");
const { checkExistWarehouse } = require("../repositories/warehouse.repo");
const { acquireLock, releaseLock } = require("./redis.service");

const checkoutReview = async (userId, payload) => {
  const grants = await grantAccess(userId, "readOwn", "checkout");
  // check cart exits
  const checkCartExits = await checkExistingCart({
    cart_userId: convertToObjectIdMongoose(userId),
    cart_state: "active",
    _id: payload.cartId,
  });
  if (!checkCartExits) {
    throw new BadRequestError("Cart not found");
  }
  // check warehouse exits
  const checkWareExist = await checkExistWarehouse({
    _id: convertToObjectIdMongoose(payload.shippingAddressId),
    ware_userId: convertToObjectIdMongoose(userId),
  });
  if (!checkWareExist) {
    throw new BadRequestError("shiping address not found");
  }
  const result = {};
  result.shipingAddress = checkWareExist.ware_address;
  result.totalDiscount = 0;
  result.items = [];
  result.totalOrder = 0;
  result.feeShipping = 0;
  for (const i in payload.items) {
    const product = await getAmoutDiscountCodes(userId, payload.items[i]);
    if (product.products.length !== payload.items[i].products.length) {
      throw new BadRequestError("Please check your order list again.");
    }
    result.totalOrder += product.total;
    result.totalDiscount += product.discount;

    result.items.push(product);
  }
  result.totalCheckOut =
    result.totalOrder - result.totalDiscount - result.feeShipping;
  return filterConvert(result, grants);
};
const orderByUser = async (userId, payload) => {
  await grantAccess(userId, "createOwn", "order");

  const { items } = await checkoutReview(userId, payload);
  const products = items.flatMap((item) => item.products);
  console.log("🚀 ~ orderByUser ~ products:", products.length);
  const acquireLockProduct = [];
  for (const product of products) {
    const { sku_id, quantity } = product;
    const keyLock = await acquireLock({
      sku_id,
      quantity,
      cartId: payload.cartId,
    });
    acquireLockProduct.push(!!keyLock);
    if (keyLock) {
      await releaseLock(keyLock);
    }
  }
  if (acquireLockProduct.includes(false)) {
    throw new BadRequestError("Product is out of stock");
  }
};
module.exports = {
  checkoutReview,
  orderByUser,
};
