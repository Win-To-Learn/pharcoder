/**
 * CodeCapsule.js
 *
 * Building block
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var Common = require('../../common/bodies/CodeCapsule.js');

var Paths = require('../../common/Paths.js');

var CodeCapsule = function (game, config) {
    VectorSprite.call(this, game, config);
};

CodeCapsule.add = function (game, config) {
    var a = new CodeCapsule(game, config);
    game.add.existing(a);
    return a;
};

CodeCapsule.prototype = Object.create(VectorSprite.prototype);
CodeCapsule.prototype.constructor = CodeCapsule;

Starcoder.mixinPrototype(CodeCapsule.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(CodeCapsule.prototype, Common);

module.exports = CodeCapsule;
