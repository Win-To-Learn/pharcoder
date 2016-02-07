/**
 * Asteroid.js
 *
 * Server side implementation
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase.js');

var Paths = require('../../common/Paths.js');
var UpdateProperties = require('../../common/UpdateProperties.js').Asteroid;

var Crystal = require('./Crystal.js');

//var Starcoder = require('../../Starcoder-server.js');

//var shared = require('../shared/Asteroid.js');

var Asteroid = function (config) {
    SyncBodyBase.call(this, config);
    this.damping = 0;
    this.angularDamping = 0;
};

Asteroid.prototype = Object.create(SyncBodyBase.prototype);
Asteroid.prototype.constructor = Asteroid;

Starcoder.mixinPrototype(Asteroid.prototype, UpdateProperties.prototype);

Asteroid.prototype.clientType = 'Asteroid';
Asteroid.prototype.serverType = 'Asteroid';

//Asteroid.prototype.lineColor = '#ff00ff';
//Asteroid.prototype.fillColor = '#00ff00';
//Asteroid.prototype.shapeClosed = true;
//Asteroid.prototype.lineWidth = 1;
//Asteroid.prototype.fillAlpha = 0.25;
Asteroid.prototype._shape = Paths.octagon;

Asteroid.prototype.deadly = true;
Asteroid.prototype.tractorable = true;

//Asteroid.prototype.updateProperties = ['vectorScale', 'state'];

//Asteroid.prototype.getPropertyUpdate = function (propname, properties) {
//    switch (propname) {
//        default:
//            SyncBodyBase.prototype.getPropertyUpdate.call(this, propname, properties);
//    }
//};

Asteroid.prototype.explode = function (respawn) {
    this.world.addSyncableBody(Crystal, {
        x: this.position[0],
        y: this.position[1],
        mass: 10
    });
    this.world.removeSyncableBody(this);
    if (respawn) {
        this.world.addSyncableBody(Asteroid, {
            position: {random: 'world'},
            velocity: {random: 'vector', lo: -15, hi: 15},
            angularVelocity: {random: 'float', lo: -5, hi: 5},
            vectorScale: {random: 'float', lo: 0.6, hi: 1.4},
            mass: 10
        });
    }
};

Asteroid.prototype.beginContact = function (other) {
    switch (other.serverType) {
        case 'Bullet':
            other.firer.player.sendMessage('asteroid pop', this.vectorScale);
            this.explode(true);
            if (this.world) {}
            other.removeSelfFromWorld();
            break;
        case 'Tree':
            this.world.removeConstraint(other.attachmentConstraint);
            other.removeSelfFromWorld();
            break;
    }
};

module.exports = Asteroid;
