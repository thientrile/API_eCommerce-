/** @format */

'use strict';

const { SuccessReponse } = require('../core/success.response');
const {
	createRole,
	createResource,
	listGrants,
	resourceList,
	addGrantsToRole,
	getListAllRole,
	delGrantstoRole,
	setGrantsToRole,
	deleteRole
} = require('../services/rbac.service');
const { autoGenerateResource, deleteResource } = require('../services/resource.service');

/**
 * @desc create a new Role
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const newRole = async (req, res, next) => {
	new SuccessReponse({
		message: 'Role created successfully',
		metadata: await createRole(req.user._id, req.body)
	}).send(res);
};
const listRoles = async (req, res) => {
	new SuccessReponse({
		message: 'list role successfully',
		metadata: await getListAllRole(req.user._id)
	}).send(res);
};

/**
 * @desc create a new Resource
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const newResource = async (req, res, next) => {
	new SuccessReponse({
		message: 'Resource created successfully',
		metadata: await createResource({ userId: req.user._id, ...req.body })
	}).send(res);
};

/**
 * @description get list all roles by admin
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const CtrlListGrants = async (req, res, next) => {
	new SuccessReponse({
		message: 'list role successfully',
		metadata: await listGrants({
			userId: req.user._id,
			limit: req.query.limit,
			offset: req.query.offset,
			search: req.query.search
		})
	}).send(res);
};

/**
 * @description get list all resource by admin
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const listResource = async (req, res, next) => {
	new SuccessReponse({
		message: 'get list resource successfully',
		metadata: await resourceList({
			userId: req.user._id,
			limit: req.query.limit,
			offset: req.query.offset,
			search: req.query.search
		})
	}).send(res);
};
/**
 * Add grant to role.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the grant is added to the role.
 */
const addGrant = async (req, res, next) => {
	new SuccessReponse({
		message: 'Add grant to role successfully',
		metadata: await addGrantsToRole(req.user._id, req.body)
	}).send(res);
};
const setGrant = async (req, res, next) => {
	new SuccessReponse({
		message: 'Add grant to role successfully',
		metadata: await setGrantsToRole(req.user._id, req.body)
	}).send(res);
};
const delGrant = async (req, res) => {
	new SuccessReponse({
		message: 'Delete grant to role successfully',
		metadata: await delGrantstoRole(req.user._id, req.body)
	}).send(res);
};
const delRole = async (req, res) => {
	new SuccessReponse({
		message: 'Delete role successfully',
		metadata: await deleteRole(req.user._id, req.body)
	}).send(res);
};
const autoGenerateSrc = async (req, res) => {
	new SuccessReponse({
		message: 'Auto generate resource successfully',
		metadata: await autoGenerateResource(req.user._id)
	}).send(res);
};
const delSrc=async(req,res)=>{
	new SuccessReponse({
		message: 'Delete resource successfully',
		metadata: await deleteResource(req.user._id, req.body)
	}).send(res)
}
module.exports = {
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
};
