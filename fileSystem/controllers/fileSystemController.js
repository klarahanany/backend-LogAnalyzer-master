const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const fileData = require("./fileData");
const workerHandler = require("../services/file");
const { startLogListener } = require('../services/listener');
const { pollFile } = require('../services/gDrive');
var mongoose = require("mongoose");
const {switchDB, getDBModel} = require("../../multiDatabaseHandler");
const userSchema = require("../../login/models/userModel");
const fileSchema = require("../models/fileModel")

let logFolder = 'D:/test listener';
const filesSet = new Set();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "fileSystem/localStorage/logs/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload =multer({ storage: storage });


// Separated callback functions

async function handleUploadedLogs(req, res) {

    console.log('handle uploaded logs')
    const uploadedFiles = req.files;

    if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }

    let failedToUpload = await checkCollections(uploadedFiles,req.companyName);
    console.log(failedToUpload);
    workerHandler(req.companyName,req);
    if (failedToUpload.length > 0) {
        res.json({ message: "Files: " + fileData.getUploadedFiles() + " uploaded successfully except : " + failedToUpload });
    } else {
        res.json({ message: "Files uploaded successfully:" + fileData.getUploadedFiles() });
    }
}

async function checkCollections(uploadedFiles, companyName) {
    let failure = [];
    for (const file of uploadedFiles) {
        console.log("Uploaded file:", file.originalname);

        const collectionNameToCheck = "file_" + file.originalname.toLowerCase() + "s";
        const companyDB = await switchDB(companyName, collectionNameToCheck, fileSchema)
      //  const logModel = await getDBModel(companyDB, 'employee', fileSchema)

        try {
            const collections = await companyDB.db.listCollections().toArray();
            const collectionNames = collections.map((collection) => collection.name);
            const collectionExists = collectionNames.includes(collectionNameToCheck);

            if (collectionExists) {
                failure.push(file.originalname);
            } else if (file.originalname.includes(".txt")) {
                fileData.addUploadedFile(file.originalname);
            } else {
                failure.push(file.originalname);
                fileData.unlinkFiles(file.originalname);
            }
        } catch (error) {
            console.error(error);
        }
    }

    console.log(failure);
    return failure;
}

function setLogFolder(req, res) {
    const { folderPath } = req.body;
    logFolder = folderPath;
    startLogListener(logFolder, filesSet,req.companyName);
    res.send(`Now watching: ${logFolder}`);
}

function handleFileChange(eventType, filePath) {
    // const { eventType, filePath } = req.body;

    if (eventType === 'add') {
        filesSet.add(filePath);
    } else if (eventType === 'change') {
        filesSet.delete(filePath);
        filesSet.add(filePath);
    }
    console.log(`${eventType === 'add' ? 'New file added:' : 'File modified:'} ${filePath}`);
    return console.log('File change notification received.');

}

function setDriveFolder(req, res) {
    const { folderLink } = req.body;
    let logDriveFolder = folderLink;
    pollFile(logDriveFolder);
    res.send(`Now watching: ${logDriveFolder}`);
}



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/file", require("../services/file"));

const getFileSet = (req, res) => {
   // console.log(filesSet)
    res.send(Array.from(filesSet));
}

module.exports = {setDriveFolder,setLogFolder,handleUploadedLogs,handleFileChange, upload, getFileSet}