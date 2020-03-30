let DataSourceParser = require('../DataSourceParser');
class DataSourceParserXueqiu extends DataSourceParser {
    get key() {
        return "雪球";
    }

    get regular() {
        return /雪球\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["雪球"]["$1"]["$2"]')
    }

    addRegularResult(res) {
        this._regularResults.push(res);
        this._ids.add(res[1]);
    }

    *request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var ids = Array.from(this._ids);
        var Xueqiu = require('../../market/xueqiu');
        var xueqiu = new Xueqiu();
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(xueqiu.get(code));
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
            value["" + stock.code] = stock.json;
        }
    }
}
module.exports = DataSourceParserXueqiu;