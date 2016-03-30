/**
 * Starcoder.js
 *
 * Set up global Starcoder namespace
 */
'use strict';

var EventEmitter = require('events').EventEmitter;

var Starcoder = function () {
    this.events = new EventEmitter();
    this.semReady = 0;        // not really a semaphore but close enough
    // Initializers virtualized according to role
    var configs = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    this.config = {};
    for (var i = 0, l = configs.length; i < l; i++) {
        this.extendConfig(configs[i]);
    }
    this.banner();
    this.init.apply(this, args);
};

Starcoder.prototype.extendConfig = function (config) {
    for (var k in config) {
        if (config.hasOwnProperty(k)) {
            this.config[k] = config[k];
        }
    }
};

// Semaphore-(ish) operations
Starcoder.prototype.semInc = function () {
    this.semReady++;
};

Starcoder.prototype.semDec = function () {
    this.semReady--;
    if (!this.semReady) {
        this.events.emit('unblock');
    }
};

Starcoder.prototype.go = function (callback) {
    var self = this;
    if (!this.semReady) {
        this.events.emit('finalize');
        callback();
    } else {
        this.events.once('unblock', function () {
            self.events.emit('finalize');
            callback();
        });
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
        return this.config.worldBounds[1] - this.config.worldBounds[3];
    }
});

Object.defineProperty(Starcoder.prototype, 'phaserHeight', {
    get: function () {
        return this.config.physicsScale * (this.config.worldBounds[1] - this.config.worldBounds[3]);
    }
});

Object.defineProperty(Starcoder.prototype, 'worldLeft', {
    get: function () {
        return this.config.worldBounds[0];
    }
});

Object.defineProperty(Starcoder.prototype, 'phaserLeft', {
    get: function () {
        return this.config.physicsScale * this.config.worldBounds[0];
    }
});

Object.defineProperty(Starcoder.prototype, 'worldTop', {
    get: function () {
        return this.config.worldBounds[1];
    }
});

Object.defineProperty(Starcoder.prototype, 'phaserTop', {
    get: function () {
        return -this.config.physicsScale * this.config.worldBounds[1];
    }
});

Object.defineProperty(Starcoder.prototype, 'worldRight', {
    get: function () {
        return this.config.worldBounds[2];
    }
});

Object.defineProperty(Starcoder.prototype, 'phaserRight', {
    get: function () {
        return this.config.physicsScale * this.config.worldBounds[2];
    }
});

Object.defineProperty(Starcoder.prototype, 'worldBottom', {
    get: function () {
        return this.config.worldBounds[3];
    }
});

Object.defineProperty(Starcoder.prototype, 'phaserBottom', {
    get: function () {
        return -this.config.physicsScale * this.config.worldBounds[3];
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

/**
 * Lightweight component implementation, more for logical than functional modularity
 *
 * @param mixin {object} - POJO with methods / properties to be added to prototype, with optional init method
 */
Starcoder.prototype.implementFeature = function (mixin) {
    for (var prop in mixin) {
        switch (prop) {
            case 'connect':
                this.events.on('connect', mixin[prop].bind(this));
                break;
            case 'ready':
                this.events.on('ready', mixin[prop].bind(this));
                break;
            case 'login':
                this.events.on('login', mixin[prop].bind(this));
                break;
            case 'disconnect':
                this.events.on('disconnect', mixin[prop].bind(this));
                break;
            case 'finalize':
                this.events.on('finalize', mixin[prop].bind(this));
                break;
            case 'init':
                break;      // NoOp
            default:
                Starcoder.prototype[prop] = mixin[prop];
        }
    }
    if (mixin.init) {
        mixin.init.call(this);
    }
};
//Starcoder.prototype.implementFeature = function (mixin) {
//    for (var prop in mixin) {
//        switch (prop) {
//            case 'onConnectCB':
//            case 'onReadyCB':
//            case 'onLoginCB':
//            case 'onDisconnectCB':
//                this[prop].push(mixin[prop]);
//                break;
//            case 'init':
//                break;      // NoOp
//            default:
//                Starcoder.prototype[prop] = mixin[prop];
//        }
//    }
//    if (mixin.init) {
//        mixin.init.call(this);
//    }
//};

/**
 * Custom logging function to be featurefied as necessary
 */
Starcoder.prototype.log = function () {
    console.log.apply(console, Array.prototype.slice.call(arguments));
};

module.exports = Starcoder;
