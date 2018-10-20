const sharedSession = require('express-socket.io-session');
const widgets = require('./widgets/widgets');
const UserSchema = require('./routes/models/user');

// Save widgets on database
function saveWidgetsOnDatabase(client) {
	UserSchema.findOne({"local.username": client.username}).then(function(person) {
		person.widgets = Object.assign({}, client.widgets);
		for (const widget of Object.values(client.widgets))
			person.widgets[widget.id].timer = undefined;
		person.markModified("widgets");
		return person.save();
	}).then(function() {
		console.log(" * Widgets successfully update on database");
	}).catch(function(err) {
		console.log(" /!\\ Widgets update on database failed !");
	});
};


module.exports = (server, session) => {
    const io = require('socket.io')(server);

    io.use(sharedSession(session, { autoSave: true }));

    io.on('connection', function (client) {
        console.log(client.handshake.session.username);
        // Initialize new user
        client.widgets = {};
        client.nbApps = 0;

        // GENERICS FUNCTIONS
        client.on('join', function() {
            UserSchema.findOne({ "local.username": client.handshake.session.username }).then(function(person) {
                client.username = client.handshake.session.username;
                client.widgets = {};
                console.log(person);
                if (person.widgets) {
                    for (const widget of Object.values(person.widgets))
                        widgets.update(client, widget);
                    client.nbApps = Object.keys(person.widgets).length;
                };
                console.log(`[+] New user connected via socket.io : ${client.username}`);
            }).catch(err => {
                console.log(err);
                console.log("socket.io: link with database failed")
                client.emit('reload');
            });
        });

        client.on('updateAll', function () {
            for (const widget of Object.values(client.widgets)) {
                widgets.update(client, widget);
            };
        });

        client.on('serialize', function (serialized) {
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

        client.on('removeWidgetByID', function (widgetID) {
            if (client.widgets[widgetID]) {
                clearTimeout(client.widgets[widgetID].timer);
                client.emit('removeWidget', widgetID);
                delete client.widgets[widgetID];
                console.log(` - User ${client.username} remove widget ${widgetID}`);
                saveWidgetsOnDatabase(client);
            };
        });

        client.on('disconnect', function () {
            if (client && client.widgets)
                for (var widget of Object.values(client.widgets)) {
                    clearTimeout(client.widgets[widget.id].timer);
                    client.widgets[widget.id].loop = false;
                };

            console.log(`[-] User ${client.username} disconnected from socket.io`);
        });

        // WIDGETS BASICS CONFIGURATIONS

        client.on('addWeatherWidget', function (config) {
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

        client.on('updateWeather', function (config) {
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

        client.on('addRadioWidget', function (config) {
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

        client.on('updateRadioWidget', function (config) {
            var widgetConfig = client.widgets[config.id];
            widgetConfig.other.name = config.name;
            if (widgetConfig.other.name)
                widgets.update(client, widgetConfig);
            else
                console.log("radio update: missing radio name");
        });

        // IMDB WIDGET

        client.on('addImdbWidget', function (config) {
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

        client.on('updateImdbWidget', function (config) {
            client.widgets[config.id].other.lang = config.lang;
            client.widgets[config.id].interval = config.interval;
            clearTimeout(client.widgets[config.id].timer);
            if (client.widgets[config.id].other.lang)
                widgets.update(client, client.widgets[config.id]);
            else
                console.log("IMDb add: missing language");
        });

        // PHOTOS WIDGET

        client.on('addPhotoWidget', function (config) {
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

        client.on('updatePhotoWidget', function (config) {
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

        client.on('addTradeWidget', config => {
            const configWidget = {
                name: config.name,
                id: client.nbApps.toString(),
                type: 'trade',
                sizeX: '1',
                sizeY: '1',
            };
            if (widgetConfig.name) {
                client.nbApps += 1;
                widgets.trade(client, widgetConfig);
            } else {
                console.log('trade err: missing name');
            }
        });

        client.on('updateTradeWidget', config => {
            client.widgets[config.id].name = config.name;
            clearTimeout(client.widgets[config.id].timer);
            if (client.widgets[config.id].name)
                widgets.update(client, client.widgets[config.id]);
            else
                console.log("IMDb add: missing language");
        })
    });
}