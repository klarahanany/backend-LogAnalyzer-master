const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const fileSchema = require("../models/fileModel")
const { parentPort } = require("worker_threads");

parentPort.on("message",async (message) => {
    console.log("Received message from main thread:", message);
    var file = message.data;
    const User = mongoose.model("file_"+file, fileSchema);
    User.createCollection().then(function (collection) {
        console.log("Collection is created!");
        fs.readFile("../localStorage/driveLogs/" + file, "utf8", function (err, data) {
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
                    var new_file = new User({
                        date: dateStr,
                        info: line.substring(32, line.length),
                    });
                    new_file.save(function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            //console.log(result);
                        }
                    });
                });
            }
        });
    });
});



parentPort.postMessage("Successfully uploaded");