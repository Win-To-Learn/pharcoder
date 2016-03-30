/**
 * LoginEndpoint.js
 */
'use strict';

var Player = require('../../schema/Player.js');
var Guest = require('../../schema/Guest.js');

module.exports = {
    connect: function (socket) {
        var self = this;
        socket.on('login', function (ticketid) {
            self.checkLogin(socket, ticketid);
        });
    },

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
        //for (var i = 0, l = this.login.length; i < l; i++) {
        //    this.login[i].call(this, socket, player);
        //}
        this.events.emit('login', socket, player);
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