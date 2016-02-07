/**
 * Planetoid.js
 *
 * Server side implementation
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

var Paths = require('../../common/Paths.js');
var UpdateProperties = require('../../common/UpdateProperties.js').Planetoid;

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

Planetoid.prototype._lineColor = '#00ff99';
Planetoid.prototype._fillColor = '#33cc33';
Planetoid.prototype._lineWidth = 1;
Planetoid.prototype._fillAlpha = 0.25;
Planetoid.prototype._shape = Paths.octagon;

Planetoid.prototype.adjustShape = function () {
    SyncBodyBase.prototype.adjustShape.call(this);
    this.centerSensor = new p2.Circle({radius: 0.1, sensor: true});
    this.setCollisionGroup(this.centerSensor);
    this.setCollisionMask(this.centerSensor, ['StationBlock']);
    this.addShape(this.centerSensor);
};

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

Planetoid.prototype.beginContact = function (other, equations) {
    switch (other.serverType) {
        case 'Ship':
            // First make sure this is first impact
            for (var i = 0, l = equations.length; i < l; i++) {
                if (!equations[i].firstImpact) {
                    return;
                }
            }
            // Then make sure we have enough crystals
            if (other.crystals >= 150) {
                other.crystals -= 150;
                // Assume common case of single point contact
                equations = equations[0];
                if (equations.bodyA === this) {
                    var point = equations.contactPointA;
                } else {
                    point = equations.contactPointB;
                }
                other.player.sendMessage('plant tree');
                other.player.achieve('planttree');
                this.plantTree(point[0], point[1], other);
                other.player.stats.treesPlanted++;
                this.starcoder.updatePlayerScore('Trees Planted', other.player.id, other.player.stats.treesPlanted);
            }
            break;
    }
};

module.exports = Planetoid;
