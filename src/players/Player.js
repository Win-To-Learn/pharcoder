/**
 * Player.js
 *
 * Base class representing a user interacting with the game world
 */
'use strict';

var Player = function (username) {
    this.id = Player.id++;
    this.username = username || ('Player' + this.id);
    //this.socket = socket;
    this.ships = [];
    this.newborn = true;
    this.stats = {
        tags: 0,
        treesPlanted: 0,
        bestTagStreak: 0,
        currentTagStreak: 0
    };
    this.codeQueue = [];
    this.codeEventQueue = [];
    this.interpreter = null;
};

Player.id = 1;

Player.prototype.addShip = function (ship) {
    this.ships.push(ship);
    ship.player = this;
};

Player.prototype.getShip = function (which) {
    which = which || 0;
    return this.ships[which];
};

Player.prototype.msgNew = function () {
    // TODO: More info
    return {id: this.id, username: this.username};
};

Player.playerTypes = {};
Player.playerTypes['Player'] = Player;

module.exports = Player;
