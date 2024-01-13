const fs = require('fs');
const {onSignupNewDatabase,switchDB,getDBModel} = require('../../multiDatabaseHandler')
const userSchema = require('../models/userModel')

async function getAllEmployeesDataByCompany(req, res) {
    // Switch to the specific database based on the company name
    // const companyName = 'gmail'
    const companyName = req.companyName

    const dbForCompany = await switchDB(companyName, 'employees', userSchema);

    if (!dbForCompany) {
        throw new Error(`Unable to switch to database for company: ${companyName}`);
    }

    // Use the dbForCompany to get the model
    const employeeModel = await getDBModel(dbForCompany, 'employees', userSchema);

    // Fetch all employees for that company and return json array
   const allUsers =await employeeModel.find({});
   return res.status(200).send(JSON.stringify(allUsers,null,2))
}


module.exports = getAllEmployeesDataByCompany