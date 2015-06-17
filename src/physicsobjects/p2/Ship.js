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
    this.damping = 0.9;
    this.angularDamping = 0.9;
    this.state = {
        turn: 0,
        thrust: 0,
        firing: false
    }
};

Ship.prototype = Object.create(SyncBodyBase.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.sctype = 'Ship';

// Default properties

Ship.prototype.updateProperties = ['playerid'];

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
    options.velocity = [0, 0];
    options.position = [5, 5];
    //options.angularVelocity = 2.5;
};

Ship.prototype.getPropertyUpdate = function (propname, properties) {
    switch (propname) {
        case 'playerid':
            properties.playerid = this.player.id;
    }
};

Ship.prototype.update = function () {
    // TODO: Speed limits?
    this.angularForce = 50*this.state.turn;
    this.setPolarForce(500*this.state.thrust);
    // TODO: Bullets, etc.
};

module.exports = Ship;
