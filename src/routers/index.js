/** @format */

'use script';

const express = require('express');
const { apiKey, permission, limitReq } = require('../auth/check.auth');
const router = express.Router();

const config = require('../configs/init.config');
const link = `/${config.app.version}/${config.app.name}`;
router.use(apiKey);
router.use(permission('admin'));
router.use(`${link}/rbac`, require('./rbac'));
router.use(permission('user'));
router.use(`${link}/user`, require('./user'));
router.use(`${link}/order`, require('./order'));

router.use(permission('shop'));
router.use(`${link}/product`, require('./product'));
router.use(`${link}/search`, require('./search'));
router.use(`${link}/logistic`, require('./logistic'));
router.use(permission('upload'));
router.use(`${link}/upload`, require('./upload')); // add this line
module.exports = router;
