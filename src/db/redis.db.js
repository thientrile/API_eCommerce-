/** @format */

'use strict';

const { createClient } = require('redis');
const config = require('../configs/init.config');
const { user, pass, host } = config.db.redis;
const redisUser = encodeURIComponent(user);
const redisPass = encodeURIComponent(pass);




const redisUrl = `redis://${redisUser}:${redisPass}@${host}`;

const { RedisErrorRespoint } = require('../core/error.response');
let client = {},
	statusConnectRedis = {
		CONNECT: 'connect',
		END: 'end',
		RECONNECT: 'reconnecting',
		ERROR: 'error'
	},
	connectionTimeout;
const REDIS_CONNECT_TIMEOUT = 100000,
	REDIS_CONNECT_MESSAGE = {
		code: -99,
		message: {
			vn: 'Kết nối tới Redis thất bại',
			en: 'Connect to Redis failed'
		}
	};
const handleTimeoutError = () => {
	connectionTimeout = setTimeout(() => {
		throw new RedisErrorRespoint(
			REDIS_CONNECT_MESSAGE.message.en,
			REDIS_CONNECT_MESSAGE.code
		);
	}, REDIS_CONNECT_TIMEOUT);
};
const handleEventConnect = ({ connectingRedis }) => {
	// check if connecting is null
	connectingRedis.on(statusConnectRedis.CONNECT, () => {
		console.log(`connecting Redis - connecting Status: Connnected`);
		// clear timeout
		clearTimeout(connectionTimeout);
	});

	connectingRedis.on(statusConnectRedis.END, () => {
		console.log(`connecting Redis - connecting Status: Disconnnected`);
	});

	connectingRedis.on(statusConnectRedis.RECONNECT, () => {
		console.log(`connecting Redis - connecting Status: Reconnnected`);
		// connect timeout
		handleTimeoutError();
	});

	connectingRedis.on(statusConnectRedis.ERROR, (err) => {
		console.log(`connecting Redis - connecting Status: Error ${err}`);
		handleTimeoutError();
	});
};

const init = () => {
  const instanceRedis = createClient({ url: redisUrl });
  client.intanceConnect = instanceRedis;

  handleEventConnect({
    connectingRedis: instanceRedis,
  });
  const connectRedis = async () => {
    try {
      await instanceRedis.connect();
    } catch (err) {
      handleEventConnect({
        connectingRedis: instanceRedis,
      });
      console.log("Redis connecting Error::", err);
      setTimeout(() => {
        connectRedis();
      }, 5000);
    }
  };

  connectRedis();
};
const getRedis = () => client;

const closeRedis = async () => {
	try {
		if (client.intanceConnect) {
			// Gracefully disconnect from Redis
			await client.intanceConnect.quit(); // Use quit() for proper shutdown
			console.log('Redis connection closed successfully.');
		} else {
			console.log('No active Redis connection to close.');
		}
	} catch (error) {
		// Log any errors during the closing process
		console.error('Error closing Redis connection:', error);
		// Optionally, re-throw or handle the error in a way that suits your application
	} finally {
		// Ensure the client object is reset, indicating no active connection
		client = {};
	}
};

module.exports = {
	init,
	getRedis,
	closeRedis
};
