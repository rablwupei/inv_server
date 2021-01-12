let DataSourceParser = require("../DataSourceParser");

class DataSourceParserEoddata extends DataSourceParser {
    get key() {
        return "eoddata_delete";
    }

    get regular() {
        return /eoddata_delete\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["eoddata"]["$1"]["$2"]')
    }

    async request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var Market = require('../../market/eoddata');
        var market = new Market();
        var ids = Array.from(this._ids);
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(market.get(code));
        }
        this._stocks = await Promise.all(requests);
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (let i = 0; i < this._stocks.length; i++) {
            var stock = this._stocks[i];
            value["" + stock.code] = stock;
        }
        // console.log(values);
    }
}

module.exports = DataSourceParserEoddata;