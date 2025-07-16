/** @format */

'use strict';
const { fs } = require('fs');
const cloudinary = require('../configs/cloudinary.config');
const { randomId } = require('../utils');
const { BadRequestError } = require('../core/error.response');
// upload form url

const uploadImage = async (userId, payload) => {
	try {
		const { path, folderName } = payload;

		const result = await cloudinary.uploader.upload(path, {
			folder: `${userId}/${folderName || 'images'}`,
			public_id: randomId()
		});
		return result;
	} catch (err) {
		console.error('Error uploading image::', err);
		throw new BadRequestError('Error uploading image');
	}
};

const uploadImages = async (userId, payload) => {
	if (!payload.files.length) {
		return Promise.reject(new BadRequestError('Please upload an image'));
	}
	

	const uploadPromises = payload.files.map((file) =>
		cloudinary.uploader.upload(file.path, {
			folder: `${userId}/images`,
			public_id: randomId()
		})
	);

	return Promise.all(uploadPromises)
		.then((results) => results)
		.catch((err) => {
			console.error('Error uploading image::', err);
			throw new BadRequestError('Error uploading image');
		});
};
const uploadFile = async (userId, payload) => {
	const { file } = payload;
	const dir = `./uploads/${userId}/${randomId()}_${file.originalname}`;
	const readStream = fs.createReadStream(file.path);
	const writeStream = fs.createWriteStream(dir);
	readStream.pipe(writeStream);
	writeStream.on('finish', () => readStream.close());
	return dir;
};
module.exports = { uploadImage, uploadImages ,uploadFile};
