/**
 * SyncClient.js
 *
 * Sync physics objects with server
 */
'use strict';

var Starcoder = require('../Starcoder-client.js');
var UPDATE_QUEUE_LIMIT = 8;

var SyncClient = function (game, parent) {
    Phaser.Plugin.call(this, game, parent);
};

SyncClient.prototype = Object.create(Phaser.Plugin.prototype);
SyncClient.prototype.constructor = SyncClient;

SyncClient.prototype.init = function (socket, queue) {
    // TODO: Copy some config options
    this.socket = socket;
    this.cmdQueue = queue;
    this.extant = {};
};

SyncClient.prototype.start = function () {
    var self = this;
    var starcoder = this.game.starcoder;
    this._updateComplete = false;
    // FIXME: Need more robust handling of DC/RC
    this.socket.on('disconnect', function () {
        self.game.paused = true;
    });
    this.socket.on('reconnect', function () {
        this.game.paused = false;
    });
    // Measure client-server time delta
    this.socket.on('timesync', function (data) {
        self._latency = data - self.game.time.now;
    });
    this.socket.on('update', function (data) {
        var realTime = data.r;
        for (var i = 0, l = data.b.length; i < l; i++) {
            var update = data.b[i];
            var id = update.id;
            var sprite;
            update.timestamp = realTime;
            if (sprite = self.extant[id]) {
                // Existing sprite - process update
                sprite.updateQueue.push(update);
                if (sprite.updateQueue.length > UPDATE_QUEUE_LIMIT) {
                    sprite.updateQueue.shift();
                }
            } else {
                // New sprite - create and configure
                sprite = starcoder.addBody(update.t, update);
                sprite.serverId = id;
                self.extant[id] = sprite;
                sprite.updateQueue = [update];
            }
        }
        for (i = 0, l = data.rm.length; i < l; i++) {
            id = data.rm[i];
            if (self.extant[id]) {
                starcoder.removeBody(self.extant[id]);
                delete self.extant[id];
            }
        }
    });
};

SyncClient.prototype.update = function () {
    if (true || !this._updateComplete) {
        this._sendCommands();
        this._processPhysicsUpdates();
        this._updateComplete = true;
    }
 };

SyncClient.prototype.postRender = function () {
    this._updateComplete = false;
};

/**
 * Send queued commands that have been executed to the server
 *
 * @private
 */
SyncClient.prototype._sendCommands = function () {
    var actions = [];
    for (var i = this.cmdQueue.length-1; i >= 0; i--) {
        var action = this.cmdQueue[i];
        if (action.executed) {
            actions.push(action);
            this.cmdQueue.splice(i, 1);
        }
    }
    if (actions.length) {
        this.socket.emit('do', actions);
        console.log('sending actions', actions);
    }
};

/**
 * Handles interpolation / prediction resolution for physics bodies
 *
 * @private
 */
SyncClient.prototype._processPhysicsUpdates = function () {
    var interpTime = this.game.time.now + this._latency - this.game.starcoder.config.renderLatency;
    var oids = Object.keys(this.extant);
    for (var i = oids.length - 1; i >= 0; i--) {
        var sprite = this.extant[oids[i]];
        var queue = sprite.updateQueue;
        var before = null, after = null;

        //var temp = [];
        //var lastx = queue[0].x || 0;
        //for (var k = 1; k<queue.length; k++) {
        //    temp.push(queue[k].x-lastx);
        //    lastx = queue[k].x;
        //}
        //console.log(interpTime, '<>', temp);

        // Find updates before and after interpTime
        var j = 1;
        while (queue[j]) {
            if (queue[j].timestamp > interpTime) {
                after = queue[j];
                before = queue[j-1];
                break;
            }
            j++;
        }

        // None - we're behind.
        if (!before && !after) {
            if (queue.length >= 2) {    // Two most recent updates available? Use them.
                before = queue[queue.length - 2];
                after = queue[queue.length - 1];
                console.log('Lagging', oids[i]);
            } else {                    // No? Just bail
                console.log('Bailing', oids[i]);
                break;
            }
        } else {
            //console.log('Ok', interpTime, queue.length);
            queue.splice(0, j - 1);     // Throw out older updates
        }

        var span = after.timestamp - before.timestamp;
        var t = (interpTime - before.timestamp) / span;
        //var oldx = sprite.body.data.position[0];
        //var scale = 0.05 / (after.wtimestamp - before.wtimestamp);
        //sprite.body.data.position[0] = -hermite(before.x, after.x, before.vx*span, after.vx*span, t);
        //sprite.body.data.position[1] = -hermite(before.y, after.y, before.vy*span, after.vy*span, t);
        //sprite.body.data.angle = hermite(before.a, after.a, before.av, after.av, t);
        sprite.setPosAngle(linear(before.x, after.x, t), linear(before.y, after.y, t), linear(before.a, after.a, t));
        //sprite.body.data.position[0] = -linear(before.x, after.x, t);
        //sprite.body.data.position[1] = -linear(before.y, after.y, t);
        //sprite.body.data.angle = linear(before.a, after.a, t);
        //sprite.body.data.position[0] -= 0.10;
        //sprite.body.data.position[1] = -5;
        //console.log('[t]', before.timestamp, interpTime, after.timestamp, '-', after.timestamp - before.timestamp);
        //console.log('[w]', before.wtimestamp, '*****', after.wtimestamp, '-', after.wtimestamp - before.wtimestamp);
        //console.log('[x]', before.x, -sprite.body.data.position[0], after.x);
        //var dx = sprite.body.data.position[0] - oldx, dt = this.game.time.now - this.lastUpdate;
        //console.log('Delta>', dx, '/', dt, '=', dx/dt);

    }
};

// Helpers

// FIXME, maybe
function hermite (p0, p1, v0, v1, t) {
    var t2 = t*t;
    var t3 = t*t2;
    return (2*t3 - 3*t2 + 1)*p0 + (t3 - 2*t2 + t)*v0 + (-2*t3 + 3*t2)*p1 + (t3 - t2)*v1;
}

function linear (p0, p1, t, scale) {
    scale = scale || 1;
    return p0 + (p1 - p0)*t*scale;
}

Starcoder.ServerSync = SyncClient;
module.exports = SyncClient;