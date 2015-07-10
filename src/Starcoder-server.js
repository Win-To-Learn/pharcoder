/**
 * Starcoder-server.js
 *
 * Starcoder master object extended with server only properties and methods
 */
'use strict';

var Starcoder = require('./Starcoder.js');
var SyncServer = require('./server-components/SyncServer.js');
var MsgServer = require('./server-components/MsgServer.js');
var ControlEndPoint = require('./server-components/ControlEndPoint.js');
var CollisionHandlers = require('./server-components/CollisionHandlers.js');

var World = require('./serverbodies/World.js');

var Player = require('./players/Player.js');
var Guest = require('./players/Guest.js');

Starcoder.mixinPrototype(Starcoder.prototype, SyncServer.prototype);
Starcoder.mixinPrototype(Starcoder.prototype, ControlEndPoint.prototype);
Starcoder.mixinPrototype(Starcoder.prototype, CollisionHandlers.prototype);
Starcoder.mixinPrototype(Starcoder.prototype, MsgServer.prototype);

/**
 * Initialize Starcoder server
 *
 * @param app {object} - Express app object for REST interface
 * @param io {object} Socket.io object for bidirectional communication
 */
Starcoder.prototype.init = function (app, io) {
    this.app = app;
    this.io = io;
    this.players = {};          // Logged in players
    this.clientReadyFunctions = [];
    this.world = new World(this.config.worldBounds, this.config.initialBodies);
    this.world.starcoder = this;
    this.world.log = this.log;
    this.initControlEndPoint();
    this.initCollisionHandlers();
    this.initSyncServer();
    this.initMsgServer();
    this.initSocket();
    this.world.start(1/60);
};

Starcoder.prototype.initSocket = function () {
    var self = this;
    this.io.on('connect', function (socket) {
        var player = self.newPlayer(socket);     // FIXME: details
        socket.emit('server ready', player.msgNew());
        socket.on('client ready', function () {
            self.addPlayer(player);
            self.world.addPlayerShip(player);
            socket.emit('timesync', self.hrtime());
            setInterval(function () {
                socket.emit('timesync', self.hrtime());
            }, self.config.timeSyncFreq*1000);
            //self.attachActions(player);
            //self.controlEndPointReady(player);
            //self.syncServerReady(player);
            for (var i = 0, l = self.clientReadyFunctions.length; i < l; i++) {
                self.clientReadyFunctions[i](player);
            }
        });
    })
}

Starcoder.prototype.newPlayer = function (socket, type, descriptor) {
    if (!type) {
        type = Guest;
    } else {
        type = Players.playerTypes[type];
    }
    var player = new type(socket, descriptor);
    return player;
};

Starcoder.prototype.addPlayer = function (player) {
    this.players[player.socket.id] = player;
};

Starcoder.prototype.forEachPlayer = function (cb) {
    var keys = Object.keys(this.players);
    for (var i = 0, l = keys.length; i < l; i++) {
        cb(id, this.players[keys[i]]);
    }
};

/**
 * Get high resolution time in milliseconds
 *
 * @returns {number}
 */
Starcoder.prototype.hrtime = function () {
    var hr = process.hrtime();
    return Math.floor(hr[0]*1000 + hr[1]*1e-6);
};


Starcoder.prototype.role = 'Server';

// FIXME: Extend object

module.exports = Starcoder;
