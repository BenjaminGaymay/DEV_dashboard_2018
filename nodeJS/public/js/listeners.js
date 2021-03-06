function serializeGridster(socket) {
    var widgets = [];

    for (const node of $("#widgetsArray > ul").children('li')) {
        widgets.push({
            id: $(node).attr("id"),
            posX: $(node).attr("data-col"),
            posY: $(node).attr("data-row"),
            sizeX: $(node).attr("data-sizex"),
            sizeY: $(node).attr("data-sizey")
        });
    };
    socket.emit("serialize", widgets);
};

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
};

function addListeners(socket, id, type) {
    $('#setting_' + id).click(function() {
        $(`#widgetSettings_${id}`).toggle();
        $(`#widget_${id}`).toggle();
        if ($(`#resize_${id}`))
            $(`#resize_${id}`).toggle();
    });

    $(`#delete_${id}`).click(function() {
        socket.emit('removeWidgetByID', id);
    });

    switch (type) {
        case "weather":
            $(`#widgetSettings_${id}`).submit(function(e) {
                e.preventDefault();
                const id = $(this).parent().attr('id');
                const city = $(`#input-update-city_${id}`).val();
                const interval = $(`#input-update-interval_${id}`).val();
                socket.emit('updateWeather', {
                    city: city.split(', ')[0],
                    country: city.split(', ')[1],
                    interval: interval,
                    id: id
                });
                $(this).toggle();
            });
            break;
        case "radio":
            $(`#widgetSettings_${id}`).submit(function(e) {
                e.preventDefault();
                const name = $(`#input-update-radio_${id}`).val();
                socket.emit('updateRadioWidget', {
                    name: name,
                    id: id
                });
                $(this).toggle();
            });
            break;
        case "clock":
            $(`#widgetSettings_${id}`).submit(function(e) {
                e.preventDefault();
                const name = $(`#input-update-clock_${id}`).val();
                socket.emit('updateClockWidget', {
                    name,
                    id,
                });
                $(this).toggle();
            });
            break;
        case "imdb":
            $(`#widgetSettings_${id}`).submit(function(e) {
                e.preventDefault();
                const lang = $(`#input-update-lang_${id}`).val();
                socket.emit('updateImdbWidget', {
                    lang: lang,
                    id: id
                });
                $(this).toggle();
            });

            $('.modal-dialog').parent().on('show.bs.modal', function(e) {
                $(e.relatedTarget.attributes['data-target'].value).appendTo('body');
            });
            break;
        case "photo":
            $(`#widgetSettings_${id}`).submit(function(e) {
                e.preventDefault();
                const id = $(this).parent().attr('id');
                const interval = $(`#input-update-interval_${id}`).val();
                socket.emit('updatePhotoWidget', {
                    interval: interval,
                    id: id,
                    sizeX: $(`#${id}`).attr("data-sizex"),
                    sizeY: $(`#${id}`).attr("data-sizey")
                });
                $(this).toggle();
                $(`#resize_${id}`).toggle();
            });
            break;
        case 'trade':
            $(`#widgetSettings_${id}`).submit(function(e) {
                e.preventDefault();
                const name = $(`#trade-name_${id}`).val();
                socket.emit('updateTradeWidget', {
                    name,
                    id,
                });
                $(this).toggle();
            });
            break;
        }
};


// updateTime();