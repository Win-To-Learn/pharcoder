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

SyncBodyBase.prototype.updateProperties = [];

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
    this.clearAllShapes();
    if (this._shape) {
        var convex = new p2.Convex(this._shape);
        this.addShape(convex, [0, 0]);
    } else {
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
    update.properties = {};
    for (var i = 0, l = this.updateProperties.length; i < l; i++) {
        var propname = this.updateProperties[i];
        if (full || this._dirtyProperties[propname]) {
            this.getPropertyUpdate(propname, update.properties);
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
SyncBodyBase.prototype.generalPropertyUpdate = function (propname, properties) {
    properties[propname] = this[propname];
};

module.exports = SyncBodyBase;