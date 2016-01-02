/**
 * LoginEndpoint.js
 */
'use strict';

var Player = require('../../schema/Player.js');
var Guest = require('../../schema/Guest.js');

module.exports = {
    onConnectCB: function (socket) {
        var self = this;
        socket.on('login', function (token) {
            self.checkLogin(socket, token);
        });
    },

    //checkLogin: function (socket, credentials) {
    //    // FIXME: Interface with backend DB
    //    if (credentials.gamertag) {
    //        this.loginSuccess(socket, new Guest(credentials.gamertag));
    //    } else if (credentials.username && credentials.password === 'star') {
    //        this.loginSuccess(socket, new Player(credentials.username));
    //    } else {
    //        this.loginFailure(socket, 'Unknown username or password. Try again.');
    //    }
    //},

    // FIXME: More cases to handle
    checkLogin: function (socket, token) {
        //var player = this.pending[id];
        var self = this;
        console.log('Check login', token);
        this.checkTicket(token, 'FIXME', function (type, identity) {
            if (type === 'player') {
                self.getPlayerById(identity, function (player) {
                    if (player) {
                        self.loginSuccess(socket, player);
                    } else {
                        self.loginFailure(socket, 'Login failure');
                    }
                });
            } else if (type === 'guest') {
                var g = new Guest(identity);
                g.id = token;
                self.loginSuccess(socket, g);
            }
        });
        //if (token.guest) {
        //    this.loginSuccess(socket, new Guest(token.guest));
        //} else {
        //    this.getPlayerById(token.id, function (player) {
        //        if (player) {
        //            self.loginSuccess(socket, player);
        //        } else {
        //            self.loginFailure(socket, 'Login failure');
        //        }
        //    });
        //}
    },

    loginSuccess: function (socket, player) {
        player.socket = socket;
        for (var i = 0, l = this.onLoginCB.length; i < l; i++) {
            this.onLoginCB[i].call(this, socket, player);
        }
        socket.on('ready', this.onReady.bind(this, player));
        //socket.on('disconnect', this.disconnect.bind(this, socket, player));
        socket.removeAllListeners('login');
        //socket.emit('logged in', player.msgNew());
    },

    loginFailure: function (socket, msg) {
        socket.emit('login failure', msg);
    }
};