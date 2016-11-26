/**
 * VidPlayer.js
 */
'use strict';

var VidPlayer = function (game, x, y) {
    var self = this;
    Phaser.Group.call(this, game, null);

    this.onClose = new Phaser.Signal();

    //this.vid = game.add.video();
    //this.vid.onComplete.add(function () {
    //    self.playing = false;
    //    self.close();
    //});
    this.vidscreen = game.add.image(24, 74, null, 0, this);
    this.vidscreen.scale.setTo(0.666);
    var vidframe = game.add.image(0, 50, 'vidframe', 0, this);
    var closebut = game.add.image(664, 50, 'closebut', 0, this);
    var pause = game.add.image(25, 375, 'pause', 0, this);
    var rewind = game.add.image(75, 375, 'rewind', 0, this);

    closebut.inputEnabled = true;
    closebut.events.onInputUp.add(function () {
        self.close();
    });

    pause.inputEnabled = true;
    pause.events.onInputUp.add(function () {
        if (self.vid) {
            self.vid.paused = !self.vid.paused;
        }
    });

    rewind.inputEnabled = true;
    rewind.events.onInputUp.add(function () {
        if (self.vid) {
            self.vid.currentTime = 0;
        }
    });

    this.x = x - vidframe.width / 2;
    this.y = y - vidframe.height / 2;
    this.visible = false;
};

VidPlayer.prototype = Object.create(Phaser.Group.prototype);
VidPlayer.prototype.constructor = VidPlayer;

VidPlayer.prototype.close = function () {
    if (this.vid.playing) {
        this.vid.stop();
    }
    this.visible = false;
    this.onClose.dispatch();
};

VidPlayer.prototype.play = function (url) {
    var self = this;
    this.visible = true;
    if (!this.vid) {
        this.vid = this.game.add.video(null, url);
        this.vidscreen.loadTexture(this.vid);
        this.vid.onComplete.add(function () {
            //console.log('video finished - closing');
            self.close();
        });
        this.vid.play();
    } else {
        this.vid.changeSource(url, true);
    }
};

module.exports = VidPlayer;