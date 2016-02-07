/**
 * TractorBeam.js
 *
 * Server side implementation
 */
'use strict';

var p2 = require('p2');

var RADIUS = 0.5;

var Starcoder = require('../../common/Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase.js');
var UpdateProperties = require('../../common/UpdateProperties.js').TractorBeam;

var TractorBeam = function (config) {
    SyncBodyBase.call(this, config);
    if (!(this.beamParent instanceof TractorBeam)) {
        this.onWorldAdd = this.onWorldAddFirstGen;
    }
};

TractorBeam.prototype = Object.create(SyncBodyBase.prototype);
TractorBeam.prototype.constructor = TractorBeam;

Starcoder.mixinPrototype(TractorBeam.prototype, UpdateProperties.prototype);

TractorBeam.prototype.clientType = 'TractorBeam';
TractorBeam.prototype.serverType = 'TractorBeam';

TractorBeam.prototype.defaults = {mode: 'expanding', terminal: true, mass: 0.1};

TractorBeam.prototype.expandTime = 1 / 25;
TractorBeam.prototype.retractTime = 5 / 60;
TractorBeam.prototype.lifeSpan = 1;

TractorBeam.prototype.adjustShape = function () {
    this.clearAllShapes();
    var circle = new p2.Circle({radius: RADIUS});
    circle.sensor = true;
    this.addShape(circle);
    this.setCollisionGroup();
    this.setCollisionMask();
};

TractorBeam.prototype.onWorldAddFirstGen = function () {
    this.setTimer(this.expandTime, {fun: this.expand.bind(this)});
};

TractorBeam.prototype.expand = function () {
    if (this.mode !== 'expanding') {
        return;
    }
    this.beamConstraint = new p2.DistanceConstraint(this.beamParent, this);
    this.world.addConstraint(this.beamConstraint);
    if (this.gen > 0) {
        this.beamChild = this.world.addSyncableBody(TractorBeam, {
            x: this.position[0],
            y: this.position[1],
            vx: 25 * Math.sin(this.direction),
            vy: -25 * Math.cos(this.direction),
            direction: this.direction,
            gen: this.gen - 1,
            beamParent: this
        });
        this.terminal = false;
        this.beamChild.setTimer(1 / 25, {fun: this.expand.bind(this.beamChild)});
    } else {
        this.mode = 'waiting';
        this.setTimer(this.lifeSpan, {fun: this.retract.bind(this)});
    }
};

TractorBeam.prototype.retract = function (instant) {
    if (this.mode === 'attached') {
        return;
    }
    if (this.beamConstraint) {
        this.world.removeConstraint(this.beamConstraint);
        delete this.beamConstraint;
    }
    //if (this.tractorConstraint) {
    //    this.world.removeConstraint(this.tractorConstraint);
    //    delete this.tractorConstraint;
    //}
    delete this.beamParent.beamChild;
    //console.log('Tract', this);
    if (this.world) {           // FIXME - not sure why this is necessary
        this.world.removeSyncableBody(this);
    }
    if (this.beamParent instanceof TractorBeam) {
        if (instant) {
            this.beamParent.retract(true);
        } else {
            this.beamParent.terminal = true;
            this.beamParent.mode = 'retracting';
            this.beamParent.setTimer(this.retractTime, {fun: this.retract.bind(this.beamParent)});
        }
    }
};

TractorBeam.prototype.canAttach = function(target) {
    // TODO: more checks?
    return (this.mode !== 'attached' && this.terminal);
}

TractorBeam.prototype.attachTarget = function (target, mass, damping) {
    if (this.mode === 'expanding') {
        this.velocity[0] = 0;
        this.velocity[1] = 1;
        this.beamConstraint = new p2.DistanceConstraint(this.beamParent, this);
        this.world.addConstraint(this.beamConstraint);
    }
    this.mode = 'attached';
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
    this.mode ='waiting';
};

TractorBeam.prototype.cancel = function (instant) {
    var beam = this;
    while (!beam.terminal) {
        beam = beam.beamChild;
    }
    if (beam.attachedTarget) {
        beam.detachTarget();
    }
    beam.mode = 'retracting';
    if (instant) {
        beam.retract(true);
    } else {
        //beam.mode = 'retracting'
        beam.setTimer(this.retractTime, {fun: this.retract.bind(beam)});
    }
};

TractorBeam.prototype.beginSense = function (other) {
    if (other.tractorable) {
        if (this.canAttach(other)) {
            this.attachTarget(other);
        }
    }
};

module.exports = TractorBeam;
