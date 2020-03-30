let DataSourceParser = require('../DataSourceParser');
class DataSourceParserSina extends DataSourceParser {
    get key() {
        return "新浪";
    }

    get regular() {
        return /新浪\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["新浪"]["$1"]["$2"]')
    }

    addRegularResult(res) {
        this._regularResults.push(res);
        this._ids.add(res[1]);
    }

    *request() {
        if (this._ids.size === 0) {
            return;
        }
        var codes = Array.from(this._ids);
        var codesStr = codes.join(",");
        var sina = require('../../market/sina');
        this._stockMap = yield sina.get(codesStr);
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (const key in this._stockMap) {
            var stock = this._stockMap[key];
            value["" + stock.code] = stock._strs;
        }
    }
}
module.exports = DataSourceParserSina;