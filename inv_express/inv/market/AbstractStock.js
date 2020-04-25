/**
 * Created by wp on 2016/9/26.
 */

var util = require('util');
var sprintf = require("sprintf-js").sprintf;
require('../utils/prototype_extends');

class AbstractStock {
    constructor(code) {
        this.code = code;
        // this.name = '';
        // this.price = 0;
        // this.change = 0;
        // this.percent = 0;
    }

    parseFloat(value) {
        value = (value + '').trim().replaceAll(",", "");
        var num = parseFloat(value);
        if (!isNaN(num)) {
            return num
        }
        return value
    }

    parsePercentDivisor100(value) {
        let newvalue = value + '';
        newvalue = newvalue.trim();
        newvalue = newvalue.replaceAll(",", "");
        newvalue = newvalue.replaceAll("%", "");
        newvalue = parseFloat(newvalue);
        return newvalue / 100;
    }

    get curStr() {
        return sprintf('%.2f', this.price);
    }

    get percentStr() {
        if (this.percent > 0) {
            return sprintf('+%.2f%%', this.percent * 100);
        } else {
            return sprintf('%.2f%%', this.percent * 100);
        }
    }

}

module.exports = AbstractStock;