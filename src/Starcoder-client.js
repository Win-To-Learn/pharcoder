/**
 * Starcoder-client.js
 *
 * Starcoder master object extended with client only properties and methods
 */
'use strict';

var Starcoder = require('./Starcoder.js');

Starcoder.prototype.init = function (game) {
    this.game = game;
    game.starcoder = this;
    this.config = {     // FIXME
        worldBounds: [-1000, -1000, 2000, 2000]
    }
};

Starcoder.prototype.role = 'client';

Starcoder.States = {};

module.exports = Starcoder;
