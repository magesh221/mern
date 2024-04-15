const mongoose = require("mongoose");
const dbConfig = require('../config/db')
const db = dbConfig.ATLAS
const dbconnection = mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = {
    dbconnection: dbconnection,
};
