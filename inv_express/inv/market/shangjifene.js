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
}

class Shangjifene {

    getOption() {
        var option = {};
        option.url = 'http://www.sse.com.cn/market/funddata/volumn/lofvolumn/';
        option.headers = {};
        option.emptyUserAgent = true;
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
        var that = this;
        var url = "http://query.sse.com.cn/commonQuery.do?&jsonCallBack=&" +
            "sqlId=COMMON_SSE_FUND_LOF_SCALE_CX_S&pageHelp.pageSize=10000&FILEDATE=&_=%s";
        var request = await this.getRequest();
        var option = that.getOption();
        option.url = util.format(url, Date.now());
        var body = await http.get(option.url, option, request);
        body = body.trim();
        var stock = new ShangjifeneStock();
        stock.parse(body);
        return stock;
    }

}

// require("co")(function* () {
//     yield new Shangjifene().get();
// });

module.exports = Shangjifene;