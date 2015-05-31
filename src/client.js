/** client.js
 *
 * Main entry point for Starcoder game client
 *
 * @type {Starcoder|exports}
 */

var Starcoder = require('./Starcoder-client.js');
var spaceState = require('./phaserstates/Space.js')();


//require('./phaserstates/Space.js');
//require('./phaser/VectorSprite.js');
//require('./phaser/Ship.js');
//var VectorSprite = require('./phaser/VectorSprite.js');
//var Ship = require('./phaser/Ship.js');

//var game = new Phaser.Game(800, 600, Phaser.AUTO, '',
//    Starcoder.States.Space());
var starcoder = new Starcoder();
starcoder.game.state.add('space', spaceState);
starcoder.game.state.start('space');
