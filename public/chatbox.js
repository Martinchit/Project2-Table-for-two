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
        console.log(personalInfo)
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
            $('#restaurant').children().remove();
            for(let i = 0; i < data.length; i++) {
                $('#restaurant').append("<div class='col-lg-2 col-sm-3 col-xs-12 itm'></div>");
                $('.itm').last().append("<img class='foto' src=" + data[i].image_url + ">");
                $('.itm').last().append("<br>");
                $('.itm').last().append("<a class='shop' target='_blank' href=" + data[i].url + ">" + data[i].name + "</a>");
                $('.itm').last().append("<br>");
                $('.itm').last().append("<button class='go' value=" + JSON.stringify(data[i].coordinates) + ">Lets Go</button>");
                $('.itm button').last().attr('id', data[i].name);
            }
        });
    });
    $('body').on('click', '.go', (event) => {
        console.log('hi');
        var obj = {
            photo : personalInfo.photo,
            shopLocation : $(event.target).val(),
            shopName :  $(event.target).attr('id'),
            id : uuid+"1"
        };
        socket.emit('update', obj);
        return false;
    });
    socket.on(uuid+"1", (data) => {
        var ref = data.shopLocation.match(/\d+\.\d+/g);
        var query = "lat=" + ref[0] + "&lng=" + ref[1];
        $('#messages').append('<div>'); 
        $('#messages div').last().attr('class', 'suggestion');
        $('#messages div').last().append('<img>');
        $('#messages div img').last().attr('src', data.photo);
        $('#messages div').last().append("<li><p> Lets go " + "<a>" + data.shopName + "</a>" + "</p></li>");
        $('#messages div a').last().attr('href','https://128.199.210.113.nip.io/direction?' + query);
        $('#messages div a').last().attr('target','_blank');
        var height = $('#messages').height();
        $('#chat').scrollTop(height);
    });
});