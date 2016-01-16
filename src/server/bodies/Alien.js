/**
 * Alien.js
 *
 * Server side implementation
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var SyncBodyBase = require('./SyncBodyBase.js');

//var Paths = require('../../common/Paths.js');
//var UpdateProperties = require('../../common/UpdateProperties.js').Alien;
var Common = require('../../common/bodies/Alien.js');

//var Starcoder = require('../../Starcoder-server.js');

//var shared = require('../shared/Alien.js');

var Alien = function (config) {
    SyncBodyBase.call(this, config);
    this.damping = 0;
    this.angularDamping = 0;
};

Alien.prototype = Object.create(SyncBodyBase.prototype);
Alien.prototype.constructor = Alien;

Starcoder.mixinPrototype(Alien.prototype, Common);

Alien.prototype.clientType = 'Alien';
Alien.prototype.serverType = 'Alien';

module.exports = Alien;
