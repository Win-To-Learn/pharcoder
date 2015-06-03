/**
 * Starcoder-client.js
 *
 * Starcoder master object extended with client only properties and methods
 */
'use strict';

var Starcoder = require('./Starcoder.js');
var states = {
    boot: require('./phaserstates/Boot.js')(),
    space: require('./phaserstates/Space.js')()
};

Starcoder.prototype.init = function () {
    this.io = io;
    this.game = new Phaser.Game(800, 600, Phaser.AUTO, '');
    this.game.starcoder = this;
    for (var k in states) {
        states[k].starcoder = this;
        this.game.state.add(k, states[k]);
    }
    this.cmdQueue = [];
};

Starcoder.prototype.start = function () {
    this.game.state.start('boot');
};

//Starcoder.prototype.initNet = function () {
//    //this.io = io;
//    //this.socket = io(SERVER_URI);
//};

Starcoder.prototype.role = 'client';

Starcoder.States = {};

module.exports = Starcoder;
