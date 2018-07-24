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
        callbackURL: "https://www.tablefortwo.website/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'name', 'gender', 'email', 'picture','profileUrl']
      },
    async (accessToken, refreshToken, profile, cb) => {
            const id = await bcrypt.hashPassword(profile.id);
            let user = await Model.user.findOne({where: {email: profile._json.email}})
            try {
                if(user === null) {
                    const newUser = await Model.user.create({
                        name : profile._json.name,
                        firstName : profile._json.first_name,
                        lastName: profile._json.last_name,
                        // gender : gender(profile._json.gender),
                        photo : profile._json.picture.data.url,
                        fbid : id, 
                        // birthday : profile._json.birthday,
                        email : profile._json.email
                    })
                    return cb(null, newUser.dataValues);  
                } else {
                    if(user.dataValues.photo !== profile._json.picture.data.url) {
                        await Model.user.update({photo: profile._json.picture.data.url}, {where: {email: profile._json.email}});
                        const updatedUser = await Model.user.findOne({where: {email: profile._json.email}});
                        return cb(null, updatedUser.dataValues);
                    }
                    return cb(null, user.dataValues)
                }
            } catch(err) {
                console.log(err)
            }
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