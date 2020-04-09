let AbstractStock = require('./AbstractStock');
let util = require('util');

class YahooStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    convert(value) {
        value = value.replaceAll(",", "");
        value = value.replaceAll("%", "");
        value = value.replaceAll("(", "");
        value = value.replaceAll(")", "");
        return value;
    }

    parse(body) {
        const cheerio = require('cheerio');
        const $ = cheerio.load(body);
        let children = $("div[class='D(ib) Mend(20px)']").children();
        this.price = this.convert($(children[0]).text());
        let texts = this.convert($(children[1]).text()).split(" ");
        this.change = parseFloat(texts[0]);
        this.percent = this.parsePercentDivisor100(texts[1]);
    }
}

var http = require('../utils/http');

class yahoo {

    getOption() {
        let option = {};
        option.url = "https://finance.yahoo.com/";
        option.headers = {};
        option.headers['Referer'] = option.url;
        return option;
    }

    async get(code) {
        let url = "https://finance.yahoo.com/quote/%s";
        let option = this.getOption();
        option.url = util.format(url, encodeURIComponent(code));
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
        let stock = new YahooStock(code);
        stock.parse(body);
        return stock;
    }

}

(async () => {
    await new yahoo().get("^SPBRIC");
})();

module.exports = yahoo;