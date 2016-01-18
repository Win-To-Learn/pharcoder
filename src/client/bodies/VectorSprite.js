/**
 * Sprite with attached Graphics object for vector-like graphics
 */
'use strict';

//var Starcoder = require('../../Starcoder-client.js');

var frameTexturePool = {};
var mapTexturePool = {};

/**
 * Base class for Vector-based sprites
 *
 * @param game {Phaser.Game} - Phaser game object
 * @param config {object} - POJO with config details
 * @constructor
 */
var VectorSprite = function (game, config) {
    Phaser.Sprite.call(this, game);
    //this.graphics = game.make.graphics();
    this.graphics = this.game.sharedGraphics;
    //this.texture = this.game.add.renderTexture();
    //this.minitexture = this.game.add.renderTexture();

    if (!config.nophysics) {
        game.physics.p2.enable(this, false, false);
        this.setPosAngle(config.x, config.y, config.a);
        this.updateBody();
        this.body.mass = 0;
    }
    this.config(config.properties);

    if (this.visibleOnMap) {
        this.minisprite = this.game.minimap.create();
        this.minisprite.anchor.setTo(0.5, 0.5);
    }

    if (this.sharedTextureKey) {
        this.frames = this.getFramePool(this.sharedTextureKey);
        if (this.minisprite) {
            this.minitexture = this.getMapPool(this.sharedTextureKey);
        }
        if (this.frames.length === 0) {
            this.updateTextures();
        } else {
            this.setTexture(this.frames[this.vFrame]);
            if (this.minisprite) {
                this.minisprite.setTexture(this.minitexture);
            }
        }
    } else {
        this.frames = [];
        if (this.minisprite) {
            this.minitexture = this.game.add.renderTexture();
        }
        this.updateTextures();
    }

    //this.updateTextures();
    if (this.fps) {
        this._msPerFrame = 1000 / this.fps;
        this._lastVFrame = this.game.time.now;
    }
};

/**
 * Create VectorSprite and add to game world
 *
 * @param game {Phaser.Game}
 * @param x {number} - x coord
 * @param y {number} - y coord
 * @returns {VectorSprite}
 */
VectorSprite.add = function (game, x, y) {
    var v = new VectorSprite(game, x, y);
    game.add.existing(v);
    return v;
};

VectorSprite.prototype = Object.create(Phaser.Sprite.prototype);
VectorSprite.prototype.constructor = VectorSprite;

// Default octagon
VectorSprite.prototype._shape = [
    [2,1],
    [1,2],
    [-1,2],
    [-2,1],
    [-2,-1],
    [-1,-2],
    [1,-2],
    [2,-1]
];
VectorSprite.prototype._shapeClosed = true;
VectorSprite.prototype._lineColor = '#ffffff';
VectorSprite.prototype._lineWidth = 1;
VectorSprite.prototype._fillColor = null;
VectorSprite.prototype._fillAlpha = 0.25;
VectorSprite.prototype._vectorScale = 1;

VectorSprite.prototype.physicsBodyType = 'circle';

VectorSprite.prototype.numFrames = 1;
VectorSprite.prototype.mapFrame = 0;
VectorSprite.prototype.vFrame = 0;

VectorSprite.prototype.visibleOnMap = true;

VectorSprite.prototype.getFramePool = function (key) {
    if (!frameTexturePool[key]) {
        return frameTexturePool[key] = [];
    }
    return frameTexturePool[key];
};

VectorSprite.prototype.getMapPool = function (key) {
    if (!mapTexturePool[key]) {
        mapTexturePool[key] = this.game.add.renderTexture();
    }
    return mapTexturePool[key];
};

VectorSprite.prototype.setShape = function (shape) {
    this.shape = shape;
    this.updateTextures();
};

VectorSprite.prototype.setLineStyle = function (color, lineWidth) {
    if (!lineWidth || lineWidth < 1) {
        lineWidth = this.lineWidth || 1;
    }
    this.color = color;
    this.lineWidth = lineWidth;
    this.updateTextures();
};

