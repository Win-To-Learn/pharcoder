/**
 * Screenshot.js
 *
 * Created by jay on 10/1/17
 */

const debounceTime = 1000;
const maxShots = 10;

let debounce = true;

let Screenshot = function (game, parent) {
    Phaser.Plugin.call(this, game, parent);
};

Screenshot.prototype = Object.create(Phaser.Plugin.prototype);
Screenshot.prototype.constructor = Screenshot;

Screenshot.prototype.init = function () {
    this.ssKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    //this.screenshots = [];
    this.lastShot = -1;
    this.numShots = 0;
    this.ssReq = false;
};

Screenshot.prototype.preUpdate = function () {
    // Take screenshot
    if (debounce && this.ssKey.isDown && this.ssKey.altKey) {
        this.game.sounds.photo.play();
        this.ssReq = true;
        debounce = false;
        setTimeout(function () {
            debounce = true;
        }, debounceTime);
    }
    // Show SS interface
    if (this.ssKey.isDown && !this.ssKey.altKey && this.game.sscarousel) {
        this.game.sscarousel.open();
    }
};

Screenshot.prototype.render = function () {
    if (this.ssReq) {
        //this.addShot(this.game.canvas.toDataURL());
        this.game.canvas.toBlob(this.uploadShot.bind(this), 'image/jpeg', 0.5);
        this.ssReq = false;
    }
};

Screenshot.prototype.getCount = function () {
    $.ajax({
        method: 'GET',
        url: '/ss/num',
        success: (data) => {
            //this.ssCount = data.count;
            //this.numShots = Math.min(this.ssCount, maxShots);
            this.curShot = data.count - 1;
            // for (let i = 0; i < this.numShots; i++) {
            //     this.game.load.image(`screenshot_${i}`, `/ss/${this.ssCount - 1 - i}`);
            // }
            this.game.load.image('ssone', `/ss/${this.curShot - 1}`);
            this.game.load.image('sstwo', `/ss/${this.curShot}`);
            this.game.load.image('ssthree', `/ss/${this.curShot + 1}`);
            this.game.load.onLoadComplete.addOnce(() => {
                this.game.sscarousel.ssLeft.loadTexture('ssone');
                this.game.sscarousel.ssCenter.loadTexture('sstwo');
                this.game.sscarousel.ssRight.loadTexture('ssthree');
            });
            this.game.load.start();
            this.lastShot = 0;
        }
    });
};

Screenshot.prototype.addShot = function (dataurl) {
    this.lastShot = (this.lastShot + 1) % maxShots;
    this.numShots = Math.min(this.numShots + 1, maxShots);
    //this.screenshots[this.lastShot] = dataurl;
    //this.game.cache.addImage('screenshot_' + this.lastShot, null, dataurl);
    this.game.load.image('screenshot_' + this.lastShot, dataurl);
    this.game.load.start();
};

Screenshot.prototype.uploadShot = function (blob) {
    $.ajax({
    method: 'POST',
    url: '/ss',
    data: blob,
    contentType: 'image/jpeg',
    processData: false
    });
};

module.exports = Screenshot;