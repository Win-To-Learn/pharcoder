/**
 * World.js
 *
 * Server side P2 physics world
 */
'use strict';

var p2 = require('p2');
var randomColor = require('randomcolor');

//var Ship = require('./Ship.js');
//var Asteroid = require('./Asteroid.js');

var bodyTypes = {
    Ship: require('./Ship.js'),
    Asteroid: require('./Asteroid.js'),
    Crystal: require('./Crystal.js'),
    Hydra: require('./Hydra.js'),
    Planetoid: require('./Planetoid.js'),
    Tree: require('./Tree.js'),
    StarTarget: require('./StarTarget.js'),
    StationBlock: require('./StationBlock.js'),
    Alien: require('./Alien.js')
};

/**
 * Construct physics world
 *
 * @param bounds {Array} - world boundary coords as [left, top, right, bottom]
 * @param initialBodies {Array} - descriptor of initial bodies to add to world
 * @constructor
 */
var World = function (starcoder, bounds, initialBodies) {
    p2.World.call(this, {
        broadphase: new p2.SAPBroadphase(),
        islandSplit: true,
        gravity: [0, 0]
    });
    this.starcoder = starcoder;
    this._syncableBodies = [];
    this._syncableBodiesNew = [];
    this._syncableBodiesRemoved = [];
    this._ships = [];
    this._cGroups = {};
    this._cGroupIdx = 1;
    this._setBounds.apply(this, bounds);
    this._populate(initialBodies);
};

World.prototype = Object.create(p2.World.prototype);
World.prototype.constructor = World;

/**
 * Set named collision group on body
 *
 * @param shapes {Shape|Shape[]} - Shape or array of shapes to set group for
 * @param groupname {string} - Name of group
 */
//World.prototype.setCollisionGroup = function (shapes, groupname) {
//    var gid = this._cGroups[groupname];
//    if (!gid) {
//        gid = this._createCollisionGroup(groupname);
//    }
//    //body.coreCollisionGroup = gid;
//    if (Array.isArray(shapes)) {
//        for (var i = 0, l = shapes.length; i < l; i++) {
//            shapes[i].collisionGroup = gid;
//        }
//    } else {
//        shapes.collisionGroup = gid;
//    }
//
//    //for (var i = 0, l = body.shapes.length; i < l; i++) {
//    //    var shape = body.shapes[i];
//    //    if (!shape.special) {
//    //        shape.collisionGroup = gid;
//    //    }
//    //}
//};

///**
// * Use named flags to set collision mask on body
// *
// * @param shapes {Shape|Shape[]} - Shape or shapes to set mask for
// * @param include {Array} - List of groups to enable collisions for
// * @param exclude {Array} - List of groups to disable collisions for
// */
//World.prototype.setCollisionMask = function (shapes, include, exclude) {
//    if (include && include.length >= 1) {
//        var mask = 0x0001;                          // For wall collisions
//        for (var i = 0, l = include.length; i < l; i++) {
//            var gid = this._cGroups[include[i]];
//            if (!gid) {
//                gid = this._createCollisionGroup(include[i]);
//            }
//            mask |= gid;
//        }
//    } else {
//        mask = 0xffff;
//    }
//    if (exclude && exclude.length >= 1) {
//        for (i = 0, l = exclude.length; i < l; i++) {
//            gid = this._cGroups[exclude[i]];
//            if (!gid) {
//                gid = this._createCollisionGroup(exclude[i]);
//            }
//            mask &= ~gid;
//        }
//    }
//    if (Array.isArray(shapes)) {
//        for (i = 0, l = shapes.length; i < l; i++) {
//            shapes[i].collisionMask = mask;
//        }
//    } else {
//        shapes.collisionMask = mask;
//    }
//    //body.coreCollisionMask = mask;
//    //for (i = 0, l = body.shapes.length; i < l; i++) {
//    //    var shape = body.shapes[i];
//    //    if (!shape.special) {
//    //        shape.collisionMask = mask;
//    //    }
//    //}
//};

///**
// * Create new collision group, with error check
// *
// * @param groupname
// * @returns {number}
// * @private
// */
//World.prototype._createCollisionGroup = function (groupname) {
//    if (this._cGroupIdx >= 32) {
//        console.log('Cannot create new collision group');
//    } else {
//        return this._cGroups[groupname] = Math.pow(2, this._cGroupIdx++);
//    }
//};

/**
 * Need to override so we easily trigger a callback on body being added
 *
 * @param body
 */
