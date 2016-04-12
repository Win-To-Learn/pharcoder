/**
 * GridOverlay.js
 */
'use strict';

var floor = Math.floor;

var gridGroup = null;
var tween = null;

module.exports = {
    createGrid: function () {
        gridGroup = this.game.add.group();
        gridGroup.alpha = 0.5;
        var gs = this.config.gridSpacing;
        var ps = this.config.physicsScale;
        var left = floor(this.worldLeft / gs) * gs;
        var top = -floor(this.worldTop / gs) * gs;
        var right = floor(this.worldRight / gs) * gs;
        var bottom = -floor(this.worldBottom / gs) * gs;
        var graphics = this.game.add.graphics(0, 0, gridGroup);
        var color = Phaser.Color.hexToRGB(this.config.gridColor);
        graphics.lineStyle(3, color, 1);
        // Vertical lines
        for (var i = left; i <= right; i += gs) {
            graphics.moveTo(i * ps, this.phaserTop);
            graphics.lineTo(i * ps, this.phaserBottom);
        }
        // Horizontal lines
        for (var j = top; j <= bottom; j += gs) {
            graphics.moveTo(this.phaserLeft, j * ps);
            graphics.lineTo(this.phaserRight, j * ps);
        }
        // Numbers?
        for (i = left; i <= right; i += gs) {
            for (var j = top; j <= bottom; j += gs) {
                var text = this.addFlexText(i * ps + 6, -j * ps + 6, '(' + i + ', ' + j + ')',
                    {font: '12px Arial', align: 'center', fill: this.config.gridColor}, gridGroup);
                text.anchor.setTo(0, 1);
                text.autoCull = true;
            }
        }
        // Tween
        //tween = this.game.add.tween(gridGroup).to({alpha: 0.2}, 3000, 'Quad', true, 0, -1, true);
        graphics.updateCache();
        return gridGroup;
    },

    showGrid: function () {
        if (tween) {
            tween.stop();
        }
        gridGroup.visible = true;
        tween = this.game.add.tween(gridGroup).to({alpha: 0.5}, 500, 'Linear', true);
        //tween.onComplete.add(function () {
        //    tween = this.game.add.tween(gridGroup).to({alpha: 0.2}, 3000, 'Quad', true, 0, -1, true);
        //}, this);
    },

    hideGrid: function () {
        if (tween) {
            tween.stop();
        }
        tween = this.game.add.tween(gridGroup).to({alpha: 0}, 500, 'Linear', true);
        tween.onComplete.add(function () {
            gridGroup.visible = false;
        }, this);
    },

    toggleGrid: function () {
        if (gridGroup.visible) {
            this.hideGrid();
        } else {
            this.showGrid();
        }
    }
};