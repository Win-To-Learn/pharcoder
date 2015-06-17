/**
 * World.js
 *
 * Server side P2 physics world
 */
'use strict';

var p2 = require('p2');

var Ship = require('./Ship.js');
var Asteroid = require('./Asteroid.js');

var World = function (bounds) {
    p2.World.call(this, {
        broadphase: new p2.SAPBroadphase(),
        islandSplit: true,
        gravity: [0, 0]
    });
    this._setBounds.apply(this,bounds);
    this._syncableBodies = [];
    this._ships = [];
};

World.prototype = Object.create(p2.World.prototype);
World.prototype.constructor = World;

World.prototype.addSyncableBody = function (ctor, options, player) {
    if (options.position === 'random') {
        options.position = [Math.floor(Math.random()*(this.right - this.left)+this.left),
            Math.floor(Math.random()*(this.bottom - this.top)+this.top)];
    } else if (options.position === 'center') {
        options.position = [Math.floor((this.left + this.right)/2), Math.floor((this.top + this.bottom)/2)];
    }
    var body = new ctor(options);
    // Handle special cases (just Ships for now)
    switch (ctor) {
        case Ship:
            body.player = player;
            player.addShip(body);
            this._ships.push(body);
            break;
    }
    this._syncableBodies.push(body);
    this.addBody(body);
    return body;
};

World.prototype.start = function (rate, substeps) {
    var self = this;
    substeps = substeps || 10;
    this._lastHRTime = process.hrtime();
    // Add a bunch of asteroids
    for (var i = 0; i<100; i++) {
        //var x = Math.floor(Math.random()*40);
        //var y = Math.floor(Math.random()*20);
        var vx = 10*(Math.random()*5 - 2.5);
        var vy = 10*(Math.random()*5 - 2.5);
        var av = Math.random()*6 - 3;
        this.addSyncableBody(Asteroid, {
            position: 'random',
            velocity: [vx, vy],
            angularVelocity: av,
            mass: 10
        });
    }
    return setInterval(function () {
        var diff = process.hrtime(self._lastHRTime);
        self.preStep();
        self.step(rate, diff[0] + diff[1]*1e-9, substeps);
        self._lastHRTime = process.hrtime();
    }, rate*1000);
};

World.prototype.preStep = function () {
    for (var i = 0, l = this._syncableBodies.length; i < l; i++) {
        var body = this._syncableBodies[i];
        if (body.update) {
            body.update();
        }
    }
};

World.prototype._setBounds = function (l, t, r, b) {
    this.left = l;
    this.top = t;
    this.right = r;
    this.bottom = b;
    this._bounds = {
        bottom: new p2.Body({
            mass: 0,
            position: [0, b],
            angle: Math.PI
        }),
        left: new p2.Body({
            mass: 0,
            position: [l, 0],
            angle: -Math.PI/2
        }),
        top: new p2.Body({
            mass: 0,
            position: [0, t],
            angle: 0
        }),
        right: new p2.Body({
            mass: 0,
            position: [r, 0],
            angle: Math.PI/2
        })
    };
    for (var k in this._bounds) {
        var body = this._bounds[k];
        body.addShape(new p2.Plane());
        this.addBody(body);
    }
};

module.exports = World;