var Timer = {};

Timer.Start = function () {
    const schedule = require('node-schedule');
    schedule.scheduleJob('0 0 14 * * 1-5',()=>{
        var co = require('co');
        co(function* () {
            var http = require("./utils/http");
            var body = yield http.get("https://xueqiu.com/S/SZ161716");
            body = body.match(/溢价率：&lt;span&gt;(-?\d+\.\d+)%/);
            var value = parseFloat(body[1]);
            var limit = 0.2;
            if (value && value > limit) {
                var weixin = require("./utils/weixin");
                weixin.send({
                    message : "招商双债(161716)溢价率 " + value + "% > " + limit + "%",
                    touser : "@all",
                })
            }
        });
    });
};

module.exports = Timer;
