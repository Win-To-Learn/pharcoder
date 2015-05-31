/** client.js
 *
 * Main entry point for Starcoder game client
 *
 * @type {Starcoder|exports}
 */

var Starcoder = require('./Starcoder.js');
require('./phaserstates/Space.js');
//require('./phaser/VectorSprite.js');
//require('./phaser/Ship.js');
//var VectorSprite = require('./phaser/VectorSprite.js');
//var Ship = require('./phaser/Ship.js');

//var socket = io('http://localhost:8080');

var game = new Phaser.Game(800, 600, Phaser.AUTO, '',
    Starcoder.States.Space());
var starcoder = new Starcoder(game);