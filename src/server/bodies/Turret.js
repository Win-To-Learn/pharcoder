/**
 * Turret.js
 *
 * Server side implementation of turret in 'pure' P2
 */
'use strict';

var p2 = require('p2');

var SyncBodyBase = require('./SyncBodyBase.js');

var Bullet = require('./Bullet.js');
var TractorBeam = require('./TractorBeam.js');
var CodeCapsule = require('./CodeCapsule.js');

const LOG5 = Math.log(0.6);                           // LOG of charge rate decay factor for faster exponentiation
const sin = Math.sin;
const cos = Math.cos;
//var SHIP_SCAN_RADIUS = 25;

var Turret = function (starcoder, config) {
    SyncBodyBase.call(this, starcoder, config);
    this.attachments = {};
    //this.proximitySensor = new p2.Circle({radius: SHIP_SCAN_RADIUS, sensor: true, mass: 0.000001});
    //this.setCollisionGroup(this.proximitySensor);
    //this.setCollisionMask(this.proximitySensor, ['Alien']);
    //this.addShape(this.proximitySensor);
    this.damping = 0.85;
    this.angularDamping = 0.85;
    this.state = {
        turn: 0,
        thrust: 0,
        firing: true
    };
    this.seederProperties = {             // defaults for new trees
        depth: 5,
        branchFactor: 4,
        branchDecay: 0.75,
        spread: 90,
        trunkLength: 2
    };
    this.invulnerable = false;
    // Engine
    this.thrustForce = 700.001;
    this.turningForce = 45;
    // Weapons system
    this.charge = 8;
    this.maxCharge = 5;
    this.chargeRate = 8;
    this.bulletSalvoSize = 1;
    this.bulletVelocity = 50;
    this.bulletRange = 40;
    this.bulletSpread = 0;
    this._lastShot = 0;
    // Inventory
    this._crystals = 0;
    this._trees = 0;
    this._fillColor = '#000000';
    this._fillAlpha = 0;
    this._thrustState = 0;
    this.previousWarpCoords = [];
    //this._crystals = 150;
    //Add array to keep track of Turret's previous warp coordinates
    //Add array for significant previous warp locations
    //setInterval(scan(this, body, 25, bodytype), 1000);

    var myLasers = setInterval(this.shoot, 1000);

};

var scan = function (player, body, range, bodytype) {
    var r2 = range * range;
    var x = body.position[0];
    var y = body.position[1];
    var result = [];
    for (var i = 0, l = body.world.bodies.length; i < l; i++) {
        var target = body.world.bodies[i];
        if (target === body) {
            continue;
        }
        if (target.serverType && (!bodytype || bodytype === target.serverType)) {
            if ((x-target.position[0])*(x-target.position[0]) + (y-target.position[1])*(y-target.position[1]) <= r2) {
                result.push(target);
            }
        }
    }
    return result;
};



Turret.prototype = Object.create(SyncBodyBase.prototype);
Turret.prototype.constructor = Turret;

Turret.prototype.clientType = 'Turret';
Turret.prototype.serverType = 'Turret';

// Default properties

Turret.prototype.defaults = {mass: 10, vectorScale: 1, lineWidth: 6};

Turret.prototype._shape = [
    [0,-2],
    [1,1],
    [0,0],
    [-1,1]
    //[-1,-1],
    //[-0.5,0],
    //[-1,1],
    //[-0.5, 0.5],
    //[0.5, 0.5],
    //[1,1],
    //[0.5,0],
    //[1,-1],
    //[0,-0.5]
];
Turret.prototype._shapeClosed = true;

//Turret.prototype.lineWidth = 6;

//Turret.prototype.preProcessOptions = function (options) {
//    options.mass = options.mass || 10;
//    //options.velocity = [0, 0];
//    //options.position = [5, 5];
//    //options.angularVelocity = 2.5;
//};

Turret.prototype.onWorldAdd = function () {
    this.setTimer(this.chargeRate, {fun: this.rechargeLasers.bind(this)});
};

