const express = require('express');

const cors = require("cors");
const cookieSession = require("cookie-session");
const adminRoutes = require('./systemRoutes/adminRoutes')
const authRoutes = require('./login/routes/authRoutes')
const userRoutes = require('./login/routes/userRoutes')
const emailRoutes = require('./login/routes/emailRoutes')
const googleAuthRouter = require('./login/routes/googleAuthRouter')
const cookieParser = require ('cookie-parser')
const bodyParser = require('body-parser');
const {currentUser,onlyForUsers,usersOnly, isLoggedIn} = require("./login/middleware/authMiddware");
const globalErrorHandler = require('./login/controllers/errorController');
const app = express();
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const {switchDB, getDBModel} = require("./multiDatabaseHandler");
const userSchema = require("./login/models/userModel");
const {Response, Request, NextFunction} = require('express')
const passport = require("passport");
const {upload} = require("./fileSystem/controllers/fileSystemController");
// middleware
app.use(express.static('public'));
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));
//It prevents any random website from using your authenticated cookies to send an API request to your bank's website and do stuff like secretly withdraw money.

app.use(cookieParser());

 // app.use(upload.array("files",10));



// app.all('*', function (req, res) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
//     res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//     //...
// });
app.use(
    cookieSession({
        maxAge: 24 * 60 * 60 * 1000,
        keys: [process.env.COOKIE_KEY],
    })
);

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(
    cors(
        {
           origin: `http://localhost:3000`,
            methods: "GET,POST,PUT,DELETE",
            credentials: true,
        }
    )
);
//Data sanitization against XSS
// app.use(xss());
// Prevent parameter pollution

// view engine
app.set('view engine', 'ejs');

app.use(globalErrorHandler);
// routes

app.get('*', currentUser)//apply to every route (protect routes)

app.use("/",emailRoutes)
app.use('/auth',googleAuthRouter)
app.use("/",authRoutes)
app.use('/admin',adminRoutes)
app.use("/home",userRoutes)


module.exports = app;