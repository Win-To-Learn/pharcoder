/**
 * Hydra.js
 *
 */
'use strict';

var p2 = require('p2');

var Starcoder = require('../../common/Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase');
var Crystal = require('./Crystal.js');
var UpdateProperties = require('../../common/UpdateProperties.js').GenericOrb;
var Paths = require('../../common/Paths.js');

var HydraHead = function (config) {
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
    spinForce: 100000, spinSpeed: 10, lineColor: '#ff00ff', angularDamping: 0};

HydraHead.prototype._shape = Paths.octagon;

HydraHead.prototype.respawnTime = 5;

HydraHead.prototype.onWorldAdd = function () {
    this.constraints = [];
    this.arms = [];
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
            this.arms.push(arm);
        }
    }
};

HydraHead.prototype.control = function () {
    if (this.angularVelocity < this.spinSpeed) {
        this.angularForce = this.spinForce;
    }
};

HydraHead.prototype.kill = function () {
    for (var i = 0, l = this.arms.length; i < l; i++) {
        this.world.removeSyncableBody(this.arms[i]);
    }
    for (i = 0, l = this.constraints.length; i < l; i++) {
        this.world.removeConstraint(this.constraints[i]);
    }
    this.world.removeSyncableBody(this);
    this.world.addSyncableBody(Crystal, {
        x: this.position[0],
        y: this.position[1],
        mass: 10,
        value: 500
    });

};

HydraHead.prototype.respawn = function (world) {
    world.addSyncableBody(HydraHead, {position: {random: 'world', pad: 50}});
};

HydraHead.prototype.beginContact = function (other) {
    switch (other.serverType) {
        case 'Bullet':
            this.kill();
            setTimeout(head.respawn, head.respawnTime * 1000, this.world);
            break;
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
HydraArm.prototype.blocker = true;

module.exports = HydraHead;
