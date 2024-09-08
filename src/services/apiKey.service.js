const { randomBytes } = require("node:crypto");
const { createApiKey, findApikey } = require("../repositories/apiKey.repo");
const createCode = async (premissions = "777") => {
  const newKey = await createApiKey({
    app_code: randomBytes(16).toString("hex"),
    app_status: true,
    app_permissions: premissions,
  });

  return newKey.app_code;
};
const findByCode = async (code) => {

  return findApikey({ app_code: code, app_status: true });
};
module.exports = { createCode, findByCode };
