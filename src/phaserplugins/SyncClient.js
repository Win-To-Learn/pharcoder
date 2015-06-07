/**
 * SyncClient.js
 *
 * Sync physics objects with server
 */
'use strict';

var Starcoder = require('../Starcoder-client.js');
var Ship = require('../physicsobjects/phaser/Ship.js');

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
        var realTime = self.game.time.now;
        var interpTime = realTime - starcoder.config.renderLatency;
        for (var i = 0, l = data.b.length; i < l; i++) {
            var update = data.b[i];
            var id = update.id;
            var sprite;
            update.timestamp = realTime;
            if (sprite = self.extant[id]) {
                // Existing sprite - process update
                console.log('Update', update);
            } else {
                // New sprite - create and configure
                sprite = Ship.add(self.game, update.x, update.y, starcoder.player.username);
                self.game.camera.follow(sprite);
                sprite.serverId = id;
                self.extant[id] = sprite;
                console.log('New', update);
                //sprite.updateQueue = [update];
            }
        }
    });
};

/**
 * update sends queued commands that have been executed to the server
 */
SyncClient.prototype.update = function () {
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

// Helpers

function hermite (x0, x1, v0, v1, t) {
    var t2 = t*t;
    var t3 = t*t2;
    return (2*t3 -3*t2+1)*x0 + (t3-2*t2+t)*v0 + (-2*t3+3*t2)*x1 + (t3 - t2)*v1;
}

Starcoder.ServerSync = SyncClient;
module.exports = SyncClient;