/**
 * Update cached bitmaps for object after vector properties change
 */
VectorSprite.prototype.updateTextures = function () {
    // Draw full sized
    if (this.numFrames === 1) {
        this.graphics.clear();
        this.graphics._currentBounds = null;
        if (typeof this.drawProcedure !== 'undefined') {
            this.drawProcedure(1, 0);
        } else if (this.shape) {
        //} else if (this.outline) {
            this.draw(1);
        }
        if (!this.frames[0]) {
            this.frames[0] = this.game.add.renderTexture();
        }
        var bounds = this.graphics.getLocalBounds();
        this.frames[0].resize(bounds.width, bounds.height, true);
        this.frames[0].renderXY(this.graphics, -bounds.x, -bounds.y, true);
    } else {
        for (var i = 0; i < this.numFrames; i++) {
            this.graphics.clear();
            this.graphics._currentBounds = null;
            this.drawProcedure(1, i);
            if (!this.frames[i]) {
                this.frames[i] = this.game.add.renderTexture();
            }
            bounds = this.graphics.getLocalBounds();
            this.frames[i].resize(bounds.width, bounds.height, true);
            this.frames[i].renderXY(this.graphics, -bounds.x, -bounds.y, true);
        }
    }
    this.setTexture(this.frames[this.vFrame]);
    // Draw small for minimap
    if (this.minisprite) {
        var mapScale = this.game.minimap.mapScale;
        var mapFactor = this.mapFactor || 1;
        this.graphics.clear();
        this.graphics._currentBounds = null;
        if (typeof this.drawProcedure !== 'undefined') {
            this.drawProcedure(mapScale * mapFactor, this.mapFrame);
        } else if (this.shape) {
        //} else if (this.outline) {
            this.draw(mapScale * mapFactor);
        }
        bounds = this.graphics.getLocalBounds();
        this.minitexture.resize(bounds.width, bounds.height, true);
        this.minitexture.renderXY(this.graphics, -bounds.x, -bounds.y, true);
        this.minisprite.setTexture(this.minitexture);
    }
    this._dirty = false;
};

VectorSprite.prototype.updateBody = function () {
    switch (this.physicsBodyType) {
        case "circle":
            if (typeof this.circle === 'undefined') {
                var r = this.graphics.getBounds();
                var radius = Math.round(Math.sqrt(r.width* r.height)/2);
            } else {
                radius = this.radius;
            }
            this.body.setCircle(radius);
            break;
    }
};

/**
 * Render vector to bitmap of graphics object at given scale
 *
 * @param renderScale {number} - scale factor for render
 */
VectorSprite.prototype.draw = function (renderScale) {
    renderScale = renderScale || 1;
    // Draw geometry spec, if given, but only for the full sized sprite
    if ((renderScale === 1) && this.geometry) {
        for (var i = 0, l = this.geometry.length; i < l; i++) {
            var g = this.geometry[i];
            switch (g.type) {
                case "poly":
                    var lineWidth = g.lineWidth || this.lineWidth;
                    if (g.lineColor) {
                        var lineColor = Phaser.Color.hexToRGB(g.lineColor);
                    } else {
                        lineColor = Phaser.Color.hexToRGB(this.lineColor);
                    }
                    this.graphics.lineStyle(lineWidth, lineColor, 1);
                    this._drawPolygon(this.graphics, g.points, g.closed, renderScale);
                    break;
            }
        }
    }
    // Draw simple shape, if given
    if (this.shape) {
    //if (this.outline) {
        lineColor = Phaser.Color.hexToRGB(this.lineColor);
        if (renderScale === 1) {
            lineWidth = this.lineWidth;
        } else {
            lineWidth = 1;
        }
        if ((renderScale === 1) && this.fillColor) {        // Only fill full sized
            var fillColor = Phaser.Color.hexToRGB(this.fillColor);
            var fillAlpha = (typeof this.fillAlpha) === 'undefined' ? 1 : this.fillAlpha;
            this.graphics.beginFill(fillColor, fillAlpha);
        }
        this.graphics.lineStyle(lineWidth, lineColor, 1);
        this._drawPolygon(this.graphics, this.shape, this.shapeClosed, renderScale);
        //this._drawPolygon(this.outline, this.shapeClosed, renderScale);
        if ((renderScale === 1) && this.fillColor) {
            this.graphics.endFill();
        }
        // DEBUGGING: draw shape
        //this.graphics.lineStyle(1, 0xff0000, 1);
        //this._drawPolygon(this.shape, this.shapeClosed, renderScale * this.vectorScale);
    }
};

