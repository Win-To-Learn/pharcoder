/**
 * Weapons.js
 */

//var Starcoder = require('../../Starcoder-client.js');
var SimpleParticle = require('./SimpleParticle.js');

var Weapons = function (game, key, n) {
    Phaser.Group.call(this, game);
    n = n || 12;
    for (var i = 0; i < n; i++) {
        this.add(new SimpleParticle(game, key));
    }
    this.rateLimit = 500;
    this.salvo = 5;
    this.firingArc = 90;
    this._lastShot = 0;
};

Weapons.add = function (game, key, n) {
    var weapons = new Weapons(game, key, n);
    game.add.existing(weapons);
    return weapons;
};

Weapons.prototype = Object.create(Phaser.Group.prototype);
Weapons.prototype.constructor = Weapons;

Weapons.prototype.shoot = function () {
    var now = this.game.time.now;
    if ((now - this._lastShot) < this.rateLimit) {
        return;
    }
    this._lastShot = now;
    if (this.salvo === 1) {
        this._shootOne(0);
    } else if (this.firingArc > 0) {
        var start = -this.firingArc * Math.PI / 360;
        var delta = (this.firingArc / (this.salvo - 1)) * Math.PI / 180;
        for (var a = start, i = 0; i < this.salvo; a += delta, i++) {
            this._shootOne(a);
        }
    }
}

Weapons.prototype._shootOne = function (angleDelta) {
    var ship = this.ship;
    var bullet = this.getFirstDead();
    if (!bullet) {
        return;
    }
    bullet.lifespan = 1000;
    bullet.reset(ship.x, ship.y);
    bullet.body.velocity.x = 200*Math.sin(ship.rotation + angleDelta);
    bullet.body.velocity.y = -200*Math.cos(ship.rotation + angleDelta);
};

module.exports = Weapons;
//Starcoder.Weapons = Weapons;