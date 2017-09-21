/**
 * Turret.js
 *
 * Server side
 */
'use strict';

var p2 = require('p2');
var vec2 = p2.vec2;
var earcut = require('earcut');

var SyncBodyBase = require('./SyncBodyBase.js');
var Bullet = require('./Bullet.js');
var Paths = require('../../common/Paths.js');

var Turret = function (starcoder, config) {
    SyncBodyBase.call(this, starcoder, config);
    this.aim = 0;
    this.bulletVelocity = 50;
    this.bulletRange = 40;
    this.attachments = {};
};

Turret.prototype = Object.create(SyncBodyBase.prototype);
Turret.prototype.constructor = Turret;

Turret.prototype.serverType = 'Turret';
Turret.prototype.clientType = 'Turret';

Turret.prototype.defaults = {
    shape: [                // Trapezoid
        [-1,1.25],
        [1, 1.25],
        [0.5, 0],
        [-0.5, 0]
    ]
};

Turret.prototype.tractorable = true;
Turret.prototype.blocker = true;

// Turret.prototype.adjustShape = function () {
//     SyncBodyBase.prototype.adjustShape.call(this);
//     if (!this.shape) {
//         return;
//     }
//     this.triangles = [];
//     var flat = [];
//     for (var i = 0, l = this.shape.length; i < l; i++) {
//         flat.push(this.shape[i][0], this.shape[i][1]);
//     }
//     flat = earcut(flat);
//     for (i = 0, l = flat.length; i < l; i += 3) {
//         this.triangles.push([this.shape[flat[i]], this.shape[flat[i + 1]], this.shape[flat[i + 2]]]);
//     }
//     this.centerSensor = new p2.Circle({radius: 0.1, sensor: true});
//     this.setCollisionGroup(this.centerSensor);
//     this.setCollisionMask(this.centerSensor, ['Planetoid']);
//     this.addShape(this.centerSensor);
// };
//

Turret.prototype.fire = function () {
    var tod = this.world.time + this.bulletRange / this.bulletVelocity;
    var a = this.angle + this.aim * Math.PI / 180;
    var bullet = this.worldapi.addSyncableBody(Bullet, {lineColor: this.lineColor});
    bullet.firer = this.owner;
    bullet.position[0] = this.position[0];
    bullet.position[1] = this.position[1];
    bullet.velocity[0] = this.bulletVelocity * Math.sin(a);
    bullet.velocity[1] = -this.bulletVelocity * Math.cos(a);
    bullet.angle = a;
    bullet.tod = tod;
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

Turret.prototype.beginContact = function (other, equations) {
    switch (other.serverType) {
        case 'StationBlock':
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
//
// Turret.prototype.beginSense = function (other, equations, shape, othershape) {
//     switch (other.serverType) {
//         case 'Planetoid':
//             if (othershape.sensor && this.owner) {
//                 this.owner.accomplish('planetoiddock');
//             }
//     }
// };

module.exports = Turret;