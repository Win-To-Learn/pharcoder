/**
 * API.js
 *
 * Public API for interacting with Starcoder world
 */
'use strict';

var API = {};

var max = Math.max;
var min = Math.min;
var clamp = function (a, x, b) {
    return  x < a ? a : (x > b ? b : x);
};
var D2R = Math.PI / 180;

/**
 * Set line color for ship
 *
 * @param player {Player}
 * @param color {string}
 */
API.changeShipColor = function (player, color) {
    player.getShip().lineColor = color;
};

/**
 * Set outline / physics shape for body
 *
 * @param player {Player}
 * @param shape {Array<Array>}
 */
API.changeShipShape = function (player, shape) {
    player.getShip().shape = shape;
};

/**
 * Returns an array of all bodies within range units of body, optionally filtered by bodytype
 *
 * @param player {Player}
 * @param body {p2.Body}
 * @param range {number}
 * @param bodytype {string}
 * @returns {Array}
 */
API.scan = function (player, body, range, bodytype) {
    var r2 = range * range;
    var x = body.position[0];
    var y = body.position[1];
    var result = [];
    for (var i = 0, l = body.world.bodies.length; i < l; i++) {
        var target = body.world.bodies[i];
        if (target.serverType && (!bodytype || bodytype === target.serverType)) {
            if ((x-target.position[0])*(x-target.position[0]) + (y-target.position[1])*(y-target.position[1]) <= r2) {
                result.push(target);
            }
        }
    }
    return result;
};

/**
 * Scan centered around player ship
 *
 * @param player
 * @param bodytype
 * @returns {Array}
 */
API.localScan = function (player, bodytype) {
    var ship = player.getShip();
    return API.scan(player, ship, ship.scanRange || 25, bodytype);
};

/**
 * Fire one shot
 *
 * @param player {Player}
 */
API.shoot = function (player) {
    var ship = player.getShip();
    ship.state.firing = true;
    ship.state.oneshot = true;
};

/**
 * Set scale factor for player ship
 *
 * @param player {Player}
 * @param scale {number}
 */
API.setShipScale = function (player, scale) {
    player.getShip().vectorScale = clamp(0.2, scale, 3);
};

/**
 * Set thrust force for player ship
 *
 * @param player {Player}
 * @param scale {number}
 */
API.setThrustForce = function (player, force) {
    player.getShip().thrustForce = clamp(100, force, 1500);
};

/**
 * Move ship to new position
 *
 * @param player {Player}
 * @param x {number}
 * @param y {number}
 */
API.translate = function (player, x, y) {
    var ship = player.getShip();
    ship.position[0] = x;
    ship.position[1] = y;
};

/**
 * Set heading of player ship
 *
 * @param player
 * @param angle
 */
API.rotate = function (player, angle) {
    player.getShip().angle = angle * D2R;
};

/**
 * Set properties for planted trees
 *
 * @param player {Player}
 * @param trunkLength {number}
 * @param branchFactor {number}
 * @param branchDecay {number}
 * @param spread {number}
 * @param depth {number}
 */
API.setSeederProperties = function (player, trunkLength, branchFactor, branchDecay, spread, depth) {
    var seeder = player.getShip().seederProperties;
    seeder.trunkLength = trunkLength;
    seeder.branchFactor = branchFactor;
    seeder.branchDecay = branchDecay;
    seeder.spread = clamp(30, spread, 160);
    seeder.depth = clamp(1, 5);
};

API.setTimer = function (player, func, timeout) {
    setInterval(function () {
        player.codeEventQueue.push(func);
    }, timeout);
};
API.setTimer.async = true;

module.exports = API;
