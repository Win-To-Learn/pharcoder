/**
 * Guest.js
 *
 * Unlogged in player
 * Mostly for testing, maybe adaptable for production
 */
'use strict';

var Player = require('./Player.js');

var Guest = function () {
    Player.call(this);
    //this.username = gamertag || ('Guest' + this.id);
};

Guest.prototype = Object.create(Player.prototype);
Guest.prototype.constructor = Guest;

Player.playerTypes['Guest'] = Guest;

Guest.prototype.role = 'guest';

Guest.fromDB = function (record) {
    var player = new Guest();
    player.id = record._id;
    player.username = record.username;
    return player;
};

module.exports = Guest;