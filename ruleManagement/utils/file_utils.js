var mongoose = require('mongoose');
const  fileSchema = require('../models/fileDB');
const {switchDB, getDBModel} = require("../../multiDatabaseHandler");
const logSchema = require("../models/logDB");


async function getFileByName(file, companyName) {
    //"Log", logSchema, 'log_analyzation'
    const companyDB = await switchDB(companyName,file, fileSchema)
    //2) point to users collections in companyDB
    let File = await getDBModel(companyDB, file, fileSchema)
  //  const File = mongoose.model("File", fileSchema, log_file);
    try {
        const logs = await File.find({}).exec();

        //console.log('Logs as an array:', logs);
        return logs;
    } catch (err) {
        console.error('Error:', err);
    } 
}

/* this function is responsoable for getting all the files (collections of files) that in the database */
async function getFiles(companyName, callback) {
    const companyDB = await switchDB(companyName, "logs", fileSchema);
    const logsModel = await getDBModel(companyDB, "logs", fileSchema);

    try {
        const collections = await companyDB.db.listCollections().toArray();

        const filesNames = collections
            .map(collection => collection.name)
            .filter(name => name.startsWith('file_'));

        callback(null, filesNames);
    } catch (err) {
        console.log("getFiles error: " + err);
        callback(err, null);
    }
}

module.exports = { getFileByName, getFiles };