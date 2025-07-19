/** @format */

'use strict';
const rbac = require('./role.middleware');
const { getAllGrants, getListRole } = require('../repositories/role.repo');
const { getRoleNameByUserId } = require('../repositories/user.repo');
const { ForbiddenError } = require('../core/error.response');
const { getData, setData } = require('../services/redis.service');
/**
 * Grants access to perform a specific action on a resource based on the user's role.
 * @param {string} userId - The ID of the user.
 * @param {string} action - Action to be performed (create, read, update, delete) combined with possession (Own, Any). For example: createOwn, readAny
 * @param {string} resource - The resource on which the action is performed.
 * @returns {Promise<object>} - The permission object indicating whether the user has permission to perform the action.
 * @throws {AuthFailureError} - If the user does not have permission to perform the action.
 */
const initAccessControl = async () => {
	const [redistGrants, roles] = await Promise.all([
		getData('grants'),
		getData('listRoles')
	]);

	// Nếu không có grants trong cache, tải và lưu trữ
	if (!redistGrants) {
		const listgrants = await getAllGrants();
		await setData('grants', listgrants, 3600);
		rbac.setGrants(listgrants);
	} else {
		rbac.setGrants(redistGrants);
	}

	// Nếu không có roles trong cache, tải và lưu trữ
	let finalRoles = roles;
	if (!roles) {
		finalRoles = await getListRole();
		await setData('listRoles', finalRoles, 3600);
	}

	// Duyệt qua danh sách roles và cấp quyền (grant)
	finalRoles.forEach((role) => {
		if (role.parent && role.grants > 0) {
			rbac.grant(role.parent).extend(role.name);
		}
	});
};
const grantAccess = async (userId, action, resourse) => {
	await initAccessControl();
	const roleName = (await getRoleNameByUserId(userId)).usr_role.rol_slug;

	try {
		const permission = rbac.can(roleName)[action](resourse);
		if (!permission.granted) {
			throw new ForbiddenError(
				'You dont have permission to perform this action'
			);
		}
		return permission;
	} catch (err) {
		console.error(err);
		throw new ForbiddenError('you dont have permission to perform this action');
	}
};
/**
 * Checks if a user has permission to perform a specific action on a resource.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} action - The action to be performed.
 * @param {string} resource - The resource on which the action is performed.
 * @returns {Promise<boolean|object>} - A promise that resolves to either the permission object if granted, or false if not granted.
 */
const checkPermission = async (userId, action, resourse) => {
	await initAccessControl();
	const roleName = (await getRoleNameByUserId(userId)).usr_role.rol_slug;
	const permission = await rbac.can(roleName)[action](resourse);
	return permission.granted ? permission : null;
};

module.exports = {
	grantAccess,
	checkPermission
};
