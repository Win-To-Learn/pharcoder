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
        Toast.spinUp(this.game, this.game.playerShip.x, this.game.playerShip.y, '+' + val + ' crystals!');
    },

    planttree: function () {
        this.game.sounds.planttree.play();
    },

    alienapproach: function () {
        this.game.sounds.chopper.play();
    },

    asteroid: function (size) {
        if (size > 1) {
            this.game.sounds.bigpop.play();
        } else {
            this.game.sounds.littlepop.play();
        }
    },

    tagged: function () {
        this.game.sounds.tagged.play();
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

    tutorialvid: function (vid) {
        this.game.vidplayer.play('/assets/video/' + vid);
    },

    alert: function (text) {
        this.game.sounds.alert.play();
        Toast.growUp(this.game, this.game.camera.view.centerX, this.game.camera.view.bottom, text);
    }
};
