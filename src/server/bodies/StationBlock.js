/**
 * StationBlock.js
 *
 * Server side
 */
'use strict';

var p2 = require('p2');
var vec2 = p2.vec2;
var earcut = require('earcut');

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
    if (!this.shape) {
        return;
    }
    this.triangles = [];
    var flat = [];
    for (var i = 0, l = this.shape.length; i < l; i++) {
        flat.push(this.shape[i][0], this.shape[i][1]);
    }
    flat = earcut(flat);
    for (i = 0, l = flat.length; i < l; i += 3) {
        this.triangles.push([this.shape[flat[i]], this.shape[flat[i + 1]], this.shape[flat[i + 2]]]);
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
        //}
    //}
};

module.exports = StationBlock;