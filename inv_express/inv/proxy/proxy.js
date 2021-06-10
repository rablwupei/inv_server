var proxy = {};
var http = require("../utils/http");
var iconv = require('iconv-lite');

class Proxy {

    constructor(data) {
        this.data = data
        this.ip = data[0]
        this.port = data[1]
        this.type = data[2]
        this.protocol = data[3].toLowerCase()
    }

    getUrl() {
        return this.protocol + "://" + this.ip + ":" + this.port
    }
}

function shuffle(array) {
    var currentIndex = array.length,  randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

proxy.getList = async function() {
    var proxys = []
    for (var i = 2; i <= 2; i++) {
        var url = "https://www.kuaidaili.com/free/inha/" + i
        var option = {};
        var body = await http.get(url, option);
        const cheerio = require('cheerio');
        const $ = cheerio.load(body);
        $("#list").find("tbody").children().each(function (index, elem) {
            var data = {}
            $(elem).children().each(function (index, subElem) {
                data[index] = $(this).text()
            });
            proxys.push(new Proxy(data));
        });
    }
    shuffle(proxys)
    for (const proxy of proxys) {
        var url = "http://hq.sinajs.cn/format=text&list=sh000001";
        var option = {encoding: null, proxy: proxy.getUrl(), timeout: 5 * 1000,};
        try {
            var body = await http.get(url, option);
            body = iconv.decode(body, 'GBK');
            if (!body.endsWith("FAILED")) {
                body = body.trim();
                console.log(proxy.getUrl() + " " + body)
                break
            }
        } catch (e) {
            console.log(proxy.getUrl()  + " " +  e) }
    }
};

proxy.getList()

module.exports = proxy;