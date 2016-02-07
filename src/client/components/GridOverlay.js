/**
 * GridOverlay.js
 */
'use strict';

var floor = Math.floor;

var gridGroup = null;
var tween = null;

// Test
module.exports = {
    createGrid: function () {
        gridGroup = this.game.add.group();
        gridGroup.alpha = 0.6;
        var gs = this.config.gridSpacing;
        var ps = this.config.physicsScale;
        var left = floor(this.worldLeft / gs) * gs * ps;
        var top = floor(this.worldTop / gs) * gs * ps;
        var right = floor(this.worldRight / gs) * gs * ps;
        var bottom = floor(this.worldBottom / gs) * gs * ps;
        var graphics = this.game.add.graphics(0, 0, gridGroup);
        var color = Phaser.Color.hexToRGB(this.config.gridColor);
        graphics.lineStyle(3, color, 1);
        // Vertical lines
        for (var i = left; i <= right; i += gs * ps) {
            graphics.moveTo(i, this.phaserTop);
            graphics.lineTo(i, this.phaserBottom);
        }
        // Horizontal lines
        for (i = top; i <= bottom; i += gs * ps) {
            graphics.moveTo(this.phaserLeft, i);
            graphics.lineTo(this.phaserRight, i);
        }
        // Numbers?
        // Tween
        tween = this.game.add.tween(gridGroup).to({alpha: 0.1}, 3000, 'Linear', true, 0, true, true);
        return gridGroup;
    }
};