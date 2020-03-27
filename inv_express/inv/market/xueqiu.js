var AbstractStock = require('./AbstractStock');
var util = require("util");
var request = require('request');

class XueqiuStock extends AbstractStock {
    constructor(code) {
        super(code);
    }
/*
{
  symbol: 'USO',
  code: 'USO',
  avg_price: 4.803,
  delayed: 0,
  type: 4,
  percent: -4.92,
  tick_size: 0.01,
  float_shares: null,
  amplitude: 6.3,
  current: 4.83,
  high: 4.96,
  current_year_percent: -62.3,
  float_market_capital: null,
  issue_date: 1144598400000,
  low: 4.64,
  sub_type: '8193',
  market_capital: 668472000,
  currency: 'USD',
  lot_size: 1,
  lock_set: 1,
  timestamp: 1585252800201,
  amount: 603391337,
  chg: -0.25,
  last_close: 5.08,
  volume: 125628011,
  turnover_rate: 90.77,
  name: '美国原油基金',
  exchange: 'ARCA',
  time: 1585252800201,
  total_shares: 138400000,
  open: 4.9,
  status: 1
}
 */
    parse(text) {
        this.json = JSON.parse(text).data.quote;
    }

}
var http = require('../utils/http');
var xueqiu = {};

xueqiu.url = "https://stock.xueqiu.com/v5/stock/quote.json?symbol=%s";

xueqiu.get = function(code) {
    var option = {};
    option.url = 'http://www.xueqiu.com';
    option.headers = {};
    option.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36';
    option.headers['Referer'] = 'http://www.xueqiu.com';
    option.gzip = true;
    var request = require('request');
    var j = request.jar();
    var request = request.defaults({jar:j});
    return new Promise(function(resolve, reject) {
        request(option, function () {
            option.url = util.format(xueqiu.url, code);
            request(option, function (error, response, body){
                body = body.trim();
                var stock = new XueqiuStock(code);
                stock.parse(body);
                resolve(stock);
            });
        });
    });
};

// require("co")(function* () {
//     yield xueqiu.get("USO");
// });

module.exports = xueqiu;