/** @format */

'use strict';
const { SuccessReponse } = require('../core/success.response');
const { uploadImage,uploadImages,uploadFile } = require('../services/upload.service');

const CtrlUploadingImageUrl = async (req, res, next) => {
	req.body.foderName = 'product';
	new SuccessReponse({
		message: 'Image uploaded successfully',
		metadata: await uploadImage(req.user._id, req.body)
	}).send(res);
};
const CtrlUploadingImageLocal = async (req, res, next) => {
	const { file } = req;
	if (!file) {
		throw new BadRequestError('Please upload an image');
	}
	new SuccessReponse({
		message: 'Image uploaded successfully',
		metadata: await uploadImage(req.user._id, { path: file.path })
	}).send(res);
};
const CtrlUploadingImagesLocal = async (req, res, next) => {
	const { files } = req;
	if (!files) {
		throw new BadRequestError('Please upload an image');
	}
	new SuccessReponse({
		message: 'Image uploaded successfully',
		metadata: await uploadImages(req.user._id, { files })
	}).send(res);
};
const CtrlUploadingFile = async (req, res, next) => {
	const { file } = req;
	if (!file) {
		throw new BadRequestError('Please upload an image');
	}
	new SuccessReponse({
		message: 'Image uploaded successfully',
		metadata: await uploadFile(req.user._id, { file })
	}).send(res);
};
module.exports = {
	CtrlUploadingImageUrl,
	CtrlUploadingImageLocal,
  CtrlUploadingImagesLocal,
	CtrlUploadingFile
};
