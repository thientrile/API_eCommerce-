"use script";

const express = require("express");
const { apiKey, permission } = require("../auth/check.auth");
const router = express.Router();

const config = require("../configs/init.config");
const link = `/${config.app.version}/${config.app.name}`;
router.use(apiKey);
router.use(permission("777"));
router.use(`${link}/rbac`, require("./rbac"));
router.use(`${link}/user`, require("./user"));
router.use(`${link}/product`, require("./product"));
router.use(`${link}/search`, require("./search"));
router.use(`${link}/logistic`, require("./logistic"));
router.use(`${link}/order`, require("./order"));
module.exports = router;
