/**
 * Bullet.js
 *
 * Client side implementation of simple projectile
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var SimpleParticle = require('./SimpleParticle.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var UpdateProperties = require('../common/UpdateProperties.js').Bullet;

var Bullet = function (game, config) {
    SimpleParticle.call(this, game, 'bullet');
    this.setPosAngle(config.x, config.y, config.a);
};

Bullet.prototype = Object.create(SimpleParticle.prototype);
Bullet.prototype.constructor = Bullet;

Starcoder.mixinPrototype(Bullet.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(Bullet.prototype, UpdateProperties.prototype);

module.exports = Bullet;