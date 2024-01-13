const Log = require('../models/Log'); // Import your log model

async function saveLog(errorId, severity, operation, timestamp, userName) {
  try {
    const log = new Log({
      errorId,
      severity,
      operation,
      timestamp,
      userName,
    });
    await log.save();
  } catch (error) {
    console.error('Error saving log:', error);
  }
}

module.exports = saveLog;
