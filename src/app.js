/** @format */

'use script';
const fs = require('fs');
const options={
	key:fs.readFileSync('./src/key.pem','utf8'),
	cert:fs.readFileSync('./src/cert.pem','utf8')
}
const corsOptions=require('./utils/cors');
const cors = require('cors');
require('dotenv').config();
const express = require('express');
const app = express();
const httpServer = require('https').createServer(options,app);
const io = require('socket.io')(httpServer);
const morgan = require('morgan');
const { default: helmet } = require('helmet');
const compression = require('compression');
// variables global
global._io = io;

// init middleware
app.use(cors(corsOptions))
app.use(morgan('combined'));
app.use(helmet());
app.use(compression());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// init db
// init mongodb
require('./db/mongoDB.db');

// init redis
const initRedis = require('./db/redis.db');
initRedis.init();

// init elasticsearch
const Elasticsearch = require('./db/elasticSearch.db');

Elasticsearch.init();
// //  inint rbac
// const { initAccessControl } = require("./middlewares/rbac.middleware");
// (async () => {
//   await initAccessControl();
// })();
// app.use();
// init routers
app.use('', require('./routers'));
// init socket IO
//init

// #function middleware error
app.use((req, res, next) => {
	const error = new Error('Not Found');
	error.status = 404;
	next(error);
});

// # error management function
app.use((error, req, res, next) => {
	const statusCode = error.status || 500;
	console.log(error);
	return res.status(statusCode).json({
		status: 'Error',
		code: statusCode,
		message: error.message || 'Internal Server Error'
	});
});

module.exports = { httpServer };
