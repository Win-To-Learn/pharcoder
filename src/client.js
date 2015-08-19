/** client.js
 *
 * Main entry point for Starcoder game client
 *
 * @type {Starcoder|exports}
 */
'use strict';

//require('./BlocklyCustom.js');

var commonConfig = require('./common/config.js');
var clientConfig = require('./client/config.js');
var buildConfig = buildConfig || {};

var Starcoder = require('./Starcoder-client.js');

// @BUILDCONFIG@

// @BUILDTIME@

//localStorage.debug = '';                        // used to toggle socket.io debugging

//document.addEventListener('DOMContentLoaded', function () {
//    var starcoder = new Starcoder();
//    starcoder.start();
//});

// test

$(function () {
    var starcoder = new Starcoder([commonConfig, clientConfig, buildConfig]);
    starcoder.start();
});
