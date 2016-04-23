/**
 * Created by jay on 3/31/16.
 */
'use strict';

var Paths = require('../Paths.js');

module.exports = {
    proto: {
        _shape: Paths.octagon,
        _lineColor: '#00ff99',
        _fillColor: '#33cc33',
        _fillAlpha: 0.25,
        _lineWidth: 1
    },

    updateProperties: {
        lineColor: 'string',
        fillColor: 'string',
        lineWidth: 'ufixed16',
        fillAlpha: 'ufixed16',
        vectorScale: 'ufixed16'
    }
};