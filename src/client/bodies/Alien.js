/**
 * Alien.js
 *
 * Client side
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var Common = require('../../common/bodies/Alien.js');
//var UpdateProperties = require('../../common/UpdateProperties.js').Alien;
//var Paths = require('../../common/Paths.js');

var Alien = function (game, config) {
    VectorSprite.call(this, game, config);
    //this.setPosAngle(config.x, config.y, config.a);
    //this.body.damping = 0;
};

Alien.add = function (game, options) {
    var a = new Alien(game, options);
    game.add.existing(a);
    return a;
};

Alien.prototype = Object.create(VectorSprite.prototype);
Alien.prototype.constructor = Alien;

Starcoder.mixinPrototype(Alien.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(Alien.prototype, Common);

//Alien.prototype._lineColor = '#ffa500';
//Alien.prototype._fillColor = '#999999';
//Alien.prototype._shapeClosed = true;
//Alien.prototype._lineWidth = 2;
//Alien.prototype._fillAlpha = 0.25;
//Alien.prototype._shape = Paths.octagon;  // FIXME

module.exports = Alien;
