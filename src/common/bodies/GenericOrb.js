/**
 * GenericOrb.js
 * Common
 */
'use strict';

var Paths = require('../Paths.js');

module.exports = {
    proto: {
        _shape: Paths.octagon
    },

    updateProperties: {
        lineColor: 'string',
        vectorScale: 'ufixed16'
    }
};