Turret.prototype.getPropertyUpdate = function (propname, properties) {
    switch (propname) {
        case 'playerid':
            properties.playerid = this.player.id;
            break;
        default:
            SyncBodyBase.prototype.getPropertyUpdate.call(this, propname, properties);
    }
};

Turret.prototype.onWorldRemove = function () {
    if (this.beamChild) {
        this.beamChild.cancel(true);
    }
};

Turret.prototype.control = function () {
    this.angularForce = this.turningForce*this.state.turn;
    this.applyForceLocal([0, -this.thrustForce*this.state.thrust]);
    if (this.state.firing && ((this.world.time - this._lastShot) > 0.25) && (this.charge > 0)) {
        this.shoot();
    }
    if (this.state.tractorFiring) {
        this.state.tractorFiring = false;
        this.toggleTractorBeam();
    }
};

//Turret.prototype.beginSense = function (body) {
//    switch (body.serverType) {
//        case 'Alien':
//            this.starcoder.sendMessage(this.player, 'alienapproach');
//            break;
//    }
//};

Turret.prototype.toggleTractorBeam = function () {
    // FIXME: magic numbers
    if (!this.beamChild) {
        var dir = this.angle + Math.PI;
        this.beamChild = this.worldapi.addSyncableBody(TractorBeam, {
            x: this.position[0],
            y: this.position[1],
            vx: 25 * Math.sin(dir),
            vy: -25 * Math.cos(dir),
            direction: dir,
            gen: 10,
            beamParent: this
        });
    } else {
        this.beamChild.cancel();
        //delete this.beamChild;
    }
};

Turret.prototype.shoot = function () {
    // FIXME: Probably a better way to do this
//    if (this.state.oneshot) {
//        this.state.oneshot = false;
//        this.state.firing = false;
 //   }
    //var tod = this.world.time + this.bulletRange / this.bulletVelocity;
    if (this.bulletSpread === 0 || this.bulletSalvoSize === 1) {
        var n = 1;
        this.charge -= 1;
        var aDel = 0;
        var aStart = this.angle;
    } else {
        n = Math.min(this.bulletSalvoSize, this.charge);
        this.charge -= n;
        aDel = this.bulletSpread * Math.PI / (180 * (n - 1));
        aStart = this.angle - 0.5 * this.bulletSpread * Math.PI / 180;
    }
    for (var i = 0, a = aStart; i < n; i++, a += aDel) {
        var bullet = this.worldapi.addSyncableBody(Bullet, {lineColor: this.lineColor});
        bullet.firer = this;
        bullet.position[0] = this.position[0];
        bullet.position[1] = this.position[1];
        bullet.velocity[0] = this.bulletVelocity * Math.sin(a);
        bullet.velocity[1] = -this.bulletVelocity * Math.cos(a);
        bullet.angle = a;
        //bullet.tod = tod;
    }
    //this._lastShot = this.world.time;
    //this.starcoder.sendMessage(this.player, 'laser');
};

Turret.prototype.knockOut = function () {
    //var self = this;
    this.dead = true;
    if (this.beamChild) {
        this.beamChild.cancel(true);
    }
    //setTimeout(function () {
    //    self.world.respawn(self, {position: {random: 'world'}});
    //}, 1000);
    this.setTimer(1, {respawn: {position: {random: 'world'}}});
};

Turret.prototype.rechargeLasers = function () {
    if (this.charge < this.maxCharge) {
        this.charge += 1;
    }
    this.setTimer(this.chargeRate, {fun: this.rechargeLasers.bind(this)});
};

/**
 * Add CodeCapsule to world behind Turret
 * @param {object} code
 */
Turret.prototype.deployCodeCapsule = function (code) {
    var cc = this.worldapi.addSyncableBody(CodeCapsule, {
        vectorScale: 0.5, owner: this.player, payload: code, lineColor: this.lineColor});
    // FIXME: positioning and error check
    var r = this.boundingRadius + cc.boundingRadius + 1;
    cc.position[0] = this.position[0] - sin(this.angle) * r;
    cc.position[1] = this.position[1] + cos(this.angle) * r;
    cc.angle = this.angle;
};

