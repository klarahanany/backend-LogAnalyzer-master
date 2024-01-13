
const axios = require('axios');

  ///data for jira
  

async function sendJira(jiraBaseUrl, jiraEmail,apiToken,projectKey,des){

    const authHeader = 'Basic ' + Buffer.from(jiraEmail + ':' + apiToken).toString('base64');

    // Get project info
    const apiUrl1 = `${jiraBaseUrl}/rest/api/2/project/${projectKey}`;

    axios.get(apiUrl1, {
    headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
    }
    })
    .then(response => {
    console.log('Project Details:', response.data); // Access response.data for project details
    })
    .catch(error => {
    console.error('Error fetching project:', error.response.data); // Access error.response.data for detailed error info
    });

    // Create a new ticket
    const issueData2 = {
    fields: {
        project: {
        key: projectKey
        },
        summary: 'New Issue via API',
        description: `${des}`,
        issuetype: {
        id: '10001' // Replace with the correct issue type ID
        }
    }
    };

    const apiUrl2 = `${jiraBaseUrl}/rest/api/2/issue`;

    axios.post(apiUrl2, issueData2, { 
    headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
    }
    })
    .then(response => {
    console.log('New Issue Created:', response.data);
    })
    .catch(error => {
    console.error('Error creating issue:', error.response.data);
    });
}
  
  
module.exports = sendJira;