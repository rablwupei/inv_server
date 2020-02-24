var ExcelReader = require("./excel/ExcelReader");
var co = require('co');
var sina = require('./market/sina');
var sprintf = require("sprintf-js").sprintf;

class Result {
    compare(unit, stock) {
        var offset = (stock.cur / unit.price1 - 1);
        this.number = offset;
        this.output = [
            unit.name,
            unit.price1,
            stock.cur,
            sprintf("%.2f%%", offset * 100),
            sprintf("%.2f%%", unit.percent * 100),
        ]
    }
}

Result.request = function*() {
    var excel = new ExcelReader("../src/a.xls");
    var codes = [];
    excel.parse();
    var units = excel.units;
    for (var i = 0; i < units.length; i++) {
        codes.push(units[i].codeStrMarket);
    }
    var stocks = yield sina.get(codes.join(","));
    console.log("stocks count: " + stocks.length);
    console.log("units count: " + units.length);
    var results = [];
    for (var i = 0; i < units.length; i++) {
        var unit = units[i];
        var stock = stocks[i];
        var result = new Result();
        result.compare(unit, stock);
        results.push(result);
    }
    results.sort(function (a, b) {
        return a.number - b.number;
    })
    console.log(results);
};

co(Result.request);