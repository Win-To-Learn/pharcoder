/**
 * Crystal.js
 *
 * Server side implementation
 */
'use string';

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');

var Paths = require('../common/Paths.js');

var Crystal = function (options) {
    SyncBodyBase.call(this, options);
    this.damping = 0;
    this.angularDamping = 0;
};

Crystal.prototype = Object.create(SyncBodyBase.prototype);
Crystal.prototype.constructor = p2;

Crystal.prototype.clientType = 'Crystal';
Crystal.prototype.serverType = 'Crystal';

//Crystal.prototype.lineColor = '#00ffff';
//Crystal.prototype.fillColor = '#000000';
//Crystal.prototype.shapeClosed = true;
//Crystal.prototype.lineWidth = 1;
//Crystal.prototype.fillAlpha = 0.0;
Crystal.prototype._shape = Paths.octagon;
//
//Crystal.prototype.geometry = [
//    {type: 'poly', closed: true, points: Paths.d2cross}
//];

Crystal.prototype.updateProperties = ['vectorScale'];

//Crystal.prototype.getPropertyUpdate = function (propname, properties) {
//    switch (propname) {
//        default:
//            SyncBodyBase.prototype.getPropertyUpdate.call(this, propname, properties);
//    }
//};

//Crystal.prototype.update = function () {
//    if (this.state === 'picked up') {
//        this.world.removeSyncableBody(this);
//    }
//};


module.exports = Crystal;
