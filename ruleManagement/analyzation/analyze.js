var logSchema = require('../models/logDB.js');

const { getFileByName } = require('../utils/file_utils.js');
var fileAnalyze = require('./fileAnalyze.js');

const checkErrorsForDispatcher = require('./checkDispatcherNeed');
const sendToDispatcher = require('./sendToDispatcher');
const fileSchema = require("../models/fileDB");
const {switchDB, getDBModel} = require("../../multiDatabaseHandler");
const {getRulesByName} = require("../controllers/rulesController");


async function analyze(req, rules, fileName, companyName, callback) {
    //get the file data
    const selectedRules = await getRulesByName(rules,companyName);
    //console.log(selectedRules);
    const logs = await getFileByName(fileName,companyName);
    //console.log(logs);
    //const selectedFile = await getFileLogs(file);
    const companyDB = await switchDB(companyName, 'analyzed_logs', logSchema)
    const logModel = await getDBModel(companyDB,'analyzed_logs',logSchema)

    //check if file in the database
    var file_analyzed = await logModel.findOne({ file_name: fileName });

    var res_analyzed;// = fileAnalyze(logs, selectedRules);
    //console.log(res_analyzed);

    if (!file_analyzed) { //if null then no such file analyzed before
        res_analyzed = fileAnalyze(logs, selectedRules, null);
        // save in DB log_analyzation collection new document for the analyzed file
        const new_file = new logModel({
            file_name: fileName,
            user_name: req.user.firstName ? req.user.firstName : req.user.username ,
            file_date: new Date(),
            process: res_analyzed
        });

        await new_file.save()
            .then(result => {
                console.log('Log entry saved:', result._id);
                // call the function to check if dispatcher needed
                const [res_condition, abnormalErrors] = checkErrorsForDispatcher(res_analyzed);
                console.log(res_condition);
                if (res_condition) {
                    console.log("Need to send to dispatcher the :", abnormalErrors);
                    sendToDispatcher(abnormalErrors, result, req);
                }
                callback(null, res_analyzed);
            })
            .catch(err => {
                console.error('Error happend', err);
                callback(err, null);
            });
    } else {
        res_analyzed = fileAnalyze(logs, selectedRules, file_analyzed);
        //file in the database
        file_analyzed.process = res_analyzed;
        var resultRules = getTheLogsRuls(rules, file_analyzed.process);
        await file_analyzed.save().then(result => {
            console.log('Log entry saved:', result._id);
            // call the function to check if dispatcher needed
            const [res_condition, abnormalErrors] = checkErrorsForDispatcher(res_analyzed);
            console.log(res_condition);
            if (res_condition) {
                //console.log("Need to send to dispatcher the :", abnormalErrors);
                sendToDispatcher(abnormalErrors, file_analyzed, req);
            }
            callback(null, resultRules);
        })
            .catch(err => {
                console.error('Error happend', err);
                callback(err, null);
            });
    }

}

function getTheLogsRuls(rules, process) {
    var result = [];
    for (const obj of process) {
        var exist = false;
        for (const rule of rules) {
            if (obj.rule === rule) {
                exist = true;
            }
        }
        if (exist) {
            result.push(obj);
        }
    }
    return result;
}

module.exports = analyze;

