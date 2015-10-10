/**
 * StationBlock.js
 *
 * Client side
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var Common = require('../../common/bodies/StationBlock.js');

var StationBlock = function (game, config) {
    this.geometry = [];
    VectorSprite.call(this, game, config);
};

StationBlock.prototype = Object.create(VectorSprite.prototype);
StationBlock.prototype.constructor = StationBlock;

Starcoder.mixinPrototype(StationBlock.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(StationBlock.prototype, Common);

Object.defineProperty(StationBlock.prototype, 'triangles', {
    /**
     * Translate triangle list into internal geometry format
     *
     * @param tris
     */
    set: function (tris) {
        this.geometry.length = 0;
        for (var i = 0, l = tris.length; i < l; i++) {
            this.geometry.push({
                type: 'poly',
                closed: true,
                lineWidth: 2,
                points: tris[i]
            });
        }
    }
})

module.exports = StationBlock;