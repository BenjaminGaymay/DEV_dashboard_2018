const request = require('request');

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

function weather(client) {
	const city = "Paris";
	const lang = "fr";
	const unit = "M";

	request('http://api.weatherbit.io/v2.0/current?key=9b3006fece9b40f58d233568c8728c6c&unit=' + unit + '&lang=' + lang + '&city=' + city, function(err, resp, body) {
		const requestResult = JSON.parse(body).data[0];
		const weather = requestResult.weather;

		const widget = {
			content: "<h1> Température à " + city + " : " + requestResult.temp + "°" + (unit == "M" ? "C" : "F") + "</h1><img src='https://www.weatherbit.io/static/img/icons/" + weather.icon + ".png' alt='" + weather.description + "'></img>",
			style: "color: #909090; border-color: #cccccc; font-size: 2rem; text-align: center",
			// faut faire le css pour une class weather directement dans le style.css -> on peut ajouter le responsive toussa toussa
			// le style ici ca va juste etre pour la personnalisation (couleurs par ex)
			sizeX: 2,
			sizeY: 2
		};
		client.emit('addWidget', widget);
	});
};

module.exports = {
	weather
};