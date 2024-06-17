"use script";
require("dotenv").config();
const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const nodeEnv = process.env.NODE_ENV || "dev";
// variables global
global._io = io;

// init middleware
app.use(morgan(nodeEnv));
app.use(helmet());
app.use(compression());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// init db
require("./db/mongoDB.db");
// init routers
app.use("", require("./routers"));
// init socket IO

// #function middleware error
app.use((req, res, next) => {
  
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// # error management function
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  console.log(error);
  return res.status(statusCode).json({
    status: "Error",
    code: statusCode,
    message: error.message || "Internal Server Error",
 
  });
});

module.exports = { httpServer };
