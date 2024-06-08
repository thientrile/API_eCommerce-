'use strict';
const {model, Schema}= require('mongoose')

const DOCUMENT_NAME = 'Counter';
const COLLECTION_NAME = 'Counters';

const counterSchema = new Schema({
    name:{type:String, required:true},
    seq:{type:Number, default:0}
},{
    timestamps:true,
    collection:COLLECTION_NAME
})
module.exports = model(DOCUMENT_NAME, counterSchema)
