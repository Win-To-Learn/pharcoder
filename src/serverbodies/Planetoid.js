/**
 * Planetoid.js
 *
 * Server side implementation
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

var Paths = require('../common/Paths.js');
var UpdateProperties = require('../common/UpdateProperties.js').Planetoid;

var Tree = require('./Tree.js');

var Planetoid = function (config) {
    SyncBodyBase.call(this, config);
    //this.damping = 0;
    //this.angularDamping = 0;
    this.trees = [];
};

Planetoid.prototype = Object.create(SyncBodyBase.prototype);
Planetoid.prototype.constructor = Planetoid;

Starcoder.mixinPrototype(Planetoid.prototype, UpdateProperties.prototype);

Planetoid.prototype.clientType = 'Planetoid';
Planetoid.prototype.serverType = 'Planetoid';

Planetoid.prototype.tractorable = true;

Planetoid.prototype._lineColor = '#0000ff';
Planetoid.prototype._fillColor = '#ff0000';
Planetoid.prototype._lineWidth = 1;
Planetoid.prototype._fillAlpha = 0.15;
Planetoid.prototype._shape = Paths.octagon;


Planetoid.prototype.plantTree = function (x, y, ship) {
    var tree = this.world.addSyncableBody(Tree, {
        mass: 0.1,
        position: [this.position[0] + x, this.position[1] + y],
        angle: Math.atan2(x, -y),
        lineColor: ship.lineColor,
        owner: ship.player,
        depth: ship.seederProperties.depth,
        branchFactor: ship.seederProperties.branchFactor,
        branchDecay: ship.seederProperties.branchDecay,
        spread: ship.seederProperties.spread,
        trunkLength: ship.seederProperties.trunkLength
    });
    //tree.angle = Math.atan2(x, -y);
    tree.attachmentConstraint = new p2.LockConstraint(this, tree);
    this.world.addConstraint(tree.attachmentConstraint);
};

module.exports = Planetoid;
