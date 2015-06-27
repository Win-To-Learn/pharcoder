/**
 * Crystal.js
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var UpdateProperties = require('../common/UpdateProperties.js').Crystal;
var Paths = require('../common/Paths.js');

var Crystal = function (game, config) {
    VectorSprite.call(this, game, config);
    //this.setPosAngle(config.x, config.y, config.a);
};

Crystal.add = function (game, config) {
    var a = new Crystal(game, config);
    game.add.existing(a);
    return a;
};

Crystal.prototype = Object.create(VectorSprite.prototype);
Crystal.prototype.constructor = Crystal;

Starcoder.mixinPrototype(Crystal.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(Crystal.prototype, UpdateProperties.prototype);

Crystal.prototype.lineColor = '#00ffff';
Crystal.prototype.fillColor = '#000000';
Crystal.prototype.shapeClosed = true;
Crystal.prototype.lineWidth = 1;
Crystal.prototype.fillAlpha = 0.0;
Crystal.prototype.shape = Paths.octagon;
Crystal.prototype.geometry = [
    {type: 'poly', closed: true, points: Paths.d2cross}
];


module.exports = Crystal;
