// Import modules
const ejsExpress = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const UserSchema = require('./routes/models/user');
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

const widgets = require('./widgets/widgets');

io.on('connection', function(client) {
	client.on('join', function(username) {
		UserSchema.findOne({"local.username": username}).then(function(bonhomme) {
			client.username = username;
			client.widgets = {}; // recupérer les objets du bonhomme
			widgets.initializeTimer(client);
			client.nbApps = Object.keys(client.widgets).length;
		}).catch(function(err) {
			client.widgets = {};
			client.nbApps = 0;
			console.log("spa normal");
		});

	});

	client.on('updateAll', function() {
		for (const widget of Object.values(client.widgets)) {
			widgets.update(client, widget);
		};
	});

	client.on('serialize', function(serialized) {
		for (const datas of serialized) {
			var widget = client.widgets[datas.id];
			widget.posX = datas.posX;
			widget.posY = datas.posY;
			widget.sizeX = datas.sizeX;
			widget.sizeY = datas.sizeY;
		};
		UserSchema.findOne({"local.username": client.username}).then(function(bonhomme) {
			// faut sauvegarder client.widgets
		}).catch(function(err) {
			console.log("spa normal");
		});
	});

	// WIDGETS BASICS CONFIGURATIONS

	client.on('addWeatherWidget', function(config) {
		const widgetConfig = {
			id: client.nbApps.toString(),
			type: "weather",
			interval: config.interval,
			sizeX: '2',
			sizeY: '2',
			other: {
				city: config.city,
				country: config.country,
				countryCode: widgets.getCountryCode(config.city, config.country),
				lang: config.lang,
				unit: 'M'
			}
		};

		if (widgetConfig.other.country) {
			client.nbApps += 1;
			widgets.weather(client, widgetConfig);
		} else
			console.log("weather: missing country");
		// else YA UNE ERREUR
	});

	client.on('updateWeather', function(config) {
		var widgetConfig = client.widgets[config.id];
		widgetConfig.other.city = config.city;
		widgetConfig.other.country = config.country;
		widgetConfig.other.countryCode = widgets.getCountryCode(config.city, config.country);
		widgetConfig.interval = config.interval;
		widgets.resetTimer(client, widgetConfig);
		if (widgetConfig.other.countryCode)
			widgets.update(client, widgetConfig);
		else
		console.log("weather: missing country");
		// else YA UNE ERREUR
	});

	client.on('removeWidgetByID', function(widgetID) {
		if (client.widgets[widgetID]) {
			clearInterval(client.widgets[widgetID].timer);
			client.emit('removeWidget', widgetID);
			delete client.widgets[widgetID];
		};
	});

	client.on('disconnect', function() {
		for (const widget of Object.values(client.widgets)) {
			clearInterval(widget.timer);
		};
	});
});

// Export functions and objects
module.exports = {
	server
};
