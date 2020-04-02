/**
 * Created by wp on 2016/9/26.
 */

var AbstractStock = require('./AbstractStock');

class SinaStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    parse(text) {
        this._strs = text.split(',');
        if (this.code.startsWith('hk')) {
            this.name = this._strs[1];
            this.cur = parseFloat(this._strs[6]);
            this.percent = parseFloat(this._strs[8]) / 100;
        } else {
            this.name = this._strs[0];
            this.cur = parseFloat(this._strs[3]);
            this.percent = this.cur / parseFloat(this._strs[2]) - 1;
        }
    }

}

var http = require('../utils/http');
var sina = {};

sina.url = "http://hq.sinajs.cn/format=text&list=";

sina.get = async function(codes) {
    var url = codes;
    if (!url.startsWith(sina.url)) {
        url = sina.url + url;
    }
    var map = {};
    // console.log("url: " + url);
    var body = await http.get(url, {gzip : false, encoding : 'GBK'});
    body = body.trim();
    if (!body.endsWith("FAILED")) {
        var bodyList = body.split('\n');
        for (var i = 0; i < bodyList.length; i++) {
            var stockStrs = bodyList[i].split('=');
            var stock = new SinaStock(stockStrs[0]);
            map[stock.code] = stock;
            stock.parse(stockStrs[1])
        }
    }
    return map;
};

module.exports = sina;