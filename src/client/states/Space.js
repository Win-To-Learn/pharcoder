/**
 * Space.js
 *
 * Main game state for Starcoder
 */
'use strict';

var SimpleParticle = require('../bodies/SimpleParticle.js');
var ThrustGenerator = require('../bodies/ThrustGenerator.js');
var MiniMap = require('../ui/MiniMap.js');
var LeaderBoard = require('../ui/LeaderBoard.js');
var VidPlayer = require('../ui/VidPlayer.js');
var Toast = require('../ui/Toast.js');
var HUD = require('../ui/HUD.js');
var TutorMessage = require('../ui/TutorMessage.js');

var Controls = require('../plugins/Controls.js');
var SyncClient = require('../plugins/SyncClient.js');

var Space = function () {};

Space.prototype = Object.create(Phaser.State.prototype);
Space.prototype.constructor = Space;

Space.prototype.init = function () {
    this.starcoder.controls = this.starcoder.attachPlugin(Controls, this.starcoder.cmdQueue);
    this.starcoder.syncclient = this.starcoder.attachPlugin(SyncClient,
        this.starcoder.socket, this.starcoder.cmdQueue);
    this.stage.disableVisibilityChange = true;
};

Space.prototype.preload = function () {
    SimpleParticle.cacheTexture(this.game, ThrustGenerator.textureKey, '#ff6600', 8);
    SimpleParticle.cacheTexture(this.game, 'bullet', '#999999', 4);
    SimpleParticle.cacheTexture(this.game, 'tractor', '#eeeeee', 8, true);
    //this.game.load.audio('playerthrust', 'assets/sounds/thrustLoop.ogg');
    //this.game.load.audio('chime', 'assets/sounds/chime.mp3');
    //this.game.load.atlas('joystick', 'assets/joystick/generic-joystick.png', 'assets/joystick/generic-joystick.json');
    //this.game.load.bitmapFont('readout-yellow',
    //    'assets/bitmapfonts/heavy-yellow24.png', 'assets/bitmapfonts/heavy-yellow24.xml');
};

Space.prototype.create = function () {
    window.scrollTo(0, 1);
    //console.log('create');
    //var rng = this.game.rnd;
    //var wb = this.starcoder.config.worldBounds;
    //var ps = this.starcoder.config.physicsScale;
    var sc = this.starcoder;
    //this.game.physics.startSystem(Phaser.Physics.P2JS);
    //this.world.setBounds.call(this.world, wb[0]*ps, wb[1]*ps, (wb[2]-wb[0])*ps, (wb[3]-wb[1])*ps);
    this.world.setBounds(sc.phaserLeft, sc.phaserTop, sc.phaserWidth, sc.phaserHeight);
    //this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    // Debugging
    //this.game.time.advancedTiming = true;

    // Set up DOM
    //this.starcoder.layoutDOMSpaceState();

    this.starcoder.controls.reset();

    // Virtual joystick
    this.starcoder.controls.addVirtualControls('joystick');
    //this.game.vcontrols = {};
    //this.game.vcontrols.stick = this.game.joystick.addStick(
    //    this.game.width - 150, this.game.height - 75, 100, 'joystick');
    //this.game.vcontrols.stick.scale = 0.5;
    //this.game.vcontrols.firebutton = this.game.joystick.addButton(this.game.width - 50, this.game.height - 75,
    //    'joystick', 'button1-up', 'button1-down');
    //this.game.vcontrols.firebutton.scale = 0.5;

    // Sounds
    this.game.sounds = {};
    this.game.sounds.playerthrust = this.game.sound.add('playerthrust', 1, true);
    this.game.sounds.chime = this.game.sound.add('chime', 1, false);
    this.game.sounds.planttree = this.game.sound.add('planttree', 1, false);
    this.game.sounds.bigpop = this.game.sound.add('bigpop', 1, false);
    this.game.sounds.littlepop = this.game.sound.add('littlepop', 1, false);
    this.game.sounds.tagged = this.game.sound.add('tagged', 1, false);
    this.game.sounds.laser = this.game.sound.add('laser', 1, false);
    this.game.sounds.alert = this.game.sound.add('alert', 1, false);
    this.game.sounds.chopper = this.game.sound.add('chopper', 1, false);

    this.game.sounds.music = this.game.sound.add('music', 1, true);
    this.game.sounds.music.play();

    // Background - FIXME
    //this.starcoder.starfield = this.game.make.bitmapData(600, 600, 'starfield', true);
    //this.starcoder.drawStarField(this.starcoder.starfield.ctx, 600, 16);
    //this.game.add.tileSprite(wb[0]*ps, wb[1]*ps, (wb[2]-wb[0])*ps, (wb[3]-wb[1])*ps, this.starcoder.starfield);
    //this.game.add.tileSprite(sc.phaserLeft, sc.phaserTop, sc.phaserWidth, sc.phaserHeight);

    this.starcoder.syncclient.start();
    //this.starcoder.socket.emit('client ready');
    //this._setupMessageHandlers(this.starcoder.socket);
    // FIXME - stopgap 
    var self = this;
    this.starcoder.socket.on('msg code pickup', function (val) {
        self.game.sounds.chime.play();
        Toast.spinUp(self.game, self.game.playerShip.x, self.game.playerShip.y, 'New Code!');
        self.starcoder.setCodeForUI(val);
    });
    this.starcoder.socket.emit('ready');

    // Groups for particle effects
    this.game.thrustgenerator = new ThrustGenerator(this.game);

    // Group for game objects
    this.game.playfield = this.game.add.group();

    // Group for grid
    this.game.gridOverlay = this.starcoder.createGrid();

    // UI
    this.game.ui = this.game.add.group();
    this.game.ui.fixedToCamera = true;

    this.game.hud = new HUD(this.game, (this.game.width - 180)/ 2, 2, 180, 120);
    this.game.ui.add(this.game.hud);
    //this.game.hud.anchor.setTo(0.5, 0);

    this.game.tutormessage = new TutorMessage(this.game);
    this.game.ui.add(this.game.tutormessage);
    //this.game.tutormessage.setMessage('');
    this.game.tutormessage.x = this.game.width / 2;
    this.game.tutormessage.y = 150;

    // MiniMap
    this.game.minimap = new MiniMap(this.game, 300, 300);
    this.game.ui.add(this.game.minimap);
    this.game.minimap.x = 10;
    this.game.minimap.y = 10;

    // Leaderboard
    this.game.leaderboard = new LeaderBoard(this.game, this.starcoder.playerMap, 200, 300);
    this.game.ui.add(this.game.leaderboard);
    this.game.leaderboard.x = this.game.width - 200;
    this.game.leaderboard.y = 0;
    this.game.leaderboard.visible = false;
    this.game.starcoder.startLeaderBoard();

    // Video

    this.game.vidplayer = new VidPlayer(this.game, this.game.width/2, this.game.height/2);
    this.game.ui.add(this.game.vidplayer);
    //this.game.vidplayer.visible = false;
    //this.game.tutvideo = this.game.add.video('defeathydra');
    //this.game.tutvideo.onPlay.add(function () {
    //    console.log('Vid playing');
    //});
    //this.game.tutvideo.onComplete.add(function() {
    //    console.log('vid done');
    //});
    //this.game.vidscreen = this.game.make.image(this.game.width/2, this.game.height/2, this.game.tutvideo);
    //this.game.vidscreen.anchor.setTo(0.5);
    //this.game.ui.add(this.game.vidscreen);
    //this.game.vidscreen.visible = false;


    // Links
    for (var i = 0; i < sc.config.links.length; i++) {
        var spec = sc.config.links[i];
        var x = spec.x;
        if (x[x.length - 1] === '%') {
            x = Math.floor(this.game.width * Number(x.substr(0, x.length - 1)) * 0.01);
        } else {
            x = Number(x);
        }
        if (x < 0) {
            x = this.game.width + x;
        }
        var y = spec.y;
        if (y[y.length - 1] === '%') {
            y = Math.floor(this.game.height * Number(y.substr(0, y.length - 1)) * 0.01);
        } else {
            y = Number(y);
        }
        if (y < 0) {
            y = this.game.height + y;
        }
        var linktext = sc.makeFlexText(x, y, spec.text, spec.properties);
        linktext.anchor.setTo(0.5);
        linktext.inputEnabled = true;
        linktext.destURL = spec.url;
        linktext.events.onInputUp.add(function (link) {
            window.open(link.destURL);
        });
        this.game.ui.add(linktext);

        /*
        // Button for testing
        var dostuff = sc.makeFlexText(this.game.width / 2, this.game.height - 24, 'Do Stuff',
            {font: '20px Arial', fill: '#0000ff', align: 'center'});
        dostuff.anchor.setTo(0.5);
        dostuff.inputEnabled = true;
        dostuff.events.onInputUp.add(function () {
            this.game.vidplayer.play('/assets/video/defeathydra.mp4');
            //this.game.vidscreen.visible = true;
            //this.game.tutvideo.play();
        }, this);
        this.game.ui.add(dostuff);
        */

    }

};

