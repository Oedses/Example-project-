const mongoose = require('mongoose');
const {MONGO_URL} = require('./config');

function init() {
    return mongoose.connect(MONGO_URL, {
        autoIndex: false,
        socketTimeoutMS: 0,
        keepAlive: true,
        useNewUrlParser: true
    });
}

module.exports = {
    init,
};
