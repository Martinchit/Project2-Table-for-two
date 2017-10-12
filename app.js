const express = require('express');
const app = express();
const hb = require('express-handlebars');
const axios = require('axios');
const bodyParser = require('body-parser');
const sequelize = require('sequelize');
const passport = require('passport');
const session = require('express-session');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const router = require('./router')(express, io);
const RedisStore = require("connect-redis")(session);
const setupPassport = require('./passport');

var sessionMiddleware = session({
    store: new RedisStore({
        host: 'localhost',
        port: 6379
    }), // XXX redis server config
    secret: "keyboard cat",
});

app.use(sessionMiddleware);

app.engine('handlebars', hb({
    defaultLayout : 'main',
    helpers : {

    }
}));

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});


app.set('view engine', 'handlebars');
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

setupPassport(app);

app.use('/', router);



// app.listen(process.env.PORT || 8080);
http.listen(process.env.PORT || 8080);
