
module.exports = function(url) {
    const mongoose = require('mongoose');
    require('dotenv').config();
    mongoose.connect(url);

    return mongoose.connection;
}