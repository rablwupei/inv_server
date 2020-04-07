var express = require('express');
var router = express.Router();
var fs = require('fs');
var Excel = require('../inv/excel/Excel');

router.get('/:path', function (req, res, next) {
    var path = __dirname + "/../src/excel/" + req.params.path;
    fs.stat(path, function (err, stat) {
        if (err == null) {
            (async () => {
                let result = await Excel.requestResult(path, req.query.debug);
                res.render('excel', {title: req.params.path, result: result});
            })().catch(function (e) {
                res.status(500).render('500', {error: e});
            });
        } else {
            res.status(404).send("not found");
        }
    });
});

module.exports = router;
