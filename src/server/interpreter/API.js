/**
 * API.js
 *
 * Public API for interacting with Starcoder world
 */
'use strict';

var API = {};

/**
 * Set line color for body
 *
 * @param body {p2.Body}
 * @param color {string}
 */
API.changeLineColor = function (body, color) {
    body.lineColor = color;
};
API.changeLineColor.meta = {
    args: [
        {name: 'body', type: 'object'},
        {name: 'color', type: 'string'}
    ]
};

/**
 * Set outline / physics shape for body
 *
 * @param body {p2.Body}
 * @param shape {Array<Array>}
 */
API.changeShape = function (body, shape) {
    body.shape = shape;
};

/**
 * Returns an array of all bodies within range units of body, optionally filtered by bodytype
 *
 * @param body {p2.Body}
 * @param range {number}
 * @param bodytype {string}
 * @returns {Array}
 */
API.scan = function (body, range, bodytype) {
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
API.scan.meta = {
    args: [
        {name: 'body', type: 'object'},
        {name: 'range', type: 'number'},
        {name: 'bodytype', type: 'string'}
    ],
    returns: {type: 'array'}
};

module.exports = API;
