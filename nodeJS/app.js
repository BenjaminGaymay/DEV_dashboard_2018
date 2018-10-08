// Server creation


function makeServer(port) {
	const express = require('express');
	const app = express();
	const server = require('http').Server(app);
	const viewDir = `${__dirname}/public/html`;

	app.use(express.static(__dirname + '/public'));

	require('./routes')(app);

	return server.listen(port, () => {
		console.log(`Server launched on ${server.address().address}${server.address().port}`);
	});
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
