var socket = io();
var personalInfo;
$(document).ready(() => {
    var x = document.URL;
    var uuid =  x.slice(27);
    socket.emit('id', uuid);
    $('form').submit(() => {
        socket.emit(uuid, $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on(uuid, (obj) => {
        personalInfo = obj;
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
        console.log('hi')
        var perference = $('#location').val().replace(/\s/g, "");
        console.log(perference);
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
    // socket.emit('getSth', 'hi');
    // socket.on('getSth', (geo) => {
    //     $('body').on('click', '#go', (event) => {
            
    //     });
    // });
    $('body').on('click', '#go', (event) => {
        console.log($(event.target).attr('id'))
        var obj = {
            sender : personalInfo.photo,
            shopLocation : $(event.target).val(),
            shopName :  $(event.target).attr('id')
        };
        socket.emit('suggest', obj);
        return false;
    });
    socket.on('back', (data) => {
        $('#messages').append('<div>');
        $('#messages div').last().attr('class', 'suggestion');
        $('#messages div').last().append('<img>').attr('src', data.sender);
        $('#messages div').last().append("<li><p> suggested to go " + "<a>" + data.shopName + "</a>" + "</p></li>");
        // $('#messages div').last().append("<a>" + data.shopName + "</a>");
        $('#messages div a').last().attr('href','https://128.199.210.113.nip.io/' + data.shopLocation);
    });
});