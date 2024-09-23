/** @format */

"use strict";
const rbac = require("./role.middleware");
const { getAllGrants, getListRole } = require("../repositories/role.repo");
const { getRoleNameByUserId } = require("../repositories/user.repo");
const { AuthFailureError } = require("../core/error.response");
const { getData, setData } = require("../services/redis.service");
/**
 * Grants access to perform a specific action on a resource based on the user's role.
 * @param {string} userId - The ID of the user.
 * @param {string} action - Action to be performed (create, read, update, delete) combined with possession (Own, Any). For example: createOwn, readAny
 * @param {string} resource - The resource on which the action is performed.
 * @returns {Promise<object>} - The permission object indicating whether the user has permission to perform the action.
 * @throws {AuthFailureError} - If the user does not have permission to perform the action.
 */
const initAccessControl = async () => {
  console.log("init rbac");
  const redistGrants = await getData("grants");
  if (!redistGrants) {
    const listgrants = await getAllGrants();
    await setData("grants", listgrants, 86400);
    rbac.setGrants(listgrants);
  } else {
    rbac.setGrants(redistGrants);
  }
  let roles = await getData("listRoles");
  if (!roles) {
    roles = await getListRole();
    await setData("listRole", roles, 86400);
  }

   roles.forEach((role) => {
    if (role.parent && role.grants > 0) {
      rbac.grant(role.parent).extend(role.name);
    }
  });

};
const grantAccess = async (userId, action, resourse) => {

  const roleName = (await getRoleNameByUserId(userId)).usr_role.rol_name;

  try {
    const permission = rbac.can(roleName)[action](resourse);
    if (!permission.granted) {
      throw new AuthFailureError(
        "You dont have permission to perform this action"
      );
    }
    return permission;
  } catch (err) {
    console.log(err);
    throw new AuthFailureError(
      "you dont have permission to perform this action"
    );
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


  const roleName = (await getRoleNameByUserId(userId)).usr_role.rol_name;  
  const permission = await rbac.can(roleName)[action](resourse);
  return permission.granted ? permission : null;
};

module.exports = {
  grantAccess,
  checkPermission,
  initAccessControl,
};
