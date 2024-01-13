const sendSMS = require('./sendSMS'); // Import notification services
const sendEmail = require('./sendEmail');
const phoneCall = require('./phoneCall');
const sendIoTNotification = require('./sendIoTNotification');
const sendJira = require('./jiraNotification');
const saveLog = require('./saveLog'); // Import function to save logs in the database

async function processError(errorDetails) {
  const { errors, date, file_name, username, email,phone,IP_IOT, ...otherDetails } = errorDetails;
  const jiraBaseUrl = 'https://jirapr124.atlassian.net'; // Corrected base URL
  const jiraEmail = 'rahmaazaiza2002@gmail.com';
  const apiToken = 'ATATT3xFfGF0jou8BuyT0H-_GAaurlyFBldCWlRcMboinBQVaZuRC_spu3DICIgagyCsREC4BzGqar8HDERMQyMexYyhKHJJ-hUyKxOwI6d9cpx7FyWlSTrgjl-V0nnQezgqm7dxKvL0QkofgE6eTO1qZK2Du7j_qis3BZvQVauQ5SvXTryinH4=8AF2CF52'; // Replace with your API token
  const projectKey = 'KAN';
  
  // Process error based on severity
  for(error in errors){
    const {rule,rank,message,_id} = error;
    switch (rank) {
      case 3:
        await phoneCall(phone,`Hi ${username},There is a log problem, please solve it as soon as possible. Detaails in Jira`);
        await sendSMS(phone,`Hi ${username},\nThere is a log problem, please solve it as soon as possible. \nDetaails in Jira`);
        await sendJira(jiraBaseUrl, jiraEmail,apiToken,projectKey, `High-severity error: ${message}`);

        break;
      case 2:
        await sendIoTNotification(iotIp, `Medium-severity error: ${message}`);
        await sendJira(jiraBaseUrl, jiraEmail,apiToken,projectKey,`Medium-severity error: ${message}`);
        await sendEmail(email,"Medium-severity error",message)
        break;
      case 1:
        await sendJira(jiraBaseUrl, jiraEmail, apiToken, projectKey,`Low-severity error: ${message}`);
        break;
      default:
        // Handle other cases
    }
    
    // Log the operation in the database
    await saveLog(rank, rule, new Date(), username,_id);
  }
}

module.exports = processError;
