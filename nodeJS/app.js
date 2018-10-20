// Import modules
const ejsExpress = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const express = require('express');

const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const UserSchema = require('./routes/models/user');

require('dotenv').config();

const app = express();

const router = require('./routes');
const server = require('http').Server(app);

const session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
});


app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve('./views')));
app.set('layout', 'layout/layout');
app.use(express.static(__dirname + '/public'));

app.use(session);
app.use(cookieParser());
app.use(ejsExpress);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

require('./routes/passport')(passport);

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.isAuthenticated();
	next();
});

// Load all routes
app.use('/', router);

// Connect to mongo database
require('./db');

// Launch server
server.listen(process.env.PORT || 3000, () => {
	console.log(`Server launched on ${server.address().address}${server.address().port}`);
});

// Define socket.io listeners
require('./sio')(server, session);

// Export functions and objects
module.exports = {
	server
};
