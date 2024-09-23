"use strict"

const {getRedis}= require("../db/redis.db")
const client= getRedis().intanceConnect;
/**
 * Set data in Redis.
 * @param {string} key - The key to save in Redis.
 * @param {any} value - The value to save.
 * @param {number} expireTime - (optional) Expiration time in seconds.
 * @returns {Promise<string>} - Returns the result of the set operation.
 */
const setData = async (key, value, expireTime = 30) => {
    try {
        const data = JSON.stringify(value);
        if (expireTime) {
            await client.setEx(key, expireTime, data); // Using setEx for expiration
          } else {
            await client.set(key, data); // Simple set without expiration
          }
       
      } catch (err) {
        console.log("redis error".err)
      }
}
const getData= async (key)=>{
    const data = await client.get(key);
    return JSON.parse(data);
}
 module.exports={
    setData,
    getData
 } 