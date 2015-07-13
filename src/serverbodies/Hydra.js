/**
 * Hydra.js
 *
 */
'use strict';

var p2 = require('p2');

var Starcoder = require('../Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase');
var UpdateProperties = require('../common/UpdateProperties.js').GenericOrb;
var Paths = require('../common/Paths.js');

var HydraHead = function (config, world) {
   SyncBodyBase.call(this, config);
};

HydraHead.prototype = Object.create(SyncBodyBase.prototype);
HydraHead.prototype.constructor = HydraHead;

Starcoder.mixinPrototype(HydraHead.prototype, UpdateProperties.prototype);

HydraHead.prototype.clientType = 'GenericOrb';
HydraHead.prototype.serverType = 'HydraHead';

HydraHead.prototype.collisionGroup = 'Hydra';
HydraHead.prototype.collisionExclude = ['Hydra'];

//HydraHead.prototype.updateProperties = ['lineColor', 'vectorScale'];
HydraHead.prototype.defaults = {mass: 100, vectorScale: 1.5, numArms: 5, numSegments: 4,
    spinForce: 50000, spinSpeed: 5, lineColor: '#ff00ff', angularDamping: 0};

HydraHead.prototype._shape = Paths.octagon;

HydraHead.prototype.onWorldAdd = function () {
    this.constraints = [];
    for (var i = 0; i < this.numArms; i++) {
        var angle = 2 * i * Math.PI / this.numArms;
        var scale = this.vectorScale;
        var radius = 0.5*scale;
        var lastarm;
        for (var j = 0; j < this.numSegments; j++) {
            scale *= 0.8;
            radius += 5*scale;
            angle -= Math.PI / 36;
            var arm = this.world.addSyncableBody(HydraArm, {vectorScale: scale});
            arm.position[0] = this.position[0] + radius * Math.cos(angle);
            arm.position[1] = this.position[1] + radius * Math.sin(angle);
            if (j === 0) {
                var constraint = new p2.LockConstraint(this, arm);
                arm.armParent = this;
            } else {
                constraint = new p2.RevoluteConstraint(lastarm, arm, {worldPivot: lastarm.position});
                constraint.setLimits(-Math.PI/4, Math.PI/4);
                arm.armParent = lastarm;
            }
            lastarm = arm;
            this.world.addConstraint(constraint);
            this.constraints.push(constraint);
        }
    }
};

HydraHead.prototype.update = function () {
    if (this.angularVelocity < this.spinSpeed) {
        this.angularForce = this.spinForce;
    }
};

var HydraArm = function (config) {
    SyncBodyBase.call(this, config);
};

HydraArm.prototype = Object.create(SyncBodyBase.prototype);
HydraArm.prototype.constructor = HydraArm;

Starcoder.mixinPrototype(HydraArm.prototype, UpdateProperties.prototype);

HydraArm.prototype.clientType = 'GenericOrb';
HydraArm.prototype.serverType = 'HydraArm';

HydraArm.prototype.collisionGroup = 'Hydra';
HydraArm.prototype.collisionExclude = ['Hydra'];

HydraArm.prototype.updateProperties = ['lineColor', 'vectorScale'];
HydraArm.prototype.defaults = {mass: 50, lineColor: '#00ff00'};

HydraArm.prototype._shape = Paths.octagon;

HydraArm.prototype.deadly = true;

module.exports = HydraHead;
