/** @format */

'use strict';

const mongoose = require('mongoose');
const { countConnect } = require('../helpers/checkConnect.helpers');
const { db } = require('../configs/init.config');

const { host, name, port } = db.mongo;
const httpString = `mongodb://${host}:${port}/${name}`;
const username = encodeURIComponent('tori');
const password = encodeURIComponent('Tori@12345');
const clusterAddress = 'cluster0.tsw4h.mongodb.net';
const databaseName = 'shopDev';

const urlAtlas = `mongodb+srv://${username}:${password}@${clusterAddress}/${databaseName}?retryWrites=true&w=majority`;
const nodeEnv = process.env.NODE_ENV || 'dev';
class DatabaseClass {
	constructor() {
		this.connect();
	}
	async connect() {
		// if (nodeEnv === 'dev') {
		// 	mongoose.set('debug', { color: true });
		// }

		// mongoose
		// 	.connect(httpString, { maxConnecting: 1000 })
		mongoose
			.connect(urlAtlas)

			.then((_) => {
				console.log(`connecting mongoDB - connecting Status: Connnected`);
				countConnect();
				clearTimeout(this.ErrorTimeOut);
			})
			.catch((_) => {
				console.error('Error Connect', _);
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
