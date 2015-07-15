(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
/**
 * Starcoder-client.js
 *
 * Starcoder master object extended with client only properties and methods
 */
'use strict';

var Starcoder = require('./Starcoder.js');

var WorldApi = require('./client-components/WorldApi.js');


Starcoder.mixinPrototype(Starcoder.prototype, WorldApi.prototype);

var states = {
    boot: require('./phaserstates/Boot.js'),
    space: require('./phaserstates/Space.js')
};

Starcoder.prototype.init = function () {
    this.io = io;
    this.game = new Phaser.Game(1800, 950, Phaser.AUTO, 'main');
    //this.game = new Phaser.Game(1800, 950, Phaser.CANVAS, 'main');
    this.game.forceSingleUpdate = true;
    this.game.starcoder = this;
    for (var k in states) {
        var state = new states[k]();
        state.starcoder = this;
        this.game.state.add(k, state);
    }
    this.cmdQueue = [];
};

Starcoder.prototype.start = function () {
    this.game.state.start('boot');
};

Starcoder.prototype.attachPlugin = function () {
    var plugin = this.game.plugins.add.apply(this.game.plugins, arguments);
    plugin.starcoder = this;
    plugin.log = this.log;
    return plugin;
};

Starcoder.prototype.role = 'Client';

module.exports = Starcoder;

},{"./Starcoder.js":3,"./client-components/WorldApi.js":4,"./phaserstates/Boot.js":19,"./phaserstates/Space.js":20}],3:[function(require,module,exports){
(function (process){
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
    serverUri: process.env.NODE_ENV == 'development' ? 'http://localhost:8081' : 'http://pharcoder.elasticbeanstalk.com',
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
        }}
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

}).call(this,require('_process'))

},{"_process":1}],4:[function(require,module,exports){
/**
 * WorldApi.js
 *
 * Add/remove/manipulate bodies in client's physics world
 */
'use strict';

var WorldApi = function () {};

var bodyTypes = {
    Ship: require('../phaserbodies/Ship.js'),
    Asteroid: require('../phaserbodies/Asteroid.js'),
    Crystal: require('../phaserbodies/Crystal.js'),
    Bullet: require('../phaserbodies/Bullet.js'),
    GenericOrb: require('../phaserbodies/GenericOrb.js')
};

WorldApi.prototype.addBody = function (type, config) {
    var ctor = bodyTypes[type];
    var playerShip = false;
    if (!ctor) {
        this.log('Unknown body type:', type);
        this.log(config);
        return;
    }
    if (type === 'Ship' && config.properties.playerid === this.player.id) {
        config.tag = this.player.username;
        // Only the player's own ship is treated as dynamic in the local physics sim
        config.mass = this.config.physicsProperties.Ship.mass;
        playerShip = true;
    }
    var body = new ctor(this.game, config);
    //this.game.add.existing(body);
    this.game.playfield.add(body);
    if (playerShip) {
        this.game.camera.follow(body);
        this.game.playerShip = body;
    }
    return body;
};

WorldApi.prototype.removeBody = function (sprite) {
    sprite.kill();
    this.game.physics.p2.removeBody(sprite.body);
};

WorldApi.prototype.configure = function (properties) {
    for (var k in this.updateProperties) {
        this[k] = properties[k];
    }
};

module.exports = WorldApi;

},{"../phaserbodies/Asteroid.js":8,"../phaserbodies/Bullet.js":9,"../phaserbodies/Crystal.js":10,"../phaserbodies/GenericOrb.js":11,"../phaserbodies/Ship.js":12}],5:[function(require,module,exports){
/** client.js
 *
 * Main entry point for Starcoder game client
 *
 * @type {Starcoder|exports}
 */

var Starcoder = require('./Starcoder-client.js');

localStorage.debug = '';

var starcoder = new Starcoder();
starcoder.start();
},{"./Starcoder-client.js":2}],6:[function(require,module,exports){
/**
 * Path.js
 *
 * Vector paths shared by multiple elements
 */
'use strict';

exports.octagon = [
    [2,1],
    [1,2],
    [-1,2],
    [-2,1],
    [-2,-1],
    [-1,-2],
    [1,-2],
    [2,-1]
];

exports.d2cross = [
    [-1,-2],
    [-1,2],
    [2,-1],
    [-2,-1],
    [1,2],
    [1,-2],
    [-2,1],
    [2,1]
];
},{}],7:[function(require,module,exports){
/**
 * UpdateProperties.js
 *
 * Client/server syncable properties for game objects
 */

var Ship = function () {};
Ship.prototype.updateProperties = ['lineWidth', 'lineColor', 'fillColor', 'fillAlpha',
    'vectorScale', 'shape', 'shapeClosed', 'playerid'];

var Asteroid = function () {};
Asteroid.prototype.updateProperties = ['vectorScale'];

var Crystal = function () {};
Crystal.prototype.updateProperties = ['vectorScale'];

var GenericOrb = function () {};
GenericOrb.prototype.updateProperties = ['lineColor', 'vectorScale'];

exports.Ship = Ship;
exports.Asteroid = Asteroid;
exports.Crystal = Crystal;
exports.GenericOrb = GenericOrb;



},{}],8:[function(require,module,exports){
/**
 * Asteroid.js
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var UpdateProperties = require('../common/UpdateProperties.js').Asteroid;
var Paths = require('../common/Paths.js');

var Asteroid = function (game, config) {
    VectorSprite.call(this, game, config);
    //this.setPosAngle(config.x, config.y, config.a);
    //this.body.damping = 0;
};

Asteroid.add = function (game, options) {
    var a = new Asteroid(game, options);
    game.add.existing(a);
    return a;
};

Asteroid.prototype = Object.create(VectorSprite.prototype);
Asteroid.prototype.constructor = Asteroid;

Starcoder.mixinPrototype(Asteroid.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(Asteroid.prototype, UpdateProperties.prototype);

Asteroid.prototype.lineColor = '#ff00ff';
Asteroid.prototype.fillColor = '#00ff00';
Asteroid.prototype.shapeClosed = true;
Asteroid.prototype.lineWidth = 1;
Asteroid.prototype.fillAlpha = 0.25;
Asteroid.prototype.shape = Paths.octagon;

module.exports = Asteroid;
//Starcoder.Asteroid = Asteroid;

},{"../Starcoder.js":3,"../common/Paths.js":6,"../common/UpdateProperties.js":7,"./SyncBodyInterface.js":14,"./VectorSprite.js":16}],9:[function(require,module,exports){
/**
 * Bullet.js
 *
 * Client side implementation of simple projectile
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var SimpleParticle = require('./SimpleParticle.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');

var Bullet = function (game, config) {
    SimpleParticle.call(this, game, 'bullet');
    this.setPosAngle(config.x, config.y, config.a);
};

Bullet.prototype = Object.create(SimpleParticle.prototype);
Bullet.prototype.constructor = Bullet;

Starcoder.mixinPrototype(Bullet.prototype, SyncBodyInterface.prototype);

module.exports = Bullet;
},{"../Starcoder.js":3,"./SimpleParticle.js":13,"./SyncBodyInterface.js":14}],10:[function(require,module,exports){
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

},{"../Starcoder.js":3,"../common/Paths.js":6,"../common/UpdateProperties.js":7,"./SyncBodyInterface.js":14,"./VectorSprite.js":16}],11:[function(require,module,exports){
/**
 * GenericOrb.js
 *
 * Building block
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var UpdateProperties = require('../common/UpdateProperties.js').GenericOrb;
var Paths = require('../common/Paths.js');

var GenericOrb = function (game, config) {
    VectorSprite.call(this, game, config);
    //this.setPosAngle(config.x, config.y, config.a);
};

GenericOrb.add = function (game, config) {
    var a = new GenericOrb(game, config);
    game.add.existing(a);
    return a;
};

GenericOrb.prototype = Object.create(VectorSprite.prototype);
GenericOrb.prototype.constructor = GenericOrb;

Starcoder.mixinPrototype(GenericOrb.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(GenericOrb.prototype, UpdateProperties.prototype);

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

},{"../Starcoder.js":3,"../common/Paths.js":6,"../common/UpdateProperties.js":7,"./SyncBodyInterface.js":14,"./VectorSprite.js":16}],12:[function(require,module,exports){
/**
 * Ship.js
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var UpdateProperties = require('../common/UpdateProperties.js').Ship;
//var Engine = require('./Engine.js');
//var Weapons = require('./Weapons.js');

var Ship = function (game, config) {
    VectorSprite.call(this, game, config);
    //this.setPosAngle(config.x, config.y, config.a);

    if (config.mass) {
        this.body.mass = config.mass;
    }
    //this.engine = Engine.add(game, 'thrust', 500);
    //this.addChild(this.engine);
    //this.weapons = Weapons.add(game, 'bullet', 12);
    //this.weapons.ship = this;
    //this.addChild(this.weapons);
    this.tagText = game.add.text(0, this.graphics.height/2 + 1,
        config.tag, {font: 'bold 18px Arial', fill: this.lineColor || '#ffffff', align: 'center'});
    this.tagText.anchor.setTo(0.5, 0);
    this.addChild(this.tagText);
    this.localState = {
        thrust: 'off'
    }
};

Ship.add = function (game, options) {
    var s = new Ship(game, options);
    game.add.existing(s);
    return s;
};

Ship.prototype = Object.create(VectorSprite.prototype);
Ship.prototype.constructor = Ship;

Starcoder.mixinPrototype(Ship.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(Ship.prototype, UpdateProperties.prototype);

//Ship.prototype.setLineStyle = function (color, lineWidth) {
//    Starcoder.VectorSprite.prototype.setLineStyle.call(this, color, lineWidth);
//    this.tagText.setStyle({fill: color});
//};

//Ship.prototype.shape = [
//    [-1,-1],
//    [-0.5,0],
//    [-1,1],
//    [0,0.5],
//    [1,1],
//    [0.5,0],
//    [1,-1],
//    [0,-0.5],
//    [-1,-1]
//];
Ship.prototype.lineWidth = 6;

Ship.prototype.update = function () {
    switch (this.localState.thrust) {
        case 'starting':
            this.game.sounds.playerthrust.play();
            this.game.thrustgenerator.startOn(this);
            this.localState.thrust = 'on';
            break;
        case 'shutdown':
            this.game.sounds.playerthrust.stop();
            this.game.thrustgenerator.stopOn(this);
            this.localState.thrust = 'off';
    }
};

module.exports = Ship;
//Starcoder.Ship = Ship;

},{"../Starcoder.js":3,"../common/UpdateProperties.js":7,"./SyncBodyInterface.js":14,"./VectorSprite.js":16}],13:[function(require,module,exports){
/**
 * SimpleParticle.js
 *
 * Basic bitmap particle
 */
'use strict';

//var Starcoder = require('../../Starcoder-client.js');

var SimpleParticle = function (game, key) {
    var texture = SimpleParticle._textureCache[key];
    Phaser.Sprite.call(this, game, 0, 0, texture);
    game.physics.p2.enable(this, false, false);
    this.body.clearShapes();
    var shape = this.body.addParticle();
    shape.sensor = true;
    //this.kill();
};

SimpleParticle._textureCache = {};

SimpleParticle.cacheTexture = function (game, key, color, size) {
    var texture = game.make.bitmapData(size, size);
    texture.ctx.fillStyle = color;
    texture.ctx.fillRect(0, 0, size, size);
    SimpleParticle._textureCache[key] = texture;
};

SimpleParticle.prototype = Object.create(Phaser.Sprite.prototype);
SimpleParticle.prototype.constructor = SimpleParticle;

//SimpleParticle.Emitter = function (game, key, n) {
//    Phaser.Group.call(this, game);
//    n = n || 50;
//    for (var i = 0; i < n; i++) {
//        this.add(new SimpleParticle(game, key));
//    }
//    this._on = false;
//};
//
//SimpleParticle.Emitter.add = function (game, key, n) {
//    var emitter = new SimpleParticle.Emitter(game, key, n);
//    game.add.existing(emitter);
//    return emitter;
//};
//
//SimpleParticle.Emitter.prototype = Object.create(Phaser.Group.prototype);
//SimpleParticle.Emitter.prototype.constructor = SimpleParticle.Emitter;
//
//SimpleParticle.Emitter.prototype.update = function () {
//    // FIXME: Testing hack
//    if (this._on) {
//        for (var i = 0; i<20; i++) {
//            var particle = this.getFirstDead();
//            if (!particle) {
//                break;
//            }
//            particle.lifespan = 250;
//            particle.alpha = 0.5;
//            var d = this.game.rnd.between(-7, 7);
//            particle.reset(d, 10);
//            particle.body.velocity.y = 80;
//            particle.body.velocity.x = -3*d;
//        }
//    }
//};

module.exports = SimpleParticle;
//Starcoder.SimpleParticle = SimpleParticle;
},{}],14:[function(require,module,exports){
/**
 * SyncBodyInterface.js
 *
 * Shared methods for VectorSprites, Particles, etc.
 */

var SyncBodyInterface = function () {};

/**
 * Set location and angle of a physics object. Value are given in world coordinates, not pixels
 *
 * @param x {number}
 * @param y {number}
 * @param a {number}
 */
SyncBodyInterface.prototype.setPosAngle = function (x, y, a) {
    this.body.data.position[0] = -(x || 0);
    this.body.data.position[1] = -(y || 0);
    this.body.data.angle = a || 0;
};

SyncBodyInterface.prototype.config = function (properties) {
    for (var i = 0, l = this.updateProperties.length; i < l; i++) {
        var k = this.updateProperties[i];
        if (properties[k]) {
            this[k] = properties[k];        // FIXME? Virtualize somehow
        }
    }
};

module.exports = SyncBodyInterface;
},{}],15:[function(require,module,exports){
/**
 * ThrustGenerator.js
 *
 * Group providing API, layering, and pooling for thrust particle effects
 */
'use strict';

var SimpleParticle = require('./SimpleParticle.js');

var _textureKey = 'thrust';

// Pooling parameters
var _minPoolSize = 300;
var _minFreeParticles = 20;
var _softPoolLimit = 200;
var _hardPoolLimit = 500;

// Behavior of emitter
var _particlesPerBurst = 5;
var _particleTTL = 150;
var _particleBaseSpeed = 5;
var _coneLength = 1;
var _coneWidthRatio = 0.2;
var _engineOffset = -20;

var ThrustGenerator = function (game) {
    Phaser.Group.call(this, game);

    this.thrustingShips = {};

    // Pregenerate a batch of particles
    for (var i = 0; i < _minPoolSize; i++) {
        var particle = this.add(new SimpleParticle(game, _textureKey));
        particle.alpha = 0.5;
        particle.rotation = Math.PI/4;
        particle.kill();
    }
};

ThrustGenerator.prototype = Object.create(Phaser.Group.prototype);
ThrustGenerator.prototype.constructor = ThrustGenerator;

ThrustGenerator.prototype.startOn = function (ship) {
    this.thrustingShips[ship.id] = ship;
};

ThrustGenerator.prototype.stopOn = function (ship) {
    delete this.thrustingShips[ship.id];
};

ThrustGenerator.prototype.update = function () {
    var keys = Object.keys(this.thrustingShips);
    for (var i = 0, l = keys.length; i < l; i++) {
        var ship = this.thrustingShips[keys[i]];
        var w = ship.width;
        var sin = Math.sin(ship.rotation);
        var cos = Math.cos(ship.rotation);
        for (var j = 0; j < _particlesPerBurst; j++) {
            var particle = this.getFirstDead();
            if (!particle) {
                console.log('Not enough thrust particles in pool');
                break;
            }
            var d = this.game.rnd.realInRange(-_coneWidthRatio*w, _coneWidthRatio*w);
            var x = ship.x + d*cos + _engineOffset*sin;
            var y = ship.y + d*sin - _engineOffset*cos;
            particle.lifespan = _particleTTL;
            particle.reset(x, y);
            particle.body.velocity.x = _particleBaseSpeed*(_coneLength*sin - d*cos);
            particle.body.velocity.y = _particleBaseSpeed*(-_coneLength*cos - d*sin);
        }
    }
};

ThrustGenerator.textureKey = _textureKey;

module.exports = ThrustGenerator;
},{"./SimpleParticle.js":13}],16:[function(require,module,exports){
/**
 * Sprite with attached Graphics object for vector-like graphics
 */
'use strict';

//var Starcoder = require('../../Starcoder-client.js');

var VectorSprite = function (game, config) {
    Phaser.Sprite.call(this, game);

    //this.shape = config.properties.shape || this.shape;
    //this.shapeClosed = config.properties.shape || this.shapeClosed;
    //this.lineWidth = config.properties.lineWidth || this.lineWidth;
    //this.lineColor = config.properties.lineColor || this.lineColor;
    //this.fillColor = config.properties.fillColor || this.fillColor;
    //this.fillAlpha = config.properties.fillAlpha || this.fillAlpha;
    //this.geometry = config.properties.geometry || this.geometry;
    //this.vectorScale = config.properties.vectorScale || this.vectorScale;

    this.graphics = game.make.graphics();
    this.texture = this.game.add.renderTexture();
    this.minitexture = this.game.add.renderTexture();
    this.minisprite = this.game.minimap.create();
    this.minisprite.anchor.setTo(0.5, 0.5);

    game.physics.p2.enable(this, false, false);
    this.setPosAngle(config.x, config.y, config.a);
    this.config(config.properties);
    this.updateAppearance();
    this.updateBody();
    this.body.mass = 0;
};

VectorSprite.add = function (game, x, y) {
    var v = new VectorSprite(game, x, y);
    game.add.existing(v);
    return v;
}

VectorSprite.prototype = Object.create(Phaser.Sprite.prototype);
VectorSprite.prototype.constructor = VectorSprite;

// Default octagon
VectorSprite.prototype.shape = [
    [2,1],
    [1,2],
    [-1,2],
    [-2,1],
    [-2,-1],
    [-1,-2],
    [1,-2],
    [2,-1]
];
VectorSprite.prototype.shapeClosed = true;
VectorSprite.prototype.lineColor = '#ffffff';
VectorSprite.prototype.lineWidth = 1;
VectorSprite.prototype.fillColor = null;
VectorSprite.prototype.fillAlpha = 0.25;
VectorSprite.prototype.vectorScale = 1;

VectorSprite.prototype.physicsBodyType = 'circle';

VectorSprite.prototype.setShape = function (shape) {
    this.shape = shape;
    this.updateAppearance();
};

VectorSprite.prototype.setLineStyle = function (color, lineWidth) {
    if (!lineWidth || lineWidth < 1) {
        lineWidth = this.lineWidth || 1;
    }
    this.color = color;
    this.lineWidth = lineWidth;
    this.updateAppearance();
};

VectorSprite.prototype.updateAppearance = function () {
    // Draw full sized
    this.graphics.clear();
    if (typeof this.drawProcedure !== 'undefined') {
        this.drawProcedure();
    } else if (this.shape) {
        this.draw();
    }
    this.texture.resize(this.graphics.width, this.graphics.height, true);
    this.texture.renderXY(this.graphics, this.graphics.width/2, this.graphics.height/2, true);
    this.setTexture(this.texture);
    // Draw small for minimap
    var mapScale = this.game.minimap.mapScale;
    this.graphics.clear();
    if (typeof this.drawProcedure !== 'undefined') {
        this.drawProcedure(mapScale);
    } else if (this.shape) {
        this.draw(mapScale);
    }
    this.minitexture.resize(this.graphics.width, this.graphics.height, true);
    this.minitexture.renderXY(this.graphics, this.graphics.width/2, this.graphics.height/2, true);
    this.minisprite.setTexture(this.minitexture);
};

VectorSprite.prototype.updateBody = function () {
    switch (this.physicsBodyType) {
        case "circle":
            if (typeof this.circle === 'undefined') {
                var r = this.graphics.getBounds();
                var radius = Math.round(Math.sqrt(r.width* r.height)/2);
            } else {
                radius = this.radius;
            }
            this.body.setCircle(radius);
            break;
        // TODO: More shapes
    }
};

VectorSprite.prototype.draw = function (renderScale) {
    renderScale = renderScale || 1;
    // Draw simple shape, if given
    if (this.shape) {
        var lineColor = Phaser.Color.hexToRGB(this.lineColor);
        if (renderScale === 1) {
            var lineWidth = this.lineWidth;
        } else {
            lineWidth = 1;
        }
        if ((renderScale === 1) && this.fillColor) {        // Only fill full sized
            var fillColor = Phaser.Color.hexToRGB(this.fillColor);
            var fillAlpha = this.fillAlpha || 1;
            this.graphics.beginFill(fillColor, fillAlpha);
        }
        this.graphics.lineStyle(lineWidth, lineColor, 1);
        this._drawPolygon(this.shape, this.shapeClosed, renderScale);
        if ((renderScale === 1) && this.fillColor) {
            this.graphics.endFill();
        }
    }
    // Draw geometry spec, if given, but only for the full sized sprite
    if ((renderScale === 1) && this.geometry) {
        for (var i = 0, l = this.geometry.length; i < l; i++) {
            var g = this.geometry[i];
            switch (g.type) {
                case "poly":
                    // FIXME: defaults and stuff
                    this._drawPolygon(g.points, g.closed, renderScale);
                    break;
            }
        }
    }
};

VectorSprite.prototype._drawPolygon = function (points, closed, renderScale) {
    var sc = this.game.physics.p2.mpxi(this.vectorScale)*renderScale;
    points = points.slice();
    if (closed) {
        points.push(points[0]);
    }
    this.graphics.moveTo(points[0][0] * sc, points[0][1] * sc);
    for (var i = 1, l = points.length; i < l; i++) {
        this.graphics.lineTo(points[i][0] * sc, points[i][1] * sc);
    }
};

module.exports = VectorSprite;
//Starcoder.VectorSprite = VectorSprite;
},{}],17:[function(require,module,exports){
/**
 * Controls.js
 *
 * Virtualize and implement queue for game controls
 */
'use strict';

var Starcoder = require('../Starcoder-client.js');
console.log('Controls', Starcoder);

var Controls = function (game, parent) {
    Phaser.Plugin.call(this, game, parent);
};

Controls.prototype = Object.create(Phaser.Plugin.prototype);
Controls.prototype.constructor = Controls;

Controls.prototype.init = function (queue) {
    this.queue = queue;
    this.controls = this.game.input.keyboard.createCursorKeys();
    this.controls.fire = this.game.input.keyboard.addKey(Phaser.Keyboard.B);
};

var seq = 0;
var up = false, down = false, left = false, right = false, fire = false;

Controls.prototype.reset = function () {
    up = down = left = right = false;
    this.queue.length = 0;
};

Controls.prototype.preUpdate = function () {
    // TODO: Support other interactions/methods
    var controls = this.controls;
    if (controls.up.isDown && !up) {
        up = true;
        this.queue.push({type: 'up_pressed', executed: false, seq: seq++});
    }
    if (!controls.up.isDown && up) {
        up = false;
        this.queue.push({type: 'up_released', executed: false, seq: seq++});
    }
    if (controls.down.isDown && !down) {
        down = true;
        this.queue.push({type: 'down_pressed', executed: false, seq: seq++});
    }
    if (!controls.down.isDown && down) {
        down = false;
        this.queue.push({type: 'down_released', executed: false, seq: seq++});
    }
    if (controls.right.isDown && !right) {
        right = true;
        this.queue.push({type: 'right_pressed', executed: false, seq: seq++});
    }
    if (!controls.right.isDown && right) {
        right = false;
        this.queue.push({type: 'right_released', executed: false, seq: seq++});
    }
    if (controls.left.isDown && !left) {
        left = true;
        this.queue.push({type: 'left_pressed', executed: false, seq: seq++});
    }
    if (!controls.left.isDown && left) {
        left = false;
        this.queue.push({type: 'left_released', executed: false, seq: seq++});
    }
    if (controls.fire.isDown && !fire) {
        fire = true;
        this.queue.push({type: 'fire_pressed', executed: false, seq: seq++});
    }
    if (!controls.fire.isDown && fire) {
        fire = false;
        this.queue.push({type: 'fire_released', executed: false, seq: seq++});
    }
};

Controls.prototype.processQueue = function (cb, clear) {
    var queue = this.queue;
    for (var i = 0, l = queue.length; i < l; i++) {
        var action = queue[i];
        if (action.executed) {
            continue;
        }
        cb(action);
        action.etime = this.game.time.now;
        action.executed = true;
    }
    if (clear) {
        queue.length = 0;
    }
};

Starcoder.Controls = Controls;
module.exports = Controls;
},{"../Starcoder-client.js":2}],18:[function(require,module,exports){
/**
 * SyncClient.js
 *
 * Sync physics objects with server
 */
'use strict';

var Starcoder = require('../Starcoder-client.js');
var UPDATE_QUEUE_LIMIT = 8;

var SyncClient = function (game, parent) {
    Phaser.Plugin.call(this, game, parent);
};

SyncClient.prototype = Object.create(Phaser.Plugin.prototype);
SyncClient.prototype.constructor = SyncClient;

SyncClient.prototype.init = function (socket, queue) {
    // TODO: Copy some config options
    this.socket = socket;
    this.cmdQueue = queue;
    this.extant = {};
};

SyncClient.prototype.start = function () {
    var self = this;
    var starcoder = this.game.starcoder;
    this._updateComplete = false;
    // FIXME: Need more robust handling of DC/RC
    this.socket.on('disconnect', function () {
        self.game.paused = true;
    });
    this.socket.on('reconnect', function () {
        this.game.paused = false;
    });
    // Measure client-server time delta
    this.socket.on('timesync', function (data) {
        self._latency = data - self.game.time.now;
    });
    this.socket.on('update', function (data) {
        var realTime = data.r;
        for (var i = 0, l = data.b.length; i < l; i++) {
            var update = data.b[i];
            var id = update.id;
            var sprite;
            update.timestamp = realTime;
            if (sprite = self.extant[id]) {
                // Existing sprite - process update
                sprite.updateQueue.push(update);
                if (sprite.updateQueue.length > UPDATE_QUEUE_LIMIT) {
                    sprite.updateQueue.shift();
                }
            } else {
                // New sprite - create and configure
                //console.log('New', id, update.t);
                sprite = starcoder.addBody(update.t, update);
                if (sprite) {
                    sprite.serverId = id;
                    self.extant[id] = sprite;
                    sprite.updateQueue = [update];
                }
            }
        }
        for (i = 0, l = data.rm.length; i < l; i++) {
            id = data.rm[i];
            if (self.extant[id]) {
                starcoder.removeBody(self.extant[id]);
                delete self.extant[id];
            }
        }
    });
};

SyncClient.prototype.update = function () {
    if (true || !this._updateComplete) {
        this._sendCommands();
        this._processPhysicsUpdates();
        this._updateComplete = true;
    }
 };

SyncClient.prototype.postRender = function () {
    this._updateComplete = false;
};

/**
 * Send queued commands that have been executed to the server
 *
 * @private
 */
SyncClient.prototype._sendCommands = function () {
    var actions = [];
    for (var i = this.cmdQueue.length-1; i >= 0; i--) {
        var action = this.cmdQueue[i];
        if (action.executed) {
            actions.push(action);
            this.cmdQueue.splice(i, 1);
        }
    }
    if (actions.length) {
        this.socket.emit('do', actions);
        //console.log('sending actions', actions);
    }
};

/**
 * Handles interpolation / prediction resolution for physics bodies
 *
 * @private
 */
SyncClient.prototype._processPhysicsUpdates = function () {
    var interpTime = this.game.time.now + this._latency - this.game.starcoder.config.renderLatency;
    var oids = Object.keys(this.extant);
    for (var i = oids.length - 1; i >= 0; i--) {
        var sprite = this.extant[oids[i]];
        var queue = sprite.updateQueue;
        var before = null, after = null;

        //var temp = [];
        //var lastx = queue[0].x || 0;
        //for (var k = 1; k<queue.length; k++) {
        //    temp.push(queue[k].x-lastx);
        //    lastx = queue[k].x;
        //}
        //console.log(interpTime, '<>', temp);

        // Find updates before and after interpTime
        var j = 1;
        while (queue[j]) {
            if (queue[j].timestamp > interpTime) {
                after = queue[j];
                before = queue[j-1];
                break;
            }
            j++;
        }

        // None - we're behind.
        if (!before && !after) {
            if (queue.length >= 2) {    // Two most recent updates available? Use them.
                before = queue[queue.length - 2];
                after = queue[queue.length - 1];
                console.log('Lagging', oids[i]);
            } else {                    // No? Just bail
                console.log('Bailing', oids[i]);
                continue;
            }
        } else {
            //console.log('Ok', interpTime, queue.length);
            queue.splice(0, j - 1);     // Throw out older updates
        }

        var span = after.timestamp - before.timestamp;
        var t = (interpTime - before.timestamp) / span;
        //var oldx = sprite.body.data.position[0];
        //var scale = 0.05 / (after.wtimestamp - before.wtimestamp);
        //sprite.body.data.position[0] = -hermite(before.x, after.x, before.vx*span, after.vx*span, t);
        //sprite.body.data.position[1] = -hermite(before.y, after.y, before.vy*span, after.vy*span, t);
        //sprite.body.data.angle = hermite(before.a, after.a, before.av, after.av, t);
        sprite.setPosAngle(linear(before.x, after.x, t), linear(before.y, after.y, t), linear(before.a, after.a, t));
        //sprite.body.data.position[0] = -linear(before.x, after.x, t);
        //sprite.body.data.position[1] = -linear(before.y, after.y, t);
        //sprite.body.data.angle = linear(before.a, after.a, t);
        //sprite.body.data.position[0] -= 0.10;
        //sprite.body.data.position[1] = -5;
        //console.log('[t]', before.timestamp, interpTime, after.timestamp, '-', after.timestamp - before.timestamp);
        //console.log('[w]', before.wtimestamp, '*****', after.wtimestamp, '-', after.wtimestamp - before.wtimestamp);
        //console.log('[x]', before.x, -sprite.body.data.position[0], after.x);
        //var dx = sprite.body.data.position[0] - oldx, dt = this.game.time.now - this.lastUpdate;
        //console.log('Delta>', dx, '/', dt, '=', dx/dt);

    }
};

// Helpers

// FIXME, maybe
function hermite (p0, p1, v0, v1, t) {
    var t2 = t*t;
    var t3 = t*t2;
    return (2*t3 - 3*t2 + 1)*p0 + (t3 - 2*t2 + t)*v0 + (-2*t3 + 3*t2)*p1 + (t3 - t2)*v1;
}

function linear (p0, p1, t, scale) {
    scale = scale || 1;
    return p0 + (p1 - p0)*t*scale;
}

Starcoder.ServerSync = SyncClient;
module.exports = SyncClient;
},{"../Starcoder-client.js":2}],19:[function(require,module,exports){
/**
 * Boot.js
 *
 * Boot state for Starcoder
 * Load assets for preload screen and connect to server
 */
'use strict';

var Controls = require('../phaserplugins/Controls.js');
var SyncClient = require('../phaserplugins/SyncClient.js');

var Boot = function () {};

Boot.prototype = Object.create(Phaser.State.prototype);
Boot.prototype.constructor = Boot;

var _connected = false;

Boot.prototype.preload = function () {
    //this.game.stage.disableVisibilityChange = true;
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.game.renderer.renderSession.roundPixels = true;
    var self = this;
    var pScale = this.starcoder.config.physicsScale;
    var ipScale = 1/pScale;
    var floor = Math.floor;
    this.game.physics.config = {
        pxm: function (a) {
            return ipScale*a;
        },
        mpx: function (a) {
            return floor(pScale*a);
        },
        pxmi: function (a) {
            return -ipScale*a;
        },
        mpxi: function (a) {
            return floor(-pScale*a);
        }
    };
    //this.starcoder.controls = this.game.plugins.add(Controls,
    //    this.starcoder.cmdQueue);
    this.starcoder.controls = this.starcoder.attachPlugin(Controls, this.starcoder.cmdQueue);
    // Set up socket.io connection
    this.starcoder.socket = this.starcoder.io(this.starcoder.config.serverUri + '/sync',
        this.starcoder.config.ioClientOptions);
    this.starcoder.socket.on('server ready', function (playerMsg) {
        // FIXME: Has to interact with session for authentication etc.
        self.starcoder.player = playerMsg;
        //self.starcoder.syncclient = self.game.plugins.add(SyncClient,
        //    self.starcoder.socket, self.starcoder.cmdQueue);
        self.starcoder.syncclient = self.starcoder.attachPlugin(SyncClient,
            self.starcoder.socket, self.starcoder.cmdQueue);
        _connected = true;
    });
};

Boot.prototype.update = function () {
    if (_connected) {
        this.game.state.start('space');
    }
};

module.exports = Boot;
},{"../phaserplugins/Controls.js":17,"../phaserplugins/SyncClient.js":18}],20:[function(require,module,exports){
/**
 * Space.js
 *
 * Main game state for Starcoder
 */
'use strict';

var SimpleParticle = require('../phaserbodies/SimpleParticle.js');
var ThrustGenerator = require('../phaserbodies/ThrustGenerator.js');
var MiniMap = require('../phaserui/MiniMap.js');

var Space = function () {};

Space.prototype = Object.create(Phaser.State.prototype);
Space.prototype.constructor = Space;

Space.prototype.preload = function () {
    SimpleParticle.cacheTexture(this.game, ThrustGenerator.textureKey, '#ff6600', 8);
    SimpleParticle.cacheTexture(this.game, 'bullet', '#999999', 4);
    this.game.load.audio('playerthrust', 'assets/sounds/thrustLoop.ogg');
    //this.game.load.image('bitship', 'assets/ship.png');
};

Space.prototype.create = function () {
    var rng = this.game.rnd;
    var wb = this.starcoder.config.worldBounds;
    var ps = this.starcoder.config.physicsScale;
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.world.setBounds.call(this.world, wb[0]*ps, wb[1]*ps, (wb[2]-wb[0])*ps, (wb[3]-wb[1])*ps);
    this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    // Debugging
    this.game.time.advancedTiming = true;

    this.starcoder.controls.reset();

    // Sounds
    this.game.sounds = {};
    this.game.sounds.playerthrust = this.game.sound.add('playerthrust', 1, true);

    // Background
    var starfield = this.game.make.bitmapData(600, 600);
    drawStarField(starfield.ctx, 600, 16);
    this.game.add.tileSprite(wb[0]*ps, wb[1]*ps, (wb[2]-wb[0])*ps, (wb[3]-wb[1])*ps, starfield);

    this.starcoder.syncclient.start();
    this.starcoder.socket.emit('client ready');

    // Groups for particle effects
    this.game.thrustgenerator = new ThrustGenerator(this.game);

    // Group for game objects
    this.game.playfield = this.game.add.group();

    // UI
    this.game.ui = this.game.add.group();
    this.game.ui.fixedToCamera = true;

    // Inventory
    var label = this.game.make.text(1700, 25, 'INVENTORY', {font: '24px Arial', fill: '#ff9900', align: 'center'});
    label.anchor.setTo(0.5);
    this.game.ui.add(label);
    this.game.inventorytext = this.game.make.text(1700, 50, '0 crystals',
        {font: '24px Arial', fill: '#ccc000', align: 'center'});
    this.game.inventorytext.anchor.setTo(0.5);
    this.game.ui.add(this.game.inventorytext);

    //MiniMap
    this.game.minimap = new MiniMap(this.game, 300, 300);
    this.game.ui.add(this.game.minimap);
    this.game.x = 10;
    this.game.y = 10;

    // Helpers
    function randomNormal () {
        var t = 0;
        for (var i=0; i<6; i++) {
            t += rng.normal();
        }
        return t/6;
    }

    function drawStar (ctx, x, y, d, color) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x-d+1, y-d+1);
        ctx.lineTo(x+d-1, y+d-1);
        ctx.moveTo(x-d+1, y+d-1);
        ctx.lineTo(x+d-1, y-d+1);
        ctx.moveTo(x, y-d);
        ctx.lineTo(x, y+d);
        ctx.moveTo(x-d, y);
        ctx.lineTo(x+d, y);
        ctx.stroke();
    }

    function drawStarField (ctx, size, n) {
        var xm = Math.round(size/2 + randomNormal()*size/4);
        var ym = Math.round(size/2 + randomNormal()*size/4);
        var quads = [[0,0,xm-1,ym-1], [xm,0,size-1,ym-1],
            [0,ym,xm-1,size-1], [xm,ym,size-1,size-1]];
        var color;
        var i, j, l, q;

        n = Math.round(n/4);
        for (i=0, l=quads.length; i<l; i++) {
            q = quads[i];
            for (j=0; j<n; j++) {
                color = 'hsl(60,100%,' + rng.between(90,99) + '%)';
                drawStar(ctx,
                    rng.between(q[0]+7, q[2]-7), rng.between(q[1]+7, q[3]-7),
                    rng.between(2,4), color);
            }
        }
    }

};

