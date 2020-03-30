var AbstractStock = require('./AbstractStock');
var util = require("util");

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
        option.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36';
        option.headers['Referer'] = option.url;
        option.gzip = true;
        return option;
    }

    getRequest(callback) {
        var that = this;
        if (that._request) {
            callback(that._request);
            return;
        }
        var request = require('request');
        request = request.defaults({jar:request.jar()});
        var option = this.getOption();
        request(option, function () {
            that._request = request;
            callback(that._request);
        });
    }

    get() {
        var that = this;
        var url = "http://query.sse.com.cn/commonQuery.do?&jsonCallBack=&" +
            "sqlId=COMMON_SSE_FUND_LOF_SCALE_CX_S&pageHelp.pageSize=10000&FILEDATE=&_=%s";
        return new Promise(function(resolve, reject) {
            that.getRequest(function (request) {
                var option = that.getOption();
                option.url = util.format(url, Date.now());
                request(option, function (error, response, body){
                    body = body.trim();
                    var stock = new ShangjifeneStock();
                    stock.parse(body);
                    resolve(stock);
                });
            })
        });
    }

}

// require("co")(function* () {
//     yield new Shangjifene().get();
// });

module.exports = Shangjifene;