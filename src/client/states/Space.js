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
    console.log('Space size', this.game.width, this.game.height, window.innerWidth, window.innerHeight);
    window.scrollTo(0, 1);
    //console.log('create');
    //var rng = this.game.rnd;
    var wb = this.starcoder.config.worldBounds;
    var ps = this.starcoder.config.physicsScale;
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.world.setBounds.call(this.world, wb[0]*ps, wb[1]*ps, (wb[2]-wb[0])*ps, (wb[3]-wb[1])*ps);
    this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

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

    this.game.sounds.music = this.game.sound.add('music', 1, true);
    this.game.sounds.music.play();

    // Background
    this.starcoder.starfield = this.game.make.bitmapData(600, 600, 'starfield', true);
    this.starcoder.drawStarField(this.starcoder.starfield.ctx, 600, 16);
    this.game.add.tileSprite(wb[0]*ps, wb[1]*ps, (wb[2]-wb[0])*ps, (wb[3]-wb[1])*ps, this.starcoder.starfield);

    this.starcoder.syncclient.start();
    //this.starcoder.socket.emit('client ready');
    this._setupMessageHandlers(this.starcoder.socket);
    this.starcoder.socket.emit('ready');

    // Groups for particle effects
    this.game.thrustgenerator = new ThrustGenerator(this.game);

    // Group for game objects
    this.game.playfield = this.game.add.group();

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

};

Space.prototype.update = function () {
    // FIXME: just a mess for testing
    var self = this;
    this.starcoder.controls.processQueue(function (a) {
        if (a.type === 'up_pressed') {
            self.game.playerShip.localState.thrust = 'starting';
            //self.game.sounds.playerthrust.play();
            //self.game.thrustgenerator.startOn(self.game.playerShip);
        } else if (a.type === 'up_released') {
            self.game.playerShip.localState.thrust = 'shutdown';
            //self.game.sounds.playerthrust.stop();
            //self.game.thrustgenerator.stopOn(self.game.playerShip);
        }
    });
};

//Space.prototype.render = function () {
    //console.log('+render+');
    //if (this.starcoder.tempsprite) {
    //    var d = this.starcoder.tempsprite.position.x - this.starcoder.tempsprite.previousPosition.x;
    //    console.log('Delta', d, this.game.time.elapsed, d / this.game.time.elapsed);
    //}
    //console.log('--------------------------------');
    //this.game.debug.text('Fps: ' + this.game.time.fps, 5, 20);
    //this.game.vcontrols.stick.debug(true, true);
    //this.game.debug.cameraInfo(this.game.camera, 100, 20);
    //if (this.ship) {
    //    this.game.debug.spriteInfo(this.ship, 420, 20);
    //}
//};

Space.prototype._setupMessageHandlers = function (socket) {
    var self = this;
    socket.on('msg crystal pickup', function (val) {
        self.game.sounds.chime.play();
        Toast.spinUp(self.game, self.game.playerShip.x, self.game.playerShip.y, '+' + val + ' crystals!');
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
