"use strict";

const mongoose = require("mongoose");
const { countConnect } = require("../helpers/checkConnect.helpers");
const {
  db: { host, name, port },
} = require("../configs/init.config");
const httpString = `mongodb://${host}:${port}/${name}`;
const nodeEnv = process.env.NODE_ENV || "dev";
class DatabaseClass {
  constructor() {
    this.connect();
  }
  async connect() {
    if (nodeEnv === "dev") {
      // mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(httpString, { maxConnecting: 1000 })

      .then((_) => {
        console.log(`Connected MongoDB success ${name}`);
        countConnect();
        clearTimeout(this.ErrorTimeOut);
      })
      .catch((_) => {
        console.log("Error Connect", httpString);
        console.log("Automatically connect after 5 seconds");
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
