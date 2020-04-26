let AbstractStock = require('./AbstractStock');
let util = require('util');

class YchartsStock extends AbstractStock {
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
        let root = $("div[class='quoteData ']");
        let that = this;
        root.find("span").each(function (index, el) {
            if (index === 0) {
                that.price = that.convert($(el).text());
            } else if (index === 2) {
                that.change = parseFloat($(el).text());
            } else if (index === 3) {
                that.percent = that.parsePercentDivisor100($(el).text());
            }
        });
    }
}

var http = require('../utils/http');

class ycharts {

    getOption() {
        var option = {};
        option.url = "https://ycharts.com";
        option.headers = {};
        option.headers['Referer'] = option.url;
        return option;
    }

    async getAny(any, code) {
        var that = this;
        var url = "https://ycharts.com/%s/%s";
        var option = that.getOption();
        option.url = util.format(url, any, encodeURIComponent(code));
        var body = await http.getRetry(option.url, option);
        var stock = new YchartsStock(code);
        stock.parse(body);
        return stock;
    }

}

// (async () => {
//     await new ycharts().getAny("indices", "^SPBRIC40E");
// })();

module.exports = ycharts;