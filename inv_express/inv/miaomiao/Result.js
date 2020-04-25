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
        if (unit.tips) {
            tips = unit.tips
        }
        if (unit.price1 > 0) {
            //20% -10% 20%/3
            //20% -30% 20%/1
            if (unit.cangwei) {
                if (offset < 0) {
                    tips = sprintf("%.2f%%", -offset / 0.3 * unit.cangwei * 100);
                } else {
                    tips = "0%"
                }
            }
            offsetStr = sprintf("%.2f%%", offset * 100);
        }
        this.number = offset;
        this.output = [
            {text:index + 1, class:"center"},
            {text:unit.codeStr, class:"center"},
            {text:unit.name, class:"center"},
            {text:stock.curStr},
            {text:stock.percentStr, class:this.getColor(stock.percent)},
            {text:unit.price1},
            {text:offsetStr},
            {text:tips, class:tipsClass},
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