/**
 * StationBlock.js
 *
 * Server side
 */
'use strict';

var p2 = require('p2');

var Starcoder = require('../../common/Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase.js');
var Common = require('../../common/bodies/StationBlock.js');
var Paths = require('../../common/Paths.js');

var StationBlock = function (config) {
    SyncBodyBase.call(this, config);
};

StationBlock.prototype = Object.create(SyncBodyBase.prototype);
StationBlock.prototype.constructor = StationBlock;

Starcoder.mixinPrototype(StationBlock.prototype, Common);

StationBlock.prototype.serverType = 'StationBlock';
StationBlock.prototype.clientType = 'StationBlock';

StationBlock.prototype.defaults = {
    shape: Paths.square2
};

StationBlock.prototype.adjustShape = function () {
    SyncBodyBase.prototype.adjustShape.call(this);
    this.triangles = [];
    var vertMemo = {};
    for (var i = 0; i < this.shapes.length; i++) {
        var shape = this.shapes[i];
        if (shape instanceof p2.Convex) {
            var verts = shape.vertices;
            // Add triangles
            for (var j = 0, l = shape.triangles.length; j < l; j++) {
                var tri = shape.triangles[j];
                this.triangles.push([verts[tri[0]], verts[tri[1]], verts[tri[2]]]);
            }
            //// Add sensors at each vertex once and only once
            //for (j = 0, l = verts.length; j < l; j++) {
            //    var v = verts[j];
            //    var vs = String(v);
            //    if (!vertMemo[vs]) {
            //        var s = new p2.Circle({radius: 0.5});
            //        s.sensor = true;
            //        s.special = true;
            //        s.position[0] = v[0];
            //        s.position[1] = v[1];
            //        this.addShape(s);
            //        vertMemo[vs] = true;
            //    }
            //}
        }
    }
};

module.exports = StationBlock;