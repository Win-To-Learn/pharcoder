/**
 * LoginEndpoint.js
 */
'use strict';

var Player = require('../../schema/Player.js');
var Guest = require('../../schema/Guest.js');

module.exports = {
    onConnectCB: function (socket) {
        var self = this;
        socket.on('login', function (ticketid) {
            self.checkLogin(socket, ticketid);
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
    checkLogin: function (socket, ticketid) {
        var self = this;
        this.checkTicket(ticketid, 'FIXME').then(function (ticket) {
            if (ticket.type === 'player') {
                self.getPlayerById(ticket.identity).then(function (player) {
                    if (player) {
                        self.loginSuccess(socket, player);
                    } else {
                        self.loginFailure(socket, 'Login failure');
                    }
                });
            } else if (ticket.type === 'guest') {
                //var g = new Guest(identity);
                //g.disambiguate(self.playerList);
                self.loginSuccess(socket, new Guest(ticket.identity));
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
        socket.emit('loginSuccess', {id: player.id});
    },

    loginFailure: function (socket, msg) {
        socket.emit('login failure', msg);
    }
};