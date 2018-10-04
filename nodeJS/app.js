// Server creation

function makeServer(port) {
	const express = require('express');
	const app = express();

	app.use(express.static(__dirname + '/public'));
	app.get('/', function (request, response) {
		response.sendFile(__dirname + '/public/html/index.html');
	});

	app.get('/about.json', function (request, response) {
		const fs = require('fs');
		const about = JSON.parse(fs.readFileSync('about.json', 'utf8'));

		about.client.host = request.ip.split(':').pop();
		about.server.current_time = Date.now() / 1000 | 0;
		response.send(about);
	});

	return app.listen(port);
};

const server = makeServer(3000);


// Export functions and objects

module.exports = {
	server
};
