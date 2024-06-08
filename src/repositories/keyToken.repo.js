'use strict';

const keyTokenModel= require('../models/keytoken.model')

const tk_findOne = async (filter) => {
    return keyTokenModel.findOne(filter).lean()
}
const tk_deleteOne = async (filter) => {
    return keyTokenModel.deleteOne(filter)
}
const tk_updateOne = async (filter, data) => {
    const option={new:true,upsert:true}
    return keyTokenModel.findOneAndUpdate(filter, data,option)
}
module.exports = {
    tk_findOne, 
    tk_deleteOne, tk_updateOne
}