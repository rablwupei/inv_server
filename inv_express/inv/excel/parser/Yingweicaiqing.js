let DataSourceParser = require("../DataSourceParser");

class DataSourceParserYingweicaiqing extends DataSourceParser {
    get key() {
        return "英为财情";
    }

    get regular() {
        return /英为财情\[(.*?)\]\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["英为财情"]["$1"]["$2"]["$3"]')
    }

    *request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var market = require('../../market/yingweicaiqing');
        var ids = Array.from(this._ids);
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(market.get(code));
        }
        this._stocks = yield requests;
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (let i = 0; i < this._stocks.length; i++) {
            var stock = this._stocks[i];
            value["" + stock.code] = stock.array;
        }
    }
}

module.exports = DataSourceParserYingweicaiqing;