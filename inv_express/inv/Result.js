var ExcelReader = require("./excel/ExcelReader");
var co = require('co');
var sina = require('./market/sina');
var sprintf = require("sprintf-js").sprintf;

class Result {
    compare(unit, stock) {
        var offset = (stock.cur / unit.price1 - 1);
        var offsetStr = "-";
        var percentStr = "-";
        if (unit.price1 > 0) {
            offsetStr = sprintf("%.2f%%", offset * 100);
        }
        if (unit.percent > 0) {
            percentStr = sprintf("%.2f%%", unit.percent * 100)
        }
        this.number = offset;
        this.output = [
            0,
            unit.codeStr,
            unit.name,
            stock.cur,
            unit.price1,
            offsetStr,
            stock.percentStr,
            percentStr,
        ]
    }

    head() {
        this.output = [
            "序号",
            "代码",
            "名称",
            "当前价",
            "买入价",
            "距离",
            "今日涨幅",
            "仓位上限",
        ]
    }
}

Result.request = function*() {
    var excel = new ExcelReader(__dirname + "/../src/a.xls");
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
        result.compare(unit, stock);
        results.push(result);
    }
    results.sort(function (a, b) {
        return a.number - b.number;
    });
    var outputs = [];
    for (var i = 0; i < results.length; i++) {
        results[i].output[0] = i + 1;
        outputs.push(results[i].output);
    }
    var header = new Result();
    header.head();
    return {header:header.output, outputs:outputs};
};

// co(Result.request);
module.exports = Result;