Space.prototype.update = function () {
    // FIXME: just a mess for testing
    var self = this;
    this.starcoder.controls.processQueue(function (a) {
        if (a.type === 'up_pressed') {
            self.game.playerShip.localState.thrust = 'starting';
            //self.game.sounds.playerthrust.play();
            //self.game.thrustgenerator.startOn(self.game.playerShip);
        } else if (a.type === 'up_released') {
            self.game.playerShip.localState.thrust = 'shutdown';
            //self.game.sounds.playerthrust.stop();
            //self.game.thrustgenerator.stopOn(self.game.playerShip);
        }
    });
};

Space.prototype.render = function () {
    //console.log('+render+');
    //if (this.starcoder.tempsprite) {
    //    var d = this.starcoder.tempsprite.position.x - this.starcoder.tempsprite.previousPosition.x;
    //    console.log('Delta', d, this.game.time.elapsed, d / this.game.time.elapsed);
    //}
    //console.log('--------------------------------');
    this.game.debug.text('Fps: ' + this.game.time.fps, 5, 20);
    //this.game.debug.cameraInfo(this.game.camera, 100, 20);
    //if (this.ship) {
    //    this.game.debug.spriteInfo(this.ship, 420, 20);
    //}
};

module.exports = Space;

},{"../phaserbodies/SimpleParticle.js":13,"../phaserbodies/ThrustGenerator.js":15,"../phaserui/MiniMap.js":21}],21:[function(require,module,exports){
/**
 * MiniMap.js
 */
'use strict';

var MiniMap = function (game, width, height) {
    Phaser.Group.call(this, game);

    var xr = width / this.game.starcoder.phaserWidth;
    var yr = height / this.game.starcoder.phaserHeight;
    if (xr <= yr) {
        this.mapScale = xr;
        this.xOffset = -xr * this.game.starcoder.phaserLeft;
        this.yOffset = -xr * this.game.starcoder.phaserTop + (height - xr * this.game.starcoder.phaserHeight) / 2;
    } else {
        this.mapScale = yr;
        this.yOffset = -yr * this.game.starcoder.phaserTop;
        this.xOffset = -yr * this.game.starcoder.phaserLeft + (width - yr * this.game.starcoder.phaserWidth) / 2;
    }

    this.graphics = game.make.graphics(0, 0);
    this.graphics.beginFill(0x00ff00, 0.2);
    this.graphics.drawRect(0, 0, width, height);
    this.graphics.endFill();
    this.graphics.cacheAsBitmap = true;
    this.add(this.graphics);
};

MiniMap.prototype = Object.create(Phaser.Group.prototype);
MiniMap.prototype.constructor = MiniMap;

MiniMap.prototype.update = function () {
    //this.texture.renderXY(this.graphics, 0, 0, true);
    for (var i = 0, l = this.game.playfield.children.length; i < l; i++) {
        var body = this.game.playfield.children[i];
        if (!body.minisprite) {
            continue;
        }
        body.minisprite.x = this.worldToMmX(body.x);
        body.minisprite.y = this.worldToMmY(body.y);
        body.minisprite.angle = body.angle;
    //    var x = 100 + body.x / 40;
    //    var y = 100 + body.y / 40;
    //    this.texture.renderXY(body.graphics, x, y, false);
    }
};

MiniMap.prototype.worldToMmX = function (x) {
    return x * this.mapScale + this.xOffset;
};

MiniMap.prototype.worldToMmY = function (y) {
    return y * this.mapScale + this.yOffset;
};

module.exports = MiniMap;
},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL1N0YXJjb2Rlci1jbGllbnQuanMiLCJzcmMvU3RhcmNvZGVyLmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL1dvcmxkQXBpLmpzIiwic3JjL2NsaWVudC5qcyIsInNyYy9jb21tb24vUGF0aHMuanMiLCJzcmMvY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMiLCJzcmMvcGhhc2VyYm9kaWVzL0FzdGVyb2lkLmpzIiwic3JjL3BoYXNlcmJvZGllcy9CdWxsZXQuanMiLCJzcmMvcGhhc2VyYm9kaWVzL0NyeXN0YWwuanMiLCJzcmMvcGhhc2VyYm9kaWVzL0dlbmVyaWNPcmIuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1NoaXAuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1NpbXBsZVBhcnRpY2xlLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TeW5jQm9keUludGVyZmFjZS5qcyIsInNyYy9waGFzZXJib2RpZXMvVGhydXN0R2VuZXJhdG9yLmpzIiwic3JjL3BoYXNlcmJvZGllcy9WZWN0b3JTcHJpdGUuanMiLCJzcmMvcGhhc2VycGx1Z2lucy9Db250cm9scy5qcyIsInNyYy9waGFzZXJwbHVnaW5zL1N5bmNDbGllbnQuanMiLCJzcmMvcGhhc2Vyc3RhdGVzL0Jvb3QuanMiLCJzcmMvcGhhc2Vyc3RhdGVzL1NwYWNlLmpzIiwic3JjL3BoYXNlcnVpL01pbmlNYXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyoqXG4gKiBTdGFyY29kZXItY2xpZW50LmpzXG4gKlxuICogU3RhcmNvZGVyIG1hc3RlciBvYmplY3QgZXh0ZW5kZWQgd2l0aCBjbGllbnQgb25seSBwcm9wZXJ0aWVzIGFuZCBtZXRob2RzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBXb3JsZEFwaSA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvV29ybGRBcGkuanMnKTtcblxuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoU3RhcmNvZGVyLnByb3RvdHlwZSwgV29ybGRBcGkucHJvdG90eXBlKTtcblxudmFyIHN0YXRlcyA9IHtcbiAgICBib290OiByZXF1aXJlKCcuL3BoYXNlcnN0YXRlcy9Cb290LmpzJyksXG4gICAgc3BhY2U6IHJlcXVpcmUoJy4vcGhhc2Vyc3RhdGVzL1NwYWNlLmpzJylcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlvID0gaW87XG4gICAgdGhpcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKDE4MDAsIDk1MCwgUGhhc2VyLkFVVE8sICdtYWluJyk7XG4gICAgLy90aGlzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoMTgwMCwgOTUwLCBQaGFzZXIuQ0FOVkFTLCAnbWFpbicpO1xuICAgIHRoaXMuZ2FtZS5mb3JjZVNpbmdsZVVwZGF0ZSA9IHRydWU7XG4gICAgdGhpcy5nYW1lLnN0YXJjb2RlciA9IHRoaXM7XG4gICAgZm9yICh2YXIgayBpbiBzdGF0ZXMpIHtcbiAgICAgICAgdmFyIHN0YXRlID0gbmV3IHN0YXRlc1trXSgpO1xuICAgICAgICBzdGF0ZS5zdGFyY29kZXIgPSB0aGlzO1xuICAgICAgICB0aGlzLmdhbWUuc3RhdGUuYWRkKGssIHN0YXRlKTtcbiAgICB9XG4gICAgdGhpcy5jbWRRdWV1ZSA9IFtdO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ2Jvb3QnKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuYXR0YWNoUGx1Z2luID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBwbHVnaW4gPSB0aGlzLmdhbWUucGx1Z2lucy5hZGQuYXBwbHkodGhpcy5nYW1lLnBsdWdpbnMsIGFyZ3VtZW50cyk7XG4gICAgcGx1Z2luLnN0YXJjb2RlciA9IHRoaXM7XG4gICAgcGx1Z2luLmxvZyA9IHRoaXMubG9nO1xuICAgIHJldHVybiBwbHVnaW47XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLnJvbGUgPSAnQ2xpZW50JztcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFyY29kZXI7XG4iLCIvKipcbiAqIFN0YXJjb2Rlci5qc1xuICpcbiAqIFNldCB1cCBnbG9iYWwgU3RhcmNvZGVyIG5hbWVzcGFjZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8vdmFyIFN0YXJjb2RlciA9IHtcbi8vICAgIGNvbmZpZzoge1xuLy8gICAgICAgIHdvcmxkQm91bmRzOiBbLTQyMDAsIC00MjAwLCA4NDAwLCA4NDAwXVxuLy9cbi8vICAgIH0sXG4vLyAgICBTdGF0ZXM6IHt9XG4vL307XG5cbnZhciBjb25maWcgPSB7XG4gICAgdmVyc2lvbjogJzAuMScsXG4gICAgc2VydmVyVXJpOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PSAnZGV2ZWxvcG1lbnQnID8gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MScgOiAnaHR0cDovL3BoYXJjb2Rlci5lbGFzdGljYmVhbnN0YWxrLmNvbScsXG4gICAgLy93b3JsZEJvdW5kczogWy00MjAwLCAtNDIwMCwgODQwMCwgODQwMF0sXG4gICAgd29ybGRCb3VuZHM6IFstMjAwLCAtMjAwLCAyMDAsIDIwMF0sXG4gICAgaW9DbGllbnRPcHRpb25zOiB7XG4gICAgICAgIC8vZm9yY2VOZXc6IHRydWVcbiAgICAgICAgcmVjb25uZWN0aW9uOiBmYWxzZVxuICAgIH0sXG4gICAgdXBkYXRlSW50ZXJ2YWw6IDUwLFxuICAgIHJlbmRlckxhdGVuY3k6IDEwMCxcbiAgICBwaHlzaWNzU2NhbGU6IDIwLFxuICAgIGZyYW1lUmF0ZTogKDEgLyA2MCksXG4gICAgdGltZVN5bmNGcmVxOiAxMCxcbiAgICBwaHlzaWNzUHJvcGVydGllczoge1xuICAgICAgICBTaGlwOiB7XG4gICAgICAgICAgICBtYXNzOiAxMFxuICAgICAgICB9LFxuICAgICAgICBBc3Rlcm9pZDoge1xuICAgICAgICAgICAgbWFzczogMjBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgaW5pdGlhbEJvZGllczogW1xuICAgICAgICB7dHlwZTogJ0FzdGVyb2lkJywgbnVtYmVyOiAyNSwgY29uZmlnOiB7XG4gICAgICAgICAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJ30sXG4gICAgICAgICAgICB2ZWxvY2l0eToge3JhbmRvbTogJ3ZlY3RvcicsIGxvOiAtMTAsIGhpOiAxMH0sXG4gICAgICAgICAgICBhbmd1bGFyVmVsb2NpdHk6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAtNSwgaGk6IDV9LFxuICAgICAgICAgICAgdmVjdG9yU2NhbGU6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAwLjYsIGhpOiAxLjR9LFxuICAgICAgICAgICAgbWFzczogMTBcbiAgICAgICAgfX0sXG4gICAgICAgIC8ve3R5cGU6ICdDcnlzdGFsJywgbnVtYmVyOiAxMCwgY29uZmlnOiB7XG4gICAgICAgIC8vICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnfSxcbiAgICAgICAgLy8gICAgdmVsb2NpdHk6IHtyYW5kb206ICd2ZWN0b3InLCBsbzogLTQsIGhpOiA0LCBub3JtYWw6IHRydWV9LFxuICAgICAgICAvLyAgICB2ZWN0b3JTY2FsZToge3JhbmRvbTogJ2Zsb2F0JywgbG86IDAuNCwgaGk6IDAuOH0sXG4gICAgICAgIC8vICAgIG1hc3M6IDVcbiAgICAgICAgLy99fVxuICAgICAgICB7dHlwZTogJ0h5ZHJhJywgbnVtYmVyOiAxLCBjb25maWc6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDUwfVxuICAgICAgICB9fVxuICAgIF1cbn07XG5cbnZhciBTdGFyY29kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgLy8gSW5pdGlhbGl6ZXJzIHZpcnR1YWxpemVkIGFjY29yZGluZyB0byByb2xlXG4gICAgdGhpcy5iYW5uZXIoKTtcbiAgICB0aGlzLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAvL3RoaXMuaW5pdE5ldC5jYWxsKHRoaXMpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5leHRlbmRDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgZm9yICh2YXIgayBpbiBjb25maWcpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWdba10gPSBjb25maWdba107XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vLyBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgY29tbW9uIGNvbmZpZyBvcHRpb25zXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAnd29ybGRXaWR0aCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzJdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyV2lkdGgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiAodGhpcy5jb25maWcud29ybGRCb3VuZHNbMl0gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1swXSk7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAnd29ybGRIZWlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlckhlaWdodCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqICh0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdKTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJMZWZ0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyVG9wJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMV07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyUmlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1syXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJCb3R0b20nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXTtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBBZGQgbWl4aW4gcHJvcGVydGllcyB0byB0YXJnZXQuIEFkYXB0ZWQgKHNsaWdodGx5KSBmcm9tIFBoYXNlclxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXRcbiAqIEBwYXJhbSB7b2JqZWN0fSBtaXhpblxuICovXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUgPSBmdW5jdGlvbiAodGFyZ2V0LCBtaXhpbikge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobWl4aW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgdmFyIHZhbCA9IG1peGluW2tleV07XG4gICAgICAgIGlmICh2YWwgJiZcbiAgICAgICAgICAgICh0eXBlb2YgdmFsLmdldCA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgdmFsLnNldCA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgdmFsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gdmFsO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5iYW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5sb2coJ1N0YXJjb2RlcicsIHRoaXMucm9sZSwgJ3YnICsgdGhpcy5jb25maWcudmVyc2lvbiwgJ3N0YXJ0ZWQgYXQnLCBEYXRlKCkpO1xufVxuXG4vKipcbiAqIEN1c3RvbSBsb2dnaW5nIGZ1bmN0aW9uIHRvIGJlIGZlYXR1cmVmaWVkIGFzIG5lY2Vzc2FyeVxuICovXG5TdGFyY29kZXIucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcmNvZGVyO1xuIiwiLyoqXG4gKiBXb3JsZEFwaS5qc1xuICpcbiAqIEFkZC9yZW1vdmUvbWFuaXB1bGF0ZSBib2RpZXMgaW4gY2xpZW50J3MgcGh5c2ljcyB3b3JsZFxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBXb3JsZEFwaSA9IGZ1bmN0aW9uICgpIHt9O1xuXG52YXIgYm9keVR5cGVzID0ge1xuICAgIFNoaXA6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9TaGlwLmpzJyksXG4gICAgQXN0ZXJvaWQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9Bc3Rlcm9pZC5qcycpLFxuICAgIENyeXN0YWw6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9DcnlzdGFsLmpzJyksXG4gICAgQnVsbGV0OiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvQnVsbGV0LmpzJyksXG4gICAgR2VuZXJpY09yYjogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0dlbmVyaWNPcmIuanMnKVxufTtcblxuV29ybGRBcGkucHJvdG90eXBlLmFkZEJvZHkgPSBmdW5jdGlvbiAodHlwZSwgY29uZmlnKSB7XG4gICAgdmFyIGN0b3IgPSBib2R5VHlwZXNbdHlwZV07XG4gICAgdmFyIHBsYXllclNoaXAgPSBmYWxzZTtcbiAgICBpZiAoIWN0b3IpIHtcbiAgICAgICAgdGhpcy5sb2coJ1Vua25vd24gYm9keSB0eXBlOicsIHR5cGUpO1xuICAgICAgICB0aGlzLmxvZyhjb25maWcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0eXBlID09PSAnU2hpcCcgJiYgY29uZmlnLnByb3BlcnRpZXMucGxheWVyaWQgPT09IHRoaXMucGxheWVyLmlkKSB7XG4gICAgICAgIGNvbmZpZy50YWcgPSB0aGlzLnBsYXllci51c2VybmFtZTtcbiAgICAgICAgLy8gT25seSB0aGUgcGxheWVyJ3Mgb3duIHNoaXAgaXMgdHJlYXRlZCBhcyBkeW5hbWljIGluIHRoZSBsb2NhbCBwaHlzaWNzIHNpbVxuICAgICAgICBjb25maWcubWFzcyA9IHRoaXMuY29uZmlnLnBoeXNpY3NQcm9wZXJ0aWVzLlNoaXAubWFzcztcbiAgICAgICAgcGxheWVyU2hpcCA9IHRydWU7XG4gICAgfVxuICAgIHZhciBib2R5ID0gbmV3IGN0b3IodGhpcy5nYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5nYW1lLmFkZC5leGlzdGluZyhib2R5KTtcbiAgICB0aGlzLmdhbWUucGxheWZpZWxkLmFkZChib2R5KTtcbiAgICBpZiAocGxheWVyU2hpcCkge1xuICAgICAgICB0aGlzLmdhbWUuY2FtZXJhLmZvbGxvdyhib2R5KTtcbiAgICAgICAgdGhpcy5nYW1lLnBsYXllclNoaXAgPSBib2R5O1xuICAgIH1cbiAgICByZXR1cm4gYm9keTtcbn07XG5cbldvcmxkQXBpLnByb3RvdHlwZS5yZW1vdmVCb2R5ID0gZnVuY3Rpb24gKHNwcml0ZSkge1xuICAgIHNwcml0ZS5raWxsKCk7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MucDIucmVtb3ZlQm9keShzcHJpdGUuYm9keSk7XG59O1xuXG5Xb3JsZEFwaS5wcm90b3R5cGUuY29uZmlndXJlID0gZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcbiAgICBmb3IgKHZhciBrIGluIHRoaXMudXBkYXRlUHJvcGVydGllcykge1xuICAgICAgICB0aGlzW2tdID0gcHJvcGVydGllc1trXTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkQXBpO1xuIiwiLyoqIGNsaWVudC5qc1xuICpcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIFN0YXJjb2RlciBnYW1lIGNsaWVudFxuICpcbiAqIEB0eXBlIHtTdGFyY29kZXJ8ZXhwb3J0c31cbiAqL1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG5cbmxvY2FsU3RvcmFnZS5kZWJ1ZyA9ICcnO1xuXG52YXIgc3RhcmNvZGVyID0gbmV3IFN0YXJjb2RlcigpO1xuc3RhcmNvZGVyLnN0YXJ0KCk7IiwiLyoqXG4gKiBQYXRoLmpzXG4gKlxuICogVmVjdG9yIHBhdGhzIHNoYXJlZCBieSBtdWx0aXBsZSBlbGVtZW50c1xuICovXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMub2N0YWdvbiA9IFtcbiAgICBbMiwxXSxcbiAgICBbMSwyXSxcbiAgICBbLTEsMl0sXG4gICAgWy0yLDFdLFxuICAgIFstMiwtMV0sXG4gICAgWy0xLC0yXSxcbiAgICBbMSwtMl0sXG4gICAgWzIsLTFdXG5dO1xuXG5leHBvcnRzLmQyY3Jvc3MgPSBbXG4gICAgWy0xLC0yXSxcbiAgICBbLTEsMl0sXG4gICAgWzIsLTFdLFxuICAgIFstMiwtMV0sXG4gICAgWzEsMl0sXG4gICAgWzEsLTJdLFxuICAgIFstMiwxXSxcbiAgICBbMiwxXVxuXTsiLCIvKipcbiAqIFVwZGF0ZVByb3BlcnRpZXMuanNcbiAqXG4gKiBDbGllbnQvc2VydmVyIHN5bmNhYmxlIHByb3BlcnRpZXMgZm9yIGdhbWUgb2JqZWN0c1xuICovXG5cbnZhciBTaGlwID0gZnVuY3Rpb24gKCkge307XG5TaGlwLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lV2lkdGgnLCAnbGluZUNvbG9yJywgJ2ZpbGxDb2xvcicsICdmaWxsQWxwaGEnLFxuICAgICd2ZWN0b3JTY2FsZScsICdzaGFwZScsICdzaGFwZUNsb3NlZCcsICdwbGF5ZXJpZCddO1xuXG52YXIgQXN0ZXJvaWQgPSBmdW5jdGlvbiAoKSB7fTtcbkFzdGVyb2lkLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWyd2ZWN0b3JTY2FsZSddO1xuXG52YXIgQ3J5c3RhbCA9IGZ1bmN0aW9uICgpIHt9O1xuQ3J5c3RhbC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsndmVjdG9yU2NhbGUnXTtcblxudmFyIEdlbmVyaWNPcmIgPSBmdW5jdGlvbiAoKSB7fTtcbkdlbmVyaWNPcmIucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVDb2xvcicsICd2ZWN0b3JTY2FsZSddO1xuXG5leHBvcnRzLlNoaXAgPSBTaGlwO1xuZXhwb3J0cy5Bc3Rlcm9pZCA9IEFzdGVyb2lkO1xuZXhwb3J0cy5DcnlzdGFsID0gQ3J5c3RhbDtcbmV4cG9ydHMuR2VuZXJpY09yYiA9IEdlbmVyaWNPcmI7XG5cblxuIiwiLyoqXG4gKiBBc3Rlcm9pZC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuQXN0ZXJvaWQ7XG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcblxudmFyIEFzdGVyb2lkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xuICAgIC8vdGhpcy5ib2R5LmRhbXBpbmcgPSAwO1xufTtcblxuQXN0ZXJvaWQuYWRkID0gZnVuY3Rpb24gKGdhbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgYSA9IG5ldyBBc3Rlcm9pZChnYW1lLCBvcHRpb25zKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gYTtcbn07XG5cbkFzdGVyb2lkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBc3Rlcm9pZDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEFzdGVyb2lkLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShBc3Rlcm9pZC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuQXN0ZXJvaWQucHJvdG90eXBlLmxpbmVDb2xvciA9ICcjZmYwMGZmJztcbkFzdGVyb2lkLnByb3RvdHlwZS5maWxsQ29sb3IgPSAnIzAwZmYwMCc7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuc2hhcGVDbG9zZWQgPSB0cnVlO1xuQXN0ZXJvaWQucHJvdG90eXBlLmxpbmVXaWR0aCA9IDE7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuZmlsbEFscGhhID0gMC4yNTtcbkFzdGVyb2lkLnByb3RvdHlwZS5zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5cbm1vZHVsZS5leHBvcnRzID0gQXN0ZXJvaWQ7XG4vL1N0YXJjb2Rlci5Bc3Rlcm9pZCA9IEFzdGVyb2lkO1xuIiwiLyoqXG4gKiBCdWxsZXQuanNcbiAqXG4gKiBDbGllbnQgc2lkZSBpbXBsZW1lbnRhdGlvbiBvZiBzaW1wbGUgcHJvamVjdGlsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gcmVxdWlyZSgnLi9TaW1wbGVQYXJ0aWNsZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhbGwodGhpcywgZ2FtZSwgJ2J1bGxldCcpO1xuICAgIHRoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG59O1xuXG5CdWxsZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTaW1wbGVQYXJ0aWNsZS5wcm90b3R5cGUpO1xuQnVsbGV0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJ1bGxldDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEJ1bGxldC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0OyIsIi8qKlxuICogQ3J5c3RhbC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuQ3J5c3RhbDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgQ3J5c3RhbCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkNyeXN0YWwuYWRkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIHZhciBhID0gbmV3IENyeXN0YWwoZ2FtZSwgY29uZmlnKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gYTtcbn07XG5cbkNyeXN0YWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcbkNyeXN0YWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ3J5c3RhbDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKENyeXN0YWwucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKENyeXN0YWwucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkNyeXN0YWwucHJvdG90eXBlLmxpbmVDb2xvciA9ICcjMDBmZmZmJztcbkNyeXN0YWwucHJvdG90eXBlLmZpbGxDb2xvciA9ICcjMDAwMDAwJztcbkNyeXN0YWwucHJvdG90eXBlLnNoYXBlQ2xvc2VkID0gdHJ1ZTtcbkNyeXN0YWwucHJvdG90eXBlLmxpbmVXaWR0aCA9IDE7XG5DcnlzdGFsLnByb3RvdHlwZS5maWxsQWxwaGEgPSAwLjA7XG5DcnlzdGFsLnByb3RvdHlwZS5zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5DcnlzdGFsLnByb3RvdHlwZS5nZW9tZXRyeSA9IFtcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuZDJjcm9zc31cbl07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDcnlzdGFsO1xuIiwiLyoqXG4gKiBHZW5lcmljT3JiLmpzXG4gKlxuICogQnVpbGRpbmcgYmxvY2tcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkdlbmVyaWNPcmI7XG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcblxudmFyIEdlbmVyaWNPcmIgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG59O1xuXG5HZW5lcmljT3JiLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICB2YXIgYSA9IG5ldyBHZW5lcmljT3JiKGdhbWUsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5HZW5lcmljT3JiLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyaWNPcmI7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShHZW5lcmljT3JiLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShHZW5lcmljT3JiLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5HZW5lcmljT3JiLnByb3RvdHlwZS5saW5lQ29sb3IgPSAnI2ZmMDAwMCc7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5maWxsQ29sb3IgPSAnIzAwMDAwMCc7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5zaGFwZUNsb3NlZCA9IHRydWU7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5saW5lV2lkdGggPSAxO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuZmlsbEFscGhhID0gMC4wO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuXG5HZW5lcmljT3JiLnByb3RvdHlwZS5nZW9tZXRyeSA9IFtcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuZDJjcm9zc31cbl07XG5cbm1vZHVsZS5leHBvcnRzID0gR2VuZXJpY09yYjtcbiIsIi8qKlxuICogU2hpcC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuU2hpcDtcbi8vdmFyIEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lLmpzJyk7XG4vL3ZhciBXZWFwb25zID0gcmVxdWlyZSgnLi9XZWFwb25zLmpzJyk7XG5cbnZhciBTaGlwID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xuXG4gICAgaWYgKGNvbmZpZy5tYXNzKSB7XG4gICAgICAgIHRoaXMuYm9keS5tYXNzID0gY29uZmlnLm1hc3M7XG4gICAgfVxuICAgIC8vdGhpcy5lbmdpbmUgPSBFbmdpbmUuYWRkKGdhbWUsICd0aHJ1c3QnLCA1MDApO1xuICAgIC8vdGhpcy5hZGRDaGlsZCh0aGlzLmVuZ2luZSk7XG4gICAgLy90aGlzLndlYXBvbnMgPSBXZWFwb25zLmFkZChnYW1lLCAnYnVsbGV0JywgMTIpO1xuICAgIC8vdGhpcy53ZWFwb25zLnNoaXAgPSB0aGlzO1xuICAgIC8vdGhpcy5hZGRDaGlsZCh0aGlzLndlYXBvbnMpO1xuICAgIHRoaXMudGFnVGV4dCA9IGdhbWUuYWRkLnRleHQoMCwgdGhpcy5ncmFwaGljcy5oZWlnaHQvMiArIDEsXG4gICAgICAgIGNvbmZpZy50YWcsIHtmb250OiAnYm9sZCAxOHB4IEFyaWFsJywgZmlsbDogdGhpcy5saW5lQ29sb3IgfHwgJyNmZmZmZmYnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICB0aGlzLnRhZ1RleHQuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLnRhZ1RleHQpO1xuICAgIHRoaXMubG9jYWxTdGF0ZSA9IHtcbiAgICAgICAgdGhydXN0OiAnb2ZmJ1xuICAgIH1cbn07XG5cblNoaXAuYWRkID0gZnVuY3Rpb24gKGdhbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgcyA9IG5ldyBTaGlwKGdhbWUsIG9wdGlvbnMpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHMpO1xuICAgIHJldHVybiBzO1xufTtcblxuU2hpcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuU2hpcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTaGlwO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoU2hpcC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoU2hpcC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuLy9TaGlwLnByb3RvdHlwZS5zZXRMaW5lU3R5bGUgPSBmdW5jdGlvbiAoY29sb3IsIGxpbmVXaWR0aCkge1xuLy8gICAgU3RhcmNvZGVyLlZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0TGluZVN0eWxlLmNhbGwodGhpcywgY29sb3IsIGxpbmVXaWR0aCk7XG4vLyAgICB0aGlzLnRhZ1RleHQuc2V0U3R5bGUoe2ZpbGw6IGNvbG9yfSk7XG4vL307XG5cbi8vU2hpcC5wcm90b3R5cGUuc2hhcGUgPSBbXG4vLyAgICBbLTEsLTFdLFxuLy8gICAgWy0wLjUsMF0sXG4vLyAgICBbLTEsMV0sXG4vLyAgICBbMCwwLjVdLFxuLy8gICAgWzEsMV0sXG4vLyAgICBbMC41LDBdLFxuLy8gICAgWzEsLTFdLFxuLy8gICAgWzAsLTAuNV0sXG4vLyAgICBbLTEsLTFdXG4vL107XG5TaGlwLnByb3RvdHlwZS5saW5lV2lkdGggPSA2O1xuXG5TaGlwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgc3dpdGNoICh0aGlzLmxvY2FsU3RhdGUudGhydXN0KSB7XG4gICAgICAgIGNhc2UgJ3N0YXJ0aW5nJzpcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnBsYXkoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RhcnRPbih0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdGF0ZS50aHJ1c3QgPSAnb24nO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NodXRkb3duJzpcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RvcE9uKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0YXRlLnRocnVzdCA9ICdvZmYnO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcDtcbi8vU3RhcmNvZGVyLlNoaXAgPSBTaGlwO1xuIiwiLyoqXG4gKiBTaW1wbGVQYXJ0aWNsZS5qc1xuICpcbiAqIEJhc2ljIGJpdG1hcCBwYXJ0aWNsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8vdmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uLy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gZnVuY3Rpb24gKGdhbWUsIGtleSkge1xuICAgIHZhciB0ZXh0dXJlID0gU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZVtrZXldO1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCAwLCAwLCB0ZXh0dXJlKTtcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHRoaXMsIGZhbHNlLCBmYWxzZSk7XG4gICAgdGhpcy5ib2R5LmNsZWFyU2hhcGVzKCk7XG4gICAgdmFyIHNoYXBlID0gdGhpcy5ib2R5LmFkZFBhcnRpY2xlKCk7XG4gICAgc2hhcGUuc2Vuc29yID0gdHJ1ZTtcbiAgICAvL3RoaXMua2lsbCgpO1xufTtcblxuU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZSA9IHt9O1xuXG5TaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUgPSBmdW5jdGlvbiAoZ2FtZSwga2V5LCBjb2xvciwgc2l6ZSkge1xuICAgIHZhciB0ZXh0dXJlID0gZ2FtZS5tYWtlLmJpdG1hcERhdGEoc2l6ZSwgc2l6ZSk7XG4gICAgdGV4dHVyZS5jdHguZmlsbFN0eWxlID0gY29sb3I7XG4gICAgdGV4dHVyZS5jdHguZmlsbFJlY3QoMCwgMCwgc2l6ZSwgc2l6ZSk7XG4gICAgU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZVtrZXldID0gdGV4dHVyZTtcbn07XG5cblNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuU2ltcGxlUGFydGljbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2ltcGxlUGFydGljbGU7XG5cbi8vU2ltcGxlUGFydGljbGUuRW1pdHRlciA9IGZ1bmN0aW9uIChnYW1lLCBrZXksIG4pIHtcbi8vICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUpO1xuLy8gICAgbiA9IG4gfHwgNTA7XG4vLyAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykge1xuLy8gICAgICAgIHRoaXMuYWRkKG5ldyBTaW1wbGVQYXJ0aWNsZShnYW1lLCBrZXkpKTtcbi8vICAgIH1cbi8vICAgIHRoaXMuX29uID0gZmFsc2U7XG4vL307XG4vL1xuLy9TaW1wbGVQYXJ0aWNsZS5FbWl0dGVyLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBrZXksIG4pIHtcbi8vICAgIHZhciBlbWl0dGVyID0gbmV3IFNpbXBsZVBhcnRpY2xlLkVtaXR0ZXIoZ2FtZSwga2V5LCBuKTtcbi8vICAgIGdhbWUuYWRkLmV4aXN0aW5nKGVtaXR0ZXIpO1xuLy8gICAgcmV0dXJuIGVtaXR0ZXI7XG4vL307XG4vL1xuLy9TaW1wbGVQYXJ0aWNsZS5FbWl0dGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG4vL1NpbXBsZVBhcnRpY2xlLkVtaXR0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2ltcGxlUGFydGljbGUuRW1pdHRlcjtcbi8vXG4vL1NpbXBsZVBhcnRpY2xlLkVtaXR0ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbi8vICAgIC8vIEZJWE1FOiBUZXN0aW5nIGhhY2tcbi8vICAgIGlmICh0aGlzLl9vbikge1xuLy8gICAgICAgIGZvciAodmFyIGkgPSAwOyBpPDIwOyBpKyspIHtcbi8vICAgICAgICAgICAgdmFyIHBhcnRpY2xlID0gdGhpcy5nZXRGaXJzdERlYWQoKTtcbi8vICAgICAgICAgICAgaWYgKCFwYXJ0aWNsZSkge1xuLy8gICAgICAgICAgICAgICAgYnJlYWs7XG4vLyAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgcGFydGljbGUubGlmZXNwYW4gPSAyNTA7XG4vLyAgICAgICAgICAgIHBhcnRpY2xlLmFscGhhID0gMC41O1xuLy8gICAgICAgICAgICB2YXIgZCA9IHRoaXMuZ2FtZS5ybmQuYmV0d2VlbigtNywgNyk7XG4vLyAgICAgICAgICAgIHBhcnRpY2xlLnJlc2V0KGQsIDEwKTtcbi8vICAgICAgICAgICAgcGFydGljbGUuYm9keS52ZWxvY2l0eS55ID0gODA7XG4vLyAgICAgICAgICAgIHBhcnRpY2xlLmJvZHkudmVsb2NpdHkueCA9IC0zKmQ7XG4vLyAgICAgICAgfVxuLy8gICAgfVxuLy99O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZVBhcnRpY2xlO1xuLy9TdGFyY29kZXIuU2ltcGxlUGFydGljbGUgPSBTaW1wbGVQYXJ0aWNsZTsiLCIvKipcbiAqIFN5bmNCb2R5SW50ZXJmYWNlLmpzXG4gKlxuICogU2hhcmVkIG1ldGhvZHMgZm9yIFZlY3RvclNwcml0ZXMsIFBhcnRpY2xlcywgZXRjLlxuICovXG5cbnZhciBTeW5jQm9keUludGVyZmFjZSA9IGZ1bmN0aW9uICgpIHt9O1xuXG4vKipcbiAqIFNldCBsb2NhdGlvbiBhbmQgYW5nbGUgb2YgYSBwaHlzaWNzIG9iamVjdC4gVmFsdWUgYXJlIGdpdmVuIGluIHdvcmxkIGNvb3JkaW5hdGVzLCBub3QgcGl4ZWxzXG4gKlxuICogQHBhcmFtIHgge251bWJlcn1cbiAqIEBwYXJhbSB5IHtudW1iZXJ9XG4gKiBAcGFyYW0gYSB7bnVtYmVyfVxuICovXG5TeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUuc2V0UG9zQW5nbGUgPSBmdW5jdGlvbiAoeCwgeSwgYSkge1xuICAgIHRoaXMuYm9keS5kYXRhLnBvc2l0aW9uWzBdID0gLSh4IHx8IDApO1xuICAgIHRoaXMuYm9keS5kYXRhLnBvc2l0aW9uWzFdID0gLSh5IHx8IDApO1xuICAgIHRoaXMuYm9keS5kYXRhLmFuZ2xlID0gYSB8fCAwO1xufTtcblxuU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlLmNvbmZpZyA9IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnVwZGF0ZVByb3BlcnRpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBrID0gdGhpcy51cGRhdGVQcm9wZXJ0aWVzW2ldO1xuICAgICAgICBpZiAocHJvcGVydGllc1trXSkge1xuICAgICAgICAgICAgdGhpc1trXSA9IHByb3BlcnRpZXNba107ICAgICAgICAvLyBGSVhNRT8gVmlydHVhbGl6ZSBzb21laG93XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bmNCb2R5SW50ZXJmYWNlOyIsIi8qKlxuICogVGhydXN0R2VuZXJhdG9yLmpzXG4gKlxuICogR3JvdXAgcHJvdmlkaW5nIEFQSSwgbGF5ZXJpbmcsIGFuZCBwb29saW5nIGZvciB0aHJ1c3QgcGFydGljbGUgZWZmZWN0c1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcblxudmFyIF90ZXh0dXJlS2V5ID0gJ3RocnVzdCc7XG5cbi8vIFBvb2xpbmcgcGFyYW1ldGVyc1xudmFyIF9taW5Qb29sU2l6ZSA9IDMwMDtcbnZhciBfbWluRnJlZVBhcnRpY2xlcyA9IDIwO1xudmFyIF9zb2Z0UG9vbExpbWl0ID0gMjAwO1xudmFyIF9oYXJkUG9vbExpbWl0ID0gNTAwO1xuXG4vLyBCZWhhdmlvciBvZiBlbWl0dGVyXG52YXIgX3BhcnRpY2xlc1BlckJ1cnN0ID0gNTtcbnZhciBfcGFydGljbGVUVEwgPSAxNTA7XG52YXIgX3BhcnRpY2xlQmFzZVNwZWVkID0gNTtcbnZhciBfY29uZUxlbmd0aCA9IDE7XG52YXIgX2NvbmVXaWR0aFJhdGlvID0gMC4yO1xudmFyIF9lbmdpbmVPZmZzZXQgPSAtMjA7XG5cbnZhciBUaHJ1c3RHZW5lcmF0b3IgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUpO1xuXG4gICAgdGhpcy50aHJ1c3RpbmdTaGlwcyA9IHt9O1xuXG4gICAgLy8gUHJlZ2VuZXJhdGUgYSBiYXRjaCBvZiBwYXJ0aWNsZXNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9taW5Qb29sU2l6ZTsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0aWNsZSA9IHRoaXMuYWRkKG5ldyBTaW1wbGVQYXJ0aWNsZShnYW1lLCBfdGV4dHVyZUtleSkpO1xuICAgICAgICBwYXJ0aWNsZS5hbHBoYSA9IDAuNTtcbiAgICAgICAgcGFydGljbGUucm90YXRpb24gPSBNYXRoLlBJLzQ7XG4gICAgICAgIHBhcnRpY2xlLmtpbGwoKTtcbiAgICB9XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUaHJ1c3RHZW5lcmF0b3I7XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUuc3RhcnRPbiA9IGZ1bmN0aW9uIChzaGlwKSB7XG4gICAgdGhpcy50aHJ1c3RpbmdTaGlwc1tzaGlwLmlkXSA9IHNoaXA7XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLnN0b3BPbiA9IGZ1bmN0aW9uIChzaGlwKSB7XG4gICAgZGVsZXRlIHRoaXMudGhydXN0aW5nU2hpcHNbc2hpcC5pZF07XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMudGhydXN0aW5nU2hpcHMpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHNoaXAgPSB0aGlzLnRocnVzdGluZ1NoaXBzW2tleXNbaV1dO1xuICAgICAgICB2YXIgdyA9IHNoaXAud2lkdGg7XG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihzaGlwLnJvdGF0aW9uKTtcbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKHNoaXAucm90YXRpb24pO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IF9wYXJ0aWNsZXNQZXJCdXJzdDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgcGFydGljbGUgPSB0aGlzLmdldEZpcnN0RGVhZCgpO1xuICAgICAgICAgICAgaWYgKCFwYXJ0aWNsZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3QgZW5vdWdoIHRocnVzdCBwYXJ0aWNsZXMgaW4gcG9vbCcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGQgPSB0aGlzLmdhbWUucm5kLnJlYWxJblJhbmdlKC1fY29uZVdpZHRoUmF0aW8qdywgX2NvbmVXaWR0aFJhdGlvKncpO1xuICAgICAgICAgICAgdmFyIHggPSBzaGlwLnggKyBkKmNvcyArIF9lbmdpbmVPZmZzZXQqc2luO1xuICAgICAgICAgICAgdmFyIHkgPSBzaGlwLnkgKyBkKnNpbiAtIF9lbmdpbmVPZmZzZXQqY29zO1xuICAgICAgICAgICAgcGFydGljbGUubGlmZXNwYW4gPSBfcGFydGljbGVUVEw7XG4gICAgICAgICAgICBwYXJ0aWNsZS5yZXNldCh4LCB5KTtcbiAgICAgICAgICAgIHBhcnRpY2xlLmJvZHkudmVsb2NpdHkueCA9IF9wYXJ0aWNsZUJhc2VTcGVlZCooX2NvbmVMZW5ndGgqc2luIC0gZCpjb3MpO1xuICAgICAgICAgICAgcGFydGljbGUuYm9keS52ZWxvY2l0eS55ID0gX3BhcnRpY2xlQmFzZVNwZWVkKigtX2NvbmVMZW5ndGgqY29zIC0gZCpzaW4pO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuVGhydXN0R2VuZXJhdG9yLnRleHR1cmVLZXkgPSBfdGV4dHVyZUtleTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaHJ1c3RHZW5lcmF0b3I7IiwiLyoqXG4gKiBTcHJpdGUgd2l0aCBhdHRhY2hlZCBHcmFwaGljcyBvYmplY3QgZm9yIHZlY3Rvci1saWtlIGdyYXBoaWNzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIC8vdGhpcy5zaGFwZSA9IGNvbmZpZy5wcm9wZXJ0aWVzLnNoYXBlIHx8IHRoaXMuc2hhcGU7XG4gICAgLy90aGlzLnNoYXBlQ2xvc2VkID0gY29uZmlnLnByb3BlcnRpZXMuc2hhcGUgfHwgdGhpcy5zaGFwZUNsb3NlZDtcbiAgICAvL3RoaXMubGluZVdpZHRoID0gY29uZmlnLnByb3BlcnRpZXMubGluZVdpZHRoIHx8IHRoaXMubGluZVdpZHRoO1xuICAgIC8vdGhpcy5saW5lQ29sb3IgPSBjb25maWcucHJvcGVydGllcy5saW5lQ29sb3IgfHwgdGhpcy5saW5lQ29sb3I7XG4gICAgLy90aGlzLmZpbGxDb2xvciA9IGNvbmZpZy5wcm9wZXJ0aWVzLmZpbGxDb2xvciB8fCB0aGlzLmZpbGxDb2xvcjtcbiAgICAvL3RoaXMuZmlsbEFscGhhID0gY29uZmlnLnByb3BlcnRpZXMuZmlsbEFscGhhIHx8IHRoaXMuZmlsbEFscGhhO1xuICAgIC8vdGhpcy5nZW9tZXRyeSA9IGNvbmZpZy5wcm9wZXJ0aWVzLmdlb21ldHJ5IHx8IHRoaXMuZ2VvbWV0cnk7XG4gICAgLy90aGlzLnZlY3RvclNjYWxlID0gY29uZmlnLnByb3BlcnRpZXMudmVjdG9yU2NhbGUgfHwgdGhpcy52ZWN0b3JTY2FsZTtcblxuICAgIHRoaXMuZ3JhcGhpY3MgPSBnYW1lLm1ha2UuZ3JhcGhpY3MoKTtcbiAgICB0aGlzLnRleHR1cmUgPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICB0aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgdGhpcy5taW5pc3ByaXRlID0gdGhpcy5nYW1lLm1pbmltYXAuY3JlYXRlKCk7XG4gICAgdGhpcy5taW5pc3ByaXRlLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG5cbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHRoaXMsIGZhbHNlLCBmYWxzZSk7XG4gICAgdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbiAgICB0aGlzLmNvbmZpZyhjb25maWcucHJvcGVydGllcyk7XG4gICAgdGhpcy51cGRhdGVBcHBlYXJhbmNlKCk7XG4gICAgdGhpcy51cGRhdGVCb2R5KCk7XG4gICAgdGhpcy5ib2R5Lm1hc3MgPSAwO1xufTtcblxuVmVjdG9yU3ByaXRlLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCB4LCB5KSB7XG4gICAgdmFyIHYgPSBuZXcgVmVjdG9yU3ByaXRlKGdhbWUsIHgsIHkpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHYpO1xuICAgIHJldHVybiB2O1xufVxuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVmVjdG9yU3ByaXRlO1xuXG4vLyBEZWZhdWx0IG9jdGFnb25cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2hhcGUgPSBbXG4gICAgWzIsMV0sXG4gICAgWzEsMl0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwxXSxcbiAgICBbLTIsLTFdLFxuICAgIFstMSwtMl0sXG4gICAgWzEsLTJdLFxuICAgIFsyLC0xXVxuXTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2hhcGVDbG9zZWQgPSB0cnVlO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5saW5lQ29sb3IgPSAnI2ZmZmZmZic7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmxpbmVXaWR0aCA9IDE7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmZpbGxDb2xvciA9IG51bGw7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmZpbGxBbHBoYSA9IDAuMjU7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnZlY3RvclNjYWxlID0gMTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5waHlzaWNzQm9keVR5cGUgPSAnY2lyY2xlJztcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5zZXRTaGFwZSA9IGZ1bmN0aW9uIChzaGFwZSkge1xuICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcbiAgICB0aGlzLnVwZGF0ZUFwcGVhcmFuY2UoKTtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0TGluZVN0eWxlID0gZnVuY3Rpb24gKGNvbG9yLCBsaW5lV2lkdGgpIHtcbiAgICBpZiAoIWxpbmVXaWR0aCB8fCBsaW5lV2lkdGggPCAxKSB7XG4gICAgICAgIGxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoIHx8IDE7XG4gICAgfVxuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICB0aGlzLmxpbmVXaWR0aCA9IGxpbmVXaWR0aDtcbiAgICB0aGlzLnVwZGF0ZUFwcGVhcmFuY2UoKTtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlQXBwZWFyYW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBEcmF3IGZ1bGwgc2l6ZWRcbiAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmRyYXdQcm9jZWR1cmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuZHJhd1Byb2NlZHVyZSgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zaGFwZSkge1xuICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICB9XG4gICAgdGhpcy50ZXh0dXJlLnJlc2l6ZSh0aGlzLmdyYXBoaWNzLndpZHRoLCB0aGlzLmdyYXBoaWNzLmhlaWdodCwgdHJ1ZSk7XG4gICAgdGhpcy50ZXh0dXJlLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIHRoaXMuZ3JhcGhpY3Mud2lkdGgvMiwgdGhpcy5ncmFwaGljcy5oZWlnaHQvMiwgdHJ1ZSk7XG4gICAgdGhpcy5zZXRUZXh0dXJlKHRoaXMudGV4dHVyZSk7XG4gICAgLy8gRHJhdyBzbWFsbCBmb3IgbWluaW1hcFxuICAgIHZhciBtYXBTY2FsZSA9IHRoaXMuZ2FtZS5taW5pbWFwLm1hcFNjYWxlO1xuICAgIHRoaXMuZ3JhcGhpY3MuY2xlYXIoKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuZHJhd1Byb2NlZHVyZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5kcmF3UHJvY2VkdXJlKG1hcFNjYWxlKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUpIHtcbiAgICAgICAgdGhpcy5kcmF3KG1hcFNjYWxlKTtcbiAgICB9XG4gICAgdGhpcy5taW5pdGV4dHVyZS5yZXNpemUodGhpcy5ncmFwaGljcy53aWR0aCwgdGhpcy5ncmFwaGljcy5oZWlnaHQsIHRydWUpO1xuICAgIHRoaXMubWluaXRleHR1cmUucmVuZGVyWFkodGhpcy5ncmFwaGljcywgdGhpcy5ncmFwaGljcy53aWR0aC8yLCB0aGlzLmdyYXBoaWNzLmhlaWdodC8yLCB0cnVlKTtcbiAgICB0aGlzLm1pbmlzcHJpdGUuc2V0VGV4dHVyZSh0aGlzLm1pbml0ZXh0dXJlKTtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlQm9keSA9IGZ1bmN0aW9uICgpIHtcbiAgICBzd2l0Y2ggKHRoaXMucGh5c2ljc0JvZHlUeXBlKSB7XG4gICAgICAgIGNhc2UgXCJjaXJjbGVcIjpcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5jaXJjbGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHIgPSB0aGlzLmdyYXBoaWNzLmdldEJvdW5kcygpO1xuICAgICAgICAgICAgICAgIHZhciByYWRpdXMgPSBNYXRoLnJvdW5kKE1hdGguc3FydChyLndpZHRoKiByLmhlaWdodCkvMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJhZGl1cyA9IHRoaXMucmFkaXVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ib2R5LnNldENpcmNsZShyYWRpdXMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIFRPRE86IE1vcmUgc2hhcGVzXG4gICAgfVxufTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlKSB7XG4gICAgcmVuZGVyU2NhbGUgPSByZW5kZXJTY2FsZSB8fCAxO1xuICAgIC8vIERyYXcgc2ltcGxlIHNoYXBlLCBpZiBnaXZlblxuICAgIGlmICh0aGlzLnNoYXBlKSB7XG4gICAgICAgIHZhciBsaW5lQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpO1xuICAgICAgICBpZiAocmVuZGVyU2NhbGUgPT09IDEpIHtcbiAgICAgICAgICAgIHZhciBsaW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpbmVXaWR0aCA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZW5kZXJTY2FsZSA9PT0gMSkgJiYgdGhpcy5maWxsQ29sb3IpIHsgICAgICAgIC8vIE9ubHkgZmlsbCBmdWxsIHNpemVkXG4gICAgICAgICAgICB2YXIgZmlsbENvbG9yID0gUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMuZmlsbENvbG9yKTtcbiAgICAgICAgICAgIHZhciBmaWxsQWxwaGEgPSB0aGlzLmZpbGxBbHBoYSB8fCAxO1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5iZWdpbkZpbGwoZmlsbENvbG9yLCBmaWxsQWxwaGEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKGxpbmVXaWR0aCwgbGluZUNvbG9yLCAxKTtcbiAgICAgICAgdGhpcy5fZHJhd1BvbHlnb24odGhpcy5zaGFwZSwgdGhpcy5zaGFwZUNsb3NlZCwgcmVuZGVyU2NhbGUpO1xuICAgICAgICBpZiAoKHJlbmRlclNjYWxlID09PSAxKSAmJiB0aGlzLmZpbGxDb2xvcikge1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5lbmRGaWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRHJhdyBnZW9tZXRyeSBzcGVjLCBpZiBnaXZlbiwgYnV0IG9ubHkgZm9yIHRoZSBmdWxsIHNpemVkIHNwcml0ZVxuICAgIGlmICgocmVuZGVyU2NhbGUgPT09IDEpICYmIHRoaXMuZ2VvbWV0cnkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmdlb21ldHJ5Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdmFyIGcgPSB0aGlzLmdlb21ldHJ5W2ldO1xuICAgICAgICAgICAgc3dpdGNoIChnLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwicG9seVwiOlxuICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRTogZGVmYXVsdHMgYW5kIHN0dWZmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYXdQb2x5Z29uKGcucG9pbnRzLCBnLmNsb3NlZCwgcmVuZGVyU2NhbGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2RyYXdQb2x5Z29uID0gZnVuY3Rpb24gKHBvaW50cywgY2xvc2VkLCByZW5kZXJTY2FsZSkge1xuICAgIHZhciBzYyA9IHRoaXMuZ2FtZS5waHlzaWNzLnAyLm1weGkodGhpcy52ZWN0b3JTY2FsZSkqcmVuZGVyU2NhbGU7XG4gICAgcG9pbnRzID0gcG9pbnRzLnNsaWNlKCk7XG4gICAgaWYgKGNsb3NlZCkge1xuICAgICAgICBwb2ludHMucHVzaChwb2ludHNbMF0pO1xuICAgIH1cbiAgICB0aGlzLmdyYXBoaWNzLm1vdmVUbyhwb2ludHNbMF1bMF0gKiBzYywgcG9pbnRzWzBdWzFdICogc2MpO1xuICAgIGZvciAodmFyIGkgPSAxLCBsID0gcG9pbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyhwb2ludHNbaV1bMF0gKiBzYywgcG9pbnRzW2ldWzFdICogc2MpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmVjdG9yU3ByaXRlO1xuLy9TdGFyY29kZXIuVmVjdG9yU3ByaXRlID0gVmVjdG9yU3ByaXRlOyIsIi8qKlxuICogQ29udHJvbHMuanNcbiAqXG4gKiBWaXJ0dWFsaXplIGFuZCBpbXBsZW1lbnQgcXVldWUgZm9yIGdhbWUgY29udHJvbHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuY29uc29sZS5sb2coJ0NvbnRyb2xzJywgU3RhcmNvZGVyKTtcblxudmFyIENvbnRyb2xzID0gZnVuY3Rpb24gKGdhbWUsIHBhcmVudCkge1xuICAgIFBoYXNlci5QbHVnaW4uY2FsbCh0aGlzLCBnYW1lLCBwYXJlbnQpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuUGx1Z2luLnByb3RvdHlwZSk7XG5Db250cm9scy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb250cm9scztcblxuQ29udHJvbHMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAocXVldWUpIHtcbiAgICB0aGlzLnF1ZXVlID0gcXVldWU7XG4gICAgdGhpcy5jb250cm9scyA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG4gICAgdGhpcy5jb250cm9scy5maXJlID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuQik7XG59O1xuXG52YXIgc2VxID0gMDtcbnZhciB1cCA9IGZhbHNlLCBkb3duID0gZmFsc2UsIGxlZnQgPSBmYWxzZSwgcmlnaHQgPSBmYWxzZSwgZmlyZSA9IGZhbHNlO1xuXG5Db250cm9scy5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdXAgPSBkb3duID0gbGVmdCA9IHJpZ2h0ID0gZmFsc2U7XG4gICAgdGhpcy5xdWV1ZS5sZW5ndGggPSAwO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLnByZVVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPOiBTdXBwb3J0IG90aGVyIGludGVyYWN0aW9ucy9tZXRob2RzXG4gICAgdmFyIGNvbnRyb2xzID0gdGhpcy5jb250cm9scztcbiAgICBpZiAoY29udHJvbHMudXAuaXNEb3duICYmICF1cCkge1xuICAgICAgICB1cCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3VwX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFjb250cm9scy51cC5pc0Rvd24gJiYgdXApIHtcbiAgICAgICAgdXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndXBfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKGNvbnRyb2xzLmRvd24uaXNEb3duICYmICFkb3duKSB7XG4gICAgICAgIGRvd24gPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdkb3duX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFjb250cm9scy5kb3duLmlzRG93biAmJiBkb3duKSB7XG4gICAgICAgIGRvd24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZG93bl9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoY29udHJvbHMucmlnaHQuaXNEb3duICYmICFyaWdodCkge1xuICAgICAgICByaWdodCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3JpZ2h0X3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFjb250cm9scy5yaWdodC5pc0Rvd24gJiYgcmlnaHQpIHtcbiAgICAgICAgcmlnaHQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAncmlnaHRfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKGNvbnRyb2xzLmxlZnQuaXNEb3duICYmICFsZWZ0KSB7XG4gICAgICAgIGxlZnQgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdsZWZ0X3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFjb250cm9scy5sZWZ0LmlzRG93biAmJiBsZWZ0KSB7XG4gICAgICAgIGxlZnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnbGVmdF9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoY29udHJvbHMuZmlyZS5pc0Rvd24gJiYgIWZpcmUpIHtcbiAgICAgICAgZmlyZSA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2ZpcmVfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIWNvbnRyb2xzLmZpcmUuaXNEb3duICYmIGZpcmUpIHtcbiAgICAgICAgZmlyZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdmaXJlX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxufTtcblxuQ29udHJvbHMucHJvdG90eXBlLnByb2Nlc3NRdWV1ZSA9IGZ1bmN0aW9uIChjYiwgY2xlYXIpIHtcbiAgICB2YXIgcXVldWUgPSB0aGlzLnF1ZXVlO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcXVldWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBhY3Rpb24gPSBxdWV1ZVtpXTtcbiAgICAgICAgaWYgKGFjdGlvbi5leGVjdXRlZCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2IoYWN0aW9uKTtcbiAgICAgICAgYWN0aW9uLmV0aW1lID0gdGhpcy5nYW1lLnRpbWUubm93O1xuICAgICAgICBhY3Rpb24uZXhlY3V0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoY2xlYXIpIHtcbiAgICAgICAgcXVldWUubGVuZ3RoID0gMDtcbiAgICB9XG59O1xuXG5TdGFyY29kZXIuQ29udHJvbHMgPSBDb250cm9scztcbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbHM7IiwiLyoqXG4gKiBTeW5jQ2xpZW50LmpzXG4gKlxuICogU3luYyBwaHlzaWNzIG9iamVjdHMgd2l0aCBzZXJ2ZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xudmFyIFVQREFURV9RVUVVRV9MSU1JVCA9IDg7XG5cbnZhciBTeW5jQ2xpZW50ID0gZnVuY3Rpb24gKGdhbWUsIHBhcmVudCkge1xuICAgIFBoYXNlci5QbHVnaW4uY2FsbCh0aGlzLCBnYW1lLCBwYXJlbnQpO1xufTtcblxuU3luY0NsaWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5QbHVnaW4ucHJvdG90eXBlKTtcblN5bmNDbGllbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3luY0NsaWVudDtcblxuU3luY0NsaWVudC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChzb2NrZXQsIHF1ZXVlKSB7XG4gICAgLy8gVE9ETzogQ29weSBzb21lIGNvbmZpZyBvcHRpb25zXG4gICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XG4gICAgdGhpcy5jbWRRdWV1ZSA9IHF1ZXVlO1xuICAgIHRoaXMuZXh0YW50ID0ge307XG59O1xuXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHN0YXJjb2RlciA9IHRoaXMuZ2FtZS5zdGFyY29kZXI7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGxldGUgPSBmYWxzZTtcbiAgICAvLyBGSVhNRTogTmVlZCBtb3JlIHJvYnVzdCBoYW5kbGluZyBvZiBEQy9SQ1xuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmdhbWUucGF1c2VkID0gdHJ1ZTtcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbigncmVjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmdhbWUucGF1c2VkID0gZmFsc2U7XG4gICAgfSk7XG4gICAgLy8gTWVhc3VyZSBjbGllbnQtc2VydmVyIHRpbWUgZGVsdGFcbiAgICB0aGlzLnNvY2tldC5vbigndGltZXN5bmMnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBzZWxmLl9sYXRlbmN5ID0gZGF0YSAtIHNlbGYuZ2FtZS50aW1lLm5vdztcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlYWxUaW1lID0gZGF0YS5yO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGRhdGEuYi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB1cGRhdGUgPSBkYXRhLmJbaV07XG4gICAgICAgICAgICB2YXIgaWQgPSB1cGRhdGUuaWQ7XG4gICAgICAgICAgICB2YXIgc3ByaXRlO1xuICAgICAgICAgICAgdXBkYXRlLnRpbWVzdGFtcCA9IHJlYWxUaW1lO1xuICAgICAgICAgICAgaWYgKHNwcml0ZSA9IHNlbGYuZXh0YW50W2lkXSkge1xuICAgICAgICAgICAgICAgIC8vIEV4aXN0aW5nIHNwcml0ZSAtIHByb2Nlc3MgdXBkYXRlXG4gICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlLnB1c2godXBkYXRlKTtcbiAgICAgICAgICAgICAgICBpZiAoc3ByaXRlLnVwZGF0ZVF1ZXVlLmxlbmd0aCA+IFVQREFURV9RVUVVRV9MSU1JVCkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUudXBkYXRlUXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIE5ldyBzcHJpdGUgLSBjcmVhdGUgYW5kIGNvbmZpZ3VyZVxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ05ldycsIGlkLCB1cGRhdGUudCk7XG4gICAgICAgICAgICAgICAgc3ByaXRlID0gc3RhcmNvZGVyLmFkZEJvZHkodXBkYXRlLnQsIHVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHNwcml0ZSkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc2VydmVySWQgPSBpZDtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5leHRhbnRbaWRdID0gc3ByaXRlO1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUudXBkYXRlUXVldWUgPSBbdXBkYXRlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMCwgbCA9IGRhdGEucm0ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBpZCA9IGRhdGEucm1baV07XG4gICAgICAgICAgICBpZiAoc2VsZi5leHRhbnRbaWRdKSB7XG4gICAgICAgICAgICAgICAgc3RhcmNvZGVyLnJlbW92ZUJvZHkoc2VsZi5leHRhbnRbaWRdKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgc2VsZi5leHRhbnRbaWRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5TeW5jQ2xpZW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRydWUgfHwgIXRoaXMuX3VwZGF0ZUNvbXBsZXRlKSB7XG4gICAgICAgIHRoaXMuX3NlbmRDb21tYW5kcygpO1xuICAgICAgICB0aGlzLl9wcm9jZXNzUGh5c2ljc1VwZGF0ZXMoKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ29tcGxldGUgPSB0cnVlO1xuICAgIH1cbiB9O1xuXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5wb3N0UmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX3VwZGF0ZUNvbXBsZXRlID0gZmFsc2U7XG59O1xuXG4vKipcbiAqIFNlbmQgcXVldWVkIGNvbW1hbmRzIHRoYXQgaGF2ZSBiZWVuIGV4ZWN1dGVkIHRvIHRoZSBzZXJ2ZXJcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5fc2VuZENvbW1hbmRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhY3Rpb25zID0gW107XG4gICAgZm9yICh2YXIgaSA9IHRoaXMuY21kUXVldWUubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBhY3Rpb24gPSB0aGlzLmNtZFF1ZXVlW2ldO1xuICAgICAgICBpZiAoYWN0aW9uLmV4ZWN1dGVkKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goYWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuY21kUXVldWUuc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdkbycsIGFjdGlvbnMpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdzZW5kaW5nIGFjdGlvbnMnLCBhY3Rpb25zKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgaW50ZXJwb2xhdGlvbiAvIHByZWRpY3Rpb24gcmVzb2x1dGlvbiBmb3IgcGh5c2ljcyBib2RpZXNcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5fcHJvY2Vzc1BoeXNpY3NVcGRhdGVzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpbnRlcnBUaW1lID0gdGhpcy5nYW1lLnRpbWUubm93ICsgdGhpcy5fbGF0ZW5jeSAtIHRoaXMuZ2FtZS5zdGFyY29kZXIuY29uZmlnLnJlbmRlckxhdGVuY3k7XG4gICAgdmFyIG9pZHMgPSBPYmplY3Qua2V5cyh0aGlzLmV4dGFudCk7XG4gICAgZm9yICh2YXIgaSA9IG9pZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIHNwcml0ZSA9IHRoaXMuZXh0YW50W29pZHNbaV1dO1xuICAgICAgICB2YXIgcXVldWUgPSBzcHJpdGUudXBkYXRlUXVldWU7XG4gICAgICAgIHZhciBiZWZvcmUgPSBudWxsLCBhZnRlciA9IG51bGw7XG5cbiAgICAgICAgLy92YXIgdGVtcCA9IFtdO1xuICAgICAgICAvL3ZhciBsYXN0eCA9IHF1ZXVlWzBdLnggfHwgMDtcbiAgICAgICAgLy9mb3IgKHZhciBrID0gMTsgazxxdWV1ZS5sZW5ndGg7IGsrKykge1xuICAgICAgICAvLyAgICB0ZW1wLnB1c2gocXVldWVba10ueC1sYXN0eCk7XG4gICAgICAgIC8vICAgIGxhc3R4ID0gcXVldWVba10ueDtcbiAgICAgICAgLy99XG4gICAgICAgIC8vY29uc29sZS5sb2coaW50ZXJwVGltZSwgJzw+JywgdGVtcCk7XG5cbiAgICAgICAgLy8gRmluZCB1cGRhdGVzIGJlZm9yZSBhbmQgYWZ0ZXIgaW50ZXJwVGltZVxuICAgICAgICB2YXIgaiA9IDE7XG4gICAgICAgIHdoaWxlIChxdWV1ZVtqXSkge1xuICAgICAgICAgICAgaWYgKHF1ZXVlW2pdLnRpbWVzdGFtcCA+IGludGVycFRpbWUpIHtcbiAgICAgICAgICAgICAgICBhZnRlciA9IHF1ZXVlW2pdO1xuICAgICAgICAgICAgICAgIGJlZm9yZSA9IHF1ZXVlW2otMV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb25lIC0gd2UncmUgYmVoaW5kLlxuICAgICAgICBpZiAoIWJlZm9yZSAmJiAhYWZ0ZXIpIHtcbiAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPj0gMikgeyAgICAvLyBUd28gbW9zdCByZWNlbnQgdXBkYXRlcyBhdmFpbGFibGU/IFVzZSB0aGVtLlxuICAgICAgICAgICAgICAgIGJlZm9yZSA9IHF1ZXVlW3F1ZXVlLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgICAgIGFmdGVyID0gcXVldWVbcXVldWUubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xhZ2dpbmcnLCBvaWRzW2ldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7ICAgICAgICAgICAgICAgICAgICAvLyBObz8gSnVzdCBiYWlsXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0JhaWxpbmcnLCBvaWRzW2ldKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ09rJywgaW50ZXJwVGltZSwgcXVldWUubGVuZ3RoKTtcbiAgICAgICAgICAgIHF1ZXVlLnNwbGljZSgwLCBqIC0gMSk7ICAgICAvLyBUaHJvdyBvdXQgb2xkZXIgdXBkYXRlc1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNwYW4gPSBhZnRlci50aW1lc3RhbXAgLSBiZWZvcmUudGltZXN0YW1wO1xuICAgICAgICB2YXIgdCA9IChpbnRlcnBUaW1lIC0gYmVmb3JlLnRpbWVzdGFtcCkgLyBzcGFuO1xuICAgICAgICAvL3ZhciBvbGR4ID0gc3ByaXRlLmJvZHkuZGF0YS5wb3NpdGlvblswXTtcbiAgICAgICAgLy92YXIgc2NhbGUgPSAwLjA1IC8gKGFmdGVyLnd0aW1lc3RhbXAgLSBiZWZvcmUud3RpbWVzdGFtcCk7XG4gICAgICAgIC8vc3ByaXRlLmJvZHkuZGF0YS5wb3NpdGlvblswXSA9IC1oZXJtaXRlKGJlZm9yZS54LCBhZnRlci54LCBiZWZvcmUudngqc3BhbiwgYWZ0ZXIudngqc3BhbiwgdCk7XG4gICAgICAgIC8vc3ByaXRlLmJvZHkuZGF0YS5wb3NpdGlvblsxXSA9IC1oZXJtaXRlKGJlZm9yZS55LCBhZnRlci55LCBiZWZvcmUudnkqc3BhbiwgYWZ0ZXIudnkqc3BhbiwgdCk7XG4gICAgICAgIC8vc3ByaXRlLmJvZHkuZGF0YS5hbmdsZSA9IGhlcm1pdGUoYmVmb3JlLmEsIGFmdGVyLmEsIGJlZm9yZS5hdiwgYWZ0ZXIuYXYsIHQpO1xuICAgICAgICBzcHJpdGUuc2V0UG9zQW5nbGUobGluZWFyKGJlZm9yZS54LCBhZnRlci54LCB0KSwgbGluZWFyKGJlZm9yZS55LCBhZnRlci55LCB0KSwgbGluZWFyKGJlZm9yZS5hLCBhZnRlci5hLCB0KSk7XG4gICAgICAgIC8vc3ByaXRlLmJvZHkuZGF0YS5wb3NpdGlvblswXSA9IC1saW5lYXIoYmVmb3JlLngsIGFmdGVyLngsIHQpO1xuICAgICAgICAvL3Nwcml0ZS5ib2R5LmRhdGEucG9zaXRpb25bMV0gPSAtbGluZWFyKGJlZm9yZS55LCBhZnRlci55LCB0KTtcbiAgICAgICAgLy9zcHJpdGUuYm9keS5kYXRhLmFuZ2xlID0gbGluZWFyKGJlZm9yZS5hLCBhZnRlci5hLCB0KTtcbiAgICAgICAgLy9zcHJpdGUuYm9keS5kYXRhLnBvc2l0aW9uWzBdIC09IDAuMTA7XG4gICAgICAgIC8vc3ByaXRlLmJvZHkuZGF0YS5wb3NpdGlvblsxXSA9IC01O1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdbdF0nLCBiZWZvcmUudGltZXN0YW1wLCBpbnRlcnBUaW1lLCBhZnRlci50aW1lc3RhbXAsICctJywgYWZ0ZXIudGltZXN0YW1wIC0gYmVmb3JlLnRpbWVzdGFtcCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ1t3XScsIGJlZm9yZS53dGltZXN0YW1wLCAnKioqKionLCBhZnRlci53dGltZXN0YW1wLCAnLScsIGFmdGVyLnd0aW1lc3RhbXAgLSBiZWZvcmUud3RpbWVzdGFtcCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ1t4XScsIGJlZm9yZS54LCAtc3ByaXRlLmJvZHkuZGF0YS5wb3NpdGlvblswXSwgYWZ0ZXIueCk7XG4gICAgICAgIC8vdmFyIGR4ID0gc3ByaXRlLmJvZHkuZGF0YS5wb3NpdGlvblswXSAtIG9sZHgsIGR0ID0gdGhpcy5nYW1lLnRpbWUubm93IC0gdGhpcy5sYXN0VXBkYXRlO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdEZWx0YT4nLCBkeCwgJy8nLCBkdCwgJz0nLCBkeC9kdCk7XG5cbiAgICB9XG59O1xuXG4vLyBIZWxwZXJzXG5cbi8vIEZJWE1FLCBtYXliZVxuZnVuY3Rpb24gaGVybWl0ZSAocDAsIHAxLCB2MCwgdjEsIHQpIHtcbiAgICB2YXIgdDIgPSB0KnQ7XG4gICAgdmFyIHQzID0gdCp0MjtcbiAgICByZXR1cm4gKDIqdDMgLSAzKnQyICsgMSkqcDAgKyAodDMgLSAyKnQyICsgdCkqdjAgKyAoLTIqdDMgKyAzKnQyKSpwMSArICh0MyAtIHQyKSp2MTtcbn1cblxuZnVuY3Rpb24gbGluZWFyIChwMCwgcDEsIHQsIHNjYWxlKSB7XG4gICAgc2NhbGUgPSBzY2FsZSB8fCAxO1xuICAgIHJldHVybiBwMCArIChwMSAtIHAwKSp0KnNjYWxlO1xufVxuXG5TdGFyY29kZXIuU2VydmVyU3luYyA9IFN5bmNDbGllbnQ7XG5tb2R1bGUuZXhwb3J0cyA9IFN5bmNDbGllbnQ7IiwiLyoqXG4gKiBCb290LmpzXG4gKlxuICogQm9vdCBzdGF0ZSBmb3IgU3RhcmNvZGVyXG4gKiBMb2FkIGFzc2V0cyBmb3IgcHJlbG9hZCBzY3JlZW4gYW5kIGNvbm5lY3QgdG8gc2VydmVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbnRyb2xzID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9Db250cm9scy5qcycpO1xudmFyIFN5bmNDbGllbnQgPSByZXF1aXJlKCcuLi9waGFzZXJwbHVnaW5zL1N5bmNDbGllbnQuanMnKTtcblxudmFyIEJvb3QgPSBmdW5jdGlvbiAoKSB7fTtcblxuQm9vdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuQm9vdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCb290O1xuXG52YXIgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuXG5Cb290LnByb3RvdHlwZS5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIC8vdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkU7XG4gICAgdGhpcy5nYW1lLnJlbmRlcmVyLnJlbmRlclNlc3Npb24ucm91bmRQaXhlbHMgPSB0cnVlO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcFNjYWxlID0gdGhpcy5zdGFyY29kZXIuY29uZmlnLnBoeXNpY3NTY2FsZTtcbiAgICB2YXIgaXBTY2FsZSA9IDEvcFNjYWxlO1xuICAgIHZhciBmbG9vciA9IE1hdGguZmxvb3I7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuY29uZmlnID0ge1xuICAgICAgICBweG06IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gaXBTY2FsZSphO1xuICAgICAgICB9LFxuICAgICAgICBtcHg6IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gZmxvb3IocFNjYWxlKmEpO1xuICAgICAgICB9LFxuICAgICAgICBweG1pOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIC1pcFNjYWxlKmE7XG4gICAgICAgIH0sXG4gICAgICAgIG1weGk6IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gZmxvb3IoLXBTY2FsZSphKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy90aGlzLnN0YXJjb2Rlci5jb250cm9scyA9IHRoaXMuZ2FtZS5wbHVnaW5zLmFkZChDb250cm9scyxcbiAgICAvLyAgICB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oQ29udHJvbHMsIHRoaXMuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICAvLyBTZXQgdXAgc29ja2V0LmlvIGNvbm5lY3Rpb25cbiAgICB0aGlzLnN0YXJjb2Rlci5zb2NrZXQgPSB0aGlzLnN0YXJjb2Rlci5pbyh0aGlzLnN0YXJjb2Rlci5jb25maWcuc2VydmVyVXJpICsgJy9zeW5jJyxcbiAgICAgICAgdGhpcy5zdGFyY29kZXIuY29uZmlnLmlvQ2xpZW50T3B0aW9ucyk7XG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0Lm9uKCdzZXJ2ZXIgcmVhZHknLCBmdW5jdGlvbiAocGxheWVyTXNnKSB7XG4gICAgICAgIC8vIEZJWE1FOiBIYXMgdG8gaW50ZXJhY3Qgd2l0aCBzZXNzaW9uIGZvciBhdXRoZW50aWNhdGlvbiBldGMuXG4gICAgICAgIHNlbGYuc3RhcmNvZGVyLnBsYXllciA9IHBsYXllck1zZztcbiAgICAgICAgLy9zZWxmLnN0YXJjb2Rlci5zeW5jY2xpZW50ID0gc2VsZi5nYW1lLnBsdWdpbnMuYWRkKFN5bmNDbGllbnQsXG4gICAgICAgIC8vICAgIHNlbGYuc3RhcmNvZGVyLnNvY2tldCwgc2VsZi5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgICAgICBzZWxmLnN0YXJjb2Rlci5zeW5jY2xpZW50ID0gc2VsZi5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKFN5bmNDbGllbnQsXG4gICAgICAgICAgICBzZWxmLnN0YXJjb2Rlci5zb2NrZXQsIHNlbGYuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICAgICAgX2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgfSk7XG59O1xuXG5Cb290LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKF9jb25uZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdzcGFjZScpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQm9vdDsiLCIvKipcbiAqIFNwYWNlLmpzXG4gKlxuICogTWFpbiBnYW1lIHN0YXRlIGZvciBTdGFyY29kZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBUaHJ1c3RHZW5lcmF0b3IgPSByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVGhydXN0R2VuZXJhdG9yLmpzJyk7XG52YXIgTWluaU1hcCA9IHJlcXVpcmUoJy4uL3BoYXNlcnVpL01pbmlNYXAuanMnKTtcblxudmFyIFNwYWNlID0gZnVuY3Rpb24gKCkge307XG5cblNwYWNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG5TcGFjZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTcGFjZTtcblxuU3BhY2UucHJvdG90eXBlLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgU2ltcGxlUGFydGljbGUuY2FjaGVUZXh0dXJlKHRoaXMuZ2FtZSwgVGhydXN0R2VuZXJhdG9yLnRleHR1cmVLZXksICcjZmY2NjAwJywgOCk7XG4gICAgU2ltcGxlUGFydGljbGUuY2FjaGVUZXh0dXJlKHRoaXMuZ2FtZSwgJ2J1bGxldCcsICcjOTk5OTk5JywgNCk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ3BsYXllcnRocnVzdCcsICdhc3NldHMvc291bmRzL3RocnVzdExvb3Aub2dnJyk7XG4gICAgLy90aGlzLmdhbWUubG9hZC5pbWFnZSgnYml0c2hpcCcsICdhc3NldHMvc2hpcC5wbmcnKTtcbn07XG5cblNwYWNlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJuZyA9IHRoaXMuZ2FtZS5ybmQ7XG4gICAgdmFyIHdiID0gdGhpcy5zdGFyY29kZXIuY29uZmlnLndvcmxkQm91bmRzO1xuICAgIHZhciBwcyA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5waHlzaWNzU2NhbGU7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuUDJKUyk7XG4gICAgdGhpcy53b3JsZC5zZXRCb3VuZHMuY2FsbCh0aGlzLndvcmxkLCB3YlswXSpwcywgd2JbMV0qcHMsICh3YlsyXS13YlswXSkqcHMsICh3YlszXS13YlsxXSkqcHMpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLnAyLnNldEJvdW5kc1RvV29ybGQodHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgLy8gRGVidWdnaW5nXG4gICAgdGhpcy5nYW1lLnRpbWUuYWR2YW5jZWRUaW1pbmcgPSB0cnVlO1xuXG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMucmVzZXQoKTtcblxuICAgIC8vIFNvdW5kc1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMgPSB7fTtcbiAgICB0aGlzLmdhbWUuc291bmRzLnBsYXllcnRocnVzdCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ3BsYXllcnRocnVzdCcsIDEsIHRydWUpO1xuXG4gICAgLy8gQmFja2dyb3VuZFxuICAgIHZhciBzdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwKTtcbiAgICBkcmF3U3RhckZpZWxkKHN0YXJmaWVsZC5jdHgsIDYwMCwgMTYpO1xuICAgIHRoaXMuZ2FtZS5hZGQudGlsZVNwcml0ZSh3YlswXSpwcywgd2JbMV0qcHMsICh3YlsyXS13YlswXSkqcHMsICh3YlszXS13YlsxXSkqcHMsIHN0YXJmaWVsZCk7XG5cbiAgICB0aGlzLnN0YXJjb2Rlci5zeW5jY2xpZW50LnN0YXJ0KCk7XG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0LmVtaXQoJ2NsaWVudCByZWFkeScpO1xuXG4gICAgLy8gR3JvdXBzIGZvciBwYXJ0aWNsZSBlZmZlY3RzXG4gICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvciA9IG5ldyBUaHJ1c3RHZW5lcmF0b3IodGhpcy5nYW1lKTtcblxuICAgIC8vIEdyb3VwIGZvciBnYW1lIG9iamVjdHNcbiAgICB0aGlzLmdhbWUucGxheWZpZWxkID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgLy8gVUlcbiAgICB0aGlzLmdhbWUudWkgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgdGhpcy5nYW1lLnVpLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuXG4gICAgLy8gSW52ZW50b3J5XG4gICAgdmFyIGxhYmVsID0gdGhpcy5nYW1lLm1ha2UudGV4dCgxNzAwLCAyNSwgJ0lOVkVOVE9SWScsIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmY5OTAwJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgbGFiZWwuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZChsYWJlbCk7XG4gICAgdGhpcy5nYW1lLmludmVudG9yeXRleHQgPSB0aGlzLmdhbWUubWFrZS50ZXh0KDE3MDAsIDUwLCAnMCBjcnlzdGFscycsXG4gICAgICAgIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjY2NjMDAwJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgdGhpcy5nYW1lLmludmVudG9yeXRleHQuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZCh0aGlzLmdhbWUuaW52ZW50b3J5dGV4dCk7XG5cbiAgICAvL01pbmlNYXBcbiAgICB0aGlzLmdhbWUubWluaW1hcCA9IG5ldyBNaW5pTWFwKHRoaXMuZ2FtZSwgMzAwLCAzMDApO1xuICAgIHRoaXMuZ2FtZS51aS5hZGQodGhpcy5nYW1lLm1pbmltYXApO1xuICAgIHRoaXMuZ2FtZS54ID0gMTA7XG4gICAgdGhpcy5nYW1lLnkgPSAxMDtcblxuICAgIC8vIEhlbHBlcnNcbiAgICBmdW5jdGlvbiByYW5kb21Ob3JtYWwgKCkge1xuICAgICAgICB2YXIgdCA9IDA7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTw2OyBpKyspIHtcbiAgICAgICAgICAgIHQgKz0gcm5nLm5vcm1hbCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0LzY7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhd1N0YXIgKGN0eCwgeCwgeSwgZCwgY29sb3IpIHtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LWQrMSwgeS1kKzEpO1xuICAgICAgICBjdHgubGluZVRvKHgrZC0xLCB5K2QtMSk7XG4gICAgICAgIGN0eC5tb3ZlVG8oeC1kKzEsIHkrZC0xKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4K2QtMSwgeS1kKzEpO1xuICAgICAgICBjdHgubW92ZVRvKHgsIHktZCk7XG4gICAgICAgIGN0eC5saW5lVG8oeCwgeStkKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LWQsIHkpO1xuICAgICAgICBjdHgubGluZVRvKHgrZCwgeSk7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3U3RhckZpZWxkIChjdHgsIHNpemUsIG4pIHtcbiAgICAgICAgdmFyIHhtID0gTWF0aC5yb3VuZChzaXplLzIgKyByYW5kb21Ob3JtYWwoKSpzaXplLzQpO1xuICAgICAgICB2YXIgeW0gPSBNYXRoLnJvdW5kKHNpemUvMiArIHJhbmRvbU5vcm1hbCgpKnNpemUvNCk7XG4gICAgICAgIHZhciBxdWFkcyA9IFtbMCwwLHhtLTEseW0tMV0sIFt4bSwwLHNpemUtMSx5bS0xXSxcbiAgICAgICAgICAgIFswLHltLHhtLTEsc2l6ZS0xXSwgW3htLHltLHNpemUtMSxzaXplLTFdXTtcbiAgICAgICAgdmFyIGNvbG9yO1xuICAgICAgICB2YXIgaSwgaiwgbCwgcTtcblxuICAgICAgICBuID0gTWF0aC5yb3VuZChuLzQpO1xuICAgICAgICBmb3IgKGk9MCwgbD1xdWFkcy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgICAgICAgICBxID0gcXVhZHNbaV07XG4gICAgICAgICAgICBmb3IgKGo9MDsgajxuOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjb2xvciA9ICdoc2woNjAsMTAwJSwnICsgcm5nLmJldHdlZW4oOTAsOTkpICsgJyUpJztcbiAgICAgICAgICAgICAgICBkcmF3U3RhcihjdHgsXG4gICAgICAgICAgICAgICAgICAgIHJuZy5iZXR3ZWVuKHFbMF0rNywgcVsyXS03KSwgcm5nLmJldHdlZW4ocVsxXSs3LCBxWzNdLTcpLFxuICAgICAgICAgICAgICAgICAgICBybmcuYmV0d2VlbigyLDQpLCBjb2xvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn07XG5cblNwYWNlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gRklYTUU6IGp1c3QgYSBtZXNzIGZvciB0ZXN0aW5nXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzLnByb2Nlc3NRdWV1ZShmdW5jdGlvbiAoYSkge1xuICAgICAgICBpZiAoYS50eXBlID09PSAndXBfcHJlc3NlZCcpIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLmxvY2FsU3RhdGUudGhydXN0ID0gJ3N0YXJ0aW5nJztcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QucGxheSgpO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUudGhydXN0Z2VuZXJhdG9yLnN0YXJ0T24oc2VsZi5nYW1lLnBsYXllclNoaXApO1xuICAgICAgICB9IGVsc2UgaWYgKGEudHlwZSA9PT0gJ3VwX3JlbGVhc2VkJykge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnBsYXllclNoaXAubG9jYWxTdGF0ZS50aHJ1c3QgPSAnc2h1dGRvd24nO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUuc291bmRzLnBsYXllcnRocnVzdC5zdG9wKCk7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RvcE9uKHNlbGYuZ2FtZS5wbGF5ZXJTaGlwKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuU3BhY2UucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2NvbnNvbGUubG9nKCcrcmVuZGVyKycpO1xuICAgIC8vaWYgKHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUpIHtcbiAgICAvLyAgICB2YXIgZCA9IHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUucG9zaXRpb24ueCAtIHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUucHJldmlvdXNQb3NpdGlvbi54O1xuICAgIC8vICAgIGNvbnNvbGUubG9nKCdEZWx0YScsIGQsIHRoaXMuZ2FtZS50aW1lLmVsYXBzZWQsIGQgLyB0aGlzLmdhbWUudGltZS5lbGFwc2VkKTtcbiAgICAvL31cbiAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpO1xuICAgIHRoaXMuZ2FtZS5kZWJ1Zy50ZXh0KCdGcHM6ICcgKyB0aGlzLmdhbWUudGltZS5mcHMsIDUsIDIwKTtcbiAgICAvL3RoaXMuZ2FtZS5kZWJ1Zy5jYW1lcmFJbmZvKHRoaXMuZ2FtZS5jYW1lcmEsIDEwMCwgMjApO1xuICAgIC8vaWYgKHRoaXMuc2hpcCkge1xuICAgIC8vICAgIHRoaXMuZ2FtZS5kZWJ1Zy5zcHJpdGVJbmZvKHRoaXMuc2hpcCwgNDIwLCAyMCk7XG4gICAgLy99XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwYWNlO1xuIiwiLyoqXG4gKiBNaW5pTWFwLmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIE1pbmlNYXAgPSBmdW5jdGlvbiAoZ2FtZSwgd2lkdGgsIGhlaWdodCkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUpO1xuXG4gICAgdmFyIHhyID0gd2lkdGggLyB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlcldpZHRoO1xuICAgIHZhciB5ciA9IGhlaWdodCAvIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VySGVpZ2h0O1xuICAgIGlmICh4ciA8PSB5cikge1xuICAgICAgICB0aGlzLm1hcFNjYWxlID0geHI7XG4gICAgICAgIHRoaXMueE9mZnNldCA9IC14ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyTGVmdDtcbiAgICAgICAgdGhpcy55T2Zmc2V0ID0gLXhyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJUb3AgKyAoaGVpZ2h0IC0geHIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckhlaWdodCkgLyAyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubWFwU2NhbGUgPSB5cjtcbiAgICAgICAgdGhpcy55T2Zmc2V0ID0gLXlyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJUb3A7XG4gICAgICAgIHRoaXMueE9mZnNldCA9IC15ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyTGVmdCArICh3aWR0aCAtIHlyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJXaWR0aCkgLyAyO1xuICAgIH1cblxuICAgIHRoaXMuZ3JhcGhpY3MgPSBnYW1lLm1ha2UuZ3JhcGhpY3MoMCwgMCk7XG4gICAgdGhpcy5ncmFwaGljcy5iZWdpbkZpbGwoMHgwMGZmMDAsIDAuMik7XG4gICAgdGhpcy5ncmFwaGljcy5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB0aGlzLmdyYXBoaWNzLmVuZEZpbGwoKTtcbiAgICB0aGlzLmdyYXBoaWNzLmNhY2hlQXNCaXRtYXAgPSB0cnVlO1xuICAgIHRoaXMuYWRkKHRoaXMuZ3JhcGhpY3MpO1xufTtcblxuTWluaU1hcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuTWluaU1hcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNaW5pTWFwO1xuXG5NaW5pTWFwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy90aGlzLnRleHR1cmUucmVuZGVyWFkodGhpcy5ncmFwaGljcywgMCwgMCwgdHJ1ZSk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmdhbWUucGxheWZpZWxkLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgYm9keSA9IHRoaXMuZ2FtZS5wbGF5ZmllbGQuY2hpbGRyZW5baV07XG4gICAgICAgIGlmICghYm9keS5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBib2R5Lm1pbmlzcHJpdGUueCA9IHRoaXMud29ybGRUb01tWChib2R5LngpO1xuICAgICAgICBib2R5Lm1pbmlzcHJpdGUueSA9IHRoaXMud29ybGRUb01tWShib2R5LnkpO1xuICAgICAgICBib2R5Lm1pbmlzcHJpdGUuYW5nbGUgPSBib2R5LmFuZ2xlO1xuICAgIC8vICAgIHZhciB4ID0gMTAwICsgYm9keS54IC8gNDA7XG4gICAgLy8gICAgdmFyIHkgPSAxMDAgKyBib2R5LnkgLyA0MDtcbiAgICAvLyAgICB0aGlzLnRleHR1cmUucmVuZGVyWFkoYm9keS5ncmFwaGljcywgeCwgeSwgZmFsc2UpO1xuICAgIH1cbn07XG5cbk1pbmlNYXAucHJvdG90eXBlLndvcmxkVG9NbVggPSBmdW5jdGlvbiAoeCkge1xuICAgIHJldHVybiB4ICogdGhpcy5tYXBTY2FsZSArIHRoaXMueE9mZnNldDtcbn07XG5cbk1pbmlNYXAucHJvdG90eXBlLndvcmxkVG9NbVkgPSBmdW5jdGlvbiAoeSkge1xuICAgIHJldHVybiB5ICogdGhpcy5tYXBTY2FsZSArIHRoaXMueU9mZnNldDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWluaU1hcDsiXX0=
