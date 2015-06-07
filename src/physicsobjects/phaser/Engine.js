/**
 * Engine.js
 */

//var Starcoder = require('../../Starcoder-client.js');
var SimpleParticle = require('./SimpleParticle.js');

var Engine = function (game, key, n) {
    Phaser.Group.call(this, game);
    n = n || 50;
    for (var i = 0; i < n; i++) {
        this.add(new SimpleParticle(game, key));
    }
    this._on = false;
};

Engine.add = function (game, key, n) {
    var emitter = new Engine(game, key, n);
    game.add.existing(emitter);
    return emitter;
};

Engine.prototype = Object.create(Phaser.Group.prototype);
Engine.prototype.constructor = Engine;

Engine.prototype.start = function () {
    this._on = true;
};

Engine.prototype.stop = function () {
    this._on = false;
}

Engine.prototype.update = function () {
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
};

module.exports = Engine;
//Starcoder.Engine = Engine;
