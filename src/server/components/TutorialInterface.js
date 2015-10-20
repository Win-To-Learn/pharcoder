/**
 * TutorialInterface.js
 */
'use strict';

var FSM = require('../util/FSM.js');

module.exports = {
    setTutorial: function (player) {
        var self = this;
        player.tutorial = new FSM(standardTutorial, 'init');
        player.tutorial.once('goalTurnRight', function () {
            self.send(player, 'tutorial', 'Use the joystick or arrow keys to turn your ship to the right.');
        });
        player.tutorial.once('achievedTurnRight', function () {
            player.getShip().crystals += 50;
            self.send(player, 'crystal pickup', 50);
        });
        player.tutorial.once('goalTurnLeft', function () {
            self.send(player, 'tutorial', 'Use the joystick or arrow keys to turn your ship to the left.');
        });
        player.tutorial.once('achievedTurnLeft', function () {
            player.getShip().crystals += 50;
            self.send(player, 'crystal pickup', 50);
        });
    },

    onLoginCB: function (socket, player) {
        this.setTutorial(player);
    },

    onReadyCB: function (player) {
        player.tutorial.transition('start');
    }
};

var standardTutorial = {
    init: {start: 'goalTurnRight'},
    goalTurnRight: {turnright: 'achievedTurnRight'},
    achievedTurnRight: {auto: 'goalTurnLeft'},
    goalTurnLeft: {turnleft: 'achievedTurnLeft'},
    achievedTurnLeft: {auto: 'goalThrust'},
    goalThrust: {thrust: 'achievedThrust'},
    achievedThrust: {auto: 'goalPlantTree'},
    goalPlantTree: {planttree: 'achievedPlantTree'},
    achievedPlantTree: {auto: 'placeholder'}
};