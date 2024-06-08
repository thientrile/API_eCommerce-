'use strict'


const {Schema,model} = require('mongoose')
const documentName = 'apiKey'
const  collectionName = 'apiKeys'
const apiKeySchema = new Schema({
    app_code:{
        type:String,
        required:true,
        unique:true
    },
    app_status:{
        type:Boolean,
        default:false
    },
    app_permissions:{
        type:String,
        enum:['777','444','111'],
        required:true
    }


   
},{
    timestamps:true,
    collection:collectionName

})
module.exports = model(documentName,apiKeySchema)