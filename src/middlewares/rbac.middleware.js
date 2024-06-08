/** @format */

"use strict";
const rbac = require("./role.middleware");
const { getAllGrants } = require("../repositories/role.repo");
const { getRoleNameByUserId } = require("../repositories/user.repo");
const { AuthFailureError } = require("../core/error.response");
/**
 *
 * @param {String} acction read, delete or update
 * @param {*} resourse  profile,balance
 * @returns
 */
// const grantAccess = (acction, resourse) => {
//   return async (req, res, next) => {
//     try {
//       rbac.setGrants(await roleList(0));
//       const rol_name = req.user.role,
//         permission = rbac.can(rol_name)[acction](resourse);
//         console.log(rol_name);
//       if (!permission.granted) {
//         throw new AuthFailureError(
//           "you dont have permission to perform this action"
//         );
//       }
//       req.permission = permission;

//       next();
//     } catch (err) {
//       next(err);
//     }
//   };
// };

/**
 * Grants access to perform a specific action on a resource based on the user's role.
 * @param {string} userId - The ID of the user.
 * @param {string} action - Action to be performed (create, read, update, delete) combined with possession (Own, Any). For example: createOwn, readAny
 * @param {string} resource - The resource on which the action is performed.
 * @returns {Promise<object>} - The permission object indicating whether the user has permission to perform the action.
 * @throws {AuthFailureError} - If the user does not have permission to perform the action.
 */
const grantAccess = async (userId,action, resourse ) => {
const roleName=(await getRoleNameByUserId(userId)).usr_role.rol_name;
try{
  rbac.setGrants(await getAllGrants());
  // rbac.grant('admin').extend('shop')
  const permission = rbac.can(roleName)[action](resourse);
  if (!permission.granted) {
    throw new AuthFailureError(
      "you dont have permission to perform this action"

    );
  }
  return permission;
}
catch(err){
  console.log(err);
  throw new AuthFailureError(
    "you dont have permission to perform this action"

  );
}
 
};
module.exports = {
  grantAccess,
};
