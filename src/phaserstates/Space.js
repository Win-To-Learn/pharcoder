/**
 * Space.js
 *
 * Main game state for Starcoder
 */
'use strict';

var Starcoder = require('../Starcoder.js');
require('../phaserobjects/Ship.js');
require('../phaserobjects/Asteroid.js');

var Space = function () {
    if (!(this instanceof  Space)) {
        return new Space();
    }
};

Space.prototype = Object.create(Phaser.State.prototype);
Space.prototype.constructor = Phaser.State;

Space.prototype.create = function () {
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.world.setBounds.apply(this.world, this.game.starcoder.config.worldBounds);

    this.controls = this.input.keyboard.createCursorKeys();     // FIXME

    // Background
    var bgSource = this.game.make.graphics(0, 0);
    bgSource.lineStyle(2, 0xffffff, 0.5);
    bgSource.moveTo(190, 190);
    bgSource.lineTo(210,210);
    bgSource.moveTo(190, 210);
    bgSource.lineTo(210,190);
    this.game.add.tileSprite(-4200, -4200, 400, 400, bgSource.generateTexture(1, Phaser.scaleModes.DEFAULT));

    // FIXME - testing
    this.ship = Starcoder.Ship.add(this.game, 100, 200, '6sjz');
    this.game.camera.follow(this.ship);

    // More testing
    var i, a;
    for (i = 0; i < 100; i++) {
        a = Starcoder.Asteroid.add(this.game, this.world.randomX, this.world.randomY);
        a.body.velocity.x = this.game.rnd.between(-200,200);
        a.body.velocity.y = this.game.rnd.between(-200,200);
        a.body.angularVelocity = this.game.rnd.realInRange(-5, 5);
    }

};

Space.prototype.update = function () {
    if (this.controls.left.isDown) {
        this.ship.body.velocity.x = -150;
    } else if (this.controls.right.isDown) {
        this.ship.body.velocity.x = 150;
    } else if (this.controls.up.isDown) {
        this.ship.body.velocity.y = -150;
    } else if (this.controls.down.isDown) {
        this.ship.body.velocity.y = 150;
    } else {
        this.ship.body.velocity.x = 0;
        this.ship.body.velocity.y = 0;
    }
};

module.exports = Space;
Starcoder.States.Space = Space;
