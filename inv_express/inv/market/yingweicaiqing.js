let AbstractStock = require('./AbstractStock');
let util = require('util');

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

    parseStock(body) {
        const cheerio = require('cheerio');
        const $ = cheerio.load(body);
        let children = $("div[class='top bold inlineblock']").children();
        this.price = this.convert($(children[0]).text());
        this.change = parseFloat($(children[1]).text());
        this.percent = this.parsePercentDivisor100($(children[3]).text());
    }
}

var http = require('../utils/http');

class yingweicaiqing {

    getOption() {
        var option = {};
        option.url = "https://cn.investing.com";
        option.headers = {};
        option.headers['Referer'] = option.url;
        return option;
    }

    async get(code) {
        var that = this;
        var url = "https://cn.investing.com/indices/%s-historical-data";
        var option = that.getOption();
        option.url = util.format(url, code);
        var body = await http.get(option.url, option);
        var stock = new YingweicaiqingStock(code);
        stock.parse(body);
        return stock;
    }

    async getETF(code) {
        var that = this;
        var url = "https://cn.investing.com/etfs/%s-historical-data";
        var option = that.getOption();
        option.url = util.format(url, code);
        var body = await http.get(option.url, option);
        var stock = new YingweicaiqingStock(code);
        stock.parse(body);
        return stock;
    }

    async getAny(any, code) {
        var that = this;
        var url = "https://cn.investing.com/%s/%s-historical-data";
        var option = that.getOption();
        option.url = util.format(url, any, code);
        var body = await http.get(option.url, option);
        var stock = new YingweicaiqingStock(code);
        stock.parse(body);
        return stock;
    }

    async getStock(code) {
        var that = this;
        var url = "https://cn.investing.com/indices/%s";
        var option = that.getOption();
        option.url = util.format(url, code);
        var body = await http.get(option.url, option);
        var stock = new YingweicaiqingStock(code);
        stock.parseStock(body);
        return stock;
    }

}

// (async () => {
//     await new yingweicaiqing().getStock("india-50-futures");
// })();

module.exports = yingweicaiqing;