const ruleSchema = require('../models/rulesDB');
const rulesArray = require('../analyzation/rules');
const {switchDB, getDBModel} = require("../../multiDatabaseHandler");



async function getRules(companyName, callback) {
    const db = getDatabaseConnection(companyName)
    const ruleModel = await getDBModel(db, 'rules', ruleSchema)
    ruleModel.find({})
        .then((rules) => {
            callback(null, rules);
        })
        .catch((err) => {
            callback(err, null);
        });
}



function addRule() {
    Rule.insertMany(rulesArray);
}
async function getDatabaseConnection(databaseName) {
    try {
        return await switchDB(databaseName, 'rules', ruleSchema);
    } catch (error) {
        console.log("Error in connecting to database ", error);
    }
}

module.exports = {
    getRules,
    addRule
};