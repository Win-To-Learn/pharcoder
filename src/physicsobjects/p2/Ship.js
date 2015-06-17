/**
 * Ship.js
 *
 * Server side implementation of ship in 'pure' P2
 */
'use strict';

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

var Ship = function (options) {
    SyncBodyBase.call(this, options);
    this.damping = 0;
};

Ship.prototype = Object.create(SyncBodyBase.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.sctype = 'Ship';

// Default properties

Ship.prototype._shape = [
    [-1,-1],
    [-0.5,0],
    [-1,1],
    [0,0.5],
    [1,1],
    [0.5,0],
    [1,-1],
    [0,-0.5],
    [-1,-1]
];
Ship.prototype._lineWidth = 6;

Ship.prototype.preProcessOptions = function (options) {
    options.mass = options.mass || 10;
    options.velocity = [5,0];
    options.position = [0, 5];
    //options.angularVelocity = 2.5;
};



module.exports = Ship;
