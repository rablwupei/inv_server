
class DataSourceParser {
    constructor() {
        this._ids = new Set();
        this._reses = [];
        this._stocks = [];
    }

    get enable() {
        return true;
    }

    get key() {
        return "";
    }
    get regular() {
        return null;
    }

    getDBObject() {
        throw new Error("not implement");
    }

    addRegularResult(res) {
        this._ids.add(res[1]);
        this._reses.push(res);
    }

    async request() {}

    fillValue() {}

    replaceStr() {}
}

module.exports = DataSourceParser;