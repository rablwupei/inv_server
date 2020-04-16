let DataSourceParser = require("../DataSourceParser");

class DataSourceParserYingweicaiqing extends DataSourceParser {
    constructor() {
        super();
        this._urls = [];
    }

    get key() {
        return "英为财情";
    }

    get regular() {
        return /英为财情\[(.*?)\]\[(.*?)\]\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["英为财情"]["$1"]["$2"]["$3"]["$4"]')
    }

    addRegularResult(res) {
        this._ids.add(res[2]);
        this._urls.push(res[1]);
    }

    async request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var Market = require('../../market/yingweicaiqing');
        var market = new Market();
        var ids = Array.from(this._ids);
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(market.getAny(this._urls[i], code));
        }
        this._stocks = await Promise.all(requests);
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = values[this.key] || {};
        values[this.key] = value;
        for (let i = 0; i < this._stocks.length; i++) {
            var stock = this._stocks[i];
            value[this._urls[i]] = value[this._urls[i]] || {};
            value[this._urls[i]]["" + stock.code] = stock.array;
        }
    }
}

module.exports = DataSourceParserYingweicaiqing;