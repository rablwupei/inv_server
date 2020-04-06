var express = require('express');
var router = express.Router();
var Result = require('../inv/miaomiao/Result');

router.get('/', function(req, res, next) {
  (async () => {
    var results = await Result.request();
    res.render('index', { title:'inv', results:results });
  })().catch(function (e) {
    res.status(500).send(e);
  })
});

module.exports = router;
