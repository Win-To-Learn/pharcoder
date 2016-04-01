/**
 * StationBlock.js
 *
 * Shared client / server
 */
'use strict';

module.exports = {
    proto: {
        _lineColor: '#6699cc',
        _fillColor: '#000000',
        _lineWidth: 4,
        _fillAlpha: 0,
        _shapeClosed: true
    },

    updateProperties: {
        lineColor : 'string',
        vectorScale : 'ufixed16',
        shape : 'pairarrayfixed16',
        triangles : 'json'}
};

