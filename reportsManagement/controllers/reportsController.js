var express = require('express');
var router = express.Router();
var logSchema = require('../../ruleManagement/models/logDB');
const {switchDB,getDBModel} = require('../../multiDatabaseHandler');
const { log } = require('util');
const backFuncs = require('../backFuncs');
const fs = require('fs');

router.get('/', async function (req, res) {
    try {
        const companyDB = await switchDB(req.companyName, 'analyzed_logs', logSchema);
        const logdb = await getDBModel(companyDB, 'analyzed_logs', logSchema);
      const documents = await logdb.find({});
      if (documents.length > 0) {
        const filesname = documents.map(item => ({ file_name: item.file_name, file_date: item.file_date }));
        const sortedfiles = filesname.sort((objA, objB) => objB.file_date - objA.file_date).map(file => file.file_name);
        res.json({ message: "Get Data Successed", type: "success", files: sortedfiles });
      }
      else { res.json({ message: "No files Uploaded until now", type: "empty", files: [] }); }
    } catch (error) {
      res.json({ message: error.message, type: "error" });
    }
  });
  router.post('/getData', async function (req, res) {
    try{
    let dataFromFront = req.body;
    const companyDB = await switchDB(req.companyName, 'analyzed_logs', logSchema);
    const logdb = await getDBModel(companyDB, 'analyzed_logs', logSchema);
    let result = await logdb.find({ file_name: dataFromFront.file_name }).exec();
    let dataToFront = {};
    dataToFront["numberOfMessages"] = backFuncs.numbersFunc(result[0], "messages", dataFromFront.from, dataFromFront.to, dataFromFront.rules);
    dataToFront["numberOfErrors"] = backFuncs.numbersFunc(result[0], "Error Detection", dataFromFront.from, dataFromFront.to);
    dataToFront["numberOfHigh"] = backFuncs.numbersFunc(result[0], "high", dataFromFront.from, dataFromFront.to, dataFromFront.rules);
    dataToFront["rulesCounters"] = backFuncs.messagesFilterBaseOnRule(result[0], dataFromFront.from, dataFromFront.to, dataFromFront.rules);
    dataToFront["rankCounters"] = backFuncs.messagesFilterBaseOnRank(result[0], dataFromFront.from, dataFromFront.to, dataFromFront.rules);
    dataToFront["divideMessagesBy15Min"] = backFuncs.divideMessagesByXMin(result[0], 15, dataFromFront.from, dataFromFront.to, dataFromFront.rules);
    dataToFront["divideErrorsBy15Min"] = backFuncs.divideRuleByXMin(result[0], 15, "Error Detection");
    dataToFront["divideRankBy15Min"] = backFuncs.divideRankByXMin(result[0], 15, 3, dataFromFront.from, dataFromFront.to, dataFromFront.rules);
    dataToFront["lastXMessages"] = backFuncs.lastXMessages(result[0], 5, dataFromFront.from, dataFromFront.to, dataFromFront.rules);
    res.json({ "dataToFront": dataToFront }); 
    }
    catch (error) {
        console.log("error getData");
        res.json({ message: "Error to Get Data", type: "error" });
      }
   
  });
  router.get('/:filename', async function (req, res) {
    var filename = req.params.filename;
    try {
        const companyDB = await switchDB(req.companyName, 'analyzed_logs', logSchema);
        const logdb = await getDBModel(companyDB, 'analyzed_logs', logSchema);
      const specDoc = await logdb.find({ file_name: filename });
      let myArray = specDoc[0]["process"];
      const set = new Set();
      var minDate = (myArray[0]["date"]);
      var maxDate = (myArray[0]["date"]);
      for (let i = 0; i < myArray.length; i++) {
        if (myArray[i]["date"] > maxDate) { maxDate = myArray[i]["date"]; }
        if (myArray[i]["date"] < minDate) { minDate = myArray[i]["date"]; }
        set.add(myArray[i]["rule"]);
  
      }
      const setArray = [...set];
      res.json({ message: "Success To Get Data", type: "success", rules: setArray, From: minDate, To: maxDate });
  
    } catch (error) {
      res.json({ message: "Error to Get Data", type: "error" });
    }
  });
  module.exports = router;