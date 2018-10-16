const request = require('request');
const fs = require('fs');
const ejs = require('ejs');

// Timer

function resetTimer(client, widget) {
	clearInterval(widget.timer);
	timer(client, widget);
};

function timer(client, widget) {
	widget.timer = setInterval(function() {
		if (client.widgets[widget.id]) {
			update(client, widget);
			console.log(' * Widget update: '+ widget.id + " (every " +  widget.interval + "s)");
		} else
			clearInterval(this);
	}, widget.interval * 1000);
};

function initializeTimer(client) {
	for (const widget of Object.values(client.widgets)) {
		if (widget)
			timer(client, widget);
	};
};


// Basics widgets functions

function update(client, widgetConfig) {
	if (widgetConfig.type === "weather") {
		weather(client, widgetConfig);
	};
};

function sendWidget(client, widgetConfig, widget) {
	if (client.widgets[widget.id]) {
			client.widgets[widget.id] = widgetConfig;
			client.emit('updateWidget', widget);
	} else {
		client.widgets[widget.id] = widgetConfig;
		client.emit('addWidget', widget);
		timer(client, widgetConfig);
	};
};


// Weather widget

const cities = JSON.parse(fs.readFileSync(__dirname + "/cities_20000.json", 'utf-8'));
var weatherCities = [];

for (const citie of cities) {
	if (citie.city_name && citie.country_name)
		weatherCities.push(citie.city_name + ', ' + citie.country_name);
	else if (citie.city_name && citie.state_name)
		weatherCities.push(citie.city_name + ', ' + citie.state_name);
};

function getCountryCode(city, country) {
	for (const cityDatas of cities) {
		if ((cityDatas.city_name == city && cityDatas.country_name == country) || (cityDatas.city_name == city && cityDatas.state_name == country))
			return cityDatas.country_code;
	};
	return undefined
};

function weather(client, widgetConfig) {
	const city = widgetConfig.other.city;
	const countryCode = widgetConfig.other.countryCode;
	const lang = widgetConfig.other.lang;
	const unit = widgetConfig.other.unit;

	request('http://api.weatherbit.io/v2.0/current?key=9b3006fece9b40f58d233568c8728c6c&unit=' + unit + '&lang=' + lang + '&city=' + city + '&country=' + countryCode, function(err, resp, body) {
		const response = JSON.parse(body);

		if (response.status_code == "429") {
			sendWidget(client, widgetConfig, {
				id: widgetConfig.id,
				content: "API error",
				sizeX: widgetConfig.sizeX,
				sizeY: widgetConfig.sizeY,
				posX: widgetConfig.posX ? widgetConfig.posX : undefined,
				posY: widgetConfig.posY ? widgetConfig.posY : undefined
			});
			return;
		};

		const requestResult = response.data[0];
		const weather = requestResult.weather;

		ejs.renderFile(__dirname + "/templates/weather.ejs", {
				id: widgetConfig.id,
				city: city,
				cityCountry: city + ', ' + widgetConfig.other.country,
				interval: widgetConfig.interval,
				temp: requestResult.temp,
				unit: (unit == "M" ? "C" : "F"),
				icon: weather.icon,
				description: weather.description,
				citiesList: weatherCities
			}, 'cache', function(error, content) {
				const widget = {
					id: widgetConfig.id,
					content: content,
					sizeX: widgetConfig.sizeX,
					sizeY: widgetConfig.sizeY,
					posX: widgetConfig.posX ? widgetConfig.posX : undefined,
					posY: widgetConfig.posY ? widgetConfig.posY : undefined
				};

				sendWidget(client, widgetConfig, widget);
		});
	});
};


module.exports = {
	initializeTimer,
	resetTimer,
	update,
	weather,
	weatherCities,
	getCountryCode
};