const apiKeyModel = require('../models/apiKey.model');


const findApikey= async (payload)=>{
    return await apiKeyModel.findOne(payload).lean()
}
const createApiKey= async (payload)=>{
    return await apiKeyModel.create(payload)
}
module.exports={
    findApikey,
    createApiKey
}