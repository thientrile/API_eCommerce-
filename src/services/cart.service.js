"use strict";

const CartModel = require("../models/cart.model");
const { BadRequestError } = require("../core/error.response");
const { grantAccess } = require("../middlewares/rbac.middleware");

const addToCart = async (userId, data) => {
  const grants = await grantAccess(userId, "createOwn", "cart");



};
