/**
 * Tree.js
 *
 * Client side
 */

var Starcoder = require('../../common/Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');

var Tree = function (game, config) {
    this.graph = {x: 0, y: 0};
    var initial = -config.spread * Math.PI / 360;
    var inc = (config.spread * Math.PI) / ((config.branchFactor - 1) * 180);
    this._makeBranch(
        this.graph, config.trunkLength, config.branchDecay, config.branchFactor, 0, initial, inc, config.depth);
    VectorSprite.call(this, game, config);
    this.anchor.setTo(0.5, 1);
};

Tree.add = function (game, config) {
    var tree = new Tree (game, config);
    game.add.existing(tree);
    return tree;
};

Tree.prototype = Object.create(VectorSprite.prototype);
Tree.prototype.constructor = Tree;

Starcoder.mixinPrototype(Tree.prototype, SyncBodyInterface.prototype);

/**
 * Add a branch to the tree graph
 *
 * @param graph {object} - root node for new branch
 * @param length {number} - length of branch
 * @param decay {number} - decay factor for child branches
 * @param factor {number} - number of branches at each level
 * @param angle {number} - angle of branch in radians (relative to parents)
 * @param initial {number} - angle offset (radians) of leftmost branch
 * @param inc {number} - angle delta (radians) between adjacent branches
 * @param depth {number} - depth of tree
 * @private
 */
Tree.prototype._makeBranch = function (graph, length, decay, factor, angle, initial, inc, depth) {
    //console.log(arguments);
    if (!graph.c) {
        graph.c = [];
    }
    var child = {x: graph.x + length * Math.sin(angle), y: graph.y - length * Math.cos(angle)};
    graph.c.push(child);
    if (depth > 0) {
        for (var i = 0; i < factor; i++) {
            this._makeBranch(child, length * decay, decay, factor, angle + initial + inc * i, initial, inc, depth - 1);
        }
    }
};

/**
 * Draw tree, overriding standard shape and geometry method to use graph
 *
 * @param renderScale
 * blah blah
 */
Tree.prototype.drawProcedure = function (renderScale) {
    var lineColor = Phaser.Color.hexToRGB(this.lineColor);
    this.graphics.lineStyle(1, lineColor, 1);
    this._drawBranch(this.graph, this.game.starcoder.config.physicsScale*this.vectorScale*renderScale, this.depth);
};

Tree.prototype._drawBranch = function (graph, sc, depth) {
    for (var i = 0, l = graph.c.length; i < l; i++) {
        var child = graph.c[i];
        this.graphics.moveTo(graph.x * sc, graph.y * sc);
        this.graphics.lineTo(child.x * sc, child.y * sc);
        if (depth > this.step) {
            this._drawBranch(child, sc, depth - 1);
        }
    }
};

Object.defineProperty(Tree.prototype, 'step', {
    get: function () {
        return this._step;
    },
    set: function (val) {
        this._step = val;
        this._dirty = true;
    }
});

module.exports = Tree;