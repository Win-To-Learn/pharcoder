/** client.js
 *
 * Main entry point for Starcoder game client
 *
 * @type {Starcoder|exports}
 */

var Starcoder = require('./Starcoder.js');
require('./phaserstates/Space.js');
//require('./phaserobjects/VectorSprite.js');
//require('./phaserobjects/Ship.js');
//var VectorSprite = require('./phaserobjects/VectorSprite.js');
//var Ship = require('./phaserobjects/Ship.js');

var generic, ship;

var state = {

    create: function () {
        game.physics.startSystem(Phaser.Physics.P2JS);

        generic = new Starcoder.VectorSprite(game, 200, 250);
        game.add.existing(generic);

        ship = new Starcoder.Ship(game, 400, 350, '3jx4');
        ship.setLineStyle('#0000ff', 6);
        game.add.existing(ship);
        ship.body.angle = 120;
    },

    //update: function () {
    //    console.log(ship.angle);
    //},

    render: function () {
        game.debug.spriteInfo(ship, 20, 20);
        game.debug.spriteBounds(ship, 'green', false);
    }
};

var game = new Phaser.Game(800, 600, Phaser.AUTO, '',
    Starcoder.States.Space());
var starcoder = new Starcoder('client', game);