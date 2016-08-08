/**
 * TutorialInterface.js
 */
'use strict';

var FSM = require('../util/FSM.js');

module.exports = {
    setTutorial: function (player) {
        var self = this;
        player.tutorial = new FSM(standardTutorial, 'init');
        player.tutorial.once('goalPlayAnimatedMission', function () {
            self.sendMessage(player, 'tutorialvid', {key: 'cinematicintro', title: 'Play Animated Mission'});
            //self.sendMessage(player, 'tutorial', 'Change the color of your ship.');
        });

        player.tutorial.once('goalPlayAnimatedMission', function () {
            self.sendMessage(player, 'tutorial', 'Hold the RIGHT ARROW key on your keyboard to turn right');
        });
        player.tutorial.once('achievedTurnRight', function () {
            player.getShip().crystals += 50;
            self.sendMessage(player, 'tutorial', 'Well done!');
            self.sendMessage(player, 'crystal', 50);
        });
        player.tutorial.once('goalTurnLeft', function () {
            self.sendMessage(player, 'tutorial', 'Hold the LEFT ARROW key on your keyboard to turn left');
        });
        player.tutorial.once('achievedTurnLeft', function () {
            player.getShip().crystals += 50;
            self.sendMessage(player, 'tutorial', 'Nice job!');
            self.sendMessage(player, 'crystal', 50);
        });
        player.tutorial.once('goalThrust', function () {
            self.sendMessage(player, 'tutorial', 'Hold the UP ARROW key on your keyboard to power thrusters');
        });
        player.tutorial.once('achievedThrust', function () {
            player.getShip().crystals += 50;
            self.sendMessage(player, 'tutorial', 'Great!');
            self.sendMessage(player, 'crystal', 50);
        });
        player.tutorial.once('goalChangeThrust', function () {
            self.sendMessage(player, 'tutorialvid', {key: 'changethrustforce', title: 'Change your thrust force'});
            self.sendMessage(player, 'tutorial', 'Change your thrust force. Press V to replay video missions.');
        });
        player.tutorial.once('achievedChangeThrust', function () {
                player.getShip().crystals += 250;
                self.sendMessage(player, 'tutorial', 'Terrific!');
                self.sendMessage(player, 'crystal', 250);
        });
        player.tutorial.once('goalChangeColor', function () {
            self.sendMessage(player, 'tutorialvid', {key: 'colorchange', title: 'Change Ship Color'});
            self.sendMessage(player, 'tutorial', 'Change the color of your ship.');
        });
        player.tutorial.once('achievedChangeColor', function () {
            player.getShip().crystals += 250;
            self.sendMessage(player, 'tutorial', 'Terrific! See your red ship on the minimap!');
            self.sendMessage(player, 'crystal', 250);
        });
        player.tutorial.once('goalPlantTree', function () {
            self.sendMessage(player, 'tutorial', 'Now fly to a green planet and touch it to plant a tree.');
        });
        player.tutorial.once('achievedPlantTree', function () {
            self.sendMessage(player, 'tutorial', 'Fantastic!');
		});
        player.tutorial.once('goalLasers', function () {
            self.sendMessage(player, 'tutorial', 'Press the SPACEBAR on your keyboard to fire your lasers at purple asteroids & orange aliens');
        });
        player.tutorial.once('goalCreateStationBlocks', function () {
            self.sendMessage(player, 'tutorial', 'Create station blocks & push them to the planet to create a fort around your trees');
            self.sendMessage(player, 'tutorialvid', {key: 'createstationblock', title: 'Create Station Blocks'});
        });
        player.tutorial.once('achievedCreateStationBlocks', function () {
            player.getShip().crystals += 250;
            self.sendMessage(player, 'tutorial', 'Amazing!');
            self.sendMessage(player, 'crystal', 250);
        });
		player.tutorial.once('endTutorial1', function () {
            self.sendMessage(player, 'tutorial', '150 blue biocrystals needed for each additional tree. Plant 5 so the Pharcoes can return!');
		});
        player.tutorial.once('endTutorial2', function () {
            self.sendMessage(player, 'tutorial', 'Click V to play mission briefings. T key for tractor beam');
            self.sendMessage(player, 'tutorialvid', {key: 'tilsacallforhelp', title: 'Tilsas Call'});
        });
		player.tutorial.once('endTutorial3', function () {
			self.sendMessage(player, 'tutorial', '');
            self.sendMessage(player, 'loadvid', {key: 'defeathydra', title: 'Defeat the Hydra'});
            self.sendMessage(player, 'loadvid', {key: 'wordsofwisdom', title: 'Words of Wisdom'});
            self.sendMessage(player, 'loadvid', {key: 'tilsacodingintro', title: 'Tilsa Coding Intro'});
            self.sendMessage(player, 'loadvid', {key: 'createstationblock', title: 'Create Station Block'});
		});
    },

    login: function (socket, player) {
            this.setTutorial(player);
        },

    ready: function (player) {
        player.tutorial.transition('start');
    }
};

var standardTutorial = {
    init: {start: 'goalPlayAnimatedMission'},
    goalPlayAnimatedMission: {auto: 'goalTurnRight'},
    goalTurnRight: {turnright: 'pendingTurnRight'},
    pendingTurnRight: {
        turnleft: 'goalTurnRight', stopturning: 'goalTurnRight',
        auto: 'achievedTurnRight', timeout: 500
    },
    achievedTurnRight: {auto: 'goalTurnLeft', timeout: 1500},
    goalTurnLeft: {turnleft: 'pendingTurnLeft'},
    pendingTurnLeft: {
        turnright: 'goalTurnLeft', stopturning: 'goalTurnLeft',
        auto: 'achievedTurnLeft', timeout: 500
    },
    achievedTurnLeft: {auto: 'goalThrust', timeout: 1500},
    goalThrust: {thrust: 'pendingThrust'},
    pendingThrust: {
        retrothrust: 'goalThrust', stopthrust: 'goalThrust',
        auto: 'achievedThrust', timeout: 500
    },
    achievedThrust: {auto: 'goalChangeThrust', timeout: 1500},
    goalChangeThrust: {changethrust: 'achievedChangeThrust'},
    achievedChangeThrust: {auto: 'goalChangeColor', timeout: 1500},
    goalChangeColor: {changecolor: 'achievedChangeColor'},
    achievedChangeColor: {auto: 'goalPlantTree', timeout: 1500},
    goalPlantTree: {planttree: 'achievedPlantTree'},
    achievedPlantTree: {auto: 'goalLasers',timeout: 2500},
    goalLasers: {auto: 'goalCreateStationBlocks', timeout: 1500},
    goalCreateStationBlocks: {createstationblocks: 'achievedCreateStationBlocks'},
    achievedCreateStationBlocks: {auto: 'endTutorial1', timeout: 7000},
	endTutorial1: {auto: 'endTutorial2', timeout: 7000},
    endTutorial2: {auto: 'endTutorial3', timeout: 7000},
};