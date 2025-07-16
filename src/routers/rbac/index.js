/** @format */

'use strict';

const express = require('express');
const router = express.Router();
const {
	newRole,
	newResource,
	CtrlListGrants,
	listResource,
	addGrant,
	listRoles,
	delGrant,
	setGrant,
  delRole,
	autoGenerateSrc,
	delSrc
} = require('../../controllers/rbac.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authertication } = require('../../auth/utils.auth');

router.use(authertication);
router.post(
	'/role',

	asyncHandler(newRole)
);
router.get(
	'/roles',

	asyncHandler(listRoles)
);
router.get(
	'/resource/_auto',

	asyncHandler(autoGenerateSrc)
);
router.post('/resource', asyncHandler(newResource));
router.patch('/grants', asyncHandler(addGrant));
router.put('/grants', asyncHandler(setGrant));
router.get('/grants', asyncHandler(CtrlListGrants));
router.delete('/grants', asyncHandler(delGrant));
router.delete('/role', asyncHandler(delRole));
router.get('/resources', asyncHandler(listResource));
router.delete('/resource', asyncHandler(delSrc));

// admin

module.exports = router;
