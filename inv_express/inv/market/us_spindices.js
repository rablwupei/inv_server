let AbstractStock = require('./AbstractStock');
let util = require('util');

class Us_spindicesStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    parse(body) {
        //"publishedValue":1021.80416993917696,
        let match = body.match(/\"publishedValue\":(-?\d+\.\d+),/);
        this.price = parseFloat(match[1]);
        match = body.match(/\"percentageChange\":(-?\d+\.\d+),/);
        this.percent = this.parsePercentDivisor100(match[1]);
        match = body.match(/\"indexDailyChange\":(-?\d+\.\d+),/);
        this.change = parseFloat(match[1]);
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
        var that = this;
        var url = "https://us.spindices.com/indices/equity/%s";
        var option = that.getOption();
        option.url = util.format(url, code);
        var body = await http.get(option.url, option);
        var stock = new Us_spindicesStock(code);
        stock.parse(body);
        return stock;
    }

}

// (async () => {
//     await new us_spindices().get("sp-global-oil-index");
// })();

module.exports = us_spindices;