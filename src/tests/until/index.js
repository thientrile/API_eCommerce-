const SpuModel = require("../../models/spu.model");
const { createJoiSchemaFromMongoose } = require("../../utils");
const result= createJoiSchemaFromMongoose(SpuModel,"spu_");
console.log(result);