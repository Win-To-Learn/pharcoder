/**
 * Player.js
 *
 * Base class representing a user interacting with the game world
 */
'use strict';

var Player = function () {
    //this.id = Player.id++;
    //this.username = username || ('Player' + this.id);
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
    this.codeSnippets = {};
};

Player.id = 1;

Player.prototype.role = 'player';

Player.prototype.init = function (username) {
    this.username = username;
};

/**
 * Note player action for tutorial and/or achievement system
 *
 * @param {string} achievement - key for achievement/tutorial step
 */
Player.prototype.achieve = function (achievement) {
    if (this.tutorial) {
        this.tutorial.transition(achievement);
    }
    // TODO: Achievements
};

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

Player.prototype.getPOJO = function () {
    // TODO: More info
    return {id: this.id, username: this.username};
};

Player.playerTypes = {};
Player.playerTypes['Player'] = Player;

Player.fromDB = function (record) {
    var player = new Player();
    player.id = record._id;
    player.username = record.username;
    player.password = record.password;
    player.codeSnippets = record.codeSnippets;
    return player;
};

Player.create = function (record) {
    var constructor = Player.playerTypes[record.role];
    return new constructor(record.username);
};

module.exports = Player;
