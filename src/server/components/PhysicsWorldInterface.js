/**
 * PhysicsWorldInterface.js
 */
'use strict';

var fs = require('fs');

var p2 = require('p2');
var randomColor = require('randomcolor');

var bodyDefs = {
    Ship: [require('../bodies/Ship.js'), require('../../common/bodies/Ship.js')],
    Asteroid: [require('../bodies/Asteroid.js'), require('../../common/bodies/Asteroid.js')],
    Crystal: [require('../bodies/Crystal.js'), require('../../common/bodies/Crystal.js')],
    Bullet: [require('../bodies/Bullet.js'), require('../../common/bodies/Bullet.js')],
    Hydra: [require('../bodies/Hydra.js'), require('../../common/bodies/GenericOrb.js')],
    Planetoid: [require('../bodies/Planetoid.js'), require('../../common/bodies/Planetoid.js')],
    Tree: [require('../bodies/Tree.js'), require('../../common/bodies/Tree.js')],
    TractorBeam: [require('../bodies/TractorBeam.js'), require('../../common/bodies/TractorBeam.js')],
    StarTarget: [require('../bodies/StarTarget.js'), require('../../common/bodies/StarTarget.js')],
    StationBlock: [require('../bodies/StationBlock.js'), require('../../common/bodies/StationBlock.js')],
    Alien: [require('../bodies/Alien.js'), require('../../common/bodies/Alien.js')],
    CodeCapsule: [require('../bodies/CodeCapsule.js'), require('../../common/bodies/CodeCapsule.js')]
};

var bodyTypes = {};


/**
 * Reference to main starcoder object
 * @private
 */
var starcoder;

/**
 * Reference to p2.World
 * @private
 */
var world;

module.exports = {
    init: function () {
        starcoder = this;
        world = new p2.World({
            broadphase: new p2.SAPBroadphase(),
            islandSplit: true,
            gravity: [0, 0]
        });
        world.on('addBody', function (event) {
            if (event.body.onWorldAdd) {
                event.body.onWorldAdd();
            }
        });
        world.on('removeBody', function (event) {
            if (event.body.onWorldRemove) {
                event.body.onWorldRemove();
            }
        });
        this.initBodies(bodyDefs, bodyTypes);
        setBounds.apply(this, starcoder.config.worldBounds);
        populate(starcoder.config.initialBodies);
        var lastHRTime = process.hrtime();
        this.events.on('physicsTick', function () {
            //console.log('physTick');
            var diff = process.hrtime(lastHRTime);
            // Per-object control functions
            for (var i = starcoder.worldapi.syncableBodies.length - 1; i >=0; i --) {
                var body = starcoder.worldapi.syncableBodies[i];
                // Control functions
                if (body.control) {
                    body.control();
                }
                // Timers
                if (body.timers.length) {
                    for (var j = body.timers.length - 1; j >= 0; j--) {
                        var timer = body.timers[j];
                        if (world.time >= timer.time) {
                            body.runTimer(body.timers[j]);
                            if (timer.repeat) {
                                timer.time = world.time + timer.repeat;
                            } else {
                                body.timers.splice(j, 1);
                            }
                        }
                    }
                }
            }
            // Run physics step
            world.step(starcoder.config.physicsInterval / 1000, diff[0] + diff[1]*1e-9,
                starcoder.config.physicsSubsteps);
            lastHRTime = process.hrtime();
        });
    },

    worldapi: {
        addSyncableBody: function (constructor, config) {
            var c = {};
            for (var k in config) {
                if (typeof config[k] === 'object' && config[k].random) {
                    c[k] = flexRand(config[k]);
                } else {
                    c[k] = config[k];
                }
            }
            var body = new constructor(starcoder, c);
            starcoder.worldapi.syncableBodies.push(body);
            world.addBody(body);
            return body;
        },

        removeSyncableBody: function (body) {
            for (var i = starcoder.worldapi.syncableBodies.length - 1; i >= 0; i--) {
                if (starcoder.worldapi.syncableBodies[i] === body) {
                    starcoder.worldapi.syncableBodies.splice(i, 1);
                    starcoder.worldapi.removedBodies.push(body.id);
                    world.removeBody(body);
                    break;
                }
            }
        },

        respawn: function (body, config) {
            body.dead = false;
            for (var k in config) {
                if (typeof config[k] === 'object' && config[k].random) {
                    body[k] = flexRand(config[k]);
                } else {
                    body[k] = config[k];
                }
            }
        },

        addPlayerShip: function (player) {
            var ship = starcoder.worldapi.addSyncableBody(bodyTypes.Ship,
                {position: {random: 'world', pad: 25}, lineColor: {random: 'color'}});
            ship.player = player;
            ship.tag = player.gamertag;
            player.addShip(ship);
            //starcoder._ships.push(ship);
            return ship;
        },

        setContactHandlers: function (begin, end) {
            world.on('beginContact', begin);
            world.on('endContact', end);
        },

        getWorldTime: function () {
            return world.time;
        },

        syncableBodies: [],

        removedBodies: []
    }
};

/**
 * Map of body types to constructors
 * @type {{}}
 */
var bodyTypes = {};

var initBodyTypes = function () {
    var re = /^(.*)\.js$/;
    fs.readdirSync(__dirname + '/../bodies/').forEach(function (d) {
        var m = re.exec(d);
        if (m && m[1] !== 'World' && m[1] !== 'SyncBodyBase') {
            bodyTypes[m[1]] = require('../bodies/' + m[0]);
        }
    });
};

/**
 * World bounds objects
 * @private
 */
var bounds;

/**
 * Set world bounds and create wall objects
 *
 * @param l {number} - coordinate of left boundary
 * @param t {number} - coordinates of top boundary
 * @param r {number} - coordinates of right boundary
 * @param b {number} - coordinates of bottom boundary
 * @private
 */
var setBounds = function (l, t, r, b) {
    world.left = l;
    world.top = t;
    world.right = r;
    world.bottom = b;
    bounds = {
        bottom: new p2.Body({
            mass: 0,
            position: [0, b],
            angle: 0
        }),
        left: new p2.Body({
            mass: 0,
            position: [l, 0],
            angle: 3*Math.PI/2
        }),
        top: new p2.Body({
            mass: 0,
            position: [0, t],
            angle: Math.PI
        }),
        right: new p2.Body({
            mass: 0,
            position: [r, 0],
            angle: Math.PI/2
        })
    };
    for (var k in bounds) {
        var body = bounds[k];
        var shape = new p2.Plane();
        shape.collisionMask = 0xffff;
        body.addShape(shape);
        world.addBody(body);
    }
};

/**
 * Add bodies to world based on descriptor array
 *
 * @param desc {Array} - descriptor of objects to add
 * @private
 */
var populate = function (desc) {
    for (var i = 0, l = desc.length; i < l; i++) {
        var ctor = bodyTypes[desc[i].type];
        var config = desc[i].config;
        for (var j = 0; j < desc[i].number; j++) {
            starcoder.worldapi.addSyncableBody(ctor, config);
        }
    }
};

/**
 * Generate random numbers for initializers
 *
 * @param spec
 * @private
 */
var flexRand = function (spec) {
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
            Math.floor(between(world.left + pad, world.right - pad + 1, spec.normal)),
            Math.floor(between(world.top + pad, world.bottom - pad + 1, spec.normal))
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
