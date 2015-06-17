/**
 * Asteroid.js
 *
 * Server side implementation
 */
'use string';

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

//var Starcoder = require('../../Starcoder-server.js');

//var shared = require('../shared/Asteroid.js');

var Asteroid = function (options) {
    SyncBodyBase.call(this, options);
    this.damping = 0;
    this.angularDamping = 0;
};

Asteroid.prototype = Object.create(SyncBodyBase.prototype);
Asteroid.prototype.constructor = Asteroid;

Asteroid.prototype.sctype = 'Asteroid';

//Starcoder.mixinPrototype(Asteroid.prototype, shared.prototype);

Asteroid.prototype._shape = [
    [2,1],
    [1,2],
    [-1,2],
    [-2,1],
    [-2,-1],
    [-1,-2],
    [1,-2],
    [2,-1]
];

module.exports = Asteroid;
