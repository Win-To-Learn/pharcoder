/**
 * SyncBodyBase.js
 *
 * Base class for network syncable P2 Body
 */
'use strict';

var p2 = require('p2');

var SyncBodyBase = function (options) {
    options = options || {};
    if (this.preProcessOptions) {
        this.preProcessOptions(options);
    }
    p2.Body.call(this, options);
    if (this.postProcessOptions) {
        this.postProcessOptions(options);
    }
    this.adjustShape();
    this._dirtyProperties = {};
    this.newborn = true;
};

SyncBodyBase.prototype = Object.create(p2.Body.prototype);
SyncBodyBase.prototype.constructor = SyncBodyBase;

/**
 * Remove all previously added shapes from body
 */
SyncBodyBase.prototype.clearAllShapes = function () {
    for (var i=this.shapes.length-1; i >= 0; i--){
        this.removeShape(this.shapes[i]);
    }
};

/**
 * Adjust body shape based on _shape property with some reasonable fallbacks
 */
SyncBodyBase.prototype.adjustShape = function () {
    if (this._shape) {
        if (!this.fromPolygon(this._shape)) {
            // Non simple shape - use bounding circle
            var minx = 1000000, maxx = -1000000;
            var miny = 1000000, maxy = -1000000;
            for (var i = 0, l = this._shape.length; i < l; i++) {
                var x = this._shape[i][0];
                var y = this._shape[i][1];
                if (x > maxx) {
                    maxx = x;
                } else if (x < minx) {
                    minx = x;
                }
                if (y > maxy) {
                    maxy = y;
                } else if (y < miny) {
                    miny = y;
                }
            }
            var r = Math.sqrt((maxx - minx)*(maxy - miny));
            this.addShape(new p2.Circle(r))
        }
    } else {
        this.clearAllShapes();
        this.addShape(new p2.Circle(this._radius || 1));
    }
};

/**
 * Generate plain object representation of object state for client
 *
 * @param full {boolean} - Include all properties, not just those changed
 * @return {object}
 */
SyncBodyBase.prototype.getUpdatePacket = function (full) {
    var update = {
        id: this.id,
        x: this.interpolatedPosition[0],
        y: this.interpolatedPosition[1],
        vx: this.velocity[0],
        vy: this.velocity[1],
        a: this.interpolatedAngle,
        av: this.angularVelocity
    };
    if (full) {
        update.t = this.sctype;
    }
    if (!this.getPropertyUpdate) {
        return update;
    }
    for (var k in this._dirtyProperties) {
        if (full || this._dirtyProperties[k]) {
            this.getPropertyUpdate(k, update);
        }
    }
    return update;
};

/**
 * Generic property to update function for simplest case
 *
 * @param property {string}
 * @param update {object}
 */
SyncBodyBase.prototype.generalPropertyUpdate = function (property, update) {
    update[property] = this[property];
};

module.exports = SyncBodyBase;