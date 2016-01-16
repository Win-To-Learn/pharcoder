/**
 * WorldApi.js
 *
 * Add/remove/manipulate bodies in client's physics world
 */
'use strict';

var bodyTypes = {
    Ship: require('../bodies/Ship.js'),
    Asteroid: require('../bodies/Asteroid.js'),
    Crystal: require('../bodies/Crystal.js'),
    Bullet: require('../bodies/Bullet.js'),
    GenericOrb: require('../bodies/GenericOrb.js'),
    Planetoid: require('../bodies/Planetoid.js'),
    Tree: require('../bodies/Tree.js'),
    TractorBeam: require('../bodies/TractorBeam.js'),
    StarTarget: require('../bodies/StarTarget.js'),
    StationBlock: require('../bodies/StationBlock.js'),
    Alien: require('../bodies/Alien.js')
};

module.exports = {
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
        if (type === 'Ship' && config.properties.playerid === this.player.id) {
            //config.tag = this.player.username;
            //if (config.properties.playerid === this.player.id) {
            // Only the player's own ship is treated as dynamic in the local physics sim
            config.mass = this.config.shipMass;
            playerShip = true;
            //}
        }
        var body = new ctor(this.game, config);
        if (type === 'Ship') {
            this.playerMap[config.properties.playerid] = body;
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
