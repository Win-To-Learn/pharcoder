/**
 * Starfield.js
 */
'use strict';

var Starfield = function (game, x, y, width, height, tileSize, starsPerTile) {
    var bitmap = new Phaser.BitmapData(game, 'starfieldbitmap', tileSize, tileSize);
    this._drawStarField(bitmap.ctx, tileSize, starsPerTile);
    Phaser.TileSprite.call(this, game, x, y, width, height, bitmap);
    this.fixedToCamera = true;
    this.playerShip = null;
    this.oldX = 0;
    this.oldY = 0;
};

Starfield.prototype = Object.create(Phaser.TileSprite.prototype);
Starfield.prototype.constructor = Starfield;

Starfield.prototype.update = function () {
    if (this.playerShip) {
        if (!this.game.camera.atLimit.x) {
            this.tilePosition.x -= (this.playerShip.x - this.oldX);
        }
        if (!this.game.camera.atLimit.y) {
            this.tilePosition.y -= (this.playerShip.y - this.oldY);
        }
        this.oldX = this.playerShip.x;
        this.oldY = this.playerShip.y;
    } else if (this.game.playerShip) {
        this.playerShip = this.game.playerShip;
        this.oldX = this.playerShip.x;
        this.oldY = this.playerShip.y;
    }
};

Starfield.prototype._randomNormal = function () {
    var t = 0;
    for (var i=0; i<6; i++) {
        t += Math.random();
    }
    return t/6;
};

Starfield.prototype._randomBetween = function (lo, hi) {
    return lo + (hi - lo) * Math.random();
};

Starfield.prototype._drawStar = function (ctx, x, y, d, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x-d+1, y-d+1);
    ctx.lineTo(x+d-1, y+d-1);
    ctx.moveTo(x-d+1, y+d-1);
    ctx.lineTo(x+d-1, y-d+1);
    ctx.moveTo(x, y-d);
    ctx.lineTo(x, y+d);
    ctx.moveTo(x-d, y);
    ctx.lineTo(x+d, y);
    ctx.stroke();
};

Starfield.prototype._drawStarField = function (ctx, size, n) {
    var xm = Math.round(size/2 + this._randomNormal()*size/4);
    var ym = Math.round(size/2 + this._randomNormal()*size/4);
    var quads = [[0,0,xm-1,ym-1], [xm,0,size-1,ym-1],
        [0,ym,xm-1,size-1], [xm,ym,size-1,size-1]];
    var color;
    var i, j, l, q;

    n = Math.round(n/4);
    for (i=0, l=quads.length; i<l; i++) {
        q = quads[i];
        for (j=0; j<n; j++) {
            color = 'hsl(60,100%,' + this._randomBetween(90,99) + '%)';
            this._drawStar(ctx,
                this._randomBetween(q[0]+7, q[2]-7), this._randomBetween(q[1]+7, q[3]-7),
                this._randomBetween(2,4), color);
        }
    }
};

module.exports = Starfield;