const request = require('request');
const fs = require('fs');
const ejs = require('ejs');
const moment = require('moment-timezone');

// Basics widgets functions

function update(client, widgetConfig) {
	switch (widgetConfig.type) {
		case "weather": weather(client, widgetConfig); break;
		case "radio": radio(client, widgetConfig); break;
		case "imdb": imdb(client, widgetConfig); break;
		case "photo": photos(client, widgetConfig); break;
		case "clock": clock(client, widgetConfig); break;
	};
};

function sendWidget(client, widgetConfig, widget) {
	if (client.widgets[widget.id]) {
			client.widgets[widget.id] = widgetConfig;
			client.emit('updateWidget', widget);
			if (client.widgets[widget.id] && client.widgets[widget.id].loop) {
				client.widgets[widget.id].timer = setTimeout(function() {
					update(client, widgetConfig);
					console.log(' * Widget update: '+ widgetConfig.id + " (every " +  widgetConfig.interval + "s)");
				}, widgetConfig.interval * 1000);
			};
	} else {
		client.widgets[widget.id] = widgetConfig;
		client.widgets[widget.id].loop = client.widgets[widget.id].interval ? true : false;
		if (client.widgets[widget.id].loop) {
			client.widgets[widget.id].timer = setTimeout(function() {
				update(client, widgetConfig);
				console.log(' * Widget update: '+ widgetConfig.id + " (every " +  widgetConfig.interval + "s)");
			}, widgetConfig.interval * 1000);
		}
		client.emit('addWidget', widget);
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
				description: weather.description
			}, 'cache', function(error, content) {
				const widget = {
					id: widgetConfig.id,
					type: widgetConfig.type,
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


// Radio

const radios = JSON.parse(fs.readFileSync(__dirname + "/radios.json", 'utf-8'));
var radioList = [];

for (const radioTmp of radios)
	radioList.push(radioTmp.name);

function getRadioUrl(name) {
	for (const tmp of radios) {
		if (tmp.name == name)
			return tmp.url;
	};
	return undefined
};

function radio(client, widgetConfig) {
	widgetConfig.other.url = getRadioUrl(widgetConfig.other.name);
	ejs.renderFile(__dirname + "/templates/radio.ejs", {
			id: widgetConfig.id,
			radioName: widgetConfig.other.name,
			radioURL: widgetConfig.other.url
		}, 'cache', function(error, content) {
			const widget = {
				id: widgetConfig.id,
				type: widgetConfig.type,
				content: content,
				sizeX: widgetConfig.sizeX,
				sizeY: widgetConfig.sizeY,
				posX: widgetConfig.posX ? widgetConfig.posX : undefined,
				posY: widgetConfig.posY ? widgetConfig.posY : undefined
			};

			sendWidget(client, widgetConfig, widget);
	});
};

// IMDb widget

function imdb(client, widgetConfig) {

	request('http://api.themoviedb.org/3/movie/upcoming?page=1&api_key=8e0abe397ffd3af9ac5d115c0f815c2c&language=' + widgetConfig.other.lang.substring(0, 2).toLowerCase(), function(err, resp, body) {
		const response = JSON.parse(body).results;
		var filmList = [];

		for (const film of response) {
			filmList.push({
				title: film.title,
				image: "http://image.tmdb.org/t/p/w200" + film.poster_path,
				description: film.overview,
				id: film.id
			});
		};

		ejs.renderFile(__dirname + "/templates/imdb.ejs", {
				id: widgetConfig.id,
				interval: widgetConfig.interval,
				lang: widgetConfig.other.lang,
				films: filmList
			}, 'cache', function(error, content) {
				const widget = {
					id: widgetConfig.id,
					type: widgetConfig.type,
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

// Photos widget

function photos(client, widgetConfig) {
	request("https://picsum.photos/" + widgetConfig.sizeX * 150 + "/" + widgetConfig.sizeY * 150 + "/?random", function(err, resp, body) {
		ejs.renderFile(__dirname + "/templates/photos.ejs", {
				id: widgetConfig.id,
				interval: widgetConfig.interval,
				image: resp.request.uri.href
			}, 'cache', function(error, content) {
				const widget = {
					id: widgetConfig.id,
					type: widgetConfig.type,
					content: content,
					resizable: true,
					sizeX: widgetConfig.sizeX,
					sizeY: widgetConfig.sizeY,
					posX: widgetConfig.posX ? widgetConfig.posX : undefined,
					posY: widgetConfig.posY ? widgetConfig.posY : undefined
				};

				sendWidget(client, widgetConfig, widget);
		});

	});
};


// Clock
const clockList = require('./cities.json');

function clock(client, widgetConfig) {
	const time = moment.tz(widgetConfig.name).format('hh:mm:ss a');

	ejs.renderFile(`${__dirname}/templates/clock.ejs`, {
		city: widgetConfig.name,
		time,
		id: widgetConfig.id
	}, 'cache', (err, content) => {
		if (err) console.log(err);
		const widget = {
			id: widgetConfig.id,
			type: widgetConfig.type,
			content,
			sizeX: widgetConfig.sizeX,
			sizeY: widgetConfig.sizeY,
			posX: widgetConfig.posX ? widgetConfig.posX : undefined,
			posY: widgetConfig.posY ? widgetConfig.posY : undefined,
		};
		sendWidget(client, widgetConfig, widget);
	});
}

module.exports = {
	update,
	weather,
	weatherCities,
	getCountryCode,
	radio,
	radioList,
	imdb,
	photos,
	clock,
	clockList
};