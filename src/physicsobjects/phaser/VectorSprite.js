/**
 * Sprite with attached Graphics object for vector-like graphics
 */
'use strict';

//var Starcoder = require('../../Starcoder-client.js');

var VectorSprite = function (game, options) {
    Phaser.Sprite.call(this, game);

    this.graphics = game.add.graphics(0, 0);
    this.addChild(this.graphics);

    this._internalScale = new Phaser.Point(15,15);

    game.physics.p2.enable(this, false, false);
    this.updateAppearance();
    this.updateBody();
    this.body.mass = 0;
    this.body.data.position[0] = -options.x;
    this.body.data.position[1] = -options.y;
    //console.log(this.graphics.getLocalBounds());
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

VectorSprite.prototype.physicsBodyType = 'circle';

VectorSprite.prototype.setScale= function (x, y) {
    if (arguments.length < 2) {
        y = x;
    }
    this._internalScale.setTo (x, y);
    this.updateAppearance();
};

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
}

VectorSprite.prototype.updateAppearance = function () {
    if (typeof this.animate === 'undefined') {
        this.graphics.clear();
        if (typeof this.drawProcedure !== 'undefined') {
            this.drawProcedure();
        } else if (this.shape) {
            this.draw();
        }
        this.graphics.cacheAsBitmap = true;
        //this.graphics.updateCache();
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

VectorSprite.prototype.draw = function () {
    // Draw simple shape, if given
    if (this.shape) {
         var lineColor = Phaser.Color.hexToRGB(this.lineColor);
        if (this.fillColor) {
            var fillColor = Phaser.Color.hexToRGB(this.fillColor);
            var fillAlpha = this.fillAlpha || 1;
            this.graphics.beginFill(fillColor, fillAlpha);
        }
        this.graphics.lineStyle(this.lineWidth, lineColor, 1);
        this._drawPolygon(this.shape, this.shapeClosed);
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
                    this._drawPolygon(g.points, g.closed);
                    break;
            }
        }
    }
};

VectorSprite.prototype._drawPolygon = function (points, closed) {
    var xs = this._internalScale.x, ys = this._internalScale.y;
    points = points.slice();
    if (closed) {
        points.push(points[0]);
    }
    this.graphics.moveTo(points[0][0] * xs, points[0][1] * ys);
    for (var i = 1, l = points.length; i < l; i++) {
        this.graphics.lineTo(points[i][0] * xs, points[i][1] * ys);
    }
};

module.exports = VectorSprite;
//Starcoder.VectorSprite = VectorSprite;