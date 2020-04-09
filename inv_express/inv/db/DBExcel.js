let Excel = require('../excel/Excel');
let xlsx = require('node-xlsx').default;
let Stocks = require('./Stocks');

class DBUnit {
    constructor() {
        this.parser = null;
    }

    parse(table) {
        this.code = table[0];
        this.name = table[1];
        this.type = table[2];
        this.time = table[3];
    }

    startTimer() {
        console.log("[timer] default: " + JSON.stringify(this));
        let CronJob = require('cron').CronJob;
        new CronJob(this.time, () => {
            this.startRequestAndSave().catch(function(error) {
                console.error(error);
            });
        }).start();
    }

    async startRequestAndSave() {
        await this.parser.request();
        this.stock = this.parser.getDBObject();
        if (this.stock) {
            await Stocks.saveOne(this.code, this.name, this.type, this.stock);
        }
    }
}

class DBExcel extends Excel {

    constructor(path, debug) {
        super(path, debug);
        this.defTimers = {};
        this.defTimers["#001"] = { callback: require('../market/shenjifeneExcel').startTimer };
    }

    parse() {
        let excelData = xlsx.parse(this._path)[0].data;
        this._excelData = excelData; //this in used
        this.dbUnits = [];
        for (let i = 2; i < excelData.length; ++i) {
            if (this.skipRow(i)) {
                continue;
            }
            let line = excelData[i];
            let code = line[0];
            let name = line[1];
            let type = line[2];
            let time = line[3];
            let src  = line[4];
            let defTimer = this.defTimers[code];
            if (defTimer) {
                defTimer.code = code;
                defTimer.name = name;
                defTimer.type = type;
                defTimer.time = time;
                continue;
            }
            if (src) {
                let process = false;
                for (let k = 0; k < this._parserClasses.length && !process; k++) {
                    let cls = this._parserClasses[k];
                    let parser = new cls();
                    if (parser.regular) {
                        let matches = (src + "[0]").matchAll(parser.regular);
                        for (const match of matches) {
                            parser.addRegularResult(match);
                            let dbUnit = new DBUnit();
                            dbUnit.parser = parser;
                            dbUnit.parse(line);
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
        for (let key in this.defTimers) {
            let defTimer = this.defTimers[key];
            let CronJob = require('cron').CronJob;
            new CronJob(defTimer.time, function () {
                if (defTimer.callback) {
                    defTimer.callback(defTimer);
                }
            }).start();
            console.log("[timer] def: " + JSON.stringify(defTimer));
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