var xlsx = require('node-xlsx').default;
var sina = require('../market/sina');
var tiantianjingzhi = require('../market/tiantianjingzhi');
var Xueqiu = require('../market/xueqiu');
var util = require("util");
var sprintf = require("sprintf-js").sprintf;

class DataSourceParser {
    constructor() {
        this._regularResults = [];
        this._ids = new Set();
    }

    get regular() {}

    addRegularResult(res) {
        this._regularResults.push(res);
        this._ids.add(res[1]);
    }

    *request() {}

    fillValue() {}

    replaceStr() {}
}

class DataSourceParserTiantianjingzhi extends DataSourceParser {
    get key() {
        return "天天基金净值";
    }

    get regular() {
        return /天天基金净值\[(.*?)\]\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["天天基金净值"]["$1"]["$2"]["$3"]')
    }

    *request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var ids = Array.from(this._ids);
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(tiantianjingzhi.get(code));
        }
        this._stocks = yield requests;
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (let i = 0; i < this._stocks.length; i++) {
            var stock = this._stocks[i];
            value["" + stock.code] = stock.json;
        }
    }
}

class DataSourceParserWangyi extends DataSourceParser {
    get key() {
        return "网易";
    }

    get regular() {
        return /网易\[(.*?)\]\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["网易"]["$1"]["$2"]["$3"]')
    }

    *request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var ids = Array.from(this._ids);
        var wangyi = require("../market/wangyi");
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(wangyi.get(code));
        }
        this._stocks = yield requests;
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (let i = 0; i < this._stocks.length; i++) {
            var stock = this._stocks[i];
            value["" + stock.code] = stock.json;
        }
    }
}

class DataSourceParserShenjifene extends DataSourceParser {
    get key() {
        return "深基份额"; //深基份额[161129]
    }

    get regular() {
        return /深基份额\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["深基份额"]["$1"]')
    }

    *request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var ids = Array.from(this._ids);
        var shenjifene = require("../market/shenjifene");
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(shenjifene.get(code));
        }
        this._stocks = yield requests;
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (let i = 0; i < this._stocks.length; i++) {
            var stock = this._stocks[i];
            value["" + stock.code] = stock.json.dqgm;
        }
    }
}

class DataSourceParserXueqiu extends DataSourceParser {
    get key() {
        return "雪球";
    }

    get regular() {
        return /雪球\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["雪球"]["$1"]["$2"]')
    }

    addRegularResult(res) {
        this._regularResults.push(res);
        this._ids.add(res[1]);
    }

    *request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var ids = Array.from(this._ids);
        var xueqiu = new Xueqiu();
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(xueqiu.get(code));
        }
        this._stocks = yield requests;
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (let i = 0; i < this._stocks.length; i++) {
            var stock = this._stocks[i];
            value["" + stock.code] = stock.json;
        }
    }
}

class DataSourceParserXueqiuKLine extends DataSourceParser {
    get key() {
        return "雪球k线";
    }

    get regular() {
        return /雪球k线\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["雪球k线"]["$1"]["$2"]')
    }

    addRegularResult(res) {
        this._regularResults.push(res);
        this._ids.add(res[1]);
    }

    *request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var ids = Array.from(this._ids);
        var xueqiu = new Xueqiu();
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(xueqiu.getKLine(code));
        }
        this._stocks = yield requests;
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (let i = 0; i < this._stocks.length; i++) {
            var stock = this._stocks[i];
            value["" + stock.code] = stock.item;
        }
    }
}

class DataSourceParserSina extends DataSourceParser {
    get key() {
        return "新浪";
    }

    get regular() {
        return /新浪\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["新浪"]["$1"]["$2"]')
    }

    addRegularResult(res) {
        this._regularResults.push(res);
        this._ids.add(res[1]);
    }

    *request() {
        if (this._ids.size === 0) {
            return;
        }
        var codes = Array.from(this._ids);
        var codesStr = codes.join(",");
        this._stockMap = yield sina.get(codesStr);
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (const key in this._stockMap) {
            var stock = this._stockMap[key];
            value["" + stock.code] = stock._strs;
        }
    }
}

let type_pre = "pre";
let type_string = "string";
let type_float = "float";
let type_percent = "percent";

