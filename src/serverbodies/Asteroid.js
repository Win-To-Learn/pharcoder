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

Asteroid.prototype.lineColor = '#ff00ff';
Asteroid.prototype.fillColor = '#00ff00';
Asteroid.prototype.shapeClosed = true;
Asteroid.prototype.lineWidth = 1;
Asteroid.prototype.fillAlpha = 0.25;
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

Asteroid.prototype.updateProperties = ['fillColor', 'lineColor', 'fillAlpha', 'shapeClosed', 'shape', 'lineWidth'];

//Asteroid.prototype.getPropertyUpdate = function (propname, properties) {
//    switch (propname) {
//        default:
//            SyncBodyBase.prototype.getPropertyUpdate.call(this, propname, properties);
//    }
//};


module.exports = Asteroid;
