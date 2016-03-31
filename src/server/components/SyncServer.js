/**
 * SyncServer.js
 *
 * Mixin for world sync subsystem
 */
'use strict';

module.exports = {
    init: function () {
        this.events.on('syncTick', sync.bind(this));
    }
};

var sync = function () {
    //console.log('syncTick');
    var wtime = this.worldapi.getWorldTime();
    var rtime = this.hrtime();
    var removed = this.worldapi.removedBodies.slice();
    this.worldapi.removedBodies.length = 0;
    var updateCache = {};
    var fullUpdateCache = {};
    var cachePointer;
    var i, j;
    for (i = 0; i < this.playerList.length; i++) {
        var player = this.playerList[i];
        var worldUpdate = {w: wtime, r: rtime, b: [], rm: removed};
        //player.worldUpdate.w = wtime;
        //player.worldUpdate.r = rtime;
        //player.worldUpdate.b.length = 0;
        //player.worldUpdate.rm = removed;
        this.msgBuf.len = 0;
        for (j = 0; j < this.worldapi.syncableBodies.length; j++) {
            var body = this.worldapi.syncableBodies[j];
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
            worldUpdate.b.push(b);
            body.writeUpdatePacket(this.msgBuf);
        }
        console.log('Len', this.msgBuf.len);
        this.sendPlayerUpdate(player, worldUpdate);
        player.newborn = false;
    }
    for (j = 0; j < this.worldapi.syncableBodies.length; j++) {
        this.worldapi.syncableBodies[j].newborn = false;
    }
};