"use strict"
const Cart = require("../models/cart.model");

const checkExistingCart = async (filter) => {
    return await Cart.findOne(filter).exec();
}

module.exports = {checkExistingCart};