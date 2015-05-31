/**
 * Asteroid.js
 *
 * Server side implementation
 */
'use string';

var p2 = require('p2');
var Starcoder = require('../../Starcoder-server.js');

var shared = require('../shared/Asteroid.js');

var Asteroid = function () {
    p2.Body.call(this, {type: p2.Body.DYNAMIC});
};

Asteroid.prototype = Object.create(p2.Body);
Asteroid.prototype.constructor = Asteroid;

Starcoder.mixinPrototype(Asteroid.prototype, shared.prototype);

modules.export = Asteroid;
