/** @format */

'use strict';

const roleModel = require('../models/role.model');

const getId = async (slug) => {
	return roleModel.findOne({ rol_slug: slug }).select('_id');
};
const getAllGrants = async () => {
	return roleModel.aggregate([
		{
			$match: {
				rol_status: 'active'
			}
		},

		{
			$unwind: '$rol_grants'
		},
		{
			$lookup: {
				from: 'Resources',
				localField: 'rol_grants.resourceId',
				foreignField: '_id',
				as: 'resource'
			}
		},
		{
			$unwind: '$resource'
		},
		{
			$project: {
				role: '$rol_slug',
				resource: '$resource.src_name',
				action: '$rol_grants.actions',
				attributes: '$rol_grants.attributes',
				_id: 0
			}
		},
		{
			$unwind: '$action'
		},
		{
			$project: {
				role: 1,
				resource: 1,
				action: '$action',
				attributes: 1,
				_id: 0
			}
		}
	]);
};

const getGrants = async (limit, offset, search) => {
	// Flexible search logic: Match search string to role OR resource OR action
	const matchStage = search
		? {
				$or: [
					{ role: { $regex: search, $options: 'i' } }, // Case-insensitive search
					{ resource: { $regex: search, $options: 'i' } },
					{ action: { $regex: search, $options: 'i' } }
				]
		  }
		: {}; // If no search term, match all documents

	return roleModel.aggregate([
		{ $unwind: '$rol_grants' }, // Unwind to work with individual grants
		{
			$lookup: {
				// Join with resources
				from: 'Resources',
				localField: 'rol_grants.resourceId',
				foreignField: '_id',
				as: 'resource'
			}
		},
		{ $unwind: '$resource' }, // Unwind resources for projection
		{
			// Project the desired fields
			$project: {
				role: '$rol_name',
				resource: '$resource.src_name',
				action: '$rol_grants.actions',
				attributes: '$rol_grants.attributes',
				_id: 0 // Exclude _id
			}
		},
		{ $unwind: '$action' }, // Unwind actions for filtering
		{
			// Re-project after unwinding
			$project: {
				role: 1,
				resource: 1,
				action: 1,
				attributes: 1
			}
		},
		{ $match: matchStage }, // Apply filtering
		{ $sort: { createdAt: -1 } },
		{ $skip: parseInt(offset) || 0 }, // Default to 0 if not provided
		{ $limit: parseInt(limit) || 10 } // Default to 10 if not provided
	]);
};
const getListRole = async () => {
	return roleModel.aggregate([
		{
			$match: {
				rol_status: 'active'
			}
		},
		{
			$unwind: '$rol_parents'
		},
		{
			$lookup: {
				from: 'Roles',
				localField: 'rol_parents._id',
				foreignField: '_id',
				as: 'parent'
			}
		},
		{
			$unwind: '$parent'
		},
		{
			$project: {
				name: '$rol_slug',
				parent: '$parent.rol_slug',
				_id: 0,
				grants: { $size: '$rol_grants' }
			}
		}
	]);
};
const getAllListRole = async () => {
	return roleModel.aggregate([
		{ $unwind: { path: '$rol_grants', preserveNullAndEmptyArrays: true } }, // Xử lý trường hợp mảng rỗng
		{
			$lookup: {
				from: 'Resources',
				localField: 'rol_grants.resourceId',
				foreignField: '_id',
				as: 'resource_info'
			}
		},
		{ $unwind: { path: '$resource_info', preserveNullAndEmptyArrays: true } }, // Xử lý nếu không tìm thấy resource
		{
			$addFields: {
				'rol_grants.name': '$resource_info.src_name' // Thêm tên từ resource nếu tồn tại
			}
		},
		{
			$group: {
				_id: '$_id',
				name: { $first: '$rol_name' },
				slug: { $first: '$rol_slug' },
				isRoot: { $first: '$rol_isRoot' },
				status: { $first: '$rol_status' },
				description: { $first: '$rol_description' },
				grants: { $push: '$rol_grants' }, // Gom lại danh sách grants
				updatedAt: { $first: '$updatedAt' },
				createdAt: { $first: '$createdAt' },
				parents: { $first: '$rol_parents' }
			}
		},
		{ $sort: { createdAt: -1 } } // Sắp xếp theo thời gian tạo
	]);
};
const getArrSrcByRoleName = async (roleName) => {
	returnroleModel.aggregate([
		{ $unwind: { path: '$rol_grants', preserveNullAndEmptyArrays: true } }, // Xử lý trường hợp mảng rỗng
		{
			$lookup: {
				from: 'Resources',
				localField: 'rol_grants.resourceId',
				foreignField: '_id',
				as: 'resource_info'
			}
		},
		{ $unwind: { path: '$resource_info', preserveNullAndEmptyArrays: true } }, // Xử lý nếu không tìm thấy resource
		{
			$addFields: {
				'rol_grants.name': '$resource_info.src_name' // Thêm tên từ resource nếu tồn tại
			}
		},
		{
			$group: {
				_id: '$_id',
				name: { $first: '$rol_name' },
				slug: { $first: '$rol_slug' },
				isRoot: { $first: '$rol_isRoot' },
				status: { $first: '$rol_status' },
				description: { $first: '$rol_description' },
				grants: { $push: '$rol_grants' }, // Gom lại danh sách grants
				updatedAt: { $first: '$updatedAt' },
				createdAt: { $first: '$createdAt' },
				parents: { $first: '$rol_parents' }
			}
		},
		{ $sort: { createdAt: -1 } } // Sắp xếp theo thời gian tạo
	]);
};
module.exports = {
	getId,
	getAllGrants,
	getGrants,
	getListRole,
	getAllListRole,
	getArrSrcByRoleName
};
