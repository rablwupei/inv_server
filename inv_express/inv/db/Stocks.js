let moment = require("moment");

let mongoose = require('mongoose');
let stocksSchema = mongoose.Schema({
    code: {type: String, index: true}, //代码
    name: String, //名称
    type: String, //类型
    data: [{
        price: Number, //价格
        percent: Number, //涨跌幅
        change: Number, //价格变化
        share: Number, //份额
        date: Date, //时间
    }],
});

let Stocks = mongoose.model('Stocks', stocksSchema, 'Stocks');

Stocks.saveOne = function(code, name, type, stock) {
    return new Promise(function (resolve, reject) {
        Stocks.findOne({code: code}, function (err, value) {
            if (err) {
                reject(err);
                return;
            }
            if (!value) {
                value = new Stocks();
                value.code = code;
                value.data = [];
            }
            value.name = name;
            value.type = type;

            stock.date = new Date();
            if (value.data.length > 0 && moment(stock.date).isSame(moment(value.data[0].date), 'day') ) {
                value.data[0] = stock;
            } else {
                value.data.insert(0, stock);
            }
            while (value.data.length > 10) {
                value.data.pop();
            }
            value.save(function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                // console.log("[mongo] save: " + JSON.stringify(value));
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