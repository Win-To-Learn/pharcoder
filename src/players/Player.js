/**
 * Player.js
 *
 * Base class representing a user interacting with the game world
 */
'use strict';

var id = 1;         // FIXME: Different id generation

var Player = function (socket) {
    this.id = 1000 + id++;
    this.socket = socket;
    this.ships = [];
    this.newborn = true;
};

Player.prototype.addShip = function (ship) {
    this.ships.push(ship);
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
