const nodemailer = require('nodemailer');
const { company_Exist, parseCompanyName } = require('./authController')
const { switchDB, getDBModel } = require("../../multiDatabaseHandler");
const userSchema = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { promisify } = require("util");


const sendVerificationEmail = async (email, verificationToken) => {
    console.log("Send email");
    // 1) Create a transporter
    // const transporter = nodemailer.createTransport({
    //   host: process.env.EMAIL_HOST,
    //   port: process.env.EMAIL_PORT,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD
    //   }
    // });
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'aff.markssh@gmail.com',
            pass: 'zcdaufonyexxotnw'

        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: '',
        to: email,
        subject: 'Account Verification',
        text: `Click the following link to verify your account: http://localhost:5000/verify/${verificationToken}`,
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });

};


const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        //verify token
        const decoded = await promisify(jwt.verify)(token, process.env.SECRET_CODE);
        const { companyName, email } = decoded
        console.log('email: ' + email)
        //1) swtichDB to AppTenant
        const db = await switchDB(companyName, 'employees', userSchema)
        //2) create new admin user in AppTenant
        const userModel = await getDBModel(db, 'employees', userSchema)
        // Verify the token and update the user's 'isVerified' status

        let myQuery = { email };
        let newValue = { $set: { isVerified: true } };
        await userModel.updateOne(myQuery, newValue)
        try {
            // //change admin pass in mainDB too
            const mainDB = await switchDB('MainDB', 'admins', userSchema)
            //2) point to users collections in companyDB
            const adminModel = await getDBModel(mainDB, 'admins', userSchema)
            await adminModel.updateOne(myQuery, newValue)
        }
        catch (e) {
            console.log('maindb:' + e)
        }
        res.redirect("http://localhost:3000/admin/login");

        // await user.save();
        // res.redirect("/login"); // Redirect to the login page after successful verification
        // res.status(200).json({ status: 'user verified.' });


    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}





//const companyName = 'gmail';
const forgetPass_post = async (req, res) => {
    const email = req.body.email;
    const companyName = parseCompanyName(email);
    // check if company is defined
    if (!(await company_Exist(companyName))) return res.status(404).json({
        errors: {
            status: `The company ${companyName} is not registered.`,
        },
    });
    req.companyName = companyName;
    //1)  Determine the tenant company database

    const companyDB = await switchDB(companyName, 'employees', userSchema)
    //2) point to users collections in companyDB
    const userModel = await getDBModel(companyDB, 'employees', userSchema)
    console.log('forgotpass: ' + email)
    try {
        const oldUser = await userModel.findOne({ email })
        if (!oldUser) {
            res.json({ status: "User Not Exists!!" })
        }
        const secret = process.env.SECRET_CODE

        // const secret = process.env.SECRET_CODE + oldUser.password
        const token = await jwt.sign({ email: oldUser.email, id: oldUser._id, companyName }, secret, { expiresIn: '50m' });
        // const resetToken = userModel.createPasswordResetToken()
        //  await userModel.save();
        const link = `http://localhost:3000/resetPass/${oldUser._id}/${token}`
        console.log(link)

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'aff.markssh@gmail.com',
                pass: 'zcdaufonyexxotnw'

            }
        });

        var mailOptions = {
            from: 'lart0242@gmail.com',
            to: email,
            subject: 'Forgot password',
            text: link
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(201).json({
                    message: "check your email to reset your password"
                });
            }
        });
    }
    catch (err) {
        console.log(err)
    }
}


// const resetPassword_get = async (req, res) => {
//     const { id, token } = req.params
//     //verify token
//     const decoded = await promisify(jwt.verify)(token, process.env.SECRET_CODE);
//     const companyName =  decoded.companyName
//     //check if company is defined
//     if(!(await company_Exist(companyName))) return res.status(404).json({
//         errors: {
//             status: `The company ${companyName} is not registered.`,
//         },
//     });

//     const companyDB = await switchDB(companyName,'employees', userSchema)
//     //2) point to users collections in companyDB
//     const userModel= await getDBModel(companyDB,'employees',userSchema)
//     const oldUser = await userModel.findById(id)
//     console.log(oldUser)
//     if (!oldUser) {
//         res.json({ status: "User Not Exists!!" })
//     }

//     // try {

//     //     res.render("resetPass", { email: decoded.email, status: "not verified" })
//     // }
//     // catch (err) {
//     //     res.json({status : "please ask one more time for changing your password"})
//     // }

//     // res.send(req.params)
// }
const resetPassword_post = async (req, res) => {
    const { id, token } = req.params
    const { password } = req.body
    console.log(id)
    try {
        const decoded = await promisify(jwt.verify)(token, process.env.SECRET_CODE);
        const companyName = decoded.companyName
        // check if company is defined
        if (!(await company_Exist(companyName))) return res.status(404).json({
            errors: {
                status: `The company ${companyName} is not registered.`,
            },
        });
        const companyDB = await switchDB(companyName, 'employees', userSchema)
        //2) point to users collections in companyDB
        const userModel = await getDBModel(companyDB, 'employees', userSchema)


        const user = await userModel.findById(id);
        console.log(user)
        if (!user) {
            return res.json({ status: "User Not Exists!!" })
        }
        const encryptedPass = await bcrypt.hash(password, 10)
        let myQuery = { _id: id };
        let newValue = { $set: { password: encryptedPass } };
        await userModel.updateOne(myQuery, newValue)
        try {
            myQuery = { email: decoded.email };
            //change admin pass in mainDB too
            const mainDB = await switchDB('MainDB', 'admins', userSchema)
            //2) point to users collections in companyDB
            const userModel = await getDBModel(mainDB, 'admins', userSchema)
            await userModel.updateOne(myQuery, newValue)
            res.json({ status: "your password has been changed" })
        } catch (e) {
            console.log(e)
            res.json({ status: "please ask one more time for changing your password" })
        }
    }
    catch (err) {
        console.log(err)
        res.json({ status: "please ask one more time for changing your password" })
    }

    // res.send(req.params)

}

module.exports = { forgetPass_post, resetPassword_post, verifyEmail, sendVerificationEmail }
