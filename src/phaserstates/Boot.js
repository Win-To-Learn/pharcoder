/**
 * Boot.js
 *
 * Boot state for Starcoder
 * Load assets for preload screen and connect to server
 */
'use strict';

var Controls = require('../phaserplugins/Controls.js');
var SyncClient = require('../phaserplugins/SyncClient.js');

var Boot = function () {};

Boot.prototype = Object.create(Phaser.State.prototype);
Boot.prototype.constructor = Boot;

var _connected = false;

/**
 * Set properties that require booted game state, attach plugins, connect to game server
 */
Boot.prototype.init = function () {
    //this.game.stage.disableVisibilityChange = true;
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.game.renderer.renderSession.roundPixels = true;
    var self = this;
    var pScale = this.starcoder.config.physicsScale;
    var ipScale = 1/pScale;
    var floor = Math.floor;
    this.game.physics.config = {
        pxm: function (a) {
            return ipScale*a;
        },
        mpx: function (a) {
            return floor(pScale*a);
        },
        pxmi: function (a) {
            return -ipScale*a;
        },
        mpxi: function (a) {
            return floor(-pScale*a);
        }
    };
    this.starcoder.serverConnect();
    //this.starcoder.controls = this.game.plugins.add(Controls,
    //    this.starcoder.cmdQueue);
    //this.game.joystick = this.starcoder.attachPlugin(Phaser.VirtualJoystick);
    //this.starcoder.controls = this.starcoder.attachPlugin(Controls, this.starcoder.cmdQueue);
    // Set up socket.io connection
    //this.starcoder.socket = this.starcoder.io(this.starcoder.config.serverUri,
    //    this.starcoder.config.ioClientOptions);
    //this.starcoder.socket.on('server ready', function (playerMsg) {
    //    // FIXME: Has to interact with session for authentication etc.
    //    self.starcoder.player = playerMsg;
    //    //self.starcoder.syncclient = self.game.plugins.add(SyncClient,
    //    //    self.starcoder.socket, self.starcoder.cmdQueue);
    //    self.starcoder.syncclient = self.starcoder.attachPlugin(SyncClient,
    //        self.starcoder.socket, self.starcoder.cmdQueue);
    //    _connected = true;
    //});
};

/**
 * Preload minimal assets for progress screen
 */
Boot.prototype.preload = function () {

};

/**
 * Kick into next state once initialization and preloading are done
 */
Boot.prototype.create = function () {
    //this.game.state.start('preload');
};

/**
 * Advance game state once network connection is established
 */
Boot.prototype.update = function () {
    // FIXME: don't wait here - should be in create
    if (this.starcoder.connected) {
        //this.game.state.start('space');
        this.game.state.start('login');
    }
};

module.exports = Boot;