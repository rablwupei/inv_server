let AbstractStock = require('./AbstractStock');
let util = require('util');

class ZhongzhengzhishuStock extends AbstractStock {
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
        var json = {};
        $("table[class='table tc']").find("tbody").children().each(function (index, elem) {
            $(elem).children().each(function (index, subElem) {
                json[index] = that.convert($(subElem).text());
            });
            var num = parseFloat(json[1]);
            if (!isNaN(num)) {
                json[1] = num / 100;
            }
        });
        this.json = json;
    }
}

var http = require('../utils/http');
var m = {};

m.url = "http://www.csindex.com.cn/zh-CN/indices/index-detail/%s";

m.get = async function(code) {
    var url = util.format(m.url, code);
    var referer = url;
    console.log(url)
    var body = await http.get(url, {headers: {'Referer': referer} });
    var stock = new ZhongzhengzhishuStock(code);
    stock.parse(body);
    return stock;
};
//中证指数[H11136][2]
// require('co')(function* () {
//     yield m.get("H11136");
// });

module.exports = m;