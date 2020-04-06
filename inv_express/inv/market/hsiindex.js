let AbstractStock = require('./AbstractStock');
let util = require('util');

String.prototype.replaceAll = function (FindText, RepText) {
    regExp = new RegExp(FindText, "g");
    return this.replace(regExp, RepText);
};

class HsiindexStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    convert(value) {
        value = value.replaceAll(",", "");
        value = value.replaceAll("%", "");
        return value;
    }

    parse(body) {
        this.array = JSON.parse(body)['indexSeriesList'][0]['indexList'];
        this.json = {};
        for (let i of this.array) {
            this.json[i['indexName']] = i;
            var num = parseFloat(i["changePercentage"]);
            if (!isNaN(num)) {
                i["changePercentage"] = num / 100;
            }
        }
    }
}

var http = require('../utils/http');

class hsiindex {

    getOption() {
        var option = {};
        option.url = "https://www.hsi.com.hk/schi/indexes/all-indexes/sizeindexes";
        option.headers = {};
        option.headers['Referer'] = option.url;
        return option;
    }

    async get() {
        var that = this;
        var url = "https://www.hsi.com.hk/data/schi/rt/index-series/sizeindexes/performance.do?8619";
        var option = that.getOption();
        option.url = url;
        var body = await http.get(option.url, option);
        var stock = new HsiindexStock();
        stock.parse(body);
        return stock;
    }

}

(async () => {
    await new hsiindex().get();
})();

module.exports = hsiindex;