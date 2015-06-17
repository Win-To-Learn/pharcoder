/**
 * Crystal.js
 *
 * Server side implementation
 */
'use string';

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

var Crystal = function (options) {
    SyncBodyBase.call(this, options);
    this.damping = 0;
    this.angularDamping = 0;
};

Crystal.prototype = Object.create(SyncBodyBase.prototype);
Crystal.prototype.constructor = p2;

Crystal.prototype.sctype = 'Crystal';

Crystal.prototype.lineColor = '#00ffff';
Crystal.prototype.fillColor = '#000000';
Crystal.prototype.shapeClosed = true;
Crystal.prototype.lineWidth = 1;
Crystal.prototype.fillAlpha = 0.0;
Crystal.prototype.shape = [
    [2,1],
    [1,2],
    [-1,2],
    [-2,1],
    [-2,-1],
    [-1,-2],
    [1,-2],
    [2,-1]
];

Crystal.prototype.geometry = [
    {type: 'poly', closed: true, points: [
        [-1,-2],
        [-1,2],
        [2,-1],
        [-2,-1],
        [1,2],
        [1,-2],
        [-2,1],
        [2,1]]}
];

Crystal.prototype.updateProperties = ['fillColor', 'lineColor', 'fillAlpha', 'shapeClosed', 'shape', 'lineWidth',
    'geometry'];

//Crystal.prototype.getPropertyUpdate = function (propname, properties) {
//    switch (propname) {
//        default:
//            SyncBodyBase.prototype.getPropertyUpdate.call(this, propname, properties);
//    }
//};


module.exports = Crystal;
