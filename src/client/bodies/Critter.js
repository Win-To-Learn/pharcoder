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

/**
 * Draw tree, overriding standard shape and geometry method to use graph
 *
 * @param renderScale
 * blah blah
 */
Critter.prototype.drawProcedure = function (renderScale) {
    console.log('critter genome', this.genome);
    if ((renderScale === 1)) {
        this.head = this.game.make.image(0, 0, 'c_head' + this.genome[0]);
        //this.torso = this.game.make.image(0, 0, 'c_torso' + this.genome[0]);
        //this.feet = this.game.make.image(0, 0, 'c_feet' + this.genome[0]);
        this.head.scale.setTo(0.5);
        this.addChild(this.head);
        // //console.log('draw koala');
        // if (Math.random() > 0.5) {
        //     this.koala = this.game.make.image(0, 0, 'koala-r');
        //     this.koala.anchor.setTo(0, 1);
        //     //this.koala.scale.setTo(0.7+Math.random()*5, 0.7+Math.random()*5);
        //     setInterval(function(){
        //         self.clientLifespan++;
        //         if(self !== null) {
        //             self.koala.tint = (0.5+(self.clientLifespan/300)) * 0xffffff;
        //             //console.log(self.clientLifespan);
        //         }
        //     },120000, self.world)
        // } else {
        //     this.koala = this.game.make.image(0, 0, 'koala-l');
        //     this.koala.anchor.setTo(1, 1);
        //     //this.koala.scale.setTo(0.7+Math.random()*5, 0.7+Math.random()*5);
        //     setInterval(function(){
        //         self.clientLifespan++;
        //         if(self !== null) {
        //             self.koala.tint = (0.5+(self.clientLifespan/300)) * 0xffffff;
        //             //console.log(self.clientLifespan);
        //         }
        //     },120000, self.world)
        // }
        // this.koala.scale.setTo(0.5);
        // this.addChild(this.koala);
    }
};

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
