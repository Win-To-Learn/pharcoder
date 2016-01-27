/**
 * Path.js
 *
 * Vector paths shared by multiple elements
 */
'use strict';

var PI = Math.PI;
var TAU = 2*PI;
var sin = Math.sin;
var cos = Math.cos;

exports.normalize = function (path, scale, x, y, close) {
    path = path.slice();
    var output = [];
    if (close) {
        path.push(path[0]);
    }
    for (var i = 0, l = path.length; i < l; i++) {
        var o = {x: path[i][0] * scale + x, y: path[i][1] * scale + y};
        output.push(o);
    }
    return output;
};

exports.octagon = [
    [2,1],
    [1,2],
    [-1,2],
    [-2,1],
    [-2,-1],
    [-1,-2],
    [1,-2],
    [2,-1]
];

exports.d2cross = [
    [-1,-2],
    [-1,2],
    [2,-1],
    [-2,-1],
    [1,2],
    [1,-2],
    [-2,1],
    [2,1]
];

exports.square0 = [
    [-1,-2],
    [2,-1],
    [1,2],
    [-2,1]
];

exports.square1 = [
    [1,-2],
    [2,1],
    [-1,2],
    [-2,-1]
];

exports.square2 = [
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1]
];

exports.star = [
    [sin(0), cos(0)],
    [sin(2*TAU/5), cos(2*TAU/5)],
    [sin(4*TAU/5), cos(4*TAU/5)],
    [sin(TAU/5), cos(TAU/5)],
    [sin(3*TAU/5), cos(3*TAU/5)]
];

exports.hexagon = [
    [2*cos(0*TAU/6), 2*sin(0*TAU/6)],
    [2*cos(1*TAU/6), 2*sin(1*TAU/6)],
    [2*cos(2*TAU/6), 2*sin(2*TAU/6)],
    [2*cos(3*TAU/6), 2*sin(3*TAU/6)],
    [2*cos(4*TAU/6), 2*sin(4*TAU/6)],
    [2*cos(5*TAU/6), 2*sin(5*TAU/6)]
];

exports.k6 = [
    [2*cos(0*TAU/6), 2*sin(0*TAU/6)],
    [2*cos(2*TAU/6), 2*sin(2*TAU/6)],
    [2*cos(4*TAU/6), 2*sin(4*TAU/6)],
    [2*cos(0*TAU/6), 2*sin(0*TAU/6)],
    [2*cos(3*TAU/6), 2*sin(3*TAU/6)],
    [2*cos(5*TAU/6), 2*sin(5*TAU/6)],
    [2*cos(1*TAU/6), 2*sin(1*TAU/6)],
    [2*cos(3*TAU/6), 2*sin(3*TAU/6)],
    [2*cos(4*TAU/6), 2*sin(4*TAU/6)],
    [2*cos(1*TAU/6), 2*sin(1*TAU/6)],
    [2*cos(2*TAU/6), 2*sin(2*TAU/6)],
    [2*cos(5*TAU/6), 2*sin(5*TAU/6)]
];

exports.OCTRADIUS = Math.sqrt(5);