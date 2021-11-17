
let mongoose = require('mongoose');
let proxySchema = mongoose.Schema({
    url: {type: String, index: true}, //代码
    enable: Boolean, //类型
});

let Proxy = mongoose.model('Proxy', proxySchema, 'Proxy');

let saveProxyDEfault = function() {
    return new Promise(function (resolve, reject) {
        let value = new Proxy();
        value.url = "http://61.150.96.27:36880";
        value.enable = true;
        value.save(function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(value);
        });
    });
};

Proxy.getProxy = async function() {
    let unit = await Proxy.findOne({enable: true}).lean();
    if (!unit) {
        unit = await saveProxyDEfault();
    }
    return unit.url;
};

module.exports = Proxy;