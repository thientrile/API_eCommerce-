/** @format */

'use strict';

const { getRedis } = require('../db/redis.db');
const { promisify } = require('util');
const { reservationInventory } = require('../repositories/inventory.repo');
const client = getRedis().intanceConnect;

/**
 * Set data in Redis.
 * @param {string} key - The key to save in Redis.
 * @param {any} value - The value to save.
 * @param {number} expireTime - (optional) Expiration time in seconds.
 * @returns {Promise<string>} - Returns the result of the set operation.
 */
const setData = async (key, value, expireTime = 30) => {
	try {
    console.log('Redis set Data::',key);
		const data = JSON.stringify(value);

		if (expireTime) {
			await client.setEx(key, expireTime, data); // Using setEx for expiration
		} else {
			await client.set(key, data); // Simple set without expiration
		}
	} catch (err) {
		console.log('redis error'.err);
	}
};
const getData = async (key) => {

	const data = await client.get(key);
	return JSON.parse(data);
};

const acquireLock = async ({ sku_id, quantity, cartId }) => {
	const key = `lock_${sku_id}`;
	const retryTimes = 10;
	const expireTime = 3; // 3 seconds cache lock;
	for (let i = 0; i < retryTimes; i++) {
		const result = await client.setNX(key, sku_id);
		if (result) {
			//handling inventory
			const isRevervation = await reservationInventory({
				sku_id,
				quantity,
				cartId
			});

			if (isRevervation.modifiedCount) {
				await client.expire(key, expireTime);
				return key;
			} else {
				await client.expire(key, 30);
			}
			return null;
		} else {
			await new Promise((resolve) => setTimeout(resolve, 50)); // wait 50
		}
	}
};

const releaseLock = async (keyLock) => {
	return await client.del(keyLock);
};
const incr = async (key, ttl = 60) => {
	try {
   
		const result = await client.incr(key);
		if (result === 1) {
			await client.expire(key, ttl);
		}
		return result;
	} catch (err) {
		console.error('redis error'.err);
	}
};
module.exports = {
	setData,
	getData,
	acquireLock,
	releaseLock,
	incr
};
