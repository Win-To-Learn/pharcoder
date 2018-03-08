/**
 * Critter.js
 *
 * Client side
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var Common = require('../../common/bodies/Critter.js');

var Critter = function (game, config) {
    VectorSprite.call(this, game, config);
    //this.setPosAngle(config.x, config.y, config.a);
    //this.body.damping = 0;
};

Critter.add = function (game, options) {
    var a = new Critter(game, options);
    game.add.existing(a);
    return a;
};

Critter.prototype = Object.create(VectorSprite.prototype);
Critter.prototype.constructor = Critter;

Starcoder.mixinPrototype(Critter.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(Critter.prototype, Common);

const critterScale = 0.4;

/**
 * Draw critter creating images for head, torso, and legs
 *
 * @param renderScale
 * blah blah
 */
Critter.prototype.drawProcedure = function (renderScale) {
    if (renderScale === 1) {
        let names = this.game.starcoder.critters.names;
        let meta = this.game.starcoder.critters.meta;
        let headType = names[this.genome[0] % names.length];
        let torsoType = names[this.genome[1] % names.length];
        let feetType = names[this.genome[2] % names.length];
        this.graphics.moveTo(0, 0);
        this.graphics.lineTo(0, 0.1);
        this.feet = this.game.make.sprite(
            meta[feetType].feet.offset_x, 56*critterScale + meta[feetType].feet.offset_y, feetType + '_feet');
        this.feet.anchor.setTo(0.5, 0.5);
        this.feet.scale.setTo(critterScale);
        this.torso = this.game.make.sprite(
            meta[torsoType].torso.offset_x, meta[torsoType].torso.offset_y, torsoType + '_torso');
        this.torso.anchor.setTo(0.5, 0.5);
        this.torso.scale.setTo(critterScale);
        this.head = this.game.make.sprite(
            meta[headType].head.offset_x, -66*critterScale + meta[headType].head.offset_y, headType + '_head');
        this.head.anchor.setTo(0.5, 0.5);
        this.head.scale.setTo(critterScale);
        this.addChild(this.feet);
        this.addChild(this.torso);
        this.addChild(this.head);
    }
};

// Critter.prototype.update = function () {
//     if (true) {
//         //console.log('xy', this.x, this.y);
//     }
// }

Object.defineProperty(Critter.prototype, 'genome', {
    get: function () {
        return this._genome;
    },
    set: function (val) {
        this._genome = val;
        this._dirty = true;
    }
});

module.exports = Critter;