/**
 * Draw open or closed polygon as sequence of lineTo calls
 *
 * @param graphics {Phaser.Graphics} - graphics object to draw on
 * @param points {Array} - points as array of [x,y] pairs
 * @param closed {boolean} - is polygon closed?
 * @param renderScale {number} - scale factor for render
 * @private
 */
VectorSprite.prototype._drawPolygon = function (graphics, points, closed, renderScale) {
    var sc = this.game.physics.p2.mpxi(this.vectorScale)*renderScale;
    //var sc = this.game.physics.p2.mpxi(renderScale);
    points = points.slice();
    if (closed) {
        points.push(points[0]);
    }
    graphics.moveTo(points[0][0] * sc, points[0][1] * sc);
    for (var i = 1, l = points.length; i < l; i++) {
        graphics.lineTo(points[i][0] * sc, points[i][1] * sc);
    }
};

/**
 * Invalidate cache and redraw if sprite is marked dirty
 */
VectorSprite.prototype.update = function () {
    if (this._dirty) {
        this.updateTextures();
    }
    if (this._msPerFrame && (this.game.time.now >= this._lastVFrame + this._msPerFrame)) {
        this.vFrame = (this.vFrame + 1) % this.numFrames;
        this.setTexture(this.frames[this.vFrame]);
        this._lastVFrame = this.game.time.now;
    }
};

// Vector properties defined to handle marking sprite dirty when necessary

Object.defineProperty(VectorSprite.prototype, 'lineColor', {
    get: function () {
        return this._lineColor;
    },
    set: function (val) {this._lineColor = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'fillColor', {
    get: function () {
        return this._fillColor;
    },
    set: function (val) {
        this._fillColor = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'lineWidth', {
    get: function () {
        return this._lineWidth;
    },
    set: function (val) {
        this._lineWidth = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'fillAlpha', {
    get: function () {
        return this._fillAlpha;
    },
    set: function (val) {
        this._fillAlpha = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'shapeClosed', {
    get: function () {
        return this._shapeClosed;
    },
    set: function (val) {
        this._shapeClosed = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'vectorScale', {
    get: function () {
        return this._vectorScale;
    },
    set: function (val) {
        this._vectorScale = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'shape', {
    get: function () {
        return this._shape;
    },
    set: function (val) {
        this._shape = val;
        this._dirty = true;
    }
});

//Object.defineProperty(VectorSprite.prototype, 'outline', {
//    get: function () {
//        return this._outline;
//    },
//    set: function (val) {
//        this._outline = val;
//        this._dirty = true;
//    }
//});

Object.defineProperty(VectorSprite.prototype, 'geometry', {
    get: function () {
        return this._geometry;
    },
    set: function (val) {
        this._geometry = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'dead', {
    get: function () {
        return this._dead;
    },
    set: function (val) {
        this._dead = val;
        if (val) {
            this.kill();
            if (this.minisprite) {
                this.minisprite.kill();
            }
        } else {
            this.revive();
            if (this.minisprite) {
                this.minisprite.revive();
            }
        }
    }
});


module.exports = VectorSprite;
//Starcoder.VectorSprite = VectorSprite;