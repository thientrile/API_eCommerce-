"use strict";

const { SuccessReponse, CREATED } = require("../core/success.response");
const { BadRequestError } = require("../core/error.response");
const {
  createCategory,
  editCategory,
  categoryList,
} = require("../services/category.service");
const { createBrand, brandList } = require("../services/brand.service");
const spuService = require("../services/spu.service");
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
/**
 * Updates the category of a product.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the category is updated successfully.
 */
const updateCategory = async (req, res, next) => {
  new SuccessReponse({
    message: "Category updated successfully",
    metadata: await editCategory(req.user._id, req.body),
  }).send(res);
};
/**
 * Retrieves a list of categories.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves to undefined.
 */
const getListCategory = async (req, res, next) => {
  new SuccessReponse({
    message: "list category successfully",
    metadata: await categoryList(req.user._id),
  }).send(res);
};

//brand
/**
 * Creates a new brand.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the brand is created successfully.
 */
const newBrand = async (req, res, next) => {
  new CREATED({
    message: "Brand created successfully",
    metadata: await createBrand(req.user._id, req.body),
  }).send(res);
};
/**
 * Retrieves a list of brands.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
const getListBrand = async (req, res, next) => {
  new SuccessReponse({
    message: "list brand successfully",
    metadata: await brandList(
      req.user._id,
      req.query.limit,
      req.query.offset,
      req.query.search,
      req.query.cate_id
    ),
  }).send(res);
};

//product
/**
 * Edit a product.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the product is edited.
 */
const newProduct = async (req, res, next) => {
  new SuccessReponse({
    message: "Created product successfully",
    metadata: await spuService.editSpu(req.user._id, req.body),
  }).send(res);
};
/**
 * Updates a product.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the product is updated.
 * @throws {BadRequestError} - If the 'id' field is not found in the request parameters.
 */
const updateProduct = async (req, res, next) => {
  try {
  
    if (!req.params.id) {
      throw new BadRequestError("The field 'id' is not found");
    }
    req.body.id = req.params.id;
    new SuccessReponse({
      message: "updated product successfully",
      metadata: await spuService.editSpu(req.user._id, req.body),
    }).send(res);
  } catch (err) {
    next(err);
  }
};

const statusProduct = async (req, res, next) => {
  new SuccessReponse({
    message: "updated product status successfully",
    metadata: await spuService.statusSpu(
      req.user._id,
      req.params.id,
      req.body.status
    ),
  }).send(res);
};
const getlistSpuSeller= async (req,res,next)=>{
  new SuccessReponse({
    message: "List product",
    metadata: await spuService.getListSeller(
      req.user._id,
      req.query.status,
      req.query.limit,
      req.query.page
    ),
  }).send(res);
}
const getProductDetail= async (req,res,next)=>{
  new SuccessReponse({
    message: "Product detail",
    metadata: await spuService.getProductDetail(
      req.user._id,
      req.params.id
    ),
  }).send(res);
}
module.exports = {
  updateProduct,
  newProduct,
  getListBrand,
  newBrand,
  newCategory,
  updateCategory,
  getListCategory,
  statusProduct,
  getlistSpuSeller,
  getProductDetail
};
