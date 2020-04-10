var AbstractStock = require('./AbstractStock');
var util = require("util");
let xlsx = require('node-xlsx').default;
require('../utils/prototype_extends');

class ShenjifeneExcelStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    parse(line) {
        this.code = line[0];
        this.name = line[1];
        this.share = parseFloat(line[5].replaceAll(",", "")) / 10000;
        this.type = line[2]; //ETF, LOF, 分级基金, 封闭式基金
    }
}

var http = require('../utils/http');
var shenjifeneExcel = {};

shenjifeneExcel.url = "http://www.szse.cn/api/report/ShowReport?SHOWTYPE=xlsx&CATALOGID=1105&TABKEY=tab1&random=%s";
shenjifeneExcel.referer = "http://www.szse.cn/market/fund/list/all/index.html";

shenjifeneExcel.get = async function() {
    var url = util.format(shenjifeneExcel.url, Math.random());
    var referer = shenjifeneExcel.referer;
    var body = await http.get(url, {headers: {'Referer': referer}, encoding: null });
    var bodyObj = xlsx.parse(body)[0].data;
    var map = {};
    for (let i = 1; i < bodyObj.length; i++) {
        let line = bodyObj[i];
        let stock = new ShenjifeneExcelStock();
        stock.parse(line);
        map[stock.code] = stock;
    }
    return map;
};

shenjifeneExcel.startTimer = async function(unit) {
    let map = await shenjifeneExcel.get();
    for (let key in map) {
        let stock = map[key];
        if (stock.type == "LOF") {
            require('../db/Stocks').saveOne(stock.code, stock.name, unit.type, stock).catch(function (e) {
                let json = JSON.stringify(stock);
                console.error(`stock save error. stock: ${json}, error: ${e}`);
            });
        }
    }
};

// (async () => {
//     await shenjifeneExcel.get();
// })();

module.exports = shenjifeneExcel;