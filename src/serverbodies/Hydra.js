/**
 * Hydra.js
 *
 */
'use strict';

var p2 = require('p2');

var SyncBodyBase = require('./SyncBodyBase');

var Paths = require('../common/Paths.js');

var HydraHead = function (config, world) {
   SyncBodyBase.call(this, config);
};

HydraHead.prototype = Object.create(SyncBodyBase.prototype);
HydraHead.prototype.constructor = HydraHead;

HydraHead.prototype.clientType = 'GenericOrb';
HydraHead.prototype.serverType = 'HydraHead';

HydraHead.prototype.updateProperties = ['lineColor', 'vectorScale'];
HydraHead.prototype.defaults = {mass: 1000, vectorScale: 1.5, numArms: 4, numSegments: 3,
    spinForce: 1000, spinSpeed: 3, lineColor: '#ff00ff'};

HydraHead.shape = Paths.octagon;

HydraHead.prototype.onWorldAdd = function () {
    this.constraints = [];
    for (var i = 0; i < this.numArms; i++) {
        var angle = 2 * i * Math.PI / this.numArms;
        var scale = this.vectorScale;
        var radius = 2*scale;
        var lastarm;
        for (var j = 0; j < this.numSegments; j++) {
            scale *= 0.8;
            radius = 1.9*radius;
            var arm = this.world.addSyncableBody(HydraArm, {vectorScale: scale});
            arm.position[0] = this.position[0] + radius * Math.cos(angle);
            arm.position[1] = this.position[1] + radius * Math.sin(angle);
            console.log(j, scale, radius, arm.position[0], arm.position[1]);
            if (j === 0) {
                var constraint = new p2.LockConstraint(this, arm);
                arm.armParent = this;
            } else {
                constraint = new p2.RevoluteConstraint(lastarm, arm, {worldPivot: lastarm.position});
                constraint.setLimits(-Math.PI/8, Math.PI/8);
                arm.armParent = lastarm;
            }
            lastarm = arm;
            this.world.addConstraint(constraint);
            this.constraints.push(constraint);
        }
    }
    //var arm = this.world.addSyncableBody(HydraArm, {mass: 1});
    //arm.position[0] = this.position[0];
    //arm.position[1] = this.position[1] + 15;
    //var lc = new p2.LockConstraint(this, );
    //this.world.addConstraint(lc);
    //this.angularVelocity = 10;
    //this.angularDamping = 0;
    //var rc = new p2.RevoluteConstraint(this, arm, {worldPivot: this.position});
    //this.world.addConstraint(rc);
    //rc.enableMotor();
    //rc.setMotorSpeed(3);
    //var arm2 = this.world.addSyncableBody(HydraArm, {mass: 5});
    //arm2.position[0] = this.position[0];
    //arm2.position[1] = this.position[1] + 20;
    //var rc2 = new p2.RevoluteConstraint(arm, arm2, {worldPivot: arm.position});
    //this.world.addConstraint(rc2);
    //rc2.setLimits(-Math.PI/8, Math.PI/8);
    //var arm3 = this.world.addSyncableBody(HydraArm, {mass: 5});
    //arm3.position[0] = this.position[0];
    //arm3.position[1] = this.position[1] - 15;
    //var rc3 = new p2.RevoluteConstraint(this, arm3, {worldPivot: this.position});
    //this.world.addConstraint(rc3);
    //rc3.enableMotor();
    //rc3.setMotorSpeed(3);
    //var arm4 = this.world.addSyncableBody(HydraArm, {mass: 5});
    //arm4.position[0] = this.position[0];
    //arm4.position[1] = this.position[1] - 20;
    //var rc4 = new p2.RevoluteConstraint(arm3, arm4, {worldPivot: arm3.position});
    //this.world.addConstraint(rc4);
    //rc4.setLimits(-Math.PI/8, Math.PI/8);
};

HydraHead.prototype.update = function () {
    if (this.angularVelocity < 5) {
        this.angularForce = 500;
    }
};

var HydraArm = function (config) {
    this.vectorScale = 1;
    this.lineColor = '#00ff00';
    SyncBodyBase.call(this, config);
};

HydraArm.prototype = Object.create(SyncBodyBase.prototype);
HydraArm.prototype.constructor = HydraArm;

HydraArm.prototype.clientType = 'GenericOrb';
HydraArm.prototype.serverType = 'HydraArm';

HydraArm.prototype.updateProperties = ['lineColor', 'vectorScale'];
HydraArm.prototype.defaults = {mass: 1, lineColor: '#00ff00'};

HydraArm.shape = Paths.octagon;

module.exports = HydraHead;
