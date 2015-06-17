/**
 * Sync.js
 *
 * Mixin for world sync subsystem
 */
'use strict';

var Ship = require('../physicsobjects/p2/Ship.js');

var Sync = function () {};

Sync.prototype.initSync = function () {
    var self = this;
    this.nsSync = this.io.of('/sync');
    // New connection
    this.nsSync.on('connect', function (socket) {
        var player = self.addPlayer(socket);     // FIXME: details
        // Handshake
        socket.emit('server ready', player.msgNew());
        socket.on('client ready', function () {
            self.world.addSyncableBody(Ship, {position: 'random'}, player);
            socket.emit('timesync', self.hrtime());
            setInterval(function () {
               socket.emit('timesync', self.hrtime());
            }, self.config.timeSyncFreq*1000);
            setInterval(function () {
                self.sendUpdates();
            }, self.config.updateInterval);
            self.attachActions(player);
        });
    });
    // Send updates
    //setInterval(this.sendUpdates.bind(this), this.config.updateInterval);
};

Sync.prototype.sendUpdates = function () {
    var world = this.world;
    var updateCache = {};
    var fullUpdateCache = {};
    var cachePointer;
    var pids = Object.keys(this.players);
    var wtime = world.time;
    var rtime = this.hrtime();
    for (var i = pids.length - 1; i >= 0; i--) {
        var player = this.players[pids[i]];
        var update = {w: wtime, r: rtime, b: []};
        for (var j = world._syncableBodies.length - 1; j >= 0; j--) {
            var body = world._syncableBodies[j];
            var full = body.newborn || player.newborn;
            if (full) {
                cachePointer = fullUpdateCache;
            } else {
                cachePointer = updateCache;
            }
            var b = cachePointer[body.id];
            if (!b) {
                b = body.getUpdatePacket(full);
                cachePointer[body.id] = b;
            }
            update.b.push(b);
        }
        player.socket.emit('update', update);
        player.newborn = false;
    }
    for (j = world._syncableBodies.length - 1; j >= 0; j--) {
        body = world._syncableBodies[j];
        if (body.newborn) {
            body.newborn = false;
        }
    }
};

Sync.prototype.hrtime = function () {
    var hr = process.hrtime();
    return Math.floor(hr[0]*1000 + hr[1]*1e-6);
};

module.exports = Sync;