let DataSourceParser = require("../DataSourceParser");

class DataSourceParserYingweicaiqing extends DataSourceParser {
    get key() {
        return "英为indices";
    }

    get regular() {
        return /英为indices\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["英为indices"]["$1"]["$2"]')
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
            requests.push(market.getStock(code));
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
}

module.exports = DataSourceParserYingweicaiqing;