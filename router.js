const passport = require('passport');
const axios = require('axios');
const Model = require('./models');
const redis = require('redis');
var haversine = require('haversine-distance');

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
                if(JSON.parse(data[i]).geo.lat !== ownGeo.lat && JSON.parse(data[i]).geo.lng !== ownGeo.lng) {
                    var distance = haversine(ownGeo, JSON.parse(data[i]).geo);
                    if(distance < req.body.perference) {
                        var obj = JSON.parse(data[i]);
                        obj.distance = String(distance * 1000) + ' km';
                        ref.push(obj);
                    }
                }
            }
            res.send(ref);
        });
    });

    router.get('/chat', (req,res) => {
        res.render('chat', {layout : 'chatbox'});
    });

    router.get('/logout', (req,res) => {
        req.logout();
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
                    obj[socket.request.session.cookie] = socket.request.session.passport;
                    client.hmset('user', JSON.stringify(socket.request.session.cookie), JSON.stringify(obj[socket.request.session.cookie]));
                } else {
                    var obj = {};
                    obj[socket.request.session.cookie] = socket.request.session.passport;
                    var newObj = data;
                    newObj[JSON.stringify(socket.request.session.cookie)] = JSON.stringify(obj[socket.request.session.cookie]);
                    client.hmset('user', newObj);
                }
            });
        });
        socket.on('geo', (geo) => {
            client.hgetall('onlineList', (data) => {
                if(data === null) {
                    var obj = {};
                    obj[socket.request.session.cookie] = socket.request.session.passport;
                    obj[socket.request.session.cookie].geo = geo;
                    client.hmset('onlineList', JSON.stringify(socket.request.session.cookie), JSON.stringify(obj[socket.request.session.cookie]));
                    io.emit('marker', obj);
                } else {
                    var obj = {};
                    obj[socket.request.session.cookie] = socket.request.session.passport;
                    obj[socket.request.session.cookie].geo = geo;
                    var newObj = data;
                    newObj[JSON.stringify(socket.request.session.cookie)] = JSON.stringify(obj[socket.request.session.cookie]);
                    client.hmset('onlineList', newObj);
                    io.emit('marker', obj);
                }
            });
            var obj = {};
           
            
        });
        socket.on('userLogout', (data) => {
            client.hgetall('onlineList', (err, list) => {
                var obj = list;
                delete obj[JSON.stringify(socket.request.session.cookie)];
                if(Object.keys(obj).length === 0) {
                    client.del('onlineList');
                } else {
                    client.hmset('onlineList', obj);
                }
            });
            io.emit('delMarker', socket.request.session);
        });
        socket.on('matchClicked', (data) => {
            Model.user.findOne({where : {email : data}}).then((data) => {
                const uuid = require('uuid/v4');
                var obj = socket.request.session.passport;
                obj.uuid = uuid();
                io.to(data.dataValues.socket_id).emit('talkInvitation', obj);
            });
        });
        
        socket.on('talk', (data) => {
            io.to(socket.id).emit('canTalk', data);
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
                delete obj[JSON.stringify(socket.request.session.cookie)];
                if(Object.keys(obj).length === 0) {
                    client.del('onlineList');
                } else {
                    client.hmset('onlineList', obj);
                }
            });
            io.emit('delMarker', socket.request.session);
        });
        
    });

    return router;
};
