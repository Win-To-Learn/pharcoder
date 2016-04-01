/**
 * Bullet.js
 *
 * Server side implementation
 */
'use strict';

var p2 = require('p2');

var SyncBodyBase = require('./SyncBodyBase.js');

var Bullet = function (starcoder, config) {
    config.mass = 1;
    SyncBodyBase.call(this, starcoder, config);
};

Bullet.prototype = Object.create(SyncBodyBase.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.clientType = 'Bullet';
Bullet.prototype.serverType = 'Bullet';

Bullet.prototype.adjustShape = function () {
    this.clearAllShapes();
    var particle = new p2.Particle();
    particle.sensor = true;
    this.addShape(particle);
    this.setCollisionGroup();
    this.setCollisionMask();
};

Bullet.prototype.update = function () {
    if (this.world.time >= this.tod) {
        this.world.removeSyncableBody(this);
    }
};

Bullet.prototype.beginContact = function () {
    this.removeSelfFromWorld();
};

module.exports = Bullet;
