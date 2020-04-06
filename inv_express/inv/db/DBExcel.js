let Excel = require('../excel/Excel');
let xlsx = require('node-xlsx').default;

class DBExcel extends Excel {

    constructor(path, debug) {
        super(path, debug);

    }

    parse() {
        let excelData = xlsx.parse(this._path)[0].data;
        this._excelData = excelData;
        let data = [];
        for (let i = 2; i < excelData.length; ++i) {
            if (this.skipRow(i)) {
                continue;
            }
            let cell = excelData[i][3];
            if (cell) {
                for (let k = 0; k < this._parsers.length; k++) {
                    let parser = this._parsers[k];
                    if (parser.regular) {
                        let matches = (cell + "[0]").matchAll(parser.regular);
                        if (matches) {
                            console.log(matches);
                            for (const match of matches) {
                                parser.addRegularResult(match);

                            }
                            break;
                        }
                    }
                }
            }
        }
    }

    static async exec() {
        // let path = __dirname + "/../../src/db/db.xlsx";
        // let debug = true;
        // let excel = new DBExcel(path, debug);
        // await excel.init();
        // excel.parse();
    }
}

module.exports = DBExcel;