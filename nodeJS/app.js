// Server creation

var express = require('express');
var app = express();

var server = require('http').Server(app);

app.use(express.static(__dirname + '/public'));
app.get('/', function (request, response) {
	response.sendFile(__dirname + '/public/html/index.html');
});

server.listen(3000);