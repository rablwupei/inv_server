let tushare = require('../market/tushare');
let CronJob = require('cron').CronJob;

let cron = {};
cron.startInTrade = function(cron, func) {
    new CronJob(cron, async() => {
        let trageOpen = await tushare.getTradeOpen();
        if (trageOpen && func) {
            await func();
        }
    }).start();
};

module.exports = cron;