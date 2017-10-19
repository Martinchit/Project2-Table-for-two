var socket = io();
var personalInfo;
var uuid;
$(document).ready(() => {
    var x = document.URL;
    uuid =  x.slice(27);
    socket.emit('id', uuid);
    socket.emit('personal', 'hi');
    socket.on('personal', (data) => {
        personalInfo = data;
    });
    $('form').submit(() => {
        socket.emit(uuid, $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on(uuid, (obj) => {
        if(obj.msg !== "") {
            $('#messages').append('<div>');
            $('#messages div').last().attr('class', 'msg');
            $('#messages div').last().append($('<img>').attr('src', obj.photo));
            $('#messages div').last().append($('<li>').text(obj.msg));
            var height = $('#messages').height();
            $('#chat').scrollTop(height);
        }
    });
    $('#check').on('click', (event) => {
        var perference = $('#location').val().replace(/\s/g, "");
        $('#location').val('');
        $.post('https://128.199.210.113.nip.io/search', {
            location : perference
        }).done((data) => {
            for(let i = 0; i < data.length; i++) {
                $('#restaurant').append("<div class='col-lg-2 col-sm-3 col-xs-6 itm'></div>");
                $('.itm').last().append("<img class='foto' src=" + data[i].image_url + ">");
                $('.itm').last().append("<br>");
                $('.itm').last().append("<a class='shop' target='_blank' href=" + data[i].url + ">" + data[i].name + "</a>");
                $('.itm').last().append("<br>");
                $('.itm').last().append("<button class='go' id =" + data[i].name +  " value=" + JSON.stringify(data[i].coordinates) + ">Lets Go</button>");
            }
        });
    });
    $('body').on('click', '.go', (event) => {
        var obj = {
            photo : personalInfo.photo,
            shopLocation : $(event.target).val(),
            shopName :  $(event.target).attr('id')
        };
        socket.emit('nextId', uuid+"1");
        socket.emit(uuid+"1", obj);
        socket.on(uuid+"11", (data) => {
            $('#messages').append('<div>');
            $('#messages div').last().attr('class', 'suggestion');
            $('#messages div').last().append('<img>');
            $('#messages div img').last().attr('src', data.photo);
            $('#messages div').last().append("<li><p> suggested to go " + "<a>" + data.shopName + "</a>" + "</p></li>");
            $('#messages div a').last().attr('href','https://128.199.210.113.nip.io/' + data.shopLocation);
        });
        return false;
    });
    
});