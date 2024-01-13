var express = require("express");
const fileData = require("../controllers/fileData"); // Import the fileData module
const {Worker} = require('worker_threads');


function workerHandler(companyName,req){
    console.log("enterned")
    console.log(fileData.getUploadedFiles());
    let worker = new Worker("./fileSystem/services/worker.js");
    worker.postMessage({ data:fileData.getUploadedFiles()
    ,companyName, username: req.firstName});
    worker.on('message',(data)=>{
        console.log(data);
    });
    fileData.resetUploadedFile();
}

module.exports = workerHandler;
