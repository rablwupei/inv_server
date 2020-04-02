let db = {};

db.init = async function() {
    if (db.mongoose) {
        return db.mongoose;
    }
    const mongoose = require('mongoose');
    mongoose.Promise = Promise;
    let info = require('../../src/mongo');
    await mongoose.connect(`mongodb://localhost:${info.port}/${info.db}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        user: info.user,
        pass: info.password,
        authSource: info.source,
    });
    db.mongoose = mongoose;
    return mongoose;
};

db.save = async function() {
    var mongoose = await db.init();
    var kittySchema = mongoose.Schema({
        name: [String],
        name1: String,
        date : Date,
    });
    var Kitten = mongoose.model('Kitten', kittySchema);
    await new Kitten({name : ["abcccc"]}).save();
    console.log("ok");
};
(()=> async function () {
    await db.save();
})();

module.exports = db;