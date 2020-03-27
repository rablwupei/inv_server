var express = require('express');
var router = express.Router();
var fs = require('fs');
var co = require('co');
var Excel = require('../inv/excel/Excel');

router.get('/:path', function(req, res, next) {
  var path = __dirname + "/../src/excel/" + req.params.path;
  fs.stat(path, function (err, stat) {
    if(err == null) {
      co(function*() {
        let result = yield Excel.requestResult(path, req.query.debug);
        res.render('excel', { title: req.params.path, result:result });
      });
    } else {
      res.sendStatus(404);
    }
  });
});

module.exports = router;
