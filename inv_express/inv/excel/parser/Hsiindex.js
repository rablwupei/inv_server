let DataSourceParser = require("../DataSourceParser");

class DataSourceParserHsiindex extends DataSourceParser {
    get key() {
        return "HSIINDEX";
    }

    get regular() {
        return /HSIINDEX\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["HSIINDEX"]["$1"]["$2"]')
    }

    async request() {
        if (this._ids.size === 0) {
            return;
        }
        var Market = require('../../market/hsiindex');
        var market = new Market();
        this._stock = await market.get();
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (var key in this._stock.json) {
            value[key] = this._stock.json[key];
        }
    }
}

module.exports = DataSourceParserHsiindex;