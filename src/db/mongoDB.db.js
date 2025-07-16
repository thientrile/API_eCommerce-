/** @format */

'use strict';

const mongoose = require('mongoose');
const { countConnect } = require('../helpers/checkConnect.helpers');
const config = require('../configs/init.config');

// Use configuration from init.config.js
const mongoUri = config.db.mongo.uri;

class DatabaseClass {
	constructor() {
		this.connect();
	}
	async connect() {
		// if (nodeEnv === 'dev') {
		// 	mongoose.set('debug', { color: true });
		// }

		mongoose
			.connect(mongoUri)
			.then((_) => {
				console.log(`connecting mongoDB - connecting Status: Connected`);
				console.log(`MongoDB URI: ${mongoUri.replace(/\/\/.*@/, '//*****@')}`); // Hide credentials in logs
				countConnect();
				clearTimeout(this.ErrorTimeOut);
			})
			.catch((err) => {
				console.error('Error Connect MongoDB:', err.message);
				console.error('Automatically connect after 5 seconds');
				this.ErrorTimeOut = setTimeout(() => {
					this.connect();
				}, 5000);
			});
	}
	static getInstance() {
		if (!DatabaseClass.instance) {
			DatabaseClass.instance = new DatabaseClass();
		}
		return DatabaseClass.instance;
	}
}
const instanceMongoDB = DatabaseClass.getInstance();
module.exports = instanceMongoDB;
