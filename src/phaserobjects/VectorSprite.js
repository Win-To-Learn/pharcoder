/**
 * Sprite with attached Graphics object for vector-like graphics
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var VectorSprite = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y);

    this.graphics = game.add.graphics(0, 0);
    this.addChild(this.graphics);

    this._internalScale = new Phaser.Point(15,15);

    game.physics.p2.enable(this, false, false);
    this.updateAppearance();
    this.updateBody();
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
    console.log(this.physicsBodyType);
    switch (this.physicsBodyType) {
        case "circle":
            if (typeof this.circle === 'undefined') {
                var r = this.graphics.getBounds();
                var radius = Math.round(Math.sqrt(r.width* r.height)/2);
            } else {
                radius = this.radius;
            }
            console.log(radius);
            this.body.setCircle(radius);
            break;
        // TODO: More shapes
    }
};

VectorSprite.prototype.draw = function () {
    var xs = this._internalScale.x, ys = this._internalScale.y;
    var p;

    // Draw simple shape, if given
    if (typeof this.shape !== 'undefined') {
        var shape = this.shape.slice();
        if (this.shapeClosed) {
            shape.push(shape[0]);
        }
        var l = shape.length;
        var lineColor = Phaser.Color.hexToRGB(this.lineColor);
        if (this.fillColor) {
            var fillColor = Phaser.Color.hexToRGB(this.fillColor);
            var fillAlpha = this.fillAlpha || 1;
            this.graphics.beginFill(fillColor, fillAlpha);
        }
        this.graphics.lineStyle(this.lineWidth, lineColor, 1);
        p = this.shape[0];
        this.graphics.moveTo(p[0] * xs, p[1] * ys);
        for (var i = 1; i < l; i++) {
            p = shape[i];
            this.graphics.lineTo(p[0] * xs, p[1] * ys);
        }
        if (this.fillColor) {
            this.graphics.endFill();
        }
    }
    // Draw geometry spec, if given
}

module.exports = VectorSprite;
Starcoder.VectorSprite = VectorSprite;