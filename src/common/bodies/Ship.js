/**
 * Ship.js
 * Common
 */
'use strict';

module.exports = {
    //proto: {
    //    _shape: [
    //        [-1,-1],
    //        [-0.5,0],
    //        [-1,1],
    //        [0,0.5],
    //        [1,1],
    //        [0.5,0],
    //        [1,-1],
    //        [0,-0.5]
    //    ],
    //    _shapeClosed: true
    //},

    updateProperties: {
        fillColor: 'string',
        lineColor: 'string',
        fillAlpha: 'ufixed16',
        lineWidth: 'ufixed16',
        vectorScale: 'ufixed16',
        shape: 'pairarrayfixed16',
        shapeClosed: 'boolean',
        dead: 'boolean',
        tag: 'string',
        crystals: 'uint16',
        playerid: 'string',
        charge: 'uint8',
        trees: 'uint16',
        thrustState: 'uint8'
    }
};