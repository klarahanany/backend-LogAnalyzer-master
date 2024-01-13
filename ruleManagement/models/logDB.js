var mongoose = require('mongoose');


var rawSchema = mongoose.Schema({
    rule: String,
    rank: Number,
    message: String,
    date: Date
});

var logSchema = mongoose.Schema({
    file_name: String,
    user_name: String,
    file_date: Date,
    process: [rawSchema]
});

var Log = mongoose.model("Log", logSchema, 'log_analyzation');

module.exports = logSchema;