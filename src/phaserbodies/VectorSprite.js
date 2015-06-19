/**
 * Sprite with attached Graphics object for vector-like graphics
 */
'use strict';

//var Starcoder = require('../../Starcoder-client.js');

var VectorSprite = function (game, config) {
    Phaser.Sprite.call(this, game);

    this.shape = config.properties.shape || this.shape;
    this.shapeClosed = config.properties.shape || this.shapeClosed;
    this.lineWidth = config.properties.lineWidth || this.lineWidth;
    this.lineColor = config.properties.lineColor || this.lineColor;
    this.fillColor = config.properties.fillColor || this.fillColor;
    this.fillAlpha = config.properties.fillAlpha || this.fillAlpha;
    this.geometry = config.properties.geometry || this.geometry;
    this.vectorScale = config.properties.vectorScale || this.vectorScale;

    this.graphics = game.make.graphics();
    this.texture = this.game.add.renderTexture();
    //this.minitexture = this.game.add.renderTexture();

    game.physics.p2.enable(this, false, false);
    this.updateAppearance();
    this.updateBody();
    this.body.mass = 0;
};

VectorSprite.add = function (game, x, y) {
    var v = new VectorSprite(game, x, y);
    game.add.existing(v);
    return v;
}

VectorSprite.prototype = Object.create(Phaser.Sprite.prototype);
VectorSprite.prototype.constructor = VectorSprite;

// Default octagon
VectorSprite.prototype.shape = [
    [2,1],
    [1,2],
    [-1,2],
    [-2,1],
    [-2,-1],
    [-1,-2],
    [1,-2],
    [2,-1]
];
VectorSprite.prototype.shapeClosed = true;
VectorSprite.prototype.lineColor = '#ffffff';
VectorSprite.prototype.lineWidth = 1;
VectorSprite.prototype.fillColor = null;
VectorSprite.prototype.fillAlpha = 0.25;
VectorSprite.prototype.vectorScale = 1;

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

VectorSprite.prototype.updateAppearance = function () {
    if (typeof this.animate === 'undefined') {
        this.graphics.clear();
        if (typeof this.drawProcedure !== 'undefined') {
            this.drawProcedure();
        } else if (this.shape) {
            this.draw();
        }
        this.texture.resize(this.graphics.width, this.graphics.height, true);
        this.texture.renderXY(this.graphics, this.graphics.width/2, this.graphics.height/2, true);
        this.setTexture(this.texture);
        // Draw mini texture - FIXME
        this.graphics.clear();
        if (typeof this.drawProcedure !== 'undefined') {
            this.drawProcedure(0.025);
        } else if (this.shape) {
            this.draw(0.025);
        }
        this.graphics.cacheAsBitmap = true;
        //this.minitexture.resize(this.graphics.width, this.graphics.height, true);
        //this.minitexture.renderXY(this.graphics, this.graphics.width/2, this.graphics.height/2, true);
    }
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

VectorSprite.prototype.draw = function (renderScale) {
    renderScale = renderScale || 1;
    // Draw simple shape, if given
    if (this.shape) {
         var lineColor = Phaser.Color.hexToRGB(this.lineColor);
        if (this.fillColor) {
            var fillColor = Phaser.Color.hexToRGB(this.fillColor);
            var fillAlpha = this.fillAlpha || 1;
            this.graphics.beginFill(fillColor, fillAlpha);
        }
        this.graphics.lineStyle(this.lineWidth, lineColor, 1);
        this._drawPolygon(this.shape, this.shapeClosed, renderScale);
        if (this.fillColor) {
            this.graphics.endFill();
        }
    }
    // Draw geometry spec, if given
    if (this.geometry) {
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

module.exports = VectorSprite;
//Starcoder.VectorSprite = VectorSprite;