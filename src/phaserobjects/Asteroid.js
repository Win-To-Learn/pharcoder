/**
 * Asteroid.js
 */
'use strict';

var Starcoder = require('../Starcoder.js');
require('./VectorSprite.js');

var Asteroid = function (game, x, y) {
    Starcoder.VectorSprite.call(this, game, x, y);
    this.body.damping = 0;
};

Asteroid.add = function (game, x, y) {
    var a = new Asteroid(game, x, y);
    game.add.existing(a);
    return a;
};

Asteroid.prototype = Object.create(Starcoder.VectorSprite.prototype);
Asteroid.prototype.constructor = Asteroid;

Asteroid.prototype.lineColor = '#ff00ff';
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
Starcoder.Asteroid = Asteroid;
