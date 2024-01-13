const {promisify}  = require('util')
const jwt = require('jsonwebtoken')
const userSchema = require('../models/userModel')
const catchAsync =require('../utils/catchAsync')
const AppError = require("../utils/appError");
const {switchDB, getDBModel} = require("../../multiDatabaseHandler");



// Only for rendered pages, no errors!
const isLoggedIn = catchAsync(  async (req, res, next) => {
    let token
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {

        token = req.headers.authorization.split(' ')[1];
        try {

            // 1) verify token
            const decoded = await promisify(jwt.verify)(
                token,
                process.env.JWT_SECRET
            );
            // 2) Check if user still exists
            // Switch to the specific database based on the company name
            const dbForCompany = await switchDB(decoded.companyName, 'employees', userSchema);

            if (!dbForCompany) {
                throw new Error(`Unable to switch to database for company: ${decoded.companyName}`);
            }

            // Use the dbForCompany to get the model
            const employeeModel = await getDBModel(dbForCompany, 'employees', userSchema);
            const currentUser = await employeeModel.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            req.companyName = decoded.companyName
            req.companyDB = dbForCompany
            req.user = currentUser
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            console.log('isLoggedIn', err)
            return next();
        }
    } else {
        res.status(401).json({
            status: 'error',
            message: 'Unauthorized: not logged in.',
        });
        return next(new AppError('You are not logged in.', 401))
    }
})



const verifyUser = catchAsync(  async (req, res, next) => {
    //1 getting token and check if it's there
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {// Retrieve the JWT from the HttpOnly cookie
        token = req.cookies.jwt;
    }

    if (!token) {
        res.status(401).json({
            status: 'fail',
            message: 'Unauthorized!',
        });
        return next(new AppError('You are not logged in.', 401))
    }
// 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET_CODE);

    // 3) Check if user still exists
     const currentUser = ({username, firstName, lastName} = decodedToken)
   // const currentUser = await userModel.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist.',
                401
            )
        );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password! Please log in again.', 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
})



//verifying the token for any route we choose to protect only for signed in users
const onlyForUsers = (req,res,next)=>{
    const token = req.cookies.jwt//get the token from cookie (if user is already signed)
    //check jwt exists and is verified
    if(token){
        jwt.verify(token,process.env.SECRET_CODE, (err, decodedToken)=>{
            if(err){//if we have token but not valid
                console.log(err.message)
                res.redirect('/login')
            }else{//is valid user

                next()
            }
        })
    }else{ //the user isn't logged in
        res.redirect('/loginError')
        res.status(400).end()
    }

}

//check current user
const currentUser =  (req,res,next) => {
    const token = req.cookies.jwt//get the token from cookie (if user is already signed)
    //check jwt exists and is verified
    if(token) {
        //verify the token and then u get decoded token on callback function which has in it
        //saved user id
        jwt.verify(token,process.env.SECRET_CODE, async (err, decodedToken) => {
            if (err) {//if we have token but not valid
                console.log(err.message)
                res.locals.user= null
                next()
            } else {//is valid user

                //res.locals.user =await userModel.findById(decodedToken.id)
                res.locals.user = ({username, firstName, lastName} = decodedToken)
                next()
            }
        })
    }else{
        res.locals.user = null
        next()
    }
}


// Middleware to check user role
async function isAdmin(req, res, next) {

    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({message: 'Authorization token missing'});
    }

    try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET
        );
        const userRole = decoded.role;

        if (userRole === 'admin') {
            // User is an admin, allow access
            // req.companyName = decoded.companyName;
            // req.role = userRole
           return next();
        } else {
            // User is not an admin, deny access
            res.status(403).json({message: 'Access denied: Admin role required'});
        }
    } catch (error) {

        res.status(401).json({message: 'Invalid token or jwt expired'});
        console.log(error)
    }
}

module.exports = {onlyForUsers, currentUser, verifyUser,isLoggedIn,isAdmin}