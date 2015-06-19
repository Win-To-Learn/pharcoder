/**
 * GenericOrb.js
 *
 * Building block
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');

var Paths = require('../common/Paths.js');

var GenericOrb = function (game, config) {
    console.log('GO', config);
    VectorSprite.call(this, game, config);
    this.setPosAngle(config.x, config.y, config.a);
};

GenericOrb.add = function (game, config) {
    var a = new GenericOrb(game, config);
    game.add.existing(a);
    return a;
};

GenericOrb.prototype = Object.create(VectorSprite.prototype);
GenericOrb.prototype.constructor = GenericOrb;

Starcoder.mixinPrototype(GenericOrb.prototype, SyncBodyInterface.prototype);

GenericOrb.prototype.lineColor = '#ff0000';
GenericOrb.prototype.fillColor = '#000000';
GenericOrb.prototype.shapeClosed = true;
GenericOrb.prototype.lineWidth = 1;
GenericOrb.prototype.fillAlpha = 0.0;
GenericOrb.prototype.shape = Paths.octagon;

GenericOrb.prototype.geometry = [
    {type: 'poly', closed: true, points: Paths.d2cross}
];

module.exports = GenericOrb;
