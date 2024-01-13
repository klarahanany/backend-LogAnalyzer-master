const express = require('express')
const router = express.Router()
const fileController = require('../controllers/fileSystemController')



router.post("/upload", fileController.upload.array("files",10), fileController.handleUploadedLogs);
router.post('/set-folder', fileController.setLogFolder);
router.post('/file-changed', fileController.handleFileChange);
router.post('/set-drive-folder', fileController.setDriveFolder)
router.get('/files',fileController.getFileSet );


module.exports = router