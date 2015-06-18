/**
 * Ship.js
 *
 * Server side implementation of ship in 'pure' P2
 */
'use strict';

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');
var Bullet = require('./Bullet.js');

var Ship = function (config) {
    SyncBodyBase.call(this, config);
    this.damping = 0.99;
    this.angularDamping = 0.99;
    this.state = {
        turn: 0,
        thrust: 0,
        firing: false
    }
    this._lastShot = 0;
};

Ship.prototype = Object.create(SyncBodyBase.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.sctype = 'Ship';

// Default properties

Ship.prototype.updateProperties = ['fillColor', 'lineColor', 'fillAlpha', 'shapeClosed', 'shape', 'lineWidth',
    'vectorScale', 'playerid'];

Ship.prototype.shape = [
    [-1,-1],
    [-0.5,0],
    [-1,1],
    [0,0.5],
    [1,1],
    [0.5,0],
    [1,-1],
    [0,-0.5]
];

Ship.prototype.lineWidth = 6;

//Ship.prototype.preProcessOptions = function (options) {
//    options.mass = options.mass || 10;
//    //options.velocity = [0, 0];
//    //options.position = [5, 5];
//    //options.angularVelocity = 2.5;
//};

Ship.prototype.getPropertyUpdate = function (propname, properties) {
    switch (propname) {
        case 'playerid':
            properties.playerid = this.player.id;
            break;
        default:
            SyncBodyBase.prototype.getPropertyUpdate.call(this, propname, properties);
    }
};

Ship.prototype.update = function () {
    // TODO: Speed limits?
    this.angularForce = 50*this.state.turn;
    this.setPolarForce(500*this.state.thrust);
    if (this.state.firing && ((this.world.time - this._lastShot) > 1)) {
        var bullet = this.world.addSyncableBody(Bullet, {});
        var c = Math.cos(this.angle);
        var s = Math.sin(this.angle);
        bullet.position[0] = this.position[0];
        bullet.position[1] = this.position[1];
        bullet.velocity[0] = 20*s;
        bullet.velocity[1] = -20*c;
        bullet.tod = this.world.time + 1;       // FIXME
        this._lastShot = this.world.time;
    }
};

module.exports = Ship;
