let db = {};

db.connect = function() {
    const info = require('../../src/mongo');
    const mongoose = require('mongoose');
    mongoose.Promise = Promise;
    let url = `mongodb://${info.host}:${info.port}/${info.db}`;
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        user: info.user,
        pass: info.password,
        authSource: info.source,
    });
    mongoose.connection.on('error', console.error.bind(console, '[mongo] connect error: '));
    mongoose.connection.once('open', function() {
        console.log(`[mongo] connect success. host: ${url}`);
        require('./DBExcel').exec();
    });
    return mongoose;
};

module.exports = db;