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
 * BlocklyCustom.js
 *
 * Definitions and code generation for StarCoder oriented blocks
 */
'use strict';

/**
 * Set scale of player ship
 * @type {{init: Function}}
 */
Blockly.Blocks['sc_set_scale'] = {
    init: function () {
        this.setColour(160);
        this.appendValueInput('VALUE')
            .setCheck('Number')
            .appendField('set ship scale');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

/**
 * Code generation for set_scale
 *
 * @param block
 * @returns {string}
 */
Blockly.JavaScript['sc_set_scale'] = function (block) {
    var arg = block.getFieldValue('VALUE');
    return 'setScale(' + arg + ')';
};

/**
 * Block representing an ordered pair of coordinates
 */
Blockly.Blocks['sc_pair'] = {
    init: function () {
        this.appendDummyInput()
            .appendField('(')
            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'X')
            .appendField(',')
            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'Y')
            .appendField(')');
        this.setColour(160);
        this.setNextStatement(true, 'Pair');
        this.setPreviousStatement(true, 'Pair');
    }
};

/**
 * Code generation for pair is a NOOP bc it has no meaning outside of a container
 */
Blockly.JavaScript['sc_pair'] = function (block) {
    return null;
};

/**
 * Block representing a set of ordered pairs to be used as the player's shape
 */
Blockly.Blocks['sc_change_shape'] = {
    init: function () {
        this.setColour(300);
        this.appendDummyInput()
            .appendField('player shape');
        this.appendStatementInput('PAIRS')
            .setCheck('Pair');
    }
};

/**
 * Generate code for ordered pair blocks
 * Bypass normal Blockly code generation methods bc our pair values are
 * 'statements' in Blockly-speak
 */
Blockly.JavaScript['sc_change_shape'] = function (block) {
    var x, y;
    var pairList = [];
    var pairBlock = block.getInputTargetBlock('PAIRS');
    while (pairBlock) {
        if (pairBlock.type === 'sc_pair') {
            x = pairBlock.getFieldValue('X');
            y = pairBlock.getFieldValue('Y');
        } else {
            x = Blockly.JavaScript.valueToCode(pairBlock, 'X', Blockly.JavaScript.ORDER_COMMA) || '0';
            y = Blockly.JavaScript.valueToCode(pairBlock, 'Y', Blockly.JavaScript.ORDER_COMMA) || '0';
        }
        pairList.push('[' + x + ',' + y + ']');
        pairBlock = pairBlock.nextConnection && pairBlock.nextConnection.targetBlock();
    }
    if (pairList.length > 2) {
        // Don't generate code for fewer than 3 points
        return 'changeShape([' + pairList.join(',') + '])';
    }
    return null;
};

/**
 * set ship thrust power
 * @type {{init: Function}}
 */
