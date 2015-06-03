/**
 * Boot.js
 *
 * Boot state for Starcoder
 * Load assets for preload screen and connect to server
 */
'use strict';

var Controls = require('../phaserplugins/Controls.js');
var ServerSync = require('../phaserplugins/ServerSync.js');

var Boot = function () {
    if (!(this instanceof Boot)) {
        return new Boot();
    }
};

Boot.prototype = Object.create(Phaser.State.prototype);
Boot.prototype.constructor = Boot;

var _connected = false;

Boot.prototype.preload = function () {
    var self = this;
    this.starcoder.controls = this.game.plugins.add(Controls,
        this.starcoder.cmdQueue);
    // Set up socket.io connection
    this.starcoder.socket = this.starcoder.io(this.starcoder.config.serverUri,
        this.starcoder.config.ioClientOptions);
    this.starcoder.socket.on('connect', function () {
        console.log('socket connected');
        self.starcoder = self.game.plugins.add(ServerSync,
            self.starcoder.socket, self.starcoder.cmdQueue)
        _connected = true;
    });
};

Boot.prototype.update = function () {
    if (_connected) {
        this.game.state.start('space');
    }
};

module.exports = Boot;