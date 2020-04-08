let DataSourceParser = require("../DataSourceParser");
class DataSourceParserShenjifene extends DataSourceParser {
    get key() {
        return "深基份额"; //深基份额[161129]
    }

    get regular() {
        return /深基份额\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["深基份额"]["$1"]["$2"]')
    }

    async request() {
        if (this._ids.size === 0) {
            return;
        }
        let shenjifene = require("../../market/shenjifeneExcel");
        this._stockMap = await shenjifene.get();
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        values[this.key] = this._stockMap;
    }
}
module.exports = DataSourceParserShenjifene;