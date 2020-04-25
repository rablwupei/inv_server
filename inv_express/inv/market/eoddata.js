let AbstractStock = require('./AbstractStock');
let util = require('util');

class EoddataStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    convert(value) {
        value = value.replaceAll(",", "");
        value = value.replaceAll("%", "");
        return value;
    }

    parse(text) {
        const cheerio = require('cheerio');
        const $ = cheerio.load(text);
        let that = this;
        $("table[cellpadding='3'][cellspacing='2']").find("b").each(function (index, elem) {
            if (index === 0) {
                that.cur = that.parseFloat($(elem).text())
            } else if (index === 1) {
                that.change = that.parseFloat($(elem).text())
            } else if (index === 6) {
                that.percent = that.parsePercentDivisor100($(elem).text())
            }
        });
    }

}

var http = require('../utils/http');

class eoddata {

    getOption() {
        var option = {};
        option.url = "https://www.eoddata.com";
        option.headers = {};
        option.headers['Referer'] = option.url;
        return option;
    }

    async get(code) {
        var that = this;
        var url = "https://www.eoddata.com/stockquote/INDEX/%s.htm";
        var option = that.getOption();
        option.url = util.format(url, code);
        var body = await http.getRetry(option.url, option);
        var stock = new EoddataStock(code);
        stock.parse(body);
        return stock;
    }

}

// (async () => {
//     await new eoddata().get("SSBR");
// })();

module.exports = eoddata;