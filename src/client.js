/** client.js
 *
 * Main entry point for Starcoder game client
 *
 * @type {Starcoder|exports}
 */

//require('./BlocklyCustom.js');

var Starcoder = require('./Starcoder-client.js');


localStorage.debug = '';                        // used to toggle socket.io debugging

//document.addEventListener('DOMContentLoaded', function () {
//    var starcoder = new Starcoder();
//    starcoder.start();
//});

$(document).on('ready', function() {
  $('#guestlogin').click();
});

$(function () {
    var starcoder = new Starcoder();
    starcoder.start();
});
