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

    static get type_miaomiaozhuanzhai() {
        return 2;
    }

    get units() {
        return this._units;
    }

    parse() {
        if (this._type === ExcelReader.type_miaomiaohk) {
            var data = xlsx.parse(this._path)[1].data;
        } else {
            var data = xlsx.parse(this._path)[0].data;
        }
        //[ 601933, '永辉超市', 7.5, 6.375, 5.41875, 0.2, <1 empty item>, '新增' ]
        this._units = [];
        for (var row = 0; row < data.length; row++) {
            var unit = data[row];
            var excelUnit = new ExcelUnit();
            if (this._type === ExcelReader.type_miaomiaohk) {
                excelUnit.code = "" + unit[0];
                excelUnit.name = "" + unit[1];
                if (excelUnit.name === "复星国际") {
                    excelUnit.code = "656";
                } else if (excelUnit.name === "周黑鸭") {
                    excelUnit.code = "1458";
                } else if (excelUnit.name === "北京控股") {
                    excelUnit.code = "392";
                }
                excelUnit.price1 = parseFloat(unit[2]);
                if (unit[7]) {
                    excelUnit.tips = "" + unit[7];
                }
                if (excelUnit.code && !isNaN(excelUnit.price1)) {
                    excelUnit.codeStr = sprintf("%05s", excelUnit.code);
                    excelUnit.codeStrMarket = "hk" + excelUnit.codeStr;
                    this._units.push(excelUnit);
                }
            } else if (this._type === ExcelReader.type_miaomiaozhuanzhai) {
                excelUnit.code = "" + unit[1];
                excelUnit.name = "" + unit[2];
                excelUnit.price1 = parseFloat(unit[5]);
                if (unit[5] && excelUnit.code && !isNaN(excelUnit.price1)) {
                    excelUnit.codeStr = sprintf("%05s", excelUnit.code);
                    if (excelUnit.codeStr.startsWith("11")) {
                        excelUnit.codeStrMarket = "sh" + excelUnit.codeStr;
                    } else {
                        excelUnit.codeStrMarket = "sz" + excelUnit.codeStr;
                    }
                    this._units.push(excelUnit);
                }
            } else {
                excelUnit.code = "" + unit[0];
                excelUnit.name = "" + unit[1];
                excelUnit.price1 = parseFloat(unit[2]);
                excelUnit.price2 = parseFloat(unit[3]) || 0;
                excelUnit.price3 = parseFloat(unit[4]) || 0;
                excelUnit.getText = function (index) {
                    if (index in unit) {
                        return unit[index] || "";
                    }
                    return "";
                };
                if (excelUnit.code && !isNaN(excelUnit.price1)) {
                    if (/^[0-9]+/.test(excelUnit.code)) {
                        if (unit[5]) {
                            excelUnit.cangwei = parseFloat(unit[5]);
                            excelUnit.tips = sprintf("%.2f%%", excelUnit.cangwei * 100);
                            excelUnit.codeStr = sprintf("%06s", excelUnit.code);
                            if (excelUnit.codeStr.startsWith("6")) {
                                excelUnit.codeStrMarket = "sh" + excelUnit.codeStr;
                            } else {
                                excelUnit.codeStrMarket = "sz" + excelUnit.codeStr;
                            }
                            this._units.push(excelUnit);
                        }
                    } else {
                        excelUnit.codeStr = excelUnit.code;
                        excelUnit.codeStrMarket = excelUnit.code;
                        this._units.push(excelUnit);
                    }
                }
            }
        }
        return true;
    }


}

module.exports = ExcelReader;