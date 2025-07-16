/** @format */
async function test() {
	try {
		require('../../db/mongoDB.db');
		const { getArrSrcByRoleName } = require('../../repositories/role.repo');
	const reslut=	await getArrSrcByRoleName('Shops');
	console.log("🚀 ~ test ~ reslut:", reslut)
	} catch (err) {}
}
test();