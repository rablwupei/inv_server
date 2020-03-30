let DataSourceParser = require("../DataSourceParser");
class DataSourceParserShenjifene extends DataSourceParser {
    get key() {
        return "深基份额"; //深基份额[161129]
    }

    get regular() {
        return /深基份额\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["深基份额"]["$1"]')
    }

    *request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var ids = Array.from(this._ids);
        var shenjifene = require("../../market/shenjifene");
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(shenjifene.get(code));
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
            value["" + stock.code] = stock.json.dqgm;
        }
    }
}
module.exports = DataSourceParserShenjifene;