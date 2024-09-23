'use strict'

const warehouseModel = require("../models/warehouse.model");

const checkExistWarehouse = async (condition) => {
    return await warehouseModel.findOne(condition).exec();
}
module.exports = { checkExistWarehouse };