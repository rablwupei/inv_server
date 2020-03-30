var AbstractStock = require('./AbstractStock');
var util = require("util");
var moment = require("moment");

String.prototype.replaceAll = function (FindText, RepText) {
    regExp = new RegExp(FindText, "g");
    return this.replace(regExp, RepText);
};

class WangyiStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    convert(yiOrWan) {
        let value = yiOrWan.replaceAll(",", "");
        value = value.replaceAll("万", "");
        value = value.replaceAll("亿", "");
        value = parseFloat(value);
        if (yiOrWan.endsWith("亿")) {
            value = value * 10000;
        }
        return value;
    }

    parse(text) {
        const cheerio = require('cheerio');
        const $ = cheerio.load(text);
        let array = [];
        let that = this;
        $("#fn_fund_value_trend").find("tbody").children().each(function (index, elem) {
            var obj = {};
            array[index] = obj;
            $(elem).children().each(function (index, subElem) {
                obj[index] = $(subElem).text();
            });
            obj["cjl"] = that.convert(obj[3]);
            obj["cjje"] = that.convert(obj[4]);
            obj["hsl"] = parseFloat(obj[5].replaceAll("%", "")) / 100;
        });
        //网易[161129][0][cjl]  网易[161129][0][cjje] 网易[161129][0][hsl]
        this.json = array;
    }
}

var http = require('../utils/http');
var wangyi = {};

wangyi.url = "http://quotes.money.163.com/fund/zyjl_%s.html?start=%s&end=%s";

wangyi.get = function*(code) {
    var now = moment();
    var last = moment().subtract(20, 'days');
    var url = util.format(wangyi.url, code, last.format('YYYY-MM-DD'), now.format('YYYY-MM-DD'));
    var referer = url;
    var body = yield http.get(url, {headers: {'Referer': referer} });
    body = body.trim();
    var stock = new WangyiStock(code);
    stock.parse(body);
    return stock;
};

require('co')(function* () {
    yield wangyi.get("161129");
});

module.exports = wangyi;