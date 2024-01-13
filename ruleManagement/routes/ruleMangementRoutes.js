const express = require('express')
const router = express.Router()
const log = require('./logsRouter');
const rule = require('./ruleRouter.js')
const analyze = require('./analyzerRouter.js');

router.use('/filesList', log);
router.use('/rule', rule);
router.use('/analyze', analyze);

module.exports = router