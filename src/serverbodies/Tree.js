/**
 * Tree.js
 *
 * Server side implementation
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase.js');

var Paths = require('../common/Paths.js');
var UpdateProperties = require('../common/UpdateProperties.js').Tree;

var Tree = function (config) {
    SyncBodyBase.call(this, config);
    this.trunkLength = config.trunkLength || 2;
    this.branchFactor = Math.max(config.branchFactor || 5, 2);
    this.depth = config.depth || 5;
    this.spread = config.spread || 90;
    this.branchDecay = config.branchDecay || 0.75;

    this.graph = {x: 0, y: 0};
    var initial = -this.spread * Math.PI / 360;
    var inc = (this.spread * Math.PI) / ((this.branchFactor - 1) * 180);
    this._makeBranch(this.graph, this.trunkLength, 0, initial, inc, this.depth);
};

Tree.prototype = Object.create(SyncBodyBase.prototype);
Tree.prototype.constructor = Tree;

Starcoder.mixinPrototype(Tree.prototype, UpdateProperties.prototype);

Tree.prototype.clientType = 'Tree';
Tree.prototype.serverType = 'Tree';

Tree.prototype._shape = Paths.octagon;      // FIXME: just for testing

Tree.prototype._makeBranch = function (graph, length, angle, initial, inc, depth) {
   if (!graph.c) {
        graph.c = [];
    }
    var child = {x: graph.x + length * Math.sin(angle), y: graph.y + length * Math.cos(angle)};
    graph.c.push(child);
    if (depth > 0) {
        for (var i = 0; i < this.branchFactor; i++) {
            this._makeBranch(child, length * this.branchDecay, angle + initial + inc * i, initial, inc, depth - 1);
        }
    }
};

module.exports = Tree;
