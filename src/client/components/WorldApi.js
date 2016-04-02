/**
 * WorldApi.js
 *
 * Add/remove/manipulate bodies in client's physics world
 */
'use strict';

var bodyDefs = {
    Ship: [require('../bodies/Ship.js'), require('../../common/bodies/Ship.js')],
    Asteroid: [require('../bodies/Asteroid.js'), require('../../common/bodies/Asteroid.js')],
    Crystal: [require('../bodies/Crystal.js'), require('../../common/bodies/Crystal.js')],
    Bullet: [require('../bodies/Bullet.js'), require('../../common/bodies/Bullet.js')],
    GenericOrb: [require('../bodies/GenericOrb.js'), require('../../common/bodies/GenericOrb.js')],
    Planetoid: [require('../bodies/Planetoid.js'), require('../../common/bodies/Planetoid.js')],
    Tree: [require('../bodies/Tree.js'), require('../../common/bodies/Tree.js')],
    TractorBeam: [require('../bodies/TractorBeam.js'), require('../../common/bodies/TractorBeam.js')],
    StarTarget: [require('../bodies/StarTarget.js'), require('../../common/bodies/StarTarget.js')],
    StationBlock: [require('../bodies/StationBlock.js'), require('../../common/bodies/StationBlock.js')],
    Alien: [require('../bodies/Alien.js'), require('../../common/bodies/Alien.js')],
    CodeCapsule: [require('../bodies/CodeCapsule.js'), require('../../common/bodies/CodeCapsule.js')]
};

var bodyTypes = {};

module.exports = {
    init: function () {
        this.initBodies(bodyDefs, bodyTypes);
    },
    /**
     * Add body to world on client side
     *
     * @param type {string} - type name of object to add
     * @param config {object} - properties for new object
     * @returns {Phaser.Sprite} - newly added object
     */
    addBody: function (type, config) {
        var ctor = bodyTypes[type];
        var playerShip = false;
        if (!ctor) {
            console.log('Unknown body type:', type);
            console.log(config);
            return;
        }
        if (type === 'Ship' && config.playerid === this.player.id) {
            //config.tag = this.player.username;
            //if (config.properties.playerid === this.player.id) {
            // Only the player's own ship is treated as dynamic in the local physics sim
            //config.mass = this.config.shipMass;
            playerShip = true;
            //}
        }
        var body = new ctor(this.game, config);
        if (type === 'Ship') {
            this.playerMap[config.playerid] = body;
        }
        //this.game.add.existing(body);
        this.game.playfield.add(body);
        if (playerShip) {
            this.game.camera.follow(body);
            this.game.playerShip = body;
        }
        return body;
    },

    removeBody: function (sprite) {
        //sprite.kill();
        sprite.destroy();
        // Remove minisprite
        if (sprite.minisprite) {
            //sprite.minisprite.kill();
            sprite.minisprite.destroy();
        }
        //this.game.physics.p2.removeBody(sprite.body);
    }
};
