var ExcelReader = require("./excel/ExcelReader");
var co = require('co');
var sina = require('../market/sina');
var sprintf = require("sprintf-js").sprintf;

class Result {
    compare(index, unit, stock) {
        var offset = (stock.cur / unit.price1 - 1);
        var offsetStr = "";
        var tips = "";
        if (unit.price1 > 0) {
            offsetStr = sprintf("%.2f%%", offset * 100);
        }
        if (unit.tips) {
            tips = unit.tips
        }
        this.number = offset;
        this.output = [
            index + 1,
            unit.codeStr,
            unit.name,
            stock.curStr,
            stock.percentStr,
            unit.price1,
            offsetStr,
            tips,
        ]
    }

    head() {
        this.output = [
            "序号",
            "代码",
            "名称",
            "最新价",
            "涨跌幅",
            "目标价",
            "距离",
            "提示",
        ]
    }
}

Result.requestExcel = function*(name, type) {
    var excel = new ExcelReader(__dirname + "/../../src/miaomiao/" + name, type);
    excel.parse();
    var codes = [];
    var units = excel.units;
    for (var i = 0; i < units.length; i++) {
        codes.push(units[i].codeStrMarket);
    }
    var stockMap = yield sina.get(codes.join(","));
    var results = [];
    for (var i = 0; i < units.length; i++) {
        var unit = units[i];
        var stock = stockMap[unit.codeStrMarket];
        var result = new Result();
        result.compare(i, unit, stock);
        results.push(result);
    }
    results.sort(function (a, b) {
        return a.number - b.number;
    });
    var outputs = [];
    for (var i = 0; i < results.length; i++) {
        outputs.push(results[i].output);
    }
    var header = new Result();
    header.head();
    return {header:header.output, outputs:outputs};
}

Result.request = function*() {
    var results = yield [
        Result.requestExcel("a.xls"),
        Result.requestExcel("a_market.xls"),
        Result.requestExcel("hk.xlsx", ExcelReader.type_miaomiaohk),
        Result.requestExcel("hk_market.xls"),
        Result.requestExcel("zhuanzhai.xlsx", ExcelReader.type_miaomiaozhuanzhai),
    ];
    return results;
};

// co(Result.request);
module.exports = Result;