/** @format */

'use strict';
const ResourceModel = require('../models/resource.model');
const RoleModel = require('../models/role.model');
const {
	convertToObjectIdMongoose,
	renameObjectKey,
	addPrefixToKeys,
	createMongoObjectId
} = require('../utils');
const { BadRequestError } = require('../core/error.response');
const { grantAccess } = require('../middlewares/rbac.middleware');
const {
	getListRole,
	getAllGrants,
	getAllListRole,
	getGrants
} = require('../repositories/role.repo');
const { setData } = require('./redis.service');
const { getRoleNameByUserId } = require('../repositories/user.repo');
const userModel = require('../models/user.model');

const extendUser = async (id) => {
	return await RoleModel.findOneAndUpdate(
		{
			rol_slug: '1',
			'rol_parents._id': { $ne: convertToObjectIdMongoose(id) } // Ensure `_id` isn't already in the array
		},
		{
			$push: {
				rol_parents: { _id: convertToObjectIdMongoose(id) }
			}
		},
		{ new: true } // Return the updated document
	);
};
// Create Resource
async function createResource({ name, slug, description, userId }) {
	await grantAccess(userId, 'createAny', 'Resources');

	try {
		const resource = await ResourceModel.create({
			src_name: name,
			src_slug: slug,
			src_description: description
		});

		return renameObjectKey(
			{
				src_name: 'name',
				src_slug: 'slug',
				src_description: 'description',
				_id: 'resourceId'
			},
			resource.toObject()
		);
	} catch (err) {
		if (err.code === 11000) {
			// Check for duplicate key error
			throw new BadRequestError('Resource already exists');
		} else {
			throw err; // Rethrow other errors for potential handling
		}
	}
}

// Get Resource List
async function resourceList({ userId, limit = 30, offset = 0, search = '' }) {
	await grantAccess(userId, 'readAny', 'Resources');

	const resources = await ResourceModel.aggregate([
		{
			$project: {
				name: '$src_name',
				slug: '$src_slug',
				description: '$src_description',
				_id: 0,
				resourceId: '$_id',
				isRoot: '$src_isRoot',
				menu: '$src_menu',

				createdAt: 1
			}
		},
		{
			$match: {
				$or: [
					{ name: { $regex: search, $options: 'i' } },
					{ slug: { $regex: search, $options: 'i' } },
					{ description: { $regex: search, $options: 'i' } }
				]
			}
		},
		{ $sort: { createdAt: -1 } },
		{ $skip: parseInt(offset) },
		{ $limit: parseInt(limit) }
	]);

	return resources;
}

// Create Role by admin
async function createRole(userId, payload) {
	await grantAccess(userId, 'createAny', 'Roles');
	const parentId = (await getRoleNameByUserId(userId)).usr_role._id;
	const checkExist = await RoleModel.findOne({
		rol_name: payload.name,
		rol_parents: { $in: [{ _id: convertToObjectIdMongoose(parentId) }] },
		rol_isRoot: true
	});
	payload.userId = convertToObjectIdMongoose(userId);
	payload.parents = { _id: convertToObjectIdMongoose(parentId) };
	if (checkExist) {
		throw new BadRequestError('Role already exists');
	}
	payload._id = createMongoObjectId();
	const data = addPrefixToKeys(payload, 'rol_', ['_id']);

	await Promise.all([
		await RoleModel.create(data),
		await extendUser(payload._id)
	]);

	const [listRole, listgrants, allListRole] = await Promise.all([
		await getListRole(),
		await getAllGrants(),
		await getAllListRole()
	]);
	await Promise.all([
		await setData('listRoles', listRole),
		await setData('grants', listgrants)
	]);

	return allListRole;
}

// Add Grants to Role
async function addGrantsToRole(userId, payload) {
	await grantAccess(userId, 'updateAny', 'Roles');
	const { roleId, grants } = payload;

	const checkRoleExist = await RoleModel.findOneAndUpdate(
		{ _id: convertToObjectIdMongoose(roleId) },
		{ $push: { rol_grants: grants } } // Use $push to add elements to array
	);
	if (!checkRoleExist) {
		throw new BadRequestError('Role not found');
	}

	const [listRole, listgrants, allListRole] = await Promise.all([
		await getListRole(),
		await getAllGrants(),
		await getAllListRole()
	]);
	await Promise.all([
		await setData('listRoles', listRole),
		await setData('grants', listgrants)
	]);
	return allListRole;
}
// set Grants to role
async function setGrantsToRole(userId, payload) {
	await grantAccess(userId, 'updateAny', 'Roles');
	const { roleId, grants } = payload;
	const result = await RoleModel.findOneAndUpdate(
		{ _id: convertToObjectIdMongoose(roleId) },
		{ rol_grants: grants } // Use $push to add elements to array
	);
	if (!result) {
		throw new BadRequestError('Role not found');
	}
	const [listRole, listgrants] = await Promise.all([
		await getListRole(),
		await getAllGrants()
	]);
	await Promise.all([
		await setData('listRoles', listRole),
		await setData('grants', listgrants)
	]);
	return result;
}
const delGrantstoRole = async (userId, payload) => {
	await grantAccess(userId, 'deleteAny', 'Roles');
	const { roleId, grantId } = payload;
	const rol = await RoleModel.findOneAndUpdate(
		{ _id: convertToObjectIdMongoose(roleId) },
		{ $pull: { rol_grants: { _id: convertToObjectIdMongoose(grantId) } } }
	);

	const [listRole, listgrants] = await Promise.all([
		await getListRole(),
		await getAllGrants()
	]);
	await Promise.all([
		await setData('listRoles', listRole),
		await setData('grants', listgrants)
	]);

	return rol;
};

// Get  list grants access control
async function listGrants({ userId = 0, limit = 30, offset = 0, search = '' }) {
	// You might want to consider adding the access control check here as well
	await grantAccess(userId, 'readAny', 'Roles');

	return await getGrants(limit, offset, search);
}
// get all list role
const getListAllRole = async (userId) => {
	await grantAccess(userId, 'readAny', 'Roles');
	const roles = await getAllListRole();
	return roles;
};
const deleteRole = async (userId, payload) => {
	await grantAccess(userId, 'deleteOwn', 'Roles');
	const { roleId } = payload;
	const [role, roleDelete] = await Promise.all([
		await RoleModel.findOneAndUpdate(
			{ rol_slug: 1 },
			{
				$pull: { rol_parents: { _id: convertToObjectIdMongoose(roleId) } }
			}
		),
		await RoleModel.findOneAndDelete({
			_id: convertToObjectIdMongoose(roleId),

		})
	]);
	if (!roleDelete) {
		throw new BadRequestError('Role not found');
	}

	const [listRole, listgrants, allListRole] = await Promise.all([
		await getListRole(),
		await getAllGrants(),
		await getAllListRole(),
		await userModel.updateMany(
			{ usr_role: convertToObjectIdMongoose(roleId) },
			{ $set: { usr_role: convertToObjectIdMongoose(role._id) } }
		)
	]);
	await Promise.all([
		await setData('listRoles', listRole),
		await setData('grants', listgrants)
	]);

	return allListRole;
};

module.exports = {
	resourceList,
	createResource,
	createRole,
	listGrants,
	addGrantsToRole,
	getListAllRole,
	delGrantstoRole,
	setGrantsToRole,
	deleteRole
};
