/**
 * Asteroid.js
 */
'use strict';

//var Starcoder = require('../../Starcoder-client.js');
var VectorSprite = require('./VectorSprite.js');

var shared = require('../shared/Asteroid.js');

var Asteroid = function (game, x, y) {
    VectorSprite.call(this, game, x, y);
    this.body.damping = 0;
};

Asteroid.add = function (game, x, y) {
    var a = new Asteroid(game, x, y);
    game.add.existing(a);
    return a;
};

Asteroid.prototype = Object.create(VectorSprite.prototype);
Asteroid.prototype.constructor = Asteroid;

//Starcoder.mixinPrototype(Asteroid.prototype, shared.prototype);

//Asteroid.prototype.lineColor = '#ff00ff';
//Asteroid.prototype.fillColor = '#00ff00';
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
