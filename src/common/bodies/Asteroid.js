/**
 * Asteroid.js
 * Common
 */
'use strict';

var Paths = require('../Paths.js');

module.exports = {
    proto: {
        _lineColor : '#ff00ff',
        _fillColor : '#ff0000',
        _shapeClosed : true,
        _lineWidth : 1,
        _fillAlpha : 0.25,
        _shape : Paths.octagon
    },

    updateProperties: {
        vectorScale: 'ufixed16'
    }
};