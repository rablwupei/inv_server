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

class yingweicaiqing {

    getOption() {
        var option = {};
        option.url = "https://cn.investing.com";
        option.headers = {};
        option.headers['Referer'] = option.url;
        return option;
    }

    async getRequest() {
        var that = this;
        if (that._request) {
            return that._request;
        }
        if (that._requestStart) {
            while(!that._request) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            return that._request;
        }
        that._requestStart = true;
        var request = require('request');
        request = request.defaults({jar:request.jar()});
        var option = that.getOption();
        await http.get(option.url, option, request);
        that._request = request;
        return that._request;
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

}

// (async () => {
//     await new yingweicaiqing().getETF("source-us-consumer-discretnry");
// })();

module.exports = yingweicaiqing;