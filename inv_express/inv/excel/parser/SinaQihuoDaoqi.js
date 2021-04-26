let DataSourceParser = require('../DataSourceParser');
let SinaQihuo = require('./SinaQihuo');
let moment = require("moment");

class DataSourceParserQihuodaoqi extends DataSourceParser {
    get key() {
        return "期货到期";
    }

    get regular() {
        return /期货到期\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["期货到期"]["$1"]')
    }

    async request() {
        if (this._ids.size === 0) {
            return;
        }
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (const key of this._ids) {
            value[key] = SinaQihuo.getTime(key).diff(moment(), 'days');
        }
    }
}
module.exports = DataSourceParserQihuodaoqi;