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

var star7ptInnerR = 0.75;
var star7ptOuterR = 1.5;
exports.star7pt = [
    [star7ptOuterR*sin(0), star7ptOuterR*cos(0)],
    [star7ptInnerR*sin(TAU/14), star7ptInnerR*cos(TAU/14)],
    [star7ptOuterR*sin(2*TAU/14), star7ptOuterR*cos(2*TAU/14)],
    [star7ptInnerR*sin(3*TAU/14), star7ptInnerR*cos(3*TAU/14)],
    [star7ptOuterR*sin(4*TAU/14), star7ptOuterR*cos(4*TAU/14)],
    [star7ptInnerR*sin(5*TAU/14), star7ptInnerR*cos(5*TAU/14)],
    [star7ptOuterR*sin(6*TAU/14), star7ptOuterR*cos(6*TAU/14)],
    [star7ptInnerR*sin(7*TAU/14), star7ptInnerR*cos(7*TAU/14)],
    [star7ptOuterR*sin(8*TAU/14), star7ptOuterR*cos(8*TAU/14)],
    [star7ptInnerR*sin(9*TAU/14), star7ptInnerR*cos(9*TAU/14)],
    [star7ptOuterR*sin(10*TAU/14), star7ptOuterR*cos(10*TAU/14)],
    [star7ptInnerR*sin(11*TAU/14), star7ptInnerR*cos(11*TAU/14)],
    [star7ptOuterR*sin(12*TAU/14), star7ptOuterR*cos(12*TAU/14)],
    [star7ptInnerR*sin(13*TAU/14), star7ptInnerR*cos(13*TAU/14)]
];
//exports.star7pt = [
//    [1,0.5],
//    [1,-0.5],
//    [-1,-1],
//    [-1,1]
//];

var star8ptInnerR = 0.75;
var star8ptOuterR = 1.5;
exports.star8pt = [
    [star8ptOuterR*sin(0), star8ptOuterR*cos(0)],
    [star8ptInnerR*sin(TAU/16), star8ptInnerR*cos(TAU/16)],
    [star8ptOuterR*sin(2*TAU/16), star8ptOuterR*cos(2*TAU/16)],
    [star8ptInnerR*sin(3*TAU/16), star8ptInnerR*cos(3*TAU/16)],
    [star8ptOuterR*sin(4*TAU/16), star8ptOuterR*cos(4*TAU/16)],
    [star8ptInnerR*sin(5*TAU/16), star8ptInnerR*cos(5*TAU/16)],
    [star8ptOuterR*sin(6*TAU/16), star8ptOuterR*cos(6*TAU/16)],
    [star8ptInnerR*sin(7*TAU/16), star8ptInnerR*cos(7*TAU/16)],
    [star8ptOuterR*sin(8*TAU/16), star8ptOuterR*cos(8*TAU/16)],
    [star8ptInnerR*sin(9*TAU/16), star8ptInnerR*cos(9*TAU/16)],
    [star8ptOuterR*sin(10*TAU/16), star8ptOuterR*cos(10*TAU/16)],
    [star8ptInnerR*sin(11*TAU/16), star8ptInnerR*cos(11*TAU/16)],
    [star8ptOuterR*sin(12*TAU/16), star8ptOuterR*cos(12*TAU/16)],
    [star8ptInnerR*sin(13*TAU/16), star8ptInnerR*cos(13*TAU/16)],
    [star8ptOuterR*sin(14*TAU/16), star8ptOuterR*cos(14*TAU/16)],
    [star8ptInnerR*sin(15*TAU/16), star8ptInnerR*cos(15*TAU/16)]
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