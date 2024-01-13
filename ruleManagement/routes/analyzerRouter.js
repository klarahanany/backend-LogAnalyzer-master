var express = require('express');
var router = express.Router();
const analyzer = require('../analyzation/analyze');

router.post('/', function (req, res) {
    //get the file naem and the selected rules from the request body
    // selectedRules:
    //selectedDocument
    const rules = req.body.selectedRules;
    const file = req.body.selectedDocument;
    const companyName = req.companyName
     analyzer(req, rules, file,companyName, (err, analyzed) => {
        if (err) {
            console.log("analyzed route: "+ err)
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json(analyzed);
        }
    });
});



module.exports = router;