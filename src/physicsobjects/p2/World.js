/**
 * World.js
 *
 * Server side P2 physics world
 */
'use strict';

var p2 = require('p2');

var Ship = require('./Ship.js');
var Asteroid = require('./Asteroid.js');

var World = function () {
    p2.World.call(this, {
        broadphase: new p2.SAPBroadphase(),
        islandSplit: true,
        gravity: [0, 0]
    });
};

World.prototype = Object.create(p2.World.prototype);
World.prototype.constructor = World;

// Stub implementation for testing
World.prototype.addShip = function () {
    var s = new Ship();
    this.addBody(s)
    return s;
};

World.prototype.start = function (rate, substeps) {
    var self = this;
    substeps = substeps || 10;
    this._lastHRTime = process.hrtime();
    // Add a bunch of asteroids
    for (var i = 0; i<100; i++) {
        var x = Math.floor(Math.random()*40);
        var y = Math.floor(Math.random()*20);
        var vx = 10*(Math.random()*5 - 2.5);
        var vy = 10*(Math.random()*5 - 2.5);
        var av = Math.random()*6 - 3;
        this.addBody(new Asteroid({
            position: [x, y],
            velocity: [vx, vy],
            angularVelocity: av,
            mass: 10
        }));
    }
    return setInterval(function () {
        var diff = process.hrtime(self._lastHRTime);
        self.step(rate, diff[0] + diff[1]*1e-9, substeps);
        self._lastHRTime = process.hrtime();
    }, rate*1000);
};

World.prototype.createBounds = function (l, t, w, h) {
    this._bounds = {
        bottom: new p2.Body({
            mass: 0,
            position: [0, t+h],
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
            position: [l+w, 0],
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