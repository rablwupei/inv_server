let Excel = require('../excel/Excel');
let xlsx = require('node-xlsx').default;
let Stocks = require('./Stocks');

class DBUnit {

    parse(table, parser) {
        this.code = table[0];
        this.name = table[1];
        this.parser = parser;
    }

    startTimer() {
        // this.startRequestAndSave().catch(function(error) {
        //     console.error(error);
        // });
    }

    async startRequestAndSave() {
        await this.parser.request();
        this.stock = this.parser.getDBObject();
        await Stocks.saveDBUnit(this);
    }

}

class DBExcel extends Excel {

    constructor(path, debug) {
        super(path, debug);

    }

    parse() {
        let excelData = xlsx.parse(this._path)[0].data;
        this._excelData = excelData; //this in used
        this.dbUnits = [];
        for (let i = 2; i < excelData.length; ++i) {
            if (this.skipRow(i)) {
                continue;
            }
            let cell = excelData[i][3];
            if (cell) {
                let process = false;
                for (let k = 0; k < this._parserClasses.length && !process; k++) {
                    let cls = this._parserClasses[k];
                    let parser = new cls();
                    if (parser.regular) {
                        let matches = (cell + "[0]").matchAll(parser.regular);
                        for (const match of matches) {
                            parser.addRegularResult(match);
                            let dbUnit = new DBUnit();
                            dbUnit.parse(excelData[i], parser);
                            this.dbUnits.push(dbUnit);
                            process = true;
                            break;
                        }
                    }
                }
            }
        }
    }

    startTimer() {
        for (let unit of this.dbUnits) {
            unit.startTimer();
        }
    }

    static async exec() {
        let path = __dirname + "/../../src/db/db.xlsx";
        let debug = true;
        let excel = new DBExcel(path, debug);
        await excel.init();
        excel.parse();
        excel.startTimer();
    }
}

module.exports = DBExcel;