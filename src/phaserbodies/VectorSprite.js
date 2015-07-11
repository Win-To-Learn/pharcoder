/**
 * Sprite with attached Graphics object for vector-like graphics
 */
'use strict';

//var Starcoder = require('../../Starcoder-client.js');

/**
 * Base class for Vector-based sprites
 *
 * @param game {Phaser.Game} - Phaser game object
 * @param config {object} - POJO with config details
 * @constructor
 */
var VectorSprite = function (game, config) {
    Phaser.Sprite.call(this, game);

    this.graphics = game.make.graphics();
    this.texture = this.game.add.renderTexture();
    this.minitexture = this.game.add.renderTexture();
    this.minisprite = this.game.minimap.create();
    this.minisprite.anchor.setTo(0.5, 0.5);

    game.physics.p2.enable(this, false, false);
    this.setPosAngle(config.x, config.y, config.a);
    this.config(config.properties);
    this.updateAppearance();
    this.updateBody();
    this.body.mass = 0;
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
}

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

VectorSprite.prototype.setShape = function (shape) {
    this.shape = shape;
    this.updateAppearance();
};

VectorSprite.prototype.setLineStyle = function (color, lineWidth) {
    if (!lineWidth || lineWidth < 1) {
        lineWidth = this.lineWidth || 1;
    }
    this.color = color;
    this.lineWidth = lineWidth;
    this.updateAppearance();
};

/**
 * Update cached bitmaps for object after vector properties change
 */
VectorSprite.prototype.updateAppearance = function () {
    // Draw full sized
    this.graphics.clear();
    this.graphics._currentBounds = null;
    if (typeof this.drawProcedure !== 'undefined') {
        this.drawProcedure();
    } else if (this.shape) {
        this.draw(1);
    }
    this.texture.resize(this.graphics.width, this.graphics.height, true);
    this.texture.renderXY(this.graphics, this.graphics.width/2, this.graphics.height/2, true);
    this.setTexture(this.texture);
    //console.log('S', this);
    //console.log('G', this.graphics, 'w', this.graphics.width, 'h', this.graphics.height);
    //console.log('T', this.texture);
    // Draw small for minimap
    var mapScale = this.game.minimap.mapScale;
    this.graphics.clear();
    this.graphics._currentBounds = null;
    if (typeof this.drawProcedure !== 'undefined') {
        this.drawProcedure(mapScale);
    } else if (this.shape) {
        this.draw(mapScale);
    }
    this.minitexture.resize(this.graphics.width, this.graphics.height, true);
    this.minitexture.renderXY(this.graphics, this.graphics.width/2, this.graphics.height/2, true);
    this.minisprite.setTexture(this.minitexture);
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
        // TODO: More shapes
    }
};

/**
 * Render vector to bitmap of graphics object at given scale
 *
 * @param renderScale {number} - scale factor for render
 */
VectorSprite.prototype.draw = function (renderScale) {
    renderScale = renderScale || 1;
    // Draw simple shape, if given
    if (this.shape) {
        var lineColor = Phaser.Color.hexToRGB(this.lineColor);
        if (renderScale === 1) {
            var lineWidth = this.lineWidth;
        } else {
            lineWidth = 1;
        }
        if ((renderScale === 1) && this.fillColor) {        // Only fill full sized
            var fillColor = Phaser.Color.hexToRGB(this.fillColor);
            var fillAlpha = this.fillAlpha || 1;
            this.graphics.beginFill(fillColor, fillAlpha);
        }
        this.graphics.lineStyle(lineWidth, lineColor, 1);
        this._drawPolygon(this.shape, this.shapeClosed, renderScale);
        if ((renderScale === 1) && this.fillColor) {
            this.graphics.endFill();
        }
    }
    // Draw geometry spec, if given, but only for the full sized sprite
    if ((renderScale === 1) && this.geometry) {
        for (var i = 0, l = this.geometry.length; i < l; i++) {
            var g = this.geometry[i];
            switch (g.type) {
                case "poly":
                    // FIXME: defaults and stuff
                    this._drawPolygon(g.points, g.closed, renderScale);
                    break;
            }
        }
    }
};

/**
 * Draw open or closed polygon as sequence of lineTo calls
 *
 * @param points {Array} - points as array of [x,y] pairs
 * @param closed {boolean} - is polygon closed?
 * @param renderScale {number} - scale factor for render
 * @private
 */
VectorSprite.prototype._drawPolygon = function (points, closed, renderScale) {
    var sc = this.game.physics.p2.mpxi(this.vectorScale)*renderScale;
    points = points.slice();
    if (closed) {
        points.push(points[0]);
    }
    this.graphics.moveTo(points[0][0] * sc, points[0][1] * sc);
    for (var i = 1, l = points.length; i < l; i++) {
        this.graphics.lineTo(points[i][0] * sc, points[i][1] * sc);
    }
};

/**
 * Invalidate cache and redraw if sprite is marked dirty
 */
VectorSprite.prototype.update = function () {
    if (this._dirty) {
        console.log('dirty VS');
        this.updateAppearance();
    }
};

// Vector properties defined to handle marking sprite dirty when necessary

Object.defineProperty(VectorSprite.prototype, 'lineColor', {
    get: function () {
        return this._lineColor;
    },
    set: function (val) {
        this._lineColor = val;
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

Object.defineProperty(VectorSprite.prototype, 'geometry', {
    get: function () {
        return this._geometry;
    },
    set: function (val) {
        this._geometry = val;
        this._dirty = true;
    }
});


module.exports = VectorSprite;
//Starcoder.VectorSprite = VectorSprite;