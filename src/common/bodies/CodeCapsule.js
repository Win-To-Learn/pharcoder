/**
 * CodeCapsule.js
 *
 * shared client / server
 */
'use strict';

var Paths = require('../Paths.js');

module.exports = {
    proto: {
        _lineColor: '#0000ff',
        _fillColor: '#ff0000',
        _lineWidth: 2,
        _shapeClosed: true,
        _fillAlpha: 0.1,

        _shape: [
            [2, 2],
            [2, -2],
            [1, -3],
            [-1, -3],
            [-2, -2],
            [-2, 2],
            [-1, 3],
            [1, 3]
        ]
    },

    updateProperties: {
        vectorScale : 'ufixed16',
        dead: 'boolean',
        lineColor: 'string'
    }
};