/**
 * StationBlock.js
 *
 * Server side
 */
'use strict';

var p2 = require('p2');
var vec2 = p2.vec2;
var earcut = require('earcut');

var Starcoder = require('../../common/Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase.js');
var Common = require('../../common/bodies/StationBlock.js');
var Paths = require('../../common/Paths.js');

var StationBlock = function (config) {
    SyncBodyBase.call(this, config);
    this.attachments = {};
};

StationBlock.prototype = Object.create(SyncBodyBase.prototype);
StationBlock.prototype.constructor = StationBlock;

Starcoder.mixinPrototype(StationBlock.prototype, Common);

StationBlock.prototype.serverType = 'StationBlock';
StationBlock.prototype.clientType = 'StationBlock';

StationBlock.prototype.defaults = {
    shape: Paths.square2
};

StationBlock.prototype.tractorable = true;
StationBlock.prototype.blocker = true;

StationBlock.prototype.adjustShape = function () {
    SyncBodyBase.prototype.adjustShape.call(this);
    if (!this.shape) {
        return;
    }
    this.triangles = [];
    var flat = [];
    for (var i = 0, l = this.shape.length; i < l; i++) {
        flat.push(this.shape[i][0], this.shape[i][1]);
    }
    flat = earcut(flat);
    for (i = 0, l = flat.length; i < l; i += 3) {
        this.triangles.push([this.shape[flat[i]], this.shape[flat[i + 1]], this.shape[flat[i + 2]]]);
    }
};

StationBlock.prototype.attach = function (other, x, y) {
    if (this.attachments[other.id]) {
        return;
    }
    var constraint = new p2.RevoluteConstraint(this, other, {worldPivot: [x, y]});
    this.attachments[other.id] = constraint;
    other.attachments[this.id] = constraint;
    this.world.addConstraint(constraint);
};

module.exports = StationBlock;