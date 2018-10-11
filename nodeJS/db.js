const mongoose = require('mongoose');


class Database {
    constructor() {
        this.connect();
    }

    connect() {
        mongoose.set('useCreateIndex', true);
        mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true})
            .then(() => {
                console.log('[!] Database connection successful!');
            })
            .catch(err => {
                console.error('[!] Database connection error!');
            });
    }
}

module.exports = new Database;