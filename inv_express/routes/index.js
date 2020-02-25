var express = require('express');
var router = express.Router();
var co = require('co');
var Result = require('../inv/Result');

/* GET home page. */
router.get('/', function(req, res, next) {
  co(function*() {
    var results = yield Result.request();
    res.render('index', { title:'inv', results:results });
  });
});

module.exports = router;
