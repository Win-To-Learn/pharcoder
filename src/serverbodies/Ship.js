/**
 * Ship.js
 *
 * Server side implementation of ship in 'pure' P2
 */
'use strict';

var p2 = require('p2');

var Starcoder = require('../Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase.js');
var UpdateProperties = require('../common/UpdateProperties.js').Ship;

var Bullet = require('./Bullet.js');

var Ship = function (config) {
    SyncBodyBase.call(this, config);
    this.damping = 0.99;
    this.angularDamping = 0.99;
    this.state = {
        turn: 0,
        thrust: 0,
        firing: false
    };
    this.seederProperties = {             // defaults for new trees
        depth: 5,
        branchFactor: 4,
        branchDecay: 0.75,
        spread: 90,
        trunkLength: 2
    };
    // Engine
    this.thrustForce = 500;
    this.turningForce = 50;
    // Weapons system
    this.bulletSalvoSize = 1;
    this.bulletVelocity = 15;
    this.bulletRange = 25;
    this.bulletSpread = 0;
    this._lastShot = 0;
    // Inventory
    this._crystals = 0;
};

Ship.prototype = Object.create(SyncBodyBase.prototype);
Ship.prototype.constructor = Ship;

Starcoder.mixinPrototype(Ship.prototype, UpdateProperties.prototype);

Ship.prototype.clientType = 'Ship';
Ship.prototype.serverType = 'Ship';

// Default properties

//Ship.prototype.updateProperties = ['fillColor', 'lineColor', 'fillAlpha', 'shapeClosed', 'shape', 'lineWidth',
//    'vectorScale', 'playerid'];
Ship.prototype.defaults = {mass: 10, vectorScale: 1, lineWidth: 6};

Ship.prototype._shape = [
    [-1,-1],
    [-0.5,0],
    [-1,1],
    [0,0.5],
    [1,1],
    [0.5,0],
    [1,-1],
    [0,-0.5]
];
Ship.prototype._shapeClosed = true;

//Ship.prototype.lineWidth = 6;

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
    this.angularForce = this.turningForce*this.state.turn;
    this.setPolarForce(this.thrustForce*this.state.thrust);
    if (this.state.firing && ((this.world.time - this._lastShot) > 1)) {
        // FIXME: Probably a better way to do this
        if (this.state.oneshot) {
            this.state.oneshot = false;
            this.state.firing = false;
        }
        var tod = this.world.time + this.bulletRange / this.bulletVelocity;
        if (this.bulletSpread === 0 || this.bulletSalvoSize === 1) {
            var n = 1;
            var aDel = 0;
            var aStart = this.angle;
        } else {
            n = this.bulletSalvoSize;
            aDel = this.bulletSpread * Math.PI / (180 * (n - 1));
            aStart = this.angle - 0.5 * this.bulletSpread * Math.PI / 180;
        }
        for (var i = 0, a = aStart; i < n; i++, a += aDel) {
            var bullet = this.world.addSyncableBody(Bullet, {});
            bullet.firer = this;
            bullet.position[0] = this.position[0];
            bullet.position[1] = this.position[1];
            bullet.velocity[0] = this.bulletVelocity * Math.sin(a);
            bullet.velocity[1] = -this.bulletVelocity * Math.cos(a);
            bullet.tod = tod;
        }
        this._lastShot = this.world.time;
    }
};

Ship.prototype.knockOut = function () {
    var self = this;
    this.dead = true;
    setTimeout(function () {
        self.world.respawn(self, {position: {random: 'world'}});
    }, 1000);
};

Object.defineProperty(Ship.prototype, 'crystals', {
    get: function () {
        return this._crystals;
    },
    set: function (val) {
        this._crystals = val;
        this._dirtyProperties.crystals = true;
    }
});

module.exports = Ship;
