/**
 * GameEvents.js
 */
'use strict';

var Toast = require('../ui/Toast.js');

module.exports = {
    finalize: function () {
        for (var type in events) {
            this.addMessageHandler(type, events[type]);
        }
    }
};

var events = {
    crystal: function (val) {
        this.game.sounds.chime.play();
        Toast.spinUp(this.game, this.game.playerShip.x, this.game.playerShip.y, '+' + val + ' biocrystals!');
    },

    planttree: function () {
        this.game.sounds.planttree.play();
        Toast.spinUp(this.game, this.game.playerShip.x, this.game.playerShip.y,  'You planted a tree! Life is returning!');
    },

    alienapproach: function () {
        this.game.sounds.chopper.play();
    },

    asteroid: function (size) {
        /**if (size > 1) {
            this.game.sounds.bigpop.play();
        } else {
            this.game.sounds.littlepop.play();
        }**/
        this.game.sounds.bigpop.play();
        Toast.spinUp(this.game, this.game.playerShip.x, this.game.playerShip.y,  'You shot an Asteroid!');
    },

    tagged: function () {
        this.game.sounds.tagged.play();
    },

    explosion: function () {
        this.game.sounds.explosion.play();
        Toast.spinUp(this.game, this.game.playerShip.x, this.game.playerShip.y,  'You collided with an Asteroid!');
    },

    shipattacked: function () {
        this.game.sounds.shipattacked.play();
        Toast.spinUp(this.game, this.game.playerShip.x, this.game.playerShip.y,  'You were attacked by a Gwexi!');
    },

    shipvulnerable: function () {
        Toast.spinUp(this.game, this.game.playerShip.x, this.game.playerShip.y,  'Avoid' +
            ' contact with Asteroids and Gwexis!');
    },

    shipinvulnerable: function () {
        this.game.playerShip.invulnerable = true;
        //Toast.spinUp(this.game, this.game.playerShip.x, this.game.playerShip.y,  'You were attacked by a Gwexi!');
    },

    treesdestroyed: function () {
        this.game.sounds.treesdestroyed.play();
    },
    
    laser: function () {
        this.game.sounds.laser.play();
    },

    music: function (state) {
        if (state === 'on') {
            this.game.sounds.music.resume();
        } else {
            this.game.sounds.music.pause();
        }
    },

    grid: function (state) {
        if (state === 'on') {
            this.showGrid();
        } else {
            this.hideGrid();
        }
    },

    tutorial: function (text) {
        this.game.tutormessage.setMessage(text);
    },

    challengewon1: function (text) {
        this.game.sounds.reward1.play();
        Toast.spinUp(this.game, this.game.playerShip.x, this.game.playerShip.y, text);

    },

    challengewon2: function (text) {
        this.game.sounds.reward2.play();
        Toast.spinUp(this.game, this.game.playerShip.x, this.game.playerShip.y, text);

    },

    challengewon3: function (text) {
        this.game.sounds.reward3.play();
        Toast.spinUp(this.game, this.game.playerShip.x, this.game.playerShip.y, text);

    },

    challengewon4: function (text) {
        this.game.sounds.reward4.play();
        Toast.spinUp(this.game, this.game.playerShip.x, this.game.playerShip.y, text);

    },

    challengewon5: function (text) {
        this.game.sounds.reward5.play();
        Toast.spinUp(this.game, this.game.playerShip.x, this.game.playerShip.y, text);

    },

    tutorialvid: function (desc) {
        var vidurl = '/assets/video/' + desc.key + '.mp4';
        var thumbkey = desc.key + '-thumb';
        this.game.vidpicker.addVideo(thumbkey, desc.title, vidurl);
        this.game.vidplayer.play(vidurl);
    },

    loadvid: function (desc) {
        var vidurl = '/assets/video/' + desc.key + '.mp4';
        var thumbkey = desc.key + '-thumb';
        this.game.vidpicker.addVideo(thumbkey, desc.title, vidurl);
    },    

    alert: function (text) {
        this.game.sounds.alert.play();
        Toast.growUp(this.game, this.game.camera.view.centerX, this.game.camera.view.bottom, text);
    }
};
