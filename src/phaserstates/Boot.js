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
    var pScale = this.game.starcoder.config.physicsScale;
    var ipScale = 1/pScale;
    this.game.physics.config = {
        pxm: function (a) {
            return ipScale*a;
        },
        mpx: function (a) {
            return pScale*a;
        },
        pxmi: function (a) {
            return -ipScale*a;
        },
        mpxi: function (a) {
            return -pScale*a;
        }
    };
    this.starcoder.controls = this.game.plugins.add(Controls,
        this.starcoder.cmdQueue);
    // Set up socket.io connection
    this.starcoder.socket = this.starcoder.io(this.starcoder.config.serverUri + '/sync',
        this.starcoder.config.ioClientOptions);
    this.starcoder.socket.on('server ready', function (playerMsg) {
        // FIXME: Has to interact with session for authentication etc.
        console.log('Player', playerMsg);
        self.starcoder.player = playerMsg;
        self.starcoder.syncclient = self.game.plugins.add(SyncClient,
            self.starcoder.socket, self.starcoder.cmdQueue);
        _connected = true;
    });
};

Boot.prototype.update = function () {
    if (_connected) {
        this.game.state.start('space');
    }
};

module.exports = Boot;