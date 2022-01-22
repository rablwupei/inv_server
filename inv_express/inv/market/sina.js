/**
 * Created by wp on 2016/9/26.
 */

var AbstractStock = require('./AbstractStock');
var iconv = require('iconv-lite');

class SinaStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    parse(text) {
        this._strs = text.split(',');
        if (this.code.startsWith('hk')) {
            this.name = this._strs[1];
            this.price = parseFloat(this._strs[6]);
            this.percent = parseFloat(this._strs[8]) / 100;
        } else {
            this.name = this._strs[0];
            this.price = parseFloat(this._strs[3]);
            this.percent = this.price / parseFloat(this._strs[2]) - 1;
        }
    }

}

var http = require('../utils/http');
var util = require("util");
var sina = {};

sina.url = "http://hq.sinajs.cn/format=text&list=";

sina.get = async function(codes) {
    var url = codes;
    if (!url.startsWith(sina.url)) {
        url = sina.url + url;
    }
    var map = {};
    // console.log("url: " + url);
    var proxy = require("../db/Proxy");
    var proxyUrl = await proxy.getProxy();
    var refererUrl = "https://finance.sina.com.cn/realstock/company/sh000001/nc.shtml";
    var option = {encoding: null, proxy: proxyUrl, headers: {'Referer' : refererUrl}};
    var body = await http.get(url, option);
    body = iconv.decode(body, 'GBK');
    if (!body.endsWith("FAILED")) {
        body = body.trim();
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