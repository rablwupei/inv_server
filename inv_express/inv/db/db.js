let db = {};

db.init = async function() {
    if (db.mongoose) {
        return db.mongoose;
    }
    const mongoose = require('mongoose');
    mongoose.Promise = Promise;
    let info = require('../../src/mongo');
    await mongoose.connect(`mongodb://${info.host}:${info.port}/${info.db}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        user: info.user,
        pass: info.password,
        authSource: info.source,
    });
    db.mongoose = mongoose;
    return mongoose;
};

db.save = async function() {
    let mongoose = await db.init();
    console.log("connect");
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

(async ()=>  {
    await db.save();
})();

module.exports = db;