(function() {
	const socket = io.connect(window.location.host);

	socket.on('connect', function() {
		socket.emit('join');
	});

	socket.on('redirect', function(newURL) {
		window.location.pathname = newURL;
	});

	$("#add-weather").submit(function(e) {
		e.preventDefault();
		const city = $('#input-weather-city').val();
		socket.emit('addWeatherWidget', {
			city: city.split(', ')[0],
			country: city.split(', ')[1],
			interval: $('#input-weather-interval').val(),
			lang: 'fr'
		});
	});

	$("#btn-update").click(function() {
		socket.emit('updateAll');
	});

	socket.on('addWidget', function(widget) {
		gridster.add_widget('<li id="' + widget.id + '" style="' + widget.style + '">' + widget.content + '</li>', widget.sizeX, widget.sizeY);
		if (widget.posY && widget.posX)
			$(`#${widget.id}`).attr("data-row", widget.posY).attr("data-col", widget.posX);

		serializeGridster(socket);
		addListeners(socket, widget.id);
	});

	socket.on('removeWidget', function(widgetID) {
		gridster.remove_widget(`#${widgetID}`);
	});

	socket.on('updateWidget', function(widget) {
		if (!$(`#weatherSettings_${widget.id}`).is(':visible')) {
			$(`#${widget.id}`).html(widget.content);
			$(`#${widget.id}`).append("<span class='gs-resize-handle gs-resize-handle-both'></span>");
			addListeners(socket, widget.id);
		};
	});

}());
