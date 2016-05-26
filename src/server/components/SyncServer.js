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
    //var wtime = this.worldapi.getWorldTime();
    var rtime = this.hrtime();
    var removed = this.worldapi.removedBodies.slice();
    var nBodies = this.worldapi.syncableBodies.length;
    this.worldapi.removedBodies.length = 0;
    //var worldUpdate = {w: wtime, r: rtime, b: [], rm: removed};
    this.msgBufOut.reset();
    //this.msgBufOut.mark('start');
    //this.msgBufOut.skip(4);         // Total length of update goes in position 1
    writeUpdateHeader(this.msgBufOut, rtime, removed, nBodies);
    //console.log(this.msgBufOut.len, 'H', this.msgBufOut.buffer.slice(0,14));
    this.msgBufOut.mark('bodystart');
    // First send minimal updates to all existing players
    for (var i = 0; i < this.playerList.length; i++) {
        var player = this.playerList[i];
        if (player.newborn) {
            newplayers.push(player);
            continue;
        }
        if (!bufReady) {
            for (var j = 0; j < nBodies; j++) {
                var body = this.worldapi.syncableBodies[j];
                //worldUpdate.b.push(body.getUpdatePacket(body.newborn));
                writeBody(this.msgBufOut, body);
                //body.newborn = false;
            }
            //this.msgBufOut.writeUInt32AtMark(this.msgBufOut.len, 'start');
            bufReady = true;
        }
        this.doPlayerUpdate(player);
        //this.sendPlayerUpdate(player, worldUpdate);
    }
    // Then send full updates to new players
    bufReady = false;
    //worldUpdate = {w: wtime, r: rtime, b: [], rm: removed};
    this.msgBufOut.rewindToMark('bodystart');
    for (i = 0; i < newplayers.length; i++) {
        player = newplayers[i];
        if (!bufReady) {
            for (j = 0; j < nBodies; j++) {
                body = this.worldapi.syncableBodies[j];
                //worldUpdate.b.push(body.getUpdatePacket(true));
                writeBody(this.msgBufOut, body, true);
            }
            //this.msgBufOut.writeUInt32AtMark(this.msgBufOut.len, 'start');
            bufReady = true;
        }
        this.doPlayerUpdate(player);
        //this.sendPlayerUpdate(player, worldUpdate);
        player.newborn = false;
    }
    // Clear dirty properties on all objects
    for (j = 0; j < nBodies; j++) {
        if (this.worldapi.syncableBodies[j]) {      // FIXME: Probably shouldn't need this
            this.worldapi.syncableBodies[j].clean();
        }
    }
};

var writeUpdateHeader = function (buf, rtime, removed, nbodies) {
    //buf.addUInt32(Math.floor(wtime*1000));
    buf.addUInt32(rtime);
    buf.addUInt16(removed.length);
    for (var i = 0; i < removed.length; i++) {
        buf.addUInt16(removed[i]);
    }
    buf.addUInt16(nbodies);
};

var writeBody = function (buf, body, forcefull) {
    //buf.mark('bid', 2);        // Mark spot for body id
    buf.addUInt16(body.id);
    buf.addFixed32(body.interpolatedPosition[0]);
    buf.addFixed32(body.interpolatedPosition[1]);
    // Not using velocities so save the bytes
    //buf.addFixed32(body.velocity[0]);
    //buf.addFixed32(body.velocity[1]);
    buf.addFixed16(body.interpolatedAngle);
    //buf.addFixed16(body.angularVelocity);
    var update = body.getUpdateProperties(forcefull);
    var keys = Object.keys(update);
    buf.addUInt16(keys.length);         // Number of fields
    for (var i = 0; i < keys.length; i++) {
        buf.addFieldValue(keys[i], update[keys[i]]);
    }
    //if (forcefull || keys.length) {
    //    buf.writeUInt16AtMark(body.id | (1 << 15), 'bid');         // Set high bit to indicate properties
    //} else {
    //    buf.writeUInt16AtMark(body.id, 'bid');
    //}
};