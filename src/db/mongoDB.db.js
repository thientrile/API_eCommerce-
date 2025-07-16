/** @format */
'use strict';

const mongoose = require('mongoose');
const { countConnect } = require('../helpers/checkConnect.helpers');
const config= require("../configs/init.config");
const { schema, user, pass, host, dataName, options } = config.db.mongo;
const encodedUser = encodeURIComponent(user);
const encodedPass = encodeURIComponent(pass);

const mongoUri = `${schema}://${encodedUser}:${encodedPass}@${host}/${dataName}`;
class DatabaseClass {
	constructor() {
		this.connect();
	}

	async connect() {
		mongoose
			.connect(mongoUri,options)
			.then(() => {
				console.log('✅ MongoDB Status: Connected');
				console.log('🔗 MongoDB URI:', mongoUri.replace(/\/\/.*@/, '//*****@'));
				countConnect();
				clearTimeout(this.ErrorTimeOut);
			})
			.catch((err) => {
				console.error('❌ MongoDB Connect Error:', err.message);
				console.warn('🔁 Retrying in 5 seconds...');
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
