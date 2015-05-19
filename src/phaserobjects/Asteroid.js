/**
 * Asteroid.js
 */
'use strict';

var Starcoder = require('../Starcoder.js');
require('./VectorSprite.js');

var Asteroid = function (game, x, y) {
    Starcoder.VectorSprite.call(this, game, x, y);
};

Asteroid.add = function (game, x, y) {
    var a = new Asteroid(game, x, y);
    game.add.existing(a);
    return a;
};

Asteroid.prototype = Object.create(Starcoder.VectorSprite.prototype);
Asteroid.prototype.constructor = Starcoder.VectorSprite;

Asteroid.prototype.color = '#ff00ff';
Asteroid.prototype.shape = [
    [2,1],
    [1,2],
    [-1,2],
    [-2,1],
    [-2,-1],
    [-1,-2],
    [1,-2],
    [2,-1],
    [2,1]
];

module.exports = Asteroid;
Starcoder.Asteroid = Asteroid;
