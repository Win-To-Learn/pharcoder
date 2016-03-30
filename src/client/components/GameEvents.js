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

    alert: function (text) {
        this.game.sounds.alert.play();
        Toast.growUp(self.game, self.game.camera.view.centerX, self.game.camera.view.bottom, text);
    }
};
