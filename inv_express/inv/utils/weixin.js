/**
 * Created by wupei on 16/9/26.
 */

var sprintf = require("sprintf-js").sprintf;
var http = require('./http');
var assert = require('assert');

var weixin = {};

let corpID;
let secret;
try {
    let weixinJson = require("../../src/weixin");
    corpID = weixinJson.corpID;
    secret = weixinJson.secret;
} catch (e) {
    console.error(e);
}

var access_token = null;

weixin.send = function (msg) {
    (async () => {
        await weixin._initAccessToken();
        var success = await weixin._doSend(msg);
        if (!success) {
            await weixin._initAccessToken();
            await weixin._doSend(msg);
        }
    })().catch(function (err) {
        console.error(err);
    });
};

weixin._initAccessToken = async function () {
    if (!access_token) {
        var gettokenUrl = sprintf("https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=%s&corpsecret=%s", corpID, secret);
        var body = await http.get(gettokenUrl);
        access_token = JSON.parse(body).access_token;
        assert(access_token, "access_token empty, body = %s", body);
    }
};

weixin._doSend = async function (msg) {
    var txt = msg.message;
    var form = JSON.stringify({
        text : { content : txt },
        touser : msg.touser,
        toparty : "",
        totag : "",
        msgtype : "text",
        agentid : 0,
        safe : 0,
    });
    var msgUrl = sprintf("https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=%s", access_token);
    var body = await http.post(msgUrl, form);
    var bodyJson = JSON.parse(body);
    if (bodyJson.errcode === 40014) {
        access_token = null;
        return false;
    } else if (bodyJson.errcode !== 0) {
        throw new Error("weixin send error. " + body);
    }
    return true;
};

module.exports = weixin;