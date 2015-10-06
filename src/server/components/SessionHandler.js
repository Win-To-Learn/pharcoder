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
        if (req.body.user) {
            this.getPlayerByUsername(req.body.user, function (player) {
                if (player) {
                    bcrypt.compare(req.body.pass, player.password, function (err, match) {
                        if (err || !match) {
                            res.status(401).end();
                        } else {
                            // TODO: Could send to different locations based on role
                            //var player = Player.create(record);
                            delete player.password;
                            req.session.player = player;
                            req.session.player.role = 'player';
                            //self.pending[player._id] = player;
                            res.status(200).send({goto: 'play.html'}).end();
                        }
                    })
                } else {
                    res.status(401).end();
                }
            });
        } else {
            this.getNewGuest(req.body.tag, req.body.server, function (guest) {
                req.session.player = guest;
                req.session.player.role = 'guest';
                res.status(200).send({goto: 'play.html'}).end();
            });
        }
    },

    identityGET: function (req, res) {
        var player = req.session.player;
        if (player) {
            res.status(200).send({player: player, serverUri: this.getServerUri(player, req)}).end();
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