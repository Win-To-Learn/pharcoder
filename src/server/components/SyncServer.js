/**
 * SyncServer.js
 *
 * Mixin for world sync subsystem
 */
'use strict';

module.exports = {
    init: function () {
        this.registerField('type', 'string');
        this.events.on('syncTick', altsync.bind(this));

        // for testing
        this.registerField('vectorScale', 'ufixed16');
        this.registerField('lineColor', 'string');
        this.registerField('lineWidth', 'ufixed16');
        this.registerField('tag', 'string');
        this.registerField('dead', 'boolean');
        this.registerField('charge', 'string');

    }
};

var newplayers = [];

var bufReady;

var altsync = function () {
    newplayers.length = 0;
    bufReady = false;
    var wtime = this.worldapi.getWorldTime();
    var rtime = this.hrtime();
    var removed = this.worldapi.removedBodies.slice();
    this.worldapi.removedBodies.length = 0;
    var worldUpdate = {w: wtime, r: rtime, b: [], rm: removed};
    this.msgBufOut.reset();
    this.msgBufOut.mark('start');
    this.msgBufOut.skip(4);         // Total length of update goes in position 1
    writeUpdateHeader(this.msgBufOut, wtime, rtime, removed);
    this.msgBufOut.mark('bodystart');
    // First send minimal updates to all existing players
    for (var i = 0; i < this.playerList.length; i++) {
        var player = this.playerList[i];
        if (player.newborn) {
            newplayers.push(player);
            continue;
        }
        if (!bufReady) {
            for (var j = 0; j < this.worldapi.syncableBodies.length; j++) {
                var body = this.worldapi.syncableBodies[j];
                worldUpdate.b.push(body.getUpdatePacket(body.newborn));
                writeBody(this.msgBufOut, body);
                //body.newborn = false;
            }
            bufReady = true;
        }
        this.msgBufOut.writeUInt32AtMark(this.len, 'start');
        this.sendPlayerUpdate(player, worldUpdate);
        //console.log('Short Len>', this.msgBufOut.len);
        //console.log('Buf>', this.msgBufOut.buffer);
    }
    // Then send full updates to new players
    bufReady = false;
    worldUpdate = {w: wtime, r: rtime, b: [], rm: removed};
    this.msgBufOut.rewindToMark('bodystart');
    for (i = 0; i < newplayers.length; i++) {
        player = newplayers[i];
        if (!bufReady) {
            for (j = 0; j < this.worldapi.syncableBodies.length; j++) {
                body = this.worldapi.syncableBodies[j];
                worldUpdate.b.push(body.getUpdatePacket(true));
                writeBody(this.msgBufOut, body, true);
            }
            bufReady = true;
        }
        this.msgBufOut.writeUInt32AtMark(this.len, 'start');
        this.sendPlayerUpdate(player, worldUpdate);
        //console.log('Long Len>', this.msgBufOut.len);
        player.newborn = false;
    }
    // Clear dirty properties on all objects
    for (j = 0; j < this.worldapi.syncableBodies.length; j++) {
        this.worldapi.syncableBodies[j].clean();
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
            //body.writeUpdatePacket(this.msgBuf);
        }
        console.log('Len', this.msgBuf.len);
        this.sendPlayerUpdate(player, worldUpdate);
        player.newborn = false;
    }
    for (j = 0; j < this.worldapi.syncableBodies.length; j++) {
        this.worldapi.syncableBodies[j].newborn = false;
    }
};

var writeUpdateHeader = function (buf, wtime, rtime, removed) {
    buf.addUInt32(Math.floor(wtime*1000));
    buf.addUInt32(rtime);
    buf.addUInt16(removed.length);
    for (var i = 0; i < removed.length; i++) {
        buf.addUInt16(removed[i]);
    }
};

var writeBody = function (buf, body, forcefull) {
    buf.mark('bid', 2);        // Mark spot for body id
    buf.addFixed32(body.interpolatedPosition[0]);
    buf.addFixed32(body.interpolatedPosition[1]);
    buf.addFixed32(body.velocity[0]);
    buf.addFixed32(body.velocity[1]);
    buf.addFixed16(body.interpolatedAngle);
    buf.addFixed16(body.angularVelocity);
    // TODO: properties
    var update = body.getUpdateProperties(forcefull);
    for (var propname in update) {
        buf.addFieldValue(propname, update[propname]);
    }
    // yada yada
    if (forcefull || Object.keys(update).length) {
        buf.writeUInt16AtMark(body.id | (1 << 15), 'bid');         // Set high bit to indicate properties
    } else {
        buf.writeUInt16AtMark(body.id, 'bid');
    }
};