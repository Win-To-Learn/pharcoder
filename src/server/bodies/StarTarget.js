/**
 * StarTarget.js
 *
 * Server side implementation
 */
'use strict';

var p2 = require('p2');

var Starcoder = require('../../common/Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase.js');
var UpdateProperties = require('../../common/UpdateProperties.js').StarTarget;

var StarTarget = function (config) {
    SyncBodyBase.call(this, config);
};

StarTarget.prototype = Object.create(SyncBodyBase.prototype);
StarTarget.prototype.constructor = StarTarget;

Starcoder.mixinPrototype(StarTarget.prototype, UpdateProperties.prototype);

StarTarget.prototype.defaults = {mass: 1, lineColor: '#ffff00'};

StarTarget.prototype.clientType = 'StarTarget';
StarTarget.prototype.serverType = 'StarTarget';

// FIXME
StarTarget.prototype.adjustShape = function () {
    this.clearAllShapes();
    var particle = new p2.Particle();
    particle.sensor = true;
    this.addShape(particle);
};

module.exports = StarTarget;
