// Import modules
const ejsExpress = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
require('dotenv').config();

const router = require('./routes');

// Load environment variables
// Connect to mongo database
require('./db');



function makeServer(port) {
	const app = express();
	const server = require('http').Server(app);

	app.set('view engine', 'ejs');
	app.set('views', path.join(path.resolve('./views')));
	app.set('layout', 'layout/layout');
	app.use(express.static(__dirname + '/public'));

	app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
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
	app.use('/', router);

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
