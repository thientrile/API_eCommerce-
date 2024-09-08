"use strict";
const index_product = "product_v001";
const { searchDocument } = require("./elasticsearch.service");

const searchProductOnShop = async (userId, payload) => {
  const query = {
    index: index_product,
    body: {
      query: {
       match: { product_shopId: userId },
      },
    },
  };
  // payload.product_shopId = userId
  return await searchDocument(query);
  //search only in shop
  //return result
};
module.exports = { searchProductOnShop };
