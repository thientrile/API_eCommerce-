"use strict";

const { SuccessReponse } = require("../core/success.response");
const { searchProductOnShop } = require("../services/search.service");
const forShop = async (req, res, next) => {
  new SuccessReponse({
    message: "Searched successfully",
    metadata: await searchProductOnShop(req.user._id, req.query),
  }).send(res);
};

module.exports = {forShop};