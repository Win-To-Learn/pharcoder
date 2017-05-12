/**
 * TutorialInterface.js
 */
'use strict';

var FSM = require('../util/FSM.js');

var api_key = 'key-426b722a669becf8c90a677a8409f907';
var domain = 'sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});




module.exports = {

        setTutorial: function (player) {
        var self = this;

            var data = {
                from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
                to: 'jonathanmartinnyc@gmail.com',
                subject: 'Student Progress',
                text: 'Your child or student - ' + player.gamertag + ' - has just created a station block! This shows their ability to use Cartesian coordinates in a series of blocks to create a geometric object with code!'
            };

            var color_message = {
                from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
                to: 'markellisdev@gmail.com',
                subject: 'Student Progress - Color change',
                text: "Your child or student - " + player.gamertag + " - has just changed their ship's color! This shows their ability to use Cartesian coordinates."
            }

        player.tutorial = new FSM(standardTutorial, 'init');
        player.tutorial.once('goalPlayAnimatedMission', function () {
            player.ship.invulnerable = true;
            self.sendMessage(player, 'tutorialvid', {key: 'cinematicintro', title: 'Mission\nBriefing #1'});
        });
        player.tutorial.once('pendingPlayAnimatedMission', function () {
            self.sendMessage(player, 'tutorial', 'Bring life back to the galaxy!\nPlant 5 trees on a planet so the Pharcoes can come home!');
        });
        player.tutorial.once('achievedPlayAnimatedMission', function () {
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
            player.ship.invulnerable = true;
            self.sendMessage(player, 'tutorialvid', {key: 'changethrustforce', title: 'Change\nthrust force #2'});
            self.sendMessage(player, 'tutorial', 'Change your thrust force. Press V to replay video missions.');
        });
        player.tutorial.once('achievedChangeThrust', function () {
                player.getShip().crystals += 250;
                self.sendMessage(player, 'tutorial', 'Terrific!');
                self.sendMessage(player, 'crystal', 250);
        });
        player.tutorial.once('goalChangeColor', function () {
            player.ship.invulnerable = true;
            self.sendMessage(player, 'tutorialvid', {key: 'colorchange', title: 'Change Ship Color\n#3'});
            self.sendMessage(player, 'tutorial', 'Change the color of your ship.');
        });
        player.tutorial.once('achievedChangeColor', function () {
            if (player.role === 'player') {
                mailgun.messages().send(color_message, function (error, body) {
                    console.log(body);
                })
            }
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
            player.ship.invulnerable = true;
            self.sendMessage(player, 'tutorialvid', {key: 'createstationblock', title: 'Create Station\nBlocks #4'});

        });
        player.tutorial.once('achievedCreateStationBlocks', function () {
            if (player.role === 'player') {
                mailgun.messages().send(data, function (error, body) {
                    console.log(body);
                });
            }
            player.getShip().crystals += 250;
            self.sendMessage(player, 'tutorial', 'Amazing!');
            self.sendMessage(player, 'crystal', 250);
        });
		player.tutorial.once('endTutorial1', function () {
            self.sendMessage(player, 'tutorial', '150 blue biocrystals needed for each additional tree. Plant 5 so the Pharcoes can return!');
		});
        player.tutorial.once('endTutorial2', function () {
            self.sendMessage(player, 'tutorial', 'Click V to play mission briefings. T key for tractor beam');
            player.ship.invulnerable = true;
            self.sendMessage(player, 'tutorialvid', {key: 'tilsacallforhelp', title: 'Tilsas Call\n #5'});
        });
        player.tutorial.once('endTutorial3', function () {
            self.sendMessage(player, 'tutorial', 'Use the Editor and Javascript to camouflage your ship from the Gwexies.');
            player.ship.invulnerable = true;
            self.sendMessage(player, 'tutorialvid', {key: 'changetocamo', title: 'Camouflage #6'});
        });
		player.tutorial.once('endTutorial4', function () {
			self.sendMessage(player, 'tutorial', '');
            player.ship.invulnerable = true;
            self.sendMessage(player, 'loadvid', {key: 'defeathydra', title: 'Defeat the\nHydra #7'});
            self.sendMessage(player, 'loadvid', {key: 'wordsofwisdom', title: 'Words of\nWisdom #8'});
            self.sendMessage(player, 'loadvid', {key: 'tilsacodingintro', title: 'Tilsa Coding\nIntro #9'});
            self.sendMessage(player, 'loadvid', {key: 'changingshape', title: 'Changing Shape\nIntro #10'});
            self.sendMessage(player, 'loadvid', {key: 'deploycode', title: 'Deploy Code\nIntro #11'});
		});
    },

    login: function (socket, player) {
            this.setTutorial(player);
        },

    ready: function (player) {
        if (player.tutorialEnabled) {
            player.tutorial.transition('start');
        }
        else{
            this.sendMessage(player, 'loadvid', {key: 'cinematicintro', title: 'Mission\nBriefing #1'});
            this.sendMessage(player, 'loadvid', {key: 'changethrustforce', title: 'Change\nthrust force #2'});
            this.sendMessage(player, 'loadvid', {key: 'colorchange', title: 'Change Ship Color\n#3'});
            this.sendMessage(player, 'loadvid', {key: 'createstationblock', title: 'Create Station\nBlocks #4'});
            this.sendMessage(player, 'loadvid', {key: 'tilsacallforhelp', title: 'Tilsas Call\n #5'});
            this.sendMessage(player, 'loadvid', {key: 'changetocamo', title: 'Camouflage #6'});
            this.sendMessage(player, 'loadvid', {key: 'defeathydra', title: 'Defeat the\nHydra #7'});
            this.sendMessage(player, 'loadvid', {key: 'wordsofwisdom', title: 'Words of\nWisdom #8'});
            this.sendMessage(player, 'loadvid', {key: 'tilsacodingintro', title: 'Tilsa Coding\nIntro #9'});
            this.sendMessage(player, 'loadvid', {key: 'changingshape', title: 'Changing Shape\nIntro #10'});
            this.sendMessage(player, 'loadvid', {key: 'deploycode', title: 'Deploy Code\nIntro #11'});
        }

    }
};

var standardTutorial = {
    init: {start: 'goalPlayAnimatedMission'},
    goalPlayAnimatedMission: {auto: 'pendingPlayAnimatedMission', timeout:21000},
    pendingPlayAnimatedMission: {auto: 'achievedPlayAnimatedMission', timeout:7000},
    achievedPlayAnimatedMission: {auto: 'goalTurnRight'},
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
    endTutorial2: {auto: 'endTutorial3', timeout: 20000},
    endTutorial3: {auto: 'endTutorial4', timeout: 20000}
};