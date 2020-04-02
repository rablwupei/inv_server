
class DataSourceParser {
    constructor() {
        this._regularResults = [];
        this._ids = new Set();
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

    addRegularResult(res) {
        this._regularResults.push(res);
        this._ids.add(res[1]);
    }

    async request() {}

    fillValue() {}

    replaceStr() {}
}

module.exports = DataSourceParser;