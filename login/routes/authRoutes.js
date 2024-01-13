const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/signup', authController.signup_post)

router.post('/login', authController.login_post)

router.get('/logout', authController.logout_get)
router.post('/changePassword', authController.changePassword_post)
router.get('/loginError' ,(req,res)=>{
    res.render('loginError')
})
module.exports = router