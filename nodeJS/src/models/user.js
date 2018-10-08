const { Schema } = require('mongoose');

const User = new Schema({
    name: {
        firstname: String,
        lastname: String
    },
    created: Date
});