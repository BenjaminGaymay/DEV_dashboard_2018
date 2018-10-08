const socket = io.connect(window.location.host);

(function() {

	socket.on('connect', function() {
		socket.emit('join');
	});

	socket.on('redirect', function(newURL) {
		window.location.pathname = newURL;
	});
}());