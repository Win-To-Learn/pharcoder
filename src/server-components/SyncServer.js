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
        if (player.newborn) {
            console.log('newborn player at', world.time);
        }
        var update = {w: wtime, r: rtime, b: [], rm: removed};
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
            if (player.newborn) {
                console.log('sending', b.id, 'to', player.id, 'bc new player', world.time, b.x);
            }
            //console.log('Old', body.id, body.clientType);
            update.b.push(b);
        }
        // New bodies - send full updates to everyone
        for (j = world._syncableBodiesNew.length - 1; j >= 0; j--) {
            body = world._syncableBodiesNew[j];
            b = fullUpdateCache[body.id];
            if (!b) {
                b = body.getUpdatePacket(true);
                fullUpdateCache[body.id] = b;
            }
            update.b.push(b);
            console.log('sending', b.id, 'to', player.id, 'bc new obj', world.time, b.x);
            //world._syncableBodies.push(body);
        }
        player.socket.emit('update', update);
        player.newborn = false;
    }
    for (j = world._syncableBodiesNew.length - 1; j >= 0; j--) {
        world._syncableBodies.push(world._syncableBodiesNew[j]);
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