// Import modules
const ejsExpress = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const router = require('./routes');
const path = require('path');
const passport = require('passport');
const flash = require('connect-flash');

// Load environment variables
require('dotenv').config();

// Connect to mongo database
require('./db');

function makeServer(port) {
	const app = express();
	const server = require('http').Server(app);

	app.set('view engine', 'ejs');
	app.set('views', path.join(path.resolve('./views')));
	app.use(express.static(__dirname + '/public'));
	app.use(session({
		secret: "Jean-Eude",
		resave: true,
		saveUninitialized: true
	}));
	app.use(ejsExpress);
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.set('layout', 'layout/layout');

	app.use(flash());

	app.use('/', router);
	app.use(passport.initialize());
	app.use(passport.session());

	return server.listen(port, () => {
		console.log(`Server launched on ${server.address().address}${server.address().port}`);
	});
};



// Start server
const server = makeServer(3000);
const io = require('socket.io')(server);

io.on('connection', function(client) {
	client.on('join', function() {
	});
});

// Export functions and objects
module.exports = {
	server
};
