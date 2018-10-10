const request = require('request');
const fs = require('fs');
const ejs = require('ejs');

// LANGUAGES
// en - [DEFAULT] English
// ar - Arabic
// az - Azerbaijani
// be - Belarusian
// bg - Bulgarian
// bs - Bosnian
// ca - Catalan
// cz - Czech
// da - Danish
// de - German
// fi - Finnish
// fr - French
// el - Greek
// et - Estonian
// hr - Croation
// hu - Hungarian
// id - Indonesian
// it - Italian
// is - Icelandic
// kw - Cornish
// lt - Lithuanian
// nb - Norwegian Bokmål
// nl - Dutch
// pl - Polish
// pt - Portuguese
// ro - Romanian
// ru - Russian
// sk - Slovak
// sl - Slovenian
// sr - Serbian
// sv - Swedish
// tr - Turkish
// uk - Ukrainian
// zh - Chinese (Simplified)
// zh-tw - Chinese (Traditional)

// UNITS
// M - [DEFAULT] Metric (Celcius, m/s, mm)
// S - Scientific (Kelvin, m/s, mm)
// I - Fahrenheit (F, mph, in)

var id = 0;

const cities = JSON.parse(fs.readFileSync(__dirname + "/cities_20000.json", 'utf-8'));
var weatherCities = [];

for (const citie of cities) {
	if (citie.city_name && citie.country_name)
		weatherCities.push(citie.city_name + ', ' + citie.country_name);
};



function update(client, widgetID, widgetConfig) {
	if (widgetConfig.type === "weather") {
		weather(client, widgetConfig, widgetID);
	};
};

function sendWidget(client, widgetConfig, widget) {
	if (client.widgets[widget.id]) {
			client.widgets[widget.id] = widgetConfig;
			client.emit('updateWidget', widget);
	} else {
		client.widgets[widget.id] = widgetConfig;
		client.emit('addWidget', widget);
		id += 1;
	};
};

function weather(client, widgetConfig, widgetID = id.toString()) {
	const city = widgetConfig.city;
	const country = widgetConfig.country;
	const lang = widgetConfig.lang;
	const unit = widgetConfig.unit;

	request('http://api.weatherbit.io/v2.0/current?key=9b3006fece9b40f58d233568c8728c6c&unit=' + unit + '&lang=' + lang + '&city=' + city + '&country=' + country, function(err, resp, body) {
		const requestResult = JSON.parse(body).data[0];
		const weather = requestResult.weather;

		ejs.renderFile(__dirname + "/templates/weather.ejs", {
				id: widgetID,
				city: city,
				temp: requestResult.temp,
				unit: (unit == "M" ? "C" : "F"),
				icon: weather.icon,
				description: weather.description,
				citiesList: weatherCities
			}, 'cache', function(error, content) {
				const widget = {
					id: widgetID,
					content: content,
					style: "color: #909090; border-color: #cccccc; font-size: 2rem; text-align: center", // PERSONALISATION ? sinon on supprime
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
	weather,
	update,
	weatherCities
};