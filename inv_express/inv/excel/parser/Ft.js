let DataSourceParser = require("../DataSourceParser");

class DataSourceParserYingweicaiqing extends DataSourceParser {
    get key() {
        return "FT";
    }

    get regular() {
        return /FT\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["FT"]["$1"]["$2"]')
    }

    async request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var Market = require('../../market/ft');
        var market = new Market();
        var ids = Array.from(this._ids);
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(market.get(code));
        }
        // for(var request of requests) {
        //     this._stocks.push(await request);
        // }
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
            value["" + stock.code] = stock.data;
        }
        // console.log(values);
    }
}

module.exports = DataSourceParserYingweicaiqing;