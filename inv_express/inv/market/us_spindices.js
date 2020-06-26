let AbstractStock = require('./AbstractStock');
let util = require('util');

class Us_spindicesStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    parse(body) {
        //"publishedValue":1021.80416993917696,
        // let match = body.match(/\"publishedValue\":(-?\d+\.\d+),/);
        // this.price = parseFloat(match[1]);
        // match = body.match(/\"percentageChange\":(-?\d+\.\d+),/);
        // this.percent = this.parsePercentDivisor100(match[1]);
        // match = body.match(/\"indexDailyChange\":(-?\d+\.\d+),/);
        // this.change = parseFloat(match[1]);

        const cheerio = require('cheerio');
        const $ = cheerio.load(body);
        this.price = this.parseFloat($("span.published-value").text());
        this.percent = this.parsePercentDivisor100($("label.daily-change").text());
        this.change = 0;
    }
}

var http = require('../utils/http');

class us_spindices {

    getOption() {
        var option = {};
        option.url = "https://us.spindices.com";
        option.headers = {};
        option.headers['Referer'] = option.url;
        return option;
    }

    async get(code) {
        let that = this;
        let url = "https://us.spindices.com/indices/equity/%s";
        let option = that.getOption();
        option.url = util.format(url, code);
        option.timeout = 20 * 1000;
        let body = null;
        let count = 5;
        let error = null;
        for (let i = 0; i < count; i++) {
            try {
                body = await http.get(option.url, option);
                error = null;
                break;
            } catch (e) {
                console.log(`http error and restart. url = ${option.url}`);
                error = e;
            }
        }
        if (error) {
            throw error;
        }
        let stock = new Us_spindicesStock(code);
        stock.parse(body);
        return stock;
    }

}

// (async () => {
//     await new us_spindices().get("sp-global-oil-index");
// })();

module.exports = us_spindices;