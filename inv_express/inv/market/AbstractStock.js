/**
 * Created by wp on 2016/9/26.
 */

var util = require('util');
var sprintf = require("sprintf-js").sprintf;

class AbstractStock {
    constructor(code) {
        this._code = code;
        this.name = '';
        this.cur = 0;
        this.change = 0;
        this.percent = 0;
    }

    get code() {
        return this._code;
    }

    get percentStr() {
        if (this.percent > 0) {
            return sprintf('+%.2f%%', this.percent * 100);
        } else {
            return sprintf('%.2f%%', this.percent * 100);
        }
    }

    toString() {
        return sprintf("%s - %f (%s)",
            this.name, this.cur, this.changePercentStr);
    }

}

module.exports = AbstractStock;