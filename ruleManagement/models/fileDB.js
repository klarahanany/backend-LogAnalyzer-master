var mongoose = require('mongoose');


var fileSchema = mongoose.Schema({
    user_name: String,
    file_date: Date,
    date: Date,
    info: String
});

// var Rule = mongoose.model("Rule", ruleSchema, 'rules');

module.exports = fileSchema