/**
 * VidPicker.js
 */
'use strict';

var THUMB_W = 120;
var THUMB_H = 90;
var BORDER = 8;
var HPAD = 8;
var VPAD = 18;
var COLUMNS = 6;
var ROWS = 4;
var WIDTH = COLUMNS * (THUMB_W + HPAD) + 2 * BORDER - HPAD;
var HEIGHT = ROWS * (THUMB_H + VPAD) + 2 * BORDER - VPAD;

var VidPicker = function (game, x, y) {
    var self = this;
    Phaser.Group.call(this, game, null);

    this.thumbs = [];

    this.graphics = game.add.graphics(0, 0, this);

    this.graphics.lineStyle(4, 0x0000ff, 0.75);
    this.graphics.drawRoundedRect(0, 0, WIDTH, HEIGHT, BORDER);

    var closebut = game.add.image(this.graphics.width, 0, 'closebut', 0, this);
    closebut.anchor.setTo(0.5);
    closebut.inputEnabled = true;
    closebut.events.onInputUp.add(function() {
        self.close();
    });

    this.x = x - this.graphics.width / 2;
    this.y = y - this.graphics.height / 2;

    this.visible = false;
};

VidPicker.prototype = Object.create(Phaser.Group.prototype);
VidPicker.prototype.constructor = VidPicker;

VidPicker.prototype.addVideo = function (key, title, url) {
    var self = this;
    var row = Math.floor(this.thumbs.length / COLUMNS);
    var col = this.thumbs.length % COLUMNS;
    var thumb = this.game.add.image(BORDER + col * (THUMB_W + HPAD), BORDER + row * (THUMB_H + VPAD), key, null, this);
    thumb.width = THUMB_W;
    thumb.height = THUMB_H;
    thumb.inputEnabled = true;
    thumb.events.onInputUp.add(function () {
        self.close();
        self.game.vidplayer.play(url);
    });
    var text = this.game.add.text(BORDER + col * (THUMB_W + HPAD) + THUMB_W / 2,
        BORDER + row * (THUMB_H + VPAD) + THUMB_H, title,
        {fill: '#cccccc', font: (VPAD - 2) + 'px Arial', align: 'center'}, this);
    text.anchor.setTo(0.5, 0);
    this.thumbs.push(thumb);
};

VidPicker.prototype.close = function () {
    this.visible = false;
};

VidPicker.prototype.open = function () {
    this.visible = true;
};

module.exports = VidPicker;