//Space.prototype.update = function () {
//    // FIXME: just a mess for testing
//    var self = this;
//    this.starcoder.controls.processQueue(function (a) {
//        if (a.type === 'up_pressed') {
//            self.game.playerShip.localState.thrust = 'starting';
//            //self.game.sounds.playerthrust.play();
//            //self.game.thrustgenerator.startOn(self.game.playerShip);
//        } else if (a.type === 'up_released') {
//            self.game.playerShip.localState.thrust = 'shutdown';
//            //self.game.sounds.playerthrust.stop();
//            //self.game.thrustgenerator.stopOn(self.game.playerShip);
//        }
//    });
//};

Space.prototype._setupMessageHandlers = function (socket) {
    var self = this;
    socket.on('msg code pickup', function (val) {
        self.game.sounds.chime.play();
        Toast.spinUp(self.game, self.game.playerShip.x, self.game.playerShip.y, 'New Code!');
        self.starcoder.setCodeForUI(val);
    });
    socket.on('msg plant tree', function (val) {
        self.game.sounds.planttree.play();
    });
    socket.on('msg asteroid pop', function (size) {
        if (size > 1) {
            self.game.sounds.bigpop.play();
        } else {
            self.game.sounds.littlepop.play();
        }
    });
    socket.on('msg tagged', function (val) {
        self.game.sounds.tagged.play();
    });
    socket.on('msg laser', function (val) {
        self.game.sounds.laser.play();
    });
    socket.on('music', function (state) {
        if (state === 'on') {
            self.game.sounds.music.resume();
        } else {
            self.game.sounds.music.pause();
        }
    });
    socket.on('grid', function (state) {
        console.log('grid state', state);
        if (state === 'on') {
            self.game.starcoder.showGrid();
        } else {
            self.game.starcoder.hideGrid();
        }
    });
    socket.on('msg tutorial', function (msg) {
        console.log('tut msg', msg);
        self.game.tutormessage.setMessage(msg);
    });
    socket.on('alert', function (text) {
        self.game.sounds.alert.play();
        Toast.growUp(self.game, self.game.camera.view.centerX, self.game.camera.view.bottom, text);
    });
};

module.exports = Space;
