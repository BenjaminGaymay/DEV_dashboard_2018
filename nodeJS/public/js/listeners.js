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
    socket.emit("serialize", JSON.stringify(widgets));
};

function addListeners(socket, id) {
    $('#setting_' + id).click(function() {
        $(`#weatherSettings_${id}`).toggle();
    });

    $(`#weatherSettings_${id}`).submit(function(e) {
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

    $(`#delete_${id}`).click(function() {
        socket.emit('removeWidgetByID', id);
    });
};
