/**
 * Alien.js
 *
 * shared client / server
 */
'use strict';

var Paths = require('../Paths.js');

module.exports = {
    proto: {
        //_lineColor: '#ffa500',
        _fillColor: '#999999',
        _lineWidth: 2,
        _shapeClosed: true,
        _fillAlpha: 0.25,
        _shape: Paths.hexagon
    },

    updateProperties: {
        vectorScale: 'ufixed16',
        lineColor: 'string',
        dead: 'boolean'
    }
};