const express = require('express');
const app = express();
const cors = require('cors');
const errorsRoute = require('./routes/errorRoutes');
const connectToDB = require('./utils/db');
const bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

app.use(upload.array()); 

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(cors());

// Connect to MongoDB
connectToDB();

app.use('/', errorsRoute);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
