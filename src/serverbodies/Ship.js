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
var TractorBeam = require('./TractorBeam.js');

var Ship = function (config) {
    SyncBodyBase.call(this, config);
    this.damping = 0.85;
    this.angularDamping = 0.85;
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
    this.thrustForce = 750;
    this.turningForce = 50;
    // Weapons system
    this.bulletSalvoSize = 1;
    this.bulletVelocity = 50;
    this.bulletRange = 40;
    this.bulletSpread = 0;
    this._lastShot = 0;
    // Inventory
    this._crystals = 0;
    //this._crystals = 150;
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

Ship.prototype.onWorldRemove = function () {
    if (this.beamChild) {
        this.beamChild.cancel(true);
    }
};

Ship.prototype.update = function () {
    this.angularForce = this.turningForce*this.state.turn;
    this.setPolarForce(this.thrustForce*this.state.thrust);
    if (this.state.firing && ((this.world.time - this._lastShot) > 1)) {
        this.shoot();
    }
    if (this.state.tractorFiring) {
        this.state.tractorFiring = false;
        this.toggleTractorBeam();
    }
};

Ship.prototype.toggleTractorBeam = function () {
    // FIXME: magic numbers
    if (!this.beamChild) {
        var dir = this.angle + Math.PI;
        this.beamChild = this.world.addSyncableBody(TractorBeam, {
            x: this.position[0],
            y: this.position[1],
            vx: 25 * Math.sin(dir),
            vy: -25 * Math.cos(dir),
            direction: dir,
            gen: 10,
            timer: this.world.time + 1 / 25,
            beamParent: this
        });
    } else {
        this.beamChild.cancel();
        delete this.beamChild;
    }
};

Ship.prototype.shoot = function () {
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
        var bullet = this.world.addSyncableBody(Bullet, {lineColor: this.lineColor});
        bullet.firer = this;
        bullet.position[0] = this.position[0];
        bullet.position[1] = this.position[1];
        bullet.velocity[0] = this.bulletVelocity * Math.sin(a);
        bullet.velocity[1] = -this.bulletVelocity * Math.cos(a);
        bullet.angle = a;
        bullet.tod = tod;
    }
    this._lastShot = this.world.time;
    this.world.starcoder.send(this.player, 'laser');
};

Ship.prototype.knockOut = function () {
    //var self = this;
    this.dead = true;
    if (this.beamChild) {
        this.beamChild.cancel(true);
    }
    //setTimeout(function () {
    //    self.world.respawn(self, {position: {random: 'world'}});
    //}, 1000);
    this.setTimer(1, {fun: this.world.respawn.bind(this.world, this, {position: {random: 'world'}})});
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

Object.defineProperty(Ship.prototype, 'tag', {
    get: function () {
        return this._tag;
    },
    set: function (val) {
        this._tag = val;
        this._dirtyProperties.tag = true;
    }
});

module.exports = Ship;
