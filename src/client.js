/** client.js
 *
 * Main entry point for Starcoder game client
 *
 * @type {Starcoder|exports}
 */

var Starcoder = require('./Starcoder-client.js');
//var bootState = require('./phaserstates/Boot.js')();
//var spaceState = require('./phaserstates/Space.js')();

//require('./phaserstates/Space.js');
//require('./phaser/VectorSprite.js');
//require('./phaser/Ship.js');
//var VectorSprite = require('./phaser/VectorSprite.js');
//var Ship = require('./phaser/Ship.js');

localStorage.debug = '';
//localStorage.debug = '*';

//var game = new Phaser.Game(800, 600, Phaser.AUTO, '',
//    Starcoder.States.Space());
var starcoder = new Starcoder();
starcoder.start();

//console.log= function () {};

//starcoder.game.state.add('boot', bootState);
//starcoder.game.state.add('space', spaceState);
//starcoder.game.state.start('boot');
