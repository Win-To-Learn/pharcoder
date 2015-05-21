/**
 * Starcoder.js
 *
 * Set up global Starcoder namespace
 */

//var Starcoder = {
//    config: {
//        worldBounds: [-4200, -4200, 8400, 8400]
//
//    },
//    States: {}
//};

var Starcoder = function () {
    if (arguments[0] === 'client') {
        this.game = arguments[1];
        this.game.starcoder = this;
        this.config = {     // FIXME
            worldBounds: [-1000, -1000, 1000, 1000]
        }
    }
};

Starcoder.States = {};

module.exports = Starcoder;