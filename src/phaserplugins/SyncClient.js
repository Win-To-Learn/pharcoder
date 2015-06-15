/**
 * SyncClient.js
 *
 * Sync physics objects with server
 */
'use strict';

var Starcoder = require('../Starcoder-client.js');
var Ship = require('../physicsobjects/phaser/Ship.js');

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
    this.sentQueue = [];
    this.newQueue = [];
    this.updates = [];
    this.extant = {};
    this.lastUpdate = 0;
};

var ship;           // Enormous testing hack

SyncClient.prototype.start = function () {
    var self = this;
    var starcoder = this.game.starcoder;
    // FIXME a lot
    //this.socket.on('new object', function (o) {
    //    console.log(o);
    //    ship = Starcoder.Ship.add(self.game, o.x, o.y, starcoder.player.username);
    //    ship.serverId = o.id;
    //    self.game.camera.follow(ship);
    //});
    this.socket.on('update', function (data) {
        var worldTime = data.w;
        if (!self.worldTime) {
            self.worldTime = worldTime;
        }
        for (var i = 0, l = data.b.length; i < l; i++) {
            var update = data.b[i];
            var id = update.id;
            var sprite;
            update.timestamp = worldTime
            if (sprite = self.extant[id]) {
                // Existing sprite - process update
                //console.log('Update', update);
                sprite.updateQueue.push(update);
                if (sprite.updateQueue.length > UPDATE_QUEUE_LIMIT) {
                    sprite.updateQueue.shift();
                }
            } else {
                // New sprite - create and configure
                //sprite = Ship.add(self.game, update.x, update.y, starcoder.player.username);
                sprite = starcoder.addObject(update);
                //self.game.camera.follow(sprite);
                sprite.serverId = id;
                self.extant[id] = sprite;
                console.log('New', update);
                sprite.updateQueue = [update];
            }
        }
    });
};

SyncClient.prototype.update = function () {
    this._sendCommands();
    this._processPhysicsUpdates();
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
var lastx =
/**
 * Handles interpolation / prediction resolution for physics bodies
 *
 * @private
 */
SyncClient.prototype._processPhysicsUpdates = function () {
    if (this.worldTime) {
        this.worldTime += this.game.starcoder.config.frameRate;
    }
    var interpTime = this.worldTime -
        this.game.starcoder.config.renderLatency/1000;
    var oids = Object.keys(this.extant);
    for (var i = oids.length - 1; i >= 0; i--) {
        var sprite = this.extant[oids[i]];
        var queue = sprite.updateQueue;
        var before = null, after = null;

        //var temp = [];
        //for (var k = 0; k<queue.length; k++) {
        //    temp.push(queue[k].timestamp)
        //}
        //console.log(interpTime, '<>', temp);

        //for (var j = queue.length - 2; j >= 0; j--) {
        //    if (queue[j].timestamp < interpTime) {
        //        before = queue[j];
        //        after = queue[j+1];
        //        break;
        //    }
        //}
        //if (!before) {
        //    // Nothing to interpolate - Do nothing?
        //    break;
        //}

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
            } else {                    // No? Just bail
                break;
            }
        } else {
            queue.splice(0, j - 1);     // Throw out older updates
        }

        //console.log('[-]', j, before.timestamp, interpTime, after.timestamp);
        var span = after.timestamp - before.timestamp;
        var t = (interpTime - before.timestamp) / span;
        sprite.body.data.position[0] = -hermite(before.x, after.x, before.vx*span, after.vx*span, t);
        sprite.body.data.position[1] = -hermite(before.y, after.y, before.vy*span, after.vy*span, t);
        //sprite.body.data.angle = hermite(before.a, after.a, before.av, after.av, t);
        //sprite.body.data.position[0] = -linear(before.x, after.x, t);
        //sprite.body.data.position[1] = -linear(before.y, after.y, t);
        sprite.body.data.angle = linear(before.a, after.a, t);
        console.log('[x]', t, '|', before.x, -sprite.body.data.position[0], after.x);
        console.log('X', sprite.body.data.position[0], sprite.body.x);
        console.log('Y', sprite.body.data.position[1], sprite.body.y);
        this.game.starcoder.tempsprite = sprite;
    }
};

// Helpers

// FIXME, maybe
function hermite (p0, p1, v0, v1, t) {
    var t2 = t*t;
    var t3 = t*t2;
    return (2*t3 - 3*t2 + 1)*p0 + (t3 - 2*t2 + t)*v0 + (-2*t3 + 3*t2)*p1 + (t3 - t2)*v1;
}

function linear (p0, p1, t) {
    return p0 + (p1 - p0)*t;
}

Starcoder.ServerSync = SyncClient;
module.exports = SyncClient;