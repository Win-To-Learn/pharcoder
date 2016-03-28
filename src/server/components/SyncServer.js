/**
 * SyncServer.js
 *
 * Mixin for world sync subsystem
 */
'use strict';

module.exports = {
    init: function () {
        var self = this;
        var worldapi = this.worldapi;
        this.events.on('sync', function () {
            //console.log('syncTick');
            var wtime = worldapi.getWorldTime();
            var rtime = self.hrtime();
            var removed = worldapi.removedBodies.slice();
            worldapi.removedBodies.length = 0;
            var updateCache = {};
            var fullUpdateCache = {};
            var cachePointer;
            var i, j, l;
            for (i = 0, l = self.playerList.length; i < l; i++) {
                var player = self.playerList[i];
                //var update = {w: wtime, r: rtime, b: [], rm: world.removedBodies};
                player.worldUpdate.w = wtime;
                player.worldUpdate.r = rtime;
                player.worldUpdate.b.length = 0;
                player.worldUpdate.rm = removed;
                for (j = 0, l = worldapi.syncableBodies.length; j < l; j++) {
                    var body = worldapi.syncableBodies[j];
                    var full = player.newborn || body.newborn;
                    if (full) {
                        cachePointer = fullUpdateCache;
                    } else {
                        cachePointer = updateCache;
                    }
                    var b = cachePointer[body.id];
                    if (!b) {
                        cachePointer[body.id] = b = body.getUpdatePacket(full);
                    }
                    player.worldUpdate.b.push(b);
                }
                player.newborn = false;
            }
            for (j = 0, l = worldapi.syncableBodies.length; j < l; j++) {
                worldapi.syncableBodies.newborn = false;
            }
        });
    },

    /**
     * Send updates to all connected clients
     */
    //sendUpdates: function () {
    //    var world = this.world;
    //    var updateCache = {};
    //    var fullUpdateCache = {};
    //    var cachePointer;
    //    var pids = Object.keys(this.players);
    //    var wtime = world.time;
    //    var rtime = this.hrtime();
    //    // Removed bodies - same for everyone, so just do it once
    //    var removed = [];
    //    for (var j = world._syncableBodiesRemoved.length - 1; j >= 0; j--) {
    //        removed.push(world._syncableBodiesRemoved[j].id);
    //    }
    //    for (var i = pids.length - 1; i >= 0; i--) {
    //        var player = this.players[pids[i]];
    //        var update = {w: wtime, r: rtime, b: [], rm: removed};
    //        // Old bodies - only send full updates to new schema
    //        for (j = world._syncableBodies.length - 1; j >= 0; j--) {
    //            var body = world._syncableBodies[j];
    //            if (player.newborn) {
    //                cachePointer = fullUpdateCache;
    //            } else {
    //                cachePointer = updateCache;
    //            }
    //            var b = cachePointer[body.id];
    //            if (!b) {
    //                b = body.getUpdatePacket(player.newborn);
    //                cachePointer[body.id] = b;
    //            }
    //            //console.log('Old', body.id, body.clientType);
    //            update.b.push(b);
    //        }
    //        // New bodies - send full updates to everyone
    //        for (j = world._syncableBodiesNew.length - 1; j >= 0; j--) {
    //            body = world._syncableBodiesNew[j];
    //            b = fullUpdateCache[body.id];
    //            if (!b) {
    //                b = body.getUpdatePacket(true);
    //                fullUpdateCache[body.id] = b;
    //            }
    //            update.b.push(b);
    //            //world._syncableBodies.push(body);
    //        }
    //        player.socket.emit('update', update);
    //        player.newborn = false;
    //    }
    //    // Move newly created bodies to general body list
    //    for (j = world._syncableBodiesNew.length - 1; j >= 0; j--) {
    //        world._syncableBodies.push(world._syncableBodiesNew[j]);
    //    }
    //    // Clear dirty flags
    //    for (j = world._syncableBodies.length - 1; j >=0; j--) {
    //        world._syncableBodies[j].clean();
    //    }
    //    world._syncableBodiesNew.length = 0;
    //    world._syncableBodiesRemoved.length = 0;
    //    //for (j = world._syncableBodies.length - 1; j >= 0; j--) {
    //    //    body = world._syncableBodies[j];
    //    //    if (body.newborn) {
    //    //        body.newborn = false;
    //    //    }
    //    //}
    //}
};