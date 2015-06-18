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
    this._syncableBodiesNew = [];
    this._syncableBodiesRemoved = [];
    this._ships = [];
    this._setBounds.apply(this, bounds);
    this._populate(initialBodies);
};

World.prototype = Object.create(p2.World.prototype);
World.prototype.constructor = World;

World.prototype.addPlayerShip = function (player) {
    var ship = this.addSyncableBody(bodyTypes.Ship, {position: 'random', mass: 10}, player);
    ship.player = player;
    player.addShip(ship);
    this._ships.push(ship);
    return ship;
};

World.prototype.addSyncableBody = function (ctor, config) {
    if (config.position === 'random') {
        config.position = [Math.floor(Math.random()*(this.right - this.left)+this.left),
            Math.floor(Math.random()*(this.bottom - this.top)+this.top)];
    } else if (config.position === 'center') {
        config.position = [Math.floor((this.left + this.right)/2), Math.floor((this.top + this.bottom)/2)];
    }
    var body = new ctor(config);
    this._syncableBodiesNew.push(body);
    this.addBody(body);
    return body;
};

World.prototype.removeSyncableBody = function (body) {
    var removed = false;
    for (var i = this._syncableBodies.length - 1; i >=0; i--) {
        if (this._syncableBodies[i] === body) {
            this._syncableBodies.splice(i, 1);
            removed = true;
            break;
        }
    }
    if (!removed) {
        for (i = this._syncableBodiesNew.length - 1; i >=0; i--) {
            if (this._syncableBodiesNew[i] === body) {
                this._syncableBodiesNew.splice(i, 1);
                removed = true;
                break;
            }
        }
    }
    if (removed) {
        this._syncableBodiesRemoved.push(body);
        this.removeBody(body);
    }
};

World.prototype.start = function (rate, substeps) {
    var self = this;
    substeps = substeps || 10;
    this._lastHRTime = process.hrtime();
    return setInterval(function () {
        var diff = process.hrtime(self._lastHRTime);
        self.preStep();
        self.step(rate, diff[0] + diff[1]*1e-9, substeps);
        self._lastHRTime = process.hrtime();
    }, rate*1000);
};

World.prototype.preStep = function () {
    for (var i = this._syncableBodies.length - 1; i >= 0; i--) {
        var body = this._syncableBodies[i];
        if (body.update) {
            body.update();
        }
    }
    for (i = this._syncableBodiesNew.length - 1; i >= 0; i--) {
        body = this._syncableBodiesNew[i];
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
            angle: 3*Math.PI/2
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
            var c = {};
            for (var k in config) {
                if (typeof config[k] === 'object' && config[k].random) {
                    c[k] = this._flexRand(config[k]);
                } else {
                    c[k] = config[k];
                }
            }
            var body = this.addSyncableBody(ctor, c);
            count++;
        }
    }
    //this.log('Added', count, 'bodies');
};

/**
 * Generate random numbers for initializers
 *
 * @param spec
 * @private
 */
World.prototype._flexRand = function (spec) {
    function between (l, h, n) {
        var r = Math.random();
        if (n) {
            for (var i = 0; i < 5; i++) {
                r += Math.random();
            }
            r /= 6;
        }
        return l + r*(h - l);
    }
    if (spec.random === 'int') {
        return Math.floor(between(spec.lo, spec.hi + 1, spec.normal));
    } else if (spec.random === 'float') {
        return between(spec.lo, spec.hi, spec.normal);
    } else if (spec.random === 'world') {
        var pad = spec.pad || 0;
        return [
            Math.floor(between(this.left + pad, this.right - pad + 1, spec.normal)),
            Math.floor(between(this.top + pad, this.bottom - pad + 1, spec.normal))
        ];
    } else if (spec.random === 'vector') {
        return [
            between(spec.lo, spec.hi, spec.normal),
            between(spec.lo, spec.hi, spec.normal)
        ];
    }
};

module.exports = World;