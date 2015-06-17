/**
 * Starcoder-client.js
 *
 * Starcoder master object extended with client only properties and methods
 */
'use strict';

var Starcoder = require('./Starcoder.js');

Starcoder.VectorSprite = require('./physicsobjects/phaser/VectorSprite.js');
Starcoder.Ship = require('./physicsobjects/phaser/Ship.js');
Starcoder.Asteroid = require('./physicsobjects/phaser/Asteroid.js');
Starcoder.Crystal = require('./physicsobjects/phaser/Crystal.js');
Starcoder.SimpleParticle = require('./physicsobjects/phaser/SimpleParticle.js');


var states = {
    boot: require('./phaserstates/Boot.js'),
    space: require('./phaserstates/Space.js')
};

var objectMap = {};
for (var k in Starcoder) {
    if (Starcoder[k].prototype instanceof Starcoder.VectorSprite) {
        objectMap[k] = Starcoder[k];
    }
}

Starcoder.prototype.init = function () {
    this.io = io;
    this.game = new Phaser.Game(1600, 600, Phaser.AUTO, '');
    //this.game = new Phaser.Game(1600, 600, Phaser.CANVAS, '');
    //this.game.forceSingleUpdate = true;
    this.game.starcoder = this;
    for (var k in states) {
        var state = states[k]()
        state.starcoder = this;
        this.game.state.add(k, state);
    }
    this.cmdQueue = [];
};

Starcoder.prototype.start = function () {
    this.game.state.start('boot');
};

Starcoder.prototype.addObject = function (options) {
    console.log('O', options);
    var ctor = objectMap[options.t];
    return ctor.add(this.game, options.x, options.y, "foo");
};

//Starcoder.prototype.initNet = function () {
//    //this.io = io;
//    //this.socket = io(SERVER_URI);
//};

Starcoder.prototype.role = 'client';

Starcoder.States = {};

module.exports = Starcoder;
