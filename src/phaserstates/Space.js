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
    var rng = this.game.rnd;
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.world.setBounds.apply(this.world, this.game.starcoder.config.worldBounds);

    this.controls = this.input.keyboard.createCursorKeys();     // FIXME

    // Background
    var bgSource = this.game.make.graphics(0, 0);
    //bgSource.height = 400;
    //bgSource.width = 400;
    //bgSource.lineStyle(2, 0xffffff, 0.5);
    //bgSource.moveTo(190, 190);
    //bgSource.lineTo(210,210);
    //bgSource.moveTo(190, 210);
    //bgSource.lineTo(210,190);
    drawStarField(bgSource, 600, 16);
    bgSource.boundsPadding = 2;
    this.game.add.tileSprite(-1000, -1000, 2000, 2000, bgSource.generateTexture(1, this.game.renderer));

    // FIXME - testing
    this.ship = Starcoder.Ship.add(this.game, 0, 0, '6sjz');
    this.game.camera.follow(this.ship);

    // More testing
    var i, a;
    for (i = 0; i < 20; i++) {
        a = Starcoder.Asteroid.add(this.game, this.world.randomX, this.world.randomY);
        a.body.velocity.x = this.game.rnd.between(-200,200);
        a.body.velocity.y = this.game.rnd.between(-200,200);
        a.body.angularVelocity = this.game.rnd.realInRange(-5, 5);
    }

    function randomNormal () {
        var t = 0;
        for (var i=0; i<6; i++) {
            t += rng.normal();
        }
        return t/6;
    }

    function drawStar (graphics, x, y, d, color, alpha) {
        graphics.lineStyle(1, color, alpha);
        graphics.moveTo(x-d+1, y-d+1);
        graphics.lineTo(x+d-1, y+d-1);
        graphics.moveTo(x-d+1, y+d-1);
        graphics.lineTo(x+d-1, y-d+1);
        graphics.moveTo(x, y-d);
        graphics.lineTo(x, y+d);
        graphics.moveTo(x-d, y);
        graphics.lineTo(x+d, y);
    }

    function drawStarField (graphics, size, n) {
        var xm = Math.round(size/2 + randomNormal()*size/4);
        var ym = Math.round(size/2 + randomNormal()*size/4);
        var quads = [[0,0,xm-1,ym-1], [xm,0,size-1,ym-1],
            [0,ym,xm-1,size-1], [xm,ym,size-1,size-1]];
        var color;
        var i, j, l, q;

        n = Math.round(n/4);
        for (i=0, l=quads.length; i<l; i++) {
            q = quads[i];
            for (j=0; j<n; j++) {
                color = 0xffffff;
                drawStar(graphics,
                    rng.between(q[0], q[2]), rng.between(q[1], q[3]),
                    rng.between(3,7), color, rng.realInRange(0.5, 0.9));
            }
        }
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
