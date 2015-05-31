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
    this.init.apply(this, arguments);        // Call client or server init
};

/**
 * Add mixin properties to target. Adapted (slightly) from Phaser
 *
 * @param {object} target
 * @param {object} mixin
 */
Starcoder.mixinPrototype = function (target, mixin) {
    var keys = Object.keys(mixin);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = mixin[key];
        if (val &&
            (typeof val.get === 'function' || typeof val.set == 'function')) {
            Object.defineProperty(target, key, val);
        } else {
            target[key] = val;
        }
    }
};

module.exports = Starcoder;