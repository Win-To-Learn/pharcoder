/**
 * Controls.js
 *
 * Virtualize and implement queue for game controls
 */
'use strict';

//var Starcoder = require('../Starcoder-client.js');

var Controls = function (game, parent) {
    Phaser.Plugin.call(this, game, parent);
};

Controls.prototype = Object.create(Phaser.Plugin.prototype);
Controls.prototype.constructor = Controls;

Controls.prototype.init = function (queue) {
    this.queue = queue;
    this.controls = this.game.input.keyboard.createCursorKeys();
};

var seq = 0;
var up = false, down = false, left = false, right = false;

Controls.prototype.reset = function () {
    up = down = left = right = false;
    this.queue.length = 0;
};

Controls.prototype.preUpdate = function () {
    // TODO: Support other interactions/methods
    var controls = this.controls;
    if (controls.up.isDown && !up) {
        up = true;
        this.queue.push({action: 'up_pressed', executed: false, seq: seq++});
    }
    if (!controls.up.isDown && up) {
        up = false;
        this.queue.push({action: 'up_released', executed: false, seq: seq++});
    }
    if (controls.down.isDown && !down) {
        down = true;
        this.queue.push({action: 'down_pressed', executed: false, seq: seq++});
    }
    if (!controls.down.isDown && down) {
        down = false;
        this.queue.push({action: 'down_released', executed: false, seq: seq++});
    }
    if (controls.right.isDown && !right) {
        right = true;
        this.queue.push({action: 'right_pressed', executed: false, seq: seq++});
    }
    if (!controls.right.isDown && right) {
        right = false;
        this.queue.push({action: 'right_released', executed: false, seq: seq++});
    }
    if (controls.left.isDown && !left) {
        left = true;
        this.queue.push({action: 'left_pressed', executed: false, seq: seq++});
    }
    if (!controls.left.isDown && left) {
        left = false;
        this.queue.push({action: 'left_released', executed: false, seq: seq++});
    }
};

Controls.prototype.processQueue = function (cb, clear) {
    var queue = this.queue;
    for (var i = 0, l = queue.length; i < l; i++) {
        var action = queue[i];
        if (action.executed) {
            continue;
        }
        cb(action);
        action.etime = this.game.time.now;
        action.executed = true;
    }
    if (clear) {
        queue.length = 0;
    }
};

//Starcoder.Controls = Controls;
module.exports = Controls;