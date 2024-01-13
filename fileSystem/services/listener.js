const chokidar = require('chokidar');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const {Worker} = require('worker_threads');
const collect = require('./gDrive');

let currentDir = __dirname
const parentDir = path.join(currentDir, '..');
function startLogListener(logFolder, filesSet,companyName) {
    const watcher = chokidar.watch(logFolder, { persistent: true });
  //  const targetFolder = './localStorage/localLogs';
    const targetFolder= path.join(parentDir,'/localStorage/localLogs')
    // Function to process an individual file
    async function processFile(filePath) {
        const fileName = path.basename(filePath);
        console.log(fileName);
        console.log(`New file added or modified: ${filePath}`);

        // Copy the file to the target folder
        const targetFilePath = path.join(targetFolder, path.basename(filePath));
        try {
            if(fileName.includes(".txt")){

               // await collect.checkCollection(fileName);
                workerHandler(fileName,companyName, logFolder);
               // fs.copyFileSync(filePath, targetFolder);

                fs.readFile(logFolder + "/" + fileName, "utf8", function (err, data) {
                    fs.writeFileSync(targetFilePath,data,"utf8")
                })
                console.log(`File copied to target folder: ${targetFilePath}`);
            }
        } catch (error) {
            console.error(`Error copying file: ${error}`);

        }

        // Send the eventType and filePath to the server
       // await axios.post('http://localhost:5000/admin/file-changed', {eventType: 'add', filePath});
        const {handleFileChange} = require("../controllers/fileSystemController");
         handleFileChange( 'add', filePath)
    }

    // Watch for new changes or additions
    watcher.on('add', (filePath) => {
        processFile(filePath);
    });

    // Watch for changes to existing files
    watcher.on('change', (filePath) => {
        processFile(filePath);
    });

    // Handle initial scan of existing files
    watcher.on('ready', () => {
        const watchedDirectories = Object.keys(watcher.getWatched());
        watchedDirectories.forEach((dir) => {
            const files = watcher.getWatched()[dir];
            files.forEach((file) => {
                const filePath = path.join(dir, file);
                processFile(filePath);
            });
        });
    });
}

function workerHandler(fileName, companyName,logFolder){
    console.log("enterned")
    let worker = new Worker("./fileSystem/services/listenerWorker.js");
    worker.postMessage({ data:fileName , companyName,logFolder});
    worker.on('message',(data)=>{
        console.log(data);
    });
}

module.exports = { startLogListener };