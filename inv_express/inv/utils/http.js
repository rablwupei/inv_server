/**
 * Created by wupei on 16/9/24.
 */

var http = {};

var request = require('request');
var iconv = require('iconv-lite');

var timeout = 10 * 1000;

http.get = function (url, option = {}) {
    option.url = url;
    option.timeout = option.timeout || timeout;
    option.method = option.method || 'GET';
    option.headers = option.headers || {};
    option.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36';
    if (option.gzip !== false) {
        option.gzip = true;
    }
    var isGBK = option.encoding == 'GBK';
    if (isGBK) {
        option.encoding = null;
    }
    return new Promise(function(resolve, reject) {
        request(option, function (error, response, body) {
            if (isGBK) {
                resolve(iconv.decode(body, 'GBK'));
            } else {
                resolve(body);
            }
        });
    });
};

http.post = function (url, post, option = {}) {
    option.body = post;
    option.method = 'POST';
    return http.get(url, option);
};

module.exports = http;