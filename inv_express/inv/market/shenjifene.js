var AbstractStock = require('./AbstractStock');
var util = require("util");

String.prototype.replaceAll = function (FindText, RepText) {
    regExp = new RegExp(FindText, "g");
    return this.replace(regExp, RepText);
};

class SenjifeneStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    parse(text) {
        this.json = JSON.parse(text)[0].data[0];
        this.json.dqgm = this.json.dqgm.replaceAll(",", "");
        // console.log((this.json));
        // this.json = this.json.replaceAll(",", "");
    }
}

var http = require('../utils/http');
var shenjifene = {};

shenjifene.url = "http://www.szse.cn/api/report/ShowReport/data?" +
    "SHOWTYPE=JSON&CATALOGID=1105&TABKEY=tab1&txtkey1=%s&random=%s";
shenjifene.referer = "http://www.szse.cn/market/fund/list/all/index.html";

shenjifene.get = async function(code) {
    var url = util.format(shenjifene.url, code, Math.random());
    var referer = shenjifene.referer;
    var body = await http.get(url, {headers: {'Referer': referer} });
    body = body.trim();
    var stock = new SenjifeneStock(code);
    stock.parse(body);
    return stock;
};

// require('co')(function* () {
//     yield shenjifene.get("161129");
// });

module.exports = shenjifene;