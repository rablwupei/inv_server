let moment = require("moment");

let mongoose = require('mongoose');
let stocksSchema = mongoose.Schema({
    code: {type: String, index: true},
    name: String,
    data: [{
        cur: Number,
        percent: Number,
        date: Date,
    }],
});

let Stocks = mongoose.model('Stocks', stocksSchema, 'Stocks');

Stocks.saveDBUnit = function(dbUnit) {
    let code = dbUnit.code;
    let name = dbUnit.name;
    let stock = dbUnit.stock;
    return new Promise(function (resolve, reject) {
        Stocks.findOne({code: code}, function (err, value) {
            if (err) {
                reject(err);
                return;
            }
            if (!value) {
                value = new Stocks();
                value.code = code;
                value.name = name;
                value.data = [];
            }
            stock.date = new Date();
            if (value.data.length > 0 && moment(stock.date).isSame(moment(value.data[0].date), 'day') ) {
                value.data[0] = stock;
            } else {
                value.data.insert(0, stock);
            }
            while (value.data.length > 5) {
                value.data.pop();
            }
            value.save(function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    });
};

Stocks.loadDBUnit = async function(ids) {
    let map = {};
    for (let id of ids) {
        let unit = await Stocks.findOne({code: id}).exec();
        if (unit) {
            map[id] = unit.data;
        }
    }
    return map;
};

module.exports = Stocks;