var xlsx = require('node-xlsx').default;
var util = require("util");
const { promises: fs } = require("fs");

let type_pre = 0;
let type_string = 1;
let type_float = 2;
let type_percent = 3;
let type_int = 4;
let type_values = {
    pre : type_pre,
    string : type_string,
    float : type_float,
    percent : type_percent,
    int : type_int,
};

class Excel {

    constructor(path, debug) {
        this._debug = debug;
        this._path = path;
    }

    async init() {
        this._parsers = [];
        this._parserClasses = [];
        let requirePath = "./parser/";
        let parserPath = __dirname + "/parser";
        let files = await fs.readdir(parserPath);
        for (let i = 0; i < files.length; i++) {
            let cls = require(requirePath + files[i]);
            let parser = new cls();
            if (parser.enable) {
                this._parsers.push(parser);
                this._parserClasses.push(cls);
            }
        }
    }

    parseHeader() {
        this._headerType = [];
        this._headerHide = [];
        let row = this._excelData[1];
        for (let j = 0; j < row.length; j++) {
            this._headerType[j] = type_pre;
            let values = row[j];
            for(let key in type_values) {
                if (values.includes(key)) {
                    this._headerType[j] = type_values[key];
                    break;
                }
            }
            this._headerHide[j] = false;
            if (values.includes("hide")) {
                this._headerHide[j] = true;
            }
        }
    }

    skipRow(i) {
        return !this._excelData[i][0] && !this._excelData[i][1];
    }

    skipParse(i, j) {
        return this._headerType[j] === type_pre;
    }

    skipAddVar(i, j) {
        return this._headerType[j] === type_string;
    }

    convertString(i, j, value) {
        let type = this._headerType[j];
        if (type === type_float || type === type_percent || type === type_int) {
            let num = parseFloat(value);
            if (num === 0 || num) {
                if (type === type_int) {
                    value = Math.round(value) + "";
                } else if (type === type_percent) {
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
        this.parseHeader();
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

    async request() {
        var requests = [];
        for (var k = 0; k < this._parsers.length; k++) {
            var parser = this._parsers[k];
            requests.push(parser.request());
            // await parser.request();
        }
        await Promise.all(requests);
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
                let evalSuccess = true;
                try {
                    // console.log(valuesStr + data[i][j]);
                    data[i][j] = eval(valuesStr + data[i][j]);
                } catch (e) {
                    data[i][j] = "?";
                    evalSuccess = false;
                }
                if (!this.skipAddVar(i, j) && evalSuccess) {
                    valuesStr += util.format("let %s = %s; ", data[0][j], data[i][j]);
                }
                if (this._debug) {
                    debug.push(data[0][j] + ": " + data[i][j])
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
                if (this._headerHide[j]) {
                    continue;
                }
                row.push(this.convertString(i, j, data[i][j]));
            }
        }
        return output
    }
}

Excel.requestResult = async function(path, debug) {
    var excel = new Excel(path, debug);
    await excel.init();
    excel.parse();
    await excel.request();
    return excel.fill();
};


const { resolve } = require('path');
const { readdir } = require('fs').promises;
async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            yield res;
        }
    }
}

Excel.list = function() {
    return new Promise(function (resolve, reject) {
        const glob = require('glob');
        const path = require("path");
        const fs = require('fs');
        const moment = require('moment');
        let dirBase = __dirname + '/../../src/excel';
        let urlBase = "/excel/";
        glob(dirBase + '/**/*.xlsx', {}, (err, files) => {
            if (!err) {
                let table = [];
                table.push(["序号", "文件", "修改时间"]);
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
                    let line = [];
                    table.push(line);
                    line.push(i + 1);
                    line.push({
                        href: urlBase + path.relative(dirBase, file),
                        text: path.relative(dirBase, file),
                    });
                    line.push(moment(fs.statSync(file).mtime).format('YYYY-MM-DD'));
                }
                resolve(table);
            } else {
                reject(err);
            }
        })
    });
};

// require('co')(function*() {
//     let results = yield Excel.requestResult(__dirname + "/../../src/excel/yuanyou.xlsx");
//     console.log(results)
// });

module.exports = Excel;