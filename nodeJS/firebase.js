// include firebase's libzzzz
const firebase = require('firebase');
require('firebase/auth');

// Get the env variable from .env
require('dotenv').config();


const config = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DB_URL,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.SENDER_ID
};

const app = firebase.initializeApp(config);
const auth = app.auth();

module.exports = {
    auth
};