/**
 * Created by wp on 2016/9/26.
 */

var util = require('util');
var sprintf = require("sprintf-js").sprintf;

class AbstractStock {
    constructor(code) {
        this._code = code;
    }

    get code() {
        return this._code;
    }

    get name() {
        throw new Error('not implement.');
    }

    get time() {
        throw new Error('not implement.');
    }

    get cur() {
        throw new Error('not implement.');
    }

    get high() {
        throw new Error('not implement.');
    }

    get low() {
        throw new Error('not implement.');
    }

    get open() {
        throw new Error('not implement.');
    }

    get close() {
        throw new Error('not implement.');
    }

    /** 涨跌幅 */
    get percent() {
        return (this.cur / this.close - 1);
    }

    get percentStr() {
        return sprintf('%.2f%%', this.percent * 100);
    }

    toString() {
        return sprintf("%s - %f (%.2f%%) %f - %f",
            this.name, this.cur, this.percent * 100, this.low, this.high);
    }

}

module.exports = AbstractStock;