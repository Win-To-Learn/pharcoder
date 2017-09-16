/**
 * Turret.js
 *
 * Client side
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var Common = require('../../common/bodies/StationBlock.js');

var Turret = function (game, config) {
    this.geometry = [];
    VectorSprite.call(this, game, config);
};

Turret.prototype = Object.create(VectorSprite.prototype);
Turret.prototype.constructor = Turret;

Starcoder.mixinPrototype(Turret.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(Turret.prototype, Common);

Object.defineProperty(Turret.prototype, 'triangles', {
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

module.exports = Turret;