let http = require('../utils/http');
let moment = require('moment');
let tushare = {};

tushare.getTradeOpen = async function() {
    let tushareJson = require('../../src/tushare');
    let date = moment().format('YYYYMMDD');
    let form = {
        api_name: "trade_cal",
        token: tushareJson.token,
        params: {exchange:"SSE", start_date: date, end_date: date},
        fields: ["exchange", "cal_date", "is_open", "pretrade_date"],
    };
    let body = await http.post(tushareJson.url, JSON.stringify(form));
    body = JSON.parse(body);
    if (body['code'] !== 0) {
        throw new Error(`tushare error. body = ${body}`);
    }
    body = tushare.arrangeData(body['data']);
    return body[0]['is_open'] === 1;
};

tushare.arrangeData = function(data) {
    let objs = [];
    for (let item of data['items']) {
        let obj = {};
        for (let i = 0; i < item.length; i++) {
            obj[data['fields'][i]] = item[i];
        }
        objs.push(obj);
    }
    return objs;
};

// (async ()=>{
//     let open = await tushare.getTradeOpen();
//     console.log(open);
// })();

module.exports = tushare;