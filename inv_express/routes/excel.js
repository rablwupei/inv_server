var express = require('express');
var router = express.Router();
var fs = require('fs');
/* GET users listing. */
router.get('/:path', function(req, res, next) {
  var path = __dirname + "/../src/excel/" + req.params.path;
  fs.stat(path, function (err, stat) {
    if(err == null) {
      res.send(path);
    } else {
      res.sendStatus(404);
    }
  });
});

module.exports = router;
