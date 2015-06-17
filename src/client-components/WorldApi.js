/**
 * WorldApi.js
 *
 * Add/remove/manipulate bodies in client's physics world
 */
'use strict';

var WorldApi = function () {};

var bodyTypes = {
    Ship: require('../phaserbodies/Ship.js'),
    Asteroid: require('../phaserbodies/Asteroid.js')
};

WorldApi.prototype.addBody = function (type, options) {
    var ctor = bodyTypes[type];
    var playerShip = false;
    if (!ctor) {
        this.log('Unknown body type:', type);
        return;
    }
    if (type === 'Ship' && options.properties.playerid === this.player.id) {
        options.tag = this.player.username;
        // Only the player's own ship is treated as dynamic in the local physics sim
        options.mass = this.config.physicsProperties.Ship.mass;
        playerShip = true;
    }
    var body = new ctor(this.game, options);
    this.game.add.existing(body);
    if (playerShip) {
        this.game.camera.follow(body);
    }
    return body;
};

module.exports = WorldApi;
