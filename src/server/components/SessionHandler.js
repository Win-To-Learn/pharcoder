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
        if (req.body.login) {
            // Known user with password
            this.getPlayerByGamertag(req.body.user).then(function (player) {
                if (player) {
                    bcrypt.compare(req.body.pass, player.password, function (err, match) {
                        if (err || !match) {
                            res.status(401).end();
                        } else {
                            // TODO: Could send to different locations based on role
                            //delete player.password;
                            //req.session.player = player.getPOJO();
                            ////req.session.player.role = 'player';
                            //res.status(200).send({goto: 'play.html'}).end();
                            self.addTicket('FIXME', 'player', player.id).then(function (ticketid) {
                                //req.session.player = {id: player.id};
                                req.session.ticketid = ticketid;
                                req.session.server = 'FIXME';
                                res.status(200).send({goto: 'play.html'}).end();
                            });
                        }
                    });
                } else {
                    res.status(401).end();
                }
            });
        } else if (req.body.tag) {
            this.addTicket('FIXME', 'guest', req.body.tag).then(function (ticketid) {
                //req.session.player = {id: ticketid};
                req.session.ticketid = ticketid;
                req.session.server = 'FIXME';
                res.status(200).send({goto: 'play.html'}).end();
            });
        } else if (req.body.code) {
            bcrypt.hash(req.body.pass, 8, function (err, hash) {
                if (err || !hash) {
                    res.status(401).end();
                } else {
                    self.registerPlayerWithCode(req.body.code, req.body.user, hash).then(function (ticketid) {
                        //console.log('ok', ticketid);
                        req.session.ticketid = ticketid;
                        req.session.server = 'FIXME';
                        res.status(200).send({goto: 'play.html'}).end();
                    }, function (reason) {
                        //console.log('uhoh', reason, reason.stack);
                        res.status(200).send({goto: 'login.html'}).end();
                    });
                }
            });
        }
    },

    identityGET: function (req, res) {
        if (req.session.ticketid) {
            res.status(200).send({ticketid: req.session.ticketid, serverUri: req.server});
        } else {
            res.status(401).end();
        }
    }
};
