require('console-stamp')(console, {
    format: ':date(yyyy/mm/dd HH:MM:ss.l) :label'
});
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Users = require('./inv/db/Users');
require('./inv/utils/prototype_extends');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

logger.format('inv', ':method :url :status - :response-time ms');
app.use(logger('inv', {
    skip: function (req, res) {
        return res.statusCode < 400
    }
}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/favicon.ico', (req, res) => res.status(204));

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
const session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var db = require("./inv/db/db").connect();
app.use(session({
    secret: require('./src/user').secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
    store: new MongoStore({
        mongooseConnection: db.connection,
        ttl: 7 * 24 * 60 * 60
    })
}));
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());

passport.use(new LocalStrategy(
    function(username, password, done) {
        Users.findByUsername({ username: username, password: password }, function(user) {
            if (!user) {
                return done(null, false, { message: 'Incorrect' });
            }
            return done(null, user);
        });
    }
));
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.use('/login', require('./routes/login'));

app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    req.session.returnTo = req.originalUrl;
    res.redirect('/login');
});

app.use('/', require('./routes/index'));
app.use('/excel', require('./routes/excel'));
app.use('/m', require('./routes/m'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.start = function () {
    require("./inv/timer/timer").start();
};

module.exports = app;
