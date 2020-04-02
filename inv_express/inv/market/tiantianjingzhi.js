var AbstractStock = require('./AbstractStock');
var util = require("util");

class TiantianjingzhiStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    /*
    {
        FSRQ: '2020-03-25',
        DWJZ: '0.5712',
        LJJZ: '0.5712',
        SDATE: null,
        ACTUALSYI: '',
        NAVTYPE: '1',
        JZZZL: '1.71',
        SGZT: '暂停申购',
        SHZT: '开放赎回',
        FHFCZ: '',
        FHFCBZ: '',
        DTYPE: null,
        FHSP: ''
      }
     */
    parse(text) {
        this.json = JSON.parse(text)["Data"]["LSJZList"];
    }

}
var http = require('../utils/http');
var tiantianjingzhi = {};

tiantianjingzhi.url = "http://api.fund.eastmoney.com/f10/lsjz" +
    "?callback=&fundCode=%s&pageIndex=1&pageSize=5&startDate=&endDate=&_=%s";
tiantianjingzhi.referer = "http://fundf10.eastmoney.com/jjjz_%s.html";

tiantianjingzhi.get = async function(code) {
    var url = util.format(tiantianjingzhi.url, code, Date.now());
    var referer = util.format(tiantianjingzhi.referer, code);
    var body = await http.get(url, {headers: {'Referer': referer} });
    body = body.trim();
    var stock = new TiantianjingzhiStock(code);
    stock.parse(body);
    return stock;
};

module.exports = tiantianjingzhi;