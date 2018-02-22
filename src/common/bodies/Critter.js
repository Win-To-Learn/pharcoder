/**
 * Critter.js
 *
 * shared client / server
 */
'use strict';

var Paths = require('../Paths.js');

module.exports = {
    proto: {
        _lineColor: '#ffa500',
        _fillColor: '#999999',
        _lineWidth: 2,
        _shapeClosed: true,
        _fillAlpha: 0.25,
        _shape: Paths.square0,
        _genome: [0, 0, 0]
    },

    updateProperties: {
        dead: 'boolean',
        genome: 'arrayuint8'
    }
};