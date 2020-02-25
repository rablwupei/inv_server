var xlsx = require('node-xlsx').default;
var ExcelUnit = require('./ExcelUnit');
var sprintf = require("sprintf-js").sprintf;

class ExcelReader {
    constructor(path, type) {
        this._path = path;
        this._units = [];
        this._type = type || 0;
    }

    static get type_miaomiaohk() {
        return 1;
    }

    get units() {
        return this._units;
    }

    parse() {
        var data = xlsx.parse(this._path)[0].data;
        //[ 601933, '永辉超市', 7.5, 6.375, 5.41875, 0.2, <1 empty item>, '新增' ]
        this._units = [];
        for (var row = 0; row < data.length; row++) {
            var unit = data[row];
            var excelUnit = new ExcelUnit();
            excelUnit.code = "" + unit[0];
            excelUnit.name = "" + unit[1];
            if (this._type === ExcelReader.type_miaomiaohk) {
                if (excelUnit.name === "复星国际") {
                    excelUnit.code = "656";
                }
                excelUnit.price1 = parseFloat(unit[3]);
                if (unit[2]) {
                    excelUnit.tips = "" + unit[2];
                }
                if (excelUnit.code && !isNaN(excelUnit.price1)) {
                    excelUnit.codeStr = sprintf("%05s", excelUnit.code);
                    excelUnit.codeStrMarket = "hk" + excelUnit.codeStr;
                    this._units.push(excelUnit);
                }
            } else {
                excelUnit.price1 = parseFloat(unit[2]);
                excelUnit.price2 = parseFloat(unit[3]) || 0;
                excelUnit.price3 = parseFloat(unit[4]) || 0;
                if (excelUnit.code && !isNaN(excelUnit.price1)) {
                    if (unit[5]) {
                        excelUnit.tips = sprintf("%.2f%%", parseFloat(unit[5]) * 100);
                    }
                    if (/^[0-9]+/.test(excelUnit.code)) {
                        excelUnit.codeStr = sprintf("%06s", excelUnit.code);
                        if (excelUnit.codeStr.startsWith("6")) {
                            excelUnit.codeStrMarket = "sh" + excelUnit.codeStr;
                        } else {
                            excelUnit.codeStrMarket = "sz" + excelUnit.codeStr;
                        }
                    } else {
                        excelUnit.codeStr = excelUnit.code;
                        excelUnit.codeStrMarket = excelUnit.code;
                    }
                    this._units.push(excelUnit);
                }
            }
        }
        return true;
    }


}

module.exports = ExcelReader;