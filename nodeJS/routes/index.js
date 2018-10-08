const path = require('path');
const views = path.resolve('./public/html');

// Path view file toussa lol
const _ = file => path.join(path.resolve('./public/html'), file);

// Timer functions
function getUnixTime() {
	return Date.now() / 1000 | 0;
};

console.log(views);

module.exports = app => {
    app.get('/', (req, res, next) => {
        res.sendFile(_('index.html'));
    });

    app.get('/login', (req, res, next) => {
        res.sendFile(_('login.html'));
    });

    app.get('/about.json', (req, res, next) => {
		const fs = require('fs');
		const about = JSON.parse(fs.readFileSync('about.json', 'utf8'));

		about.client.host = req.ip.split(':').pop();
		about.server.current_time = getUnixTime();
		res.send(about);
	});

	app.get('/connection', function (req, res) {
		res.sendFile(_('connection.html'));
	});

	app.get('/widgets', function (req, res) {
		res.sendFile(_('homePage.html'));
	});
};