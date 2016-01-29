/**
 * Alien.js
 *
 * Server side implementation
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');
var Common = require('../../common/bodies/Alien.js');
var FSM = require('../util/FSM.js');

var ALIEN_THRUST_FORCE = 150;
var ALIEN_ROTATION_FORCE = 50;
var ALIEN_SCAN_RADIUS = 50;

var Alien = function (config) {
    SyncBodyBase.call(this, config);
    this.damping = 0.75;
    this.angularDamping = .25;
    this.targetShip = null;
    //this.setGoal();
    this.proximitySensor = new p2.Circle({radius: ALIEN_SCAN_RADIUS, sensor: true});
    this.setCollisionGroup(this.proximitySensor);
    this.setCollisionMask(this.proximitySensor, ['Ship']);
    this.addShape(this.proximitySensor);
    this.brain = new AlienBrain();
    //this.brain.on('plotting', function () {console.log('plot state')});
    this.brain.on('plotting', this.setGoal.bind(this));
    this.brain.transition('start');
};

Alien.prototype = Object.create(SyncBodyBase.prototype);
Alien.prototype.constructor = Alien;

Starcoder.mixinPrototype(Alien.prototype, Common);

Alien.prototype.clientType = 'Alien';
Alien.prototype.serverType = 'Alien';

//Alien.prototype.deadly = true;

Alien.prototype.control = function () {
    this.angularForce = ALIEN_ROTATION_FORCE;
    // Set force using normalized vector towards goal

    if (this.targetShip) {
        var dx = this.targetShip.position[0] - this.position[0];
        var dy = this.targetShip.position[1] - this.position[1];
    } else {
        dx = this.goal.x - this.position[0];
        dy = this.goal.y - this.position[1];
        if ((dx*dx + dy*dy) <= 4) {
            //this.setGoal();
            this.brain.transition('reached goal');
        }
    }
    var n = ALIEN_THRUST_FORCE / Math.sqrt(dx * dx + dy * dy);
    this.applyForce([n * dx, n * dy]);
};

/**
 * Randomly select one of nine regions of the world as a goal
 */
Alien.prototype.setGoal = function () {
    var rx = (Math.floor(Math.random()*3) + 1) * 0.25;
    var ry = (Math.floor(Math.random()*3) + 1) * 0.25;
    //this.goal = {x: Math.floor(starcoder.worldLeft + rx*starcoder.worldWidth),
    //    y: Math.floor(starcoder.worldTop + ry*starcoder.worldHeight)}
    this.goal = {x: Math.floor(-200 + rx*400),
        y: Math.floor(-200 + ry*400)};
};

Alien.prototype.beginContact = function (body) {
    if (this.targetShip === body) {
        this.targetShip = null;
    }
    switch (body.serverType) {
        case 'Ship':
            if (!body.dead) {
                body.knockOut();
            }
            break;
        case 'Bullet':
            this.dead = true;
            this.world.removeSyncableBody(body);
            this.setTimer(5, {fun: this.world.respawn.bind(this.world, this, {position: {random: 'world'}})});
            break;
    }
};

Alien.prototype.beginSense = function (body) {
    if (body.serverType === 'Ship') {
        if (!this.targetShip) {
            this.targetShip = body;
            this.brain.transition('ship in range');
            //console.log('Pursuing ship');
        }
    }
};

Alien.prototype.endSense = function (body) {
    if (this.targetShip === body) {
        this.targetShip = null;
        this.brain.transition('ship escaped');
        //console.log('Ship escaped');
    }
};


var AlienBrain = function () {
    FSM.call(this, {
        initial: {start: 'plotting'},
        plotting: {auto: 'roaming'},
        roaming: {'ship in range': 'chasing', 'reached goal': 'plotting', auto: 'plotting', timeout: 5000},
        chasing: {'ship escaped': 'plotting'}
    }, 'initial');
    //this.alien = alien;
    //this.on('plotting', this.alien.setGoal.bind(this.alien));
};

AlienBrain.prototype = Object.create(FSM.prototype);
AlienBrain.prototype.constructor = AlienBrain;


module.exports = Alien;
