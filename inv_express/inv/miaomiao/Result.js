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
        var tips2Class = null;
        var tips2 = "";
        if (unit.tips) {
            tips = unit.tips
        }
        let total = 50;
        let number = offset;
        if (unit.price1 > 0) {
            if (unit.cangwei) {
                if (offset < 0) {
                    //0.0 0.2  10% 3.3%
                    //0.1 0.2  10% 6.6%
                    //0.2 0.2  10% 10%
                    var percent = ((-offset + 0.1) / 0.3) * unit.cangwei;
                    tips = sprintf("%.2f%%", percent * 100);
                    tips2 = sprintf("%.2f", percent * total);
                    number = -percent;
                } else {
                    //0.0 0.1  10% 10%
                    //0.05 0.1  10% 5%
                    //0.1 0.1  10% 0%
                    var percent = (unit.cangwei / 3 * ((0.1 - offset) / 0.1));
                    if (percent > 0) {
                        tips = sprintf("%.2f%%", percent * 100);
                        tips2 = sprintf("%.2f", percent * total);
                        tipsClass = "gray";
                        tips2Class = "gray";
                        number = -percent;
                    } else {
                        tips = sprintf("%.2f%%", unit.cangwei * 100);
                        tips2 = 0;
                        tipsClass = "gray";
                        tips2Class = "gray";
                        number = -percent;
                    }
                }
            }
            offsetStr = sprintf("%.2f%%", offset * 100);
        }
        this.number = number;
        this.output = [
            {text:unit.codeStr, class:"center"},
            {text:unit.name, class:"center"},
            {text:stock.curStr},
            {text:stock.percentStr, class:this.getColor(stock.percent)},
            {text:unit.price1},
            {text:offsetStr},
            {text:tips, class:tipsClass},
            {text:tips2, class:tips2Class},
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
        Result.requestExcel("a_hk.xls"),
        Result.requestExcel("a_market.xls"),
        Result.requestExcel("zhuanzhai.xls", ExcelReader.type_miaomiaozhuanzhai),
        Result.requestExcel("hk_market.xls"),
        Result.requestExcel("a_hk.xls", ExcelReader.type_miaomiaohk),
    ]);
    return results;
};

// co(Result.request);
module.exports = Result;