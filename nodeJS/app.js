// Server creation

function makeServer(port) {
	const express = require('express');
	const app = express();
	const server = require('http').Server(app);

	app.use(express.static(__dirname + '/public'));

	app.get('/', function (request, response) {
		response.sendFile(__dirname + '/public/html/index.html');
	});

	app.get('/about.json', function (request, response) {
		const fs = require('fs');
		const about = JSON.parse(fs.readFileSync('about.json', 'utf8'));

		about.client.host = request.ip.split(':').pop();
		about.server.current_time = getUnixTime();
		response.send(about);
	});

	return server.listen(port, () => {
		console.log(`Server launched on ${server.address().address}${server.address().port}`);
	});
};


// Timer functions

function getUnixTime() {
	return Date.now() / 1000 | 0;
};


// Start server

const server = makeServer(3000);
var io = require('socket.io')(server);

io.on('connection', function(client) {
	client.on('join', function() {
	});
});

// Export functions and objects

module.exports = {
	server
};