Blockly.Blocks['sc_set_thrust_power'] = {
    init: function () {
        this.setColour(160);
        this.appendValueInput('VALUE')
            .setCheck('Number')
            .appendField('set ship thrust force');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

/**
 * Code generation for set_thrust_power
 *
 * @param block
 * @returns {string}
 */
Blockly.JavaScript['sc_set_thrust_power'] = function (block) {
    var arg = block.getFieldValue('VALUE');
    return 'setThrustForce(' + arg + ')';
};

/**
 * create new planet
 */
Blockly.Blocks['sc_new_planet'] = {
    init: function () {
        this.setColour(120);
        this.appendDummyInput()
            .appendField('new planet');
        this.appendDummyInput()
            .appendField('x')
            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'X')
            .appendField('y')
            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'Y');
        this.appendDummyInput()
            .appendField('scale')
            .appendField(new Blockly.FieldTextInput('2', Blockly.FieldTextInput.numberValidator), 'SCALE');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

/**
 * code generation for new planet
 */
Blockly.JavaScript['sc_new_planet'] = function (block) {
    var x = block.getFieldValue('X');
    var y = block.getFieldValue('Y');
    var scale = block.getFieldValue('SCALE');
    return 'newPlanet(' + x + ',' + y + ',' + scale + ')';
};

/**
 * set ship color
 */
Blockly.Blocks['sc_set_color'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField('ship color')
            .appendField(new Blockly.FieldColour('#ff0000'), 'COLOR');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

/**
 * code generation for set color
 */
Blockly.JavaScript['sc_set_color'] = function (block) {
    var color = block.getFieldValue('COLOR');
    return 'changeColor(\'' + color + '\')';
};
},{}],3:[function(require,module,exports){
/**
 * Starcoder-client.js
 *
 * Starcoder master object extended with client only properties and methods
 */
'use strict';

var Starcoder = require('./Starcoder.js');

var WorldApi = require('./client-components/WorldApi.js');
var DOMInterface = require('./client-components/DOMInterface.js');
var CodeEndpointClient = require('./client-components/CodeEndpointClient.js');

Starcoder.mixinPrototype(Starcoder.prototype, WorldApi.prototype);
Starcoder.mixinPrototype(Starcoder.prototype, DOMInterface.prototype);
Starcoder.mixinPrototype(Starcoder.prototype, CodeEndpointClient.prototype);

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
    this.initDOMInterface();
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

},{"./Starcoder.js":4,"./client-components/CodeEndpointClient.js":5,"./client-components/DOMInterface.js":6,"./client-components/WorldApi.js":7,"./phaserstates/Boot.js":25,"./phaserstates/Space.js":26}],4:[function(require,module,exports){
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
    serverUri: process.env.NODE_ENV == 'development' ? 'http://localhost:8081' : 'http://pharcoder-single.elasticbeanstalk.com:8081',
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

}).call(this,require('_process'))

},{"_process":1}],5:[function(require,module,exports){
/**
 * CodeEndpointClient.js
 *
 * Methods for sending code to server and dealing with code related responses
 */

var CodeEndpointClient = function () {};

CodeEndpointClient.prototype.sendCode = function (code) {
    this.socket.emit('code', code);
};

module.exports = CodeEndpointClient;
},{}],6:[function(require,module,exports){
/**
 * DOMInterface.js
 *
 * Handle DOM configuration/interaction, i.e. non-Phaser stuff
 */
'use strict';

var DOMInterface = function () {};

DOMInterface.prototype.initDOMInterface = function () {
    var self = this;
    this.dom = {};              // namespace
    this.dom.codeButton = document.getElementById('code-btn');
    this.dom.codePopup = document.getElementById('code-popup');
    this.dom.codeSend = document.getElementById('code-send');
    this.dom.blocklyWorkspace = document.getElementById('blockly-workspace');
    //this.dom.codeText = document.getElementById('code-text');

    //this.dom.codeText.addEventListener('focus', function () {
    //    self.game.input.enabled = false;
    //});
    //
    //this.dom.codeText.addEventListener('blur', function () {
    //    self.game.input.enabled = true;
    //});

    this.dom.codeButton.addEventListener('click', function () {
        self.toggle(self.dom.codePopup);
        Blockly.fireUiEvent(self.dom.blocklyWorkspace, 'resize');
    });

    this.dom.codeSend.addEventListener('click', function () {
        //self.sendCode(self.dom.codeText.value);
        console.log(Blockly.JavaScript.workspaceToCode(self.blocklyWorkspace));
        self.sendCode(Blockly.JavaScript.workspaceToCode(self.blocklyWorkspace));
    });

    // Initialize blockly
    this.blocklyWorkspace = Blockly.inject('blockly-workspace',
        {toolbox: document.getElementById('toolbox')});
    console.log('bd', this.blocklyWorkspace);

    this.toggle(this.dom.codePopup, false);

};

/**
 * Set/toggle visibility of element
 *
 * @param el {object} - element to set
 * @param state {?boolean} - show (true), hide (false), toggle (undefined)
 */
DOMInterface.prototype.toggle = function (el, state) {
    var display = el.style.display;
    if (!el.origDisplay) {
        if (display !== 'none') {
            el.origDisplay = display;
        } else {
            el.origDisplay = 'block';
        }
    }
    if (typeof state === 'undefined') {
        state = (display === 'none');
    }
    if (state) {
        el.style.display = el.origDisplay;
    } else {
        el.style.display = 'none';
    }
}

module.exports = DOMInterface;

},{}],7:[function(require,module,exports){
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
    GenericOrb: require('../phaserbodies/GenericOrb.js'),
    Planetoid: require('../phaserbodies/Planetoid.js'),
    Tree: require('../phaserbodies/Tree.js')
};

/**
 * Add body to world on client side
 *
 * @param type {string} - type name of object to add
 * @param config {object} - properties for new object
 * @returns {Phaser.Sprite} - newly added object
 */

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

/**
 * Remove body from game world
 *
 * @param sprite {Phaser.Sprite} - object to remove
 */
WorldApi.prototype.removeBody = function (sprite) {
    sprite.kill();
    // Remove minisprite
    if (sprite.minisprite) {
        sprite.minisprite.kill();
    }
    this.game.physics.p2.removeBody(sprite.body);
};

/**
 * Configure object with given properties
 *
 * @param properties {object}
 */
//WorldApi.prototype.configure = function (properties) {
//    for (var k in this.updateProperties) {
//        this[k] = properties[k];
//    }
//};

module.exports = WorldApi;

},{"../phaserbodies/Asteroid.js":11,"../phaserbodies/Bullet.js":12,"../phaserbodies/Crystal.js":13,"../phaserbodies/GenericOrb.js":14,"../phaserbodies/Planetoid.js":15,"../phaserbodies/Ship.js":16,"../phaserbodies/Tree.js":21}],8:[function(require,module,exports){
/** client.js
 *
 * Main entry point for Starcoder game client
 *
 * @type {Starcoder|exports}
 */

require('./BlocklyCustom.js');

var Starcoder = require('./Starcoder-client.js');


localStorage.debug = '';                        // used to toggle socket.io debugging

document.addEventListener('DOMContentLoaded', function () {
    var starcoder = new Starcoder();
    starcoder.start();
});

},{"./BlocklyCustom.js":2,"./Starcoder-client.js":3}],9:[function(require,module,exports){
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

exports.square0 = [
    [-1,-2],
    [2,-1],
    [1,2],
    [-2,1]
];

exports.square1 = [
    [1,-2],
    [2,1],
    [-1,2],
    [-2,-1]
];

exports.OCTRADIUS = Math.sqrt(5);
},{}],10:[function(require,module,exports){
/**
 * UpdateProperties.js
 *
 * Client/server syncable properties for game objects
 */
'use strict';

var Ship = function () {};
Ship.prototype.updateProperties = ['lineWidth', 'lineColor', 'fillColor', 'fillAlpha',
    'vectorScale', 'shape', 'shapeClosed', 'playerid', 'crystals', 'dead'];

var Asteroid = function () {};
Asteroid.prototype.updateProperties = ['vectorScale'];

var Crystal = function () {};
Crystal.prototype.updateProperties = ['vectorScale'];

var GenericOrb = function () {};
GenericOrb.prototype.updateProperties = ['lineColor', 'vectorScale'];

var Planetoid = function () {};
Planetoid.prototype.updateProperties = ['lineColor', 'fillColor', 'lineWidth', 'fillAlpha', 'vectorScale', 'owner'];

var Tree = function () {};
Tree.prototype.updateProperties = ['vectorScale', 'lineColor', 'graph', 'step'];

var Bullet = function () {};
Bullet.prototype.updateProperties = [];

exports.Ship = Ship;
exports.Asteroid = Asteroid;
exports.Crystal = Crystal;
exports.GenericOrb = GenericOrb;
exports.Bullet = Bullet;
exports.Planetoid = Planetoid;
exports.Tree = Tree;


},{}],11:[function(require,module,exports){
/**
 * Asteroid.js
 *
 * Client side
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

Asteroid.prototype._lineColor = '#ff00ff';
Asteroid.prototype._fillColor = '#00ff00';
Asteroid.prototype._shapeClosed = true;
Asteroid.prototype._lineWidth = 1;
Asteroid.prototype._fillAlpha = 0.25;
Asteroid.prototype._shape = Paths.octagon;

module.exports = Asteroid;
//Starcoder.Asteroid = Asteroid;

},{"../Starcoder.js":4,"../common/Paths.js":9,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":18,"./VectorSprite.js":22}],12:[function(require,module,exports){
/**
 * Bullet.js
 *
 * Client side implementation of simple projectile
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var SimpleParticle = require('./SimpleParticle.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var UpdateProperties = require('../common/UpdateProperties.js').Bullet;

var Bullet = function (game, config) {
    SimpleParticle.call(this, game, 'bullet');
    this.setPosAngle(config.x, config.y, config.a);
};

Bullet.prototype = Object.create(SimpleParticle.prototype);
Bullet.prototype.constructor = Bullet;

Starcoder.mixinPrototype(Bullet.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(Bullet.prototype, UpdateProperties.prototype);

module.exports = Bullet;
},{"../Starcoder.js":4,"../common/UpdateProperties.js":10,"./SimpleParticle.js":17,"./SyncBodyInterface.js":18}],13:[function(require,module,exports){
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

Crystal.prototype._lineColor = '#00ffff';
Crystal.prototype._fillColor = '#000000';
Crystal.prototype._shapeClosed = true;
Crystal.prototype._lineWidth = 1;
Crystal.prototype._fillAlpha = 0.0;
Crystal.prototype._shape = Paths.octagon;
Crystal.prototype._geometry = [
    {type: 'poly', closed: true, points: Paths.d2cross}
];


module.exports = Crystal;

},{"../Starcoder.js":4,"../common/Paths.js":9,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":18,"./VectorSprite.js":22}],14:[function(require,module,exports){
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

GenericOrb.prototype._lineColor = '#ff0000';
GenericOrb.prototype._fillColor = '#000000';
GenericOrb.prototype._shapeClosed = true;
GenericOrb.prototype._lineWidth = 1;
GenericOrb.prototype._fillAlpha = 0.0;
GenericOrb.prototype._shape = Paths.octagon;

GenericOrb.prototype._geometry = [
    {type: 'poly', closed: true, points: Paths.d2cross}
];

module.exports = GenericOrb;

},{"../Starcoder.js":4,"../common/Paths.js":9,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":18,"./VectorSprite.js":22}],15:[function(require,module,exports){
/**
 * Planetoid.js
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var UpdateProperties = require('../common/UpdateProperties.js').Planetoid;
var Paths = require('../common/Paths.js');

var Planetoid = function (game, config) {
    VectorSprite.call(this, game, config);
};

Planetoid.add = function (game, options) {
    var planetoid = new Planetoid(game, options);
    game.add.existing(a);
    return planetoid;
};

Planetoid.prototype = Object.create(VectorSprite.prototype);
Planetoid.prototype.constructor = Planetoid;

Starcoder.mixinPrototype(Planetoid.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(Planetoid.prototype, UpdateProperties.prototype);

//Planetoid.prototype._lineColor = '#ff00ff';
//Planetoid.prototype._fillColor = '#00ff00';
//Planetoid.prototype._lineWidth = 1;
//Planetoid.prototype._fillAlpha = 0.25;
Planetoid.prototype._shape = Paths.octagon;
Planetoid.prototype._shapeClosed = true;
Planetoid.prototype._geometry = [
    {type: 'poly', closed: true, points: Paths.d2cross},
    {type: 'poly', closed: true, points: Paths.square0},
    {type: 'poly', closed: true, points: Paths.square1}
];

module.exports = Planetoid;

},{"../Starcoder.js":4,"../common/Paths.js":9,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":18,"./VectorSprite.js":22}],16:[function(require,module,exports){
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
    this.tagText = game.add.text(0, this.texture.height/2 + 1,
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
//Ship.prototype._lineWidth = 6;

Ship.prototype.updateAppearance = function () {
    // FIXME: Probably need to refactor constructor a bit to make this cleaner
    VectorSprite.prototype.updateAppearance.call(this);
    if (this.tagText) {
        //this.tagText.setStyle({fill: this.lineColor});
        this.tagText.fill = this.lineColor;
        this.tagText.y = this.texture.height/2 + 1;
    }
};

Ship.prototype.update = function () {
    VectorSprite.prototype.update.call(this);
    // FIXME: Need to deal with player versus foreign ships
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
    // Player ship only
    this.game.inventorytext.setText(this.crystals);
};

module.exports = Ship;
//Starcoder.Ship = Ship;

},{"../Starcoder.js":4,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":18,"./VectorSprite.js":22}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
        if (typeof properties[k] !== 'undefined') {
            this[k] = properties[k];        // FIXME? Virtualize somehow
        }
    }
};

module.exports = SyncBodyInterface;
},{}],19:[function(require,module,exports){
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
},{"./SimpleParticle.js":17}],20:[function(require,module,exports){
/**
 * Toast.js
 *
 * Class for various kinds of pop up messages
 */
'use strict';

var Toast = function (game, x, y, text, config) {
    // TODO: better defaults, maybe
    Phaser.Text.call(this, game, x, y, text, {
        font: '14pt Arial',
        align: 'center',
        fill: '#ffa500'
    });
    this.anchor.setTo(0.5, 0.5);
    // Set up styles and tweens
    var spec = {};
    if (config.up) {
        spec.y = '-' + config.up;
    }
    if (config.down) {
        spec.y = '+' + config.up;
    }
    if (config.left) {
        spec.x = '-' + config.up;
    }
    if (config.right) {
        spec.x = '+' + config.up;
    }
    switch (config.type) {
        case 'spinner':
            this.fontSize = '20pt';
            spec.rotation = config.revolutions ? config.revolutions * 2 * Math.PI : 2 * Math.PI;
            var tween = game.add.tween(this).to(spec, config.duration, config.easing, true);
            tween.onComplete.add(function (toast) {
                toast.kill();
            });
            break;
            // TODO: More kinds
    }
};

/**
 * Create new Toast and add to game
 *
 * @param game
 * @param x
 * @param y
 * @param text
 * @param config
 */
Toast.add = function (game, x, y, text, config) {
    var toast = new Toast(game, x, y, text, config);
    game.add.existing(toast);
};

// Covenience methods for common cases

Toast.spinUp = function (game, x, y, text) {
    var toast = new Toast (game, x, y, text, {
        type: 'spinner',
        revolutions: 1,
        duration: 500,
        easing: Phaser.Easing.Elastic.Out,
        up: 100
    });
    game.add.existing(toast);
};

Toast.prototype = Object.create(Phaser.Text.prototype);
Toast.prototype.constructor = Toast;

module.exports = Toast;

},{}],21:[function(require,module,exports){
/**
 * Tree.js
 *
 * Client side
 */

var Starcoder = require('../Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var UpdateProperties = require('../common/UpdateProperties.js').Tree;

var Tree = function (game, config) {
    VectorSprite.call(this, game, config);
    this.anchor.setTo(0.5, 1);
};

Tree.add = function (game, config) {
    var tree = new Tree (game, config);
    game.add.existing(tree);
    return tree;
};

Tree.prototype = Object.create(VectorSprite.prototype);
Tree.prototype.constructor = Tree;

Starcoder.mixinPrototype(Tree.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(Tree.prototype, UpdateProperties.prototype);

/**
 * Draw tree, overriding standard shape and geometry method to use graph
 *
 * @param renderScale
 */
Tree.prototype.drawProcedure = function (renderScale) {
    var lineColor = Phaser.Color.hexToRGB(this.lineColor);
    this.graphics.lineStyle(1, lineColor, 1);
    this._drawBranch(this.graph, this.game.physics.p2.mpxi(this.vectorScale)*renderScale, 5);
};

Tree.prototype._drawBranch = function (graph, sc, depth) {
    for (var i = 0, l = graph.c.length; i < l; i++) {
        var child = graph.c[i];
        this.graphics.moveTo(graph.x * sc, graph.y * sc);
        this.graphics.lineTo(child.x * sc, child.y * sc);
        if (depth > this.step) {
            this._drawBranch(child, sc, depth - 1);
        }
    }
};

Object.defineProperty(Tree.prototype, 'step', {
    get: function () {
        return this._step;
    },
    set: function (val) {
        this._step = val;
        this._dirty = true;
    }
});

module.exports = Tree;
},{"../Starcoder.js":4,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":18,"./VectorSprite.js":22}],22:[function(require,module,exports){
/**
 * Sprite with attached Graphics object for vector-like graphics
 */
'use strict';

//var Starcoder = require('../../Starcoder-client.js');

/**
 * Base class for Vector-based sprites
 *
 * @param game {Phaser.Game} - Phaser game object
 * @param config {object} - POJO with config details
 * @constructor
 */
var VectorSprite = function (game, config) {
    Phaser.Sprite.call(this, game);

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

/**
 * Create VectorSprite and add to game world
 *
 * @param game {Phaser.Game}
 * @param x {number} - x coord
 * @param y {number} - y coord
 * @returns {VectorSprite}
 */
VectorSprite.add = function (game, x, y) {
    var v = new VectorSprite(game, x, y);
    game.add.existing(v);
    return v;
}

VectorSprite.prototype = Object.create(Phaser.Sprite.prototype);
VectorSprite.prototype.constructor = VectorSprite;

// Default octagon
VectorSprite.prototype._shape = [
    [2,1],
    [1,2],
    [-1,2],
    [-2,1],
    [-2,-1],
    [-1,-2],
    [1,-2],
    [2,-1]
];
VectorSprite.prototype._shapeClosed = true;
VectorSprite.prototype._lineColor = '#ffffff';
VectorSprite.prototype._lineWidth = 1;
VectorSprite.prototype._fillColor = null;
VectorSprite.prototype._fillAlpha = 0.25;
VectorSprite.prototype._vectorScale = 1;

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

/**
 * Update cached bitmaps for object after vector properties change
 */
VectorSprite.prototype.updateAppearance = function () {
    // Draw full sized
    this.graphics.clear();
    this.graphics._currentBounds = null;
    if (typeof this.drawProcedure !== 'undefined') {
        this.drawProcedure(1);
    } else if (this.shape) {
        this.draw(1);
    }
    var bounds = this.graphics.getLocalBounds();
    this.texture.resize(bounds.width, bounds.height, true);
    this.texture.renderXY(this.graphics, -bounds.x, -bounds.y, true);
    this.setTexture(this.texture);
    // Draw small for minimap
    var mapScale = this.game.minimap.mapScale;
    this.graphics.clear();
    this.graphics._currentBounds = null;
    if (typeof this.drawProcedure !== 'undefined') {
        this.drawProcedure(mapScale);
    } else if (this.shape) {
        this.draw(mapScale);
    }
    bounds = this.graphics.getLocalBounds();
    this.minitexture.resize(bounds.width, bounds.height, true);
    this.minitexture.renderXY(this.graphics, -bounds.x, -bounds.y, true);
    this.minisprite.setTexture(this.minitexture);
    this._dirty = false;
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

/**
 * Render vector to bitmap of graphics object at given scale
 *
 * @param renderScale {number} - scale factor for render
 */
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

/**
 * Draw open or closed polygon as sequence of lineTo calls
 *
 * @param points {Array} - points as array of [x,y] pairs
 * @param closed {boolean} - is polygon closed?
 * @param renderScale {number} - scale factor for render
 * @private
 */
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

/**
 * Invalidate cache and redraw if sprite is marked dirty
 */
VectorSprite.prototype.update = function () {
    if (this._dirty) {
        console.log('dirty VS');
        this.updateAppearance();
    }
};

// Vector properties defined to handle marking sprite dirty when necessary

Object.defineProperty(VectorSprite.prototype, 'lineColor', {
    get: function () {
        return this._lineColor;
    },
    set: function (val) {
        this._lineColor = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'fillColor', {
    get: function () {
        return this._fillColor;
    },
    set: function (val) {
        this._fillColor = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'lineWidth', {
    get: function () {
        return this._lineWidth;
    },
    set: function (val) {
        this._lineWidth = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'fillAlpha', {
    get: function () {
        return this._fillAlpha;
    },
    set: function (val) {
        this._fillAlpha = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'shapeClosed', {
    get: function () {
        return this._shapeClosed;
    },
    set: function (val) {
        this._shapeClosed = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'vectorScale', {
    get: function () {
        return this._vectorScale;
    },
    set: function (val) {
        this._vectorScale = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'shape', {
    get: function () {
        return this._shape;
    },
    set: function (val) {
        this._shape = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'geometry', {
    get: function () {
        return this._geometry;
    },
    set: function (val) {
        this._geometry = val;
        this._dirty = true;
    }
});

Object.defineProperty(VectorSprite.prototype, 'dead', {
    get: function () {
        return this._dead;
    },
    set: function (val) {
        this._dead = val;
        if (val) {
            this.kill();
        } else {
            this.revive();
        }
    }
});


module.exports = VectorSprite;
//Starcoder.VectorSprite = VectorSprite;
},{}],23:[function(require,module,exports){
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
},{"../Starcoder-client.js":3}],24:[function(require,module,exports){
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


/**
 * Initialize plugin
 *
 * @param socket {Socket} - socket.io socket for sync connection
 * @param queue {Array} - command queue
 */
SyncClient.prototype.init = function (socket, queue) {
    // TODO: Copy some config options
    this.socket = socket;
    this.cmdQueue = queue;
    this.extant = {};
};

/**
 * Start plugin
 */
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
                if (update.properties) {
                    sprite.config(update.properties);
                }
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

/**
 * Send queued commands to server and interpolate objects based on updates from server
 */
SyncClient.prototype.update = function () {
    if (!this._updateComplete) {
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
                //console.log('Lagging', oids[i]);
            } else {                    // No? Just bail
                //console.log('Bailing', oids[i]);
                continue;
            }
        } else {
            //console.log('Ok', interpTime, queue.length);
            queue.splice(0, j - 1);     // Throw out older updates
        }

        var span = after.timestamp - before.timestamp;
        var t = (interpTime - before.timestamp) / span;
        sprite.setPosAngle(linear(before.x, after.x, t), linear(before.y, after.y, t), linear(before.a, after.a, t));
    }
};

// Helpers

/**
 * Interpolate between two points with hermite spline
 * NB - currently unused and probably broken
 *
 * @param p0 {number} - initial value
 * @param p1 {number} - final value
 * @param v0 {number} - initial slope
 * @param v1 {number} - final slope
 * @param t {number} - point of interpolation (between 0 and 1)
 * @returns {number} - interpolated value
 */
function hermite (p0, p1, v0, v1, t) {
    var t2 = t*t;
    var t3 = t*t2;
    return (2*t3 - 3*t2 + 1)*p0 + (t3 - 2*t2 + t)*v0 + (-2*t3 + 3*t2)*p1 + (t3 - t2)*v1;
}

/**
 * Interpolate between two points with linear spline
 *
 * @param p0 {number} - initial value
 * @param p1 {number} - final value
 * @param t {number} - point of interpolation (between 0 and 1)
 * @param scale {number} - scale factor to normalize units
 * @returns {number} - interpolated value
 */
function linear (p0, p1, t, scale) {
    scale = scale || 1;
    return p0 + (p1 - p0)*t*scale;
}

Starcoder.ServerSync = SyncClient;
module.exports = SyncClient;
},{"../Starcoder-client.js":3}],25:[function(require,module,exports){
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

/**
 * Set properties that require booted game state, attach plugins, connect to game server
 */
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
    this.starcoder.socket = this.starcoder.io(this.starcoder.config.serverUri,
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

/**
 * Advance game state once network connection is established
 */
Boot.prototype.update = function () {
    if (_connected) {
        this.game.state.start('space');
    }
};

module.exports = Boot;
},{"../phaserplugins/Controls.js":23,"../phaserplugins/SyncClient.js":24}],26:[function(require,module,exports){
/**
 * Space.js
 *
 * Main game state for Starcoder
 */
'use strict';

var SimpleParticle = require('../phaserbodies/SimpleParticle.js');
var ThrustGenerator = require('../phaserbodies/ThrustGenerator.js');
var MiniMap = require('../phaserui/MiniMap.js');
var Toast = require('../phaserbodies/Toast.js');

var Space = function () {};

Space.prototype = Object.create(Phaser.State.prototype);
Space.prototype.constructor = Space;

Space.prototype.preload = function () {
    SimpleParticle.cacheTexture(this.game, ThrustGenerator.textureKey, '#ff6600', 8);
    SimpleParticle.cacheTexture(this.game, 'bullet', '#999999', 4);
    this.game.load.audio('playerthrust', 'assets/sounds/thrustLoop.ogg');
    this.game.load.audio('chime', 'assets/sounds/chime.mp3');
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
    this.game.sounds.chime = this.game.sound.add('chime', 1, false);

    // Background
    var starfield = this.game.make.bitmapData(600, 600);
    drawStarField(starfield.ctx, 600, 16);
    this.game.add.tileSprite(wb[0]*ps, wb[1]*ps, (wb[2]-wb[0])*ps, (wb[3]-wb[1])*ps, starfield);

    this.starcoder.syncclient.start();
    this.starcoder.socket.emit('client ready');
    this._setupMessageHandlers(this.starcoder.socket);

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

Space.prototype._setupMessageHandlers = function (socket) {
    var self = this;
    socket.on('msg crystal pickup', function (val) {
        self.game.sounds.chime.play();
        Toast.spinUp(self.game, self.game.playerShip.x, self.game.playerShip.y, '+' + val + ' crystals!');
    });
};

module.exports = Space;

},{"../phaserbodies/SimpleParticle.js":17,"../phaserbodies/ThrustGenerator.js":19,"../phaserbodies/Toast.js":20,"../phaserui/MiniMap.js":27}],27:[function(require,module,exports){
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
},{}]},{},[8])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL0Jsb2NrbHlDdXN0b20uanMiLCJzcmMvU3RhcmNvZGVyLWNsaWVudC5qcyIsInNyYy9TdGFyY29kZXIuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvQ29kZUVuZHBvaW50Q2xpZW50LmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL0RPTUludGVyZmFjZS5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9Xb3JsZEFwaS5qcyIsInNyYy9jbGllbnQuanMiLCJzcmMvY29tbW9uL1BhdGhzLmpzIiwic3JjL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzIiwic3JjL3BoYXNlcmJvZGllcy9Bc3Rlcm9pZC5qcyIsInNyYy9waGFzZXJib2RpZXMvQnVsbGV0LmpzIiwic3JjL3BoYXNlcmJvZGllcy9DcnlzdGFsLmpzIiwic3JjL3BoYXNlcmJvZGllcy9HZW5lcmljT3JiLmpzIiwic3JjL3BoYXNlcmJvZGllcy9QbGFuZXRvaWQuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1NoaXAuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1NpbXBsZVBhcnRpY2xlLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TeW5jQm9keUludGVyZmFjZS5qcyIsInNyYy9waGFzZXJib2RpZXMvVGhydXN0R2VuZXJhdG9yLmpzIiwic3JjL3BoYXNlcmJvZGllcy9Ub2FzdC5qcyIsInNyYy9waGFzZXJib2RpZXMvVHJlZS5qcyIsInNyYy9waGFzZXJib2RpZXMvVmVjdG9yU3ByaXRlLmpzIiwic3JjL3BoYXNlcnBsdWdpbnMvQ29udHJvbHMuanMiLCJzcmMvcGhhc2VycGx1Z2lucy9TeW5jQ2xpZW50LmpzIiwic3JjL3BoYXNlcnN0YXRlcy9Cb290LmpzIiwic3JjL3BoYXNlcnN0YXRlcy9TcGFjZS5qcyIsInNyYy9waGFzZXJ1aS9NaW5pTWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8qKlxuICogQmxvY2tseUN1c3RvbS5qc1xuICpcbiAqIERlZmluaXRpb25zIGFuZCBjb2RlIGdlbmVyYXRpb24gZm9yIFN0YXJDb2RlciBvcmllbnRlZCBibG9ja3NcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFNldCBzY2FsZSBvZiBwbGF5ZXIgc2hpcFxuICogQHR5cGUge3tpbml0OiBGdW5jdGlvbn19XG4gKi9cbkJsb2NrbHkuQmxvY2tzWydzY19zZXRfc2NhbGUnXSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0Q29sb3VyKDE2MCk7XG4gICAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgICAgLnNldENoZWNrKCdOdW1iZXInKVxuICAgICAgICAgICAgLmFwcGVuZEZpZWxkKCdzZXQgc2hpcCBzY2FsZScpO1xuICAgICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBDb2RlIGdlbmVyYXRpb24gZm9yIHNldF9zY2FsZVxuICpcbiAqIEBwYXJhbSBibG9ja1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuQmxvY2tseS5KYXZhU2NyaXB0WydzY19zZXRfc2NhbGUnXSA9IGZ1bmN0aW9uIChibG9jaykge1xuICAgIHZhciBhcmcgPSBibG9jay5nZXRGaWVsZFZhbHVlKCdWQUxVRScpO1xuICAgIHJldHVybiAnc2V0U2NhbGUoJyArIGFyZyArICcpJztcbn07XG5cbi8qKlxuICogQmxvY2sgcmVwcmVzZW50aW5nIGFuIG9yZGVyZWQgcGFpciBvZiBjb29yZGluYXRlc1xuICovXG5CbG9ja2x5LkJsb2Nrc1snc2NfcGFpciddID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAgIC5hcHBlbmRGaWVsZCgnKCcpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQobmV3IEJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzAnLCBCbG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdYJylcbiAgICAgICAgICAgIC5hcHBlbmRGaWVsZCgnLCcpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQobmV3IEJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzAnLCBCbG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdZJylcbiAgICAgICAgICAgIC5hcHBlbmRGaWVsZCgnKScpO1xuICAgICAgICB0aGlzLnNldENvbG91cigxNjApO1xuICAgICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSwgJ1BhaXInKTtcbiAgICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCAnUGFpcicpO1xuICAgIH1cbn07XG5cbi8qKlxuICogQ29kZSBnZW5lcmF0aW9uIGZvciBwYWlyIGlzIGEgTk9PUCBiYyBpdCBoYXMgbm8gbWVhbmluZyBvdXRzaWRlIG9mIGEgY29udGFpbmVyXG4gKi9cbkJsb2NrbHkuSmF2YVNjcmlwdFsnc2NfcGFpciddID0gZnVuY3Rpb24gKGJsb2NrKSB7XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIEJsb2NrIHJlcHJlc2VudGluZyBhIHNldCBvZiBvcmRlcmVkIHBhaXJzIHRvIGJlIHVzZWQgYXMgdGhlIHBsYXllcidzIHNoYXBlXG4gKi9cbkJsb2NrbHkuQmxvY2tzWydzY19jaGFuZ2Vfc2hhcGUnXSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0Q29sb3VyKDMwMCk7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQoJ3BsYXllciBzaGFwZScpO1xuICAgICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdQQUlSUycpXG4gICAgICAgICAgICAuc2V0Q2hlY2soJ1BhaXInKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlIGNvZGUgZm9yIG9yZGVyZWQgcGFpciBibG9ja3NcbiAqIEJ5cGFzcyBub3JtYWwgQmxvY2tseSBjb2RlIGdlbmVyYXRpb24gbWV0aG9kcyBiYyBvdXIgcGFpciB2YWx1ZXMgYXJlXG4gKiAnc3RhdGVtZW50cycgaW4gQmxvY2tseS1zcGVha1xuICovXG5CbG9ja2x5LkphdmFTY3JpcHRbJ3NjX2NoYW5nZV9zaGFwZSddID0gZnVuY3Rpb24gKGJsb2NrKSB7XG4gICAgdmFyIHgsIHk7XG4gICAgdmFyIHBhaXJMaXN0ID0gW107XG4gICAgdmFyIHBhaXJCbG9jayA9IGJsb2NrLmdldElucHV0VGFyZ2V0QmxvY2soJ1BBSVJTJyk7XG4gICAgd2hpbGUgKHBhaXJCbG9jaykge1xuICAgICAgICBpZiAocGFpckJsb2NrLnR5cGUgPT09ICdzY19wYWlyJykge1xuICAgICAgICAgICAgeCA9IHBhaXJCbG9jay5nZXRGaWVsZFZhbHVlKCdYJyk7XG4gICAgICAgICAgICB5ID0gcGFpckJsb2NrLmdldEZpZWxkVmFsdWUoJ1knKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHggPSBCbG9ja2x5LkphdmFTY3JpcHQudmFsdWVUb0NvZGUocGFpckJsb2NrLCAnWCcsIEJsb2NrbHkuSmF2YVNjcmlwdC5PUkRFUl9DT01NQSkgfHwgJzAnO1xuICAgICAgICAgICAgeSA9IEJsb2NrbHkuSmF2YVNjcmlwdC52YWx1ZVRvQ29kZShwYWlyQmxvY2ssICdZJywgQmxvY2tseS5KYXZhU2NyaXB0Lk9SREVSX0NPTU1BKSB8fCAnMCc7XG4gICAgICAgIH1cbiAgICAgICAgcGFpckxpc3QucHVzaCgnWycgKyB4ICsgJywnICsgeSArICddJyk7XG4gICAgICAgIHBhaXJCbG9jayA9IHBhaXJCbG9jay5uZXh0Q29ubmVjdGlvbiAmJiBwYWlyQmxvY2submV4dENvbm5lY3Rpb24udGFyZ2V0QmxvY2soKTtcbiAgICB9XG4gICAgaWYgKHBhaXJMaXN0Lmxlbmd0aCA+IDIpIHtcbiAgICAgICAgLy8gRG9uJ3QgZ2VuZXJhdGUgY29kZSBmb3IgZmV3ZXIgdGhhbiAzIHBvaW50c1xuICAgICAgICByZXR1cm4gJ2NoYW5nZVNoYXBlKFsnICsgcGFpckxpc3Quam9pbignLCcpICsgJ10pJztcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIHNldCBzaGlwIHRocnVzdCBwb3dlclxuICogQHR5cGUge3tpbml0OiBGdW5jdGlvbn19XG4gKi9cbkJsb2NrbHkuQmxvY2tzWydzY19zZXRfdGhydXN0X3Bvd2VyJ10gPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldENvbG91cigxNjApO1xuICAgICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAgIC5zZXRDaGVjaygnTnVtYmVyJylcbiAgICAgICAgICAgIC5hcHBlbmRGaWVsZCgnc2V0IHNoaXAgdGhydXN0IGZvcmNlJyk7XG4gICAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIENvZGUgZ2VuZXJhdGlvbiBmb3Igc2V0X3RocnVzdF9wb3dlclxuICpcbiAqIEBwYXJhbSBibG9ja1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuQmxvY2tseS5KYXZhU2NyaXB0WydzY19zZXRfdGhydXN0X3Bvd2VyJ10gPSBmdW5jdGlvbiAoYmxvY2spIHtcbiAgICB2YXIgYXJnID0gYmxvY2suZ2V0RmllbGRWYWx1ZSgnVkFMVUUnKTtcbiAgICByZXR1cm4gJ3NldFRocnVzdEZvcmNlKCcgKyBhcmcgKyAnKSc7XG59O1xuXG4vKipcbiAqIGNyZWF0ZSBuZXcgcGxhbmV0XG4gKi9cbkJsb2NrbHkuQmxvY2tzWydzY19uZXdfcGxhbmV0J10gPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldENvbG91cigxMjApO1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgICAgLmFwcGVuZEZpZWxkKCduZXcgcGxhbmV0Jyk7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQoJ3gnKVxuICAgICAgICAgICAgLmFwcGVuZEZpZWxkKG5ldyBCbG9ja2x5LkZpZWxkVGV4dElucHV0KCcwJywgQmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnWCcpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQoJ3knKVxuICAgICAgICAgICAgLmFwcGVuZEZpZWxkKG5ldyBCbG9ja2x5LkZpZWxkVGV4dElucHV0KCcwJywgQmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnWScpO1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgICAgLmFwcGVuZEZpZWxkKCdzY2FsZScpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQobmV3IEJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzInLCBCbG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdTQ0FMRScpO1xuICAgICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBjb2RlIGdlbmVyYXRpb24gZm9yIG5ldyBwbGFuZXRcbiAqL1xuQmxvY2tseS5KYXZhU2NyaXB0WydzY19uZXdfcGxhbmV0J10gPSBmdW5jdGlvbiAoYmxvY2spIHtcbiAgICB2YXIgeCA9IGJsb2NrLmdldEZpZWxkVmFsdWUoJ1gnKTtcbiAgICB2YXIgeSA9IGJsb2NrLmdldEZpZWxkVmFsdWUoJ1knKTtcbiAgICB2YXIgc2NhbGUgPSBibG9jay5nZXRGaWVsZFZhbHVlKCdTQ0FMRScpO1xuICAgIHJldHVybiAnbmV3UGxhbmV0KCcgKyB4ICsgJywnICsgeSArICcsJyArIHNjYWxlICsgJyknO1xufTtcblxuLyoqXG4gKiBzZXQgc2hpcCBjb2xvclxuICovXG5CbG9ja2x5LkJsb2Nrc1snc2Nfc2V0X2NvbG9yJ10gPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldENvbG91cigzMCk7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQoJ3NoaXAgY29sb3InKVxuICAgICAgICAgICAgLmFwcGVuZEZpZWxkKG5ldyBCbG9ja2x5LkZpZWxkQ29sb3VyKCcjZmYwMDAwJyksICdDT0xPUicpO1xuICAgICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBjb2RlIGdlbmVyYXRpb24gZm9yIHNldCBjb2xvclxuICovXG5CbG9ja2x5LkphdmFTY3JpcHRbJ3NjX3NldF9jb2xvciddID0gZnVuY3Rpb24gKGJsb2NrKSB7XG4gICAgdmFyIGNvbG9yID0gYmxvY2suZ2V0RmllbGRWYWx1ZSgnQ09MT1InKTtcbiAgICByZXR1cm4gJ2NoYW5nZUNvbG9yKFxcJycgKyBjb2xvciArICdcXCcpJztcbn07IiwiLyoqXG4gKiBTdGFyY29kZXItY2xpZW50LmpzXG4gKlxuICogU3RhcmNvZGVyIG1hc3RlciBvYmplY3QgZXh0ZW5kZWQgd2l0aCBjbGllbnQgb25seSBwcm9wZXJ0aWVzIGFuZCBtZXRob2RzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBXb3JsZEFwaSA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvV29ybGRBcGkuanMnKTtcbnZhciBET01JbnRlcmZhY2UgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL0RPTUludGVyZmFjZS5qcycpO1xudmFyIENvZGVFbmRwb2ludENsaWVudCA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvQ29kZUVuZHBvaW50Q2xpZW50LmpzJyk7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTdGFyY29kZXIucHJvdG90eXBlLCBXb3JsZEFwaS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJjb2Rlci5wcm90b3R5cGUsIERPTUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJjb2Rlci5wcm90b3R5cGUsIENvZGVFbmRwb2ludENsaWVudC5wcm90b3R5cGUpO1xuXG52YXIgc3RhdGVzID0ge1xuICAgIGJvb3Q6IHJlcXVpcmUoJy4vcGhhc2Vyc3RhdGVzL0Jvb3QuanMnKSxcbiAgICBzcGFjZTogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvU3BhY2UuanMnKVxufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW8gPSBpbztcbiAgICB0aGlzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoMTgwMCwgOTUwLCBQaGFzZXIuQVVUTywgJ21haW4nKTtcbiAgICAvL3RoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSgxODAwLCA5NTAsIFBoYXNlci5DQU5WQVMsICdtYWluJyk7XG4gICAgdGhpcy5nYW1lLmZvcmNlU2luZ2xlVXBkYXRlID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUuc3RhcmNvZGVyID0gdGhpcztcbiAgICBmb3IgKHZhciBrIGluIHN0YXRlcykge1xuICAgICAgICB2YXIgc3RhdGUgPSBuZXcgc3RhdGVzW2tdKCk7XG4gICAgICAgIHN0YXRlLnN0YXJjb2RlciA9IHRoaXM7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoaywgc3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLmNtZFF1ZXVlID0gW107XG4gICAgdGhpcy5pbml0RE9NSW50ZXJmYWNlKCk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnYm9vdCcpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5hdHRhY2hQbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBsdWdpbiA9IHRoaXMuZ2FtZS5wbHVnaW5zLmFkZC5hcHBseSh0aGlzLmdhbWUucGx1Z2lucywgYXJndW1lbnRzKTtcbiAgICBwbHVnaW4uc3RhcmNvZGVyID0gdGhpcztcbiAgICBwbHVnaW4ubG9nID0gdGhpcy5sb2c7XG4gICAgcmV0dXJuIHBsdWdpbjtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUucm9sZSA9ICdDbGllbnQnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJjb2RlcjtcbiIsIi8qKlxuICogU3RhcmNvZGVyLmpzXG4gKlxuICogU2V0IHVwIGdsb2JhbCBTdGFyY29kZXIgbmFtZXNwYWNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0ge1xuLy8gICAgY29uZmlnOiB7XG4vLyAgICAgICAgd29ybGRCb3VuZHM6IFstNDIwMCwgLTQyMDAsIDg0MDAsIDg0MDBdXG4vL1xuLy8gICAgfSxcbi8vICAgIFN0YXRlczoge31cbi8vfTtcblxudmFyIGNvbmZpZyA9IHtcbiAgICB2ZXJzaW9uOiAnMC4xJyxcbiAgICBzZXJ2ZXJVcmk6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09ICdkZXZlbG9wbWVudCcgPyAnaHR0cDovL2xvY2FsaG9zdDo4MDgxJyA6ICdodHRwOi8vcGhhcmNvZGVyLXNpbmdsZS5lbGFzdGljYmVhbnN0YWxrLmNvbTo4MDgxJyxcbiAgICAvL3dvcmxkQm91bmRzOiBbLTQyMDAsIC00MjAwLCA4NDAwLCA4NDAwXSxcbiAgICB3b3JsZEJvdW5kczogWy0yMDAsIC0yMDAsIDIwMCwgMjAwXSxcbiAgICBpb0NsaWVudE9wdGlvbnM6IHtcbiAgICAgICAgLy9mb3JjZU5ldzogdHJ1ZVxuICAgICAgICByZWNvbm5lY3Rpb246IGZhbHNlXG4gICAgfSxcbiAgICB1cGRhdGVJbnRlcnZhbDogNTAsXG4gICAgcmVuZGVyTGF0ZW5jeTogMTAwLFxuICAgIHBoeXNpY3NTY2FsZTogMjAsXG4gICAgZnJhbWVSYXRlOiAoMSAvIDYwKSxcbiAgICB0aW1lU3luY0ZyZXE6IDEwLFxuICAgIHBoeXNpY3NQcm9wZXJ0aWVzOiB7XG4gICAgICAgIFNoaXA6IHtcbiAgICAgICAgICAgIG1hc3M6IDEwXG4gICAgICAgIH0sXG4gICAgICAgIEFzdGVyb2lkOiB7XG4gICAgICAgICAgICBtYXNzOiAyMFxuICAgICAgICB9XG4gICAgfSxcbiAgICBpbml0aWFsQm9kaWVzOiBbXG4gICAgICAgIHt0eXBlOiAnQXN0ZXJvaWQnLCBudW1iZXI6IDI1LCBjb25maWc6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnfSxcbiAgICAgICAgICAgIHZlbG9jaXR5OiB7cmFuZG9tOiAndmVjdG9yJywgbG86IC0xMCwgaGk6IDEwfSxcbiAgICAgICAgICAgIGFuZ3VsYXJWZWxvY2l0eToge3JhbmRvbTogJ2Zsb2F0JywgbG86IC01LCBoaTogNX0sXG4gICAgICAgICAgICB2ZWN0b3JTY2FsZToge3JhbmRvbTogJ2Zsb2F0JywgbG86IDAuNiwgaGk6IDEuNH0sXG4gICAgICAgICAgICBtYXNzOiAxMFxuICAgICAgICB9fSxcbiAgICAgICAgLy97dHlwZTogJ0NyeXN0YWwnLCBudW1iZXI6IDEwLCBjb25maWc6IHtcbiAgICAgICAgLy8gICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCd9LFxuICAgICAgICAvLyAgICB2ZWxvY2l0eToge3JhbmRvbTogJ3ZlY3RvcicsIGxvOiAtNCwgaGk6IDQsIG5vcm1hbDogdHJ1ZX0sXG4gICAgICAgIC8vICAgIHZlY3RvclNjYWxlOiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogMC40LCBoaTogMC44fSxcbiAgICAgICAgLy8gICAgbWFzczogNVxuICAgICAgICAvL319XG4gICAgICAgIHt0eXBlOiAnSHlkcmEnLCBudW1iZXI6IDEsIGNvbmZpZzoge1xuICAgICAgICAgICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCcsIHBhZDogNTB9XG4gICAgICAgIH19LFxuICAgICAgICB7dHlwZTogJ1BsYW5ldG9pZCcsIG51bWJlcjogNiwgY29uZmlnOiB7XG4gICAgICAgICAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJywgcGFkOiAzMH0sXG4gICAgICAgICAgICBhbmd1bGFyVmVsb2NpdHk6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAtMiwgaGk6IDJ9LFxuICAgICAgICAgICAgdmVjdG9yU2NhbGU6IDIuNSxcbiAgICAgICAgICAgIG1hc3M6IDEwMFxuICAgICAgICB9fSxcbiAgICAgICAgLy8gRklYTUU6IFRyZWVzIGp1c3QgZm9yIHRlc3RpbmdcbiAgICAgICAgLy97dHlwZTogJ1RyZWUnLCBudW1iZXI6IDEwLCBjb25maWc6IHtcbiAgICAgICAgLy8gICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCcsIHBhZDogMzB9LFxuICAgICAgICAvLyAgICB2ZWN0b3JTY2FsZTogMSxcbiAgICAgICAgLy8gICAgbWFzczogNVxuICAgICAgICAvL319XG4gICAgXVxufTtcblxudmFyIFN0YXJjb2RlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAvLyBJbml0aWFsaXplcnMgdmlydHVhbGl6ZWQgYWNjb3JkaW5nIHRvIHJvbGVcbiAgICB0aGlzLmJhbm5lcigpO1xuICAgIHRoaXMuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIC8vdGhpcy5pbml0TmV0LmNhbGwodGhpcyk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLmV4dGVuZENvbmZpZyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBmb3IgKHZhciBrIGluIGNvbmZpZykge1xuICAgICAgICBpZiAoY29uZmlnLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ1trXSA9IGNvbmZpZ1trXTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8vIENvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciBjb21tb24gY29uZmlnIG9wdGlvbnNcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICd3b3JsZFdpZHRoJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMl0gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1swXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJXaWR0aCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqICh0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1syXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzBdKTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICd3b3JsZEhlaWdodCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzNdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMV07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VySGVpZ2h0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogKHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzNdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMV0pO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlckxlZnQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1swXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJUb3AnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1sxXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJSaWdodCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzJdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlckJvdHRvbScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzNdO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIEFkZCBtaXhpbiBwcm9wZXJ0aWVzIHRvIHRhcmdldC4gQWRhcHRlZCAoc2xpZ2h0bHkpIGZyb20gUGhhc2VyXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldFxuICogQHBhcmFtIHtvYmplY3R9IG1peGluXG4gKi9cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZSA9IGZ1bmN0aW9uICh0YXJnZXQsIG1peGluKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhtaXhpbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgICB2YXIgdmFsID0gbWl4aW5ba2V5XTtcbiAgICAgICAgaWYgKHZhbCAmJlxuICAgICAgICAgICAgKHR5cGVvZiB2YWwuZ2V0ID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB2YWwuc2V0ID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCB2YWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSB2YWw7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLmJhbm5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmxvZygnU3RhcmNvZGVyJywgdGhpcy5yb2xlLCAndicgKyB0aGlzLmNvbmZpZy52ZXJzaW9uLCAnc3RhcnRlZCBhdCcsIERhdGUoKSk7XG59XG5cbi8qKlxuICogQ3VzdG9tIGxvZ2dpbmcgZnVuY3Rpb24gdG8gYmUgZmVhdHVyZWZpZWQgYXMgbmVjZXNzYXJ5XG4gKi9cblN0YXJjb2Rlci5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFyY29kZXI7XG4iLCIvKipcbiAqIENvZGVFbmRwb2ludENsaWVudC5qc1xuICpcbiAqIE1ldGhvZHMgZm9yIHNlbmRpbmcgY29kZSB0byBzZXJ2ZXIgYW5kIGRlYWxpbmcgd2l0aCBjb2RlIHJlbGF0ZWQgcmVzcG9uc2VzXG4gKi9cblxudmFyIENvZGVFbmRwb2ludENsaWVudCA9IGZ1bmN0aW9uICgpIHt9O1xuXG5Db2RlRW5kcG9pbnRDbGllbnQucHJvdG90eXBlLnNlbmRDb2RlID0gZnVuY3Rpb24gKGNvZGUpIHtcbiAgICB0aGlzLnNvY2tldC5lbWl0KCdjb2RlJywgY29kZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvZGVFbmRwb2ludENsaWVudDsiLCIvKipcbiAqIERPTUludGVyZmFjZS5qc1xuICpcbiAqIEhhbmRsZSBET00gY29uZmlndXJhdGlvbi9pbnRlcmFjdGlvbiwgaS5lLiBub24tUGhhc2VyIHN0dWZmXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIERPTUludGVyZmFjZSA9IGZ1bmN0aW9uICgpIHt9O1xuXG5ET01JbnRlcmZhY2UucHJvdG90eXBlLmluaXRET01JbnRlcmZhY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuZG9tID0ge307ICAgICAgICAgICAgICAvLyBuYW1lc3BhY2VcbiAgICB0aGlzLmRvbS5jb2RlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGUtYnRuJyk7XG4gICAgdGhpcy5kb20uY29kZVBvcHVwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGUtcG9wdXAnKTtcbiAgICB0aGlzLmRvbS5jb2RlU2VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb2RlLXNlbmQnKTtcbiAgICB0aGlzLmRvbS5ibG9ja2x5V29ya3NwYWNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jsb2NrbHktd29ya3NwYWNlJyk7XG4gICAgLy90aGlzLmRvbS5jb2RlVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb2RlLXRleHQnKTtcblxuICAgIC8vdGhpcy5kb20uY29kZVRleHQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgc2VsZi5nYW1lLmlucHV0LmVuYWJsZWQgPSBmYWxzZTtcbiAgICAvL30pO1xuICAgIC8vXG4gICAgLy90aGlzLmRvbS5jb2RlVGV4dC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgZnVuY3Rpb24gKCkge1xuICAgIC8vICAgIHNlbGYuZ2FtZS5pbnB1dC5lbmFibGVkID0gdHJ1ZTtcbiAgICAvL30pO1xuXG4gICAgdGhpcy5kb20uY29kZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi50b2dnbGUoc2VsZi5kb20uY29kZVBvcHVwKTtcbiAgICAgICAgQmxvY2tseS5maXJlVWlFdmVudChzZWxmLmRvbS5ibG9ja2x5V29ya3NwYWNlLCAncmVzaXplJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmRvbS5jb2RlU2VuZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9zZWxmLnNlbmRDb2RlKHNlbGYuZG9tLmNvZGVUZXh0LnZhbHVlKTtcbiAgICAgICAgY29uc29sZS5sb2coQmxvY2tseS5KYXZhU2NyaXB0LndvcmtzcGFjZVRvQ29kZShzZWxmLmJsb2NrbHlXb3Jrc3BhY2UpKTtcbiAgICAgICAgc2VsZi5zZW5kQ29kZShCbG9ja2x5LkphdmFTY3JpcHQud29ya3NwYWNlVG9Db2RlKHNlbGYuYmxvY2tseVdvcmtzcGFjZSkpO1xuICAgIH0pO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBibG9ja2x5XG4gICAgdGhpcy5ibG9ja2x5V29ya3NwYWNlID0gQmxvY2tseS5pbmplY3QoJ2Jsb2NrbHktd29ya3NwYWNlJyxcbiAgICAgICAge3Rvb2xib3g6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sYm94Jyl9KTtcbiAgICBjb25zb2xlLmxvZygnYmQnLCB0aGlzLmJsb2NrbHlXb3Jrc3BhY2UpO1xuXG4gICAgdGhpcy50b2dnbGUodGhpcy5kb20uY29kZVBvcHVwLCBmYWxzZSk7XG5cbn07XG5cbi8qKlxuICogU2V0L3RvZ2dsZSB2aXNpYmlsaXR5IG9mIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0gZWwge29iamVjdH0gLSBlbGVtZW50IHRvIHNldFxuICogQHBhcmFtIHN0YXRlIHs/Ym9vbGVhbn0gLSBzaG93ICh0cnVlKSwgaGlkZSAoZmFsc2UpLCB0b2dnbGUgKHVuZGVmaW5lZClcbiAqL1xuRE9NSW50ZXJmYWNlLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoZWwsIHN0YXRlKSB7XG4gICAgdmFyIGRpc3BsYXkgPSBlbC5zdHlsZS5kaXNwbGF5O1xuICAgIGlmICghZWwub3JpZ0Rpc3BsYXkpIHtcbiAgICAgICAgaWYgKGRpc3BsYXkgIT09ICdub25lJykge1xuICAgICAgICAgICAgZWwub3JpZ0Rpc3BsYXkgPSBkaXNwbGF5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWwub3JpZ0Rpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHN0YXRlID0gKGRpc3BsYXkgPT09ICdub25lJyk7XG4gICAgfVxuICAgIGlmIChzdGF0ZSkge1xuICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gZWwub3JpZ0Rpc3BsYXk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRE9NSW50ZXJmYWNlO1xuIiwiLyoqXG4gKiBXb3JsZEFwaS5qc1xuICpcbiAqIEFkZC9yZW1vdmUvbWFuaXB1bGF0ZSBib2RpZXMgaW4gY2xpZW50J3MgcGh5c2ljcyB3b3JsZFxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBXb3JsZEFwaSA9IGZ1bmN0aW9uICgpIHt9O1xuXG52YXIgYm9keVR5cGVzID0ge1xuICAgIFNoaXA6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9TaGlwLmpzJyksXG4gICAgQXN0ZXJvaWQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9Bc3Rlcm9pZC5qcycpLFxuICAgIENyeXN0YWw6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9DcnlzdGFsLmpzJyksXG4gICAgQnVsbGV0OiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvQnVsbGV0LmpzJyksXG4gICAgR2VuZXJpY09yYjogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0dlbmVyaWNPcmIuanMnKSxcbiAgICBQbGFuZXRvaWQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9QbGFuZXRvaWQuanMnKSxcbiAgICBUcmVlOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVHJlZS5qcycpXG59O1xuXG4vKipcbiAqIEFkZCBib2R5IHRvIHdvcmxkIG9uIGNsaWVudCBzaWRlXG4gKlxuICogQHBhcmFtIHR5cGUge3N0cmluZ30gLSB0eXBlIG5hbWUgb2Ygb2JqZWN0IHRvIGFkZFxuICogQHBhcmFtIGNvbmZpZyB7b2JqZWN0fSAtIHByb3BlcnRpZXMgZm9yIG5ldyBvYmplY3RcbiAqIEByZXR1cm5zIHtQaGFzZXIuU3ByaXRlfSAtIG5ld2x5IGFkZGVkIG9iamVjdFxuICovXG5cbldvcmxkQXBpLnByb3RvdHlwZS5hZGRCb2R5ID0gZnVuY3Rpb24gKHR5cGUsIGNvbmZpZykge1xuICAgIHZhciBjdG9yID0gYm9keVR5cGVzW3R5cGVdO1xuICAgIHZhciBwbGF5ZXJTaGlwID0gZmFsc2U7XG4gICAgaWYgKCFjdG9yKSB7XG4gICAgICAgIHRoaXMubG9nKCdVbmtub3duIGJvZHkgdHlwZTonLCB0eXBlKTtcbiAgICAgICAgdGhpcy5sb2coY29uZmlnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PT0gJ1NoaXAnICYmIGNvbmZpZy5wcm9wZXJ0aWVzLnBsYXllcmlkID09PSB0aGlzLnBsYXllci5pZCkge1xuICAgICAgICBjb25maWcudGFnID0gdGhpcy5wbGF5ZXIudXNlcm5hbWU7XG4gICAgICAgIC8vIE9ubHkgdGhlIHBsYXllcidzIG93biBzaGlwIGlzIHRyZWF0ZWQgYXMgZHluYW1pYyBpbiB0aGUgbG9jYWwgcGh5c2ljcyBzaW1cbiAgICAgICAgY29uZmlnLm1hc3MgPSB0aGlzLmNvbmZpZy5waHlzaWNzUHJvcGVydGllcy5TaGlwLm1hc3M7XG4gICAgICAgIHBsYXllclNoaXAgPSB0cnVlO1xuICAgIH1cbiAgICB2YXIgYm9keSA9IG5ldyBjdG9yKHRoaXMuZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuZ2FtZS5hZGQuZXhpc3RpbmcoYm9keSk7XG4gICAgdGhpcy5nYW1lLnBsYXlmaWVsZC5hZGQoYm9keSk7XG4gICAgaWYgKHBsYXllclNoaXApIHtcbiAgICAgICAgdGhpcy5nYW1lLmNhbWVyYS5mb2xsb3coYm9keSk7XG4gICAgICAgIHRoaXMuZ2FtZS5wbGF5ZXJTaGlwID0gYm9keTtcbiAgICB9XG4gICAgcmV0dXJuIGJvZHk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBib2R5IGZyb20gZ2FtZSB3b3JsZFxuICpcbiAqIEBwYXJhbSBzcHJpdGUge1BoYXNlci5TcHJpdGV9IC0gb2JqZWN0IHRvIHJlbW92ZVxuICovXG5Xb3JsZEFwaS5wcm90b3R5cGUucmVtb3ZlQm9keSA9IGZ1bmN0aW9uIChzcHJpdGUpIHtcbiAgICBzcHJpdGUua2lsbCgpO1xuICAgIC8vIFJlbW92ZSBtaW5pc3ByaXRlXG4gICAgaWYgKHNwcml0ZS5taW5pc3ByaXRlKSB7XG4gICAgICAgIHNwcml0ZS5taW5pc3ByaXRlLmtpbGwoKTtcbiAgICB9XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MucDIucmVtb3ZlQm9keShzcHJpdGUuYm9keSk7XG59O1xuXG4vKipcbiAqIENvbmZpZ3VyZSBvYmplY3Qgd2l0aCBnaXZlbiBwcm9wZXJ0aWVzXG4gKlxuICogQHBhcmFtIHByb3BlcnRpZXMge29iamVjdH1cbiAqL1xuLy9Xb3JsZEFwaS5wcm90b3R5cGUuY29uZmlndXJlID0gZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcbi8vICAgIGZvciAodmFyIGsgaW4gdGhpcy51cGRhdGVQcm9wZXJ0aWVzKSB7XG4vLyAgICAgICAgdGhpc1trXSA9IHByb3BlcnRpZXNba107XG4vLyAgICB9XG4vL307XG5cbm1vZHVsZS5leHBvcnRzID0gV29ybGRBcGk7XG4iLCIvKiogY2xpZW50LmpzXG4gKlxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgU3RhcmNvZGVyIGdhbWUgY2xpZW50XG4gKlxuICogQHR5cGUge1N0YXJjb2RlcnxleHBvcnRzfVxuICovXG5cbnJlcXVpcmUoJy4vQmxvY2tseUN1c3RvbS5qcycpO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG5cblxubG9jYWxTdG9yYWdlLmRlYnVnID0gJyc7ICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXNlZCB0byB0b2dnbGUgc29ja2V0LmlvIGRlYnVnZ2luZ1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdGFyY29kZXIgPSBuZXcgU3RhcmNvZGVyKCk7XG4gICAgc3RhcmNvZGVyLnN0YXJ0KCk7XG59KTtcbiIsIi8qKlxuICogUGF0aC5qc1xuICpcbiAqIFZlY3RvciBwYXRocyBzaGFyZWQgYnkgbXVsdGlwbGUgZWxlbWVudHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLm9jdGFnb24gPSBbXG4gICAgWzIsMV0sXG4gICAgWzEsMl0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwxXSxcbiAgICBbLTIsLTFdLFxuICAgIFstMSwtMl0sXG4gICAgWzEsLTJdLFxuICAgIFsyLC0xXVxuXTtcblxuZXhwb3J0cy5kMmNyb3NzID0gW1xuICAgIFstMSwtMl0sXG4gICAgWy0xLDJdLFxuICAgIFsyLC0xXSxcbiAgICBbLTIsLTFdLFxuICAgIFsxLDJdLFxuICAgIFsxLC0yXSxcbiAgICBbLTIsMV0sXG4gICAgWzIsMV1cbl07XG5cbmV4cG9ydHMuc3F1YXJlMCA9IFtcbiAgICBbLTEsLTJdLFxuICAgIFsyLC0xXSxcbiAgICBbMSwyXSxcbiAgICBbLTIsMV1cbl07XG5cbmV4cG9ydHMuc3F1YXJlMSA9IFtcbiAgICBbMSwtMl0sXG4gICAgWzIsMV0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwtMV1cbl07XG5cbmV4cG9ydHMuT0NUUkFESVVTID0gTWF0aC5zcXJ0KDUpOyIsIi8qKlxuICogVXBkYXRlUHJvcGVydGllcy5qc1xuICpcbiAqIENsaWVudC9zZXJ2ZXIgc3luY2FibGUgcHJvcGVydGllcyBmb3IgZ2FtZSBvYmplY3RzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNoaXAgPSBmdW5jdGlvbiAoKSB7fTtcblNoaXAucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVXaWR0aCcsICdsaW5lQ29sb3InLCAnZmlsbENvbG9yJywgJ2ZpbGxBbHBoYScsXG4gICAgJ3ZlY3RvclNjYWxlJywgJ3NoYXBlJywgJ3NoYXBlQ2xvc2VkJywgJ3BsYXllcmlkJywgJ2NyeXN0YWxzJywgJ2RlYWQnXTtcblxudmFyIEFzdGVyb2lkID0gZnVuY3Rpb24gKCkge307XG5Bc3Rlcm9pZC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsndmVjdG9yU2NhbGUnXTtcblxudmFyIENyeXN0YWwgPSBmdW5jdGlvbiAoKSB7fTtcbkNyeXN0YWwucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3ZlY3RvclNjYWxlJ107XG5cbnZhciBHZW5lcmljT3JiID0gZnVuY3Rpb24gKCkge307XG5HZW5lcmljT3JiLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lQ29sb3InLCAndmVjdG9yU2NhbGUnXTtcblxudmFyIFBsYW5ldG9pZCA9IGZ1bmN0aW9uICgpIHt9O1xuUGxhbmV0b2lkLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lQ29sb3InLCAnZmlsbENvbG9yJywgJ2xpbmVXaWR0aCcsICdmaWxsQWxwaGEnLCAndmVjdG9yU2NhbGUnLCAnb3duZXInXTtcblxudmFyIFRyZWUgPSBmdW5jdGlvbiAoKSB7fTtcblRyZWUucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3ZlY3RvclNjYWxlJywgJ2xpbmVDb2xvcicsICdncmFwaCcsICdzdGVwJ107XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoKSB7fTtcbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFtdO1xuXG5leHBvcnRzLlNoaXAgPSBTaGlwO1xuZXhwb3J0cy5Bc3Rlcm9pZCA9IEFzdGVyb2lkO1xuZXhwb3J0cy5DcnlzdGFsID0gQ3J5c3RhbDtcbmV4cG9ydHMuR2VuZXJpY09yYiA9IEdlbmVyaWNPcmI7XG5leHBvcnRzLkJ1bGxldCA9IEJ1bGxldDtcbmV4cG9ydHMuUGxhbmV0b2lkID0gUGxhbmV0b2lkO1xuZXhwb3J0cy5UcmVlID0gVHJlZTtcblxuIiwiLyoqXG4gKiBBc3Rlcm9pZC5qc1xuICpcbiAqIENsaWVudCBzaWRlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5Bc3Rlcm9pZDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgQXN0ZXJvaWQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG4gICAgLy90aGlzLmJvZHkuZGFtcGluZyA9IDA7XG59O1xuXG5Bc3Rlcm9pZC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgb3B0aW9ucykge1xuICAgIHZhciBhID0gbmV3IEFzdGVyb2lkKGdhbWUsIG9wdGlvbnMpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBhO1xufTtcblxuQXN0ZXJvaWQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcbkFzdGVyb2lkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFzdGVyb2lkO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQXN0ZXJvaWQucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEFzdGVyb2lkLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5Bc3Rlcm9pZC5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmYwMGZmJztcbkFzdGVyb2lkLnByb3RvdHlwZS5fZmlsbENvbG9yID0gJyMwMGZmMDAnO1xuQXN0ZXJvaWQucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMjU7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBBc3Rlcm9pZDtcbi8vU3RhcmNvZGVyLkFzdGVyb2lkID0gQXN0ZXJvaWQ7XG4iLCIvKipcbiAqIEJ1bGxldC5qc1xuICpcbiAqIENsaWVudCBzaWRlIGltcGxlbWVudGF0aW9uIG9mIHNpbXBsZSBwcm9qZWN0aWxlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSByZXF1aXJlKCcuL1NpbXBsZVBhcnRpY2xlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuQnVsbGV0O1xuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhbGwodGhpcywgZ2FtZSwgJ2J1bGxldCcpO1xuICAgIHRoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG59O1xuXG5CdWxsZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTaW1wbGVQYXJ0aWNsZS5wcm90b3R5cGUpO1xuQnVsbGV0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJ1bGxldDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEJ1bGxldC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQnVsbGV0LnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDsiLCIvKipcbiAqIENyeXN0YWwuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkNyeXN0YWw7XG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcblxudmFyIENyeXN0YWwgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG59O1xuXG5DcnlzdGFsLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICB2YXIgYSA9IG5ldyBDcnlzdGFsKGdhbWUsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5DcnlzdGFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5DcnlzdGFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENyeXN0YWw7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShDcnlzdGFsLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShDcnlzdGFsLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5DcnlzdGFsLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyMwMGZmZmYnO1xuQ3J5c3RhbC5wcm90b3R5cGUuX2ZpbGxDb2xvciA9ICcjMDAwMDAwJztcbkNyeXN0YWwucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5DcnlzdGFsLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcbkNyeXN0YWwucHJvdG90eXBlLl9maWxsQWxwaGEgPSAwLjA7XG5DcnlzdGFsLnByb3RvdHlwZS5fc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuQ3J5c3RhbC5wcm90b3R5cGUuX2dlb21ldHJ5ID0gW1xuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5kMmNyb3NzfVxuXTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IENyeXN0YWw7XG4iLCIvKipcbiAqIEdlbmVyaWNPcmIuanNcbiAqXG4gKiBCdWlsZGluZyBibG9ja1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuR2VuZXJpY09yYjtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgR2VuZXJpY09yYiA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkdlbmVyaWNPcmIuYWRkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIHZhciBhID0gbmV3IEdlbmVyaWNPcmIoZ2FtZSwgY29uZmlnKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gYTtcbn07XG5cbkdlbmVyaWNPcmIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcbkdlbmVyaWNPcmIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJpY09yYjtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEdlbmVyaWNPcmIucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEdlbmVyaWNPcmIucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkdlbmVyaWNPcmIucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnI2ZmMDAwMCc7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fZmlsbENvbG9yID0gJyMwMDAwMDAnO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMDtcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5cbkdlbmVyaWNPcmIucHJvdG90eXBlLl9nZW9tZXRyeSA9IFtcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuZDJjcm9zc31cbl07XG5cbm1vZHVsZS5leHBvcnRzID0gR2VuZXJpY09yYjtcbiIsIi8qKlxuICogUGxhbmV0b2lkLmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5QbGFuZXRvaWQ7XG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcblxudmFyIFBsYW5ldG9pZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xufTtcblxuUGxhbmV0b2lkLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIHBsYW5ldG9pZCA9IG5ldyBQbGFuZXRvaWQoZ2FtZSwgb3B0aW9ucyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIHBsYW5ldG9pZDtcbn07XG5cblBsYW5ldG9pZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuUGxhbmV0b2lkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBsYW5ldG9pZDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFBsYW5ldG9pZC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoUGxhbmV0b2lkLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmYwMGZmJztcbi8vUGxhbmV0b2lkLnByb3RvdHlwZS5fZmlsbENvbG9yID0gJyMwMGZmMDAnO1xuLy9QbGFuZXRvaWQucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuLy9QbGFuZXRvaWQucHJvdG90eXBlLl9maWxsQWxwaGEgPSAwLjI1O1xuUGxhbmV0b2lkLnByb3RvdHlwZS5fc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuUGxhbmV0b2lkLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuUGxhbmV0b2lkLnByb3RvdHlwZS5fZ2VvbWV0cnkgPSBbXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLmQyY3Jvc3N9LFxuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5zcXVhcmUwfSxcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuc3F1YXJlMX1cbl07XG5cbm1vZHVsZS5leHBvcnRzID0gUGxhbmV0b2lkO1xuIiwiLyoqXG4gKiBTaGlwLmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5TaGlwO1xuLy92YXIgRW5naW5lID0gcmVxdWlyZSgnLi9FbmdpbmUuanMnKTtcbi8vdmFyIFdlYXBvbnMgPSByZXF1aXJlKCcuL1dlYXBvbnMuanMnKTtcblxudmFyIFNoaXAgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG5cbiAgICBpZiAoY29uZmlnLm1hc3MpIHtcbiAgICAgICAgdGhpcy5ib2R5Lm1hc3MgPSBjb25maWcubWFzcztcbiAgICB9XG4gICAgLy90aGlzLmVuZ2luZSA9IEVuZ2luZS5hZGQoZ2FtZSwgJ3RocnVzdCcsIDUwMCk7XG4gICAgLy90aGlzLmFkZENoaWxkKHRoaXMuZW5naW5lKTtcbiAgICAvL3RoaXMud2VhcG9ucyA9IFdlYXBvbnMuYWRkKGdhbWUsICdidWxsZXQnLCAxMik7XG4gICAgLy90aGlzLndlYXBvbnMuc2hpcCA9IHRoaXM7XG4gICAgLy90aGlzLmFkZENoaWxkKHRoaXMud2VhcG9ucyk7XG4gICAgdGhpcy50YWdUZXh0ID0gZ2FtZS5hZGQudGV4dCgwLCB0aGlzLnRleHR1cmUuaGVpZ2h0LzIgKyAxLFxuICAgICAgICBjb25maWcudGFnLCB7Zm9udDogJ2JvbGQgMThweCBBcmlhbCcsIGZpbGw6IHRoaXMubGluZUNvbG9yIHx8ICcjZmZmZmZmJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgdGhpcy50YWdUZXh0LmFuY2hvci5zZXRUbygwLjUsIDApO1xuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy50YWdUZXh0KTtcbiAgICB0aGlzLmxvY2FsU3RhdGUgPSB7XG4gICAgICAgIHRocnVzdDogJ29mZidcbiAgICB9XG59O1xuXG5TaGlwLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIHMgPSBuZXcgU2hpcChnYW1lLCBvcHRpb25zKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhzKTtcbiAgICByZXR1cm4gcztcbn07XG5cblNoaXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcblNoaXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2hpcDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFNoaXAucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFNoaXAucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbi8vU2hpcC5wcm90b3R5cGUuc2V0TGluZVN0eWxlID0gZnVuY3Rpb24gKGNvbG9yLCBsaW5lV2lkdGgpIHtcbi8vICAgIFN0YXJjb2Rlci5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnNldExpbmVTdHlsZS5jYWxsKHRoaXMsIGNvbG9yLCBsaW5lV2lkdGgpO1xuLy8gICAgdGhpcy50YWdUZXh0LnNldFN0eWxlKHtmaWxsOiBjb2xvcn0pO1xuLy99O1xuXG4vL1NoaXAucHJvdG90eXBlLnNoYXBlID0gW1xuLy8gICAgWy0xLC0xXSxcbi8vICAgIFstMC41LDBdLFxuLy8gICAgWy0xLDFdLFxuLy8gICAgWzAsMC41XSxcbi8vICAgIFsxLDFdLFxuLy8gICAgWzAuNSwwXSxcbi8vICAgIFsxLC0xXSxcbi8vICAgIFswLC0wLjVdLFxuLy8gICAgWy0xLC0xXVxuLy9dO1xuLy9TaGlwLnByb3RvdHlwZS5fbGluZVdpZHRoID0gNjtcblxuU2hpcC5wcm90b3R5cGUudXBkYXRlQXBwZWFyYW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBGSVhNRTogUHJvYmFibHkgbmVlZCB0byByZWZhY3RvciBjb25zdHJ1Y3RvciBhIGJpdCB0byBtYWtlIHRoaXMgY2xlYW5lclxuICAgIFZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlQXBwZWFyYW5jZS5jYWxsKHRoaXMpO1xuICAgIGlmICh0aGlzLnRhZ1RleHQpIHtcbiAgICAgICAgLy90aGlzLnRhZ1RleHQuc2V0U3R5bGUoe2ZpbGw6IHRoaXMubGluZUNvbG9yfSk7XG4gICAgICAgIHRoaXMudGFnVGV4dC5maWxsID0gdGhpcy5saW5lQ29sb3I7XG4gICAgICAgIHRoaXMudGFnVGV4dC55ID0gdGhpcy50ZXh0dXJlLmhlaWdodC8yICsgMTtcbiAgICB9XG59O1xuXG5TaGlwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzKTtcbiAgICAvLyBGSVhNRTogTmVlZCB0byBkZWFsIHdpdGggcGxheWVyIHZlcnN1cyBmb3JlaWduIHNoaXBzXG4gICAgc3dpdGNoICh0aGlzLmxvY2FsU3RhdGUudGhydXN0KSB7XG4gICAgICAgIGNhc2UgJ3N0YXJ0aW5nJzpcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnBsYXkoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RhcnRPbih0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdGF0ZS50aHJ1c3QgPSAnb24nO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NodXRkb3duJzpcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RvcE9uKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0YXRlLnRocnVzdCA9ICdvZmYnO1xuICAgIH1cbiAgICAvLyBQbGF5ZXIgc2hpcCBvbmx5XG4gICAgdGhpcy5nYW1lLmludmVudG9yeXRleHQuc2V0VGV4dCh0aGlzLmNyeXN0YWxzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcDtcbi8vU3RhcmNvZGVyLlNoaXAgPSBTaGlwO1xuIiwiLyoqXG4gKiBTaW1wbGVQYXJ0aWNsZS5qc1xuICpcbiAqIEJhc2ljIGJpdG1hcCBwYXJ0aWNsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8vdmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uLy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gZnVuY3Rpb24gKGdhbWUsIGtleSkge1xuICAgIHZhciB0ZXh0dXJlID0gU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZVtrZXldO1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCAwLCAwLCB0ZXh0dXJlKTtcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHRoaXMsIGZhbHNlLCBmYWxzZSk7XG4gICAgdGhpcy5ib2R5LmNsZWFyU2hhcGVzKCk7XG4gICAgdmFyIHNoYXBlID0gdGhpcy5ib2R5LmFkZFBhcnRpY2xlKCk7XG4gICAgc2hhcGUuc2Vuc29yID0gdHJ1ZTtcbiAgICAvL3RoaXMua2lsbCgpO1xufTtcblxuU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZSA9IHt9O1xuXG5TaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUgPSBmdW5jdGlvbiAoZ2FtZSwga2V5LCBjb2xvciwgc2l6ZSkge1xuICAgIHZhciB0ZXh0dXJlID0gZ2FtZS5tYWtlLmJpdG1hcERhdGEoc2l6ZSwgc2l6ZSk7XG4gICAgdGV4dHVyZS5jdHguZmlsbFN0eWxlID0gY29sb3I7XG4gICAgdGV4dHVyZS5jdHguZmlsbFJlY3QoMCwgMCwgc2l6ZSwgc2l6ZSk7XG4gICAgU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZVtrZXldID0gdGV4dHVyZTtcbn07XG5cblNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuU2ltcGxlUGFydGljbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2ltcGxlUGFydGljbGU7XG5cbi8vU2ltcGxlUGFydGljbGUuRW1pdHRlciA9IGZ1bmN0aW9uIChnYW1lLCBrZXksIG4pIHtcbi8vICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUpO1xuLy8gICAgbiA9IG4gfHwgNTA7XG4vLyAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykge1xuLy8gICAgICAgIHRoaXMuYWRkKG5ldyBTaW1wbGVQYXJ0aWNsZShnYW1lLCBrZXkpKTtcbi8vICAgIH1cbi8vICAgIHRoaXMuX29uID0gZmFsc2U7XG4vL307XG4vL1xuLy9TaW1wbGVQYXJ0aWNsZS5FbWl0dGVyLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBrZXksIG4pIHtcbi8vICAgIHZhciBlbWl0dGVyID0gbmV3IFNpbXBsZVBhcnRpY2xlLkVtaXR0ZXIoZ2FtZSwga2V5LCBuKTtcbi8vICAgIGdhbWUuYWRkLmV4aXN0aW5nKGVtaXR0ZXIpO1xuLy8gICAgcmV0dXJuIGVtaXR0ZXI7XG4vL307XG4vL1xuLy9TaW1wbGVQYXJ0aWNsZS5FbWl0dGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG4vL1NpbXBsZVBhcnRpY2xlLkVtaXR0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2ltcGxlUGFydGljbGUuRW1pdHRlcjtcbi8vXG4vL1NpbXBsZVBhcnRpY2xlLkVtaXR0ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbi8vICAgIC8vIEZJWE1FOiBUZXN0aW5nIGhhY2tcbi8vICAgIGlmICh0aGlzLl9vbikge1xuLy8gICAgICAgIGZvciAodmFyIGkgPSAwOyBpPDIwOyBpKyspIHtcbi8vICAgICAgICAgICAgdmFyIHBhcnRpY2xlID0gdGhpcy5nZXRGaXJzdERlYWQoKTtcbi8vICAgICAgICAgICAgaWYgKCFwYXJ0aWNsZSkge1xuLy8gICAgICAgICAgICAgICAgYnJlYWs7XG4vLyAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgcGFydGljbGUubGlmZXNwYW4gPSAyNTA7XG4vLyAgICAgICAgICAgIHBhcnRpY2xlLmFscGhhID0gMC41O1xuLy8gICAgICAgICAgICB2YXIgZCA9IHRoaXMuZ2FtZS5ybmQuYmV0d2VlbigtNywgNyk7XG4vLyAgICAgICAgICAgIHBhcnRpY2xlLnJlc2V0KGQsIDEwKTtcbi8vICAgICAgICAgICAgcGFydGljbGUuYm9keS52ZWxvY2l0eS55ID0gODA7XG4vLyAgICAgICAgICAgIHBhcnRpY2xlLmJvZHkudmVsb2NpdHkueCA9IC0zKmQ7XG4vLyAgICAgICAgfVxuLy8gICAgfVxuLy99O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZVBhcnRpY2xlO1xuLy9TdGFyY29kZXIuU2ltcGxlUGFydGljbGUgPSBTaW1wbGVQYXJ0aWNsZTsiLCIvKipcbiAqIFN5bmNCb2R5SW50ZXJmYWNlLmpzXG4gKlxuICogU2hhcmVkIG1ldGhvZHMgZm9yIFZlY3RvclNwcml0ZXMsIFBhcnRpY2xlcywgZXRjLlxuICovXG5cbnZhciBTeW5jQm9keUludGVyZmFjZSA9IGZ1bmN0aW9uICgpIHt9O1xuXG4vKipcbiAqIFNldCBsb2NhdGlvbiBhbmQgYW5nbGUgb2YgYSBwaHlzaWNzIG9iamVjdC4gVmFsdWUgYXJlIGdpdmVuIGluIHdvcmxkIGNvb3JkaW5hdGVzLCBub3QgcGl4ZWxzXG4gKlxuICogQHBhcmFtIHgge251bWJlcn1cbiAqIEBwYXJhbSB5IHtudW1iZXJ9XG4gKiBAcGFyYW0gYSB7bnVtYmVyfVxuICovXG5TeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUuc2V0UG9zQW5nbGUgPSBmdW5jdGlvbiAoeCwgeSwgYSkge1xuICAgIHRoaXMuYm9keS5kYXRhLnBvc2l0aW9uWzBdID0gLSh4IHx8IDApO1xuICAgIHRoaXMuYm9keS5kYXRhLnBvc2l0aW9uWzFdID0gLSh5IHx8IDApO1xuICAgIHRoaXMuYm9keS5kYXRhLmFuZ2xlID0gYSB8fCAwO1xufTtcblxuU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlLmNvbmZpZyA9IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnVwZGF0ZVByb3BlcnRpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBrID0gdGhpcy51cGRhdGVQcm9wZXJ0aWVzW2ldO1xuICAgICAgICBpZiAodHlwZW9mIHByb3BlcnRpZXNba10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzW2tdID0gcHJvcGVydGllc1trXTsgICAgICAgIC8vIEZJWE1FPyBWaXJ0dWFsaXplIHNvbWVob3dcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3luY0JvZHlJbnRlcmZhY2U7IiwiLyoqXG4gKiBUaHJ1c3RHZW5lcmF0b3IuanNcbiAqXG4gKiBHcm91cCBwcm92aWRpbmcgQVBJLCBsYXllcmluZywgYW5kIHBvb2xpbmcgZm9yIHRocnVzdCBwYXJ0aWNsZSBlZmZlY3RzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gcmVxdWlyZSgnLi9TaW1wbGVQYXJ0aWNsZS5qcycpO1xuXG52YXIgX3RleHR1cmVLZXkgPSAndGhydXN0JztcblxuLy8gUG9vbGluZyBwYXJhbWV0ZXJzXG52YXIgX21pblBvb2xTaXplID0gMzAwO1xudmFyIF9taW5GcmVlUGFydGljbGVzID0gMjA7XG52YXIgX3NvZnRQb29sTGltaXQgPSAyMDA7XG52YXIgX2hhcmRQb29sTGltaXQgPSA1MDA7XG5cbi8vIEJlaGF2aW9yIG9mIGVtaXR0ZXJcbnZhciBfcGFydGljbGVzUGVyQnVyc3QgPSA1O1xudmFyIF9wYXJ0aWNsZVRUTCA9IDE1MDtcbnZhciBfcGFydGljbGVCYXNlU3BlZWQgPSA1O1xudmFyIF9jb25lTGVuZ3RoID0gMTtcbnZhciBfY29uZVdpZHRoUmF0aW8gPSAwLjI7XG52YXIgX2VuZ2luZU9mZnNldCA9IC0yMDtcblxudmFyIFRocnVzdEdlbmVyYXRvciA9IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICB0aGlzLnRocnVzdGluZ1NoaXBzID0ge307XG5cbiAgICAvLyBQcmVnZW5lcmF0ZSBhIGJhdGNoIG9mIHBhcnRpY2xlc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX21pblBvb2xTaXplOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnRpY2xlID0gdGhpcy5hZGQobmV3IFNpbXBsZVBhcnRpY2xlKGdhbWUsIF90ZXh0dXJlS2V5KSk7XG4gICAgICAgIHBhcnRpY2xlLmFscGhhID0gMC41O1xuICAgICAgICBwYXJ0aWNsZS5yb3RhdGlvbiA9IE1hdGguUEkvNDtcbiAgICAgICAgcGFydGljbGUua2lsbCgpO1xuICAgIH1cbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRocnVzdEdlbmVyYXRvcjtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS5zdGFydE9uID0gZnVuY3Rpb24gKHNoaXApIHtcbiAgICB0aGlzLnRocnVzdGluZ1NoaXBzW3NoaXAuaWRdID0gc2hpcDtcbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUuc3RvcE9uID0gZnVuY3Rpb24gKHNoaXApIHtcbiAgICBkZWxldGUgdGhpcy50aHJ1c3RpbmdTaGlwc1tzaGlwLmlkXTtcbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy50aHJ1c3RpbmdTaGlwcyk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBrZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgc2hpcCA9IHRoaXMudGhydXN0aW5nU2hpcHNba2V5c1tpXV07XG4gICAgICAgIHZhciB3ID0gc2hpcC53aWR0aDtcbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKHNoaXAucm90YXRpb24pO1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3Moc2hpcC5yb3RhdGlvbik7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX3BhcnRpY2xlc1BlckJ1cnN0OyBqKyspIHtcbiAgICAgICAgICAgIHZhciBwYXJ0aWNsZSA9IHRoaXMuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICAgICAgICBpZiAoIXBhcnRpY2xlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vdCBlbm91Z2ggdGhydXN0IHBhcnRpY2xlcyBpbiBwb29sJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZCA9IHRoaXMuZ2FtZS5ybmQucmVhbEluUmFuZ2UoLV9jb25lV2lkdGhSYXRpbyp3LCBfY29uZVdpZHRoUmF0aW8qdyk7XG4gICAgICAgICAgICB2YXIgeCA9IHNoaXAueCArIGQqY29zICsgX2VuZ2luZU9mZnNldCpzaW47XG4gICAgICAgICAgICB2YXIgeSA9IHNoaXAueSArIGQqc2luIC0gX2VuZ2luZU9mZnNldCpjb3M7XG4gICAgICAgICAgICBwYXJ0aWNsZS5saWZlc3BhbiA9IF9wYXJ0aWNsZVRUTDtcbiAgICAgICAgICAgIHBhcnRpY2xlLnJlc2V0KHgsIHkpO1xuICAgICAgICAgICAgcGFydGljbGUuYm9keS52ZWxvY2l0eS54ID0gX3BhcnRpY2xlQmFzZVNwZWVkKihfY29uZUxlbmd0aCpzaW4gLSBkKmNvcyk7XG4gICAgICAgICAgICBwYXJ0aWNsZS5ib2R5LnZlbG9jaXR5LnkgPSBfcGFydGljbGVCYXNlU3BlZWQqKC1fY29uZUxlbmd0aCpjb3MgLSBkKnNpbik7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IudGV4dHVyZUtleSA9IF90ZXh0dXJlS2V5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRocnVzdEdlbmVyYXRvcjsiLCIvKipcbiAqIFRvYXN0LmpzXG4gKlxuICogQ2xhc3MgZm9yIHZhcmlvdXMga2luZHMgb2YgcG9wIHVwIG1lc3NhZ2VzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFRvYXN0ID0gZnVuY3Rpb24gKGdhbWUsIHgsIHksIHRleHQsIGNvbmZpZykge1xuICAgIC8vIFRPRE86IGJldHRlciBkZWZhdWx0cywgbWF5YmVcbiAgICBQaGFzZXIuVGV4dC5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIHRleHQsIHtcbiAgICAgICAgZm9udDogJzE0cHQgQXJpYWwnLFxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXG4gICAgICAgIGZpbGw6ICcjZmZhNTAwJ1xuICAgIH0pO1xuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICAvLyBTZXQgdXAgc3R5bGVzIGFuZCB0d2VlbnNcbiAgICB2YXIgc3BlYyA9IHt9O1xuICAgIGlmIChjb25maWcudXApIHtcbiAgICAgICAgc3BlYy55ID0gJy0nICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmRvd24pIHtcbiAgICAgICAgc3BlYy55ID0gJysnICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmxlZnQpIHtcbiAgICAgICAgc3BlYy54ID0gJy0nICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLnJpZ2h0KSB7XG4gICAgICAgIHNwZWMueCA9ICcrJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgc3dpdGNoIChjb25maWcudHlwZSkge1xuICAgICAgICBjYXNlICdzcGlubmVyJzpcbiAgICAgICAgICAgIHRoaXMuZm9udFNpemUgPSAnMjBwdCc7XG4gICAgICAgICAgICBzcGVjLnJvdGF0aW9uID0gY29uZmlnLnJldm9sdXRpb25zID8gY29uZmlnLnJldm9sdXRpb25zICogMiAqIE1hdGguUEkgOiAyICogTWF0aC5QSTtcbiAgICAgICAgICAgIHZhciB0d2VlbiA9IGdhbWUuYWRkLnR3ZWVuKHRoaXMpLnRvKHNwZWMsIGNvbmZpZy5kdXJhdGlvbiwgY29uZmlnLmVhc2luZywgdHJ1ZSk7XG4gICAgICAgICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZChmdW5jdGlvbiAodG9hc3QpIHtcbiAgICAgICAgICAgICAgICB0b2FzdC5raWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gVE9ETzogTW9yZSBraW5kc1xuICAgIH1cbn07XG5cbi8qKlxuICogQ3JlYXRlIG5ldyBUb2FzdCBhbmQgYWRkIHRvIGdhbWVcbiAqXG4gKiBAcGFyYW0gZ2FtZVxuICogQHBhcmFtIHhcbiAqIEBwYXJhbSB5XG4gKiBAcGFyYW0gdGV4dFxuICogQHBhcmFtIGNvbmZpZ1xuICovXG5Ub2FzdC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSwgdGV4dCwgY29uZmlnKSB7XG4gICAgdmFyIHRvYXN0ID0gbmV3IFRvYXN0KGdhbWUsIHgsIHksIHRleHQsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodG9hc3QpO1xufTtcblxuLy8gQ292ZW5pZW5jZSBtZXRob2RzIGZvciBjb21tb24gY2FzZXNcblxuVG9hc3Quc3BpblVwID0gZnVuY3Rpb24gKGdhbWUsIHgsIHksIHRleHQpIHtcbiAgICB2YXIgdG9hc3QgPSBuZXcgVG9hc3QgKGdhbWUsIHgsIHksIHRleHQsIHtcbiAgICAgICAgdHlwZTogJ3NwaW5uZXInLFxuICAgICAgICByZXZvbHV0aW9uczogMSxcbiAgICAgICAgZHVyYXRpb246IDUwMCxcbiAgICAgICAgZWFzaW5nOiBQaGFzZXIuRWFzaW5nLkVsYXN0aWMuT3V0LFxuICAgICAgICB1cDogMTAwXG4gICAgfSk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodG9hc3QpO1xufTtcblxuVG9hc3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuVGV4dC5wcm90b3R5cGUpO1xuVG9hc3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVG9hc3Q7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9hc3Q7XG4iLCIvKipcbiAqIFRyZWUuanNcbiAqXG4gKiBDbGllbnQgc2lkZVxuICovXG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuVHJlZTtcblxudmFyIFRyZWUgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDEpO1xufTtcblxuVHJlZS5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgdmFyIHRyZWUgPSBuZXcgVHJlZSAoZ2FtZSwgY29uZmlnKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyh0cmVlKTtcbiAgICByZXR1cm4gdHJlZTtcbn07XG5cblRyZWUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcblRyZWUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVHJlZTtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFRyZWUucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFRyZWUucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbi8qKlxuICogRHJhdyB0cmVlLCBvdmVycmlkaW5nIHN0YW5kYXJkIHNoYXBlIGFuZCBnZW9tZXRyeSBtZXRob2QgdG8gdXNlIGdyYXBoXG4gKlxuICogQHBhcmFtIHJlbmRlclNjYWxlXG4gKi9cblRyZWUucHJvdG90eXBlLmRyYXdQcm9jZWR1cmUgPSBmdW5jdGlvbiAocmVuZGVyU2NhbGUpIHtcbiAgICB2YXIgbGluZUNvbG9yID0gUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMubGluZUNvbG9yKTtcbiAgICB0aGlzLmdyYXBoaWNzLmxpbmVTdHlsZSgxLCBsaW5lQ29sb3IsIDEpO1xuICAgIHRoaXMuX2RyYXdCcmFuY2godGhpcy5ncmFwaCwgdGhpcy5nYW1lLnBoeXNpY3MucDIubXB4aSh0aGlzLnZlY3RvclNjYWxlKSpyZW5kZXJTY2FsZSwgNSk7XG59O1xuXG5UcmVlLnByb3RvdHlwZS5fZHJhd0JyYW5jaCA9IGZ1bmN0aW9uIChncmFwaCwgc2MsIGRlcHRoKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBncmFwaC5jLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSBncmFwaC5jW2ldO1xuICAgICAgICB0aGlzLmdyYXBoaWNzLm1vdmVUbyhncmFwaC54ICogc2MsIGdyYXBoLnkgKiBzYyk7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubGluZVRvKGNoaWxkLnggKiBzYywgY2hpbGQueSAqIHNjKTtcbiAgICAgICAgaWYgKGRlcHRoID4gdGhpcy5zdGVwKSB7XG4gICAgICAgICAgICB0aGlzLl9kcmF3QnJhbmNoKGNoaWxkLCBzYywgZGVwdGggLSAxKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShUcmVlLnByb3RvdHlwZSwgJ3N0ZXAnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGVwO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX3N0ZXAgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmVlOyIsIi8qKlxuICogU3ByaXRlIHdpdGggYXR0YWNoZWQgR3JhcGhpY3Mgb2JqZWN0IGZvciB2ZWN0b3ItbGlrZSBncmFwaGljc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbi8vdmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uLy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBWZWN0b3ItYmFzZWQgc3ByaXRlc1xuICpcbiAqIEBwYXJhbSBnYW1lIHtQaGFzZXIuR2FtZX0gLSBQaGFzZXIgZ2FtZSBvYmplY3RcbiAqIEBwYXJhbSBjb25maWcge29iamVjdH0gLSBQT0pPIHdpdGggY29uZmlnIGRldGFpbHNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgVmVjdG9yU3ByaXRlID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIHRoaXMuZ3JhcGhpY3MgPSBnYW1lLm1ha2UuZ3JhcGhpY3MoKTtcbiAgICB0aGlzLnRleHR1cmUgPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICB0aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgdGhpcy5taW5pc3ByaXRlID0gdGhpcy5nYW1lLm1pbmltYXAuY3JlYXRlKCk7XG4gICAgdGhpcy5taW5pc3ByaXRlLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG5cbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHRoaXMsIGZhbHNlLCBmYWxzZSk7XG4gICAgdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbiAgICB0aGlzLmNvbmZpZyhjb25maWcucHJvcGVydGllcyk7XG4gICAgdGhpcy51cGRhdGVBcHBlYXJhbmNlKCk7XG4gICAgdGhpcy51cGRhdGVCb2R5KCk7XG4gICAgdGhpcy5ib2R5Lm1hc3MgPSAwO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgVmVjdG9yU3ByaXRlIGFuZCBhZGQgdG8gZ2FtZSB3b3JsZFxuICpcbiAqIEBwYXJhbSBnYW1lIHtQaGFzZXIuR2FtZX1cbiAqIEBwYXJhbSB4IHtudW1iZXJ9IC0geCBjb29yZFxuICogQHBhcmFtIHkge251bWJlcn0gLSB5IGNvb3JkXG4gKiBAcmV0dXJucyB7VmVjdG9yU3ByaXRlfVxuICovXG5WZWN0b3JTcHJpdGUuYWRkID0gZnVuY3Rpb24gKGdhbWUsIHgsIHkpIHtcbiAgICB2YXIgdiA9IG5ldyBWZWN0b3JTcHJpdGUoZ2FtZSwgeCwgeSk7XG4gICAgZ2FtZS5hZGQuZXhpc3Rpbmcodik7XG4gICAgcmV0dXJuIHY7XG59XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBWZWN0b3JTcHJpdGU7XG5cbi8vIERlZmF1bHQgb2N0YWdvblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fc2hhcGUgPSBbXG4gICAgWzIsMV0sXG4gICAgWzEsMl0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwxXSxcbiAgICBbLTIsLTFdLFxuICAgIFstMSwtMl0sXG4gICAgWzEsLTJdLFxuICAgIFsyLC0xXVxuXTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmZmZmZmJztcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9maWxsQ29sb3IgPSBudWxsO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4yNTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX3ZlY3RvclNjYWxlID0gMTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5waHlzaWNzQm9keVR5cGUgPSAnY2lyY2xlJztcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5zZXRTaGFwZSA9IGZ1bmN0aW9uIChzaGFwZSkge1xuICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcbiAgICB0aGlzLnVwZGF0ZUFwcGVhcmFuY2UoKTtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0TGluZVN0eWxlID0gZnVuY3Rpb24gKGNvbG9yLCBsaW5lV2lkdGgpIHtcbiAgICBpZiAoIWxpbmVXaWR0aCB8fCBsaW5lV2lkdGggPCAxKSB7XG4gICAgICAgIGxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoIHx8IDE7XG4gICAgfVxuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICB0aGlzLmxpbmVXaWR0aCA9IGxpbmVXaWR0aDtcbiAgICB0aGlzLnVwZGF0ZUFwcGVhcmFuY2UoKTtcbn07XG5cbi8qKlxuICogVXBkYXRlIGNhY2hlZCBiaXRtYXBzIGZvciBvYmplY3QgYWZ0ZXIgdmVjdG9yIHByb3BlcnRpZXMgY2hhbmdlXG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlQXBwZWFyYW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBEcmF3IGZ1bGwgc2l6ZWRcbiAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XG4gICAgdGhpcy5ncmFwaGljcy5fY3VycmVudEJvdW5kcyA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmRyYXdQcm9jZWR1cmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuZHJhd1Byb2NlZHVyZSgxKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUpIHtcbiAgICAgICAgdGhpcy5kcmF3KDEpO1xuICAgIH1cbiAgICB2YXIgYm91bmRzID0gdGhpcy5ncmFwaGljcy5nZXRMb2NhbEJvdW5kcygpO1xuICAgIHRoaXMudGV4dHVyZS5yZXNpemUoYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0LCB0cnVlKTtcbiAgICB0aGlzLnRleHR1cmUucmVuZGVyWFkodGhpcy5ncmFwaGljcywgLWJvdW5kcy54LCAtYm91bmRzLnksIHRydWUpO1xuICAgIHRoaXMuc2V0VGV4dHVyZSh0aGlzLnRleHR1cmUpO1xuICAgIC8vIERyYXcgc21hbGwgZm9yIG1pbmltYXBcbiAgICB2YXIgbWFwU2NhbGUgPSB0aGlzLmdhbWUubWluaW1hcC5tYXBTY2FsZTtcbiAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XG4gICAgdGhpcy5ncmFwaGljcy5fY3VycmVudEJvdW5kcyA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmRyYXdQcm9jZWR1cmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuZHJhd1Byb2NlZHVyZShtYXBTY2FsZSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNoYXBlKSB7XG4gICAgICAgIHRoaXMuZHJhdyhtYXBTY2FsZSk7XG4gICAgfVxuICAgIGJvdW5kcyA9IHRoaXMuZ3JhcGhpY3MuZ2V0TG9jYWxCb3VuZHMoKTtcbiAgICB0aGlzLm1pbml0ZXh0dXJlLnJlc2l6ZShib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIHRydWUpO1xuICAgIHRoaXMubWluaXRleHR1cmUucmVuZGVyWFkodGhpcy5ncmFwaGljcywgLWJvdW5kcy54LCAtYm91bmRzLnksIHRydWUpO1xuICAgIHRoaXMubWluaXNwcml0ZS5zZXRUZXh0dXJlKHRoaXMubWluaXRleHR1cmUpO1xuICAgIHRoaXMuX2RpcnR5ID0gZmFsc2U7XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZUJvZHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgc3dpdGNoICh0aGlzLnBoeXNpY3NCb2R5VHlwZSkge1xuICAgICAgICBjYXNlIFwiY2lyY2xlXCI6XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuY2lyY2xlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHZhciByID0gdGhpcy5ncmFwaGljcy5nZXRCb3VuZHMoKTtcbiAgICAgICAgICAgICAgICB2YXIgcmFkaXVzID0gTWF0aC5yb3VuZChNYXRoLnNxcnQoci53aWR0aCogci5oZWlnaHQpLzIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByYWRpdXMgPSB0aGlzLnJhZGl1cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRDaXJjbGUocmFkaXVzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBUT0RPOiBNb3JlIHNoYXBlc1xuICAgIH1cbn07XG5cbi8qKlxuICogUmVuZGVyIHZlY3RvciB0byBiaXRtYXAgb2YgZ3JhcGhpY3Mgb2JqZWN0IGF0IGdpdmVuIHNjYWxlXG4gKlxuICogQHBhcmFtIHJlbmRlclNjYWxlIHtudW1iZXJ9IC0gc2NhbGUgZmFjdG9yIGZvciByZW5kZXJcbiAqL1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlKSB7XG4gICAgcmVuZGVyU2NhbGUgPSByZW5kZXJTY2FsZSB8fCAxO1xuICAgIC8vIERyYXcgc2ltcGxlIHNoYXBlLCBpZiBnaXZlblxuICAgIGlmICh0aGlzLnNoYXBlKSB7XG4gICAgICAgIHZhciBsaW5lQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpO1xuICAgICAgICBpZiAocmVuZGVyU2NhbGUgPT09IDEpIHtcbiAgICAgICAgICAgIHZhciBsaW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpbmVXaWR0aCA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZW5kZXJTY2FsZSA9PT0gMSkgJiYgdGhpcy5maWxsQ29sb3IpIHsgICAgICAgIC8vIE9ubHkgZmlsbCBmdWxsIHNpemVkXG4gICAgICAgICAgICB2YXIgZmlsbENvbG9yID0gUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMuZmlsbENvbG9yKTtcbiAgICAgICAgICAgIHZhciBmaWxsQWxwaGEgPSB0aGlzLmZpbGxBbHBoYSB8fCAxO1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5iZWdpbkZpbGwoZmlsbENvbG9yLCBmaWxsQWxwaGEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKGxpbmVXaWR0aCwgbGluZUNvbG9yLCAxKTtcbiAgICAgICAgdGhpcy5fZHJhd1BvbHlnb24odGhpcy5zaGFwZSwgdGhpcy5zaGFwZUNsb3NlZCwgcmVuZGVyU2NhbGUpO1xuICAgICAgICBpZiAoKHJlbmRlclNjYWxlID09PSAxKSAmJiB0aGlzLmZpbGxDb2xvcikge1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5lbmRGaWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRHJhdyBnZW9tZXRyeSBzcGVjLCBpZiBnaXZlbiwgYnV0IG9ubHkgZm9yIHRoZSBmdWxsIHNpemVkIHNwcml0ZVxuICAgIGlmICgocmVuZGVyU2NhbGUgPT09IDEpICYmIHRoaXMuZ2VvbWV0cnkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmdlb21ldHJ5Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdmFyIGcgPSB0aGlzLmdlb21ldHJ5W2ldO1xuICAgICAgICAgICAgc3dpdGNoIChnLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwicG9seVwiOlxuICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRTogZGVmYXVsdHMgYW5kIHN0dWZmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYXdQb2x5Z29uKGcucG9pbnRzLCBnLmNsb3NlZCwgcmVuZGVyU2NhbGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRHJhdyBvcGVuIG9yIGNsb3NlZCBwb2x5Z29uIGFzIHNlcXVlbmNlIG9mIGxpbmVUbyBjYWxsc1xuICpcbiAqIEBwYXJhbSBwb2ludHMge0FycmF5fSAtIHBvaW50cyBhcyBhcnJheSBvZiBbeCx5XSBwYWlyc1xuICogQHBhcmFtIGNsb3NlZCB7Ym9vbGVhbn0gLSBpcyBwb2x5Z29uIGNsb3NlZD9cbiAqIEBwYXJhbSByZW5kZXJTY2FsZSB7bnVtYmVyfSAtIHNjYWxlIGZhY3RvciBmb3IgcmVuZGVyXG4gKiBAcHJpdmF0ZVxuICovXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9kcmF3UG9seWdvbiA9IGZ1bmN0aW9uIChwb2ludHMsIGNsb3NlZCwgcmVuZGVyU2NhbGUpIHtcbiAgICB2YXIgc2MgPSB0aGlzLmdhbWUucGh5c2ljcy5wMi5tcHhpKHRoaXMudmVjdG9yU2NhbGUpKnJlbmRlclNjYWxlO1xuICAgIHBvaW50cyA9IHBvaW50cy5zbGljZSgpO1xuICAgIGlmIChjbG9zZWQpIHtcbiAgICAgICAgcG9pbnRzLnB1c2gocG9pbnRzWzBdKTtcbiAgICB9XG4gICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8ocG9pbnRzWzBdWzBdICogc2MsIHBvaW50c1swXVsxXSAqIHNjKTtcbiAgICBmb3IgKHZhciBpID0gMSwgbCA9IHBvaW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lVG8ocG9pbnRzW2ldWzBdICogc2MsIHBvaW50c1tpXVsxXSAqIHNjKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEludmFsaWRhdGUgY2FjaGUgYW5kIHJlZHJhdyBpZiBzcHJpdGUgaXMgbWFya2VkIGRpcnR5XG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9kaXJ0eSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZGlydHkgVlMnKTtcbiAgICAgICAgdGhpcy51cGRhdGVBcHBlYXJhbmNlKCk7XG4gICAgfVxufTtcblxuLy8gVmVjdG9yIHByb3BlcnRpZXMgZGVmaW5lZCB0byBoYW5kbGUgbWFya2luZyBzcHJpdGUgZGlydHkgd2hlbiBuZWNlc3NhcnlcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdsaW5lQ29sb3InLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9saW5lQ29sb3I7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fbGluZUNvbG9yID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZmlsbENvbG9yJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlsbENvbG9yO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2ZpbGxDb2xvciA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2xpbmVXaWR0aCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpbmVXaWR0aDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9saW5lV2lkdGggPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdmaWxsQWxwaGEnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9maWxsQWxwaGE7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fZmlsbEFscGhhID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnc2hhcGVDbG9zZWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFwZUNsb3NlZDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9zaGFwZUNsb3NlZCA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3ZlY3RvclNjYWxlJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmVjdG9yU2NhbGU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fdmVjdG9yU2NhbGUgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdzaGFwZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NoYXBlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX3NoYXBlID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZ2VvbWV0cnknLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZW9tZXRyeTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9nZW9tZXRyeSA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2RlYWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWFkO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2RlYWQgPSB2YWw7XG4gICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICAgIHRoaXMua2lsbCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXZpdmUoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVmVjdG9yU3ByaXRlO1xuLy9TdGFyY29kZXIuVmVjdG9yU3ByaXRlID0gVmVjdG9yU3ByaXRlOyIsIi8qKlxuICogQ29udHJvbHMuanNcbiAqXG4gKiBWaXJ0dWFsaXplIGFuZCBpbXBsZW1lbnQgcXVldWUgZm9yIGdhbWUgY29udHJvbHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuY29uc29sZS5sb2coJ0NvbnRyb2xzJywgU3RhcmNvZGVyKTtcblxudmFyIENvbnRyb2xzID0gZnVuY3Rpb24gKGdhbWUsIHBhcmVudCkge1xuICAgIFBoYXNlci5QbHVnaW4uY2FsbCh0aGlzLCBnYW1lLCBwYXJlbnQpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuUGx1Z2luLnByb3RvdHlwZSk7XG5Db250cm9scy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb250cm9scztcblxuQ29udHJvbHMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAocXVldWUpIHtcbiAgICB0aGlzLnF1ZXVlID0gcXVldWU7XG4gICAgdGhpcy5jb250cm9scyA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG4gICAgdGhpcy5jb250cm9scy5maXJlID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuQik7XG59O1xuXG52YXIgc2VxID0gMDtcbnZhciB1cCA9IGZhbHNlLCBkb3duID0gZmFsc2UsIGxlZnQgPSBmYWxzZSwgcmlnaHQgPSBmYWxzZSwgZmlyZSA9IGZhbHNlO1xuXG5Db250cm9scy5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdXAgPSBkb3duID0gbGVmdCA9IHJpZ2h0ID0gZmFsc2U7XG4gICAgdGhpcy5xdWV1ZS5sZW5ndGggPSAwO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLnByZVVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPOiBTdXBwb3J0IG90aGVyIGludGVyYWN0aW9ucy9tZXRob2RzXG4gICAgdmFyIGNvbnRyb2xzID0gdGhpcy5jb250cm9scztcbiAgICBpZiAoY29udHJvbHMudXAuaXNEb3duICYmICF1cCkge1xuICAgICAgICB1cCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3VwX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFjb250cm9scy51cC5pc0Rvd24gJiYgdXApIHtcbiAgICAgICAgdXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndXBfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKGNvbnRyb2xzLmRvd24uaXNEb3duICYmICFkb3duKSB7XG4gICAgICAgIGRvd24gPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdkb3duX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFjb250cm9scy5kb3duLmlzRG93biAmJiBkb3duKSB7XG4gICAgICAgIGRvd24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZG93bl9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoY29udHJvbHMucmlnaHQuaXNEb3duICYmICFyaWdodCkge1xuICAgICAgICByaWdodCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3JpZ2h0X3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFjb250cm9scy5yaWdodC5pc0Rvd24gJiYgcmlnaHQpIHtcbiAgICAgICAgcmlnaHQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAncmlnaHRfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKGNvbnRyb2xzLmxlZnQuaXNEb3duICYmICFsZWZ0KSB7XG4gICAgICAgIGxlZnQgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdsZWZ0X3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFjb250cm9scy5sZWZ0LmlzRG93biAmJiBsZWZ0KSB7XG4gICAgICAgIGxlZnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnbGVmdF9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoY29udHJvbHMuZmlyZS5pc0Rvd24gJiYgIWZpcmUpIHtcbiAgICAgICAgZmlyZSA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2ZpcmVfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIWNvbnRyb2xzLmZpcmUuaXNEb3duICYmIGZpcmUpIHtcbiAgICAgICAgZmlyZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdmaXJlX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxufTtcblxuQ29udHJvbHMucHJvdG90eXBlLnByb2Nlc3NRdWV1ZSA9IGZ1bmN0aW9uIChjYiwgY2xlYXIpIHtcbiAgICB2YXIgcXVldWUgPSB0aGlzLnF1ZXVlO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcXVldWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBhY3Rpb24gPSBxdWV1ZVtpXTtcbiAgICAgICAgaWYgKGFjdGlvbi5leGVjdXRlZCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2IoYWN0aW9uKTtcbiAgICAgICAgYWN0aW9uLmV0aW1lID0gdGhpcy5nYW1lLnRpbWUubm93O1xuICAgICAgICBhY3Rpb24uZXhlY3V0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoY2xlYXIpIHtcbiAgICAgICAgcXVldWUubGVuZ3RoID0gMDtcbiAgICB9XG59O1xuXG5TdGFyY29kZXIuQ29udHJvbHMgPSBDb250cm9scztcbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbHM7IiwiLyoqXG4gKiBTeW5jQ2xpZW50LmpzXG4gKlxuICogU3luYyBwaHlzaWNzIG9iamVjdHMgd2l0aCBzZXJ2ZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xudmFyIFVQREFURV9RVUVVRV9MSU1JVCA9IDg7XG5cbnZhciBTeW5jQ2xpZW50ID0gZnVuY3Rpb24gKGdhbWUsIHBhcmVudCkge1xuICAgIFBoYXNlci5QbHVnaW4uY2FsbCh0aGlzLCBnYW1lLCBwYXJlbnQpO1xufTtcblxuU3luY0NsaWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5QbHVnaW4ucHJvdG90eXBlKTtcblN5bmNDbGllbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3luY0NsaWVudDtcblxuXG4vKipcbiAqIEluaXRpYWxpemUgcGx1Z2luXG4gKlxuICogQHBhcmFtIHNvY2tldCB7U29ja2V0fSAtIHNvY2tldC5pbyBzb2NrZXQgZm9yIHN5bmMgY29ubmVjdGlvblxuICogQHBhcmFtIHF1ZXVlIHtBcnJheX0gLSBjb21tYW5kIHF1ZXVlXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoc29ja2V0LCBxdWV1ZSkge1xuICAgIC8vIFRPRE86IENvcHkgc29tZSBjb25maWcgb3B0aW9uc1xuICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xuICAgIHRoaXMuY21kUXVldWUgPSBxdWV1ZTtcbiAgICB0aGlzLmV4dGFudCA9IHt9O1xufTtcblxuLyoqXG4gKiBTdGFydCBwbHVnaW5cbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBzdGFyY29kZXIgPSB0aGlzLmdhbWUuc3RhcmNvZGVyO1xuICAgIHRoaXMuX3VwZGF0ZUNvbXBsZXRlID0gZmFsc2U7XG4gICAgLy8gRklYTUU6IE5lZWQgbW9yZSByb2J1c3QgaGFuZGxpbmcgb2YgREMvUkNcbiAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5nYW1lLnBhdXNlZCA9IHRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ3JlY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5nYW1lLnBhdXNlZCA9IGZhbHNlO1xuICAgIH0pO1xuICAgIC8vIE1lYXN1cmUgY2xpZW50LXNlcnZlciB0aW1lIGRlbHRhXG4gICAgdGhpcy5zb2NrZXQub24oJ3RpbWVzeW5jJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgc2VsZi5fbGF0ZW5jeSA9IGRhdGEgLSBzZWxmLmdhbWUudGltZS5ub3c7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciByZWFsVGltZSA9IGRhdGEucjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBkYXRhLmIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdXBkYXRlID0gZGF0YS5iW2ldO1xuICAgICAgICAgICAgdmFyIGlkID0gdXBkYXRlLmlkO1xuICAgICAgICAgICAgdmFyIHNwcml0ZTtcbiAgICAgICAgICAgIHVwZGF0ZS50aW1lc3RhbXAgPSByZWFsVGltZTtcbiAgICAgICAgICAgIGlmIChzcHJpdGUgPSBzZWxmLmV4dGFudFtpZF0pIHtcbiAgICAgICAgICAgICAgICAvLyBFeGlzdGluZyBzcHJpdGUgLSBwcm9jZXNzIHVwZGF0ZVxuICAgICAgICAgICAgICAgIHNwcml0ZS51cGRhdGVRdWV1ZS5wdXNoKHVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZS5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS5jb25maWcodXBkYXRlLnByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3ByaXRlLnVwZGF0ZVF1ZXVlLmxlbmd0aCA+IFVQREFURV9RVUVVRV9MSU1JVCkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUudXBkYXRlUXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIE5ldyBzcHJpdGUgLSBjcmVhdGUgYW5kIGNvbmZpZ3VyZVxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ05ldycsIGlkLCB1cGRhdGUudCk7XG4gICAgICAgICAgICAgICAgc3ByaXRlID0gc3RhcmNvZGVyLmFkZEJvZHkodXBkYXRlLnQsIHVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHNwcml0ZSkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc2VydmVySWQgPSBpZDtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5leHRhbnRbaWRdID0gc3ByaXRlO1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUudXBkYXRlUXVldWUgPSBbdXBkYXRlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMCwgbCA9IGRhdGEucm0ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBpZCA9IGRhdGEucm1baV07XG4gICAgICAgICAgICBpZiAoc2VsZi5leHRhbnRbaWRdKSB7XG4gICAgICAgICAgICAgICAgc3RhcmNvZGVyLnJlbW92ZUJvZHkoc2VsZi5leHRhbnRbaWRdKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgc2VsZi5leHRhbnRbaWRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFNlbmQgcXVldWVkIGNvbW1hbmRzIHRvIHNlcnZlciBhbmQgaW50ZXJwb2xhdGUgb2JqZWN0cyBiYXNlZCBvbiB1cGRhdGVzIGZyb20gc2VydmVyXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX3VwZGF0ZUNvbXBsZXRlKSB7XG4gICAgICAgIHRoaXMuX3NlbmRDb21tYW5kcygpO1xuICAgICAgICB0aGlzLl9wcm9jZXNzUGh5c2ljc1VwZGF0ZXMoKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ29tcGxldGUgPSB0cnVlO1xuICAgIH1cbiB9O1xuXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5wb3N0UmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX3VwZGF0ZUNvbXBsZXRlID0gZmFsc2U7XG59O1xuXG4vKipcbiAqIFNlbmQgcXVldWVkIGNvbW1hbmRzIHRoYXQgaGF2ZSBiZWVuIGV4ZWN1dGVkIHRvIHRoZSBzZXJ2ZXJcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5fc2VuZENvbW1hbmRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhY3Rpb25zID0gW107XG4gICAgZm9yICh2YXIgaSA9IHRoaXMuY21kUXVldWUubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBhY3Rpb24gPSB0aGlzLmNtZFF1ZXVlW2ldO1xuICAgICAgICBpZiAoYWN0aW9uLmV4ZWN1dGVkKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goYWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuY21kUXVldWUuc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdkbycsIGFjdGlvbnMpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdzZW5kaW5nIGFjdGlvbnMnLCBhY3Rpb25zKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgaW50ZXJwb2xhdGlvbiAvIHByZWRpY3Rpb24gcmVzb2x1dGlvbiBmb3IgcGh5c2ljcyBib2RpZXNcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5fcHJvY2Vzc1BoeXNpY3NVcGRhdGVzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpbnRlcnBUaW1lID0gdGhpcy5nYW1lLnRpbWUubm93ICsgdGhpcy5fbGF0ZW5jeSAtIHRoaXMuZ2FtZS5zdGFyY29kZXIuY29uZmlnLnJlbmRlckxhdGVuY3k7XG4gICAgdmFyIG9pZHMgPSBPYmplY3Qua2V5cyh0aGlzLmV4dGFudCk7XG4gICAgZm9yICh2YXIgaSA9IG9pZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIHNwcml0ZSA9IHRoaXMuZXh0YW50W29pZHNbaV1dO1xuICAgICAgICB2YXIgcXVldWUgPSBzcHJpdGUudXBkYXRlUXVldWU7XG4gICAgICAgIHZhciBiZWZvcmUgPSBudWxsLCBhZnRlciA9IG51bGw7XG5cbiAgICAgICAgLy8gRmluZCB1cGRhdGVzIGJlZm9yZSBhbmQgYWZ0ZXIgaW50ZXJwVGltZVxuICAgICAgICB2YXIgaiA9IDE7XG4gICAgICAgIHdoaWxlIChxdWV1ZVtqXSkge1xuICAgICAgICAgICAgaWYgKHF1ZXVlW2pdLnRpbWVzdGFtcCA+IGludGVycFRpbWUpIHtcbiAgICAgICAgICAgICAgICBhZnRlciA9IHF1ZXVlW2pdO1xuICAgICAgICAgICAgICAgIGJlZm9yZSA9IHF1ZXVlW2otMV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb25lIC0gd2UncmUgYmVoaW5kLlxuICAgICAgICBpZiAoIWJlZm9yZSAmJiAhYWZ0ZXIpIHtcbiAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPj0gMikgeyAgICAvLyBUd28gbW9zdCByZWNlbnQgdXBkYXRlcyBhdmFpbGFibGU/IFVzZSB0aGVtLlxuICAgICAgICAgICAgICAgIGJlZm9yZSA9IHF1ZXVlW3F1ZXVlLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgICAgIGFmdGVyID0gcXVldWVbcXVldWUubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnTGFnZ2luZycsIG9pZHNbaV0pO1xuICAgICAgICAgICAgfSBlbHNlIHsgICAgICAgICAgICAgICAgICAgIC8vIE5vPyBKdXN0IGJhaWxcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdCYWlsaW5nJywgb2lkc1tpXSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdPaycsIGludGVycFRpbWUsIHF1ZXVlLmxlbmd0aCk7XG4gICAgICAgICAgICBxdWV1ZS5zcGxpY2UoMCwgaiAtIDEpOyAgICAgLy8gVGhyb3cgb3V0IG9sZGVyIHVwZGF0ZXNcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzcGFuID0gYWZ0ZXIudGltZXN0YW1wIC0gYmVmb3JlLnRpbWVzdGFtcDtcbiAgICAgICAgdmFyIHQgPSAoaW50ZXJwVGltZSAtIGJlZm9yZS50aW1lc3RhbXApIC8gc3BhbjtcbiAgICAgICAgc3ByaXRlLnNldFBvc0FuZ2xlKGxpbmVhcihiZWZvcmUueCwgYWZ0ZXIueCwgdCksIGxpbmVhcihiZWZvcmUueSwgYWZ0ZXIueSwgdCksIGxpbmVhcihiZWZvcmUuYSwgYWZ0ZXIuYSwgdCkpO1xuICAgIH1cbn07XG5cbi8vIEhlbHBlcnNcblxuLyoqXG4gKiBJbnRlcnBvbGF0ZSBiZXR3ZWVuIHR3byBwb2ludHMgd2l0aCBoZXJtaXRlIHNwbGluZVxuICogTkIgLSBjdXJyZW50bHkgdW51c2VkIGFuZCBwcm9iYWJseSBicm9rZW5cbiAqXG4gKiBAcGFyYW0gcDAge251bWJlcn0gLSBpbml0aWFsIHZhbHVlXG4gKiBAcGFyYW0gcDEge251bWJlcn0gLSBmaW5hbCB2YWx1ZVxuICogQHBhcmFtIHYwIHtudW1iZXJ9IC0gaW5pdGlhbCBzbG9wZVxuICogQHBhcmFtIHYxIHtudW1iZXJ9IC0gZmluYWwgc2xvcGVcbiAqIEBwYXJhbSB0IHtudW1iZXJ9IC0gcG9pbnQgb2YgaW50ZXJwb2xhdGlvbiAoYmV0d2VlbiAwIGFuZCAxKVxuICogQHJldHVybnMge251bWJlcn0gLSBpbnRlcnBvbGF0ZWQgdmFsdWVcbiAqL1xuZnVuY3Rpb24gaGVybWl0ZSAocDAsIHAxLCB2MCwgdjEsIHQpIHtcbiAgICB2YXIgdDIgPSB0KnQ7XG4gICAgdmFyIHQzID0gdCp0MjtcbiAgICByZXR1cm4gKDIqdDMgLSAzKnQyICsgMSkqcDAgKyAodDMgLSAyKnQyICsgdCkqdjAgKyAoLTIqdDMgKyAzKnQyKSpwMSArICh0MyAtIHQyKSp2MTtcbn1cblxuLyoqXG4gKiBJbnRlcnBvbGF0ZSBiZXR3ZWVuIHR3byBwb2ludHMgd2l0aCBsaW5lYXIgc3BsaW5lXG4gKlxuICogQHBhcmFtIHAwIHtudW1iZXJ9IC0gaW5pdGlhbCB2YWx1ZVxuICogQHBhcmFtIHAxIHtudW1iZXJ9IC0gZmluYWwgdmFsdWVcbiAqIEBwYXJhbSB0IHtudW1iZXJ9IC0gcG9pbnQgb2YgaW50ZXJwb2xhdGlvbiAoYmV0d2VlbiAwIGFuZCAxKVxuICogQHBhcmFtIHNjYWxlIHtudW1iZXJ9IC0gc2NhbGUgZmFjdG9yIHRvIG5vcm1hbGl6ZSB1bml0c1xuICogQHJldHVybnMge251bWJlcn0gLSBpbnRlcnBvbGF0ZWQgdmFsdWVcbiAqL1xuZnVuY3Rpb24gbGluZWFyIChwMCwgcDEsIHQsIHNjYWxlKSB7XG4gICAgc2NhbGUgPSBzY2FsZSB8fCAxO1xuICAgIHJldHVybiBwMCArIChwMSAtIHAwKSp0KnNjYWxlO1xufVxuXG5TdGFyY29kZXIuU2VydmVyU3luYyA9IFN5bmNDbGllbnQ7XG5tb2R1bGUuZXhwb3J0cyA9IFN5bmNDbGllbnQ7IiwiLyoqXG4gKiBCb290LmpzXG4gKlxuICogQm9vdCBzdGF0ZSBmb3IgU3RhcmNvZGVyXG4gKiBMb2FkIGFzc2V0cyBmb3IgcHJlbG9hZCBzY3JlZW4gYW5kIGNvbm5lY3QgdG8gc2VydmVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbnRyb2xzID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9Db250cm9scy5qcycpO1xudmFyIFN5bmNDbGllbnQgPSByZXF1aXJlKCcuLi9waGFzZXJwbHVnaW5zL1N5bmNDbGllbnQuanMnKTtcblxudmFyIEJvb3QgPSBmdW5jdGlvbiAoKSB7fTtcblxuQm9vdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuQm9vdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCb290O1xuXG52YXIgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuXG4vKipcbiAqIFNldCBwcm9wZXJ0aWVzIHRoYXQgcmVxdWlyZSBib290ZWQgZ2FtZSBzdGF0ZSwgYXR0YWNoIHBsdWdpbnMsIGNvbm5lY3QgdG8gZ2FtZSBzZXJ2ZXJcbiAqL1xuQm9vdC5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL3RoaXMuZ2FtZS5zdGFnZS5kaXNhYmxlVmlzaWJpbGl0eUNoYW5nZSA9IHRydWU7XG4gICAgdGhpcy5nYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuUkVTSVpFO1xuICAgIHRoaXMuZ2FtZS5yZW5kZXJlci5yZW5kZXJTZXNzaW9uLnJvdW5kUGl4ZWxzID0gdHJ1ZTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHBTY2FsZSA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5waHlzaWNzU2NhbGU7XG4gICAgdmFyIGlwU2NhbGUgPSAxL3BTY2FsZTtcbiAgICB2YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmNvbmZpZyA9IHtcbiAgICAgICAgcHhtOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGlwU2NhbGUqYTtcbiAgICAgICAgfSxcbiAgICAgICAgbXB4OiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGZsb29yKHBTY2FsZSphKTtcbiAgICAgICAgfSxcbiAgICAgICAgcHhtaTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiAtaXBTY2FsZSphO1xuICAgICAgICB9LFxuICAgICAgICBtcHhpOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGZsb29yKC1wU2NhbGUqYSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vdGhpcy5zdGFyY29kZXIuY29udHJvbHMgPSB0aGlzLmdhbWUucGx1Z2lucy5hZGQoQ29udHJvbHMsXG4gICAgLy8gICAgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzID0gdGhpcy5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKENvbnRyb2xzLCB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy8gU2V0IHVwIHNvY2tldC5pbyBjb25uZWN0aW9uXG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0ID0gdGhpcy5zdGFyY29kZXIuaW8odGhpcy5zdGFyY29kZXIuY29uZmlnLnNlcnZlclVyaSxcbiAgICAgICAgdGhpcy5zdGFyY29kZXIuY29uZmlnLmlvQ2xpZW50T3B0aW9ucyk7XG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0Lm9uKCdzZXJ2ZXIgcmVhZHknLCBmdW5jdGlvbiAocGxheWVyTXNnKSB7XG4gICAgICAgIC8vIEZJWE1FOiBIYXMgdG8gaW50ZXJhY3Qgd2l0aCBzZXNzaW9uIGZvciBhdXRoZW50aWNhdGlvbiBldGMuXG4gICAgICAgIHNlbGYuc3RhcmNvZGVyLnBsYXllciA9IHBsYXllck1zZztcbiAgICAgICAgLy9zZWxmLnN0YXJjb2Rlci5zeW5jY2xpZW50ID0gc2VsZi5nYW1lLnBsdWdpbnMuYWRkKFN5bmNDbGllbnQsXG4gICAgICAgIC8vICAgIHNlbGYuc3RhcmNvZGVyLnNvY2tldCwgc2VsZi5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgICAgICBzZWxmLnN0YXJjb2Rlci5zeW5jY2xpZW50ID0gc2VsZi5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKFN5bmNDbGllbnQsXG4gICAgICAgICAgICBzZWxmLnN0YXJjb2Rlci5zb2NrZXQsIHNlbGYuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICAgICAgX2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEFkdmFuY2UgZ2FtZSBzdGF0ZSBvbmNlIG5ldHdvcmsgY29ubmVjdGlvbiBpcyBlc3RhYmxpc2hlZFxuICovXG5Cb290LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKF9jb25uZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdzcGFjZScpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQm9vdDsiLCIvKipcbiAqIFNwYWNlLmpzXG4gKlxuICogTWFpbiBnYW1lIHN0YXRlIGZvciBTdGFyY29kZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBUaHJ1c3RHZW5lcmF0b3IgPSByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVGhydXN0R2VuZXJhdG9yLmpzJyk7XG52YXIgTWluaU1hcCA9IHJlcXVpcmUoJy4uL3BoYXNlcnVpL01pbmlNYXAuanMnKTtcbnZhciBUb2FzdCA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9Ub2FzdC5qcycpO1xuXG52YXIgU3BhY2UgPSBmdW5jdGlvbiAoKSB7fTtcblxuU3BhY2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcblNwYWNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNwYWNlO1xuXG5TcGFjZS5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUodGhpcy5nYW1lLCBUaHJ1c3RHZW5lcmF0b3IudGV4dHVyZUtleSwgJyNmZjY2MDAnLCA4KTtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUodGhpcy5nYW1lLCAnYnVsbGV0JywgJyM5OTk5OTknLCA0KTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygncGxheWVydGhydXN0JywgJ2Fzc2V0cy9zb3VuZHMvdGhydXN0TG9vcC5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnY2hpbWUnLCAnYXNzZXRzL3NvdW5kcy9jaGltZS5tcDMnKTtcbn07XG5cblNwYWNlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJuZyA9IHRoaXMuZ2FtZS5ybmQ7XG4gICAgdmFyIHdiID0gdGhpcy5zdGFyY29kZXIuY29uZmlnLndvcmxkQm91bmRzO1xuICAgIHZhciBwcyA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5waHlzaWNzU2NhbGU7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuUDJKUyk7XG4gICAgdGhpcy53b3JsZC5zZXRCb3VuZHMuY2FsbCh0aGlzLndvcmxkLCB3YlswXSpwcywgd2JbMV0qcHMsICh3YlsyXS13YlswXSkqcHMsICh3YlszXS13YlsxXSkqcHMpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLnAyLnNldEJvdW5kc1RvV29ybGQodHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgLy8gRGVidWdnaW5nXG4gICAgdGhpcy5nYW1lLnRpbWUuYWR2YW5jZWRUaW1pbmcgPSB0cnVlO1xuXG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMucmVzZXQoKTtcblxuICAgIC8vIFNvdW5kc1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMgPSB7fTtcbiAgICB0aGlzLmdhbWUuc291bmRzLnBsYXllcnRocnVzdCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ3BsYXllcnRocnVzdCcsIDEsIHRydWUpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMuY2hpbWUgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdjaGltZScsIDEsIGZhbHNlKTtcblxuICAgIC8vIEJhY2tncm91bmRcbiAgICB2YXIgc3RhcmZpZWxkID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSg2MDAsIDYwMCk7XG4gICAgZHJhd1N0YXJGaWVsZChzdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLmdhbWUuYWRkLnRpbGVTcHJpdGUod2JbMF0qcHMsIHdiWzFdKnBzLCAod2JbMl0td2JbMF0pKnBzLCAod2JbM10td2JbMV0pKnBzLCBzdGFyZmllbGQpO1xuXG4gICAgdGhpcy5zdGFyY29kZXIuc3luY2NsaWVudC5zdGFydCgpO1xuICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldC5lbWl0KCdjbGllbnQgcmVhZHknKTtcbiAgICB0aGlzLl9zZXR1cE1lc3NhZ2VIYW5kbGVycyh0aGlzLnN0YXJjb2Rlci5zb2NrZXQpO1xuXG4gICAgLy8gR3JvdXBzIGZvciBwYXJ0aWNsZSBlZmZlY3RzXG4gICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvciA9IG5ldyBUaHJ1c3RHZW5lcmF0b3IodGhpcy5nYW1lKTtcblxuICAgIC8vIEdyb3VwIGZvciBnYW1lIG9iamVjdHNcbiAgICB0aGlzLmdhbWUucGxheWZpZWxkID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgLy8gVUlcbiAgICB0aGlzLmdhbWUudWkgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgdGhpcy5nYW1lLnVpLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuXG4gICAgLy8gSW52ZW50b3J5XG4gICAgdmFyIGxhYmVsID0gdGhpcy5nYW1lLm1ha2UudGV4dCgxNzAwLCAyNSwgJ0lOVkVOVE9SWScsIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmY5OTAwJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgbGFiZWwuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZChsYWJlbCk7XG4gICAgdGhpcy5nYW1lLmludmVudG9yeXRleHQgPSB0aGlzLmdhbWUubWFrZS50ZXh0KDE3MDAsIDUwLCAnMCBjcnlzdGFscycsXG4gICAgICAgIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjY2NjMDAwJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgdGhpcy5nYW1lLmludmVudG9yeXRleHQuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZCh0aGlzLmdhbWUuaW52ZW50b3J5dGV4dCk7XG5cbiAgICAvL01pbmlNYXBcbiAgICB0aGlzLmdhbWUubWluaW1hcCA9IG5ldyBNaW5pTWFwKHRoaXMuZ2FtZSwgMzAwLCAzMDApO1xuICAgIHRoaXMuZ2FtZS51aS5hZGQodGhpcy5nYW1lLm1pbmltYXApO1xuICAgIHRoaXMuZ2FtZS54ID0gMTA7XG4gICAgdGhpcy5nYW1lLnkgPSAxMDtcblxuICAgIC8vIEhlbHBlcnNcbiAgICBmdW5jdGlvbiByYW5kb21Ob3JtYWwgKCkge1xuICAgICAgICB2YXIgdCA9IDA7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTw2OyBpKyspIHtcbiAgICAgICAgICAgIHQgKz0gcm5nLm5vcm1hbCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0LzY7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhd1N0YXIgKGN0eCwgeCwgeSwgZCwgY29sb3IpIHtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LWQrMSwgeS1kKzEpO1xuICAgICAgICBjdHgubGluZVRvKHgrZC0xLCB5K2QtMSk7XG4gICAgICAgIGN0eC5tb3ZlVG8oeC1kKzEsIHkrZC0xKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4K2QtMSwgeS1kKzEpO1xuICAgICAgICBjdHgubW92ZVRvKHgsIHktZCk7XG4gICAgICAgIGN0eC5saW5lVG8oeCwgeStkKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LWQsIHkpO1xuICAgICAgICBjdHgubGluZVRvKHgrZCwgeSk7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3U3RhckZpZWxkIChjdHgsIHNpemUsIG4pIHtcbiAgICAgICAgdmFyIHhtID0gTWF0aC5yb3VuZChzaXplLzIgKyByYW5kb21Ob3JtYWwoKSpzaXplLzQpO1xuICAgICAgICB2YXIgeW0gPSBNYXRoLnJvdW5kKHNpemUvMiArIHJhbmRvbU5vcm1hbCgpKnNpemUvNCk7XG4gICAgICAgIHZhciBxdWFkcyA9IFtbMCwwLHhtLTEseW0tMV0sIFt4bSwwLHNpemUtMSx5bS0xXSxcbiAgICAgICAgICAgIFswLHltLHhtLTEsc2l6ZS0xXSwgW3htLHltLHNpemUtMSxzaXplLTFdXTtcbiAgICAgICAgdmFyIGNvbG9yO1xuICAgICAgICB2YXIgaSwgaiwgbCwgcTtcblxuICAgICAgICBuID0gTWF0aC5yb3VuZChuLzQpO1xuICAgICAgICBmb3IgKGk9MCwgbD1xdWFkcy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgICAgICAgICBxID0gcXVhZHNbaV07XG4gICAgICAgICAgICBmb3IgKGo9MDsgajxuOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjb2xvciA9ICdoc2woNjAsMTAwJSwnICsgcm5nLmJldHdlZW4oOTAsOTkpICsgJyUpJztcbiAgICAgICAgICAgICAgICBkcmF3U3RhcihjdHgsXG4gICAgICAgICAgICAgICAgICAgIHJuZy5iZXR3ZWVuKHFbMF0rNywgcVsyXS03KSwgcm5nLmJldHdlZW4ocVsxXSs3LCBxWzNdLTcpLFxuICAgICAgICAgICAgICAgICAgICBybmcuYmV0d2VlbigyLDQpLCBjb2xvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn07XG5cblNwYWNlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gRklYTUU6IGp1c3QgYSBtZXNzIGZvciB0ZXN0aW5nXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzLnByb2Nlc3NRdWV1ZShmdW5jdGlvbiAoYSkge1xuICAgICAgICBpZiAoYS50eXBlID09PSAndXBfcHJlc3NlZCcpIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLmxvY2FsU3RhdGUudGhydXN0ID0gJ3N0YXJ0aW5nJztcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QucGxheSgpO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUudGhydXN0Z2VuZXJhdG9yLnN0YXJ0T24oc2VsZi5nYW1lLnBsYXllclNoaXApO1xuICAgICAgICB9IGVsc2UgaWYgKGEudHlwZSA9PT0gJ3VwX3JlbGVhc2VkJykge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnBsYXllclNoaXAubG9jYWxTdGF0ZS50aHJ1c3QgPSAnc2h1dGRvd24nO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUuc291bmRzLnBsYXllcnRocnVzdC5zdG9wKCk7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RvcE9uKHNlbGYuZ2FtZS5wbGF5ZXJTaGlwKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuU3BhY2UucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2NvbnNvbGUubG9nKCcrcmVuZGVyKycpO1xuICAgIC8vaWYgKHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUpIHtcbiAgICAvLyAgICB2YXIgZCA9IHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUucG9zaXRpb24ueCAtIHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUucHJldmlvdXNQb3NpdGlvbi54O1xuICAgIC8vICAgIGNvbnNvbGUubG9nKCdEZWx0YScsIGQsIHRoaXMuZ2FtZS50aW1lLmVsYXBzZWQsIGQgLyB0aGlzLmdhbWUudGltZS5lbGFwc2VkKTtcbiAgICAvL31cbiAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpO1xuICAgIHRoaXMuZ2FtZS5kZWJ1Zy50ZXh0KCdGcHM6ICcgKyB0aGlzLmdhbWUudGltZS5mcHMsIDUsIDIwKTtcbiAgICAvL3RoaXMuZ2FtZS5kZWJ1Zy5jYW1lcmFJbmZvKHRoaXMuZ2FtZS5jYW1lcmEsIDEwMCwgMjApO1xuICAgIC8vaWYgKHRoaXMuc2hpcCkge1xuICAgIC8vICAgIHRoaXMuZ2FtZS5kZWJ1Zy5zcHJpdGVJbmZvKHRoaXMuc2hpcCwgNDIwLCAyMCk7XG4gICAgLy99XG59O1xuXG5TcGFjZS5wcm90b3R5cGUuX3NldHVwTWVzc2FnZUhhbmRsZXJzID0gZnVuY3Rpb24gKHNvY2tldCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzb2NrZXQub24oJ21zZyBjcnlzdGFsIHBpY2t1cCcsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5jaGltZS5wbGF5KCk7XG4gICAgICAgIFRvYXN0LnNwaW5VcChzZWxmLmdhbWUsIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLngsIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLnksICcrJyArIHZhbCArICcgY3J5c3RhbHMhJyk7XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwYWNlO1xuIiwiLyoqXG4gKiBNaW5pTWFwLmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIE1pbmlNYXAgPSBmdW5jdGlvbiAoZ2FtZSwgd2lkdGgsIGhlaWdodCkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUpO1xuXG4gICAgdmFyIHhyID0gd2lkdGggLyB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlcldpZHRoO1xuICAgIHZhciB5ciA9IGhlaWdodCAvIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VySGVpZ2h0O1xuICAgIGlmICh4ciA8PSB5cikge1xuICAgICAgICB0aGlzLm1hcFNjYWxlID0geHI7XG4gICAgICAgIHRoaXMueE9mZnNldCA9IC14ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyTGVmdDtcbiAgICAgICAgdGhpcy55T2Zmc2V0ID0gLXhyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJUb3AgKyAoaGVpZ2h0IC0geHIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckhlaWdodCkgLyAyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubWFwU2NhbGUgPSB5cjtcbiAgICAgICAgdGhpcy55T2Zmc2V0ID0gLXlyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJUb3A7XG4gICAgICAgIHRoaXMueE9mZnNldCA9IC15ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyTGVmdCArICh3aWR0aCAtIHlyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJXaWR0aCkgLyAyO1xuICAgIH1cblxuICAgIHRoaXMuZ3JhcGhpY3MgPSBnYW1lLm1ha2UuZ3JhcGhpY3MoMCwgMCk7XG4gICAgdGhpcy5ncmFwaGljcy5iZWdpbkZpbGwoMHgwMGZmMDAsIDAuMik7XG4gICAgdGhpcy5ncmFwaGljcy5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB0aGlzLmdyYXBoaWNzLmVuZEZpbGwoKTtcbiAgICB0aGlzLmdyYXBoaWNzLmNhY2hlQXNCaXRtYXAgPSB0cnVlO1xuICAgIHRoaXMuYWRkKHRoaXMuZ3JhcGhpY3MpO1xufTtcblxuTWluaU1hcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuTWluaU1hcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNaW5pTWFwO1xuXG5NaW5pTWFwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy90aGlzLnRleHR1cmUucmVuZGVyWFkodGhpcy5ncmFwaGljcywgMCwgMCwgdHJ1ZSk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmdhbWUucGxheWZpZWxkLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgYm9keSA9IHRoaXMuZ2FtZS5wbGF5ZmllbGQuY2hpbGRyZW5baV07XG4gICAgICAgIGlmICghYm9keS5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBib2R5Lm1pbmlzcHJpdGUueCA9IHRoaXMud29ybGRUb01tWChib2R5LngpO1xuICAgICAgICBib2R5Lm1pbmlzcHJpdGUueSA9IHRoaXMud29ybGRUb01tWShib2R5LnkpO1xuICAgICAgICBib2R5Lm1pbmlzcHJpdGUuYW5nbGUgPSBib2R5LmFuZ2xlO1xuICAgIC8vICAgIHZhciB4ID0gMTAwICsgYm9keS54IC8gNDA7XG4gICAgLy8gICAgdmFyIHkgPSAxMDAgKyBib2R5LnkgLyA0MDtcbiAgICAvLyAgICB0aGlzLnRleHR1cmUucmVuZGVyWFkoYm9keS5ncmFwaGljcywgeCwgeSwgZmFsc2UpO1xuICAgIH1cbn07XG5cbk1pbmlNYXAucHJvdG90eXBlLndvcmxkVG9NbVggPSBmdW5jdGlvbiAoeCkge1xuICAgIHJldHVybiB4ICogdGhpcy5tYXBTY2FsZSArIHRoaXMueE9mZnNldDtcbn07XG5cbk1pbmlNYXAucHJvdG90eXBlLndvcmxkVG9NbVkgPSBmdW5jdGlvbiAoeSkge1xuICAgIHJldHVybiB5ICogdGhpcy5tYXBTY2FsZSArIHRoaXMueU9mZnNldDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWluaU1hcDsiXX0=
