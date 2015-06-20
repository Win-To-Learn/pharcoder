/**
 * Sync.js
 *
 * Mixin for world sync subsystem
 */
'use strict';

var SyncServer = function () {};

SyncServer.prototype.initSync = function () {
    var self = this;
    this.nsSync = this.io.of('/sync');
    // New connection
    this.nsSync.on('connect', function (socket) {
        var player = self.addPlayer(socket);     // FIXME: details
        // Handshake
        socket.emit('server ready', player.msgNew());
        socket.on('client ready', function () {
            self.world.addPlayerShip(player);
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

SyncServer.prototype.sendUpdates = function () {
    var world = this.world;
    var updateCache = {};
    var fullUpdateCache = {};
    var cachePointer;
    var pids = Object.keys(this.players);
    var wtime = world.time;
    var rtime = this.hrtime();
    // Removed bodies - same for everyone, so just do it once
    var removed = [];
    for (var j = world._syncableBodiesRemoved.length - 1; j >= 0; j--) {
        removed.push(world._syncableBodiesRemoved[j].id);
    }
    for (var i = pids.length - 1; i >= 0; i--) {
        var player = this.players[pids[i]];
        var update = {w: wtime, r: rtime, b: []};
        // Old bodies - only send full updates to new players
        for (j = world._syncableBodies.length - 1; j >= 0; j--) {
            var body = world._syncableBodies[j];
            if (player.newborn) {
                cachePointer = fullUpdateCache;
            } else {
                cachePointer = updateCache;
            }
            var b = cachePointer[body.id];
            if (!b) {
                b = body.getUpdatePacket(player.newborn);
                cachePointer[body.id] = b;
            }
            //console.log('Old', body.id, body.clientType);
            update.b.push(b);
        }
        cachePointer = fullUpdateCache;
        for (j = world._syncableBodiesNew.length - 1; j >= 0; j--) {
            body = world._syncableBodiesNew[j];
            b = cachePointer[body.id];
            if (!b) {
                b = body.getUpdatePacket(true);
                cachePointer[body.id] = b;
            }
            update.b.push(b);
            world._syncableBodies.push(body);
        }
        update.rm = removed;
        player.socket.emit('update', update);
        player.newborn = false;
    }
    world._syncableBodiesNew.length = 0;
    world._syncableBodiesRemoved.length = 0;
    //for (j = world._syncableBodies.length - 1; j >= 0; j--) {
    //    body = world._syncableBodies[j];
    //    if (body.newborn) {
    //        body.newborn = false;
    //    }
    //}
};

SyncServer.prototype.hrtime = function () {
    var hr = process.hrtime();
    return Math.floor(hr[0]*1000 + hr[1]*1e-6);
};

module.exports = SyncServer;