(function() {
	const socket = io.connect(window.location.host);


	// GENERICS FUNCTIONS

	socket.on('connect', function() {
		socket.emit('join');
	});

	socket.on('reload', function() {
		window.location.reload();
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
		gridster.add_widget('<li id="' + widget.id + '"></li>', widget.sizeX, widget.sizeY);
		if (widget.posY && widget.posX)
			$(`#${widget.id}`).attr("data-row", widget.posY).attr("data-col", widget.posX);
		$(`#${widget.id}`).html(widget.content);
		if (widget.resizable)
			$(`#${widget.id}`).append(`<span class='gs-resize-handle gs-resize-handle-both' id='resize_${widget.id}' style='display: none;'></span>`);

		addListeners(socket, widget.id, widget.type);
		serializeGridster(socket);
	});

	socket.on('removeWidget', function(widgetID) {
		gridster.remove_widget(`#${widgetID}`);
	});

	socket.on('updateWidget', function(widget) {
		if (!$(`#widgetSettings_${widget.id}`).is(':visible')) {
			$(`#${widget.id}`).html(widget.content);
			if (widget.resizable)
				$(`#${widget.id}`).append(`<span class='gs-resize-handle gs-resize-handle-both' id='resize_${widget.id}' style='display: none;'></span>`);
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

	$("#add-imdb").submit(function(e) {
		e.preventDefault();
		const lang = $('#input-lang').val();
		const interval = $('#input-imdb-interval').val();
		socket.emit('addImdbWidget', {
			lang: lang,
			interval: interval
		});
	});

	$("#add-photo").submit(function(e) {
		e.preventDefault();
		const interval = $('#input-photo-interval').val();
		socket.emit('addPhotoWidget', {
			interval: interval
		});
	});

	$('#add-clock').submit(function(e) {
		e.preventDefault();
		const name = $('#input-clock-name').val();
		socket.emit('addClockWidget', {
			name
		});
	});

	$('#add-trade').submit(function(e) {
		e.preventDefault();
		const name = $('#trade-name').val();
		socket.emit('addTradeWidget', {
			name
		});
	});


}());
