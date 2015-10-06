/**
 * SyncBodyBase.js
 *
 * Base class for network syncable P2 Body
 */
'use strict';

var p2 = require('p2');

var SyncBodyBase = function (config) {
    this._dirtyProperties = {};
    config = config || {};
    this.setDefaults(config);
    p2.Body.call(this, config);
    for (var k in config) {
        switch (k) {
            case 'x':
                this.position[0] = config[k];
                break;
            case 'y':
                this.position[1] = config[k];
                break;
            case 'vx':
                this.velocity[0] = config[k];
                break;
            case 'vy':
                this.velocity[1] = config[k];
                break;
            default:
                if (!this[k]) {
                    this[k] = config[k];
                }
                break;
        }
    }
    if (this.customize) {
        this.customize(config);
    }
    this.timers = [];
    this.adjustShape();
    this.newborn = true;
    this.dead = false;
};

SyncBodyBase.prototype = Object.create(p2.Body.prototype);
SyncBodyBase.prototype.constructor = SyncBodyBase;

SyncBodyBase.prototype.updateProperties = [];
SyncBodyBase.prototype.defaults = {mass: 1, vectorScale: 1};

SyncBodyBase.prototype.setDefaults = function (config) {
    for (var k in this.defaults) {
        if (!config[k]) {
            config[k] = this.defaults[k];
        }
    }
};

SyncBodyBase.prototype.setTimer = function (time, spec, repeat) {
    spec.time = this.world.time + time;
    if (repeat) {
        spec.repeat = repeat;
    }
    this.timers.push(spec);
};

SyncBodyBase.prototype.runTimer = function (timer) {
    if (timer.props) {
        for (var key in timer.props) {
            this[key] = timer.props[key];
        }
    }
    if (timer.fun) {
        var args = timer.args || [];
        timer.fun.apply(this, args);
    }
};

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
    var oldGroup, oldMask;
    if (this.shapes.length > 0) {
        // For now all bodies are made of shapes with same collision group/mask
        oldGroup = this.shapes[0].collisionGroup;
        oldMask = this.shapes[0].collisionMask;
    }
    var polyflag = false;
    if (this._shape) {
        var vertices = [];
        var x = this.position[0], y = this.position[1];
        for (var i = 0, l = this.shape.length; i < l; i++) {
            vertices.push([x + this.shape[i][0]*this.vectorScale, y + this.shape[i][1]*this.vectorScale]);
        }
        polyflag = this.fromPolygon(vertices);
    }
    if (polyflag) {
        // Not entirely sure why this is necessary
        this.position[0] = x;
        this.position[1] = y;
    } else {
        this.clearAllShapes();
        this.addShape(new p2.Circle(this._radius || 1));
    }
    //this.world.setCollisionGroup(this, this.collisionGroup || this.serverType || 'general');
    //this.world.setCollisionMask(this, this.collisionInclude, this.collisionExclude);
    // Reset old group/mask on all shapes
    if (oldGroup || oldMask) {
        for (i = 0, l = this.shapes.length; i < l; i++) {
            this.shapes[i].collisionGroup = oldGroup;
            this.shapes[i].collisionMask = oldMask;
        }
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
    //if (!this.getPropertyUpdate) {
    //    return update;
    //}
    var properties = {};
    var hasProps = false;
    for (var i = 0, l = this.updateProperties.length; i < l; i++) {
        var propname = this.updateProperties[i];
        if (full || this._dirtyProperties[propname]) {
            hasProps = true;
            this.getPropertyUpdate(propname, properties);
        }
    }
    if (hasProps) {
        update.properties = properties;
    }
    return update;
};

/**
 * Copy object property to properties object. Subclasses can offer more complex behavior for specific properties
 *
 * @param propname
 * @param properties
 */
SyncBodyBase.prototype.getPropertyUpdate = function (propname, properties) {
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

/**
 * Clear dirty flag for all properties
 */
SyncBodyBase.prototype.clean = function () {
    this._dirtyProperties = {};
};

// Common vector properties

Object.defineProperty(SyncBodyBase.prototype, 'lineColor', {
    get: function () {
        return this._lineColor;
    },
    set: function (val) {
        this._lineColor = val;
        this._dirtyProperties.lineColor = true;
    }
});

Object.defineProperty(SyncBodyBase.prototype, 'fillColor', {
    get: function () {
        return this._fillColor;
    },
    set: function (val) {
        this._fillColor = val;
        this._dirtyProperties.fillColor = true;
    }
});

Object.defineProperty(SyncBodyBase.prototype, 'fillAlpha', {
    get: function () {
        return this._fillAlpha;
    },
    set: function (val) {
        this._fillAlpha = val;
        this._dirtyProperties.fillAlpha = true;
    }
});

Object.defineProperty(SyncBodyBase.prototype, 'vectorScale', {
    get: function () {
        return this._vectorScale;
    },
    set: function (val) {
        this._vectorScale = val;
        this._dirtyProperties.vectorScale = true;
        this.adjustShape();
    }
});

Object.defineProperty(SyncBodyBase.prototype, 'lineWidth', {
    get: function () {
        return this._lineWidth;
    },
    set: function (val) {
        this._lineWidth = val;
        this._dirtyProperties.lineWidth = true;
    }
});

Object.defineProperty(SyncBodyBase.prototype, 'shapeClosed', {
    get: function () {
        return this._shapeClosed;
    },
    set: function (val) {
        this._shapeClosed = val;
        this._dirtyProperties.shapeClosed = true;
    }
});

Object.defineProperty(SyncBodyBase.prototype, 'shape', {
    get: function () {
        return this._shape;
    },
    set: function (val) {
        // TODO: add test to ensure shape is simple
        this._shape = val;
        this._dirtyProperties.shape = true;
        this.adjustShape();
    }
});

Object.defineProperty(SyncBodyBase.prototype, 'geometry', {
    get: function () {
        return this._geometry;
    },
    set: function (val) {
        this._geometry = val;
        this._dirtyProperties.geometry = true;
    }
});

Object.defineProperty(SyncBodyBase.prototype, 'dead', {
    get: function () {
        return this._dead;
    },
    set: function (val) {
        this._dead = val;
        this._dirtyProperties.dead = true;
    }
});

module.exports = SyncBodyBase;