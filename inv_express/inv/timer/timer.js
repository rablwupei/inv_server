var timer = {};

// Seconds: 0-59
// Minutes: 0-59
// Hours: 0-23
// Day of Month: 1-31
// Months: 0-11 (Jan-Dec)
// Day of Week: 0-6 (Sun-Sat)

timer.start = function () {
    var CronJob = require('cron').CronJob;
    new CronJob('0,30 14 * * 1-5', async() => {
        var http = require("../utils/http");
        var body = await http.get("https://xueqiu.com/S/SZ161716");
        body = body.match(/溢价率：&lt;span&gt;(-?\d+\.\d+)%/);
        var value = parseFloat(body[1]);
        var limit = 0.2;
        if (value && value > limit) {
            var weixin = require("../utils/weixin");
            weixin.send({
                message : "招商双债(161716)溢价率 " + value + "% > " + limit + "%",
                touser : "@all",
            })
        }
    }).start();
};

module.exports = timer;
