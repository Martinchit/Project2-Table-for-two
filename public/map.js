var map, infoWindow, list = {};
var socket = io();
var pos;
var user;

function initMap() {
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            socket.on('marker', (data) => {
                for(let i in data) {
                    if(list[i] === undefined) {
                        let detail = JSON.parse(data[i]);
                        let marker = new google.maps.Marker({
                            position : detail.geo,
                            map : map
                        });
                        list[i] = marker;
                        let info = new google.maps.InfoWindow({
                            content : "<div class='marker'><img src=" + detail.user.photo + "><br><button class='key' value=" + detail.user.fbid + ">Match</button></div><br><h3>" + detail.user.name + "</h3>"
                        });
                        marker.addListener('click', () => {
                            info.open(map, marker);
                        });
                    }  
                }  
            });

            map = new google.maps.Map(document.getElementById('map'), {
                center: pos,
                zoom: 15
            });

            socket.emit('socketId');
            socket.emit('geo', pos); 
            
            socket.on('delMarker', (data) => {
                if(list[data] !== undefined) {
                    var marker = list[data];
                    delete list[data];
                    marker.setMap(null);
                }
            });
            
        }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
        }
    );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

$(document).ready(() => {
    var user;
    $('#list').on('click', '.button', (event) => {
        event.preventDefault();
        var distance = Number($(event.target).val().replace(/\D/g, '')) * 1000;
        var location = pos;
        $.post('https://128.199.210.113.nip.io/onlineuser', {
            lat : location.lat,
            lng : location.lng,
            perference : distance
        }).done((data) => {
            $('#users').children().remove();
            data.forEach(function(element) {
                $('#users').append("<div class='user'></div>");
                $('.user').last().append("<img src=" + element.user.photo + ">");
                $('.user').last().append("<p> Name : " + element.user.name + "</p>");
                $('.user').last().append("<p> Horoscope : " + getZodiacSign(element.user.birthday.slice(3,5), element.user.birthday.slice(0,2)) + "</p>");
                $('.user').last().append("<p>Distance : " + element.distance + "</p>");
            });
        });
    });
    $('#map').on('click', '.key', (event) => {
        event.preventDefault();
        socket.emit('matchClicked', $(event.target).val());
        $(event.target).replaceWith("<p class='newTag'>Wait for reply</p>");
    });
    socket.on('talkInvitation', (data) => {
        var url = 'https://128.199.210.113.nip.io/chat?' + data.uuid;
        $('#map').append("<div class='chatInvitation'></div>");
        $('.chatInvitation').append("<img class='photo' src=" + data.user.photo + ">");
        $('.chatInvitation').append("<p>" + data.user.firstName + " : <br>Do you wanna have dinner together tonight?</p>");
        $('.chatInvitation').append("<div class='choice' id=" + data.user.fbid + ">");
        $('.choice').append("<button target='_blank' id='yes' value=" + url + "><i class='fa fa-check fa-4x'  aria-hidden='true'></i></button>");
        $('.choice').append("<button id='no'><i class='fa fa-times fa-4x' aria-hidden='true'></i></button>");
    });
    $('body').on('click','#yes', (event) => {
        var url = $(event.target).closest('#yes').val();
        var fbid = $('.choice').attr('id');
        var obj = {link : url, id : fbid};
        
        console.log(obj);
        $(event.target).closest('.chatInvitation').remove();
        $('.newTag').replaceWith('<p>Matched</p>');
        socket.emit('talk', obj);
        window.open(url);
    });
    $('body').on('click','#no', (event) => {
        event.preventDefault();
        $(event.target).closest('.chatInvitation').remove();
        $('.newTag').replaceWith('<p>Fail</p>');
    });
});

socket.on('talkAccepted', (data) => {
    console.log(data);
    window.open(data);
});



function getZodiacSign(day, month) {
    
    var zodiacSigns = [
        'Capricorn',
        'Aquarius',
        'Pisces',
        'Aries',
        'Taurus',
        'Gemini',
        'Cancer',
        'Leo',
        'Virgo',
        'Libra',
        'Scorpio',
        'Sagittarius'
    ];
        
 
    
      if((month == 1 && day <= 20) || (month == 12 && day >=22)) {
        return zodiacSigns[0];
      } else if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) {
        return zodiacSigns[1];
      } else if((month == 2 && day >= 19) || (month == 3 && day <= 20)) {
        return zodiacSigns[2];
      } else if((month == 3 && day >= 21) || (month == 4 && day <= 20)) {
        return zodiacSigns[3];
      } else if((month == 4 && day >= 21) || (month == 5 && day <= 20)) {
        return zodiacSigns[4];
      } else if((month == 5 && day >= 21) || (month == 6 && day <= 20)) {
        return zodiacSigns[5];
      } else if((month == 6 && day >= 22) || (month == 7 && day <= 22)) {
        return zodiacSigns[6];
      } else if((month == 7 && day >= 23) || (month == 8 && day <= 23)) {
        return zodiacSigns[7];
      } else if((month == 8 && day >= 24) || (month == 9 && day <= 23)) {
        return zodiacSigns[8];
      } else if((month == 9 && day >= 24) || (month == 10 && day <= 23)) {
        return zodiacSigns[9];
      } else if((month == 10 && day >= 24) || (month == 11 && day <= 22)) {
        return zodiacSigns[10];
      } else if((month == 11 && day >= 23) || (month == 12 && day <= 21)) {
        return zodiacSigns[11];
      }
    }
