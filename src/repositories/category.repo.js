'use strict';
const categoryModel= require('../models/category.model');
const { converToUUIDMongoose, convertToObjectIdMongoose } = require('../utils');


const cateCheckEistById= async (id)=>{
    return await categoryModel.findById(id).lean()
}
const cateFindByIdAndUpdate= async (id, payload)=>{
    return await categoryModel.findByIdAndUpdate(convertToObjectIdMongoose(id), payload, {new: true}).lean()
}
module.exports={
    cateCheckEistById,
    cateFindByIdAndUpdate
}