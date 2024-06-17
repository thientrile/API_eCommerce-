"use strict";

const { SuccessReponse, CREATED } = require("../core/success.response");

const {
  createCategory,
  editCategory,
  categoryList,
} = require("../services/category.service");
const { createBrand, brandList } = require("../services/brand.service");
const { spuService } = require("../services/spu.service");
//category
/**
 * Create a new category.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the category is created.
 */
const newCategory = async (req, res, next) => {
  new CREATED({
    message: "Category created successfully",
    metadata: await createCategory(req.user._id, req.body),
  }).send(res);
};
const updateCategory = async (req, res, next) => {
  new SuccessReponse({
    message: "Category updated successfully",
    metadata: await editCategory(req.user._id, req.body),
  }).send(res);
};
const getListCategory = async (req, res, next) => {
  new SuccessReponse({
    message: "list category successfully",
    metadata: await categoryList(req.user._id),
  }).send(res);
};

//brand
const newBrand = async (req, res, next) => {
  new CREATED({
    message: "Brand created successfully",
    metadata: await createBrand(req.user._id, req.body),
  }).send(res);
};
const getListBrand= async (req, res, next) => {
  new SuccessReponse({
    message: "list brand successfully",
    metadata: await brandList(req.user._id,req.query.limit,req.query.offset,req.query.search,req.query.cate_id),
  }).send(res);
}


//product
const newProduct = async (req,res,next)=>{
  new SuccessReponse({
    message: "list brand successfully",
    metadata: await new spuService().createSpu(req.user._id,req.body),
  }).send(res);
}
module.exports = { newProduct,getListBrand,newBrand, newCategory, updateCategory, getListCategory };
