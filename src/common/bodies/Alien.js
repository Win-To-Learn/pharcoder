/**
 * Alien.js
 *
 * shared client / server
 */
'use strict';

var Paths = require('../Paths.js');

module.exports = {
    _lineColor: '#ffa500',
    _fillColor: '#999999',
    _lineWidth: 2,
    _shapeClosed: true,
    _fillAlpha: 0.25,

    //_shape: [
    //    [1,0.5],
    //    [1.5,1],
    //    [2,1],
    //    [2,2],
    //    [1,2],
    //    [1,1.5],
    //    [0.5,1],
    //    [-0.5,1],
    //    [-1,1.5],
    //    [-1,2],
    //    [-2,2],
    //    [-2,1],
    //    [-1.5,1],
    //    [-1,0.5],
    //    [-1,-0.5],
    //    [-1.5,-1],
    //    [-2,-1],
    //    [-2,-2],
    //    [-1,-2],
    //    [-1,-1.5],
    //    [-0.5,-1],
    //    [0.5,-1],
    //    [1,-1.5],
    //    [1,-2],
    //    [2,-2],
    //    [2,-1],
    //    [1.5,-1],
    //    [1,-0.5]
    //],
    _shape: Paths.hexagon,
    updateProperties: ['vectorScale', 'dead']

};