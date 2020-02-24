/**
 * Created by wp on 2016/9/26.
 */

var AbstractStock = require('./AbstractStock');

class SinaStock extends AbstractStock {
    constructor(code) {
        super(code);
    }

    parse(text) {
        this.strs = text.split(',');
    }

    get time() {
        if (this.code.startsWith('hk')) {
            return this.strs[18];
        } else {
            //return this.strs[30] + " " + this.strs[31];
            return this.strs[31];
        }
    }

    get name() {
        if (this.code.startsWith('hk')) {
            return this.strs[1];
        } else {
            return this.strs[0];
        }
    }

    get cur() {
        if (this.code.startsWith('hk')) {
            return parseFloat(this.strs[6]);
        } else {
            return parseFloat(this.strs[3]);
        }
    }

    get high() {
        if (this.code.startsWith('hk')) {
            return parseFloat(this.strs[4]);
        } else {
            return parseFloat(this.strs[4]);
        }
    }

    get low() {
        if (this.code.startsWith('hk')) {
            return parseFloat(this.strs[5]);
        } else {
            return parseFloat(this.strs[5]);
        }
    }

    get open() {
        if (this.code.startsWith('hk')) {
            return parseFloat(this.strs[2]);
        } else {
            return parseFloat(this.strs[1]);
        }
    }

    get close() {
        if (this.code.startsWith('hk')) {
            return parseFloat(this.strs[3]);
        } else {
            return parseFloat(this.strs[2]);
        }
    }

    get buy1lot() {
        if (this.code.startsWith('hk')) {
            return null;
        } else {
            return parseInt(this.strs[10]);
        }
    }

}

var http = require('../utils/http');
var sina = {};

sina.url = "http://hq.sinajs.cn/list=";

sina.get = function*(codes) {
    var url = codes;
    if (!url.startsWith(sina.url)) {
        url = sina.url + url;
    }
    var codeList = codes.split(',');
    var body = yield http.get(url, {gzip : false, encoding : 'GBK'});
    var strs = body.match(/(?:"[^"]*"|^[^"]*$)/g);
    var arr = [];
    for (var i = 0; i < codeList.length; i++) {
        var error = true;
        if (strs[i]) {
            var text = strs[i].replace(/"/g, "");
            if (text) {
                error = false;
                var stock = new SinaStock(codeList[i]);
                stock.parse(text);
                arr.push(stock);
            }
        }
        if (error) {
            throw new Error("stock not found. code = " + codeList[i]);
        }
    }
    return arr;
};

module.exports = sina;