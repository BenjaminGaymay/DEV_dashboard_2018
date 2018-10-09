(function() {
	const socket = io.connect(window.location.host);

	socket.on('connect', function() {
		socket.emit('join');
	});

	socket.on('redirect', function(newURL) {
		window.location.pathname = newURL;
	});

	$("#btn-widget").click(function() {
		socket.emit('add');
	});

	socket.on('addWidget', function(widget) {
		gridster.add_widget.apply(gridster, ['<li style="' + widget.style + '">' + widget.content + '</li>', widget.sizeX, widget.sizeY]);
	});
}());