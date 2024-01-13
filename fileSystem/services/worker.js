var fs = require("fs");
const fileData = require("../controllers/fileData"); // Import the fileData module
var mongoose = require("mongoose");
const fileSchema = require("../models/fileModel")
const { parentPort } = require("worker_threads");
const {switchDB, getDBModel} = require("../../multiDatabaseHandler");
const {response} = require("express");

parentPort.on("message", async (message) => {
    console.log("Received message from main thread:", message , fileData.getUploadedFiles());
    let files = message.data;

    for (const file of files) {
        const companyDB = await switchDB(message.companyName, "file_" + file, fileSchema)
        //2) point to users collections in companyDB
        let logModel = await getDBModel(companyDB, "file_" + file, fileSchema)
        // logModel = mongoose.model("file_"+file, fileSchema);
        console.log("Collection is created!: "+file);
        fs.readFile("./fileSystem/localStorage/logs/" + file, "utf8", function (err, data) {
            if (err) {
                console.error('Worker.js: ',err);
                // Send an error response
                res.status(500).send("Internal Server Error");
            } else {
                data = data.replaceAll("[", "");
                data = data.replaceAll("]", "");
                var dataSplit = data.split("\n");
                dataSplit.forEach((line) => {
                    var dateStr = line.substring(0, 31);
                    var new_file = new logModel({
                        user_name: message.firstName,
                        date: dateStr,
                        info: line.substring(32, line.length),
                    });
                    new_file.save()
                });
            }
        });
    }

    fileData.resetUploadedFile();
});

parentPort.postMessage("Successfully uploaded");