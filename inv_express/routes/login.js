var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function (req, res, next) {
    let error = req.flash('error');
    if (error.length <= 0) {
        error = null;
    }
    res.render('login', {title: 'Login', error: error});
});

router.post('/', passport.authenticate('local', {
    successReturnToOrRedirect : '/',
    failureRedirect           : '/login',
    failureFlash              : true
}));

module.exports = router;
