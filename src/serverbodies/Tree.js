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
    this.step = this.depth;
    this.spread = config.spread || 90;
    this.branchDecay = config.branchDecay || 0.75;
    this.growthRate = 1000 || config.growthRate;

    this.graph = {x: 0, y: 0};
    var initial = -this.spread * Math.PI / 360;
    var inc = (this.spread * Math.PI) / ((this.branchFactor - 1) * 180);
    this._makeBranch(this.graph, this.trunkLength, 0, initial, inc, this.depth);
    setTimeout(this._growTimeout.bind(this), this.growthRate);
};

Tree.prototype = Object.create(SyncBodyBase.prototype);
Tree.prototype.constructor = Tree;

Starcoder.mixinPrototype(Tree.prototype, UpdateProperties.prototype);

Tree.prototype.clientType = 'Tree';
Tree.prototype.serverType = 'Tree';

// Currently using a tiny body to avoid collisions and minimize impact on planet physics. Need to decide if that's
// the behavior we want
Tree.prototype._shape = [[0.1,0], [-0.1,0], [-0.1,0.1], [0.1,0.1]];
Tree.prototype.defaults = {mass: 0.1, lineColor: '#99cc99', vectorScale: 0.8};

/**
 * Add a branch to the tree graph
 *
 * @param graph {object} - root node for new branch
 * @param length {number} - length of branch
 * @param angle {number} - angle of branch in radians (relative to parents)
 * @param initial {number} - angle offset (radians) of leftmost branch
 * @param inc {number} - angle delta (radians) between adjacent branches
 * @param depth {number} - depth of tree
 * @private
 */
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

Tree.prototype._growTimeout = function () {
    this.step--;
    if (this.step > 0) {
        setTimeout(this._growTimeout.bind(this), this.growthRate);
    }
};

Object.defineProperty(Tree.prototype, 'step', {
    get: function () {
        return this._step;
    },
    set: function (val) {
        this._step = val;
        this._dirtyProperties.step = true;
    }
});

module.exports = Tree;
