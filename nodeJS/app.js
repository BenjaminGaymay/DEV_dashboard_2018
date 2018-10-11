// Server creation

function makeServer(port) {
	const express = require('express');
	const session = require('express-session');
	const app = express();
	const server = require('http').Server(app);
	const ejsExpress = require('express-ejs-layouts');
	const bodyParser = require('body-parser');

	app.use(express.static(__dirname + '/public'));
	app.use(session({ secret: "Jean-Eude" }));
	app.use(ejsExpress);
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.set('layout', 'layout/layout');


	require('./routes')(app);

	return server.listen(port, () => {
		console.log(`Server launched on ${server.address().address}${server.address().port}`);
	});
};


// Start server
const server = makeServer(3000);
const io = require('socket.io')(server);

const widgets = require('./widgets/widgets');

io.on('connection', function(client) {
	client.on('join', function() {
		client.nbApps = 0;
		client.widgets = {};
		widgets.initializeTimer(client);
	});

	client.on('updateAll', function() {
		for (const widget of Object.values(client.widgets)) {
			widgets.update(client, widget);
		};
	});

	client.on('serialize', function(serialized) {
		console.log(JSON.parse(serialized));
	});

	// WIDGETS BASICS CONFIGURATIONS

	client.on('addWeatherWidget', function(config) {
		const widgetConfig = {
			id: client.nbApps.toString(),
			type: "weather",
			interval: config.interval,
			sizeX: '2',
			sizeY: '2',
			city: config.city,
			country: config.country,
			countryCode: widgets.getCountryCode(config.city, config.country),
			lang: config.lang,
			unit: 'M'
		};

		if (widgetConfig.country) {
			client.nbApps += 1;
			widgets.weather(client, widgetConfig);
		}
		// else YA UNE ERREUR
	});

	client.on('updateWeather', function(config) {
		client.widgets[config.id].city = config.city;
		client.widgets[config.id].country = config.country;
		client.widgets[config.id].countryCode = widgets.getCountryCode(config.city, config.country);
		client.widgets[config.id].interval = config.interval;
		widgets.resetTimer(client, client.widgets[config.id]);
		if (client.widgets[config.id].countryCode)
			widgets.update(client, client.widgets[config.id]);
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
