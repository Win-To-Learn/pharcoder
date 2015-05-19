/**
 * Sprite with attached Graphics object for vector-like graphics
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var VectorSprite = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y);

    this.graphics = game.add.graphics(0, 0);
    this.addChild(this.graphics);

    this.internalScale_ = new Phaser.Point(20,20);

    game.physics.p2.enable(this, false, false);
    this.updateAppearance();
};

VectorSprite.add = function (game, x, y) {
    var v = new VectorSprite(game, x, y);
    game.add.existing(v);
    return v;
}

VectorSprite.prototype = Object.create(Phaser.Sprite.prototype);
VectorSprite.prototype.constructor = Phaser.Sprite;

VectorSprite.prototype.shape = [[-1,-1], [-1,1], [1,1], [1,-1], [-1,-1]];
VectorSprite.prototype.color = '#ffffff';
VectorSprite.prototype.lineWidth = 1;

VectorSprite.prototype.setScale= function (x, y) {
    if (arguments.length < 2) {
        y = x;
    }
    this.internalScale_.setTo (x, y);
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
    this.graphics.clear();
    if (this.renderVector) {
        this.renderVector();
    } else if (this.shape) {
        this.renderShape_();
    }
    this.graphics.updateCache();
};

VectorSprite.prototype.renderShape_ = function () {
    var color = Phaser.Color.hexToRGB(this.color);
    var lineWidth = this.lineWidth || 1;
    var xs = this.internalScale_.x, ys = this.internalScale_.y;
    var i, p, l;

    this.graphics.lineStyle(lineWidth, color, 1);
    p = this.shape[0];
    this.graphics.moveTo(p[0]*xs, p[1]*ys);
    for (i = 1, l = this.shape.length; i < l; i++) {
        p = this.shape[i];
        this.graphics.lineTo(p[0]*xs, p[1]*ys);
    }
}

module.exports = VectorSprite;
Starcoder.VectorSprite = VectorSprite;