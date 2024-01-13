const express = require('express');
const router = express.Router();

// Controller
const ErrorController = require('../controllers/errorController');

// Define routes

router.post('/reportError', ErrorController.sendError);
router.post('/sendemail', ErrorController.sendErroremail);
router.post('/sendsms', ErrorController.sendErrorsms);
router.post('/sendIoT', ErrorController.sendErrorIoT);
router.post('/sendphonecall', ErrorController.sendErrorphonecall);

module.exports = router;
