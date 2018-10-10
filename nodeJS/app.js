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
	});

	client.on('updateAll', function() {
		for (const widget of Object.entries(client.widgets)) {
			widgets.update(client, widget[0], widget[1]);
		};
	});

	client.on('serialize', function(serialized) {
		console.log(JSON.parse(serialized));
	});

	// WIDGETS BASICS CONFIGURATIONS

	client.on('addWeatherWidget', function(config) {
		const widgetConfig = {
			type: "weather",
			sizeX: '2',
			sizeY: '2',
			city: config.city,
			country: config.country,
			lang: config.lang,
			unit: 'M'
		};
		widgets.weather(client, widgetConfig);
	});

	client.on('changeWeatherCity', function(config) {
		client.widgets[config.id].city = config.city;
		client.widgets[config.id].country = config.country;
		widgets.update(client, config.id, client.widgets[config.id]);
	});
});

// Export functions and objects

module.exports = {
	server
};
