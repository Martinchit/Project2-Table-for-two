const passport = require('passport');
const axios = require('axios');
const Model = require('./models');
const redis = require('redis');
const yelp = require('yelp-fusion');
var haversine = require('haversine-distance');
require('dotenv').config();

var profile;


var client = redis.createClient({
    host: 'localhost',
    port: 6379
});

module.exports = (express, app, io) => {

    app.io = io;

    const router = express.Router();

    function isLoggedIn(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }
        res.redirect('/error');
    }

    router.get('/', (req,res) => {
        res.render('home');
    });

    router.get('/error', (req,res) => {
        res.render('errorPage', {layout : 'error'});
    });

    router.get('/profile', isLoggedIn, (req,res) => {
        profile = req.user;
        req.user.layout = 'profile';
        res.render('userProfile', req.user);
    });

    router.get('/map', isLoggedIn, (req,res) => {
        res.render('map', {layout : 'google'});
    });

    router.post('/onlineuser', (req, res) => {
        var ownGeo = {lat : Number(req.body.lat), lng : Number(req.body.lng)};
        var ref = [];
        client.hgetall('onlineList', (err,data) => {
            for(var i in data) {
                    var distance = haversine(ownGeo, JSON.parse(data[i]).geo);
                    if(distance < req.body.perference) {
                        var obj = JSON.parse(data[i]);
                        obj.distance = String((distance / 1000).toFixed(2)) + ' km';
                        ref.push(obj);
                    }
                }
            res.send(ref);
        });
    });

    router.get('/chat', (req,res) => {
        res.render('chat', {layout : 'chatbox'});
    });

    router.post('/search', (req, res) => {
        if(req.body.location !== undefined) {
            var perference = req.body.location + ',hongkong';
            var clientId = process.env.yelp_clientId;
            var clientSecret = process.env.yelp_clientSecret;
            const searchRequest = {
                location : perference,
                limit : 15
            };
            yelp.accessToken(clientId, clientSecret).then(response => {
                const client = yelp.client(response.jsonBody.access_token);
                client.search(searchRequest).then(response => {
                    res.send(response.jsonBody.businesses);
                });
            }).catch(err => {
                console.log(err);
            });
        }
        
    });

    router.get('/direction', (req,res) => {
        var ref = req.query;
        client.hgetall('onlineList', (err,data) => {
            console.log(data);
            var info = JSON.parse(data[req.user.email]);
            console.log(info);
            ref.ownLat = info.geo.lat;
            ref.ownLng = info.geo.lng;
            res.redirect("https://www.google.com.hk/maps/dir/" + ref.ownLat + "," + ref.ownLng + "/" + ref.lat + "," + ref.lng);
        });
    });

    router.get('/logout', (req,res) => {
        client.hgetall('onlineList', (err, list) => {
            if(list[req.user.email] !== undefined) {
                var obj = list;
                delete obj[req.user.email];
                if(Object.keys(obj).length === 0) {
                    client.del('onlineList');
                } else {
                    client.del('onlineList');
                    client.hmset('onlineList', obj);
                }
                req.logout();
            }
            io.emit('marker', req.user.email);
        });
        res.render('logout', {layout : 'logoutPage'});
    });

    router.get('/auth/facebook', passport.authenticate('facebook', {scope : ['user_photos', 'user_friends', 'user_birthday', 'user_hometown', 'email']}));

    router.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/error'
    }));

    io.on('connection', function(socket) {
        socket.on('socketId', () => {
            Model.user.update({socket_id : socket.id }, {where : {email : socket.request.session.passport.user.email}});
        });
        socket.on('user', (err, data) => {
            client.hgetall('user', (err,data) => {
                if(data === null) {
                    var obj = {};
                    obj[socket.request.session.passport.user.email] = JSON.stringify(socket.request.session.passport);
                    client.hmset('user', obj);
                } else {
                    var obj = {};
                    obj[socket.request.session.cookie] = socket.request.session.passport;
                    var newObj = data;
                    newObj[socket.request.session.passport.user.email] = JSON.stringify(obj[socket.request.session.cookie]);
                    client.hmset('user', newObj);
                }
            });
        });
        socket.on('geo', (geo) => {
            client.hgetall('onlineList', (err, data) => {
                socket.request.session.passport.geo = geo;
                if(data === null) {
                    var obj = {};
                    obj[socket.request.session.passport.user.email] = socket.request.session.passport;
                    obj[socket.request.session.passport.user.email].geo = geo;
                    obj[socket.request.session.passport.user.email] = JSON.stringify(obj[socket.request.session.passport.user.email]);
                    client.hmset('onlineList', obj);
                    io.emit('marker', obj);
                } else {
                    var obj = {};
                    obj[socket.request.session.cookie] = socket.request.session.passport;
                    obj[socket.request.session.cookie].geo = geo;
                    var newObj = data;
                    console.log(newObj);
                    newObj[socket.request.session.passport.user.email] = JSON.stringify(obj[socket.request.session.cookie]);
                    client.del('onlineList');
                    client.hmset('onlineList', newObj);
                    io.emit('marker', newObj);
                }
            });
        });
        socket.on('matchClicked', (data) => {
            Model.user.findOne({where : {email : data}}).then((info) => {
                const uuid = require('uuid/v4');
                var obj = socket.request.session.passport;
                obj.uuid = uuid();
                io.to(info.dataValues.socket_id).emit('talkInvitation', obj);
            });
        });
        socket.on('talk', (data) => {
            Model.user.findOne({where : {email : data.id}}).then((user)=> {
                io.to(user.dataValues.socket_id).emit('talkAccepted', data.link);
            });
        });
        socket.on('id', (id) => {
            socket.on(id, (msg) => {
                var obj = socket.request.session.passport.user;
                obj.msg = msg;
                io.emit(id, obj);
            });
        });
        socket.on('disconnect', () => {
            client.hgetall('onlineList', (err, list) => {
                var obj = list;
                delete obj[socket.request.session.passport.user.email];
                if(Object.keys(obj).length === 0) {
                    client.del('onlineList');
                } else {
                    client.del('onlineList');
                    client.hmset('onlineList', obj);
                }
            });
            io.emit('delMarker', socket.request.session.passport.user.email);
        });
        socket.on('personal', (data)=> {
            var obj = socket.request.session.passport.user;
            socket.emit('personal', obj);
        });
        socket.on('update', (data) => {
            io.emit(data.id, data);
        });
        
    });

    return router;
};
