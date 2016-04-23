/**
 * Asteroid.js
 *
 * Client side
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');

var Asteroid = function (game, config) {
    VectorSprite.call(this, game, config);
    //this.setPosAngle(config.x, config.y, config.a);
    //this.body.damping = 0;
};

Asteroid.add = function (game, options) {
    var a = new Asteroid(game, options);
    game.add.existing(a);
    return a;
};

Asteroid.prototype = Object.create(VectorSprite.prototype);
Asteroid.prototype.constructor = Asteroid;

Starcoder.mixinPrototype(Asteroid.prototype, SyncBodyInterface.prototype);

module.exports = Asteroid;
//Starcoder.Asteroid = Asteroid;
