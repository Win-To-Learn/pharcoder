/**
 * Asteroid.js
 *
 * Shared client/server code
 */
'use strict';

var Asteroid = function () {};

Asteroid.prototype.shape = [
    [2,1],
    [1,2],
    [-1,2],
    [-2,1],
    [-2,-1],
    [-1,-2],
    [1,-2],
    [2,-1]
];
Asteroid.prototype.shapeClosed = true;
Asteroid.prototype.lineWidth = 1;
Asteroid.prototype.lineColor = '#ff00ff';
Asteroid.prototype.fillColor = null;
Asteroid.prototype.fillAlpha = 0.25;

module.exports = Asteroid;
