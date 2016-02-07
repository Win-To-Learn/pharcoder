/**
 * Bullet.js
 *
 * Server side implementation
 */
'use strict';

var p2 = require('p2');

var Starcoder = require('../../common/Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase.js');
var UpdateProperties = require('../../common/UpdateProperties.js').Bullet;

var Bullet = function (config) {
    config.mass = 1;
    SyncBodyBase.call(this, config);
};

Bullet.prototype = Object.create(SyncBodyBase.prototype);
Bullet.prototype.constructor = Bullet;

Starcoder.mixinPrototype(Bullet.prototype, UpdateProperties.prototype);

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
