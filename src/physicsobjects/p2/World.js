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
        gravity: [0, 0]
    });
    //Debug hack
    this.on('addBody', function () {
        console.log('add body');
    });
    //this.on('postStep', function () {
    //    console.log('step', this.time);
    //});
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
    for (var i = 0; i<20; i++) {
        var x = Math.floor(Math.random()*40);
        var y = Math.floor(Math.random()*20);
        var vx = Math.random()*10 - 5;
        var vy = Math.random()*10 - 5;
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

//World.prototype.getSnapshot = function () {
//    var snap = {wtime: this.time, rtime: Date.now()};
//    var bodies = [];
//    for (var i = 0, l = this.bodies.length; i < l; i++) {
//        var b = this.bodies[i];
//        bodies.push({
//            id: b.id,
//            x: b.position[0],
//            y: b.position[1],
//            vx: b.position[0],
//            vy: b.position[1],
//            a: b.angle,
//            av: b.angularVelocity
//        });
//    }
//    snap.bodies = bodies;
//    return snap;
//};

module.exports = World;