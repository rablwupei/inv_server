let Users = {};


Users.findByUsername = function(login, cb) {
    let json = require('../../src/user');
    for (let user of json.users) {
        if (user.username === login.username && user.password === login.password) {
            return cb(user);
        }
    }
    return cb(null);
};

module.exports = Users;