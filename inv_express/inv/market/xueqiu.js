var AbstractStock = require('./AbstractStock');
var util = require("util");
var sprintf = require("sprintf-js").sprintf;
var http = require("../utils/http");

class XueqiuStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    parse(text) {
        this.json = JSON.parse(text).data.quote;
    }
}

class XueqiuKLineStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    parse(text) {
        this.json = JSON.parse(text);
        this.item = this.json.data.item;
        // console.log(this.json);
        // console.log(this.item);
        //雪球k线[USO][0][7]
    }
}

class Xueqiu {

    getOption() {
        var option = {};
        option.url = 'https://www.xueqiu.com';
        option.headers = {};
        option.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36';
        option.headers['Referer'] = 'https://www.xueqiu.com';
        option.gzip = true;
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
        var url = "https://stock.xueqiu.com/v5/stock/quote.json?symbol=%s";
        var referer = 'https://xueqiu.com/S/%s';
        var request = await this.getRequest();
        var option = that.getOption();
        option.url = util.format(url, code);
        option.headers['Referer'] = util.format(referer, code);
        var body = await http.get(option.url, option, request);
        body = body.trim();
        var stock = new XueqiuStock(code);
        stock.parse(body);
        return stock;
    }

    async getKLine(code) {
        var that = this;
        var url = "https://stock.xueqiu.com/v5/stock/chart/kline.json?" +
            "symbol=%s&begin=%s&period=day&type=before&count=-2&" +
            "indicator=kline,pe,pb,ps,pcf,market_capital,agt,ggt,balance";
        var referer = 'https://xueqiu.com/S/%s';
        var option = that.getOption();
        option.url = util.format(url, code, Date.now() + 86400000);
        option.headers['Referer'] = util.format(referer, code);
        var request = await this.getRequest();
        var body = await http.get(option.url, option, request);
        body = body.trim();
        var stock = new XueqiuKLineStock(code);
        stock.parse(body);
        return stock;
    }

}

// require("co")(function* () {
//     yield new Xueqiu().getKLine("USO");
// });

module.exports = Xueqiu;