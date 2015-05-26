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
    var wb = this.game.starcoder.config.worldBounds;
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.world.setBounds.apply(this.world, wb);

    this.controls = this.input.keyboard.createCursorKeys();     // FIXME
    this.game.time.advancedTiming = true;

    // Background
    var starfield = this.game.make.bitmapData(600, 600);
    drawStarField(starfield.ctx, 600, 16);
    this.game.add.tileSprite(wb[0], wb[1], wb[2]-wb[0], wb[3]-wb[1], starfield);

    // FIXME - testing
    this.ship = Starcoder.Ship.add(this.game, 0, 0, '6sjz');
    //console.log(this.ship.graphics);
    this.game.camera.follow(this.ship);
    this.game.camera.setPosition(-400,-300);

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

    function drawStar (ctx, x, y, d, color) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x-d+1, y-d+1);
        ctx.lineTo(x+d-1, y+d-1);
        ctx.moveTo(x-d+1, y+d-1);
        ctx.lineTo(x+d-1, y-d+1);
        ctx.moveTo(x, y-d);
        ctx.lineTo(x, y+d);
        ctx.moveTo(x-d, y);
        ctx.lineTo(x+d, y);
        ctx.stroke();
    }

    function drawStarField (ctx, size, n) {
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
                color = 'hsl(60,100%,' + rng.between(90,99) + '%)';
                drawStar(ctx,
                    rng.between(q[0]+7, q[2]-7), rng.between(q[1]+7, q[3]-7),
                    rng.between(3,6), color, rng.realInRange(0.5, 0.9));
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

Space.prototype.render = function () {
    this.game.debug.text('Fps: ' + this.game.time.fps, 5, 20);
    this.game.debug.cameraInfo(this.game.camera, 100, 20);
    this.game.debug.spriteInfo(this.ship, 420, 20);
};

module.exports = Space;
Starcoder.States.Space = Space;
