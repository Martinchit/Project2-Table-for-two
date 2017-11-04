const Passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const Model = require('./models');
const bcrypt = require('./bcrypt');
require('dotenv').config();

module.exports = (app) => {

    app.use(Passport.initialize());
    app.use(Passport.session());

    Passport.use('facebook', new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "https://128.199.210.113.nip.io/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'name', 'gender', 'email', 'picture', 'birthday','profileUrl']
      },
      function(accessToken, refreshToken, profile, cb) {
          console.log(profile)
          bcrypt.hashPassword(profile.id).then((id) => {
              Model.user.findOrCreate({where : {
                    profileURL : profile._json.link
                }, defaults : {
                    name : profile._json.name,
                    firstName : profile._json.first_name,
                    lastName: profile._json.last_name,
                    gender : gender(profile._json.gender),
                    photo : profile._json.picture.data.url,
                    fbid : id,
                    birthday : profile._json.birthday,
                    // hometown : profile._json.hometown.name,
                    email : profile._json.email
                }}).spread((user, created) => {
                    return cb(null, user);
                }).catch((err) => {console.log(err)});
      }).catch((err) => {console.log(err)});
    }));
    
    Passport.serializeUser(function(user, done) {
        done(null, user);
      });
      
    Passport.deserializeUser(function(user, done) {
        done(null, user);
    });
};

function gender(input) {
    if(input === 'male') {
        return 'Gentlemen';
    } else {
        return 'Lady';
    }
}