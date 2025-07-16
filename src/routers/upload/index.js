/** @format */

'use strict';
const express = require('express');

const { asyncHandler } = require("../../helpers/asyncHandler");
const { authertication } = require("../../auth/utils.auth");
const router = express.Router();
const {
  CtrlUploadingImageUrl,
  CtrlUploadingImageLocal,
  CtrlUploadingImagesLocal
} = require('../../controllers/upload.controler');
const { uploadDisk } = require('../../configs/multer.config');
router.use(authertication);
router.post('/imageUrl', asyncHandler(CtrlUploadingImageUrl));
router.post('/imageLocal',uploadDisk.single('file'), asyncHandler(CtrlUploadingImageLocal));
router.post('/imageLocals',uploadDisk.array('files',9), asyncHandler(CtrlUploadingImagesLocal));


module.exports = router;