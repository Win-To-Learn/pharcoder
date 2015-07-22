/**
 * Guest.js
 *
 * Unlogged in player
 * Mostly for testing, maybe adaptable for production
 */
'use strict';

var Player = require('./Player.js');

var Guest = function (gamertag) {
    Player.call(this);
    this.username = gamertag || ('Guest' + this.id);
};

Guest.prototype = Object.create(Player.prototype);
Guest.prototype.constructor = Guest;

Player.playerTypes['Guest'] = Guest;

module.exports = Guest;