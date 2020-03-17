/**
 * Created by wupei on 16/9/26.
 */

var sprintf = require("sprintf-js").sprintf;
var co = require('co');
var http = require('./http');
var assert = require('assert');

var weixin = {};

var weixinJson = require("../../src/weixin");
var corpID = weixinJson.corpID;
var secret = weixinJson.secret;

var access_token = null;

var log = function (msg) {
    console.log(msg)
};

weixin.send = function (msg) {
    co(function* () {
        yield weixin._initAccessToken();

        var success = yield weixin._doSend(msg);
        if (!success) {
            yield weixin._initAccessToken();
            yield weixin._doSend(msg);
        }
    }).catch(function (err) {
        log(err);
    });
};

weixin._initAccessToken = function* () {
    if (!access_token) {
        var gettokenUrl = sprintf("https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=%s&corpsecret=%s", corpID, secret);
        var body = yield http.get(gettokenUrl);
        access_token = JSON.parse(body).access_token;
        assert(access_token, "access_token empty, body = %s", body);
    }
};

weixin._doSend = function* (msg) {
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
    var body = yield http.post(msgUrl, form);
    var bodyJson = JSON.parse(body);
    if (bodyJson.errcode == 40014) {
        access_token = null;
        return false;
    } else if (bodyJson.errcode != 0) {
        throw new Error("weixin send error. " + body);
    }
    return true;
};

module.exports = weixin;