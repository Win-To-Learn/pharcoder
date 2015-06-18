/**
 * Asteroid.js
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var PhysicsInterface = require('./PhysicsInterface.js');

var Asteroid = function (game, config) {
    VectorSprite.call(this, game, config);
    this.setPosAngle(config.x, config.y, config.a);
    //this.body.damping = 0;
};

Asteroid.add = function (game, options) {
    var a = new Asteroid(game, options);
    game.add.existing(a);
    return a;
};

Asteroid.prototype = Object.create(VectorSprite.prototype);
Asteroid.prototype.constructor = Asteroid;

Starcoder.mixinPrototype(Asteroid.prototype, PhysicsInterface.prototype);

//Starcoder.mixinPrototype(Asteroid.prototype, shared.prototype);

//Asteroid.prototype.lineColor = '#ff00ff';
//Asteroid.prototype.fillColor = '#00ff00';
//Asteroid.prototype.shapeClosed = true;
//Asteroid.prototype.lineWidth = 1;
//Asteroid.prototype.fillAlpha = 0.25;
//Asteroid.prototype.shape = [
//    [2,1],
//    [1,2],
//    [-1,2],
//    [-2,1],
//    [-2,-1],
//    [-1,-2],
//    [1,-2],
//    [2,-1],
//    [2,1]
//];

module.exports = Asteroid;
//Starcoder.Asteroid = Asteroid;
