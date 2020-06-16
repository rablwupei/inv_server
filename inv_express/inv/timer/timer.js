var timer = {};

// Seconds: 0-59
// Minutes: 0-59
// Hours: 0-23
// Day of Month: 1-31
// Months: 0-11 (Jan-Dec)
// Day of Week: 0-6 (Sun-Sat)

timer.start = function () {
    require('../utils/cron').startInTrade('0,30 14 * * 1-5', async() => {
        var http = require("../utils/http");
        var body = await http.get("https://xueqiu.com/S/SZ161716");
        if (body) {
            body = body.match(/溢价率：&lt;span&gt;(-?\d+\.\d+)%/);
            if (body) {
                var value = parseFloat(body[1]);
                var limit = 0.2;
                if (value && value > limit) {
                    var weixin = require("../utils/weixin");
                    weixin.send({
                        message : "招商双债(161716)溢价率 " + value + "% > " + limit + "%",
                        touser : "@all",
                    })
                }
            }
        }
    });
    require('../utils/cron').startInTrade('30 12 * * 1-5', async() => {
        var weixin = require("../utils/weixin");
        weixin.send({
            message : "记得申购新股和新债呦...",
            touser : "wupei",
        })
    });
};

module.exports = timer;
