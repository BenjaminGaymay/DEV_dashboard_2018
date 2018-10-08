const mongoose = require('mongoose');


class Database {
    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect(process.env.MONGO_URI)
            .then(() => {
                console.log('Database connection successful!');
            })
            .catch(err => {
                console.error('Database connection error!');
            });
    }
}

module.exports = new Database;

// module.exports = function(url) {
//     const mongoose = require('mongoose');
//     require('dotenv').config();
//     mongoose.connect(url, err => { if (err) throw err; });

//     return mongoose.connection;
// }