"use strict"
const CartModel = require("../models/cart.model");

const checkExistingCart = async (filter) => {
    return await CartModel.findOne(filter).exec();
}

module.exports = {checkExistingCart};