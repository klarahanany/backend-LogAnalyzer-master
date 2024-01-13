

async function sendIoTNotification(iotIp, details) {
  const serverUrl = `http://${iotIp}:3000/audio`;

  // Use dynamic import to import the 'node-fetch' module
  const fetch = (await import('node-fetch')).default;

  fetch(`${serverUrl}`, {
    method: "GET", // Note: 'POST' should be in uppercase
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`HTTP Error: ${response.status}`);
      }
    })
    .then((data) => {
      console.log(details);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
}

module.exports = sendIoTNotification;
