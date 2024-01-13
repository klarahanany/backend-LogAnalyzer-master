const express = require('express')
const router = express.Router()
const authController = require('../login/controllers/authController')
const authRoutes = require("../login/routes/authRoutes");
const  {verifyUser,isLoggedIn, isAdmin}= require('../login/middleware/authMiddware')
const getAllEmployeesDataByCompany = require("../login/controllers/adminController");
const fileSystemRoute = require('../fileSystem/routes/fileSystemRoutes')
const ruleManagementRoutes = require('../ruleManagement/routes/ruleMangementRoutes')
const reportsManagement = require('../reportsManagement/controllers/reportsController')
//router.use('/', authRoutes)

// Protect all routes after this middleware
router.use(isLoggedIn);
router.use(isAdmin)
router.use('/report',reportsManagement);
router.use(fileSystemRoute)
router.use(ruleManagementRoutes)
router.route('/dashboard').
get(getAllEmployeesDataByCompany)



module.exports = router