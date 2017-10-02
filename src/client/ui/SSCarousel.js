/**
 * SSCarousel.js
 */
'use strict';

const THUMB_W = 240;
const THUMB_H = 180;
const GUTTER = 36;
const MARGIN = 24;
const BORDER = 8;
const SCALE = 0.80;
const FONTSIZE = 16;
const WIDTH = THUMB_W + 2*SCALE*THUMB_W + 2*GUTTER + 2*MARGIN + 2*BORDER;
const HEIGHT = THUMB_H + 2*MARGIN + 2*BORDER;

const SSCarousel = function (game, x, y) {
    Phaser.Group.call(this, game, null);
    this.pos = 0;
    const self = this;

    this.graphics = game.add.graphics(0, 0, this);

    this.graphics.lineStyle(4, 0x0000ff, 0.75);
    this.graphics.beginFill(0x333333, 0.25);
    this.graphics.drawRoundedRect(0, 0, WIDTH, HEIGHT, BORDER);
    this.graphics.endFill();

    const closebut = game.add.image(this.graphics.width, 0, 'closebut', 0, this);
    closebut.anchor.setTo(0.5);
    closebut.inputEnabled = true;
    closebut.events.onInputUp.add(function () {
        self.close();
    });

    this.ssCenter = new Phaser.Image(this.game, WIDTH/2, HEIGHT/2, '');
    this.ssCenter.anchor.setTo(0.5);
    this.add(this.ssCenter);

    this.ssLeft = new Phaser.Image(this.game, MARGIN + THUMB_W/2, HEIGHT/2, '');
    this.ssLeft.anchor.setTo(0.5);
    this.add(this.ssLeft);
    this.ssLeft.visible = false;
    this.ssLeft.inputEnabled = true;
    this.ssLeft.events.onInputUp.add(function () {
        const numShots = self.game.starcoder.screenshot.numShots;
        self.pos = (self.pos - 1 + numShots) % numShots;
        self.setImages();
    });

    this.ssRight = new Phaser.Image(this.game, WIDTH - MARGIN - THUMB_W/2, HEIGHT/2, '');
    this.ssRight.anchor.setTo(0.5);
    this.add(this.ssRight);
    this.ssRight.visible = false;
    this.ssRight.inputEnabled = true;
    this.ssRight.events.onInputUp.add(function () {
        const numShots = self.game.starcoder.screenshot.numShots;
        self.pos = (self.pos + 1) % numShots;
        self.setImages();
    });

    this.x = x - this.graphics.width / 2;
    this.y = y - this.graphics.height / 2;

    this.visible = false;
};

SSCarousel.prototype = Object.create(Phaser.Group.prototype);
SSCarousel.prototype.constructor = SSCarousel;

SSCarousel.prototype.close = function () {
    this.visible = false;
};

SSCarousel.prototype.open = function () {
    if (!this.visible) {
        this.visible = true;
        this.pos = 0;
        this.setImages();
    }
};

SSCarousel.prototype.setImages = function () {
    const screenshot = this.game.starcoder.screenshot;
    let pos = (screenshot.lastShot + this.pos) % screenshot.numShots;
    this.ssCenter.loadTexture('screenshot_' + pos);
    let scale = Math.min(THUMB_W / this.ssCenter.texture.width, THUMB_H / this.ssCenter.texture.height);
    this.ssCenter.scale.setTo(scale);
    if (screenshot.numShots > 1) {
        this.ssLeft.visible = true;
        this.ssRight.visible = true;
        let left = (pos - 1 + screenshot.numShots) % screenshot.numShots;
        let right = (pos + 1) % screenshot.numShots;
        this.ssLeft.loadTexture('screenshot_' + left);
        scale = Math.min(THUMB_W / this.ssLeft.texture.width, THUMB_H / this.ssLeft.texture.height);
        this.ssLeft.scale.setTo(SCALE*scale);
        this.ssRight.loadTexture('screenshot_' + right);
        scale = Math.min(THUMB_W / this.ssRight.texture.width, THUMB_H / this.ssRight.texture.height);
        this.ssRight.scale.setTo(SCALE*scale);
    }
};

module.exports = SSCarousel;