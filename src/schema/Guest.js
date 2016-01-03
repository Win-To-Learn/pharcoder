/**
 * Guest.js
 *
 * Unlogged in player
 * Mostly for testing, maybe adaptable for production
 */
'use strict';

var Player = require('./Player.js');

var idCounter = 1;

var Guest = function (tag) {
    Player.prototype.init.call(this);
    this.gamertag = tag;
    this.id = 'G' + idCounter++;
};

Guest.prototype = Object.create(Player.prototype);
Guest.prototype.constructor = Guest;

/**
 * Append a number to the gamertag to make it distinct from all other logged in players
 * @param {Player[]} players
 */
Guest.prototype.disambiguate = function (players) {
    var n = 1;
    var base = this.gamertag + ' ';
    outer:
    while (true) {
        for (var i = 0, l = players.length; i < l; i++) {
            if (this.gamertag === players[i].gamertag) {
                this.gamertag = base + n++;
                continue outer;
            }
        }
        break;
    }
};

Player.playerTypes['Guest'] = Guest;

Guest.prototype.role = 'guest';
Guest.prototype.cType = 'Guest';

// Guests don't get stored in the DB
Guest.prototype.restore = undefined;
Guest.prototype.save = undefined;

module.exports = Guest;