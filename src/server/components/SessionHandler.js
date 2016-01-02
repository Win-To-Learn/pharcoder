/**
 * Created by jay on 9/6/15.
 */
'use strict';

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');

var Player = require('../../schema/Player.js');

module.exports = {
    init: function () {
        this.pending = {};
        this.app.use(bodyParser.urlencoded({extended: false}));
        //this.app.use(bodyParser.json());
        var sessionMiddleware = session({
            secret: this.config.sessionSecret,
            resave: false,
            saveUninitialized: false,
            store: new MongoStore({
                url: this.config.mongoUri
                //unserialize: _unserialize,
                //serialize: _serialize
            })
        });
        //this.io.use(function (socket, next) {
        //    sessionMiddleware(socket.request, socket.request.res, next);
        //});
        this.app.use(sessionMiddleware);

        this.app.post('/api/login', this.loginPOST.bind(this));
        this.app.get('/api/identity', this.identityGET.bind(this));
        this.app.post('/api/register', this.registerPOST.bind(this));
    },

    registerPOST: function (req, res) {
        // FIXME: Really sloppy
        var self = this;
        bcrypt.hash(req.body.pass, 8, function (err, hash) {
            if (err || !hash) {
                res.status(401).end();
            } else {
                self.registerUser(req.body.user, hash, function (player) {
                    if (player) {
                        delete player.password;
                        req.session.player = player;
                        req.session.player.role = 'player';
                        res.status(200).send({goto: 'play.html'}).end();
                    } else {
                        res.status(401).end();
                    }
                });
            }
        });
    },

    loginPOST: function (req, res) {
        var self = this;
        // TODO: Handle cases: known player, login code, guest
        if (req.body.user) {
            // Known user with password
            this.getPlayerByGamertag(req.body.user, function (player) {
                if (player) {
                    bcrypt.compare(req.body.pass, player.password, function (err, match) {
                        if (err || !match) {
                            res.status(401).end();
                        } else {
                            // TODO: Could send to different locations based on role
                            delete player.password;
                            req.session.player = player.getPOJO();
                            //req.session.player.role = 'player';
                            res.status(200).send({goto: 'play.html'}).end();
                        }
                    })
                } else {
                    res.status(401).end();
                }
            });
        } else if (req.body.tag) {
            console.log('Guest');
            // Random guest
            req.session.guest = req.body.tag;
            req.session.server = req.body.server;
            res.status(200).send({goto: 'play.html'}).end();
        } else if (req.body.code) {
            // Subscribe code
        }
    },

    identityGET: function (req, res) {
        if (req.session.player) {
            res.status(200).send({player: req.session.player, serverUri: this.getServerUri(req.player, req)}).end();
        } else if (req.session.guest) {
            res.status(200).send({guest: req.session.guest, serverUri: req.server}).end();
        } else {
            res.status(401).end();
        }
    }
};

//function _unserialize (obj) {
//    var session = {};
//    for (var prop in obj) {
//        if (prop === 'player') {
//            session.player = Player.fromDB(obj.player);
//        } else {
//            session[prop] = obj[prop];
//        }
//    }
//}
//
//function _serialize (session) {
//    // Copy each property of the session to a new object
//    var obj = {};
//    for (var prop in session) {
//        if (prop === 'cookie') {
//            // Convert the cookie instance to an object, if possible
//            // This gets rid of the duplicate object under session.cookie.data property
//                obj.cookie = session.cookie.toJSON ? session.cookie.toJSON() : session.cookie;
//        } else {
//                obj[prop] = session[prop];
//        }
//    }
//
//    return obj;
//}