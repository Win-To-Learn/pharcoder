/**
 * Hydra.js
 *
 */
'use strict';

var p2 = require('p2');

var SyncBodyBase = require('./SyncBodyBase');

var Hydra = function (config, world) {
    this.vectorScale = 5;
    SyncBodyBase.call(this, config);
};

Hydra.prototype = Object.create(SyncBodyBase.prototype);
Hydra.prototype.constructor = Hydra;

Hydra.prototype.clientType = 'GenericOrb';
Hydra.prototype.serverType = 'Hydra';

Hydra.prototype.updateProperties = ['shape', 'lineColor', 'vectorScale'];

Hydra.prototype.shape = [
    [2,1],
    [1,2],
    [-1,2],
    [-2,1],
    [-2,-1],
    [-1,-2],
    [1,-2],
    [2,-1]
];

Hydra.prototype.onWorldAdd = function () {
    var arm = this.world.addSyncableBody(HydraArm, {mass: 5});
    arm.position[0] = this.position[0];
    arm.position[1] = this.position[1] + 15;
    var rc = new p2.RevoluteConstraint(this, arm, {worldPivot: this.position});
    this.world.addConstraint(rc);
    rc.enableMotor();
    rc.setMotorSpeed(3);
    var arm2 = this.world.addSyncableBody(HydraArm, {mass: 5});
    arm2.position[0] = this.position[0];
    arm2.position[1] = this.position[1] + 20;
    var rc2 = new p2.RevoluteConstraint(arm, arm2, {worldPivot: arm.position});
    this.world.addConstraint(rc2);
    rc2.setLimits(-Math.PI/8, Math.PI/8);
    var arm3 = this.world.addSyncableBody(HydraArm, {mass: 5});
    arm3.position[0] = this.position[0];
    arm3.position[1] = this.position[1] - 15;
    var rc3 = new p2.RevoluteConstraint(this, arm3, {worldPivot: this.position});
    this.world.addConstraint(rc3);
    rc3.enableMotor();
    rc3.setMotorSpeed(3);
    var arm4 = this.world.addSyncableBody(HydraArm, {mass: 5});
    arm4.position[0] = this.position[0];
    arm4.position[1] = this.position[1] - 20;
    var rc4 = new p2.RevoluteConstraint(arm3, arm4, {worldPivot: arm3.position});
    this.world.addConstraint(rc4);
    rc4.setLimits(-Math.PI/8, Math.PI/8);
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

HydraArm.prototype.updateProperties = ['shape', 'lineColor', 'vectorScale'];

HydraArm.prototype.shape = [
    [2,1],
    [1,2],
    [-1,2],
    [-2,1],
    [-2,-1],
    [-1,-2],
    [1,-2],
    [2,-1]
];


module.exports = Hydra;
