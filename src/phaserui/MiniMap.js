/**
 * MiniMap.js
 */
'use strict';

var MiniMap = function (game) {
    Phaser.Group.call(this, game);

    this.mapScale = 0.025;

    this.graphics = game.make.graphics(0, 0);
    this.graphics.beginFill(0x00ff00, 0.2);
    this.graphics.drawRect(0, 0, 200, 200);
    this.graphics.endFill();
    this.graphics.cacheAsBitmap = true;
    this.add(this.graphics);
};

MiniMap.prototype = Object.create(Phaser.Group.prototype);
MiniMap.prototype.constructor = MiniMap;

MiniMap.prototype.update = function () {
    //this.texture.renderXY(this.graphics, 0, 0, true);
    for (var i = 0, l = this.game.playfield.children.length; i < l; i++) {
        var body = this.game.playfield.children[i];
        body.minisprite.x = body.x/40 + 100;
        body.minisprite.y = body.y/40 + 100;
    //    var x = 100 + body.x / 40;
    //    var y = 100 + body.y / 40;
    //    this.texture.renderXY(body.graphics, x, y, false);
    }
};

module.exports = MiniMap;