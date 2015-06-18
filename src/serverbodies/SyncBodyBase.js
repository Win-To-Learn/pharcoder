/**
 * SyncBodyBase.js
 *
 * Base class for network syncable P2 Body
 */
'use strict';

var p2 = require('p2');

var SyncBodyBase = function (config) {
    config = config || {};
    if (this.preProcessOptions) {
        this.preProcessOptions(config);
    }
    p2.Body.call(this, config);
    for (var i = 0, l = this.updateProperties.length; i < l; i++) {
        var propname = this.updateProperties[i];
        if (config[propname]) {
            this[propname] = config[propname];
        }
    }
    if (this.postProcessOptions) {
        this.postProcessOptions(config);
    }
    this.adjustShape();
    this._dirtyProperties = {};
    this.newborn = true;
};

SyncBodyBase.prototype = Object.create(p2.Body.prototype);
SyncBodyBase.prototype.constructor = SyncBodyBase;

SyncBodyBase.prototype.updateProperties = [];
SyncBodyBase.prototype.vectorScale = 1;

/**
 * Remove all previously added shapes from body
 */
SyncBodyBase.prototype.clearAllShapes = function () {
    for (var i=this.shapes.length-1; i >= 0; i--){
        this.removeShape(this.shapes[i]);
    }
};

/**
 * Adjust body shape based on shape property with some reasonable fallbacks
 */
SyncBodyBase.prototype.adjustShape = function () {
    this.clearAllShapes();
    var polyflag = false;
    if (this.shape) {
        var vertices = [];
        var x = this.position[0], y = this.position[1];
        for (var i = 0, l = this.shape.length; i < l; i++) {
            vertices.push([x + this.shape[i][0]*this.vectorScale, y + this.shape[i][1]*this.vectorScale]);
        }
        polyflag = this.fromPolygon(vertices);
        //var convex = new p2.Convex(vertices);
        //this.addShape(convex, [0, 0]);
        if (polyflag) {
       }
    }
    if (polyflag) {
        // Not entirely sure why this is necessary
        this.position[0] = x;
        this.position[1] = y;
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
        update.t = this.clientType;
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

SyncBodyBase.prototype.getPropertyUpdate = function (propname, properties) {
    switch (propname) {
        case 'lineColor':
        case 'fillColor':
        case 'lineWidth':
        case 'fillAlpha':
        case 'shapeClosed':
        case 'shape':
        case 'geometry':
        case 'vectorScale':
            properties[propname] = this[propname];
            break;
    }
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

/**
 * Sets component velocities based on current angle
 *
 * @param {number} mag - Magnitude of velocity
 */
SyncBodyBase.prototype.setPolarVelocity = function (mag) {
    this.velocity[0] = Math.sin(this.angle)*mag;
    this.velocity[1] = -Math.cos(this.angle)*mag;
};

/**
 * Sets component forces based on current angle
 *
 * @param {number} mag - Magnitude of force
 */
SyncBodyBase.prototype.setPolarForce = function (mag) {
    this.force[0] = Math.sin(this.angle)*mag;
    this.force[1] = -Math.cos(this.angle)*mag;
};

module.exports = SyncBodyBase;