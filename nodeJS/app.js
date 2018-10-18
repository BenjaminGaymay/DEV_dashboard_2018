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
const widgets = require('./widgets/widgets');
require('dotenv').config();

const router = require('./routes');

// Load environment variables
// Connect to mongo database
require('./db');


// Server creation

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


// Widgets saver

// Save widgets on database
function saveWidgetsOnDatabase(client) {
	UserSchema.findOne({"local.username": client.username}).then(function(bonhomme) {
		bonhomme.widgets = Object.assign({}, client.widgets);
		for (const widget of Object.values(client.widgets))
			bonhomme.widgets[widget.id].timer = undefined;
		bonhomme.markModified("widgets");
		return bonhomme.save();
	}).then(function() {
		console.log(" * Widgets successfully update on database");
	}).catch(function(err) {
		console.log(" /!\\ Widgets update on database failed !");
	});
};


// Start server

const server = makeServer(3000);
const io = require('socket.io')(server);

// Define socket.io listeners

io.on('connection', function(client) {
	// Initialize new user
	client.widgets = {};
	client.nbApps = 0;

	// GENERICS FUNCTIONS

	client.on('join', function(datas) {
		if (!datas)
			return;
		UserSchema.findOne({"local.username": datas.username}).then(function(bonhomme) {
			client.username = datas.username;
			client.widgets = {};
			if (bonhomme.widgets) {
				for (const widget of Object.values(bonhomme.widgets))
					widgets.update(client, widget);
				client.nbApps = Object.keys(bonhomme.widgets).length;
			};
			console.log(`[+] New user connected via socket.io : ${client.username}`);
		}).catch(err => {
			console.log("socket.io: link with database failed")
			client.emit('reload');
		});
	});

	client.on('updateAll', function() {
		for (const widget of Object.values(client.widgets)) {
			widgets.update(client, widget);
		};
	});

	client.on('serialize', function(serialized) {
		// Update widgets
		for (const datas of serialized) {
			var widget = client.widgets[datas.id];
			widget.posX = datas.posX;
			widget.posY = datas.posY;
			widget.sizeX = datas.sizeX;
			widget.sizeY = datas.sizeY;
		};

		saveWidgetsOnDatabase(client);
	});

	client.on('removeWidgetByID', function(widgetID) {
		if (client.widgets[widgetID]) {
			clearTimeout(client.widgets[widgetID].timer);
			client.emit('removeWidget', widgetID);
			delete client.widgets[widgetID];
			console.log(` - User ${client.username} remove widget ${widgetID}`);
			saveWidgetsOnDatabase(client);
		};
	});

	client.on('disconnect', function() {
		if (client && client.widgets)
			for (var widget of Object.values(client.widgets)) {
				clearTimeout(client.widgets[widget.id].timer);
				client.widgets[widget.id].loop = false;
			};

		console.log(`[-] User ${client.username} disconnected from socket.io`);
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
			console.log(` + User ${client.username} add widget ${widgetConfig.id}`);
		} else
			console.log("weather add: missing country");
	});

	client.on('updateWeather', function(config) {
		client.widgets[config.id].other.city = config.city;
		client.widgets[config.id].other.country = config.country;
		client.widgets[config.id].other.countryCode = widgets.getCountryCode(config.city, config.country);
		client.widgets[config.id].interval = config.interval;
		clearTimeout(client.widgets[config.id].timer);
		if (client.widgets[config.id].other.countryCode)
			widgets.update(client, client.widgets[config.id]);
		else
			console.log("weather update: missing country");
	});

	// RADIO BASICS CONFIGURATIONS

	client.on('addRadioWidget', function(config) {
		const widgetConfig = {
			id: client.nbApps.toString(),
			type: "radio",
			sizeX: '4',
			sizeY: '1',
			other: {
				name: config.name
			}
		};

		if (widgetConfig.other.name) {
			client.nbApps += 1;
			widgets.radio(client, widgetConfig);
			console.log(` + User ${client.username} add widget ${widgetConfig.id}`);
		} else
			console.log("radio add: missing radio name");
	});

	client.on('updateRadioWidget', function(config) {
		var widgetConfig = client.widgets[config.id];
		widgetConfig.other.name = config.name;
		if (widgetConfig.other.name)
			widgets.update(client, widgetConfig);
		else
			console.log("radio update: missing radio name");
	});

	// IMDB WIDGET

	client.on('addImdbWidget', function(config) {
		const widgetConfig = {
			id: client.nbApps.toString(),
			type: "imdb",
			sizeX: '3',
			sizeY: '4',
			interval: config.interval,
			other: {
				lang: config.lang
			}
		};

		if (widgetConfig.other.lang) {
			client.nbApps += 1;
			widgets.imdb(client, widgetConfig);
			console.log(` + User ${client.username} add widget ${widgetConfig.id}`);
		} else
			console.log("IMDb add: missing language");
	});

	client.on('updateImdbWidget', function(config) {
		client.widgets[config.id].other.lang = config.lang;
		client.widgets[config.id].interval = config.interval;
		clearTimeout(client.widgets[config.id].timer);
		if (client.widgets[config.id].other.lang)
			widgets.update(client, client.widgets[config.id]);
		else
			console.log("IMDb add: missing language");
	});

	// PHOTOS WIDGET

	client.on('addPhotoWidget', function(config) {
		const widgetConfig = {
			id: client.nbApps.toString(),
			type: "photo",
			sizeX: '3',
			sizeY: '2',
			interval: config.interval,
		};

		client.nbApps += 1;
		widgets.photos(client, widgetConfig);
		console.log(` + User ${client.username} add widget ${widgetConfig.id}`);
	});

	client.on('updatePhotoWidget', function(config) {
		client.widgets[config.id].interval = config.interval;
		client.widgets[config.id].sizeX = config.sizeX;
		client.widgets[config.id].sizeY = config.sizeY;
		clearTimeout(client.widgets[config.id].timer);
		widgets.update(client, client.widgets[config.id]);
	});

	client.on('addClockWidget', config => {
		const widgetConfig = {
			name: config.name,
			id: client.nbApps.toString(),
			type: 'clock',
			sizeX: '1',
			sizeY: '2',
		}
		if (widgetConfig.name) {
			client.nbApps += 1;
			widgets.clock(client, widgetConfig);
			console.log(` + User ${client.username} add widget ${widgetConfig.id}`);
		} else
			console.log("radio add: missing radio name");
	});

	client.on('updateClockWidget', config => {
		client.widgets[config.id].name = config.name;
		clearTimeout(client.widgets[config.id].timer);
		if (client.widgets[config.id].name)
			widgets.update(client, client.widgets[config.id]);
		else
			console.log("IMDb add: missing language");
	});

});

// Export functions and objects
module.exports = {
	server
};
