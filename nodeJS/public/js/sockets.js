(function() {
	var socket = io.connect(document.URL);

	socket.on('connect', function() {
		socket.emit('join');
	});
}());