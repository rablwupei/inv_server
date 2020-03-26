
class Excel {

    parse() {

    }

}


Excel.request = function*() {
    var results = yield [
        Result.requestExcel("a.xls"),
        Result.requestExcel("a_market.xls"),
        Result.requestExcel("hk.xlsx", ExcelReader.type_miaomiaohk),
        Result.requestExcel("hk_market.xls"),
        Result.requestExcel("zhuanzhai.xlsx", ExcelReader.type_miaomiaozhuanzhai),
    ];
    return results;
};

// co(Result.request);
module.exports = Excel;