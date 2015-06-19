/**
 * MiniMap.js
 */
'use strict';

var MiniMap = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y);
    this.graphics = game.make.graphics();
    this.texture = game.add.renderTexture(200, 200);

    this.graphics.beginFill(0x00ff00, 0.7);
    this.graphics.drawRect(0, 0, 200, 200);
    this.graphics.endFill();

    this.setTexture(this.texture);
};

MiniMap.prototype = Object.create(Phaser.Sprite.prototype);
MiniMap.prototype.constructor = MiniMap;

MiniMap.prototype.update = function () {
    this.texture.renderXY(this.graphics, 0, 0, true);
    for (var i = 0, l = this.game.playfield.children.length; i < l; i++) {
        var body = this.game.playfield.children[i];
        var x = 100 + body.x / 40;
        var y = 100 + body.y / 40;
        this.texture.renderXY(body.graphics, x, y, false);
    }
};

module.exports = MiniMap;