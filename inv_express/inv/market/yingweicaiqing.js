let AbstractStock = require('./AbstractStock');
let util = require('util');

String.prototype.replaceAll = function (FindText, RepText) {
    regExp = new RegExp(FindText, "g");
    return this.replace(regExp, RepText);
};

class YingweicaiqingStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    convert(value) {
        value = value.replaceAll(",", "");
        value = value.replaceAll("%", "");
        return value;
    }

    parse(text) {
        const cheerio = require('cheerio');
        const $ = cheerio.load(text);
        let array = [];
        let that = this;
        $("#curr_table").find("tbody").children().each(function (index, elem) {
            var obj = {};
            array[index] = obj;
            $(elem).children().each(function (index, subElem) {
                obj[index] = that.convert($(subElem).text());
            });
            var num = parseFloat(obj[6]);
            if (!isNaN(num)) {
                obj[6] = num / 100;
            }
        });
        this.array = array;
    }
}

var http = require('../utils/http');
var yingweicaiqing = {};

yingweicaiqing.url = "https://cn.investing.com/indices/%s-historical-data";

yingweicaiqing.get = function*(code) {
    var url = util.format(yingweicaiqing.url, code);
    var referer = url;
    var body = yield http.get(url, {headers: {'Referer': referer} });
    var stock = new YingweicaiqingStock(code);
    stock.parse(body);
    return stock;
};

// require('co')(function* () {
//     yield yingweicaiqing.get("dj-select-reit");
// });

module.exports = yingweicaiqing;