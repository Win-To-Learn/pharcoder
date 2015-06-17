/** client.js
 *
 * Main entry point for Starcoder game client
 *
 * @type {Starcoder|exports}
 */

var Starcoder = require('./Starcoder-client.js');

localStorage.debug = '';

var starcoder = new Starcoder();
starcoder.start();