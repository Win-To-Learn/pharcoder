/**
 * Asteroid.js
 */
'use strict';

var Starcoder = require('../../Starcoder-client.js');
require('./VectorSprite.js');

var Crystal = function (game, x, y) {
    Starcoder.VectorSprite.call(this, game, x, y);
    this.body.damping = 0;
};

Crystal.add = function (game, x, y) {
    var a = new Crystal(game, x, y);
    game.add.existing(a);
    return a;
};

Crystal.prototype = Object.create(Starcoder.VectorSprite.prototype);
Crystal.prototype.constructor = Crystal;

Crystal.prototype.lineColor = '#00ffff';
Crystal.prototype.geometry = [
    {type: 'poly', closed: true, points: [
        [-1,-2],
        [-1,2],
        [2,-1],
        [-2,-1],
        [1,2],
        [1,-2],
        [-2,1],
        [2,1]]}
];

module.exports = Crystal;
Starcoder.Crystal = Crystal;
