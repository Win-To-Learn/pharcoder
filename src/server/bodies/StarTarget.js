/**
 * StarTarget.js
 *
 * Server side implementation
 */
'use strict';

var p2 = require('p2');

var SyncBodyBase = require('./SyncBodyBase.js');

var StarTarget = function (starcoder, config) {
    SyncBodyBase.call(this, starcoder, config);
};

StarTarget.prototype = Object.create(SyncBodyBase.prototype);
StarTarget.prototype.constructor = StarTarget;

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
