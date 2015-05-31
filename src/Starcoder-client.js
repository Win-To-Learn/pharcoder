/**
 * Starcoder-client.js
 *
 * Starcoder master object extended with client only properties and methods
 */
'use strict';

var Starcoder = require('./Starcoder.js');

var SERVER_URI = 'http://localhost:8080';

Starcoder.prototype.init = function () {
    this.game = new Phaser.Game(800, 600, Phaser.AUTO, '');
    this.game.starcoder = this;
    this.config = {     // FIXME
        worldBounds: [-1000, -1000, 2000, 2000]
    }
};

Starcoder.prototype.initNet = function () {
    //this.io = io;
    //this.socket = io(SERVER_URI);
};

Starcoder.prototype.role = 'client';

Starcoder.States = {};

module.exports = Starcoder;
