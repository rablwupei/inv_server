let DataSourceParser = require("../DataSourceParser");

class DataSourceParserWangyi extends DataSourceParser {
    get key() {
        return "网易";
    }

    get regular() {
        return /网易\[(.*?)\]\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["网易"]["$1"]["$2"]["$3"]')
    }

    async request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var ids = Array.from(this._ids);
        var wangyi = require("../../market/wangyi");
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(wangyi.get(code));
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
            value["" + stock.code] = stock.json;
        }
    }
}
module.exports = DataSourceParserWangyi;