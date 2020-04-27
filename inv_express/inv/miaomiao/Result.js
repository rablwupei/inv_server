var ExcelReader = require("./excel/ExcelReader");
var sina = require('../market/sina');
var sprintf = require("sprintf-js").sprintf;

class Result {
    getColor(percent) {
        if (percent > 0) {
            return "red"
        } else if (percent < 0) {
            return "green"
        }
        return null;
    }

    compare(index, unit, stock) {
        var offset = (stock.price / unit.price1 - 1);
        var offsetStr = "";
        var tips = "";
        var tipsClass = null;
        var tips2 = "";
        if (unit.tips) {
            tips = unit.tips
        }
        if (unit.price1 > 0) {
            //0.0 0.2  10% 3.3%
            //0.1 0.2  10% 6.6%
            //0.2 0.2  10% 10%
            if (unit.cangwei) {
                if (offset < 0) {
                    var percent = ((-offset + 0.1) / 0.3) * unit.cangwei;
                    tips = sprintf("%.2f%%", percent * 100);
                    tips2 = sprintf("%.2f", percent * 50);
                } else {
                    tips = sprintf("%.2f%%", unit.cangwei * 100);
                    tipsClass = "gray";
                }
            }
            offsetStr = sprintf("%.2f%%", offset * 100);
        }
        this.number = offset;
        this.output = [
            {text:unit.codeStr, class:"center"},
            {text:unit.name, class:"center"},
            {text:stock.curStr},
            {text:stock.percentStr, class:this.getColor(stock.percent)},
            {text:unit.price1},
            {text:offsetStr},
            {text:tips, class:tipsClass},
            {text:tips2},
        ]
    }

    head() {
        this.output = [
            "代码",
            "名称",
            "最新价",
            "涨跌幅",
            "目标价",
            "距离",
            "提示",
            "提示",
        ]
    }
}

Result.requestExcel = async function(name, type) {
    var excel = new ExcelReader(__dirname + "/../../src/miaomiao/" + name, type);
    excel.parse();
    var codes = [];
    var units = excel.units;
    for (var i = 0; i < units.length; i++) {
        codes.push(units[i].codeStrMarket);
    }
    var stockMap = await sina.get(codes.join(","));
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

Result.request = async function() {
    var results = await Promise.all([
        Result.requestExcel("a.xls"),
        Result.requestExcel("a_market.xls"),
        Result.requestExcel("hk.xlsx", ExcelReader.type_miaomiaohk),
        Result.requestExcel("hk_market.xls"),
        Result.requestExcel("zhuanzhai.xlsx", ExcelReader.type_miaomiaozhuanzhai),
    ]);
    return results;
};

// co(Result.request);
module.exports = Result;