Turret.prototype.beginContact = function (other, equations) {
    switch (other.serverType) {
        case 'Bullet':
            if (!this.invulnerable && other.firer !== this) {
                this.starcoder.sendMessage(this.player, 'tagged');
                this.setTimer(2, {props: {lineColor: this.lineColor}});
                this.lineColor = other.firer.lineColor;
                other.firer.player.stats.tags++;
                this.starcoder.updatePlayerScore('Turrets Tagged',
                    other.firer.player.id, other.firer.player.stats.tags);
                other.firer.player.stats.currentTagStreak++;
                if (other.firer.player.stats.currentTagStreak > other.firer.player.stats.bestTagStreak) {
                    other.firer.player.stats.bestTagStreak = other.firer.player.stats.currentTagStreak;
                    this.starcoder.updatePlayerScore('Tag Streak',
                        other.firer.player.id, other.firer.player.stats.bestTagStreak);
                }
                this.player.stats.currentTagStreak = 0;
            }
            break;
        case 'Asteroid':
            if (!this.invulnerable && !this.dead) {
                //this.starcoder.sendMessage(this.player, 'explosion');
                //this.knockOut();
            }
            break;
        //case 'Alien':
            //this.starcoder.sendMessage(this.player, 'Turretattacked');
        case 'HydraArm':
            if (!this.invulnerable && !this.dead) {
                this.knockOut();
            }
        case 'Planetoid':
            if (equations.length) {
                equations = equations[0];
                if (equations.bodyA === this) {
                    var point = equations.contactPointA;
                } else {
                    point = equations.contactPointB;
                }
                this.attach(other, this.position[0] + point[0], this.position[1] + point[1]);
            } else {
                console.log('XXX Contact without equations');
                console.log(this);
                console.log(other);
                console.log(equations);
            }
            break;
    }
};

Turret.prototype.attach = function (other, x, y) {
    if (this.attachments[other.id]) {
        return;
    }
    var constraint = new p2.RevoluteConstraint(this, other, {worldPivot: [x, y]});
    this.attachments[other.id] = constraint;
    other.attachments[this.id] = constraint;
    this.world.addConstraint(constraint);
};



Turret.prototype.beginSense = function (other, equations, shape, othershape) {
    switch (other.serverType) {
        case 'Planetoid':
            //if (othershape.sensor && this.owner) {
            //    this.owner.accomplish('planetoiddock');
            //}
    }
};

Object.defineProperty(Turret.prototype, 'crystals', {
    get: function () {
        return this._crystals;
    },
    set: function (val) {
        this._crystals = val;
        this._dirtyProperties.crystals = true;
    }
});


Object.defineProperty(Turret.prototype, 'trees', {
    get: function () {
        return this._trees;
    },
    set: function (val) {
        this._trees = val;
        this.chargeRate = 5 * Math.exp(LOG5 * val);
        this._dirtyProperties.trees = true;
    }
});

Object.defineProperty(Turret.prototype, 'charge', {
    get: function () {
        return this._charge;
    },
    set: function (val) {
        this._charge = val;
        this._dirtyProperties.charge = true;
    }
});

Object.defineProperty(Turret.prototype, 'thrustState', {
    get: function () {
        return this._thrustState;
    },
    set: function (val) {
        this._thrustState = val;
        this._dirtyProperties.thrustState = true;
    }
});

Object.defineProperty(Turret.prototype, 'tag', {
    get: function () {
        return this._tag;
    },
    set: function (val) {
        this._tag = val;
        this._dirtyProperties.tag = true;
    }
});

Object.defineProperty(Turret.prototype, 'playerid', {
    get: function () {
        //return this.player.id;
    }
});

module.exports = Turret;
