/**
 * API.js
 *
 * Public API for interacting with Starcoder world
 */
'use strict';

var decomp = require('poly-decomp');
var SCError = require('./SCError.js');

var StationBlock = require('../bodies/StationBlock.js');

var API = {};

var max = Math.max;
var min = Math.min;
var sqrt = Math.sqrt;
var atan2 = Math.atan2;
var cos = Math.cos;
var sin = Math.sin;
var clamp = function (a, x, b) {
    return  x < a ? a : (x > b ? b : x);
};
var D2R = Math.PI / 180;

var starcoder = null;

/**
 * init
 *
 * Init api and import references
 *
 * @param sc {Starcoder}
 */
Object.defineProperty(API, 'init', {
    value: function (sc) {
        starcoder = sc;
    },
    enumerable: false
});

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
    //if (shape.length < 3) {
    //    throw new SCError('Path must contain at least three points');
    //}
    //// Reversing x's due to coordinate system weirdness. Should probably be fixed elsewhere but this'll do for now
    //for (var i = 0, l = shape.length; i < l; i++) {
    //    shape[i][0] = -shape[i][0];
    //}
    //// Check to make sure poly isn't self intersecting
    //var p = new decomp.Polygon();
    //p.vertices = shape;
    //if (!p.isSimple()) {
    //    throw new SCError('Path cannot cross itself');
    //}
    _normalizeShape(shape);
    player.getShip().shape = shape;
};

API.directionsToPoints = function (player, directions) {
    var x = 0, y = 0;
    var heading = Math.PI / 2;
    var shape = [[0, 0]];
    for (var i = 0, l = directions.length; i < l; i++) {
        var step = directions[i].split(/\s+/);
        var command = step[0].toLowerCase();
        var param = Number(step[1]);
        switch (command) {
            case 'fd':
            case 'forward':
                x += cos(heading) * param;
                y += sin(heading) * param;
                shape.push([x, y]);
                break;
            case 'bk':
            case 'back':
                x -= cos(heading) * param;
                y -= sin(heading) * param;
                shape.push([x, y]);
                break;
            case 'rt':
            case 'right':
                heading -= param * D2R;
                break;
            case 'lt':
            case 'left':
                heading += param * D2R;
                break;
            default:
                throw new SCError('Unrecognized direction');
        }
    }
    return shape;
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
        if (target === body) {
            continue;
        }
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
 * Set turn force for player ship
 *
 * @param player {Player}
 * @param scale {number}
 */
API.setTurningForce = function (player, force) {
    player.getShip().turningForce = clamp(10, force, 150);
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
    seeder.depth = clamp(1, depth, 5);
};

/**
 * set timer for delayed or repeating actions
 *
 * @param player {Player}
 * @param func {function}
 * @param timeout {number}
 * @param repeat {boolean}
 */
API.setTimer = function (player, func, timeout, repeat) {
    var interpreter = player.interpreter;
    if (repeat) {
        interpreter.intervalCache.push(setInterval(function () {
            interpreter.addEvent(func);
        }, timeout*1000));
    } else {
        interpreter.timeoutCache.push(setTimeout(function () {
            interpreter.addEvent(func);
        }, timeout*1000));
    }
    interpreter.toggleEventLoop(true);
};
//API.setTimer.async = true;

/**
 * End event loop and allow code to exit
 *
 * @param player {Player}
 */
API.cancelEventLoop = function (player) {
    player.interpreter.toggleEventLoop(false);
};

/**
 * Return selected properties of body
 *
 * @param player {Player}
 * @param body {object}
 * @param property {string}
 * @returns {*}
 */
API.getBodyProperty = function (player, body, property) {
    switch (property) {
        case 'x':
        case 'y':
        case 'vx':
        case 'vy':
        case 'id':
            return body[property];
        case 'distance':
            var ship = player.getShip();
            var dx = ship.position[0] - body.x;
            var dy = ship.position[1] - body.y;
            return sqrt(dx*dx+ dy*dy);
    }
};

/**
 * Sort array of bodies by distance from player ship
 * Default is near to far. far to near if reverse is true
 *
 * @param player {Player}
 * @param bodies {Array}
 * @param reverse {boolean}
 * @returns {Array.<T>|string|*|Array|Blob|ArrayBuffer}
 */
API.sortByDistance = function (player, bodies, reverse) {
    var ship = player.getShip();
    var x = ship.position[0];
    var y = ship.position[1];
    var dir = reverse ? -1 : 1;
    var cmp = function (a, b) {
        var da = (a.x - x)*(a.x - x) + (a.y - y)*(a.y - y);
        var db = (b.x - x)*(b.x - x) + (b.y - y)*(b.y - y);
        return dir*(da - db);
    };
    bodies = bodies.slice();
    bodies.sort(cmp);
    return bodies;
};

/**
 * Set player ships heading to face body
 *
 * @param player {Player}
 * @param body {object}
 */
API.pointToBody = function (player, body) {
    if (Array.isArray(body)) {
        body = body[0];
    }
    if (!body) {
        return;
    }
    var ship = player.getShip();
    var dx = ship.position[0] - body.x;
    var dy = ship.position[1] - body.y;
    ship.angle = -atan2(dx, dy);
};

/**
 * console.log wrapper for testing
 *
 * @param player
 * @param msg
 */
API.log = function (player, msg) {
    console.log(msg);
};

/**
 * Turn music on
 *
 * @param player
 */
API.musicOn = function (player) {
    player.socket.emit('music', 'on');
    //starcoder.send(player, 'music', 'on');
};

/**
 * Turn music off
 *
 * @param player
 */
API.musicOff = function (player) {
    player.socket.emit('music', 'off');
    //starcoder.send(player, 'music', 'off');
};


/**
 * Show a short text string on the screen
 *
 * @param player
 * @param text {string}
 */
API.alert = function (player, text) {
    player.socket.emit('alert', text);
};

API.createStationBlock = function (player, shape) {
    _normalizeShape(shape);
    var ship = player.getShip();
    var station = ship.world.addSyncableBody(StationBlock, {shape: shape, vectorScale: 1, mass: 5, owner: player});
    // FIXME: positioning and error check
    var r = ship.boundingRadius + station.boundingRadius + 1;
    station.position[0] = ship.position[0] + sin(ship.angle) * r;
    station.position[1] = ship.position[1] + -cos(ship.angle) * r;
};

function _normalizeShape (shape) {
    if (shape.length < 3) {
        throw new SCError('Path must contain at least three points');
    }
    // Reversing x's due to coordinate system weirdness. Should probably be fixed elsewhere but this'll do for now
    for (var i = 0, l = shape.length; i < l; i++) {
        shape[i][0] = -shape[i][0];
    }
    // Check to make sure poly isn't self intersecting
    var p = new decomp.Polygon();
    p.vertices = shape;
    if (!p.isSimple()) {
        throw new SCError('Path cannot cross itself');
    }
}

module.exports = API;
