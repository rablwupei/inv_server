let DataSourceParser = require('../DataSourceParser');
let moment = require("moment");

class DataSourceParserSinaQihuo extends DataSourceParser {
    get key() {
        return "新浪期货";
    }

    get regular() {
        return /新浪期货\[(.*?)\]\[(.*?)\]\[(.*?)\]/g;
    }

    replaceStr(str) {
        return str.replace(this.regular, 'values["新浪期货"]["$1"]["$2"]["$3"]')
    }

    addRegularResult(res) {
        super.addRegularResult(res);
    }

    async request() {
        this._ids.clear();
        this._name2id = {};
        for (let i = 0; i < this._reses.length; i++) {
            let res = this._reses[i];
            let codeStr = res[1];
            let timeName = res[2];
            let codeEx = DataSourceParserSinaQihuo.getTime(timeName).format("YYMM");
            this._ids.add(codeStr + codeEx);
            this._name2id[codeStr+codeEx] = {timeName : timeName, codeStr: codeStr}
        }

        if (this._ids.size === 0) {
            return;
        }

        var codes = Array.from(this._ids);
        var codesStr = codes.join(",");
        var sina = require('../../market/sina');
        this._stockMap = await sina.get(codesStr);
    }

    static getThirdFriday(mDate) {
        // Based on https://stackoverflow.com/a/34278588
        // By default we will need to add two weeks to the first friday
        let nWeeks = 2,
            month = mDate.month();
        // Get first Friday of the first week of the month
        mDate = mDate.date(1).day(5);
        // Check if first Friday is in the given month
        //  it may have gone to the previous month
        if (mDate.month() != month) {
            nWeeks++;
        }
        // Return 3rd Friday of the month formatted (custom format)
        return mDate.add(nWeeks, 'weeks');
    }

    static getTime(name) {
        let util = DataSourceParserSinaQihuo;
        //moment().quarter(moment().quarter() - 1).endOf('quarter').valueOf()
        let thirdFriday = util.getThirdFriday(moment());
        thirdFriday.minute(59).second(59);
        if (moment().isAfter(thirdFriday)) {
            thirdFriday = util.getThirdFriday(thirdFriday.add(1, "M"));
        }
        if (name === "当月") {

        } else if (name === "下月") {
            thirdFriday = util.getThirdFriday(thirdFriday.add(1, "M"));
        } else if (name === "下季") {
            thirdFriday = util.getThirdFriday(thirdFriday.add(1, "M"));
            let endDay = thirdFriday.quarter(thirdFriday.quarter() + 1).endOf('quarter');
            thirdFriday = util.getThirdFriday(endDay);
        } else if (name === "下下季") {
            thirdFriday = util.getThirdFriday(thirdFriday.add(1, "M"));
            let endDay = thirdFriday.quarter(thirdFriday.quarter() + 1).endOf('quarter');
            thirdFriday = util.getThirdFriday(endDay);
            thirdFriday = util.getThirdFriday(thirdFriday.add(3, "M"));
        }
        return thirdFriday;
    }

    fillValue(values) {
        if (this._ids.size === 0) {
            return;
        }
        var value = {};
        values[this.key] = value;
        for (const key in this._stockMap) {
            var stock = this._stockMap[key];
            var obj = this._name2id[key];
            value[obj.codeStr] = value[obj.codeStr] || {};
            value[obj.codeStr][obj.timeName] = stock._strs
        }
    }
}
module.exports = DataSourceParserSinaQihuo;