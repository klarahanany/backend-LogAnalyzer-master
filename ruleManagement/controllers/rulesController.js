
const {switchDB, getDBModel} = require("../../multiDatabaseHandler");
const ruleSchema = require('../models/RulesDB')

async function getRulesByName(ruleNames, companyName) {
    const companyDB = await switchDB(companyName, 'rules', ruleSchema)
    let Rule = await getDBModel(companyDB, "rules", ruleSchema)
    try{
        const result = await Rule.find({ruleName:  ruleNames});
        if(result)
            return result
    }catch (e) {
        console.log('GetrulesByname:'  + e)
    }

}
async function getAllRules(databaseName) {
    const connection = await getDatabaseConnection(databaseName);
    const rulesModel = await getDBModel(connection,'rules',ruleSchema)
    try {


         const res = await rulesModel.find({});

        return res
    } catch (error) {
        console.log("Error in get all rules", error);
        return "error";
    }
}

// async function getRulesByName(rules, databaseName) {
//     const connection = await getDatabaseConnection(databaseName);
//     const rulesModel = await getDBModel(connection,'rules',ruleSchema)
//     try {
//
//
//         const result = await rulesModel.find(
//             { ruleName: { $in: rules } },
//             { _id: 0, __v: 0, userName: 0 }
//         );
//         return result;
//     } catch (error) {
//         return error;
//     }
// }
async function createNewRule(databaseName, req) {
    const connection = await switchDB(databaseName, 'rules', ruleSchema);
    const rulesModel = await getDBModel(connection,'rules',ruleSchema)
    try {


        const check = await rulesModel.findOne({
            ruleName: req.body.ruleName,
        });
        if (check) {
            return "rule already exists";
        } else {
           const newRule = new rulesModel({
               ruleName: req.body.ruleName,
               keywords :req.body.keywords
           })

           // newRule.userName = req.user.userName;

            return await newRule.save();
        }
    } catch (error) {
        console.log("Error in creating the rule", error);
    }
}

async function deleteExistedRule(databaseName, req) {
    const connection = await getDatabaseConnection(databaseName);
    const rulesModel = await getDBModel(connection,'rules',ruleSchema)
    try {

        const ruleExists = await rulesModel.findOne({
            ruleName: req.params.id,
        });

        if (!ruleExists) return "rule dose not exists!";
        else {
            if (
              //  ruleExists.userName === req.user.userName ||
                req.role === "admin"
            ) {
                const deletedRule = await rulesModel.findOneAndRemove({
                    ruleName: req.params.id,
                });
                return "Deleted Successfully";
            } else {
                return "not authorized";
            }
        }
    } catch (error) {
        //console.log("Error in deleting rule", error);
        return "Error not able to delete the rule   ";
    }
}

async function updateRule(databaseName, req) {
    try {
        const connection = await getDatabaseConnection(databaseName);
        const rulesModel = await getDBModel(connection,'rules',ruleSchema)

        const ruleExists = await rulesModel.findOne({
            ruleName: req.body.ruleName,
        });

        console.log(ruleExists);
        if (!ruleExists) return "rule dose not exists!";
        else {
            if (
             //   req.body.userName === req.user.userName ||
                req.role === "admin"
            ) {
                for (let elem in req.body) {
                    ruleExists[elem] = req.body[elem];
                }

                const result = await ruleExists.save();

                return result;
            } else {
                return "not authorized";
            }
        }
    } catch (error) {
        console.log("Error in updating rule", error);
    }
}

async function getDatabaseConnection(databaseName) {
    try {
        return await switchDB(databaseName, 'rules', ruleSchema);
    } catch (error) {
        console.log("Error in connecting to database ", error);
    }
}

module.exports = {
   getRulesByName,
    getAllRules,
    createNewRule,
    updateRule,
    deleteExistedRule,
};