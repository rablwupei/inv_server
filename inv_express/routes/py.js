var express = require('express');
var router = express.Router();
var fs = require('fs');
var Excel = require('../inv/excel/Excel');

router.get('/*', function (req, res, next) {
    let fileName = req.params[0];
    let path = __dirname + "/../src/excel/" + fileName;
    fs.stat(path, function (err, stat) {
        (async () => {
            let files = await Excel.list();
            if (!err && stat.isFile()) {
                let result = await Excel.requestResult(path, req.query.debug);
                res.render('excel', {title: fileName, result: result, files: files});
            } else {
                res.render('excel', {title: "list", result: null, files: files});
            }
        })().catch(function (e) {
            console.error(e);
            res.status(500).render('500', {error: e});
        });
    });
});

module.exports = router;
