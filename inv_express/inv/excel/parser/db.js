let DataSourceParser = require("../DataSourceParser");
let Stocks = require("../../db/Stocks");

class DataSourceParserDB extends DataSourceParser {
    get key() {
        return "db";
    }

    get regular() {
        return /db\[(.*?)\]\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["db"]["$1"]["$2"]["$3"]')
    }

    async request() {
        if (this._ids.size === 0) {
            return;
        }
        let ids = Array.from(this._ids);
        this._map = await Stocks.loadMapFromCodes(ids);
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (let key in this._map) {
            value[key] = this._map[key];
        }
    }
}

module.exports = DataSourceParserDB;