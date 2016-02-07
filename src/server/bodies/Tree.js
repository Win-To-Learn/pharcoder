/**
 * Tree.js
 *
 * Server side implementation
 */
'use strict';

var p2 = require('p2');

var Starcoder = require('../../common/Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase.js');

var Paths = require('../../common/Paths.js');
var UpdateProperties = require('../../common/UpdateProperties.js').Tree;

var Tree = function (config) {
    //SyncBodyBase.call(this, config);
    this.trunkLength = config.trunkLength || 2;
    this.branchFactor = Math.max(config.branchFactor || 5, 2);
    this.depth = config.depth || 5;
    this._step = this.depth;
    this.spread = config.spread || 90;
    this.branchDecay = config.branchDecay || 0.75;
    //this.growthRate = 1000 || config.growthRate;
    this.growthRate = 1 || config.growthRate;
    this.hulls = [];
    for (var i = 0; i < this.depth; i++) {
        this.hulls.push([]);
    }
    this.graph = {x: 0, y: 0};
    var initial = -this.spread * Math.PI / 360;
    var inc = (this.spread * Math.PI) / ((this.branchFactor - 1) * 180);
    this._makeBranch(this.graph, this.trunkLength, 0, initial, inc, this.depth);
    SyncBodyBase.call(this, config);
    //setTimeout(this._growTimeout.bind(this), this.growthRate);
    //for (i = 0; i < this.depth; i++) {
    //    this._sortHull(i, 0, this.trunkLength);
    //}
};

Tree.prototype = Object.create(SyncBodyBase.prototype);
Tree.prototype.constructor = Tree;

Starcoder.mixinPrototype(Tree.prototype, UpdateProperties.prototype);

Tree.prototype.clientType = 'Tree';
Tree.prototype.serverType = 'Tree';

Tree.prototype.collisionGroup = 'Tree';
Tree.prototype.collisionExclude = ['Tree', 'Planetoid'];

// Currently using a tiny body to avoid collisions and minimize impact on planet physics. Need to decide if that's
// the behavior we want
Tree.prototype._shape = [[0.1,0], [-0.1,0], [-0.1,0.1], [0.1,0.1]];
Tree.prototype.defaults = {mass: 0.1, lineColor: '#99cc99', vectorScale: 0.8};

Tree.prototype.onWorldAdd = function () {
    this.setTimer(this.growthRate, {fun: this._growTimeout.bind(this)});
};

Tree.prototype.onWorldRemove = function () {
    this.owner = null;
};

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
    if (depth < this.depth) {
        this.hulls[depth].push([child.x, -child.y]);
    }
    graph.c.push(child);
    if (depth > 0) {
        for (var i = 0; i < this.branchFactor; i++) {
            this._makeBranch(child, length * this.branchDecay, angle + initial + inc * i, initial, inc, depth - 1);
        }
    }
};

Tree.prototype._growTimeout = function () {
    this.step--;
    this.adjustShape();
    if (this.step > 0) {
        this.setTimer(this.growthRate, {fun: this._growTimeout.bind(this)});
        //setTimeout(this._growTimeout.bind(this), this.growthRate);
    }
};

Tree.prototype._sortHull = function (depth, cx, cy) {
    var cmp = function (a, b) {
        var dax = a[0] - cx;
        var dbx = b[0] - cx;
        if (dax >= 0) {
            if (dbx < 0) {
                return -1;
            }
        } else if (dbx >= 0) {
            return 1;
        }
        var day = a[1] - cy;
        var dby = b[1] - cy;
        if (dax === 0 && dbx === 0) {
            if (day >= 0 || dby >= 0) {
                return b[1] - a[1];
            } else {
                return a[1] - b[1];
            }
        }
        var det = dax * dby - dbx * day;
        if (det !== 0) {
            return -det;
        }
        return (dax * dax + day * day) - (dbx * dbx + dby * dby);
    };
    this.hulls[depth].sort(cmp);
    // DEBUGGING
    //console.log('sort');
    //for (var i = 0, l = this.hulls[depth].length; i < l; i++) {
    //    var p = this.hulls[depth][i];
    //    var a = Math.atan2(p[1] - cy, p[0] - cx) * 180 / Math.PI;
    //    var r = Math.sqrt((p[0] - cx)*(p[0] - cx) + (p[1] - cy)*(p[1] - cy));
    //    console.log('A', a, 'R', r);
    //}
};

Tree.prototype._cullHull = function (depth) {
    var hull = this.hulls[depth];
    var len = hull.length
    if (len <= 8) {
        return hull;
    }
    var reduced = [];
    var interval = len / 6;
    reduced.push(hull[0]);
    reduced.push(hull[Math.floor(interval)]);
    reduced.push(hull[Math.floor(2 * interval)]);
    if (this.branchFactor % 2) {
        // odd - middle one
        reduced.push(hull[Math.floor(len / 2)]);
    } else {
        // even - middle two
        reduced.push(hull[hull.length / 2 - 1]);
        reduced.push(hull[hull.length / 2]);
    }
    reduced.push(hull[len - 1 - Math.floor(2 * interval)]);
    reduced.push(hull[len - 1 - Math.floor(interval)]);
    reduced.push(hull[len - 1]);
    return reduced;
};

Tree.prototype.adjustShape = function () {
    var oldGroup, oldMask;
    if (this.shapes.length > 0) {
        // For now all bodies are made of shapes with same collision group/mask
        oldGroup = this.shapes[0].collisionGroup;
        oldMask = this.shapes[0].collisionMask;
    }
    if (!this.step) {
        return;
    }
    //console.log('as', this.step, 'id', this.id);
    //console.trace('here');
    if (this.step === this.depth) {
        // trunk
        this.removeShape(this.shapes[0]);
        this.addShape(new p2.Capsule({radius: 0.1, length: this.trunkLength}, [0, this.trunkLength / 2]));
    } else {
        // canopy
        for (var i = 1, l = this.shapes.length; i < l; i++) {
            this.removeShape(this.shapes[i]);
        }
        this._sortHull(this.step, 0, this.trunkLength);
        //console.log('h', this.hulls[this.step]);
        //var cv = new p2.Convex({vertices: this.hulls[this.step]});
        //console.log(cv.triangles);
        this.addShape(new p2.Convex({vertices: this._cullHull(this.step)}));
    }
    if (oldGroup || oldMask) {
        for (i = 0, l = this.shapes.length; i < l; i++) {
            this.shapes[i].collisionGroup = oldGroup;
            this.shapes[i].collisionMask = oldMask;
        }
    }
};

Tree.prototype.beginContact = function (other) {
    switch (other.serverType) {
        case 'Ship':
            if (this.owner != other.player) {
                this.owner = other.player;
                this.lineColor = other.lineColor;
            }
            break;
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

Object.defineProperty(Tree.prototype, 'owner', {
    get: function () {
        return this._owner;
    },
    set: function (val) {
        if (this._owner) {
            this._owner.getShip().trees -= 1;
        }
        this._owner = val;
        if (val) {
            val.getShip().trees += 1;
        }
    }
});

module.exports = Tree;
