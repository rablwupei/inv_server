let db = {};

db.connect = function() {
    const info = require('../../src/mongo');
    const mongoose = require('mongoose');
    mongoose.Promise = Promise;
    mongoose.connect(`mongodb://${info.host}:${info.port}/${info.db}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        user: info.user,
        pass: info.password,
        authSource: info.source,
    });
    mongoose.connection.on('error', console.error.bind(console, '[mongo] connect error: '));
    mongoose.connection.once('open', function() {
        console.log("[mongo] connect success");
    });
};

db.save = async function() {
    let mongoose = require('mongoose');
    let stocksSchema = mongoose.Schema({
        code: {type: String, index: true},
        name: String,
        data: [{
            price: Number,
            date: Date,
        }],
    });
    let Stocks = mongoose.model('Stocks', stocksSchema, 'Stocks');
    let stocks = new Stocks({
        code: "170020",
        name: "原油期货",
        data: [
            { price: 1.1, date: new Date() },
        ],
    });
    await Stocks.deleteMany({});
    await stocks.save();
    stocks.data.unshift({ abc:1.0, price: 1.1, date: new Date() });
    await stocks.save();
    console.log("ok");

};

module.exports = db;