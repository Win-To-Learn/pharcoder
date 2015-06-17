/**
 * World.js
 *
 * Server side P2 physics world
 */
'use strict';

var p2 = require('p2');

//var Ship = require('./Ship.js');
//var Asteroid = require('./Asteroid.js');

var bodyTypes = {
    Ship: require('./Ship.js'),
    Asteroid: require('./Asteroid.js'),
    Crystal: require('./Crystal.js')
};

var World = function (bounds, initialBodies) {
    p2.World.call(this, {
        broadphase: new p2.SAPBroadphase(),
        islandSplit: true,
        gravity: [0, 0]
    });
    this._syncableBodies = [];
    this._ships = [];
    this._setBounds.apply(this, bounds);
    this._populate(initialBodies);
};

World.prototype = Object.create(p2.World.prototype);
World.prototype.constructor = World;

World.prototype.addPlayerShip = function (player) {
    var ship = this.addSyncableBody(bodyTypes.Ship, {position: 'random'}, player);
    ship.player = player;
    player.addShip(ship);
    this._ships.push(ship);
    return ship;
}

World.prototype.addSyncableBody = function (ctor, options, player) {
    if (options.position === 'random') {
        options.position = [Math.floor(Math.random()*(this.right - this.left)+this.left),
            Math.floor(Math.random()*(this.bottom - this.top)+this.top)];
    } else if (options.position === 'center') {
        options.position = [Math.floor((this.left + this.right)/2), Math.floor((this.top + this.bottom)/2)];
    }
    var body = new ctor(options);
    this._syncableBodies.push(body);
    this.addBody(body);
    return body;
};

World.prototype.start = function (rate, substeps) {
    var self = this;
    substeps = substeps || 10;
    this._lastHRTime = process.hrtime();
    //for (var i = 0; i<100; i++) {
    //    //var x = Math.floor(Math.random()*40);
    //    //var y = Math.floor(Math.random()*20);
    //    var vx = 10*(Math.random()*5 - 2.5);
    //    var vy = 10*(Math.random()*5 - 2.5);
    //    var av = Math.random()*6 - 3;
    //    this.addSyncableBody(Asteroid, {
    //        position: 'random',
    //        velocity: [vx, vy],
    //        angularVelocity: av,
    //        mass: 10
    //    });
    //}
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

World.prototype._populate = function (desc) {
    var count = 0;
    for (var i = 0, l = desc.length; i < l; i++) {
        var ctor = bodyTypes[desc[i].type];
        var config = desc[i].config;
        for (var j = 0; j < desc[i].number; j++) {
            // TODO: Various randomizers, etc.
            var body = this.addSyncableBody(ctor, config);
            console.log(body.position[0], body.position[1]);
            count++;
        }
    }
    console.log('Added', count, 'bodies');
};

module.exports = World;