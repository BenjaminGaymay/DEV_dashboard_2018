// Server creation

const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('COUCOU');
});

function makeServer(port) {
	const express = require('express');
	const session = require('express-session');
	const app = express();
	const server = require('http').Server(app);
	const ejsExpress = require('express-ejs-layouts');
	const bodyParser = require('body-parser');

	app.use(express.static(__dirname + '/public'));
	app.use(session({ secret: "Jean-Eude" }));
	app.use(ejsExpress);
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.set('layout', 'layout/layout');


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
