const passport = require('passport');
const axios = require('axios');
const Model = require('./sequelize');
const redis = require('redis');
var profile;

var client = redis.createClient({
    host: 'localhost',
    port: 6379
});

module.exports = (express, io) => {

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

    router.get('/logout', (req,res) => {
        req.logout();
        res.render('logout', {layout : 'error'});
    });

    router.get('/auth/facebook', passport.authenticate('facebook', {scope : ['user_photos', 'user_friends', 'user_birthday', 'user_hometown']}));

    router.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/error'
    }));

    io.on('connection', function(socket) {
        socket.on('geo', (geo) => {
            client.hgetall('list', (err, data) => {
                if(data === null) {
                    var obj = {};
                    profile.geo = geo
                    obj[profile.name] = profile;
                    client.hmset('list', obj);
                    io.on('maker', obj);
                } else {
                    var obj = data;
                    profile.geo = geo
                    obj[profile.name] = profile;
                    client.hmset('list', obj);
                    io.emit('marker', obj);
                }
            });
        });
        // socket.on('disconnect', () => {
        //     client.hgetall('list', (data) => {
        //         var obj = data;
        //         delete obj[profile.name];
        //         client.hmset('list', obj);
        //         io.emit('userLeave', profile.name);
        //     });
        // });
    });

    return router;
};

