/**
 * Alien.js
 *
 * Server side implementation
 */
'use strict';

var p2 = require('p2');
var SyncBodyBase = require('./SyncBodyBase.js');
var FSM = require('../util/FSM.js');

//var ALIEN_THRUST_FORCE = 150;
var ALIEN_ROTATION_FORCE = 50;
var ALIEN_SCAN_RADIUS = 150;


var _routes = [
    [[0.125,0.125],[0.875,0.25],[0.125,0.375],[0.875,0.5],[0.125,0.625],[0.875,0.75],[0.125,0.875]],
    [[0.875,0.125],[0.125,0.25],[0.875,0.375],[0.125,0.5],[0.875,0.625],[0.125,0.75],[0.875,0.875]],
    [[0.125,0.125],[0.25,0.875],[0.375,0.125],[0.5,0.875],[0.625,0.125],[0.75,0.875],[0.875,0.125]],
    [[0.125,0.875],[0.25,0.125],[0.375,0.875],[0.5,0.125],[0.625,0.875],[0.75,0.125],[0.875,0.875]]
];

var Alien = function (starcoder, config) {
    SyncBodyBase.call(this, starcoder, config);
    this.damping = 0.75;
    this.angularDamping = .25;
    this.target = null;
    //this.setGoal();
    this.frustration = 0;
    this.route = _routes[Math.floor(Math.random()*_routes.length)];
    this.routePos = Math.floor(Math.random()*this.route.length);
    this.setGoal();
    this.proximitySensor = new p2.Circle({radius: ALIEN_SCAN_RADIUS, sensor: true});
    this.setCollisionGroup(this.proximitySensor);
    this.setCollisionMask(this.proximitySensor, [this.targetType]);
    this.addShape(this.proximitySensor);
    //this.brain = new AlienBrain(this.patience, this.persistence);
    //this.brain.on('plotting', function () {console.log('plot state')});
    //this.brain.on('plotting', this.setGoal.bind(this));
    //this.brain.transition('start');
};

Alien.prototype = Object.create(SyncBodyBase.prototype);
Alien.prototype.constructor = Alien;

Alien.prototype.clientType = 'Alien';
Alien.prototype.serverType = 'Alien';

Alien.prototype.patience = 5000;
Alien.prototype.persistence = 10000;

var genera = [
    {name: 'Warrior', props: {thrustForce: 250, targetType: 'Ship', lineColor: '#ffa500'}},
    {name: 'EcoTerrorist', props: {thrustForce: 200, targetType: 'Tree', lineColor: '#ffcc99', patience: 10000}}
];

SyncBodyBase.applyGenera(Alien, genera);

//Alien.prototype.deadly = true;

Alien.prototype.control = function () {
    this.angularForce = ALIEN_ROTATION_FORCE;
    // Set force using normalized vector towards goal

    if (this.target) {
        var dx = this.target.position[0] - this.position[0];
        var dy = this.target.position[1] - this.position[1];
    } else {
        if (this.frustration >= 10) {
            this.frustration = 0;
            this.setGoal();
        }
        dx = this.goal.x - this.position[0];
        dy = this.goal.y - this.position[1];
        if ((dx*dx + dy*dy) <= 4) {
            this.setGoal();
            //this.brain.transition('reached goal');
        }
    }
    var n = this.thrustForce / Math.sqrt(dx * dx + dy * dy);
    this.applyForce([n * dx, n * dy]);
};

/**
 * Randomly select one of nine regions of the world as a goal
 */
Alien.prototype.setGoal = function () {
    this.target = null;
    this.routePos = (this.routePos + 1) % this.route.length;
    var rx = this.route[this.routePos][0];
    var ry = this.route[this.routePos][1];
    //var rx = (Math.floor(Math.random()*7) + 1) * 0.125;
    //var ry = (Math.floor(Math.random()*7) + 1) * 0.125;
    this.goal = {x: Math.floor(this.starcoder.worldLeft + rx*this.starcoder.worldWidth),
        y: Math.floor(this.starcoder.worldBottom + ry*this.starcoder.worldHeight)};


    //this.goal = {x: Math.floor(this.starcoder.worldLeft + rx*this.starcoder.worldWidth),
    //    y: Math.floor(this.starcoder.worldBottom + ry*this.starcoder.worldHeight)};
    //console.log('SC', this.starcoder.worldLeft, this.starcoder.worldWidth, this.starcoder.worldTop, this.starcoder.worldHeight);
    //this.goal = {x: Math.floor(-200 + rx*400),
    //    y: Math.floor(-200 + ry*400)};
    //console.log('Changing goal for', this.genusName, 'alien', this.id, 'to', this.goal);
};

Alien.prototype.beginContact = function (body) {
    if (this.target === body) {
        this.target = null;
    }
    switch (body.serverType) {
        case 'Ship':
            if (!body.dead) {
                body.knockOut();
            }
            break;
        case 'Tree':
            this.world.removeConstraint(body.attachmentConstraint);
            body.removeSelfFromWorld();
            break;
        case 'Bullet':
            this.dead = true;
            this.worldapi.removeSyncableBody(body);
            this.setTimer(5, {fun: this.worldapi.respawn.bind(this.world, this,
                {position: {random: 'world', pad: 30}, genus: this.genusName})});
            break;
        case 'HydraArm':
        case 'Planetoid':
            this.frustration += 5;
            break;
        case 'Crystal':
        case 'Asteroid':
            this.frustration += 1;
            break;
    }
};

Alien.prototype.beginSense = function (body) {
    if (body.serverType === this.targetType) {
        if (!this.target) {
            this.target = body;
            //this.brain.transition('target in range');
            //console.log('Pursuing ship');
        }
    }
};

Alien.prototype.endSense = function (body) {
    if (this.target === body) {
        this.target = null;
        //this.brain.transition('target escaped');
        //console.log('Ship escaped');
    }
};


//var AlienBrain = function (patience, persistence) {•••••
//    FSM.call(this, {
//        initial: {start: 'plotting'},
//        plotting: {auto: 'roaming'},
//        roaming: {'target in range': 'chasing', 'reached goal': 'plotting', auto: 'plotting', timeout: patience},
//        chasing: {'target escaped': 'plotting', auto: 'plotting', timeout: persistence}
//    }, 'initial');
//    //this.alien = alien;
//    //this.on('plotting', this.alien.setGoal.bind(this.alien));
//};
//
//AlienBrain.prototype = Object.create(FSM.prototype);
//AlienBrain.prototype.constructor = AlienBrain;

module.exports = Alien;