World.prototype.addBody = function (body) {
    p2.World.prototype.addBody.call(this, body);
    if (body.onWorldAdd) {
        body.onWorldAdd();
    }
};

/**
 * Need to override so we easily trigger a callback on body being removed (for cleaning up compound objects, etc.)
 *
 * @param body
 */
World.prototype.removeBody = function (body) {
    p2.World.prototype.removeBody.call(this, body);
    if (body.onWorldRemove) {
        body.onWorldRemove();
    }
};

World.prototype.addPlayerShip = function (player) {
    var ship = this.addSyncableBody(bodyTypes.Ship,
        {position: {random: 'world', pad: 25}, lineColor: {random: 'color'}}, player);
    ship.player = player;
    ship.tag = player.gamertag;
    player.addShip(ship);
    this._ships.push(ship);
    return ship;
};

/**
 * Add syncable (i.e. shared between client and server) body to world
 *
 * @param ctor {function} - constructor for body
 * @param config {object} - POJO with configuration data
 * @returns {object} - newly created body
 */
World.prototype.addSyncableBody = function (ctor, config) {
    var c = {};
    for (var k in config) {
        if (typeof config[k] === 'object' && config[k].random) {
            c[k] = this._flexRand(config[k]);
        } else {
            c[k] = config[k];
        }
    }
    var body = new ctor(c);
    //body.parentWorld = this;
    body.starcoder = this.starcoder;
    this._syncableBodiesNew.push(body);
    //this.setCollisionGroup(body, body.collisionGroup || body.serverType || 'general');
    //this.setCollisionMask(body, body.collisionInclude, body.collisionExclude);
    this.addBody(body);
    //console.log('Added', body.serverType, body.clientType, body.id);
    return body;
};

/**
 * Remove body from world and queue for client deletion on next update
 *
 * @param body
 */
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

/**
 * Revive a 'dead' body, possibly with new properties
 *
 * @param body
 * @param config
 */
World.prototype.respawn = function (body, config) {
    body.dead = false;
    for (var k in config) {
        if (typeof config[k] === 'object' && config[k].random) {
            body[k] = this._flexRand(config[k]);
        } else {
            body[k] = config[k];
        }
    }
};

/**
 * Start world simulation
 *
 * @param rate {number} - update rate in seconds
 * @param substeps {number} - max substeps per update
 * @returns {object} - interval descriptor
 */
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

/**
 * Call update functions on body objects
 */
World.prototype.preStep = function () {
    for (var i = this._syncableBodies.length - 1; i >= 0; i--) {
        var body = this._syncableBodies[i];
        if (body.control) {
            body.control();
        }
        if (body.timers.length) {
            for (var j = body.timers.length - 1; j >= 0; j--) {
                var timer = body.timers[j];
                if (this.time >= timer.time) {
                    body.runTimer(body.timers[j]);
                    if (timer.repeat) {
                        timer.time = this.time + timer.repeat;
                    } else {
                        body.timers.splice(j, 1);
                    }
                }
            }
        }
    }
    for (i = this._syncableBodiesNew.length - 1; i >= 0; i--) {
        body = this._syncableBodiesNew[i];
        if (body.control) {
            body.control();
        }
        if (body.timers.length) {
            for (j = body.timers.length - 1; j >= 0; j--) {
                timer = body.timers[j];
                if (this.time >= timer.time) {
                    body.runTimer(body.timers[j]);
                    if (timer.repeat) {
                        timer.time = this.time + timer.repeat;
                    } else {
                        body.timers.splice(j, 1);
                    }
                }
            }
        }
    }
};

/**
 * Set world bounds and create wall objects
 *
 * @param l {number} - coordinate of left boundary
 * @param t {number} - coordinates of top boundary
 * @param r {number} - coordinates of right boundary
 * @param b {number} - coordinates of bottom boundary
 * @private
 */
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
        var shape = new p2.Plane();
        shape.collisionMask = 0xffff;
        body.addShape(shape);
        this.addBody(body);
    }
};

/**
 * Add bodies to world based on descriptor array
 *
 * @param desc {Array} - descriptor of objects to add
 * @private
 */
World.prototype._populate = function (desc) {
    for (var i = 0, l = desc.length; i < l; i++) {
        var ctor = bodyTypes[desc[i].type];
        var config = desc[i].config;
        for (var j = 0; j < desc[i].number; j++) {
            this.addSyncableBody(ctor, config);
        }
    }
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
    } else if (spec.random === 'color') {
        return randomColor();
    }
};

module.exports = World;