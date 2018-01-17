/**
 * TutorialInterface.js
 */
'use strict';

var FSM = require('../util/FSM.js');

var api_key = 'key-426b722a669becf8c90a677a8409f907';
var domain = 'sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var mongo = require('./MongoInterface.js');



module.exports = {

        setTutorial: function (player) {
          var self = this;

          var makeMessage = function (message_type, player) {
            return {
              from: 'Team Starcoder <postmaster@sandboxb5a8ef1c9c5441d2afd27e5d8a15329d.mailgun.org>',
              to: 'jonathanmartinnyc@gmail.com',
              // to: 'markellisdev@gmail.com',
              subject: ('Student Progress - ' + message_type.subject),
              text: ('Your child or student - ' + player.gamertag + ' - has just ' + message_type.text)
            }
          };

          var stationblock_message = {
              subject: 'Station Block Creation',
              text: 'created a station block! This shows their ability to use Cartesian coordinates in a series of blocks to create a geometric object with code!'
          };

          var color_message = {
              subject: 'Color Change',
              text: "changed their ship's color!"
          };

          var thrust_message = {
              subject: 'Thrust',
              text: "activated their ship's thrust!"
          };

          var changethrust_message = {
              subject: 'Thrust Change',
              text: "changed their ship's thrust power!"
          };

          var turnright_message = {
              subject: 'Turn Change - Right',
              text: "turned their ship to the right!"
          };

          var turnleft_message = {
              subject: 'Turn Change - Left',
              text: "turned their ship to the left!"
          };

          var planttree_message = {
              subject: 'Tree Planted',
              text: "planted a tree!"
          };

          var d = new Date();
          var currentDate = d.toISOString().slice(0,-14);
          var n = d.toTimeString().slice(0,-15);


        player.tutorial = new FSM(standardTutorial, 'init');
        player.tutorial.once('goalPlayAnimatedMission', function () {
            player.ship.invulnerable = true;
            self.sendMessage(player, 'tutorialvid', {key: 'cinematicintro', title: 'Mission\nBriefing #1'});
        });
        player.tutorial.once('pendingPlayAnimatedMission', function () {
            self.sendMessage(player, 'tutorial', '\n\nBring life back to the galaxy!\nPlant 5 trees on a planet so the Pharcoes can come home!\n' +
                '(¡Devuelve la vida a la galaxia!\nPlanta 5 árboles en un planeta para que los Pharco puedan volver' +
                ' a casa.)');
        });
        player.tutorial.once('achievedPlayAnimatedMission', function () {
            //self.sendMessage(player, 'tutorial', 'Hold the RIGHT ARROW key on your keyboard to turn right');
            self.sendMessage(player, 'tutorial', 'Hold the RIGHT ARROW key on your keyboard to turn right\n' +
                '(Mantenga presionada la tecla de FLECHA DERECHA en su teclado para girar a la derecha)');
        });
        player.tutorial.once('achievedTurnRight', function () {
            player.getShip().crystals += 50;
            self.sendMessage(player, 'tutorial', 'Well done!');
            mongo.mongoInsertOne(self.mongoHighscores, { gamertag: player.gamertag, achievement: 'right turn', full_date: d });
            self.sendMessage(player, 'crystal', 50);
            if (player.role === 'player') {
                mailgun.messages().send(makeMessage(turnright_message, player), function (error, body) {
                })
            };
        });
        player.tutorial.once('goalTurnLeft', function () {
            //self.sendMessage(player, 'tutorial', 'Hold the LEFT ARROW key on your keyboard to turn left');
            self.sendMessage(player, 'tutorial', 'Hold the LEFT ARROW key on your keyboard to turn left\n' +
                '(Mantenga presionada la tecla FLECHA IZQUIERDA en su teclado para girar a la izquierda)');
        });
        player.tutorial.once('achievedTurnLeft', function () {
            player.getShip().crystals += 50;
            self.sendMessage(player, 'tutorial', 'Nice job!');
            self.sendMessage(player, 'crystal', 50);
            mongo.mongoInsertOne(self.mongoHighscores, { gamertag: player.gamertag, achievement: 'left turn', full_date: d });
            if (player.role === 'player') {
                mailgun.messages().send(makeMessage(turnleft_message, player), function (error, body) {
                })
            };
        });
        player.tutorial.once('goalThrust', function () {
            //self.sendMessage(player, 'tutorial', 'Hold the UP ARROW key on your keyboard to power thrusters');
            self.sendMessage(player, 'tutorial', 'Hold the UP ARROW key on your keyboard to power thrusters\n' +
                '(Mantenga presionada la tecla FLECHA ARRIBA en su teclado para impulsar los impulsores)');
        });
        player.tutorial.once('achievedThrust', function () {
            player.getShip().crystals += 50;
            self.sendMessage(player, 'tutorial', 'Great!');
            self.sendMessage(player, 'crystal', 50);
            mongo.mongoInsertOne(self.mongoHighscores, { gamertag: player.gamertag, achievement: 'thrust', full_date: d });
            if (player.role === 'player') {
                mailgun.messages().send(makeMessage(thrust_message, player), function (error, body) {
                })
            };
        });
        player.tutorial.once('goalChangeThrust', function () {
            player.ship.invulnerable = true;
            self.sendMessage(player, 'tutorialvid', {key: 'changethrustforce', title: 'Change\nthrust force #2'});
            //self.sendMessage(player, 'tutorial', 'Change your thrust force. Press V to replay video missions.');
            self.sendMessage(player, 'tutorial', 'Change your thrust force. Press V to replay video missions.\n' +
                '(Cambia tu fuerza de empuje. Presiona V para reproducir misiones de video.)');
        });
        player.tutorial.once('achievedChangeThrust', function () {
            player.getShip().crystals += 250;
            self.sendMessage(player, 'tutorial', 'Terrific!');
            self.sendMessage(player, 'crystal', 250);
            mongo.mongoInsertOne(self.mongoHighscores, { gamertag: player.gamertag, achievement: 'thrust change', full_date: d });
            if (player.role === 'player') {
                mailgun.messages().send(makeMessage(changethrust_message, player), function (error, body) {
                })
            };
        });
        player.tutorial.once('goalChangeColor', function () {
            player.ship.invulnerable = true;
            self.sendMessage(player, 'tutorialvid', {key: 'colorchange', title: 'Change Ship Color\n#3'});
            //self.sendMessage(player, 'tutorial', 'Change the color of your ship.');
            self.sendMessage(player, 'tutorial', 'Change the color of your ship\n' +
                '(Cambia el color de tu nave)');
        });
        player.tutorial.once('achievedChangeColor', function () {
            mongo.mongoInsertOne(self.mongoHighscores, { gamertag: player.gamertag, achievement: 'change color', full_date: d });
            /**
            The next function, mongoFind, retrieves the previous week's achievements.
            Obviously, we'll want to move it out of an achievement and have it check date to calculate valid weekly dates, but I put it here to test functionality
            */
            //mongo.mongoFind(
            //  self.mongoHighscores,
            //  {gamertag: "ransomsquest", full_date:  {$gte: "2017-06-05T00:00:00.856Z", $lt:
            // "2017-06-12T00:00:00.856Z"}}
            //).then(function(res) {console.log("These are the records ", res)});

            if (player.role === 'player') {
                mailgun.messages().send(makeMessage(color_message, player), function (error, body) {
                })
            };
            player.getShip().crystals += 250;
                //self.sendMessage(player, 'tutorial', 'Terrific! See your red ship on the minimap!');
            self.sendMessage(player, 'tutorial', 'Terrific! See your red ship on the minimap!\n' +
                '(¡Estupendo! ¡Mira tu nave roja en el minimapa!)');
            self.sendMessage(player, 'crystal', 250);
        });
        player.tutorial.once('goalPlantTree', function () {
            //self.sendMessage(player, 'tutorial', 'Now fly to a green planet and touch it to plant a tree.');
            self.sendMessage(player, 'tutorial', 'Now fly to a green planet and touch it to plant a tree.\n' +
                '(Ahora vuela a un planeta verde y tócalo para plantar un árbol.)');
        });
        player.tutorial.once('achievedPlantTree', function () {
            mongo.mongoInsertOne(self.mongoHighscores, { gamertag: player.gamertag, achievement: 'plant tree', full_date: d });
            self.sendMessage(player, 'tutorial', 'Fantastic!');
            if (player.role === 'player') {
                mailgun.messages().send(makeMessage(planttree_message, player), function (error, body) {
                });
            };
		});
        player.tutorial.once('goalLasers', function () {
            //self.sendMessage(player, 'tutorial', 'Press the SPACEBAR on your keyboard to fire your lasers at purple' +
              //  ' asteroids & orange aliens');
            //self.sendMessage(player, 'tutorial', 'Open the Coding Window and try some Code Challenges!');
            self.sendMessage(player, 'tutorial', '\n\nPress the SPACEBAR on your keyboard to fire your lasers at' +
                ' purple' +
                ' asteroids.\n' +
                'Then open the Coding Window and try some Code Challenges!\n' +
                '(Presiona la BARRA ESPACIADORA en tu teclado para disparar tus láseres a los asteroides morados.\n' +
                '¡Entonces abre la ventana de codificación y prueba algunos Desafíos del Código!)');

        });
            /**
        player.tutorial.once('goalCreateStationBlocks', function () {
            self.sendMessage(player, 'tutorial', 'Create station blocks & push them to the planet to create a fort around your trees');
            player.ship.invulnerable = true;
            self.sendMessage(player, 'tutorialvid', {key: 'createstationblock', title: 'Create Station\nBlocks #4'});

        });
        player.tutorial.once('achievedCreateStationBlocks', function () {
            mongo.mongoInsertOne(self.mongoHighscores, { gamertag: player.gamertag, achievement: 'create stationblock', full_date: d });
            if (player.role === 'player') {
                mailgun.messages().send(makeMessage(stationblock_message, player), function (error, body) {
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
             **/
		player.tutorial.once('endTutorial4', function () {
			self.sendMessage(player, 'tutorial', '');
            //player.ship.invulnerable = true;
            self.sendMessage(player, 'loadvid', {key: 'createstationblock', title: 'Create Station\nBlocks #4'});
            self.sendMessage(player, 'loadvid', {key: 'tilsacallforhelp', title: 'Tilsas Call\n #5'});
            self.sendMessage(player, 'loadvid', {key: 'changetocamo', title: 'Camouflage #6'});
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
    //goalLasers: {auto: 'goalCreateStationBlocks', timeout: 1500},
    goalLasers: {auto: 'endTutorial1', timeout: 10000},

    //goalCreateStationBlocks: {createstationblocks: 'achievedCreateStationBlocks'},
    //achievedCreateStationBlocks: {auto: 'endTutorial1', timeout: 7000},
    endTutorial1: {auto: 'endTutorial2', timeout: 500},
    endTutorial2: {auto: 'endTutorial3', timeout: 500},
    endTutorial3: {auto: 'endTutorial4', timeout: 500}
	//endTutorial1: {auto: 'endTutorial2', timeout: 7000},
    //endTutorial2: {auto: 'endTutorial3', timeout: 20000},
    //endTutorial3: {auto: 'endTutorial4', timeout: 20000}
};
