let DataSourceParser = require("../DataSourceParser");

class DataSourceParserUs_spindices extends DataSourceParser {
    get key() {
        return "us_spindices";
    }

    get regular() {
        return /us_spindices\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["us_spindices"]["$1"]["$2"]')
    }

    async request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var Market = require('../../market/us_spindices');
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
    }

    getDBObject() {
        for (let stock of this._stocks) {
            return stock
        }
        return null;
    }

}

module.exports = DataSourceParserUs_spindices;