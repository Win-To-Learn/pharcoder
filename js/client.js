(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./Starcoder.js":2,"./client-components/WorldApi.js":3,"./phaserstates/Boot.js":18,"./phaserstates/Space.js":19}],2:[function(require,module,exports){
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
    serverUri: 'http://localhost:8081',
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

},{}],3:[function(require,module,exports){
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

},{"../phaserbodies/Asteroid.js":7,"../phaserbodies/Bullet.js":8,"../phaserbodies/Crystal.js":9,"../phaserbodies/GenericOrb.js":10,"../phaserbodies/Ship.js":11}],4:[function(require,module,exports){
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
},{"./Starcoder-client.js":1}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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



},{}],7:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":5,"../common/UpdateProperties.js":6,"./SyncBodyInterface.js":13,"./VectorSprite.js":15}],8:[function(require,module,exports){
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
},{"../Starcoder.js":2,"./SimpleParticle.js":12,"./SyncBodyInterface.js":13}],9:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":5,"../common/UpdateProperties.js":6,"./SyncBodyInterface.js":13,"./VectorSprite.js":15}],10:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":5,"../common/UpdateProperties.js":6,"./SyncBodyInterface.js":13,"./VectorSprite.js":15}],11:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/UpdateProperties.js":6,"./SyncBodyInterface.js":13,"./VectorSprite.js":15}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
},{"./SimpleParticle.js":12}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
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
},{"../Starcoder-client.js":1}],17:[function(require,module,exports){
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
},{"../Starcoder-client.js":1}],18:[function(require,module,exports){
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
},{"../phaserplugins/Controls.js":16,"../phaserplugins/SyncClient.js":17}],19:[function(require,module,exports){
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

},{"../phaserbodies/SimpleParticle.js":12,"../phaserbodies/ThrustGenerator.js":14,"../phaserui/MiniMap.js":20}],20:[function(require,module,exports){
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
},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvU3RhcmNvZGVyLWNsaWVudC5qcyIsInNyYy9TdGFyY29kZXIuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvV29ybGRBcGkuanMiLCJzcmMvY2xpZW50LmpzIiwic3JjL2NvbW1vbi9QYXRocy5qcyIsInNyYy9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcyIsInNyYy9waGFzZXJib2RpZXMvQXN0ZXJvaWQuanMiLCJzcmMvcGhhc2VyYm9kaWVzL0J1bGxldC5qcyIsInNyYy9waGFzZXJib2RpZXMvQ3J5c3RhbC5qcyIsInNyYy9waGFzZXJib2RpZXMvR2VuZXJpY09yYi5qcyIsInNyYy9waGFzZXJib2RpZXMvU2hpcC5qcyIsInNyYy9waGFzZXJib2RpZXMvU2ltcGxlUGFydGljbGUuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1N5bmNCb2R5SW50ZXJmYWNlLmpzIiwic3JjL3BoYXNlcmJvZGllcy9UaHJ1c3RHZW5lcmF0b3IuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1ZlY3RvclNwcml0ZS5qcyIsInNyYy9waGFzZXJwbHVnaW5zL0NvbnRyb2xzLmpzIiwic3JjL3BoYXNlcnBsdWdpbnMvU3luY0NsaWVudC5qcyIsInNyYy9waGFzZXJzdGF0ZXMvQm9vdC5qcyIsInNyYy9waGFzZXJzdGF0ZXMvU3BhY2UuanMiLCJzcmMvcGhhc2VydWkvTWluaU1hcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIFN0YXJjb2Rlci1jbGllbnQuanNcbiAqXG4gKiBTdGFyY29kZXIgbWFzdGVyIG9iamVjdCBleHRlbmRlZCB3aXRoIGNsaWVudCBvbmx5IHByb3BlcnRpZXMgYW5kIG1ldGhvZHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFdvcmxkQXBpID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9Xb3JsZEFwaS5qcycpO1xuXG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTdGFyY29kZXIucHJvdG90eXBlLCBXb3JsZEFwaS5wcm90b3R5cGUpO1xuXG52YXIgc3RhdGVzID0ge1xuICAgIGJvb3Q6IHJlcXVpcmUoJy4vcGhhc2Vyc3RhdGVzL0Jvb3QuanMnKSxcbiAgICBzcGFjZTogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvU3BhY2UuanMnKVxufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW8gPSBpbztcbiAgICB0aGlzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoMTgwMCwgOTUwLCBQaGFzZXIuQVVUTywgJ21haW4nKTtcbiAgICAvL3RoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSgxODAwLCA5NTAsIFBoYXNlci5DQU5WQVMsICdtYWluJyk7XG4gICAgdGhpcy5nYW1lLmZvcmNlU2luZ2xlVXBkYXRlID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUuc3RhcmNvZGVyID0gdGhpcztcbiAgICBmb3IgKHZhciBrIGluIHN0YXRlcykge1xuICAgICAgICB2YXIgc3RhdGUgPSBuZXcgc3RhdGVzW2tdKCk7XG4gICAgICAgIHN0YXRlLnN0YXJjb2RlciA9IHRoaXM7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoaywgc3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLmNtZFF1ZXVlID0gW107XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnYm9vdCcpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5hdHRhY2hQbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBsdWdpbiA9IHRoaXMuZ2FtZS5wbHVnaW5zLmFkZC5hcHBseSh0aGlzLmdhbWUucGx1Z2lucywgYXJndW1lbnRzKTtcbiAgICBwbHVnaW4uc3RhcmNvZGVyID0gdGhpcztcbiAgICBwbHVnaW4ubG9nID0gdGhpcy5sb2c7XG4gICAgcmV0dXJuIHBsdWdpbjtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUucm9sZSA9ICdDbGllbnQnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJjb2RlcjtcbiIsIi8qKlxuICogU3RhcmNvZGVyLmpzXG4gKlxuICogU2V0IHVwIGdsb2JhbCBTdGFyY29kZXIgbmFtZXNwYWNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0ge1xuLy8gICAgY29uZmlnOiB7XG4vLyAgICAgICAgd29ybGRCb3VuZHM6IFstNDIwMCwgLTQyMDAsIDg0MDAsIDg0MDBdXG4vL1xuLy8gICAgfSxcbi8vICAgIFN0YXRlczoge31cbi8vfTtcblxudmFyIGNvbmZpZyA9IHtcbiAgICB2ZXJzaW9uOiAnMC4xJyxcbiAgICBzZXJ2ZXJVcmk6ICdodHRwOi8vbG9jYWxob3N0OjgwODEnLFxuICAgIC8vd29ybGRCb3VuZHM6IFstNDIwMCwgLTQyMDAsIDg0MDAsIDg0MDBdLFxuICAgIHdvcmxkQm91bmRzOiBbLTIwMCwgLTIwMCwgMjAwLCAyMDBdLFxuICAgIGlvQ2xpZW50T3B0aW9uczoge1xuICAgICAgICAvL2ZvcmNlTmV3OiB0cnVlXG4gICAgICAgIHJlY29ubmVjdGlvbjogZmFsc2VcbiAgICB9LFxuICAgIHVwZGF0ZUludGVydmFsOiA1MCxcbiAgICByZW5kZXJMYXRlbmN5OiAxMDAsXG4gICAgcGh5c2ljc1NjYWxlOiAyMCxcbiAgICBmcmFtZVJhdGU6ICgxIC8gNjApLFxuICAgIHRpbWVTeW5jRnJlcTogMTAsXG4gICAgcGh5c2ljc1Byb3BlcnRpZXM6IHtcbiAgICAgICAgU2hpcDoge1xuICAgICAgICAgICAgbWFzczogMTBcbiAgICAgICAgfSxcbiAgICAgICAgQXN0ZXJvaWQ6IHtcbiAgICAgICAgICAgIG1hc3M6IDIwXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGluaXRpYWxCb2RpZXM6IFtcbiAgICAgICAge3R5cGU6ICdBc3Rlcm9pZCcsIG51bWJlcjogMjUsIGNvbmZpZzoge1xuICAgICAgICAgICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCd9LFxuICAgICAgICAgICAgdmVsb2NpdHk6IHtyYW5kb206ICd2ZWN0b3InLCBsbzogLTEwLCBoaTogMTB9LFxuICAgICAgICAgICAgYW5ndWxhclZlbG9jaXR5OiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogLTUsIGhpOiA1fSxcbiAgICAgICAgICAgIHZlY3RvclNjYWxlOiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogMC42LCBoaTogMS40fSxcbiAgICAgICAgICAgIG1hc3M6IDEwXG4gICAgICAgIH19LFxuICAgICAgICAvL3t0eXBlOiAnQ3J5c3RhbCcsIG51bWJlcjogMTAsIGNvbmZpZzoge1xuICAgICAgICAvLyAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJ30sXG4gICAgICAgIC8vICAgIHZlbG9jaXR5OiB7cmFuZG9tOiAndmVjdG9yJywgbG86IC00LCBoaTogNCwgbm9ybWFsOiB0cnVlfSxcbiAgICAgICAgLy8gICAgdmVjdG9yU2NhbGU6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAwLjQsIGhpOiAwLjh9LFxuICAgICAgICAvLyAgICBtYXNzOiA1XG4gICAgICAgIC8vfX1cbiAgICAgICAge3R5cGU6ICdIeWRyYScsIG51bWJlcjogMSwgY29uZmlnOiB7XG4gICAgICAgICAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJywgcGFkOiA1MH1cbiAgICAgICAgfX1cbiAgICBdXG59O1xuXG52YXIgU3RhcmNvZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIC8vIEluaXRpYWxpemVycyB2aXJ0dWFsaXplZCBhY2NvcmRpbmcgdG8gcm9sZVxuICAgIHRoaXMuYmFubmVyKCk7XG4gICAgdGhpcy5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgLy90aGlzLmluaXROZXQuY2FsbCh0aGlzKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuZXh0ZW5kQ29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIGZvciAodmFyIGsgaW4gY29uZmlnKSB7XG4gICAgICAgIGlmIChjb25maWcuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnW2tdID0gY29uZmlnW2tdO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGNvbW1vbiBjb25maWcgb3B0aW9uc1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3dvcmxkV2lkdGgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1syXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzBdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlcldpZHRoJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogKHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzJdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF0pO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3dvcmxkSGVpZ2h0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcud29ybGRCb3VuZHNbM10gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1sxXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJIZWlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiAodGhpcy5jb25maWcud29ybGRCb3VuZHNbM10gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1sxXSk7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyTGVmdCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzBdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlclRvcCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlclJpZ2h0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMl07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyQm90dG9tJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbM107XG4gICAgfVxufSk7XG5cbi8qKlxuICogQWRkIG1peGluIHByb3BlcnRpZXMgdG8gdGFyZ2V0LiBBZGFwdGVkIChzbGlnaHRseSkgZnJvbSBQaGFzZXJcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0XG4gKiBAcGFyYW0ge29iamVjdH0gbWl4aW5cbiAqL1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlID0gZnVuY3Rpb24gKHRhcmdldCwgbWl4aW4pIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG1peGluKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgIHZhciB2YWwgPSBtaXhpbltrZXldO1xuICAgICAgICBpZiAodmFsICYmXG4gICAgICAgICAgICAodHlwZW9mIHZhbC5nZXQgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHZhbC5zZXQgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHZhbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHZhbDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuYmFubmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubG9nKCdTdGFyY29kZXInLCB0aGlzLnJvbGUsICd2JyArIHRoaXMuY29uZmlnLnZlcnNpb24sICdzdGFydGVkIGF0JywgRGF0ZSgpKTtcbn1cblxuLyoqXG4gKiBDdXN0b20gbG9nZ2luZyBmdW5jdGlvbiB0byBiZSBmZWF0dXJlZmllZCBhcyBuZWNlc3NhcnlcbiAqL1xuU3RhcmNvZGVyLnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJjb2RlcjtcbiIsIi8qKlxuICogV29ybGRBcGkuanNcbiAqXG4gKiBBZGQvcmVtb3ZlL21hbmlwdWxhdGUgYm9kaWVzIGluIGNsaWVudCdzIHBoeXNpY3Mgd29ybGRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgV29ybGRBcGkgPSBmdW5jdGlvbiAoKSB7fTtcblxudmFyIGJvZHlUeXBlcyA9IHtcbiAgICBTaGlwOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvU2hpcC5qcycpLFxuICAgIEFzdGVyb2lkOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvQXN0ZXJvaWQuanMnKSxcbiAgICBDcnlzdGFsOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvQ3J5c3RhbC5qcycpLFxuICAgIEJ1bGxldDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0J1bGxldC5qcycpLFxuICAgIEdlbmVyaWNPcmI6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9HZW5lcmljT3JiLmpzJylcbn07XG5cbldvcmxkQXBpLnByb3RvdHlwZS5hZGRCb2R5ID0gZnVuY3Rpb24gKHR5cGUsIGNvbmZpZykge1xuICAgIHZhciBjdG9yID0gYm9keVR5cGVzW3R5cGVdO1xuICAgIHZhciBwbGF5ZXJTaGlwID0gZmFsc2U7XG4gICAgaWYgKCFjdG9yKSB7XG4gICAgICAgIHRoaXMubG9nKCdVbmtub3duIGJvZHkgdHlwZTonLCB0eXBlKTtcbiAgICAgICAgdGhpcy5sb2coY29uZmlnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PT0gJ1NoaXAnICYmIGNvbmZpZy5wcm9wZXJ0aWVzLnBsYXllcmlkID09PSB0aGlzLnBsYXllci5pZCkge1xuICAgICAgICBjb25maWcudGFnID0gdGhpcy5wbGF5ZXIudXNlcm5hbWU7XG4gICAgICAgIC8vIE9ubHkgdGhlIHBsYXllcidzIG93biBzaGlwIGlzIHRyZWF0ZWQgYXMgZHluYW1pYyBpbiB0aGUgbG9jYWwgcGh5c2ljcyBzaW1cbiAgICAgICAgY29uZmlnLm1hc3MgPSB0aGlzLmNvbmZpZy5waHlzaWNzUHJvcGVydGllcy5TaGlwLm1hc3M7XG4gICAgICAgIHBsYXllclNoaXAgPSB0cnVlO1xuICAgIH1cbiAgICB2YXIgYm9keSA9IG5ldyBjdG9yKHRoaXMuZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuZ2FtZS5hZGQuZXhpc3RpbmcoYm9keSk7XG4gICAgdGhpcy5nYW1lLnBsYXlmaWVsZC5hZGQoYm9keSk7XG4gICAgaWYgKHBsYXllclNoaXApIHtcbiAgICAgICAgdGhpcy5nYW1lLmNhbWVyYS5mb2xsb3coYm9keSk7XG4gICAgICAgIHRoaXMuZ2FtZS5wbGF5ZXJTaGlwID0gYm9keTtcbiAgICB9XG4gICAgcmV0dXJuIGJvZHk7XG59O1xuXG5Xb3JsZEFwaS5wcm90b3R5cGUucmVtb3ZlQm9keSA9IGZ1bmN0aW9uIChzcHJpdGUpIHtcbiAgICBzcHJpdGUua2lsbCgpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLnAyLnJlbW92ZUJvZHkoc3ByaXRlLmJvZHkpO1xufTtcblxuV29ybGRBcGkucHJvdG90eXBlLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG4gICAgZm9yICh2YXIgayBpbiB0aGlzLnVwZGF0ZVByb3BlcnRpZXMpIHtcbiAgICAgICAgdGhpc1trXSA9IHByb3BlcnRpZXNba107XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBXb3JsZEFwaTtcbiIsIi8qKiBjbGllbnQuanNcbiAqXG4gKiBNYWluIGVudHJ5IHBvaW50IGZvciBTdGFyY29kZXIgZ2FtZSBjbGllbnRcbiAqXG4gKiBAdHlwZSB7U3RhcmNvZGVyfGV4cG9ydHN9XG4gKi9cblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG5sb2NhbFN0b3JhZ2UuZGVidWcgPSAnJztcblxudmFyIHN0YXJjb2RlciA9IG5ldyBTdGFyY29kZXIoKTtcbnN0YXJjb2Rlci5zdGFydCgpOyIsIi8qKlxuICogUGF0aC5qc1xuICpcbiAqIFZlY3RvciBwYXRocyBzaGFyZWQgYnkgbXVsdGlwbGUgZWxlbWVudHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLm9jdGFnb24gPSBbXG4gICAgWzIsMV0sXG4gICAgWzEsMl0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwxXSxcbiAgICBbLTIsLTFdLFxuICAgIFstMSwtMl0sXG4gICAgWzEsLTJdLFxuICAgIFsyLC0xXVxuXTtcblxuZXhwb3J0cy5kMmNyb3NzID0gW1xuICAgIFstMSwtMl0sXG4gICAgWy0xLDJdLFxuICAgIFsyLC0xXSxcbiAgICBbLTIsLTFdLFxuICAgIFsxLDJdLFxuICAgIFsxLC0yXSxcbiAgICBbLTIsMV0sXG4gICAgWzIsMV1cbl07IiwiLyoqXG4gKiBVcGRhdGVQcm9wZXJ0aWVzLmpzXG4gKlxuICogQ2xpZW50L3NlcnZlciBzeW5jYWJsZSBwcm9wZXJ0aWVzIGZvciBnYW1lIG9iamVjdHNcbiAqL1xuXG52YXIgU2hpcCA9IGZ1bmN0aW9uICgpIHt9O1xuU2hpcC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsnbGluZVdpZHRoJywgJ2xpbmVDb2xvcicsICdmaWxsQ29sb3InLCAnZmlsbEFscGhhJyxcbiAgICAndmVjdG9yU2NhbGUnLCAnc2hhcGUnLCAnc2hhcGVDbG9zZWQnLCAncGxheWVyaWQnXTtcblxudmFyIEFzdGVyb2lkID0gZnVuY3Rpb24gKCkge307XG5Bc3Rlcm9pZC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsndmVjdG9yU2NhbGUnXTtcblxudmFyIENyeXN0YWwgPSBmdW5jdGlvbiAoKSB7fTtcbkNyeXN0YWwucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3ZlY3RvclNjYWxlJ107XG5cbnZhciBHZW5lcmljT3JiID0gZnVuY3Rpb24gKCkge307XG5HZW5lcmljT3JiLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lQ29sb3InLCAndmVjdG9yU2NhbGUnXTtcblxuZXhwb3J0cy5TaGlwID0gU2hpcDtcbmV4cG9ydHMuQXN0ZXJvaWQgPSBBc3Rlcm9pZDtcbmV4cG9ydHMuQ3J5c3RhbCA9IENyeXN0YWw7XG5leHBvcnRzLkdlbmVyaWNPcmIgPSBHZW5lcmljT3JiO1xuXG5cbiIsIi8qKlxuICogQXN0ZXJvaWQuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkFzdGVyb2lkO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBBc3Rlcm9pZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbiAgICAvL3RoaXMuYm9keS5kYW1waW5nID0gMDtcbn07XG5cbkFzdGVyb2lkLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIGEgPSBuZXcgQXN0ZXJvaWQoZ2FtZSwgb3B0aW9ucyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5Bc3Rlcm9pZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuQXN0ZXJvaWQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQXN0ZXJvaWQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShBc3Rlcm9pZC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQXN0ZXJvaWQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkFzdGVyb2lkLnByb3RvdHlwZS5saW5lQ29sb3IgPSAnI2ZmMDBmZic7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuZmlsbENvbG9yID0gJyMwMGZmMDAnO1xuQXN0ZXJvaWQucHJvdG90eXBlLnNoYXBlQ2xvc2VkID0gdHJ1ZTtcbkFzdGVyb2lkLnByb3RvdHlwZS5saW5lV2lkdGggPSAxO1xuQXN0ZXJvaWQucHJvdG90eXBlLmZpbGxBbHBoYSA9IDAuMjU7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFzdGVyb2lkO1xuLy9TdGFyY29kZXIuQXN0ZXJvaWQgPSBBc3Rlcm9pZDtcbiIsIi8qKlxuICogQnVsbGV0LmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb24gb2Ygc2ltcGxlIHByb2plY3RpbGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWxsKHRoaXMsIGdhbWUsICdidWxsZXQnKTtcbiAgICB0aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU2ltcGxlUGFydGljbGUucHJvdG90eXBlKTtcbkJ1bGxldC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCdWxsZXQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShCdWxsZXQucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDsiLCIvKipcbiAqIENyeXN0YWwuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkNyeXN0YWw7XG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcblxudmFyIENyeXN0YWwgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG59O1xuXG5DcnlzdGFsLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICB2YXIgYSA9IG5ldyBDcnlzdGFsKGdhbWUsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5DcnlzdGFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5DcnlzdGFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENyeXN0YWw7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShDcnlzdGFsLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShDcnlzdGFsLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5DcnlzdGFsLnByb3RvdHlwZS5saW5lQ29sb3IgPSAnIzAwZmZmZic7XG5DcnlzdGFsLnByb3RvdHlwZS5maWxsQ29sb3IgPSAnIzAwMDAwMCc7XG5DcnlzdGFsLnByb3RvdHlwZS5zaGFwZUNsb3NlZCA9IHRydWU7XG5DcnlzdGFsLnByb3RvdHlwZS5saW5lV2lkdGggPSAxO1xuQ3J5c3RhbC5wcm90b3R5cGUuZmlsbEFscGhhID0gMC4wO1xuQ3J5c3RhbC5wcm90b3R5cGUuc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuQ3J5c3RhbC5wcm90b3R5cGUuZ2VvbWV0cnkgPSBbXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLmQyY3Jvc3N9XG5dO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3J5c3RhbDtcbiIsIi8qKlxuICogR2VuZXJpY09yYi5qc1xuICpcbiAqIEJ1aWxkaW5nIGJsb2NrXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5HZW5lcmljT3JiO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBHZW5lcmljT3JiID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuR2VuZXJpY09yYi5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgdmFyIGEgPSBuZXcgR2VuZXJpY09yYihnYW1lLCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBhO1xufTtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmljT3JiO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoR2VuZXJpY09yYi5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoR2VuZXJpY09yYi5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUubGluZUNvbG9yID0gJyNmZjAwMDAnO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuZmlsbENvbG9yID0gJyMwMDAwMDAnO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuc2hhcGVDbG9zZWQgPSB0cnVlO1xuR2VuZXJpY09yYi5wcm90b3R5cGUubGluZVdpZHRoID0gMTtcbkdlbmVyaWNPcmIucHJvdG90eXBlLmZpbGxBbHBoYSA9IDAuMDtcbkdlbmVyaWNPcmIucHJvdG90eXBlLnNoYXBlID0gUGF0aHMub2N0YWdvbjtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUuZ2VvbWV0cnkgPSBbXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLmQyY3Jvc3N9XG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdlbmVyaWNPcmI7XG4iLCIvKipcbiAqIFNoaXAuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlNoaXA7XG4vL3ZhciBFbmdpbmUgPSByZXF1aXJlKCcuL0VuZ2luZS5qcycpO1xuLy92YXIgV2VhcG9ucyA9IHJlcXVpcmUoJy4vV2VhcG9ucy5qcycpO1xuXG52YXIgU2hpcCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcblxuICAgIGlmIChjb25maWcubWFzcykge1xuICAgICAgICB0aGlzLmJvZHkubWFzcyA9IGNvbmZpZy5tYXNzO1xuICAgIH1cbiAgICAvL3RoaXMuZW5naW5lID0gRW5naW5lLmFkZChnYW1lLCAndGhydXN0JywgNTAwKTtcbiAgICAvL3RoaXMuYWRkQ2hpbGQodGhpcy5lbmdpbmUpO1xuICAgIC8vdGhpcy53ZWFwb25zID0gV2VhcG9ucy5hZGQoZ2FtZSwgJ2J1bGxldCcsIDEyKTtcbiAgICAvL3RoaXMud2VhcG9ucy5zaGlwID0gdGhpcztcbiAgICAvL3RoaXMuYWRkQ2hpbGQodGhpcy53ZWFwb25zKTtcbiAgICB0aGlzLnRhZ1RleHQgPSBnYW1lLmFkZC50ZXh0KDAsIHRoaXMuZ3JhcGhpY3MuaGVpZ2h0LzIgKyAxLFxuICAgICAgICBjb25maWcudGFnLCB7Zm9udDogJ2JvbGQgMThweCBBcmlhbCcsIGZpbGw6IHRoaXMubGluZUNvbG9yIHx8ICcjZmZmZmZmJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgdGhpcy50YWdUZXh0LmFuY2hvci5zZXRUbygwLjUsIDApO1xuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy50YWdUZXh0KTtcbiAgICB0aGlzLmxvY2FsU3RhdGUgPSB7XG4gICAgICAgIHRocnVzdDogJ29mZidcbiAgICB9XG59O1xuXG5TaGlwLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIHMgPSBuZXcgU2hpcChnYW1lLCBvcHRpb25zKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhzKTtcbiAgICByZXR1cm4gcztcbn07XG5cblNoaXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcblNoaXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2hpcDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFNoaXAucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFNoaXAucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbi8vU2hpcC5wcm90b3R5cGUuc2V0TGluZVN0eWxlID0gZnVuY3Rpb24gKGNvbG9yLCBsaW5lV2lkdGgpIHtcbi8vICAgIFN0YXJjb2Rlci5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnNldExpbmVTdHlsZS5jYWxsKHRoaXMsIGNvbG9yLCBsaW5lV2lkdGgpO1xuLy8gICAgdGhpcy50YWdUZXh0LnNldFN0eWxlKHtmaWxsOiBjb2xvcn0pO1xuLy99O1xuXG4vL1NoaXAucHJvdG90eXBlLnNoYXBlID0gW1xuLy8gICAgWy0xLC0xXSxcbi8vICAgIFstMC41LDBdLFxuLy8gICAgWy0xLDFdLFxuLy8gICAgWzAsMC41XSxcbi8vICAgIFsxLDFdLFxuLy8gICAgWzAuNSwwXSxcbi8vICAgIFsxLC0xXSxcbi8vICAgIFswLC0wLjVdLFxuLy8gICAgWy0xLC0xXVxuLy9dO1xuU2hpcC5wcm90b3R5cGUubGluZVdpZHRoID0gNjtcblxuU2hpcC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHN3aXRjaCAodGhpcy5sb2NhbFN0YXRlLnRocnVzdCkge1xuICAgICAgICBjYXNlICdzdGFydGluZyc6XG4gICAgICAgICAgICB0aGlzLmdhbWUuc291bmRzLnBsYXllcnRocnVzdC5wbGF5KCk7XG4gICAgICAgICAgICB0aGlzLmdhbWUudGhydXN0Z2VuZXJhdG9yLnN0YXJ0T24odGhpcyk7XG4gICAgICAgICAgICB0aGlzLmxvY2FsU3RhdGUudGhydXN0ID0gJ29uJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzaHV0ZG93bic6XG4gICAgICAgICAgICB0aGlzLmdhbWUuc291bmRzLnBsYXllcnRocnVzdC5zdG9wKCk7XG4gICAgICAgICAgICB0aGlzLmdhbWUudGhydXN0Z2VuZXJhdG9yLnN0b3BPbih0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdGF0ZS50aHJ1c3QgPSAnb2ZmJztcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNoaXA7XG4vL1N0YXJjb2Rlci5TaGlwID0gU2hpcDtcbiIsIi8qKlxuICogU2ltcGxlUGFydGljbGUuanNcbiAqXG4gKiBCYXNpYyBiaXRtYXAgcGFydGljbGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL3ZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi8uLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IGZ1bmN0aW9uIChnYW1lLCBrZXkpIHtcbiAgICB2YXIgdGV4dHVyZSA9IFNpbXBsZVBhcnRpY2xlLl90ZXh0dXJlQ2FjaGVba2V5XTtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgMCwgMCwgdGV4dHVyZSk7XG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZSh0aGlzLCBmYWxzZSwgZmFsc2UpO1xuICAgIHRoaXMuYm9keS5jbGVhclNoYXBlcygpO1xuICAgIHZhciBzaGFwZSA9IHRoaXMuYm9keS5hZGRQYXJ0aWNsZSgpO1xuICAgIHNoYXBlLnNlbnNvciA9IHRydWU7XG4gICAgLy90aGlzLmtpbGwoKTtcbn07XG5cblNpbXBsZVBhcnRpY2xlLl90ZXh0dXJlQ2FjaGUgPSB7fTtcblxuU2ltcGxlUGFydGljbGUuY2FjaGVUZXh0dXJlID0gZnVuY3Rpb24gKGdhbWUsIGtleSwgY29sb3IsIHNpemUpIHtcbiAgICB2YXIgdGV4dHVyZSA9IGdhbWUubWFrZS5iaXRtYXBEYXRhKHNpemUsIHNpemUpO1xuICAgIHRleHR1cmUuY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIHRleHR1cmUuY3R4LmZpbGxSZWN0KDAsIDAsIHNpemUsIHNpemUpO1xuICAgIFNpbXBsZVBhcnRpY2xlLl90ZXh0dXJlQ2FjaGVba2V5XSA9IHRleHR1cmU7XG59O1xuXG5TaW1wbGVQYXJ0aWNsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcblNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNpbXBsZVBhcnRpY2xlO1xuXG4vL1NpbXBsZVBhcnRpY2xlLkVtaXR0ZXIgPSBmdW5jdGlvbiAoZ2FtZSwga2V5LCBuKSB7XG4vLyAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lKTtcbi8vICAgIG4gPSBuIHx8IDUwO1xuLy8gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIHtcbi8vICAgICAgICB0aGlzLmFkZChuZXcgU2ltcGxlUGFydGljbGUoZ2FtZSwga2V5KSk7XG4vLyAgICB9XG4vLyAgICB0aGlzLl9vbiA9IGZhbHNlO1xuLy99O1xuLy9cbi8vU2ltcGxlUGFydGljbGUuRW1pdHRlci5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwga2V5LCBuKSB7XG4vLyAgICB2YXIgZW1pdHRlciA9IG5ldyBTaW1wbGVQYXJ0aWNsZS5FbWl0dGVyKGdhbWUsIGtleSwgbik7XG4vLyAgICBnYW1lLmFkZC5leGlzdGluZyhlbWl0dGVyKTtcbi8vICAgIHJldHVybiBlbWl0dGVyO1xuLy99O1xuLy9cbi8vU2ltcGxlUGFydGljbGUuRW1pdHRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuLy9TaW1wbGVQYXJ0aWNsZS5FbWl0dGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNpbXBsZVBhcnRpY2xlLkVtaXR0ZXI7XG4vL1xuLy9TaW1wbGVQYXJ0aWNsZS5FbWl0dGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICAvLyBGSVhNRTogVGVzdGluZyBoYWNrXG4vLyAgICBpZiAodGhpcy5fb24pIHtcbi8vICAgICAgICBmb3IgKHZhciBpID0gMDsgaTwyMDsgaSsrKSB7XG4vLyAgICAgICAgICAgIHZhciBwYXJ0aWNsZSA9IHRoaXMuZ2V0Rmlyc3REZWFkKCk7XG4vLyAgICAgICAgICAgIGlmICghcGFydGljbGUpIHtcbi8vICAgICAgICAgICAgICAgIGJyZWFrO1xuLy8gICAgICAgICAgICB9XG4vLyAgICAgICAgICAgIHBhcnRpY2xlLmxpZmVzcGFuID0gMjUwO1xuLy8gICAgICAgICAgICBwYXJ0aWNsZS5hbHBoYSA9IDAuNTtcbi8vICAgICAgICAgICAgdmFyIGQgPSB0aGlzLmdhbWUucm5kLmJldHdlZW4oLTcsIDcpO1xuLy8gICAgICAgICAgICBwYXJ0aWNsZS5yZXNldChkLCAxMCk7XG4vLyAgICAgICAgICAgIHBhcnRpY2xlLmJvZHkudmVsb2NpdHkueSA9IDgwO1xuLy8gICAgICAgICAgICBwYXJ0aWNsZS5ib2R5LnZlbG9jaXR5LnggPSAtMypkO1xuLy8gICAgICAgIH1cbi8vICAgIH1cbi8vfTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVQYXJ0aWNsZTtcbi8vU3RhcmNvZGVyLlNpbXBsZVBhcnRpY2xlID0gU2ltcGxlUGFydGljbGU7IiwiLyoqXG4gKiBTeW5jQm9keUludGVyZmFjZS5qc1xuICpcbiAqIFNoYXJlZCBtZXRob2RzIGZvciBWZWN0b3JTcHJpdGVzLCBQYXJ0aWNsZXMsIGV0Yy5cbiAqL1xuXG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSBmdW5jdGlvbiAoKSB7fTtcblxuLyoqXG4gKiBTZXQgbG9jYXRpb24gYW5kIGFuZ2xlIG9mIGEgcGh5c2ljcyBvYmplY3QuIFZhbHVlIGFyZSBnaXZlbiBpbiB3b3JsZCBjb29yZGluYXRlcywgbm90IHBpeGVsc1xuICpcbiAqIEBwYXJhbSB4IHtudW1iZXJ9XG4gKiBAcGFyYW0geSB7bnVtYmVyfVxuICogQHBhcmFtIGEge251bWJlcn1cbiAqL1xuU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlLnNldFBvc0FuZ2xlID0gZnVuY3Rpb24gKHgsIHksIGEpIHtcbiAgICB0aGlzLmJvZHkuZGF0YS5wb3NpdGlvblswXSA9IC0oeCB8fCAwKTtcbiAgICB0aGlzLmJvZHkuZGF0YS5wb3NpdGlvblsxXSA9IC0oeSB8fCAwKTtcbiAgICB0aGlzLmJvZHkuZGF0YS5hbmdsZSA9IGEgfHwgMDtcbn07XG5cblN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZS5jb25maWcgPSBmdW5jdGlvbiAocHJvcGVydGllcykge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy51cGRhdGVQcm9wZXJ0aWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgayA9IHRoaXMudXBkYXRlUHJvcGVydGllc1tpXTtcbiAgICAgICAgaWYgKHByb3BlcnRpZXNba10pIHtcbiAgICAgICAgICAgIHRoaXNba10gPSBwcm9wZXJ0aWVzW2tdOyAgICAgICAgLy8gRklYTUU/IFZpcnR1YWxpemUgc29tZWhvd1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW5jQm9keUludGVyZmFjZTsiLCIvKipcbiAqIFRocnVzdEdlbmVyYXRvci5qc1xuICpcbiAqIEdyb3VwIHByb3ZpZGluZyBBUEksIGxheWVyaW5nLCBhbmQgcG9vbGluZyBmb3IgdGhydXN0IHBhcnRpY2xlIGVmZmVjdHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSByZXF1aXJlKCcuL1NpbXBsZVBhcnRpY2xlLmpzJyk7XG5cbnZhciBfdGV4dHVyZUtleSA9ICd0aHJ1c3QnO1xuXG4vLyBQb29saW5nIHBhcmFtZXRlcnNcbnZhciBfbWluUG9vbFNpemUgPSAzMDA7XG52YXIgX21pbkZyZWVQYXJ0aWNsZXMgPSAyMDtcbnZhciBfc29mdFBvb2xMaW1pdCA9IDIwMDtcbnZhciBfaGFyZFBvb2xMaW1pdCA9IDUwMDtcblxuLy8gQmVoYXZpb3Igb2YgZW1pdHRlclxudmFyIF9wYXJ0aWNsZXNQZXJCdXJzdCA9IDU7XG52YXIgX3BhcnRpY2xlVFRMID0gMTUwO1xudmFyIF9wYXJ0aWNsZUJhc2VTcGVlZCA9IDU7XG52YXIgX2NvbmVMZW5ndGggPSAxO1xudmFyIF9jb25lV2lkdGhSYXRpbyA9IDAuMjtcbnZhciBfZW5naW5lT2Zmc2V0ID0gLTIwO1xuXG52YXIgVGhydXN0R2VuZXJhdG9yID0gZnVuY3Rpb24gKGdhbWUpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIHRoaXMudGhydXN0aW5nU2hpcHMgPSB7fTtcblxuICAgIC8vIFByZWdlbmVyYXRlIGEgYmF0Y2ggb2YgcGFydGljbGVzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfbWluUG9vbFNpemU7IGkrKykge1xuICAgICAgICB2YXIgcGFydGljbGUgPSB0aGlzLmFkZChuZXcgU2ltcGxlUGFydGljbGUoZ2FtZSwgX3RleHR1cmVLZXkpKTtcbiAgICAgICAgcGFydGljbGUuYWxwaGEgPSAwLjU7XG4gICAgICAgIHBhcnRpY2xlLnJvdGF0aW9uID0gTWF0aC5QSS80O1xuICAgICAgICBwYXJ0aWNsZS5raWxsKCk7XG4gICAgfVxufTtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVGhydXN0R2VuZXJhdG9yO1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLnN0YXJ0T24gPSBmdW5jdGlvbiAoc2hpcCkge1xuICAgIHRoaXMudGhydXN0aW5nU2hpcHNbc2hpcC5pZF0gPSBzaGlwO1xufTtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS5zdG9wT24gPSBmdW5jdGlvbiAoc2hpcCkge1xuICAgIGRlbGV0ZSB0aGlzLnRocnVzdGluZ1NoaXBzW3NoaXAuaWRdO1xufTtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnRocnVzdGluZ1NoaXBzKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBzaGlwID0gdGhpcy50aHJ1c3RpbmdTaGlwc1trZXlzW2ldXTtcbiAgICAgICAgdmFyIHcgPSBzaGlwLndpZHRoO1xuICAgICAgICB2YXIgc2luID0gTWF0aC5zaW4oc2hpcC5yb3RhdGlvbik7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhzaGlwLnJvdGF0aW9uKTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBfcGFydGljbGVzUGVyQnVyc3Q7IGorKykge1xuICAgICAgICAgICAgdmFyIHBhcnRpY2xlID0gdGhpcy5nZXRGaXJzdERlYWQoKTtcbiAgICAgICAgICAgIGlmICghcGFydGljbGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90IGVub3VnaCB0aHJ1c3QgcGFydGljbGVzIGluIHBvb2wnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkID0gdGhpcy5nYW1lLnJuZC5yZWFsSW5SYW5nZSgtX2NvbmVXaWR0aFJhdGlvKncsIF9jb25lV2lkdGhSYXRpbyp3KTtcbiAgICAgICAgICAgIHZhciB4ID0gc2hpcC54ICsgZCpjb3MgKyBfZW5naW5lT2Zmc2V0KnNpbjtcbiAgICAgICAgICAgIHZhciB5ID0gc2hpcC55ICsgZCpzaW4gLSBfZW5naW5lT2Zmc2V0KmNvcztcbiAgICAgICAgICAgIHBhcnRpY2xlLmxpZmVzcGFuID0gX3BhcnRpY2xlVFRMO1xuICAgICAgICAgICAgcGFydGljbGUucmVzZXQoeCwgeSk7XG4gICAgICAgICAgICBwYXJ0aWNsZS5ib2R5LnZlbG9jaXR5LnggPSBfcGFydGljbGVCYXNlU3BlZWQqKF9jb25lTGVuZ3RoKnNpbiAtIGQqY29zKTtcbiAgICAgICAgICAgIHBhcnRpY2xlLmJvZHkudmVsb2NpdHkueSA9IF9wYXJ0aWNsZUJhc2VTcGVlZCooLV9jb25lTGVuZ3RoKmNvcyAtIGQqc2luKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblRocnVzdEdlbmVyYXRvci50ZXh0dXJlS2V5ID0gX3RleHR1cmVLZXk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGhydXN0R2VuZXJhdG9yOyIsIi8qKlxuICogU3ByaXRlIHdpdGggYXR0YWNoZWQgR3JhcGhpY3Mgb2JqZWN0IGZvciB2ZWN0b3ItbGlrZSBncmFwaGljc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbi8vdmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uLy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICAvL3RoaXMuc2hhcGUgPSBjb25maWcucHJvcGVydGllcy5zaGFwZSB8fCB0aGlzLnNoYXBlO1xuICAgIC8vdGhpcy5zaGFwZUNsb3NlZCA9IGNvbmZpZy5wcm9wZXJ0aWVzLnNoYXBlIHx8IHRoaXMuc2hhcGVDbG9zZWQ7XG4gICAgLy90aGlzLmxpbmVXaWR0aCA9IGNvbmZpZy5wcm9wZXJ0aWVzLmxpbmVXaWR0aCB8fCB0aGlzLmxpbmVXaWR0aDtcbiAgICAvL3RoaXMubGluZUNvbG9yID0gY29uZmlnLnByb3BlcnRpZXMubGluZUNvbG9yIHx8IHRoaXMubGluZUNvbG9yO1xuICAgIC8vdGhpcy5maWxsQ29sb3IgPSBjb25maWcucHJvcGVydGllcy5maWxsQ29sb3IgfHwgdGhpcy5maWxsQ29sb3I7XG4gICAgLy90aGlzLmZpbGxBbHBoYSA9IGNvbmZpZy5wcm9wZXJ0aWVzLmZpbGxBbHBoYSB8fCB0aGlzLmZpbGxBbHBoYTtcbiAgICAvL3RoaXMuZ2VvbWV0cnkgPSBjb25maWcucHJvcGVydGllcy5nZW9tZXRyeSB8fCB0aGlzLmdlb21ldHJ5O1xuICAgIC8vdGhpcy52ZWN0b3JTY2FsZSA9IGNvbmZpZy5wcm9wZXJ0aWVzLnZlY3RvclNjYWxlIHx8IHRoaXMudmVjdG9yU2NhbGU7XG5cbiAgICB0aGlzLmdyYXBoaWNzID0gZ2FtZS5tYWtlLmdyYXBoaWNzKCk7XG4gICAgdGhpcy50ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgdGhpcy5taW5pdGV4dHVyZSA9IHRoaXMuZ2FtZS5hZGQucmVuZGVyVGV4dHVyZSgpO1xuICAgIHRoaXMubWluaXNwcml0ZSA9IHRoaXMuZ2FtZS5taW5pbWFwLmNyZWF0ZSgpO1xuICAgIHRoaXMubWluaXNwcml0ZS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZSh0aGlzLCBmYWxzZSwgZmFsc2UpO1xuICAgIHRoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG4gICAgdGhpcy5jb25maWcoY29uZmlnLnByb3BlcnRpZXMpO1xuICAgIHRoaXMudXBkYXRlQXBwZWFyYW5jZSgpO1xuICAgIHRoaXMudXBkYXRlQm9keSgpO1xuICAgIHRoaXMuYm9keS5tYXNzID0gMDtcbn07XG5cblZlY3RvclNwcml0ZS5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSkge1xuICAgIHZhciB2ID0gbmV3IFZlY3RvclNwcml0ZShnYW1lLCB4LCB5KTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyh2KTtcbiAgICByZXR1cm4gdjtcbn1cblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFZlY3RvclNwcml0ZTtcblxuLy8gRGVmYXVsdCBvY3RhZ29uXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnNoYXBlID0gW1xuICAgIFsyLDFdLFxuICAgIFsxLDJdLFxuICAgIFstMSwyXSxcbiAgICBbLTIsMV0sXG4gICAgWy0yLC0xXSxcbiAgICBbLTEsLTJdLFxuICAgIFsxLC0yXSxcbiAgICBbMiwtMV1cbl07XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnNoYXBlQ2xvc2VkID0gdHJ1ZTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUubGluZUNvbG9yID0gJyNmZmZmZmYnO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5saW5lV2lkdGggPSAxO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5maWxsQ29sb3IgPSBudWxsO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5maWxsQWxwaGEgPSAwLjI1O1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS52ZWN0b3JTY2FsZSA9IDE7XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUucGh5c2ljc0JvZHlUeXBlID0gJ2NpcmNsZSc7XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0U2hhcGUgPSBmdW5jdGlvbiAoc2hhcGUpIHtcbiAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gICAgdGhpcy51cGRhdGVBcHBlYXJhbmNlKCk7XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnNldExpbmVTdHlsZSA9IGZ1bmN0aW9uIChjb2xvciwgbGluZVdpZHRoKSB7XG4gICAgaWYgKCFsaW5lV2lkdGggfHwgbGluZVdpZHRoIDwgMSkge1xuICAgICAgICBsaW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aCB8fCAxO1xuICAgIH1cbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgdGhpcy5saW5lV2lkdGggPSBsaW5lV2lkdGg7XG4gICAgdGhpcy51cGRhdGVBcHBlYXJhbmNlKCk7XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZUFwcGVhcmFuY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gRHJhdyBmdWxsIHNpemVkXG4gICAgdGhpcy5ncmFwaGljcy5jbGVhcigpO1xuICAgIGlmICh0eXBlb2YgdGhpcy5kcmF3UHJvY2VkdXJlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLmRyYXdQcm9jZWR1cmUoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUpIHtcbiAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgfVxuICAgIHRoaXMudGV4dHVyZS5yZXNpemUodGhpcy5ncmFwaGljcy53aWR0aCwgdGhpcy5ncmFwaGljcy5oZWlnaHQsIHRydWUpO1xuICAgIHRoaXMudGV4dHVyZS5yZW5kZXJYWSh0aGlzLmdyYXBoaWNzLCB0aGlzLmdyYXBoaWNzLndpZHRoLzIsIHRoaXMuZ3JhcGhpY3MuaGVpZ2h0LzIsIHRydWUpO1xuICAgIHRoaXMuc2V0VGV4dHVyZSh0aGlzLnRleHR1cmUpO1xuICAgIC8vIERyYXcgc21hbGwgZm9yIG1pbmltYXBcbiAgICB2YXIgbWFwU2NhbGUgPSB0aGlzLmdhbWUubWluaW1hcC5tYXBTY2FsZTtcbiAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmRyYXdQcm9jZWR1cmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuZHJhd1Byb2NlZHVyZShtYXBTY2FsZSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNoYXBlKSB7XG4gICAgICAgIHRoaXMuZHJhdyhtYXBTY2FsZSk7XG4gICAgfVxuICAgIHRoaXMubWluaXRleHR1cmUucmVzaXplKHRoaXMuZ3JhcGhpY3Mud2lkdGgsIHRoaXMuZ3JhcGhpY3MuaGVpZ2h0LCB0cnVlKTtcbiAgICB0aGlzLm1pbml0ZXh0dXJlLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIHRoaXMuZ3JhcGhpY3Mud2lkdGgvMiwgdGhpcy5ncmFwaGljcy5oZWlnaHQvMiwgdHJ1ZSk7XG4gICAgdGhpcy5taW5pc3ByaXRlLnNldFRleHR1cmUodGhpcy5taW5pdGV4dHVyZSk7XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZUJvZHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgc3dpdGNoICh0aGlzLnBoeXNpY3NCb2R5VHlwZSkge1xuICAgICAgICBjYXNlIFwiY2lyY2xlXCI6XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuY2lyY2xlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHZhciByID0gdGhpcy5ncmFwaGljcy5nZXRCb3VuZHMoKTtcbiAgICAgICAgICAgICAgICB2YXIgcmFkaXVzID0gTWF0aC5yb3VuZChNYXRoLnNxcnQoci53aWR0aCogci5oZWlnaHQpLzIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByYWRpdXMgPSB0aGlzLnJhZGl1cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRDaXJjbGUocmFkaXVzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBUT0RPOiBNb3JlIHNoYXBlc1xuICAgIH1cbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChyZW5kZXJTY2FsZSkge1xuICAgIHJlbmRlclNjYWxlID0gcmVuZGVyU2NhbGUgfHwgMTtcbiAgICAvLyBEcmF3IHNpbXBsZSBzaGFwZSwgaWYgZ2l2ZW5cbiAgICBpZiAodGhpcy5zaGFwZSkge1xuICAgICAgICB2YXIgbGluZUNvbG9yID0gUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMubGluZUNvbG9yKTtcbiAgICAgICAgaWYgKHJlbmRlclNjYWxlID09PSAxKSB7XG4gICAgICAgICAgICB2YXIgbGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaW5lV2lkdGggPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICgocmVuZGVyU2NhbGUgPT09IDEpICYmIHRoaXMuZmlsbENvbG9yKSB7ICAgICAgICAvLyBPbmx5IGZpbGwgZnVsbCBzaXplZFxuICAgICAgICAgICAgdmFyIGZpbGxDb2xvciA9IFBoYXNlci5Db2xvci5oZXhUb1JHQih0aGlzLmZpbGxDb2xvcik7XG4gICAgICAgICAgICB2YXIgZmlsbEFscGhhID0gdGhpcy5maWxsQWxwaGEgfHwgMTtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuYmVnaW5GaWxsKGZpbGxDb2xvciwgZmlsbEFscGhhKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVTdHlsZShsaW5lV2lkdGgsIGxpbmVDb2xvciwgMSk7XG4gICAgICAgIHRoaXMuX2RyYXdQb2x5Z29uKHRoaXMuc2hhcGUsIHRoaXMuc2hhcGVDbG9zZWQsIHJlbmRlclNjYWxlKTtcbiAgICAgICAgaWYgKChyZW5kZXJTY2FsZSA9PT0gMSkgJiYgdGhpcy5maWxsQ29sb3IpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuZW5kRmlsbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIERyYXcgZ2VvbWV0cnkgc3BlYywgaWYgZ2l2ZW4sIGJ1dCBvbmx5IGZvciB0aGUgZnVsbCBzaXplZCBzcHJpdGVcbiAgICBpZiAoKHJlbmRlclNjYWxlID09PSAxKSAmJiB0aGlzLmdlb21ldHJ5KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5nZW9tZXRyeS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBnID0gdGhpcy5nZW9tZXRyeVtpXTtcbiAgICAgICAgICAgIHN3aXRjaCAoZy50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcInBvbHlcIjpcbiAgICAgICAgICAgICAgICAgICAgLy8gRklYTUU6IGRlZmF1bHRzIGFuZCBzdHVmZlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmF3UG9seWdvbihnLnBvaW50cywgZy5jbG9zZWQsIHJlbmRlclNjYWxlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9kcmF3UG9seWdvbiA9IGZ1bmN0aW9uIChwb2ludHMsIGNsb3NlZCwgcmVuZGVyU2NhbGUpIHtcbiAgICB2YXIgc2MgPSB0aGlzLmdhbWUucGh5c2ljcy5wMi5tcHhpKHRoaXMudmVjdG9yU2NhbGUpKnJlbmRlclNjYWxlO1xuICAgIHBvaW50cyA9IHBvaW50cy5zbGljZSgpO1xuICAgIGlmIChjbG9zZWQpIHtcbiAgICAgICAgcG9pbnRzLnB1c2gocG9pbnRzWzBdKTtcbiAgICB9XG4gICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8ocG9pbnRzWzBdWzBdICogc2MsIHBvaW50c1swXVsxXSAqIHNjKTtcbiAgICBmb3IgKHZhciBpID0gMSwgbCA9IHBvaW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lVG8ocG9pbnRzW2ldWzBdICogc2MsIHBvaW50c1tpXVsxXSAqIHNjKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZlY3RvclNwcml0ZTtcbi8vU3RhcmNvZGVyLlZlY3RvclNwcml0ZSA9IFZlY3RvclNwcml0ZTsiLCIvKipcbiAqIENvbnRyb2xzLmpzXG4gKlxuICogVmlydHVhbGl6ZSBhbmQgaW1wbGVtZW50IHF1ZXVlIGZvciBnYW1lIGNvbnRyb2xzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcbmNvbnNvbGUubG9nKCdDb250cm9scycsIFN0YXJjb2Rlcik7XG5cbnZhciBDb250cm9scyA9IGZ1bmN0aW9uIChnYW1lLCBwYXJlbnQpIHtcbiAgICBQaGFzZXIuUGx1Z2luLmNhbGwodGhpcywgZ2FtZSwgcGFyZW50KTtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlBsdWdpbi5wcm90b3R5cGUpO1xuQ29udHJvbHMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29udHJvbHM7XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHF1ZXVlKSB7XG4gICAgdGhpcy5xdWV1ZSA9IHF1ZXVlO1xuICAgIHRoaXMuY29udHJvbHMgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xuICAgIHRoaXMuY29udHJvbHMuZmlyZSA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkIpO1xufTtcblxudmFyIHNlcSA9IDA7XG52YXIgdXAgPSBmYWxzZSwgZG93biA9IGZhbHNlLCBsZWZ0ID0gZmFsc2UsIHJpZ2h0ID0gZmFsc2UsIGZpcmUgPSBmYWxzZTtcblxuQ29udHJvbHMucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHVwID0gZG93biA9IGxlZnQgPSByaWdodCA9IGZhbHNlO1xuICAgIHRoaXMucXVldWUubGVuZ3RoID0gMDtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5wcmVVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gVE9ETzogU3VwcG9ydCBvdGhlciBpbnRlcmFjdGlvbnMvbWV0aG9kc1xuICAgIHZhciBjb250cm9scyA9IHRoaXMuY29udHJvbHM7XG4gICAgaWYgKGNvbnRyb2xzLnVwLmlzRG93biAmJiAhdXApIHtcbiAgICAgICAgdXAgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICd1cF9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghY29udHJvbHMudXAuaXNEb3duICYmIHVwKSB7XG4gICAgICAgIHVwID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3VwX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmIChjb250cm9scy5kb3duLmlzRG93biAmJiAhZG93bikge1xuICAgICAgICBkb3duID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZG93bl9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghY29udHJvbHMuZG93bi5pc0Rvd24gJiYgZG93bikge1xuICAgICAgICBkb3duID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2Rvd25fcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKGNvbnRyb2xzLnJpZ2h0LmlzRG93biAmJiAhcmlnaHQpIHtcbiAgICAgICAgcmlnaHQgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdyaWdodF9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghY29udHJvbHMucmlnaHQuaXNEb3duICYmIHJpZ2h0KSB7XG4gICAgICAgIHJpZ2h0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3JpZ2h0X3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmIChjb250cm9scy5sZWZ0LmlzRG93biAmJiAhbGVmdCkge1xuICAgICAgICBsZWZ0ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnbGVmdF9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghY29udHJvbHMubGVmdC5pc0Rvd24gJiYgbGVmdCkge1xuICAgICAgICBsZWZ0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2xlZnRfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKGNvbnRyb2xzLmZpcmUuaXNEb3duICYmICFmaXJlKSB7XG4gICAgICAgIGZpcmUgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdmaXJlX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFjb250cm9scy5maXJlLmlzRG93biAmJiBmaXJlKSB7XG4gICAgICAgIGZpcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZmlyZV9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5wcm9jZXNzUXVldWUgPSBmdW5jdGlvbiAoY2IsIGNsZWFyKSB7XG4gICAgdmFyIHF1ZXVlID0gdGhpcy5xdWV1ZTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHF1ZXVlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgYWN0aW9uID0gcXVldWVbaV07XG4gICAgICAgIGlmIChhY3Rpb24uZXhlY3V0ZWQpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNiKGFjdGlvbik7XG4gICAgICAgIGFjdGlvbi5ldGltZSA9IHRoaXMuZ2FtZS50aW1lLm5vdztcbiAgICAgICAgYWN0aW9uLmV4ZWN1dGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGNsZWFyKSB7XG4gICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgfVxufTtcblxuU3RhcmNvZGVyLkNvbnRyb2xzID0gQ29udHJvbHM7XG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xzOyIsIi8qKlxuICogU3luY0NsaWVudC5qc1xuICpcbiAqIFN5bmMgcGh5c2ljcyBvYmplY3RzIHdpdGggc2VydmVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcbnZhciBVUERBVEVfUVVFVUVfTElNSVQgPSA4O1xuXG52YXIgU3luY0NsaWVudCA9IGZ1bmN0aW9uIChnYW1lLCBwYXJlbnQpIHtcbiAgICBQaGFzZXIuUGx1Z2luLmNhbGwodGhpcywgZ2FtZSwgcGFyZW50KTtcbn07XG5cblN5bmNDbGllbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuUGx1Z2luLnByb3RvdHlwZSk7XG5TeW5jQ2xpZW50LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN5bmNDbGllbnQ7XG5cblN5bmNDbGllbnQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoc29ja2V0LCBxdWV1ZSkge1xuICAgIC8vIFRPRE86IENvcHkgc29tZSBjb25maWcgb3B0aW9uc1xuICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xuICAgIHRoaXMuY21kUXVldWUgPSBxdWV1ZTtcbiAgICB0aGlzLmV4dGFudCA9IHt9O1xufTtcblxuU3luY0NsaWVudC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBzdGFyY29kZXIgPSB0aGlzLmdhbWUuc3RhcmNvZGVyO1xuICAgIHRoaXMuX3VwZGF0ZUNvbXBsZXRlID0gZmFsc2U7XG4gICAgLy8gRklYTUU6IE5lZWQgbW9yZSByb2J1c3QgaGFuZGxpbmcgb2YgREMvUkNcbiAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5nYW1lLnBhdXNlZCA9IHRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ3JlY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5nYW1lLnBhdXNlZCA9IGZhbHNlO1xuICAgIH0pO1xuICAgIC8vIE1lYXN1cmUgY2xpZW50LXNlcnZlciB0aW1lIGRlbHRhXG4gICAgdGhpcy5zb2NrZXQub24oJ3RpbWVzeW5jJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgc2VsZi5fbGF0ZW5jeSA9IGRhdGEgLSBzZWxmLmdhbWUudGltZS5ub3c7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciByZWFsVGltZSA9IGRhdGEucjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBkYXRhLmIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdXBkYXRlID0gZGF0YS5iW2ldO1xuICAgICAgICAgICAgdmFyIGlkID0gdXBkYXRlLmlkO1xuICAgICAgICAgICAgdmFyIHNwcml0ZTtcbiAgICAgICAgICAgIHVwZGF0ZS50aW1lc3RhbXAgPSByZWFsVGltZTtcbiAgICAgICAgICAgIGlmIChzcHJpdGUgPSBzZWxmLmV4dGFudFtpZF0pIHtcbiAgICAgICAgICAgICAgICAvLyBFeGlzdGluZyBzcHJpdGUgLSBwcm9jZXNzIHVwZGF0ZVxuICAgICAgICAgICAgICAgIHNwcml0ZS51cGRhdGVRdWV1ZS5wdXNoKHVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHNwcml0ZS51cGRhdGVRdWV1ZS5sZW5ndGggPiBVUERBVEVfUVVFVUVfTElNSVQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBOZXcgc3ByaXRlIC0gY3JlYXRlIGFuZCBjb25maWd1cmVcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdOZXcnLCBpZCwgdXBkYXRlLnQpO1xuICAgICAgICAgICAgICAgIHNwcml0ZSA9IHN0YXJjb2Rlci5hZGRCb2R5KHVwZGF0ZS50LCB1cGRhdGUpO1xuICAgICAgICAgICAgICAgIGlmIChzcHJpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNlcnZlcklkID0gaWQ7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZXh0YW50W2lkXSA9IHNwcml0ZTtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlID0gW3VwZGF0ZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDAsIGwgPSBkYXRhLnJtLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaWQgPSBkYXRhLnJtW2ldO1xuICAgICAgICAgICAgaWYgKHNlbGYuZXh0YW50W2lkXSkge1xuICAgICAgICAgICAgICAgIHN0YXJjb2Rlci5yZW1vdmVCb2R5KHNlbGYuZXh0YW50W2lkXSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHNlbGYuZXh0YW50W2lkXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuU3luY0NsaWVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0cnVlIHx8ICF0aGlzLl91cGRhdGVDb21wbGV0ZSkge1xuICAgICAgICB0aGlzLl9zZW5kQ29tbWFuZHMoKTtcbiAgICAgICAgdGhpcy5fcHJvY2Vzc1BoeXNpY3NVcGRhdGVzKCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvbXBsZXRlID0gdHJ1ZTtcbiAgICB9XG4gfTtcblxuU3luY0NsaWVudC5wcm90b3R5cGUucG9zdFJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl91cGRhdGVDb21wbGV0ZSA9IGZhbHNlO1xufTtcblxuLyoqXG4gKiBTZW5kIHF1ZXVlZCBjb21tYW5kcyB0aGF0IGhhdmUgYmVlbiBleGVjdXRlZCB0byB0aGUgc2VydmVyXG4gKlxuICogQHByaXZhdGVcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUuX3NlbmRDb21tYW5kcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYWN0aW9ucyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSB0aGlzLmNtZFF1ZXVlLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgYWN0aW9uID0gdGhpcy5jbWRRdWV1ZVtpXTtcbiAgICAgICAgaWYgKGFjdGlvbi5leGVjdXRlZCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKGFjdGlvbik7XG4gICAgICAgICAgICB0aGlzLmNtZFF1ZXVlLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnZG8nLCBhY3Rpb25zKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnc2VuZGluZyBhY3Rpb25zJywgYWN0aW9ucyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVzIGludGVycG9sYXRpb24gLyBwcmVkaWN0aW9uIHJlc29sdXRpb24gZm9yIHBoeXNpY3MgYm9kaWVzXG4gKlxuICogQHByaXZhdGVcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUuX3Byb2Nlc3NQaHlzaWNzVXBkYXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaW50ZXJwVGltZSA9IHRoaXMuZ2FtZS50aW1lLm5vdyArIHRoaXMuX2xhdGVuY3kgLSB0aGlzLmdhbWUuc3RhcmNvZGVyLmNvbmZpZy5yZW5kZXJMYXRlbmN5O1xuICAgIHZhciBvaWRzID0gT2JqZWN0LmtleXModGhpcy5leHRhbnQpO1xuICAgIGZvciAodmFyIGkgPSBvaWRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBzcHJpdGUgPSB0aGlzLmV4dGFudFtvaWRzW2ldXTtcbiAgICAgICAgdmFyIHF1ZXVlID0gc3ByaXRlLnVwZGF0ZVF1ZXVlO1xuICAgICAgICB2YXIgYmVmb3JlID0gbnVsbCwgYWZ0ZXIgPSBudWxsO1xuXG4gICAgICAgIC8vdmFyIHRlbXAgPSBbXTtcbiAgICAgICAgLy92YXIgbGFzdHggPSBxdWV1ZVswXS54IHx8IDA7XG4gICAgICAgIC8vZm9yICh2YXIgayA9IDE7IGs8cXVldWUubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgLy8gICAgdGVtcC5wdXNoKHF1ZXVlW2tdLngtbGFzdHgpO1xuICAgICAgICAvLyAgICBsYXN0eCA9IHF1ZXVlW2tdLng7XG4gICAgICAgIC8vfVxuICAgICAgICAvL2NvbnNvbGUubG9nKGludGVycFRpbWUsICc8PicsIHRlbXApO1xuXG4gICAgICAgIC8vIEZpbmQgdXBkYXRlcyBiZWZvcmUgYW5kIGFmdGVyIGludGVycFRpbWVcbiAgICAgICAgdmFyIGogPSAxO1xuICAgICAgICB3aGlsZSAocXVldWVbal0pIHtcbiAgICAgICAgICAgIGlmIChxdWV1ZVtqXS50aW1lc3RhbXAgPiBpbnRlcnBUaW1lKSB7XG4gICAgICAgICAgICAgICAgYWZ0ZXIgPSBxdWV1ZVtqXTtcbiAgICAgICAgICAgICAgICBiZWZvcmUgPSBxdWV1ZVtqLTFdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaisrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm9uZSAtIHdlJ3JlIGJlaGluZC5cbiAgICAgICAgaWYgKCFiZWZvcmUgJiYgIWFmdGVyKSB7XG4gICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID49IDIpIHsgICAgLy8gVHdvIG1vc3QgcmVjZW50IHVwZGF0ZXMgYXZhaWxhYmxlPyBVc2UgdGhlbS5cbiAgICAgICAgICAgICAgICBiZWZvcmUgPSBxdWV1ZVtxdWV1ZS5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICBhZnRlciA9IHF1ZXVlW3F1ZXVlLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMYWdnaW5nJywgb2lkc1tpXSk7XG4gICAgICAgICAgICB9IGVsc2UgeyAgICAgICAgICAgICAgICAgICAgLy8gTm8/IEp1c3QgYmFpbFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCYWlsaW5nJywgb2lkc1tpXSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdPaycsIGludGVycFRpbWUsIHF1ZXVlLmxlbmd0aCk7XG4gICAgICAgICAgICBxdWV1ZS5zcGxpY2UoMCwgaiAtIDEpOyAgICAgLy8gVGhyb3cgb3V0IG9sZGVyIHVwZGF0ZXNcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzcGFuID0gYWZ0ZXIudGltZXN0YW1wIC0gYmVmb3JlLnRpbWVzdGFtcDtcbiAgICAgICAgdmFyIHQgPSAoaW50ZXJwVGltZSAtIGJlZm9yZS50aW1lc3RhbXApIC8gc3BhbjtcbiAgICAgICAgLy92YXIgb2xkeCA9IHNwcml0ZS5ib2R5LmRhdGEucG9zaXRpb25bMF07XG4gICAgICAgIC8vdmFyIHNjYWxlID0gMC4wNSAvIChhZnRlci53dGltZXN0YW1wIC0gYmVmb3JlLnd0aW1lc3RhbXApO1xuICAgICAgICAvL3Nwcml0ZS5ib2R5LmRhdGEucG9zaXRpb25bMF0gPSAtaGVybWl0ZShiZWZvcmUueCwgYWZ0ZXIueCwgYmVmb3JlLnZ4KnNwYW4sIGFmdGVyLnZ4KnNwYW4sIHQpO1xuICAgICAgICAvL3Nwcml0ZS5ib2R5LmRhdGEucG9zaXRpb25bMV0gPSAtaGVybWl0ZShiZWZvcmUueSwgYWZ0ZXIueSwgYmVmb3JlLnZ5KnNwYW4sIGFmdGVyLnZ5KnNwYW4sIHQpO1xuICAgICAgICAvL3Nwcml0ZS5ib2R5LmRhdGEuYW5nbGUgPSBoZXJtaXRlKGJlZm9yZS5hLCBhZnRlci5hLCBiZWZvcmUuYXYsIGFmdGVyLmF2LCB0KTtcbiAgICAgICAgc3ByaXRlLnNldFBvc0FuZ2xlKGxpbmVhcihiZWZvcmUueCwgYWZ0ZXIueCwgdCksIGxpbmVhcihiZWZvcmUueSwgYWZ0ZXIueSwgdCksIGxpbmVhcihiZWZvcmUuYSwgYWZ0ZXIuYSwgdCkpO1xuICAgICAgICAvL3Nwcml0ZS5ib2R5LmRhdGEucG9zaXRpb25bMF0gPSAtbGluZWFyKGJlZm9yZS54LCBhZnRlci54LCB0KTtcbiAgICAgICAgLy9zcHJpdGUuYm9keS5kYXRhLnBvc2l0aW9uWzFdID0gLWxpbmVhcihiZWZvcmUueSwgYWZ0ZXIueSwgdCk7XG4gICAgICAgIC8vc3ByaXRlLmJvZHkuZGF0YS5hbmdsZSA9IGxpbmVhcihiZWZvcmUuYSwgYWZ0ZXIuYSwgdCk7XG4gICAgICAgIC8vc3ByaXRlLmJvZHkuZGF0YS5wb3NpdGlvblswXSAtPSAwLjEwO1xuICAgICAgICAvL3Nwcml0ZS5ib2R5LmRhdGEucG9zaXRpb25bMV0gPSAtNTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnW3RdJywgYmVmb3JlLnRpbWVzdGFtcCwgaW50ZXJwVGltZSwgYWZ0ZXIudGltZXN0YW1wLCAnLScsIGFmdGVyLnRpbWVzdGFtcCAtIGJlZm9yZS50aW1lc3RhbXApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdbd10nLCBiZWZvcmUud3RpbWVzdGFtcCwgJyoqKioqJywgYWZ0ZXIud3RpbWVzdGFtcCwgJy0nLCBhZnRlci53dGltZXN0YW1wIC0gYmVmb3JlLnd0aW1lc3RhbXApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdbeF0nLCBiZWZvcmUueCwgLXNwcml0ZS5ib2R5LmRhdGEucG9zaXRpb25bMF0sIGFmdGVyLngpO1xuICAgICAgICAvL3ZhciBkeCA9IHNwcml0ZS5ib2R5LmRhdGEucG9zaXRpb25bMF0gLSBvbGR4LCBkdCA9IHRoaXMuZ2FtZS50aW1lLm5vdyAtIHRoaXMubGFzdFVwZGF0ZTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnRGVsdGE+JywgZHgsICcvJywgZHQsICc9JywgZHgvZHQpO1xuXG4gICAgfVxufTtcblxuLy8gSGVscGVyc1xuXG4vLyBGSVhNRSwgbWF5YmVcbmZ1bmN0aW9uIGhlcm1pdGUgKHAwLCBwMSwgdjAsIHYxLCB0KSB7XG4gICAgdmFyIHQyID0gdCp0O1xuICAgIHZhciB0MyA9IHQqdDI7XG4gICAgcmV0dXJuICgyKnQzIC0gMyp0MiArIDEpKnAwICsgKHQzIC0gMip0MiArIHQpKnYwICsgKC0yKnQzICsgMyp0MikqcDEgKyAodDMgLSB0MikqdjE7XG59XG5cbmZ1bmN0aW9uIGxpbmVhciAocDAsIHAxLCB0LCBzY2FsZSkge1xuICAgIHNjYWxlID0gc2NhbGUgfHwgMTtcbiAgICByZXR1cm4gcDAgKyAocDEgLSBwMCkqdCpzY2FsZTtcbn1cblxuU3RhcmNvZGVyLlNlcnZlclN5bmMgPSBTeW5jQ2xpZW50O1xubW9kdWxlLmV4cG9ydHMgPSBTeW5jQ2xpZW50OyIsIi8qKlxuICogQm9vdC5qc1xuICpcbiAqIEJvb3Qgc3RhdGUgZm9yIFN0YXJjb2RlclxuICogTG9hZCBhc3NldHMgZm9yIHByZWxvYWQgc2NyZWVuIGFuZCBjb25uZWN0IHRvIHNlcnZlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb250cm9scyA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvQ29udHJvbHMuanMnKTtcbnZhciBTeW5jQ2xpZW50ID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9TeW5jQ2xpZW50LmpzJyk7XG5cbnZhciBCb290ID0gZnVuY3Rpb24gKCkge307XG5cbkJvb3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbkJvb3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQm9vdDtcblxudmFyIF9jb25uZWN0ZWQgPSBmYWxzZTtcblxuQm9vdC5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL3RoaXMuZ2FtZS5zdGFnZS5kaXNhYmxlVmlzaWJpbGl0eUNoYW5nZSA9IHRydWU7XG4gICAgdGhpcy5nYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuUkVTSVpFO1xuICAgIHRoaXMuZ2FtZS5yZW5kZXJlci5yZW5kZXJTZXNzaW9uLnJvdW5kUGl4ZWxzID0gdHJ1ZTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHBTY2FsZSA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5waHlzaWNzU2NhbGU7XG4gICAgdmFyIGlwU2NhbGUgPSAxL3BTY2FsZTtcbiAgICB2YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmNvbmZpZyA9IHtcbiAgICAgICAgcHhtOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGlwU2NhbGUqYTtcbiAgICAgICAgfSxcbiAgICAgICAgbXB4OiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGZsb29yKHBTY2FsZSphKTtcbiAgICAgICAgfSxcbiAgICAgICAgcHhtaTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiAtaXBTY2FsZSphO1xuICAgICAgICB9LFxuICAgICAgICBtcHhpOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGZsb29yKC1wU2NhbGUqYSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vdGhpcy5zdGFyY29kZXIuY29udHJvbHMgPSB0aGlzLmdhbWUucGx1Z2lucy5hZGQoQ29udHJvbHMsXG4gICAgLy8gICAgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzID0gdGhpcy5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKENvbnRyb2xzLCB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy8gU2V0IHVwIHNvY2tldC5pbyBjb25uZWN0aW9uXG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0ID0gdGhpcy5zdGFyY29kZXIuaW8odGhpcy5zdGFyY29kZXIuY29uZmlnLnNlcnZlclVyaSArICcvc3luYycsXG4gICAgICAgIHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5pb0NsaWVudE9wdGlvbnMpO1xuICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldC5vbignc2VydmVyIHJlYWR5JywgZnVuY3Rpb24gKHBsYXllck1zZykge1xuICAgICAgICAvLyBGSVhNRTogSGFzIHRvIGludGVyYWN0IHdpdGggc2Vzc2lvbiBmb3IgYXV0aGVudGljYXRpb24gZXRjLlxuICAgICAgICBzZWxmLnN0YXJjb2Rlci5wbGF5ZXIgPSBwbGF5ZXJNc2c7XG4gICAgICAgIC8vc2VsZi5zdGFyY29kZXIuc3luY2NsaWVudCA9IHNlbGYuZ2FtZS5wbHVnaW5zLmFkZChTeW5jQ2xpZW50LFxuICAgICAgICAvLyAgICBzZWxmLnN0YXJjb2Rlci5zb2NrZXQsIHNlbGYuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICAgICAgc2VsZi5zdGFyY29kZXIuc3luY2NsaWVudCA9IHNlbGYuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihTeW5jQ2xpZW50LFxuICAgICAgICAgICAgc2VsZi5zdGFyY29kZXIuc29ja2V0LCBzZWxmLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgICAgIF9jb25uZWN0ZWQgPSB0cnVlO1xuICAgIH0pO1xufTtcblxuQm9vdC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChfY29ubmVjdGVkKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnc3BhY2UnKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb3Q7IiwiLyoqXG4gKiBTcGFjZS5qc1xuICpcbiAqIE1haW4gZ2FtZSBzdGF0ZSBmb3IgU3RhcmNvZGVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1NpbXBsZVBhcnRpY2xlLmpzJyk7XG52YXIgVGhydXN0R2VuZXJhdG9yID0gcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1RocnVzdEdlbmVyYXRvci5qcycpO1xudmFyIE1pbmlNYXAgPSByZXF1aXJlKCcuLi9waGFzZXJ1aS9NaW5pTWFwLmpzJyk7XG5cbnZhciBTcGFjZSA9IGZ1bmN0aW9uICgpIHt9O1xuXG5TcGFjZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuU3BhY2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3BhY2U7XG5cblNwYWNlLnByb3RvdHlwZS5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSh0aGlzLmdhbWUsIFRocnVzdEdlbmVyYXRvci50ZXh0dXJlS2V5LCAnI2ZmNjYwMCcsIDgpO1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSh0aGlzLmdhbWUsICdidWxsZXQnLCAnIzk5OTk5OScsIDQpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdwbGF5ZXJ0aHJ1c3QnLCAnYXNzZXRzL3NvdW5kcy90aHJ1c3RMb29wLm9nZycpO1xuICAgIC8vdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2JpdHNoaXAnLCAnYXNzZXRzL3NoaXAucG5nJyk7XG59O1xuXG5TcGFjZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBybmcgPSB0aGlzLmdhbWUucm5kO1xuICAgIHZhciB3YiA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy53b3JsZEJvdW5kcztcbiAgICB2YXIgcHMgPSB0aGlzLnN0YXJjb2Rlci5jb25maWcucGh5c2ljc1NjYWxlO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLlAySlMpO1xuICAgIHRoaXMud29ybGQuc2V0Qm91bmRzLmNhbGwodGhpcy53b3JsZCwgd2JbMF0qcHMsIHdiWzFdKnBzLCAod2JbMl0td2JbMF0pKnBzLCAod2JbM10td2JbMV0pKnBzKTtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5wMi5zZXRCb3VuZHNUb1dvcmxkKHRydWUsIHRydWUsIHRydWUsIHRydWUsIGZhbHNlKTtcblxuICAgIC8vIERlYnVnZ2luZ1xuICAgIHRoaXMuZ2FtZS50aW1lLmFkdmFuY2VkVGltaW5nID0gdHJ1ZTtcblxuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzLnJlc2V0KCk7XG5cbiAgICAvLyBTb3VuZHNcbiAgICB0aGlzLmdhbWUuc291bmRzID0ge307XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdwbGF5ZXJ0aHJ1c3QnLCAxLCB0cnVlKTtcblxuICAgIC8vIEJhY2tncm91bmRcbiAgICB2YXIgc3RhcmZpZWxkID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSg2MDAsIDYwMCk7XG4gICAgZHJhd1N0YXJGaWVsZChzdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLmdhbWUuYWRkLnRpbGVTcHJpdGUod2JbMF0qcHMsIHdiWzFdKnBzLCAod2JbMl0td2JbMF0pKnBzLCAod2JbM10td2JbMV0pKnBzLCBzdGFyZmllbGQpO1xuXG4gICAgdGhpcy5zdGFyY29kZXIuc3luY2NsaWVudC5zdGFydCgpO1xuICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldC5lbWl0KCdjbGllbnQgcmVhZHknKTtcblxuICAgIC8vIEdyb3VwcyBmb3IgcGFydGljbGUgZWZmZWN0c1xuICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3IgPSBuZXcgVGhydXN0R2VuZXJhdG9yKHRoaXMuZ2FtZSk7XG5cbiAgICAvLyBHcm91cCBmb3IgZ2FtZSBvYmplY3RzXG4gICAgdGhpcy5nYW1lLnBsYXlmaWVsZCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgIC8vIFVJXG4gICAgdGhpcy5nYW1lLnVpID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgIHRoaXMuZ2FtZS51aS5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcblxuICAgIC8vIEludmVudG9yeVxuICAgIHZhciBsYWJlbCA9IHRoaXMuZ2FtZS5tYWtlLnRleHQoMTcwMCwgMjUsICdJTlZFTlRPUlknLCB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2ZmOTkwMCcsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIGxhYmVsLmFuY2hvci5zZXRUbygwLjUpO1xuICAgIHRoaXMuZ2FtZS51aS5hZGQobGFiZWwpO1xuICAgIHRoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0ID0gdGhpcy5nYW1lLm1ha2UudGV4dCgxNzAwLCA1MCwgJzAgY3J5c3RhbHMnLFxuICAgICAgICB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2NjYzAwMCcsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIHRoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0LmFuY2hvci5zZXRUbygwLjUpO1xuICAgIHRoaXMuZ2FtZS51aS5hZGQodGhpcy5nYW1lLmludmVudG9yeXRleHQpO1xuXG4gICAgLy9NaW5pTWFwXG4gICAgdGhpcy5nYW1lLm1pbmltYXAgPSBuZXcgTWluaU1hcCh0aGlzLmdhbWUsIDMwMCwgMzAwKTtcbiAgICB0aGlzLmdhbWUudWkuYWRkKHRoaXMuZ2FtZS5taW5pbWFwKTtcbiAgICB0aGlzLmdhbWUueCA9IDEwO1xuICAgIHRoaXMuZ2FtZS55ID0gMTA7XG5cbiAgICAvLyBIZWxwZXJzXG4gICAgZnVuY3Rpb24gcmFuZG9tTm9ybWFsICgpIHtcbiAgICAgICAgdmFyIHQgPSAwO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8NjsgaSsrKSB7XG4gICAgICAgICAgICB0ICs9IHJuZy5ub3JtYWwoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdC82O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdTdGFyIChjdHgsIHgsIHksIGQsIGNvbG9yKSB7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oeC1kKzEsIHktZCsxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4K2QtMSwgeStkLTEpO1xuICAgICAgICBjdHgubW92ZVRvKHgtZCsxLCB5K2QtMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeCtkLTEsIHktZCsxKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LCB5LWQpO1xuICAgICAgICBjdHgubGluZVRvKHgsIHkrZCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oeC1kLCB5KTtcbiAgICAgICAgY3R4LmxpbmVUbyh4K2QsIHkpO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhd1N0YXJGaWVsZCAoY3R4LCBzaXplLCBuKSB7XG4gICAgICAgIHZhciB4bSA9IE1hdGgucm91bmQoc2l6ZS8yICsgcmFuZG9tTm9ybWFsKCkqc2l6ZS80KTtcbiAgICAgICAgdmFyIHltID0gTWF0aC5yb3VuZChzaXplLzIgKyByYW5kb21Ob3JtYWwoKSpzaXplLzQpO1xuICAgICAgICB2YXIgcXVhZHMgPSBbWzAsMCx4bS0xLHltLTFdLCBbeG0sMCxzaXplLTEseW0tMV0sXG4gICAgICAgICAgICBbMCx5bSx4bS0xLHNpemUtMV0sIFt4bSx5bSxzaXplLTEsc2l6ZS0xXV07XG4gICAgICAgIHZhciBjb2xvcjtcbiAgICAgICAgdmFyIGksIGosIGwsIHE7XG5cbiAgICAgICAgbiA9IE1hdGgucm91bmQobi80KTtcbiAgICAgICAgZm9yIChpPTAsIGw9cXVhZHMubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgICAgICAgICAgcSA9IHF1YWRzW2ldO1xuICAgICAgICAgICAgZm9yIChqPTA7IGo8bjsgaisrKSB7XG4gICAgICAgICAgICAgICAgY29sb3IgPSAnaHNsKDYwLDEwMCUsJyArIHJuZy5iZXR3ZWVuKDkwLDk5KSArICclKSc7XG4gICAgICAgICAgICAgICAgZHJhd1N0YXIoY3R4LFxuICAgICAgICAgICAgICAgICAgICBybmcuYmV0d2VlbihxWzBdKzcsIHFbMl0tNyksIHJuZy5iZXR3ZWVuKHFbMV0rNywgcVszXS03KSxcbiAgICAgICAgICAgICAgICAgICAgcm5nLmJldHdlZW4oMiw0KSwgY29sb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59O1xuXG5TcGFjZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEZJWE1FOiBqdXN0IGEgbWVzcyBmb3IgdGVzdGluZ1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLnN0YXJjb2Rlci5jb250cm9scy5wcm9jZXNzUXVldWUoZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgaWYgKGEudHlwZSA9PT0gJ3VwX3ByZXNzZWQnKSB7XG4gICAgICAgICAgICBzZWxmLmdhbWUucGxheWVyU2hpcC5sb2NhbFN0YXRlLnRocnVzdCA9ICdzdGFydGluZyc7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnBsYXkoKTtcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnRocnVzdGdlbmVyYXRvci5zdGFydE9uKHNlbGYuZ2FtZS5wbGF5ZXJTaGlwKTtcbiAgICAgICAgfSBlbHNlIGlmIChhLnR5cGUgPT09ICd1cF9yZWxlYXNlZCcpIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLmxvY2FsU3RhdGUudGhydXN0ID0gJ3NodXRkb3duJztcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3Quc3RvcCgpO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUudGhydXN0Z2VuZXJhdG9yLnN0b3BPbihzZWxmLmdhbWUucGxheWVyU2hpcCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cblNwYWNlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy9jb25zb2xlLmxvZygnK3JlbmRlcisnKTtcbiAgICAvL2lmICh0aGlzLnN0YXJjb2Rlci50ZW1wc3ByaXRlKSB7XG4gICAgLy8gICAgdmFyIGQgPSB0aGlzLnN0YXJjb2Rlci50ZW1wc3ByaXRlLnBvc2l0aW9uLnggLSB0aGlzLnN0YXJjb2Rlci50ZW1wc3ByaXRlLnByZXZpb3VzUG9zaXRpb24ueDtcbiAgICAvLyAgICBjb25zb2xlLmxvZygnRGVsdGEnLCBkLCB0aGlzLmdhbWUudGltZS5lbGFwc2VkLCBkIC8gdGhpcy5nYW1lLnRpbWUuZWxhcHNlZCk7XG4gICAgLy99XG4gICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcbiAgICB0aGlzLmdhbWUuZGVidWcudGV4dCgnRnBzOiAnICsgdGhpcy5nYW1lLnRpbWUuZnBzLCA1LCAyMCk7XG4gICAgLy90aGlzLmdhbWUuZGVidWcuY2FtZXJhSW5mbyh0aGlzLmdhbWUuY2FtZXJhLCAxMDAsIDIwKTtcbiAgICAvL2lmICh0aGlzLnNoaXApIHtcbiAgICAvLyAgICB0aGlzLmdhbWUuZGVidWcuc3ByaXRlSW5mbyh0aGlzLnNoaXAsIDQyMCwgMjApO1xuICAgIC8vfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGFjZTtcbiIsIi8qKlxuICogTWluaU1hcC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBNaW5pTWFwID0gZnVuY3Rpb24gKGdhbWUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIHZhciB4ciA9IHdpZHRoIC8gdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJXaWR0aDtcbiAgICB2YXIgeXIgPSBoZWlnaHQgLyB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckhlaWdodDtcbiAgICBpZiAoeHIgPD0geXIpIHtcbiAgICAgICAgdGhpcy5tYXBTY2FsZSA9IHhyO1xuICAgICAgICB0aGlzLnhPZmZzZXQgPSAteHIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckxlZnQ7XG4gICAgICAgIHRoaXMueU9mZnNldCA9IC14ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyVG9wICsgKGhlaWdodCAtIHhyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJIZWlnaHQpIC8gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1hcFNjYWxlID0geXI7XG4gICAgICAgIHRoaXMueU9mZnNldCA9IC15ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyVG9wO1xuICAgICAgICB0aGlzLnhPZmZzZXQgPSAteXIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckxlZnQgKyAod2lkdGggLSB5ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyV2lkdGgpIC8gMjtcbiAgICB9XG5cbiAgICB0aGlzLmdyYXBoaWNzID0gZ2FtZS5tYWtlLmdyYXBoaWNzKDAsIDApO1xuICAgIHRoaXMuZ3JhcGhpY3MuYmVnaW5GaWxsKDB4MDBmZjAwLCAwLjIpO1xuICAgIHRoaXMuZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgdGhpcy5ncmFwaGljcy5lbmRGaWxsKCk7XG4gICAgdGhpcy5ncmFwaGljcy5jYWNoZUFzQml0bWFwID0gdHJ1ZTtcbiAgICB0aGlzLmFkZCh0aGlzLmdyYXBoaWNzKTtcbn07XG5cbk1pbmlNYXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbk1pbmlNYXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWluaU1hcDtcblxuTWluaU1hcC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vdGhpcy50ZXh0dXJlLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIDAsIDAsIHRydWUpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5nYW1lLnBsYXlmaWVsZC5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGJvZHkgPSB0aGlzLmdhbWUucGxheWZpZWxkLmNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoIWJvZHkubWluaXNwcml0ZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgYm9keS5taW5pc3ByaXRlLnggPSB0aGlzLndvcmxkVG9NbVgoYm9keS54KTtcbiAgICAgICAgYm9keS5taW5pc3ByaXRlLnkgPSB0aGlzLndvcmxkVG9NbVkoYm9keS55KTtcbiAgICAgICAgYm9keS5taW5pc3ByaXRlLmFuZ2xlID0gYm9keS5hbmdsZTtcbiAgICAvLyAgICB2YXIgeCA9IDEwMCArIGJvZHkueCAvIDQwO1xuICAgIC8vICAgIHZhciB5ID0gMTAwICsgYm9keS55IC8gNDA7XG4gICAgLy8gICAgdGhpcy50ZXh0dXJlLnJlbmRlclhZKGJvZHkuZ3JhcGhpY3MsIHgsIHksIGZhbHNlKTtcbiAgICB9XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZS53b3JsZFRvTW1YID0gZnVuY3Rpb24gKHgpIHtcbiAgICByZXR1cm4geCAqIHRoaXMubWFwU2NhbGUgKyB0aGlzLnhPZmZzZXQ7XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZS53b3JsZFRvTW1ZID0gZnVuY3Rpb24gKHkpIHtcbiAgICByZXR1cm4geSAqIHRoaXMubWFwU2NhbGUgKyB0aGlzLnlPZmZzZXQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1pbmlNYXA7Il19
