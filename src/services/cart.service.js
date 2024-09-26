"use strict";

const CartModel = require("../models/cart.model");
const { BadRequestError } = require("../core/error.response");
const { grantAccess } = require("../middlewares/rbac.middleware");
const { checkExistingCart } = require("../repositories/cart.repo");
const {
  filterConvert,
  convertToObjectIdMongoose,
  removePrefixFromKeys,
} = require("../utils");
const { checkSpuExistBySpuId } = require("../repositories/spu.repo");
const spuModel = require("../models/spu.model");
const { checkSkuExist } = require("../repositories/sku.repo");
const Joi = require("joi");

const addToCart = async (userId, payload) => {
  //  validate payload
  const validatePayload = Joi.object({
    shopId: Joi.string().required(),
    sku_id: Joi.string().required(),
    quantity: Joi.number().required(),
  });
  const { error } = validatePayload.validate(payload);
  if (error) {
    throw new BadRequestError(error.details[0].message);
  }

  //   check permission
  const grants = await grantAccess(userId, "createOwn", "cart");
  const foundCart = await checkExistingCart({
    cart_userId: convertToObjectIdMongoose(userId),
    cart_state: "active",
  });

  if (!foundCart) {
    const cart_item =
      payload.quantity > 0
        ? {
            shopId: convertToObjectIdMongoose(payload.shopId),
            products: {
              sku_id: payload.sku_id,
              quantity: payload.quantity,
            },
          }
        : [];
    const newCart = await CartModel.create({
      cart_userId: convertToObjectIdMongoose(userId),
      cart_items: cart_item,

      cart_count: payload.quantity,
    });
    const dataRemovePrefix = removePrefixFromKeys(newCart.toObject(), "cart_");

    return filterConvert(dataRemovePrefix, grants);
  } else {
    //  find index of shop in cart
    const shopIndex = foundCart.cart_items.findIndex((item) =>
      item.shopId.equals(convertToObjectIdMongoose(payload.shopId))
    );
    if (shopIndex > -1) {
      // find index of product in shop
      const productIndex = foundCart.cart_items[shopIndex].products.findIndex(
        (item) => item.sku_id === payload.sku_id
      );

      if (productIndex > -1) {
        foundCart.cart_count -=
          foundCart.cart_items[shopIndex].products[productIndex].quantity;
        // update quantity of product
        if (payload.quantity > 0) {
          foundCart.cart_items[shopIndex].products[productIndex].quantity =
            payload.quantity;
        } else {
          foundCart.cart_items[shopIndex].products.splice(productIndex, 1);
          if (foundCart.cart_deleted_items) {
            foundCart.cart_deleted_items.push(payload.sku_id);
          }
        }
        if (foundCart.cart_items[shopIndex].products.length === 0) {
          foundCart.cart_items.splice(shopIndex, 1);
        }
      } else if (payload.quantity > 0) {
        // add new product to shop
        foundCart.cart_items[shopIndex].products.push({
          sku_id: payload.sku_id,
          quantity: payload.quantity,
        });
      }
    } else if (payload.quantity > 0) {
      foundCart.cart_items.push({
        shopId: convertToObjectIdMongoose(payload.shopId),
        products: {
          sku_id: payload.sku_id,
          quantity: payload.quantity,
        },
      });
    }
    foundCart.cart_count += payload.quantity;
    await foundCart.save();
    const dataRemovePrefix = removePrefixFromKeys(
      foundCart.toObject(),
      "cart_"
    );
    return filterConvert(dataRemovePrefix, grants);
  }
};
const getListUserCart = async (userId) => {
  const grants = await grantAccess(userId, "readOwn", "cart");
  const foundCart = await checkExistingCart({
    cart_userId: convertToObjectIdMongoose(userId),
    cart_state: "active",
  });
  if (!foundCart) {
    return filterConvert({}, grants);
  }
  const dataRemovePrefix = removePrefixFromKeys(foundCart.toObject(), "cart_");
  return filterConvert(dataRemovePrefix, grants);
};

module.exports = { addToCart, getListUserCart };
