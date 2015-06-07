/**
 * Boot.js
 *
 * Boot state for Starcoder
 * Load assets for preload screen and connect to server
 */
'use strict';

//var Starcoder = require('../Starcoder-client.js');
var Controls = require('../phaserplugins/Controls.js');
var SyncClient = require('../phaserplugins/SyncClient.js');

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
    this.starcoder.socket = this.starcoder.io(
        this.starcoder.config.serverUri + '/sync',
        this.starcoder.config.ioClientOptions);
    this.starcoder.socket.on('new player', function (playerMsg) {
        // FIXME: Has to interact with session for authentication etc.
        console.log('Player', playerMsg);
        self.starcoder.player = playerMsg;
        self.starcoder.serversync = self.game.plugins.add(SyncClient,
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