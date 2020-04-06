/**
 * Created by wupei on 16/9/24.
 */

var http = {};

var request = require('request');

var timeout = 15 * 1000;
var requests = [];

http.get = function (url, option = {}, customRequest) {
    option.url = url;
    option.timeout = option.timeout || timeout;
    option.forever = true;
    option.headers = option.headers || {};
    option.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36';
    if (option.gzip !== false) {
        option.gzip = true;
    }
    // console.log(url);
    // requests.push(url);
    return new Promise(function(resolve, reject) {
        let useRequest = customRequest || request;
        useRequest(option, function (error, response, body) {
            // requests.splice( requests.indexOf(url), 1 );
            // console.log(requests.length +  ": " + requests.concat(","));
            if (!error) {
                if (response) {
                    if (response.statusCode === 200) {
                        if (body) {
                            resolve(body);
                        } else {
                            reject(url + ": body empty");
                        }
                    } else {
                        reject(url + ": code: " + response.statusCode + ", body: " + option);
                    }
                } else {
                    reject(url + ": response null");
                }
            } else {
                reject(url + ": " + error);
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