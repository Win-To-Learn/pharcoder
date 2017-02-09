/**
 * Created by jonathanmar on 2/8/17.
 */

'use strict';

var p2 = require('p2');

var SyncBodyBase = require('./SyncBodyBase.js');

var Crystal = require('./Crystal.js');

var TitaniumAsteroid = function (starcoder, config) {
    SyncBodyBase.call(this, starcoder, config);
    this.damping = 0;
    this.angularDamping = 0;
    this.hits = 0;                  // Record number of bullet hits
};

// Static property
TitaniumAsteroid.material = new p2.Material();      // Materials hold physics properties like physics and restitution

// Boilerplate for prototypal inheritance
TitaniumAsteroid.prototype = Object.create(SyncBodyBase.prototype);
TitaniumAsteroid.prototype.constructor = TitaniumAsteroid;

/* All bodies need a distinct serverType but might share clientType if they have the same look and feel
 * In this case it would probably make more sense to just recycle the generic Asteroid client implementation and
 * use different colors, but as this is just an example, we use a new clientType.
 */
TitaniumAsteroid.prototype.clientType = 'TitaniumAsteroid';
TitaniumAsteroid.prototype.serverType = 'TitaniumAsteroid';

/* Collision groups allow us to limit the number of collisions that should be processed
 * If no group is set explicitly bodies are placed in a generic group
 * Collision groups are a somewhat limited resource (they are implemented as a bitmask), so we don't create new
 * ones for every new body type unless we need to fine tune collision behavior
 */
TitaniumAsteroid.prototype.collisionGroup = 'TitaniumAsteroid';
TitaniumAsteroid.prototype.collisionExclude = ['Tree'];         // List of CollisionGroups body does not collide with

TitaniumAsteroid.prototype.material = TitaniumAsteroid.material;
TitaniumAsteroid.prototype.tractorable = true;      // Can be grabbed by tractor beam

TitaniumAsteroid.prototype.explode = function (respawn) {
    // Add new crystal to world
    this.worldapi.addSyncableBody(Crystal, {
        x: this.position[0],
        y: this.position[1],
        mass: 10
    });
    // Remove self from world
    this.worldapi.removeSyncableBody(this);
    // Replace the asteroid with a new one somewhere randomly in the world
    if (respawn) {
        this.worldapi.addSyncableBody(TitaniumAsteroid, {
            position: {random: 'world'},
            velocity: {random: 'vector', lo: -15, hi: 15},
            angularVelocity: {random: 'float', lo: -15, hi: 15},
            vectorScale: {random: 'float', lo: 0.6, hi: 1.4},
            mass: 7
        });
    }
};

TitaniumAsteroid.prototype.beginContact = function (other) {
    switch (other.serverType) {
        case 'Bullet':
            this.starcoder.sendMessage(other.firer.player, 'asteroid', this.vectorScale);
            other.removeSelfFromWorld();
            if (++this.hits >= 3) {
                this.explode(true);
            }
            break;
        // Could handle other collision types here
    }
};

module.exports = TitaniumAsteroid;
