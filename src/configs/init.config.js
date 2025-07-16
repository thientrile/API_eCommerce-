/** @format */

'use strict';

const { version } = require('os');

const dev = {
	app: {
		port: process.env.DEV_APP_PORT || 3055,
		name: process.env.DEV_API_NAME || 'dev-api',
		version: process.env.DEV_API_VERSION || 'V1'
	},
	db: {
		host: process.env.DEV_DB_HOST || 'localhost',
		port: process.env.DEV_DB_PORT || 27017,
		name: process.env.DEV_DB_NAME || 'shopDev'
	},
	redis: {
		url: process.env.REDIS_URL || 'redis://default:ROaBImRbyeUbvIbGSkghIWjFngGEKLHC@ballast.proxy.rlwy.net:50811'
	}
	// elastichsearch:{

	// }
};
const development = {
	app: {
		port: process.env.DEV_APP_PORT || 3055,
		name: process.env.DEV_API_NAME || 'dev-api',
		version: process.env.DEV_API_VERSION || 'V1'
	},
	db: {
		mongo: {
			host: 'localhost',
			port: 27017,
			name: 'shopDev'
		},
		redis: {
			url: 'redis://default:ROaBImRbyeUbvIbGSkghIWjFngGEKLHC@ballast.proxy.rlwy.net:50811'
		}
	}

};

const pro = {
	app: {
		port: process.env.PRO_AP_PORT || 3000,
		name: process.env.PRO_API_NAME || 'pro-api',
		version: process.env.PRO_API_VERSION || 'V1'
	},
	db: {
		host: process.env.PRO_DB_HOST || 'localhost',
		port: process.env.PRO_DB_PORT || '27017',
		name: process.env.PRO_DB_NAME || 'shopPro'
	},
	redis: {
		url: process.env.REDIS_URL || 'redis://default:ROaBImRbyeUbvIbGSkghIWjFngGEKLHC@ballast.proxy.rlwy.net:50811'
	}
};
const config = { pro, dev, development };
const env = process.env.NODE_ENV || 'development';
console.log('NODE_ENV::: ',env);



module.exports = config[env];
