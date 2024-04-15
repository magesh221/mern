const mongoose = require("mongoose");

const crud = require('../schema/crud')




const db ={}



db.crud = mongoose.model("crud", crud);




module.exports = db;