class Excel {

    constructor(path, debug) {
        this._debug = debug;
        this._path = path;

        this._parsers = [
            new DataSourceParserTiantianjingzhi(),
            new DataSourceParserSina(),
            new DataSourceParserXueqiu(),
            new DataSourceParserXueqiuKLine(),
            new DataSourceParserShenjifene(),
            new DataSourceParserWangyi(),
        ];
    }

    skipRow(i) {
        return !this._excelData[i][0] && !this._excelData[i][1];
    }

    skipParse(i, j) {
        return this._excelData[1][j] === type_pre;
    }

    skipAddVar(i, j) {
        return this._excelData[1][j] === type_string;
    }

    convertString(value, type) {
        if (type === type_float || type === type_percent) {
            let num = parseFloat(value);
            if (num === 0 || num) {
                if (type === type_percent) {
                    value = +(num * 100).toFixed(2) + "%";
                } else {
                    value = +num.toFixed(4) + "";
                }
            }
        }
        return value + "";
    }

    parse() {
        var excelData = xlsx.parse(this._path)[0].data;
        this._excelData = excelData;
        this._isMatch = {};
        for (var i = 2; i < excelData.length; ++i) {
            if (this.skipRow(i)) {
                continue;
            }
            for (var j = 0; j < excelData[i].length; ++j) {
                if (this.skipParse(i, j)) {
                    continue;
                }
                var cell = excelData[i][j];
                for (var k = 0; k < this._parsers.length; k++) {
                    var parser = this._parsers[k];
                    if (parser.regular) {
                        var matches = ("" + cell).matchAll(parser.regular);
                        if (matches) {
                            for (const match of matches) {
                                parser.addRegularResult(match);
                                this._isMatch[i] = this._isMatch[i] || {};
                                this._isMatch[i][j] = true;
                            }
                        }
                    }
                }
            }
        }
    }

    *request() {
        var requests = [];
        for (var k = 0; k < this._parsers.length; k++) {
            var parser = this._parsers[k];
            requests.push(parser.request());
        }
        yield requests;
    }

    replaceValue(str) {
        for (var k = 0; k < this._parsers.length; k++) {
            var parser = this._parsers[k];
            str = parser.replaceStr(str);
        }
        return str;
    }

    fill() {
        let values = {};
        for (var k = 0; k < this._parsers.length; k++) {
            var parser = this._parsers[k];
            parser.fillValue(values);
        }
        var debug = [];
        var data = JSON.parse(JSON.stringify(this._excelData));
        for (let i = 2; i < data.length; i++) {
            if (this.skipRow(i)) {
                continue;
            }
            var valuesStr = "";
            for (let j = 0; j < data[i].length; j++) {
                if (this.skipParse(i, j)) {
                    continue;
                }
                if (this._isMatch[i] && this._isMatch[i][j]) {
                    data[i][j] = this.replaceValue(data[i][j]);
                }
                if (this._debug) {
                    debug.push(valuesStr + data[i][j])
                }
                // console.log(valuesStr + data[i][j]);
                data[i][j] = eval(valuesStr + data[i][j]);
                if (this._debug) {
                    debug.push(data[0][j] + ": " + data[i][j])
                }
                if (!this.skipAddVar(i, j)) {
                    valuesStr += util.format("let %s = %s; ", data[0][j], data[i][j]);
                }
            }
            if (this._debug) {
                debug.push("")
            }
        }
        var output = { list : [], debug : debug.join('\n') };
        for (let i = 0; i < data.length; i++) {
            if (this.skipRow(i)) {
                continue;
            }
            if (i === 1) {
                continue;
            }
            var row = [];
            output.list.push(row);
            for (let j = 0; j < data[i].length; j++) {
                row.push(this.convertString(data[i][j], data[1][j]));
            }
        }
        return output
    }
}

Excel.requestResult = function*(path, debug) {
    var excel = new Excel(path, debug);
    excel.parse();
    yield excel.request();
    return excel.fill();
};

// require('co')(function*() {
//     let results = yield Excel.requestResult(__dirname + "/../../src/excel/yuanyou.xlsx");
//     console.log(results)
// });

module.exports = Excel;