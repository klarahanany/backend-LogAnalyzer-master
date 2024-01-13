const processError = require("../notificationServices/errorProcessor");
const sendemail = require('../notificationServices/sendEmail');
const sendsms = require('../notificationServices/sendSMS');
const sendIoT = require('../notificationServices/sendIoTNotification');
const sendphonecall = require('../notificationServices/phoneCall');
const sendjira = require('../notificationServices/jiraNotification');

const errorController = {
  // getErrors: async (req, res) => {
  //   try {
  //     const errors = await Error.find(); // Use async/await to await the database query
  //     res.json(errors);
  //   } catch (error) {
  //     res.status(500).json({ error: 'Error fetching errors ' + error.message });
  //   }
  // },

  sendError: async (req, res) => {
    try {
      const errorDetails = req.body; // Assuming the error details are in the request body
      await processError(errorDetails); // Process the error
      res.json({ message: 'Error reported and processed successfully' });
    } catch (error) {
      console.error('Error processing error:', error);
      res.status(500).json({ error: 'Error processing error: ' + error.message });    
    }
  },

  sendErroremail: async (req, res) => {
    try {
      const errorDetails = req.body;
      const {to,subject,text } = errorDetails;
      sendemail(to,subject,text);
      res.json({ message: 'Error reported and processed successfully' });
    } catch (error) {
      console.error('Error processing error:', error);
      res.status(500).json({ error: 'Error processing error: ' + error.message });    
    }
  },
  sendErrorsms: async (req, res) => {
    try {
      const errorDetails = req.body;
      const { phoneNumber, text } = errorDetails;
      sendsms(phoneNumber,text);
      res.json({ message: 'Error reported and processed successfully' });
    } catch (error) {
      console.error('Error processing error:', error);
      res.status(500).json({ error: 'Error processing error: ' + error.message });    
    }
  },
  sendErrorIoT: async (req, res) => {
    try {
      const errorDetails = req.body;
      const { iotIp, ErrorDetails } = errorDetails;
      sendIoT(iotIp,ErrorDetails);
      res.json({ message: 'Error reported and processed successfully' });
    } catch (error) {
      console.error('Error processing error:', error);
      res.status(500).json({ error: 'Error processing error: ' + error.message });    
    }
  },
  sendErrorphonecall: async (req, res) => {
    try {
      const errorDetails = req.body;
      const { phoneNumber, text } = errorDetails;
      sendphonecall(phoneNumber,text);
      res.json({ message: 'Error reported and processed successfully' });
    } catch (error) {
      console.error('Error processing error:', error);
      res.status(500).json({ error: 'Error processing error: ' + error.message });    
    }
  },
  sendErrorjira: async (req, res) => {
    try {
      const errorDetails = req.body;
      const { jiraBaseUrl,jiraEmail,apiToken,projectKey,text } = errorDetails;
      sendjira(jiraBaseUrl,jiraEmail,apiToken,projectKey,text);
      res.json({ message: 'Error reported and processed successfully' });
    } catch (error) {
      console.error('Error processing error:', error);
      res.status(500).json({ error: 'Error processing error: ' + error.message });    
    }
  },
  

  // startAutomatedMonitor: () => {
  //   console.log('Started Automated Monitoring');
  //   cron.schedule('* * * * *', async () => {
  //     try {
  //       const newErrors = await getNewErrors();
  //       processErrors(newErrors);
  //     } catch (error) {
  //       console.error('Error in automated monitoring:', error);
  //     }
  //   });
  // }
};

// async function getNewErrors() {
//   try {
//     const lastInsertedError = await Error.findOne().sort({ _id: -1 }).limit(1);
//     return lastInsertedError ? [lastInsertedError] : [];
//   } catch (error) {
//     console.error('Error fetching new errors:', error);
//     return [];
//   }
// }


module.exports = errorController;
