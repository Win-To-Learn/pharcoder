/**
 * Bullet.js
 *
 * Server side implementation
 */
'use strict';

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

var Bullet = function (config) {
    config.mass = 1;
    SyncBodyBase.call(this, config);
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
};

Bullet.prototype.update = function () {
    if (this.world.time >= this.tod) {
        this.world.removeSyncableBody(this);
    }
};

module.exports = Bullet;
