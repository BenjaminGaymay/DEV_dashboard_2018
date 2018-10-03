// Server creation

function makeServer(port) {
	const express = require('express');
	const app = express();

	app.use(express.static(__dirname + '/public'));
	app.get('/', function (request, response) {
		response.sendFile(__dirname + '/public/html/index.html');
	});

	return app.listen(port);
};

const server = makeServer(3000);


// Export functions and objects

module.exports = {
	server
};
