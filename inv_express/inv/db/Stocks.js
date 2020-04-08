let moment = require("moment");

let mongoose = require('mongoose');
let stocksSchema = mongoose.Schema({
    code: {type: String, index: true},
    name: String,
    data: [{
        cur: Number,
        percent: Number,
        share: Number,
        date: Date,
    }],
});

let Stocks = mongoose.model('Stocks', stocksSchema, 'Stocks');

Stocks.saveOne = function(code, name, stock) {
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
            } else {
                value.name = name;
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

Stocks.loadMapFromCodes = async function(codes) {
    let map = {};
    for (let code of codes) {
        let unit = await Stocks.findOne({code: code}).exec();
        if (unit) {
            map[code] = unit.data;
        }
    }
    return map;
};

module.exports = Stocks;