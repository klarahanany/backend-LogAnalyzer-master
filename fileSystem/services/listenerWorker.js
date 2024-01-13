var fs = require("fs");
var express = require("express");
var mongoose = require("mongoose");
const fileSchema = require("../models/fileModel")
const { parentPort } = require("worker_threads");
const {switchDB, getDBModel} = require("../../multiDatabaseHandler");

parentPort.on("message",async (message) => {
    console.log("Received message from main thread: (listenerWorker.js)", message);
    var file = message.data;
    const companyName = message.companyName
    const logFolder = message.logFolder
    console.log('logFolder:',logFolder)
    const companyDB = await switchDB(companyName, "file_" + file, fileSchema)
    //2) point to users collections in companyDB
    let logModel = await getDBModel(companyDB, "file_" + file, fileSchema)
    //const User = mongoose.model("file_"+file, fileSchema);
    //User.createCollection().then(function (collection) {
        console.log("Collection is created!");
        fs.readFile(logFolder + "/" + file, "utf8", function (err, data) {
            if (err) {
                console.error(err);
                // Send an error response
                res.status(500).send("Internal Server Error");
            } else {
                data = data.replaceAll("[", "");
                data = data.replaceAll("]", "");
                var dataSplit = data.split("\n");
                dataSplit.forEach((line) => {
                    var dateStr = line.substring(0, 31);
                    var new_file = new logModel({
                        date: dateStr,
                        info: line.substring(32, line.length),
                    });
                    new_file.save();
                });
            }
        });
    //});
});



parentPort.postMessage("Successfully uploaded");