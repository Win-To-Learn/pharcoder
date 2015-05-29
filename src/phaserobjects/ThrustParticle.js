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
    this.body.clearShapes();
    var shape = this.body.addParticle();
    shape.sensor = true;
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

ThrustParticle.Emitter.prototype.update = function () {
    // FIXME: Testing hack
    if (this._on) {
        for (var i = 0; i<20; i++) {
            var particle = this.getFirstDead();
            if (!particle) {
                break;
            }
            particle.lifespan = 250;
            particle.alpha = 0.5;
            var d = this.game.rnd.between(-7, 7);
            particle.reset(d, 10);
            particle.body.velocity.y = 80;
            particle.body.velocity.x = -3*d;
        }
    }
}

module.exports = ThrustParticle;
Starcoder.ThrustParticle = ThrustParticle;