// Server creation

const express = require('express');
const app = express();

const server = require('http').Server(app);

app.use(express.static(__dirname + '/public'));
app.get('/', function (request, response) {
	response.sendFile(__dirname + '/public/html/index.html');
});

server.listen(3000);