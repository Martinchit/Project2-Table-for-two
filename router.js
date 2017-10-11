const passport = require('passport');
const axios = require('axios');
const Model = require('./sequelize');
var profile;

module.exports = (express, io) => {

    const router = express.Router();

    function isLoggedIn(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }
        res.redirect('/error');
    }

    function isSigned(req, res, next) {
        if(req.isAuthenticated() === false) {
            return next();
        }
        res.redirect('/profile');
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

    router.get('geo', (req,res) => {
        socket.on('geo', (geo) => {
            client.get('list', (err,data) => {
                var list = JSON.parse(data);
                list.tommy = ;
            });
        })
        
    });

    router.get('/map', isLoggedIn, (req,res) => {
        res.render('map', {layout : 'google'});
        
    });

    router.get('/logout', (req,res) => {
        req.logout();
        res.render('logout', {layout : 'error'});
    });

    router.get('/auth/facebook', isSigned, passport.authenticate('facebook', {scope : ['user_photos', 'user_friends', 'user_birthday', 'user_hometown']}));

    router.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/error'
    }));

    io.on('connection', function(socket){
        console.log(socket.conn.id);
        socket.on('click', function(event){
          console.log('message: ' + event);
    
          io.emit('click', event);
        });
        socket.on('disconnect', () => console.log(socket.conn.id + 'left'));
    });

    return router;
};

