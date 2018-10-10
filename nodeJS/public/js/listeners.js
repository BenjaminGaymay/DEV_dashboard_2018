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
        $(this).next('form').toggle();
    });

    $('#weatherSettings_' + id).submit(function(e) {
        e.preventDefault();
        const city = $(this).children('input').val();
        const id = $(this).parent().attr('id');
        socket.emit('changeWeatherCity', {
            city: city.split(', ')[0],
			country: city.split(', ')[1],
            id: id
        });
    });
};
