const { google } = require('googleapis');
const fs = require('fs');
const axios = require('axios');
const fileData = require("../controllers/fileData"); // Import the fileData module
const {Worker} = require('worker_threads');


// Google Drive API configuration
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TOKEN_PATH = 'token.json'; // File to store access token
const FolderLink='https://drive.google.com/drive/folders/1LzZPQsyF2w3qpqgwoe8nc017rDQ49I49';
const LOCAL_FOLDER_PATH = '../localStorage/driveLogs';// change this to the local folder that we save the files locally

// Load client secrets from a file (client_secret.json should contain your OAuth 2.0 credentials)
const credentials = require('./credentials.json');

// Create an OAuth2 client
const client_id = credentials.web.client_id;
const client_secret = credentials.web.client_secret;
const redirect_uris = credentials.web.redirect_uris;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

let previousFileList = [];
// Set the token you received after the OAuth 2.0 flow
oAuth2Client.setCredentials({ access_token:"ya29.a0AfB_byAqQ07NIw6tnrv7IghyKxOgZWkDYziG3-0ImG7pMZ-nPbUhO9q0WwmKJarqeh_JxGmKujrbe5eVyGFbWRQWamxjRiGp7GNcrGiP86VWbSebACF_NwLybrsuy1NwQZuoKPN8qtorxzwrUYvGyAru0PcscE1YjQaCgYKAT8SARESFQGOcNnC88aDn5i-0aUQ8O8FWznX2Q0169" , refresh_token:"1//03x8yenC4Qx8uCgYIARAAGAMSNwF-L9IrT_OzOaJYPcRL4C4AZuTW-5hY9-3kF_Z4JoF3H8sas-fufwgG06noByvrMbwGAF7Vphc" });

//check token expired date
const now= new Date().getDate();
if (oAuth2Client.credentials.expiry_date<now){
    console.log('Access token has expired.');
}

// function to download and save a file from google drive using url
async function downloadAndSaveFile(file) {
    const fileURL = file.webViewLink; // Get the file URL using webViewLink
    const fileName = file.name; // Get the file name
    const fileId = file.id;
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const filePath = `${LOCAL_FOLDER_PATH}/${fileName}`;
    const dest = fs.createWriteStream(filePath);

    const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    if(fileName.includes(".txt")){
        response.data
            .on('end', () => {
                console.log(`Done downloading file: ${fileName}`);
                checkCollection(fileName);
                workerHandler(fileName);

            })
            .on('error', err => {
                console.error('Error downloading file.');
            })
            .on('data', d => {
                d += '';
                //console.log(d);
                // data will be here
                // pipe it to write stream
            })
            .pipe(dest);
    }
}


// Poll the file for changes
function pollFile(logDriveFolder) {
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const parts=logDriveFolder.split('/');
    let FolderID=parts[parts.length-1];
    FolderID = FolderID.split('?')[0];
    console.log({FolderID});
    // Define a function to list the contents of the folder
    function listFolderContents() {
        drive.files.list(
            {
                q: `'${FolderID}' in parents`, // Search for files in the specified folder
                fields: 'files(name, id, modifiedTime, webViewLink)', //webViewLink to get file URLs
            },
            (err, res) => {
                if (err) {
                    console.error('Error listing folder contents:', err);
                    return;
                }

                const fileList = res.data.files;

                // Compare the current list of files with the previous list
                const changedFiles = fileList.filter(file => {
                    const previousFile = previousFileList.find(prevFile => prevFile.id === file.id);
                    return !previousFile || previousFile.modifiedTime !== file.modifiedTime;
                });

                if (changedFiles.length > 0) {
                    changedFiles.forEach(async file => {
                        const fileURL = file.webViewLink; // Get the file URL using webViewLink
                        const fileName = file.name; // Get the file name
                        console.log(`File ${fileName} changed - URL: ${fileURL}`);
                        await downloadAndSaveFile(file);
                    });
                    //send a message or perform any other action with the changed files here
                }
                // Update the previous list of files
                previousFileList = fileList.map(file => ({
                    id: file.id,
                    modifiedTime: file.modifiedTime,
                }));
            }
        );
    }

    // Poll for changes every minute
    setInterval(listFolderContents, 3000);

    // Get file metadata immediately
    listFolderContents();
}

async function checkCollection(fileName) {
    console.log("Im here ,Uploaded file:", fileName);
    const db = mongoose.connection;
    const collectionNameToCheck = "file_"+fileName.toLowerCase() + "s";


    try {
        const collections = await db.db.listCollections().toArray();
        const collectionNames = collections.map((collection) => collection.name);
        const collectionExists = collectionNames.includes(collectionNameToCheck);

        if (collectionExists) {
            try {
                await db.db.collection(collectionNameToCheck).drop();
                console.log(`Collection ${collectionNameToCheck} dropped successfully.`);
            } catch (error) {
                console.error(`Error dropping collection ${collectionNameToCheck}:`, error);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function workerHandler(fileName){
    console.log("enterned")
    let worker = new Worker("./driveWorker.js");
    worker.postMessage({ data:fileName });
    worker.on('message',(data)=>{
        console.log(data);
    });
}

module.exports = { pollFile ,checkCollection};