const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  name: String,
  severity: String,
  description: String,
});

const Log = mongoose.model('Log', LogSchema);

module.exports = Log;
