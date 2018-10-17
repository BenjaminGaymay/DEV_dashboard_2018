(function() {
	const socket = io.connect(window.location.host);


	// GENERICS FUNCTIONS

	socket.on('connect', function() {
		socket.emit('join', {username: getCookie('username')});
	});

	$("#btn-update").click(function() {
		socket.emit('updateAll');
	});

    $('#btn-serialize').click(function() {
        serializeGridster(socket);
	});

	$('#btn-logout').click(function() {
		serializeGridster(socket);
	});

	socket.on('addWidget', function(widget) {
		gridster.add_widget('<li id="' + widget.id + '">' + widget.content + '</li>', widget.sizeX, widget.sizeY);
		if (widget.posY && widget.posX)
			$(`#${widget.id}`).attr("data-row", widget.posY).attr("data-col", widget.posX);

		addListeners(socket, widget.id, widget.type);
		serializeGridster(socket);
	});

	socket.on('removeWidget', function(widgetID) {
		gridster.remove_widget(`#${widgetID}`);
	});

	socket.on('updateWidget', function(widget) {
		if (!$(`#widgetSettings_${widget.id}`).is(':visible')) {
			$(`#${widget.id}`).html(widget.content);
			// $(`#${widget.id}`).append("<span class='gs-resize-handle gs-resize-handle-both'></span>");
			addListeners(socket, widget.id, widget.type);
		};
	});


	// WIDGETS ADDERS

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

	$("#add-radio").submit(function(e) {
		e.preventDefault();
		const name = $('#input-radio-name').val();
		socket.emit('addRadioWidget', {
			name: name
		});
	});

	$('#add-clock').submit(function(e) {
		e.preventDefault();
		const name = $('#input-clock-name').val();
		socket.emit('addClockWidget', {
			name
		});
	});
}());
