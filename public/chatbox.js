var socket = io();
$(document).ready(() => {
    var personalInfo;
    var x = document.URL;
    var uuid =  x.slice(27);
    socket.emit('id', uuid);
    $('form').submit(() => {
        socket.emit(uuid, $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on(uuid, (obj) => {
        if(obj.msg !== "") {
            personalInfo = obj;
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
                $('#restaurant').append("<div class='col-lg-6 col-sm-3 col-xs-6 itm'></div>");
                $('.itm').last().append("<img class='foto' src=" + data[i].image_url + ">");
                $('.itm').last().append("<br>");
                $('.itm').last().append("<a target='_blank' href=" + data[i].url + ">" + data[i].name + "</a>");
                $('.itm').last().append("<br>");
                $('.itm').last().append("<button id='go' value=" + JSON.stringify(data[i].coordinates) + ">Lets Go</button>");
            }
        });
    });
    // socket.emit('getSth', 'hi');
    // socket.on('getSth', (geo) => {
    //     $('body').on('click', '#go', (event) => {
            
    //     });
    // });
    $('body').on('click', '#go', (event) => {
        var obj = {
            sender : personalInfo.name,
            shopLocation : $(event.target).val()
        };
        
    });
    
});