var express = require('express');
var router = express.Router();
const { getFiles, getAnalyzedLogs} = require('../utils/file_utils');
const {switchDB, getDBModel} = require("../../multiDatabaseHandler");
const logSchema = require("../models/logDB");

router.get('/', async function (req, res) {
    // get all the Logs from the log
    await getFiles(req.companyName, (err, collectionNames) => {
        if (err) {
            res.status(500).json({error: 'Internal server error'});
        } else {
            //get all the files
            console.log("getsFiles:" +collectionNames)
            res.status(200).json(collectionNames);
        }
    });
});

router.get('/analyzed_logs', async function (req, res) {
    // get all the Logs from the log
    const companyDB = await switchDB(req.companyName, 'analyzed_logs', logSchema)
    const logModel = await getDBModel(companyDB,'analyzed_logs',logSchema)

    //check if file in the database
   // var file_analyzed = await logModel.findOne({ }).select({process: 0});
    var file_analyzed = await logModel.find({ })
    res.status(200).json(file_analyzed);
});


module.exports = router;