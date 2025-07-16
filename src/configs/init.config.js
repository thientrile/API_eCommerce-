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
		mongo: {
			uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shopDev'
		},
		redis: {
			url: process.env.REDIS_URL || 'redis://default:ROaBImRbyeUbvIbGSkghIWjFngGEKLHC@ballast.proxy.rlwy.net:50811'
		}
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
			uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shopDev'
		},
		redis: {
			url: process.env.REDIS_URL || 'redis://default:ROaBImRbyeUbvIbGSkghIWjFngGEKLHC@ballast.proxy.rlwy.net:50811'
		}
	}
};

const pro = {
	app: {
		port: process.env.PORT || 3000,
		name: process.env.API_NAME || 'pro-api',
		version: process.env.API_VERSION || 'V1'
	},
	db: {
		mongo: {
			uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shopPro'
		},
		redis: {
			url: process.env.REDIS_URL || 'redis://default:ROaBImRbyeUbvIbGSkghIWjFngGEKLHC@ballast.proxy.rlwy.net:50811'
		}
	}
};
const config = { pro, dev, development };
const env = process.env.NODE_ENV || 'development';



module.exports = config[env];
