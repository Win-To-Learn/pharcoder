/**
 * Guest.js
 *
 * Unlogged in player
 * Mostly for testing, maybe adaptable for production
 */
'use strict';

var Player = require('./Player.js');

var id = 1;             // Counter for unique ids

var Guest = function (socket) {
    Player.call(this, socket);
    this.id = 9000 + id++;
    this.username = 'Guest' + this.id;
};

Guest.prototype = Object.create(Player.prototype);
Guest.prototype.constructor = Guest;

Player.playerTypes['Guest'] = Guest;

module.exports = Guest;