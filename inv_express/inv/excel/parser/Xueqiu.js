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

    static getXueqiuRequest() {
        var Xueqiu = require('../../market/xueqiu');
        return new Xueqiu();
    }

    async request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var ids = Array.from(this._ids);
        var xueqiu = DataSourceParserXueqiu.getXueqiuRequest();
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(xueqiu.get(code));
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


module.exports = DataSourceParserXueqiu;