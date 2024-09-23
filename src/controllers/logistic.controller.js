"use strict";
const { SuccessReponse, CREATED } = require("../core/success.response");
const {
  editWare,
  createWare,
  getListWarehouse,
  deleteWarehouse,
  setDefaultWarehouse,
} = require("../services/warehouse.service");
const {importInventory, exportInventory} = require("../services/inventory.service");

const createWarehouse = async (req, res, next) => {
  new CREATED({
    message: "Warehouse created successfully",
    metadata: await createWare(req.user._id, req.body),
  }).send(res);

};

const updateWarehouse = async (req, res, next) => {
  new SuccessReponse({
    message: "Warehouse updated successfully",
    metadata: await editWare(req.user._id, req.params.id, req.body),
  }).send(res);
};
const getListWare = async (req, res, next) => {
  new SuccessReponse({
    message: "List Get warehouse list successfully",
    metadata: await getListWarehouse(
      req.user._id,
      req.query.limit,
      req.query.page
    ),
  }).send(res);
};
const deleteWare = async (req, res, next) => {
  new SuccessReponse({
    message: "Warehouse deleted successfully",
    metadata: await deleteWarehouse(req.user._id, req.params.id),
  }).send(res);
};
const setDefaultWare = async (req, res, next) => {
  new SuccessReponse({
    message: "Warehouse update successfully",
    metadata: await setDefaultWarehouse(req.user._id, req.params.id),
  }).send(res);
};


const importInv= async (req, res, next) => {
  new SuccessReponse(
      {
        message:"Imported goods successfully",
        metadata: await importInventory(req.user._id,req.body)
      }
  ).send(res)
}
const exportInv= async (req,res,next)=>{
  new SuccessReponse(
      {
        message:"Exported goods successfully",
        metadata: await exportInventory(req.user._id,req.body)
      }).send(res)
}
module.exports = {
  createWarehouse,
  updateWarehouse,
  getListWare,
  deleteWare,
  setDefaultWare,
  importInv,
  exportInv
};
