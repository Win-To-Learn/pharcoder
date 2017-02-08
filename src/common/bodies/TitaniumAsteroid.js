/**
 * Created by jonathanmar on 2/8/17.
 */

'use strict';

var Paths = require('../Paths.js');

module.exports = {
    proto: {
        _lineColor : '#c0c0c0',
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
