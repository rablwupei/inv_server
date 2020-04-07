let DataSourceParserXueqiu = require('./Xueqiu');
class DataSourceParserXueqiuKLine extends DataSourceParserXueqiu {
    get key() {
        return "雪球k线";
    }

    get regular() {
        return /雪球k线\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["雪球k线"]["$1"]["$2"]')
    }

    async request() {
        if (this._ids.size === 0) {
            return;
        }
        var requests = [];
        var ids = Array.from(this._ids);
        var xueqiu = DataSourceParserXueqiuKLine.getXueqiuRequest();
        for (let i = 0; i < ids.length; i++) {
            var code = ids[i];
            requests.push(xueqiu.getKLine(code));
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
            value["" + stock.code] = stock.item;
        }
    }
}
module.exports = DataSourceParserXueqiuKLine;