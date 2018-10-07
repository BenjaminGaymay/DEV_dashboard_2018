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

io.on('connection', function(client) {
	client.on('join', function() {
	});
});

// Export functions and objects

module.exports = {
	server
};
