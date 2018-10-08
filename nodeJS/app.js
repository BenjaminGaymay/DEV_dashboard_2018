// Server creation

function makeServer(port) {
	const express = require('express');
	const app = express();
	const server = require('http').Server(app);

	app.use(express.static(__dirname + '/public'));

	app.get('/', function (request, response) {
		response.sendFile(__dirname + '/public/html/index.html');
	});

	app.get('/connection', function (request, response) {
		response.sendFile(__dirname + '/public/html/connection.html');
	});

	app.get('/widgets', function (request, response) {
		response.sendFile(__dirname + '/public/html/homePage.html');
	});

	app.get('/about.json', function (request, response) {
		const fs = require('fs');
		const about = JSON.parse(fs.readFileSync('about.json', 'utf8'));

		about.client.host = request.ip.split(':').pop();
		about.server.current_time = getUnixTime();
		response.send(about);
	});

	return server.listen(port);
};


// Timer functions

function getUnixTime() {
	return Date.now() / 1000 | 0;
};


// Start server

const server = makeServer(3000);
const io = require('socket.io')(server);

// const clients = []

// class clientInfos {
// 	constructor(email) {
// 		this.email = email;
// 	};
// };

io.on('connection', function(client) {
	client.on('join', function() {
	});

	client.on('logIn', function(datas) {
		console.log("Client", datas.user.email, "logged in");
		// client.push(new clientInfos(datas.user.email));
		client.email = datas.user.email;
		if (datas.URL == "/connection") {
			client.emit('redirect', "/widgets");
		};
	});

	client.on('notConnected', function(datas) {
		console.log("Client not connected");
		if (datas.URL != "/connection") {
			client.emit('redirect', "/connection");
		};
	});
});

// Export functions and objects

module.exports = {
	server
};
