var xlsx = require('node-xlsx').default;
var ExcelUnit = require('./ExcelUnit');
var sprintf = require("sprintf-js").sprintf;

class ExcelReader {
    constructor(path) {
        this._path = path;
        this._units = [];
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
            excelUnit.code = parseInt(unit[0]);
            excelUnit.name = "" + unit[1];
            excelUnit.price1 = parseFloat(unit[2]);
            excelUnit.price2 = parseFloat(unit[3]);
            excelUnit.price3 = parseFloat(unit[4]);
            excelUnit.percent = parseFloat(unit[5]);
            if (excelUnit.code && excelUnit.price1 && excelUnit.price2 && excelUnit.price3 &&
                excelUnit.percent) {
                excelUnit.codeStr = sprintf("%06d", excelUnit.code);
                if (excelUnit.codeStr.startsWith("6")) {
                    excelUnit.codeStrMarket = "s_sh" + excelUnit.codeStr;
                } else {
                    excelUnit.codeStrMarket = "s_sz" + excelUnit.codeStr;
                }
                this._units.push(excelUnit);
            }
        }
        return true;
    }


}

module.exports = ExcelReader;