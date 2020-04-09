var AbstractStock = require('./AbstractStock');
var util = require("util");
var http = require("../utils/http");

class ShangjifeneStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    parse(text) {
        this.json = JSON.parse(text).result;
        this.data = {};
        for (let i = 0; i < this.json.length; i++) {
            this.data[this.json[i]["FUND_CODE"]] = this.json[i]["INTERNAL_VOL"].replaceAll(",", "");
        }
    }

    static parseAll(text) {
        this.json = JSON.parse(text).result;
        let array = [];
        for (let i = 0; i < this.json.length; i++) {
            let FUND_CODE = this.json[i]["FUND_CODE"];
            let FUND_ABBR = this.json[i]["FUND_ABBR"];
            let TRADE_DATE = this.json[i]["TRADE_DATE"];
            let INTERNAL_VOL = parseFloat(this.json[i]["INTERNAL_VOL"].replaceAll(",", ""));
            array.push({
                'code': FUND_CODE,
                'name': FUND_ABBR,
                'data': {
                    'share' : INTERNAL_VOL,
                }
            });
        }
        return array;
    }

}

class Shangjifene {

    getOption() {
        var option = {};
        option.url = 'http://www.sse.com.cn/market/funddata/volumn/lofvolumn/';
        option.headers = {};
        option.headers['Referer'] = option.url;
        return option;
    }

    async getRequest() {
        var that = this;
        if (that._request) {
            return that._request;
        }
        var request = require('request');
        request = request.defaults({jar:request.jar()});
        var option = that.getOption();
        await http.get(option.url, option, request);
        that._request = request;
        return that._request;
    }

    async get() {
        let that = this;
        let url = "http://query.sse.com.cn/commonQuery.do?&jsonCallBack=&" +
            "sqlId=COMMON_SSE_FUND_LOF_SCALE_CX_S&pageHelp.pageSize=10000&FILEDATE=&_=%s";
        let request = await this.getRequest();
        let option = that.getOption();
        option.url = util.format(url, Date.now());
        let body = await http.get(option.url, option, request);
        let stock = new ShangjifeneStock();
        stock.parse(body);
        return stock;
    }

    async getAll() {
        let that = this;
        let url = "http://query.sse.com.cn/commonQuery.do?&jsonCallBack=&" +
            "sqlId=COMMON_SSE_FUND_LOF_SCALE_CX_S&pageHelp.pageSize=10000&FILEDATE=&_=%s";
        let request = await this.getRequest();
        let option = that.getOption();
        option.url = util.format(url, Date.now());
        let body = await http.get(option.url, option, request);
        return ShangjifeneStock.parseAll(body);
    }

    static startTimer(unit) {
        (async ()=> {
            let array = await new Shangjifene().getAll();
            for (let stock of array) {
                require('../db/Stocks').saveOne(stock.code, stock.name, unit.type, stock.data).catch(function (e) {
                    let json = JSON.stringify(stock);
                    console.error(`stock save error. stock: ${json}, error: ${e}`);
                });
            }
        })();
    }

}

// (async () => {
//     await new Shangjifene().get();
// })();

module.exports = Shangjifene;