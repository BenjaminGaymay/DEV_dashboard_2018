const path = require('path');

// Path view file toussa lol
const _ = file => path.join(path.resolve('./public/html'), file);

// Timer functions
function getUnixTime() {
	return Date.now() / 1000 | 0;
};

module.exports = app => {

    app.set('view engine', 'ejs');
	app.set('views', path.join(path.resolve('./views')));

    app.get('/', (req, res, next) => {
        res.render('index');
    });

    app.get('/login', (req, res, next) => {
        res.render('login');
	});

	app.post('/login', (req, res) => {
		// ZERT
	});

    app.get('/about.json', (req, res, next) => {
		const fs = require('fs');
		const about = JSON.parse(fs.readFileSync('about.json', 'utf8'));

		about.client.host = req.ip.split(':').pop();
		about.server.current_time = getUnixTime();
		res.send(about);
	});

	app.get('/widgets', function (req, res) {
		res.render('widgets');
	});
};