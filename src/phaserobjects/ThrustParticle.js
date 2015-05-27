/**
 * ThrustParticle.js
 *
 * Particle and emitter for exhaust trail
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var ThrustParticle = function (game, key) {
    var texture = ThrustParticle._textureCache[key];
    Phaser.Sprite.call(this, game, 0, 0, texture);
    game.physics.p2.enable(this, false, false);
    this.kill();
};

ThrustParticle._textureCache = {};

ThrustParticle.cacheTexture = function (game, key, color, size) {
    var texture = game.make.bitmapData(size, size);
    texture.ctx.fillStyle = color;
    texture.ctx.fillRect(0, 0, size, size);
    ThrustParticle._textureCache[key] = texture;
};

ThrustParticle.prototype = Object.create(Phaser.Sprite.prototype);
ThrustParticle.prototype.constructor = ThrustParticle;

ThrustParticle.Emitter = function (game, key, n) {
    Phaser.Group.call(this, game);
    n = n || 50;
    for (var i = 0; i < n; i++) {
        this.add(new ThrustParticle(game, key));
    }
    this._on = false;
};

ThrustParticle.Emitter.add = function (game, key, n) {
    var emitter = new ThrustParticle.Emitter(game, key, n);
    game.add.existing(emitter);
    return emitter;
};

ThrustParticle.Emitter.prototype = Object.create(Phaser.Group.prototype);
ThrustParticle.Emitter.prototype.constructor = ThrustParticle.Emitter;

ThrustParticle.Emitter.prototype.start = function (x, y, angle) {
    this._x = x;
    this._y = y;
    this._angle = angle;
    this._on = true;
};

ThrustParticle.Emitter.prototype.update = function () {
    // FIXME: Testing hack
    if (this._on) {
        var particle = this.getFirstDead();
        if (particle) {
            particle.revive();
            particle.x = this._x;
            particle.y = this._y;
            particle.body.velocity.x = 100;
        }
    }
}

module.exports = ThrustParticle;
Starcoder.ThrustParticle = ThrustParticle;