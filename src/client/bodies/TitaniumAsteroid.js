/**
 * Created by jonathanmar on 2/8/17.
 */

'use strict';

var Starcoder = require('../../common/Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');

var TitaniumAsteroid = function (game, config) {
    VectorSprite.call(this, game, config);
};

TitaniumAsteroid.add = function (game, options) {
    var a = new TitaniumAsteroid(game, options);
    game.add.existing(a);
    return a;
};

// Boilerplate for prototypal inheritance
TitaniumAsteroid.prototype = Object.create(VectorSprite.prototype);
TitaniumAsteroid.prototype.constructor = TitaniumAsteroid;

// VectorSprite parent provides drawing functions; SyncBodyInterface mixin is for property sync
Starcoder.mixinPrototype(TitaniumAsteroid.prototype, SyncBodyInterface.prototype);

module.exports = TitaniumAsteroid;
