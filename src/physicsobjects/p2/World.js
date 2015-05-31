/**
 * World.js
 *
 * Server side P2 physics world
 */
'use strict';

var p2 = require('p2');

var World = function (rate) {
    p2.World.call(this, {
        broadphase: new p2.SAPBroadphase(),
        gravity: [0, 0]
    });
    this.rate = rate || (1/60);
};

World.prototype = Object.create(p2.World.prototype);
World.prototype.constructor = World;