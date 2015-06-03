/**
 * ServerSync.js
 *
 * Sync physics objects with server
 */
'use strict';

var ServerSync = function (game, parent) {
    Phaser.Plugin.call(this, game, parent);
};

ServerSync.prototype = Object.create(Phaser.Plugin.prototype);
ServerSync.prototype.constructor = ServerSync;

ServerSync.prototype.init = function (socket, queue) {
    // TODO: Copy some config options
    this.socket = socket;
    this.cmdQueue = queue;
    this.sentQueue = [];
};

/**
 * update sends queued commands that have been executed to the server
 */
ServerSync.prototype.update = function () {
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

module.exports = ServerSync;