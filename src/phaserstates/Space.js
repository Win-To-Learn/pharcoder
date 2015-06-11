/**
 * Space.js
 *
 * Main game state for Starcoder
 */
'use strict';

//var Starcoder = require('../Starcoder-client.js');

var Ship = require('../physicsobjects/phaser/Ship.js');
//require('../physicsobjects/phaser/Asteroid.js');
//require('../physicsobjects/phaser/Crystal.js');
var SimpleParticle = require('../physicsobjects/phaser/SimpleParticle.js');

var Space = function () {
    if (!(this instanceof Space)) {
        return new Space();
    }
};

Space.prototype = Object.create(Phaser.State.prototype);
Space.prototype.constructor = Space;

Space.prototype.preload = function () {
    SimpleParticle.cacheTexture(this.game, 'thrust', '#ff6600', 2);
    SimpleParticle.cacheTexture(this.game, 'bullet', '#666666', 3);
};

Space.prototype.create = function () {
    var rng = this.game.rnd;
    var wb = this.game.starcoder.config.worldBounds;
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.world.setBounds.apply(this.world, wb);
    this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    //this.controls = this.input.keyboard.createCursorKeys();     // FIXME
    //this.controls.fire = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.starcoder.controls.reset();
    this.game.time.advancedTiming = true;

    // Background
    var starfield = this.game.make.bitmapData(600, 600);
    drawStarField(starfield.ctx, 600, 16);
    this.game.add.tileSprite(wb[0], wb[1], wb[2], wb[3], starfield);

    // Set up networking stuff - initial test implementation
    var self = this;
    this.game.starcoder.socket.emit('enter world');
    this.starcoder.serversync.start();
    //this.game.starcoder.socket.on('add ship', function (data) {
    //    console.log('Adding ship');
    //    self.ship = Starcoder.Ship.add(self.game, data.x, data.y, data.id);
    //    self.game.camera.follow(self.ship);
    //});

    //this.ship = Starcoder.Ship.add(this.game, 0, 0, '6sjz');
    //this.game.camera.follow(this.ship);
    //this.ship.reset(0, 0);

    //// More testing
    //var i, a;
    //
    //// Asteroids
    //for (i = 0; i < 10; i++) {
    //    a = Starcoder.Asteroid.add(this.game, this.world.randomX, this.world.randomY);
    //    a.body.velocity.x = this.game.rnd.between(-200,200);
    //    a.body.velocity.y = this.game.rnd.between(-200,200);
    //    a.body.angularVelocity = this.game.rnd.realInRange(-5, 5);
    //}
    //
    //// Crystals
    //for (i = 0; i < 10; i++) {
    //    a = Starcoder.Crystal.add(this.game, this.world.randomX, this.world.randomY);
    //    a.body.velocity.x = this.game.rnd.between(-200,200);
    //    a.body.velocity.y = this.game.rnd.between(-200,200);
    //    a.body.angularVelocity = this.game.rnd.realInRange(-5, 5);
    //}

    // Helpers
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
    this.starcoder.controls.processQueue(function (a) {
        console.log(a);
    });
    console.log('-update-');
    //for (var i=0; i<1000000; i++);
    //console.log('T', this.game.time.now, this.game.time.time,this.game.time.elapsed);
    //if (this.controls.left.isDown) {
    //    this.ship.body.rotateLeft(100);
    //} else if (this.controls.right.isDown) {
    //    this.ship.body.rotateRight(100);
    //} else {
    //    this.ship.body.setZeroRotation()
    //}
    //
    //if (this.controls.up.isDown) {
    //    //console.log(this.ship.engine.x, this.ship.engine.y);
    //    this.ship.engine.start();
    //    //this.ship.body.velocity.x = 100*Math.sin(this.ship.rotation);
    //    //this.ship.body.velocity.y = -100*Math.cos(this.ship.rotation);
    //    //this.ship.body.force.x = 20*Math.sin(this.ship.rotation);
    //    //this.ship.body.force.y = -20*Math.cos(this.ship.rotation);
    //    this.ship.body.thrust(100);
    //} else if (this.controls.down.isDown) {
    //    this.ship.body.reverse(80);
    //    //this.ship.body.velocity.x = -100*Math.sin(this.ship.rotation);
    //    //this.ship.body.velocity.y = 100*Math.cos(this.ship.rotation);
    //} else {
    //    this.ship.engine.stop();
    //    //this.ship.body.velocity.x = 0;
    //    //this.ship.body.velocity.y = 0;
    //    this.ship.body.setZeroForce();
    //    //this.ship.body.force.x = 0;
    //    //this.ship.body.force.y = 0;
    //}
    //
    //if (this.controls.fire.isDown) {
    //    this.ship.weapons.shoot();
    //}
};


Space.prototype.render = function () {
    console.log('+render+');
    if (this.starcoder.tempsprite) {
        console.log('Delta', this.starcoder.tempsprite.position.x - this.starcoder.tempsprite.previousPosition.x,
            this.game.time.elapsed);
    }
    console.log('--------------------------------');
    this.game.debug.text('Fps: ' + this.game.time.fps, 5, 20);
    this.game.debug.cameraInfo(this.game.camera, 100, 20);
    if (this.ship) {
        this.game.debug.spriteInfo(this.ship, 420, 20);
    }
};

module.exports = Space;
//Starcoder.States.Space = Space;
