var express = require('express')
var router = express.Router();
const {createNewRule, getAllRules, deleteExistedRule, updateRule} = require("../controllers/rulesController");

router.get('/', async function (req, res) {
    try {
        const allRules = await getAllRules(req.companyName);
        res.status(200).json(allRules); // Send the JSON array directly
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post("/", async (req, res) => {
    const result = await createNewRule(req.companyName, req);
    console.log('post rule result:', result)
    if (typeof result === "string") {
        if (result === "rule already exists" || result.includes("Error")) {
            res.status(400).json( {message : "rule already exists"});
        }
    } else {
        res.status(200).json( result);
    }
});

router.delete('/:id',async (req,res) => {
    console.log(req.params.id)
    const result = await deleteExistedRule(req.companyName, req)
        if(result === "Deleted Successfully")
            res.status(200).json(result)
        else{
            res.status(400).json(result)
        }


});

router.put('/', async (req,res)=>{

    console.log("put router",req.body)
    const result = await updateRule(req.companyName, req)
    if(result)
        res.status(200).json(result)
    else{
        res.status(400).json(result)
    }

})

module.exports = router;
