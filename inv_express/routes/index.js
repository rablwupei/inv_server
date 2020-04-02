var express = require('express');
var router = express.Router();
var co = require('co');
var Result = require('../inv/miaomiao/Result');

router.get('/', function(req, res, next) {
  (async () => {
    var results = await Result.request();
    res.render('index', { title:'inv', results:results });
  })();
});

module.exports = router;
