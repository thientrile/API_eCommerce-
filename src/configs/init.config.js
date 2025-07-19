/** @format */

"use strict";

const { version } = require("os");

const devlopment = {
  app: {
    port: process.env.DEV_APP_PORT || 3055,
    name: process.env.DEV_API_NAME || "dev-api",
    version: process.env.DEV_API_VERSION || "V1",
  },
  db: {
    mongo: {
      schema: "mongodb",
      user: "mongo",
      pass: "hzOyAWkWMpUUjcwiCKOdWBYSENCrgwwN",
      host: "hopper.proxy.rlwy.net:47441",
      dataName: "shopDev1",
      options: {
        authSource: "admin",
      },
    },

    redis: {
      user: "default",
      pass: "ojNrMOvcZUsAzBjnUMMHrxNBbaiKutaG",
      host: "trolley.proxy.rlwy.net:59957",
    },
  },
  // elastichsearch:{

  // }
};

const production = {
  app: {
    port: process.env.PORT || 3000,
    name: process.env.API_NAME || "pro-api",
    version: process.env.API_VERSION || "V1",
  },
  db: {
    // 
    mongo: {
      schema: "mongodb",
      user: "mongo",
      pass: "hzOyAWkWMpUUjcwiCKOdWBYSENCrgwwN",
      host: "hopper.proxy.rlwy.net:47441",
      dataName: "shopDev1",
      options: {
        authSource: "admin",
      },
    },
    redis: {
      user: "default",
      pass: "ojNrMOvcZUsAzBjnUMMHrxNBbaiKutaG",
      host: "redis.railway.internal:6379",
    },
  },
};
const config = { production, devlopment };
const env = process.env.NODE_ENV || "devlopment";
console.log("env:::", env);

module.exports = config[env];
