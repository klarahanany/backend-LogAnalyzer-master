const mongoose = require('mongoose');


const ruleSchema = mongoose.Schema({
    ruleName: String,
    keywords :[]
});

//var Rule = mongoose.model("Rule", ruleSchema, 'rules');

module.exports = ruleSchema;