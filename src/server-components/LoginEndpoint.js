/**
 * LoginEndpoint.js
 */
'use strict';

var Player = require('../players/Player.js');
var Guest = require('../players/Guest.js');

module.exports = {
    onConnectCB: function (socket) {
        var self = this;
        socket.on('login', function (credentials) {
            self.checkLogin(socket, credentials);
        });
    },

    checkLogin: function (socket, credentials) {
        // FIXME: Interface with backend DB
        if (credentials.gamertag) {
            this.loginSuccess(socket, new Guest(credentials.gamertag));
        } else if (credentials.username && credentials.password === 'star') {
            this.loginSuccess(socket, new Player(credentials.username));
        } else {
            this.loginFailure(socket, 'Unknown username or password. Try again.');
        }
    },

    loginSuccess: function (socket, player) {
        player.socket = socket;
        for (var i = 0, l = this.onLoginCB.length; i < l; i++) {
            this.onLoginCB[i].bind(this, socket, player)();
        }
        socket.on('ready', this.onReady.bind(this, player));
        //socket.on('disconnect', this.disconnect.bind(this, socket, player));
        socket.removeAllListeners('login');
        socket.emit('logged in', player.msgNew());
    },

    loginFailure: function (socket, msg) {
        socket.emit('login failure', msg);
    }
};