/**
 * SyncBodyBase.js
 *
 * Base class for network syncable P2 Body
 */
'use strict';

var p2 = require('p2');
var vec2 = p2.vec2;
var decomp = require('poly-decomp');

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
                if (!this.hasOwnProperty(k)) {
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

/**
 * Remove object from world safely
 */
SyncBodyBase.prototype.removeSelfFromWorld = function () {
    if (this.world) {
        this.world.removeSyncableBody(this);
    }
};

var _cGroups = {};
var _cGroupIdx = 1;

/**
 * Create new collision group, with error check
 *
 * @param groupname
 * @returns {number}
 * @private
 */
SyncBodyBase.prototype._createCollisionGroup = function (groupname) {
    if (_cGroupIdx >= 32) {
        console.log('Cannot create new collision group');
    } else {
        return _cGroups[groupname] = Math.pow(2, _cGroupIdx++);
    }
};

/**
 * Set named collision group on body
 *
 * @param shapes {Shape|Shape[]} - Shape or array of shapes to set group for
 * @param groupname {string} - Name of group
 */
SyncBodyBase.prototype.setCollisionGroup = function (shapes, groupname) {
    if (!shapes) {
        shapes = this.shapes;
    }
    if (!groupname) {
        groupname = this.collisionGroup || this.serverType || 'general';
    }
    var gid = _cGroups[groupname];
    if (!gid) {
        gid = this._createCollisionGroup(groupname);
    }
    if (Array.isArray(shapes)) {
        for (var i = 0, l = shapes.length; i < l; i++) {
            shapes[i].collisionGroup = gid;
        }
    } else {
        shapes.collisionGroup = gid;
    }
};

/**
 * Use named flags to set collision mask on body
 *
 * @param shapes {Shape|Shape[]} - Shape or shapes to set mask for
 * @param include {Array} - List of groups to enable collisions for
 * @param exclude {Array} - List of groups to disable collisions for
 */
SyncBodyBase.prototype.setCollisionMask = function (shapes, include, exclude) {
    if (!shapes) {
        shapes = this.shapes;
    }
    if (!include) {
        include = this.collisionInclude;
    }
    if (!exclude) {
        exclude = this.collisionExclude;
    }
    if (include && include.length >= 1) {
        var mask = 0x0001;                          // For wall collisions
        for (var i = 0, l = include.length; i < l; i++) {
            var gid = _cGroups[include[i]];
            if (!gid) {
                gid = this._createCollisionGroup(include[i]);
            }
            mask |= gid;
        }
    } else {
        mask = 0xffff;
    }
    if (exclude && exclude.length >= 1) {
        for (i = 0, l = exclude.length; i < l; i++) {
            gid = _cGroups[exclude[i]];
            if (!gid) {
                gid = this._createCollisionGroup(exclude[i]);
            }
            mask &= ~gid;
        }
    }
    if (Array.isArray(shapes)) {
        for (i = 0, l = shapes.length; i < l; i++) {
            shapes[i].collisionMask = mask;
        }
    } else {
        shapes.collisionMask = mask;
    }
    //console.log('Mask', this.serverType, this.id, '>', mask);
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
    if (!this._shape || this._shape.length === 0) {
        return;
    }
    this.clearAllShapes();
    var outline = [];
    var p = new decomp.Polygon();
    p.vertices = [];
    for (var i = 0, l = this._shape.length; i < l; i++) {
        var s = this._shape[i];
        var x = s[0] * -this.vectorScale;
        var y = s[1] * -this.vectorScale;
        outline.push([x, y]);
        p.vertices.push([x, y]);
    }

    p.makeCCW();
    p.removeCollinearPoints(Math.PI / 12);
    var convexes = p.quickDecomp();

    //var area = 0;
    //var t = vec2.create();
    //var sum = vec2.fromValues(0, 0);
    var pos = vec2.create();
    var aabb = new p2.AABB();
    aabb.setFromPoints(outline);
    this.centroid = vec2.fromValues((aabb.lowerBound[0] + aabb.upperBound[0])/2,
        (aabb.lowerBound[1] + aabb.upperBound[1])/2);
    for (i = 0, l = convexes.length; i< l;  i++) {
        var c = new p2.Convex({ vertices: convexes[i].vertices });
        for (var j = 0, ll = c.vertices.length; j < ll; j++) {
            var v = c.vertices[j];
            vec2.sub(v, v, c.centerOfMass);
        }
        //vec2.scale(t, c.centerOfMass, c.area);
        //vec2.add(sum, sum, t);
        //area += c.area;
        vec2.sub(pos, c.centerOfMass, this.centroid);
        c.updateTriangles();
        c.updateCenterOfMass();
        c.updateBoundingRadius();
        this.addShape(c, pos);
    }

    this.updateMassProperties();
    this.updateBoundingRadius();
    this.updateAABB();

    //this.outline = outline;

    // Set collision properties on new shapes
    this.setCollisionGroup();
    this.setCollisionMask();
    //if (this.coreCollisionGroup || this.coreCollisionMask) {
    //    for (i = 0, l = this.shapes.length; i < l; i++) {
    //        this.shapes[i].collisionGroup = this.coreCollisionGroup;
    //        this.shapes[i].collisionMask = this.coreCollisionMask;
    //    }
    //}

};

/*
SyncBodyBase.prototype.adjustShape = function () {
    //var oldGroup, oldMask;
    //if (this.shapes.length > 0) {
    //    // For now all bodies are made of shapes with same collision group/mask
    //    oldGroup = this.shapes[0].collisionGroup;
    //    oldMask = this.shapes[0].collisionMask;
    //}
    var polyflag = false;
    if (this._shape) {
        var vertices = [];
        var x = this.position[0], y = this.position[1];
        for (var i = 0, l = this.shape.length; i < l; i++) {
            //vertices.push([x + this.shape[i][0]*this.vectorScale, y + -this.shape[i][1]*this.vectorScale]);
            vertices.push([-this.shape[i][0]*this.vectorScale, -this.shape[i][1]*this.vectorScale]);
        }
        polyflag = this.fromPolygon(vertices);
    }
    var dx = this.position[0] - x, dy = this.position[1] - y;
    if (polyflag) {
        // Not entirely sure why this is necessary
        this.position[0] = x;
        this.position[1] = y;
    } else {
        this.clearAllShapes();
        this.addShape(new p2.Circle({radius: this._radius || 1}));
    }
    //this.world.setCollisionGroup(this, this.collisionGroup || this.serverType || 'general');
    //this.world.setCollisionMask(this, this.collisionInclude, this.collisionExclude);
    // Reset old group/mask on all shapes
    if (this.coreCollisionGroup || this.coreCollisionMask) {
        for (i = 0, l = this.shapes.length; i < l; i++) {
            this.shapes[i].collisionGroup = this.coreCollisionGroup;
            this.shapes[i].collisionMask = this.coreCollisionMask;
        }
    }

    //var d = vec2.fromValues(dx, dy);
    //for (i = 0, l = this.shapes.length; i < l; i++) {
    //    var shape = this.shapes[i];
    //    vec2.add(shape.position, shape.position, d);
    //}
    this.outline = this.concavePath;

    // Find center of mass FIXME: ugly and redundant
    //var sum = vec2.fromValues(0, 0);
    //var t = vec2.fromValues(0, 0);
    //var cm = vec2.fromValues(0, 0);
    //var area = 0;
    //
    //if (this.concavePath) {
    //    //for (i = 0, l = this.shapes.length; i <l; i++) {
    //    //    var shape = this.shapes[i];
    //    //    vec2.scale(t, shape.position, shape.area);
    //    //    vec2.add(sum, sum, t);
    //    //    area += shape.area;
    //    //    console.log('Shp', shape.position[0], shape.position[1], shape.centerOfMass[0], shape.centerOfMass[1], shape.area, area);
    //    //}
    //    //vec2.scale(cm, sum, 1/area);
    //    //console.log('CM', cm[0], cm[1]);
    //    console.log('D', dx, dy);
    //    this.outline = [];
    //    for (i = 0, l = this.concavePath.length; i < l; i++) {
    //        var p = this.concavePath[i];
    //        this.outline.push([p[0] - dx, p[1] - dy]);
    //    }
    //}
    //console.log('S', this.shape);
    //console.log('P', this.concavePath);
    //this.outline = this.concavePath;
    //this._shape = this.concavePath;
    //this._dirtyProperties.shape = true;
    //for (i = 0, l = this.shapes.length; i < l; i++) {
    //    if (!this.shapes[i].vertices) {
    //        continue;
    //    }
    //    for (var j = 0; j < this.shapes[i].vertices.length; j++) {
    //        console.log('Vert', this.shapes[i].vertices[j][0], this.shapes[i].vertices[j][1]);
    //    }
    //}
};
*/

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

Object.defineProperty(SyncBodyBase.prototype, 'outline', {
    get: function () {
        return this._outline;
    },
    set: function (val) {
        // TODO: add test to ensure shape is simple
        this._outline = val;
        this._dirtyProperties.outline = true;
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