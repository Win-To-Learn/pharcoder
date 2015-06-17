/**
 * Asteroid.js
 */
'use strict';

//var Starcoder = require('../../Starcoder-client.js');
var VectorSprite = require('./VectorSprite.js');

var Crystal = function (game, config) {
    VectorSprite.call(this, game, config);
    this.body.damping = 0;
};

Crystal.add = function (game, config) {
    var a = new Crystal(game, config);
    game.add.existing(a);
    return a;
};

Crystal.prototype = Object.create(VectorSprite.prototype);
Crystal.prototype.constructor = Crystal;

//Crystal.prototype.lineColor = '#00ffff';
//Crystal.prototype.geometry = [
//    {type: 'poly', closed: true, points: [
//        [-1,-2],
//        [-1,2],
//        [2,-1],
//        [-2,-1],
//        [1,2],
//        [1,-2],
//        [-2,1],
//        [2,1]]}
//];

module.exports = Crystal;
//Starcoder.Crystal = Crystal;
