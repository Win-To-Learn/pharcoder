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
