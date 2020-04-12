var express = require('express');
var router = express.Router();
var Result = require('../inv/miaomiao/Result');

router.get('/', function (req, res, next) {
    res.redirect('/excel')
});

module.exports = router;
