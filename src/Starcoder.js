/**
 * Starcoder.js
 *
 * Set up global Starcoder namespace
 */
'use strict';

//var Starcoder = {
//    config: {
//        worldBounds: [-4200, -4200, 8400, 8400]
//
//    },
//    States: {}
//};

var config = {
    version: '0.1',
    serverUri: process.env.NODE_ENV == 'development' ? 'http://localhost:8081' : 'http://52.3.61.102',
    //worldBounds: [-4200, -4200, 8400, 8400],
    worldBounds: [-200, -200, 200, 200],
    ioClientOptions: {
        //forceNew: true
        reconnection: false
    },
    updateInterval: 50,
    renderLatency: 100,
    physicsScale: 20,
    frameRate: (1 / 60),
    timeSyncFreq: 10,
    physicsProperties: {
        Ship: {
            mass: 10
        },
        Asteroid: {
            mass: 20
        }
    },
    initialBodies: [
        {type: 'Asteroid', number: 25, config: {
            position: {random: 'world'},
            velocity: {random: 'vector', lo: -10, hi: 10},
            angularVelocity: {random: 'float', lo: -5, hi: 5},
            vectorScale: {random: 'float', lo: 0.6, hi: 1.4},
            mass: 10
        }},
        //{type: 'Crystal', number: 10, config: {
        //    position: {random: 'world'},
        //    velocity: {random: 'vector', lo: -4, hi: 4, normal: true},
        //    vectorScale: {random: 'float', lo: 0.4, hi: 0.8},
        //    mass: 5
        //}}
        {type: 'Hydra', number: 1, config: {
            position: {random: 'world', pad: 50}
        }},
        {type: 'Planetoid', number: 6, config: {
            position: {random: 'world', pad: 30},
            angularVelocity: {random: 'float', lo: -2, hi: 2},
            vectorScale: 2.5,
            mass: 100
        }},
        // FIXME: Trees just for testing
        //{type: 'Tree', number: 10, config: {
        //    position: {random: 'world', pad: 30},
        //    vectorScale: 1,
        //    mass: 5
        //}}
    ]
};

var Starcoder = function () {
    this.config = config;
    // Initializers virtualized according to role
    this.banner();
    this.init.apply(this, arguments);
    //this.initNet.call(this);
};

Starcoder.prototype.extendConfig = function (config) {
    for (var k in config) {
        if (config.hasOwnProperty(k)) {
            this.config[k] = config[k];
        }
    }
};

// Convenience function for common config options

Object.defineProperty(Starcoder.prototype, 'worldWidth', {
    get: function () {
        return this.config.worldBounds[2] - this.config.worldBounds[0];
    }
});

Object.defineProperty(Starcoder.prototype, 'phaserWidth', {
    get: function () {
        return this.config.physicsScale * (this.config.worldBounds[2] - this.config.worldBounds[0]);
    }
});

Object.defineProperty(Starcoder.prototype, 'worldHeight', {
    get: function () {
        return this.config.worldBounds[3] - this.config.worldBounds[1];
    }
});

Object.defineProperty(Starcoder.prototype, 'phaserHeight', {
    get: function () {
        return this.config.physicsScale * (this.config.worldBounds[3] - this.config.worldBounds[1]);
    }
});

Object.defineProperty(Starcoder.prototype, 'phaserLeft', {
    get: function () {
        return this.config.physicsScale * this.config.worldBounds[0];
    }
});

Object.defineProperty(Starcoder.prototype, 'phaserTop', {
    get: function () {
        return this.config.physicsScale * this.config.worldBounds[1];
    }
});

Object.defineProperty(Starcoder.prototype, 'phaserRight', {
    get: function () {
        return this.config.physicsScale * this.config.worldBounds[2];
    }
});

Object.defineProperty(Starcoder.prototype, 'phaserBottom', {
    get: function () {
        return this.config.physicsScale * this.config.worldBounds[3];
    }
});

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
            (typeof val.get === 'function' || typeof val.set === 'function')) {
            Object.defineProperty(target, key, val);
        } else {
            target[key] = val;
        }
    }
};

Starcoder.prototype.banner = function () {
    this.log('Starcoder', this.role, 'v' + this.config.version, 'started at', Date());
}

/**
 * Custom logging function to be featurefied as necessary
 */
Starcoder.prototype.log = function () {
    console.log.apply(console, Array.prototype.slice.call(arguments));
};

module.exports = Starcoder;
