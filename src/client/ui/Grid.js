/**
 * Grid.js
 */
'use strict';

var Grid = function (game) {
    Phaser.Group.call(this, game);
    this.tween = null;

    var i, j, left, right, top, bottom, line, text;
    var gs = game.starcoder.config.gridSpacing;
    var ps = game.starcoder.config.physicsScale;
    // Add horizontal lines
    top = Math.trunc(game.starcoder.worldTop / gs) * gs;
    bottom = Math.trunc(game.starcoder.worldBottom / gs) * gs;
    for (i = bottom*ps; i <= top*ps; i += gs*ps) {
        line = game.add.image(0, i, 'hgridline', null, this);
        line.anchor.setTo(0.5);
        line.width = game.starcoder.phaserWidth;
        line.autoCull = true;
    }
    // Add vertical lines
    left = Math.trunc(game.starcoder.worldLeft / gs) * gs;
    right = Math.trunc(game.starcoder.worldRight / gs) * gs;
    for (i = left*ps; i <= right*ps; i += gs*ps) {
        line = game.add.image(i, 0, 'vgridline', null, this);
        line.anchor.setTo(0.5);
        line.height = game.starcoder.phaserHeight;
        line.autoCull = true;
    }

    // Add text
    for (i = left; i <= right; i += gs) {
        for (j = bottom; j <= top; j += gs) {
            text = this.game.starcoder.addFlexText(i * ps + 6, -j * ps + 6, '(' + i + ', ' + j + ')',
                {font: '12px Arial', align: 'center', fill: game.starcoder.config.gridColor}, this);
            text.anchor.setTo(0, 1);
            text.autoCull = true;
        }
    }

    this.alpha = 0.5;
};

Grid.prototype = Object.create(Phaser.Group.prototype);
Grid.prototype.constructor = Grid;

Grid.prototype.show = function () {
    var self = this;
    if (this.tween) {
        this.tween.stop();
    }
    this.visible = true;
    this.tween = this.game.add.tween(this).to({alpha: 0.5}, 500, 'Linear', true);
    this.tween.onComplete.add(function () {
        self.tween = null;
    });
};

Grid.prototype.hide = function () {
    var self = this;
    if (this.tween) {
        this.tween.stop();
    }
    this.tween = this.game.add.tween(this).to({alpha: 0}, 500, 'Linear', true);
    this.tween.onComplete.add(function () {
        self.visible = false;
        self.tween = null;
    });
};

Grid.prototype.toggle = function () {
    if (this.visible) {
        this.hide();
    } else {
        this.show();
    }
};

module.exports = Grid;