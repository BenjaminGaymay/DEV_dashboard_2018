const path = require('path');
const widgets = require('../widgets/widgets');

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
		if (req.session.authentificated) {
			res.render('index');
		} else {
			res.redirect('/login');
		};
    });

    app.get('/login', (req, res, next) => {
		if (req.session.authentificated) {
			res.redirect('widgets');
		} else {
			res.render('login');
		};
	});

	app.post('/login', (req, res) => {
		// console.log(req.body.email, req.body.password);
		if (req.body.email == "a@a.com") {
			req.session.authentificated = true;
			res.redirect("/widgets");
		} else {
			res.redirect("/login");
		};
	});

	app.post('/logout', (req,res) => {
		req.session.authentificated = false;
		res.redirect('/login');
	});

    app.get('/about.json', (req, res, next) => {
		const fs = require('fs');
		const about = JSON.parse(fs.readFileSync('about.json', 'utf8'));

		about.client.host = req.ip.split(':').pop();
		about.server.current_time = getUnixTime();
		res.send(about);
	});

	app.get('/widgets', (req, res) => {
		if (req.session.authentificated) {
			res.render('widgets', {
				citiesList: widgets.weatherCities
			});
		} else {
			res.redirect('/login');
		};
	});
};