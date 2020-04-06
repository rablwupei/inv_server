let AbstractStock = require('./AbstractStock');
let util = require('util');

String.prototype.replaceAll = function (FindText, RepText) {
    regExp = new RegExp(FindText, "g");
    return this.replace(regExp, RepText);
};

class FtStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    convert(value) {
        value = value.replaceAll(",", "");
        value = value.replaceAll("%", "");
        return value;
    }

    parse(body) {
        const cheerio = require('cheerio');
        const $ = cheerio.load(body);
        let data = {};
        let text = $("span.mod-format--neg").first().text();
        let texts = text.split(" ");
        data["qchange"] = this.convert(texts[texts.length - 1]);
        var num = parseFloat(data["qchange"]);
        if (!isNaN(num)) {
            data["qchange"] = num / 100;
        }
        this.data = data;
    }
}

var http = require('../utils/http');

class ft {

    getOption() {
        var option = {};
        option.url = "https://markets.ft.com";
        option.headers = {};
        option.headers['Referer'] = option.url;
        return option;
    }

    async get(code) {
        var that = this;
        var url = "https://markets.ft.com/data/indices/tearsheet/summary?s=";
        var option = that.getOption();
        option.url = util.format(url, code);
        var body = await http.get(option.url, option);
        var stock = new FtStock(code);
        stock.parse(body);
        return stock;
    }

}

// (async () => {
//     await new ft().get("SPGOGCP:REU");
// })();

module.exports = ft;