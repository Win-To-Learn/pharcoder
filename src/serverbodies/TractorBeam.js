/**
 * TractorBeam.js
 *
 * Server side implementation
 */
'use strict';

var p2 = require('p2');

var RADIUS = 0.5;

var Starcoder = require('../Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase.js');
var UpdateProperties = require('../common/UpdateProperties.js').TractorBeam;

var TractorBeam = function (config) {
    SyncBodyBase.call(this, config);
};

TractorBeam.prototype = Object.create(SyncBodyBase.prototype);
TractorBeam.prototype.constructor = TractorBeam;

Starcoder.mixinPrototype(TractorBeam.prototype, UpdateProperties.prototype);

TractorBeam.prototype.clientType = 'TractorBeam';
TractorBeam.prototype.serverType = 'TractorBeam';

TractorBeam.prototype.defaults = {mode: 'firing', terminal: true, mass: 0.1};

TractorBeam.prototype.fadeTime = 5 / 60;

TractorBeam.prototype.adjustShape = function () {
    this.clearAllShapes();
    var circle = new p2.Circle({radius: RADIUS});
    circle.sensor = true;
    this.addShape(circle);
};

TractorBeam.prototype.update = function () {
    if (this.terminal && this.world.time >= this.timer) {
        switch (this.mode) {
            case 'firing':
                if (this.gen > 0) {
                    this.beamChild = this.world.addSyncableBody(TractorBeam, {
                        x: this.position[0],
                        y: this.position[1],
                        vx: 25 * Math.sin(this.direction),
                        vy: -25 * Math.cos(this.direction),
                        direction: this.direction,
                        gen: this.gen - 1,
                        timer: this.world.time + 1 / 25,
                        beamParent: this
                    });
                    this.terminal = false;
                } else if (this.gen === 0) {
                    this.mode = 'fading';
                    this.timer = this.world.time + 1;
                }
                this.beamConstraint = new p2.DistanceConstraint(this.beamParent, this);
                this.world.addConstraint(this.beamConstraint);
                break;
            case 'fading':
                this.beamParent.mode = 'fading';
                this.beamParent.terminal = true;
                this.beamParent.timer = this.world.time + this.fadeTime;
                delete this.beamParent.beamChild;
                if (this.beamConstraint) {
                    this.world.removeConstraint(this.beamConstraint);
                    delete this.beamConstraint;
                }
                this.world.removeSyncableBody(this);
                break;
        }
    }
};

TractorBeam.prototype.canAttach = function(target) {
    // TODO: more checks?
    return (this.mode !== 'tractoring' && this.terminal);
}

TractorBeam.prototype.attachTarget = function (target, mass, damping) {
    if (this.mode === 'firing') {
        this.velocity[0] = 0;
        this.velocity[1] = 1;
        this.beamConstraint = new p2.DistanceConstraint(this.beamParent, this);
        this.world.addConstraint(this.beamConstraint);
    }
    this.mode = 'tractoring';
    mass = mass || 0.1;
    damping = damping || 0.99;
    this.tractorConstraint = new p2.DistanceConstraint(this, target);
    this.world.addConstraint(this.tractorConstraint);
    this.oldTargetMass = target.mass;
    this.oldTargetDamping = target.damping;
    this.attachedTarget = target;
    target.mass = mass;
    target.damping = damping;
    target.updateMassProperties();
};

TractorBeam.prototype.detachTarget = function () {
    this.attachedTarget.mass = this.oldTargetMass;
    this.attachedTarget.damping = this.oldTargetDamping;
    this.attachedTarget.updateMassProperties();
    this.world.removeConstraint(this.tractorConstraint);
    delete this.tractorConstraint;
    delete this.attachedTarget;
};

TractorBeam.prototype.cancel = function () {
    var beam = this;
    while (!beam.terminal) {
        beam = beam.beamChild;
    }
    if (beam.attachedTarget) {
        beam.detachTarget();
    }
    beam.mode = 'fading';
    beam.timer = this.world.time + this.fadeTime;
}

module.exports = TractorBeam;
