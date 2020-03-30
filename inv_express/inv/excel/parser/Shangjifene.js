let DataSourceParser = require("../DataSourceParser");
class DataSourceParserShangjifene extends DataSourceParser {
    get key() {
        return "上基份额"; //深基份额[161129]
    }

    get regular() {
        return /上基份额\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["上基份额"]["$1"]')
    }

    *request() {
        if (this._ids.size === 0) {
            return;
        }
        var Shangjifene = require("../../market/shangjifene");
        this._stock = yield new Shangjifene().get();
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (var key in this._stock.data) {
            value[key] = this._stock.data[key];
        }
    }
}
module.exports = DataSourceParserShangjifene;