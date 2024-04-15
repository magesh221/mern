// const { mongodb } = require('mongodb');
const { Schema } = require('mongoose')
const connection = require('../dbconnection/dbconnection')

const crudSchema = new Schema({
    name:{ type:String,required:true},
    email:{type:String, required:true},
    password:{type:String, required:true},
    phone:{type:Number, required:true}

}, { timestamp: true });

module.exports = crudSchema;
