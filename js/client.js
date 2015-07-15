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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL0Jsb2NrbHlDdXN0b20uanMiLCJzcmMvU3RhcmNvZGVyLWNsaWVudC5qcyIsInNyYy9TdGFyY29kZXIuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvQ29kZUVuZHBvaW50Q2xpZW50LmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL0RPTUludGVyZmFjZS5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9Xb3JsZEFwaS5qcyIsInNyYy9jbGllbnQuanMiLCJzcmMvY29tbW9uL1BhdGhzLmpzIiwic3JjL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzIiwic3JjL3BoYXNlcmJvZGllcy9Bc3Rlcm9pZC5qcyIsInNyYy9waGFzZXJib2RpZXMvQnVsbGV0LmpzIiwic3JjL3BoYXNlcmJvZGllcy9DcnlzdGFsLmpzIiwic3JjL3BoYXNlcmJvZGllcy9HZW5lcmljT3JiLmpzIiwic3JjL3BoYXNlcmJvZGllcy9QbGFuZXRvaWQuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1NoaXAuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1NpbXBsZVBhcnRpY2xlLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TeW5jQm9keUludGVyZmFjZS5qcyIsInNyYy9waGFzZXJib2RpZXMvVGhydXN0R2VuZXJhdG9yLmpzIiwic3JjL3BoYXNlcmJvZGllcy9Ub2FzdC5qcyIsInNyYy9waGFzZXJib2RpZXMvVHJlZS5qcyIsInNyYy9waGFzZXJib2RpZXMvVmVjdG9yU3ByaXRlLmpzIiwic3JjL3BoYXNlcnBsdWdpbnMvQ29udHJvbHMuanMiLCJzcmMvcGhhc2VycGx1Z2lucy9TeW5jQ2xpZW50LmpzIiwic3JjL3BoYXNlcnN0YXRlcy9Cb290LmpzIiwic3JjL3BoYXNlcnN0YXRlcy9TcGFjZS5qcyIsInNyYy9waGFzZXJ1aS9NaW5pTWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8qKlxuICogQmxvY2tseUN1c3RvbS5qc1xuICpcbiAqIERlZmluaXRpb25zIGFuZCBjb2RlIGdlbmVyYXRpb24gZm9yIFN0YXJDb2RlciBvcmllbnRlZCBibG9ja3NcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFNldCBzY2FsZSBvZiBwbGF5ZXIgc2hpcFxuICogQHR5cGUge3tpbml0OiBGdW5jdGlvbn19XG4gKi9cbkJsb2NrbHkuQmxvY2tzWydzY19zZXRfc2NhbGUnXSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0Q29sb3VyKDE2MCk7XG4gICAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgICAgLnNldENoZWNrKCdOdW1iZXInKVxuICAgICAgICAgICAgLmFwcGVuZEZpZWxkKCdzZXQgc2hpcCBzY2FsZScpO1xuICAgICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBDb2RlIGdlbmVyYXRpb24gZm9yIHNldF9zY2FsZVxuICpcbiAqIEBwYXJhbSBibG9ja1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuQmxvY2tseS5KYXZhU2NyaXB0WydzY19zZXRfc2NhbGUnXSA9IGZ1bmN0aW9uIChibG9jaykge1xuICAgIHZhciBhcmcgPSBibG9jay5nZXRGaWVsZFZhbHVlKCdWQUxVRScpO1xuICAgIHJldHVybiAnc2V0U2NhbGUoJyArIGFyZyArICcpJztcbn07XG5cbi8qKlxuICogQmxvY2sgcmVwcmVzZW50aW5nIGFuIG9yZGVyZWQgcGFpciBvZiBjb29yZGluYXRlc1xuICovXG5CbG9ja2x5LkJsb2Nrc1snc2NfcGFpciddID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAgIC5hcHBlbmRGaWVsZCgnKCcpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQobmV3IEJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzAnLCBCbG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdYJylcbiAgICAgICAgICAgIC5hcHBlbmRGaWVsZCgnLCcpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQobmV3IEJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzAnLCBCbG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdZJylcbiAgICAgICAgICAgIC5hcHBlbmRGaWVsZCgnKScpO1xuICAgICAgICB0aGlzLnNldENvbG91cigxNjApO1xuICAgICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSwgJ1BhaXInKTtcbiAgICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCAnUGFpcicpO1xuICAgIH1cbn07XG5cbi8qKlxuICogQ29kZSBnZW5lcmF0aW9uIGZvciBwYWlyIGlzIGEgTk9PUCBiYyBpdCBoYXMgbm8gbWVhbmluZyBvdXRzaWRlIG9mIGEgY29udGFpbmVyXG4gKi9cbkJsb2NrbHkuSmF2YVNjcmlwdFsnc2NfcGFpciddID0gZnVuY3Rpb24gKGJsb2NrKSB7XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIEJsb2NrIHJlcHJlc2VudGluZyBhIHNldCBvZiBvcmRlcmVkIHBhaXJzIHRvIGJlIHVzZWQgYXMgdGhlIHBsYXllcidzIHNoYXBlXG4gKi9cbkJsb2NrbHkuQmxvY2tzWydzY19jaGFuZ2Vfc2hhcGUnXSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0Q29sb3VyKDMwMCk7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQoJ3BsYXllciBzaGFwZScpO1xuICAgICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdQQUlSUycpXG4gICAgICAgICAgICAuc2V0Q2hlY2soJ1BhaXInKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlIGNvZGUgZm9yIG9yZGVyZWQgcGFpciBibG9ja3NcbiAqIEJ5cGFzcyBub3JtYWwgQmxvY2tseSBjb2RlIGdlbmVyYXRpb24gbWV0aG9kcyBiYyBvdXIgcGFpciB2YWx1ZXMgYXJlXG4gKiAnc3RhdGVtZW50cycgaW4gQmxvY2tseS1zcGVha1xuICovXG5CbG9ja2x5LkphdmFTY3JpcHRbJ3NjX2NoYW5nZV9zaGFwZSddID0gZnVuY3Rpb24gKGJsb2NrKSB7XG4gICAgdmFyIHgsIHk7XG4gICAgdmFyIHBhaXJMaXN0ID0gW107XG4gICAgdmFyIHBhaXJCbG9jayA9IGJsb2NrLmdldElucHV0VGFyZ2V0QmxvY2soJ1BBSVJTJyk7XG4gICAgd2hpbGUgKHBhaXJCbG9jaykge1xuICAgICAgICBpZiAocGFpckJsb2NrLnR5cGUgPT09ICdzY19wYWlyJykge1xuICAgICAgICAgICAgeCA9IHBhaXJCbG9jay5nZXRGaWVsZFZhbHVlKCdYJyk7XG4gICAgICAgICAgICB5ID0gcGFpckJsb2NrLmdldEZpZWxkVmFsdWUoJ1knKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHggPSBCbG9ja2x5LkphdmFTY3JpcHQudmFsdWVUb0NvZGUocGFpckJsb2NrLCAnWCcsIEJsb2NrbHkuSmF2YVNjcmlwdC5PUkRFUl9DT01NQSkgfHwgJzAnO1xuICAgICAgICAgICAgeSA9IEJsb2NrbHkuSmF2YVNjcmlwdC52YWx1ZVRvQ29kZShwYWlyQmxvY2ssICdZJywgQmxvY2tseS5KYXZhU2NyaXB0Lk9SREVSX0NPTU1BKSB8fCAnMCc7XG4gICAgICAgIH1cbiAgICAgICAgcGFpckxpc3QucHVzaCgnWycgKyB4ICsgJywnICsgeSArICddJyk7XG4gICAgICAgIHBhaXJCbG9jayA9IHBhaXJCbG9jay5uZXh0Q29ubmVjdGlvbiAmJiBwYWlyQmxvY2submV4dENvbm5lY3Rpb24udGFyZ2V0QmxvY2soKTtcbiAgICB9XG4gICAgaWYgKHBhaXJMaXN0Lmxlbmd0aCA+IDIpIHtcbiAgICAgICAgLy8gRG9uJ3QgZ2VuZXJhdGUgY29kZSBmb3IgZmV3ZXIgdGhhbiAzIHBvaW50c1xuICAgICAgICByZXR1cm4gJ2NoYW5nZVNoYXBlKFsnICsgcGFpckxpc3Quam9pbignLCcpICsgJ10pJztcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIHNldCBzaGlwIHRocnVzdCBwb3dlclxuICogQHR5cGUge3tpbml0OiBGdW5jdGlvbn19XG4gKi9cbkJsb2NrbHkuQmxvY2tzWydzY19zZXRfdGhydXN0X3Bvd2VyJ10gPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldENvbG91cigxNjApO1xuICAgICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAgIC5zZXRDaGVjaygnTnVtYmVyJylcbiAgICAgICAgICAgIC5hcHBlbmRGaWVsZCgnc2V0IHNoaXAgdGhydXN0IGZvcmNlJyk7XG4gICAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIENvZGUgZ2VuZXJhdGlvbiBmb3Igc2V0X3RocnVzdF9wb3dlclxuICpcbiAqIEBwYXJhbSBibG9ja1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuQmxvY2tseS5KYXZhU2NyaXB0WydzY19zZXRfdGhydXN0X3Bvd2VyJ10gPSBmdW5jdGlvbiAoYmxvY2spIHtcbiAgICB2YXIgYXJnID0gYmxvY2suZ2V0RmllbGRWYWx1ZSgnVkFMVUUnKTtcbiAgICByZXR1cm4gJ3NldFRocnVzdEZvcmNlKCcgKyBhcmcgKyAnKSc7XG59O1xuXG4vKipcbiAqIGNyZWF0ZSBuZXcgcGxhbmV0XG4gKi9cbkJsb2NrbHkuQmxvY2tzWydzY19uZXdfcGxhbmV0J10gPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldENvbG91cigxMjApO1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgICAgLmFwcGVuZEZpZWxkKCduZXcgcGxhbmV0Jyk7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQoJ3gnKVxuICAgICAgICAgICAgLmFwcGVuZEZpZWxkKG5ldyBCbG9ja2x5LkZpZWxkVGV4dElucHV0KCcwJywgQmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnWCcpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQoJ3knKVxuICAgICAgICAgICAgLmFwcGVuZEZpZWxkKG5ldyBCbG9ja2x5LkZpZWxkVGV4dElucHV0KCcwJywgQmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnWScpO1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgICAgLmFwcGVuZEZpZWxkKCdzY2FsZScpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQobmV3IEJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzInLCBCbG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdTQ0FMRScpO1xuICAgICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBjb2RlIGdlbmVyYXRpb24gZm9yIG5ldyBwbGFuZXRcbiAqL1xuQmxvY2tseS5KYXZhU2NyaXB0WydzY19uZXdfcGxhbmV0J10gPSBmdW5jdGlvbiAoYmxvY2spIHtcbiAgICB2YXIgeCA9IGJsb2NrLmdldEZpZWxkVmFsdWUoJ1gnKTtcbiAgICB2YXIgeSA9IGJsb2NrLmdldEZpZWxkVmFsdWUoJ1knKTtcbiAgICB2YXIgc2NhbGUgPSBibG9jay5nZXRGaWVsZFZhbHVlKCdTQ0FMRScpO1xuICAgIHJldHVybiAnbmV3UGxhbmV0KCcgKyB4ICsgJywnICsgeSArICcsJyArIHNjYWxlICsgJyknO1xufTtcblxuLyoqXG4gKiBzZXQgc2hpcCBjb2xvclxuICovXG5CbG9ja2x5LkJsb2Nrc1snc2Nfc2V0X2NvbG9yJ10gPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldENvbG91cigzMCk7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgICAuYXBwZW5kRmllbGQoJ3NoaXAgY29sb3InKVxuICAgICAgICAgICAgLmFwcGVuZEZpZWxkKG5ldyBCbG9ja2x5LkZpZWxkQ29sb3VyKCcjZmYwMDAwJyksICdDT0xPUicpO1xuICAgICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBjb2RlIGdlbmVyYXRpb24gZm9yIHNldCBjb2xvclxuICovXG5CbG9ja2x5LkphdmFTY3JpcHRbJ3NjX3NldF9jb2xvciddID0gZnVuY3Rpb24gKGJsb2NrKSB7XG4gICAgdmFyIGNvbG9yID0gYmxvY2suZ2V0RmllbGRWYWx1ZSgnQ09MT1InKTtcbiAgICByZXR1cm4gJ2NoYW5nZUNvbG9yKFxcJycgKyBjb2xvciArICdcXCcpJztcbn07IiwiLyoqXG4gKiBTdGFyY29kZXItY2xpZW50LmpzXG4gKlxuICogU3RhcmNvZGVyIG1hc3RlciBvYmplY3QgZXh0ZW5kZWQgd2l0aCBjbGllbnQgb25seSBwcm9wZXJ0aWVzIGFuZCBtZXRob2RzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBXb3JsZEFwaSA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvV29ybGRBcGkuanMnKTtcbnZhciBET01JbnRlcmZhY2UgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL0RPTUludGVyZmFjZS5qcycpO1xudmFyIENvZGVFbmRwb2ludENsaWVudCA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvQ29kZUVuZHBvaW50Q2xpZW50LmpzJyk7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTdGFyY29kZXIucHJvdG90eXBlLCBXb3JsZEFwaS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJjb2Rlci5wcm90b3R5cGUsIERPTUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJjb2Rlci5wcm90b3R5cGUsIENvZGVFbmRwb2ludENsaWVudC5wcm90b3R5cGUpO1xuXG52YXIgc3RhdGVzID0ge1xuICAgIGJvb3Q6IHJlcXVpcmUoJy4vcGhhc2Vyc3RhdGVzL0Jvb3QuanMnKSxcbiAgICBzcGFjZTogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvU3BhY2UuanMnKVxufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW8gPSBpbztcbiAgICB0aGlzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoMTgwMCwgOTUwLCBQaGFzZXIuQVVUTywgJ21haW4nKTtcbiAgICAvL3RoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSgxODAwLCA5NTAsIFBoYXNlci5DQU5WQVMsICdtYWluJyk7XG4gICAgdGhpcy5nYW1lLmZvcmNlU2luZ2xlVXBkYXRlID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUuc3RhcmNvZGVyID0gdGhpcztcbiAgICBmb3IgKHZhciBrIGluIHN0YXRlcykge1xuICAgICAgICB2YXIgc3RhdGUgPSBuZXcgc3RhdGVzW2tdKCk7XG4gICAgICAgIHN0YXRlLnN0YXJjb2RlciA9IHRoaXM7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoaywgc3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLmNtZFF1ZXVlID0gW107XG4gICAgdGhpcy5pbml0RE9NSW50ZXJmYWNlKCk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnYm9vdCcpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5hdHRhY2hQbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBsdWdpbiA9IHRoaXMuZ2FtZS5wbHVnaW5zLmFkZC5hcHBseSh0aGlzLmdhbWUucGx1Z2lucywgYXJndW1lbnRzKTtcbiAgICBwbHVnaW4uc3RhcmNvZGVyID0gdGhpcztcbiAgICBwbHVnaW4ubG9nID0gdGhpcy5sb2c7XG4gICAgcmV0dXJuIHBsdWdpbjtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUucm9sZSA9ICdDbGllbnQnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJjb2RlcjtcbiIsIi8qKlxuICogU3RhcmNvZGVyLmpzXG4gKlxuICogU2V0IHVwIGdsb2JhbCBTdGFyY29kZXIgbmFtZXNwYWNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0ge1xuLy8gICAgY29uZmlnOiB7XG4vLyAgICAgICAgd29ybGRCb3VuZHM6IFstNDIwMCwgLTQyMDAsIDg0MDAsIDg0MDBdXG4vL1xuLy8gICAgfSxcbi8vICAgIFN0YXRlczoge31cbi8vfTtcblxudmFyIGNvbmZpZyA9IHtcbiAgICB2ZXJzaW9uOiAnMC4xJyxcbiAgICBzZXJ2ZXJVcmk6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09ICdkZXZlbG9wbWVudCcgPyAnaHR0cDovL2xvY2FsaG9zdDo4MDgxJyA6ICdodHRwOi8vNTIuMy42MS4xMDInLFxuICAgIC8vd29ybGRCb3VuZHM6IFstNDIwMCwgLTQyMDAsIDg0MDAsIDg0MDBdLFxuICAgIHdvcmxkQm91bmRzOiBbLTIwMCwgLTIwMCwgMjAwLCAyMDBdLFxuICAgIGlvQ2xpZW50T3B0aW9uczoge1xuICAgICAgICAvL2ZvcmNlTmV3OiB0cnVlXG4gICAgICAgIHJlY29ubmVjdGlvbjogZmFsc2VcbiAgICB9LFxuICAgIHVwZGF0ZUludGVydmFsOiA1MCxcbiAgICByZW5kZXJMYXRlbmN5OiAxMDAsXG4gICAgcGh5c2ljc1NjYWxlOiAyMCxcbiAgICBmcmFtZVJhdGU6ICgxIC8gNjApLFxuICAgIHRpbWVTeW5jRnJlcTogMTAsXG4gICAgcGh5c2ljc1Byb3BlcnRpZXM6IHtcbiAgICAgICAgU2hpcDoge1xuICAgICAgICAgICAgbWFzczogMTBcbiAgICAgICAgfSxcbiAgICAgICAgQXN0ZXJvaWQ6IHtcbiAgICAgICAgICAgIG1hc3M6IDIwXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGluaXRpYWxCb2RpZXM6IFtcbiAgICAgICAge3R5cGU6ICdBc3Rlcm9pZCcsIG51bWJlcjogMjUsIGNvbmZpZzoge1xuICAgICAgICAgICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCd9LFxuICAgICAgICAgICAgdmVsb2NpdHk6IHtyYW5kb206ICd2ZWN0b3InLCBsbzogLTEwLCBoaTogMTB9LFxuICAgICAgICAgICAgYW5ndWxhclZlbG9jaXR5OiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogLTUsIGhpOiA1fSxcbiAgICAgICAgICAgIHZlY3RvclNjYWxlOiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogMC42LCBoaTogMS40fSxcbiAgICAgICAgICAgIG1hc3M6IDEwXG4gICAgICAgIH19LFxuICAgICAgICAvL3t0eXBlOiAnQ3J5c3RhbCcsIG51bWJlcjogMTAsIGNvbmZpZzoge1xuICAgICAgICAvLyAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJ30sXG4gICAgICAgIC8vICAgIHZlbG9jaXR5OiB7cmFuZG9tOiAndmVjdG9yJywgbG86IC00LCBoaTogNCwgbm9ybWFsOiB0cnVlfSxcbiAgICAgICAgLy8gICAgdmVjdG9yU2NhbGU6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAwLjQsIGhpOiAwLjh9LFxuICAgICAgICAvLyAgICBtYXNzOiA1XG4gICAgICAgIC8vfX1cbiAgICAgICAge3R5cGU6ICdIeWRyYScsIG51bWJlcjogMSwgY29uZmlnOiB7XG4gICAgICAgICAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJywgcGFkOiA1MH1cbiAgICAgICAgfX0sXG4gICAgICAgIHt0eXBlOiAnUGxhbmV0b2lkJywgbnVtYmVyOiA2LCBjb25maWc6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDMwfSxcbiAgICAgICAgICAgIGFuZ3VsYXJWZWxvY2l0eToge3JhbmRvbTogJ2Zsb2F0JywgbG86IC0yLCBoaTogMn0sXG4gICAgICAgICAgICB2ZWN0b3JTY2FsZTogMi41LFxuICAgICAgICAgICAgbWFzczogMTAwXG4gICAgICAgIH19LFxuICAgICAgICAvLyBGSVhNRTogVHJlZXMganVzdCBmb3IgdGVzdGluZ1xuICAgICAgICAvL3t0eXBlOiAnVHJlZScsIG51bWJlcjogMTAsIGNvbmZpZzoge1xuICAgICAgICAvLyAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJywgcGFkOiAzMH0sXG4gICAgICAgIC8vICAgIHZlY3RvclNjYWxlOiAxLFxuICAgICAgICAvLyAgICBtYXNzOiA1XG4gICAgICAgIC8vfX1cbiAgICBdXG59O1xuXG52YXIgU3RhcmNvZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIC8vIEluaXRpYWxpemVycyB2aXJ0dWFsaXplZCBhY2NvcmRpbmcgdG8gcm9sZVxuICAgIHRoaXMuYmFubmVyKCk7XG4gICAgdGhpcy5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgLy90aGlzLmluaXROZXQuY2FsbCh0aGlzKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuZXh0ZW5kQ29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIGZvciAodmFyIGsgaW4gY29uZmlnKSB7XG4gICAgICAgIGlmIChjb25maWcuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnW2tdID0gY29uZmlnW2tdO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGNvbW1vbiBjb25maWcgb3B0aW9uc1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3dvcmxkV2lkdGgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1syXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzBdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlcldpZHRoJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogKHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzJdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF0pO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3dvcmxkSGVpZ2h0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcud29ybGRCb3VuZHNbM10gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1sxXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJIZWlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiAodGhpcy5jb25maWcud29ybGRCb3VuZHNbM10gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1sxXSk7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyTGVmdCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzBdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlclRvcCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlclJpZ2h0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMl07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyQm90dG9tJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbM107XG4gICAgfVxufSk7XG5cbi8qKlxuICogQWRkIG1peGluIHByb3BlcnRpZXMgdG8gdGFyZ2V0LiBBZGFwdGVkIChzbGlnaHRseSkgZnJvbSBQaGFzZXJcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0XG4gKiBAcGFyYW0ge29iamVjdH0gbWl4aW5cbiAqL1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlID0gZnVuY3Rpb24gKHRhcmdldCwgbWl4aW4pIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG1peGluKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgIHZhciB2YWwgPSBtaXhpbltrZXldO1xuICAgICAgICBpZiAodmFsICYmXG4gICAgICAgICAgICAodHlwZW9mIHZhbC5nZXQgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHZhbC5zZXQgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHZhbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHZhbDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuYmFubmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubG9nKCdTdGFyY29kZXInLCB0aGlzLnJvbGUsICd2JyArIHRoaXMuY29uZmlnLnZlcnNpb24sICdzdGFydGVkIGF0JywgRGF0ZSgpKTtcbn1cblxuLyoqXG4gKiBDdXN0b20gbG9nZ2luZyBmdW5jdGlvbiB0byBiZSBmZWF0dXJlZmllZCBhcyBuZWNlc3NhcnlcbiAqL1xuU3RhcmNvZGVyLnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJjb2RlcjtcbiIsIi8qKlxuICogQ29kZUVuZHBvaW50Q2xpZW50LmpzXG4gKlxuICogTWV0aG9kcyBmb3Igc2VuZGluZyBjb2RlIHRvIHNlcnZlciBhbmQgZGVhbGluZyB3aXRoIGNvZGUgcmVsYXRlZCByZXNwb25zZXNcbiAqL1xuXG52YXIgQ29kZUVuZHBvaW50Q2xpZW50ID0gZnVuY3Rpb24gKCkge307XG5cbkNvZGVFbmRwb2ludENsaWVudC5wcm90b3R5cGUuc2VuZENvZGUgPSBmdW5jdGlvbiAoY29kZSkge1xuICAgIHRoaXMuc29ja2V0LmVtaXQoJ2NvZGUnLCBjb2RlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29kZUVuZHBvaW50Q2xpZW50OyIsIi8qKlxuICogRE9NSW50ZXJmYWNlLmpzXG4gKlxuICogSGFuZGxlIERPTSBjb25maWd1cmF0aW9uL2ludGVyYWN0aW9uLCBpLmUuIG5vbi1QaGFzZXIgc3R1ZmZcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgRE9NSW50ZXJmYWNlID0gZnVuY3Rpb24gKCkge307XG5cbkRPTUludGVyZmFjZS5wcm90b3R5cGUuaW5pdERPTUludGVyZmFjZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5kb20gPSB7fTsgICAgICAgICAgICAgIC8vIG5hbWVzcGFjZVxuICAgIHRoaXMuZG9tLmNvZGVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29kZS1idG4nKTtcbiAgICB0aGlzLmRvbS5jb2RlUG9wdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29kZS1wb3B1cCcpO1xuICAgIHRoaXMuZG9tLmNvZGVTZW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGUtc2VuZCcpO1xuICAgIHRoaXMuZG9tLmJsb2NrbHlXb3Jrc3BhY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmxvY2tseS13b3Jrc3BhY2UnKTtcbiAgICAvL3RoaXMuZG9tLmNvZGVUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGUtdGV4dCcpO1xuXG4gICAgLy90aGlzLmRvbS5jb2RlVGV4dC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgICBzZWxmLmdhbWUuaW5wdXQuZW5hYmxlZCA9IGZhbHNlO1xuICAgIC8vfSk7XG4gICAgLy9cbiAgICAvL3RoaXMuZG9tLmNvZGVUZXh0LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgc2VsZi5nYW1lLmlucHV0LmVuYWJsZWQgPSB0cnVlO1xuICAgIC8vfSk7XG5cbiAgICB0aGlzLmRvbS5jb2RlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnRvZ2dsZShzZWxmLmRvbS5jb2RlUG9wdXApO1xuICAgICAgICBCbG9ja2x5LmZpcmVVaUV2ZW50KHNlbGYuZG9tLmJsb2NrbHlXb3Jrc3BhY2UsICdyZXNpemUnKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZG9tLmNvZGVTZW5kLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAvL3NlbGYuc2VuZENvZGUoc2VsZi5kb20uY29kZVRleHQudmFsdWUpO1xuICAgICAgICBjb25zb2xlLmxvZyhCbG9ja2x5LkphdmFTY3JpcHQud29ya3NwYWNlVG9Db2RlKHNlbGYuYmxvY2tseVdvcmtzcGFjZSkpO1xuICAgICAgICBzZWxmLnNlbmRDb2RlKEJsb2NrbHkuSmF2YVNjcmlwdC53b3Jrc3BhY2VUb0NvZGUoc2VsZi5ibG9ja2x5V29ya3NwYWNlKSk7XG4gICAgfSk7XG5cbiAgICAvLyBJbml0aWFsaXplIGJsb2NrbHlcbiAgICB0aGlzLmJsb2NrbHlXb3Jrc3BhY2UgPSBCbG9ja2x5LmluamVjdCgnYmxvY2tseS13b3Jrc3BhY2UnLFxuICAgICAgICB7dG9vbGJveDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rvb2xib3gnKX0pO1xuICAgIGNvbnNvbGUubG9nKCdiZCcsIHRoaXMuYmxvY2tseVdvcmtzcGFjZSk7XG5cbiAgICB0aGlzLnRvZ2dsZSh0aGlzLmRvbS5jb2RlUG9wdXAsIGZhbHNlKTtcblxufTtcblxuLyoqXG4gKiBTZXQvdG9nZ2xlIHZpc2liaWxpdHkgb2YgZWxlbWVudFxuICpcbiAqIEBwYXJhbSBlbCB7b2JqZWN0fSAtIGVsZW1lbnQgdG8gc2V0XG4gKiBAcGFyYW0gc3RhdGUgez9ib29sZWFufSAtIHNob3cgKHRydWUpLCBoaWRlIChmYWxzZSksIHRvZ2dsZSAodW5kZWZpbmVkKVxuICovXG5ET01JbnRlcmZhY2UucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChlbCwgc3RhdGUpIHtcbiAgICB2YXIgZGlzcGxheSA9IGVsLnN0eWxlLmRpc3BsYXk7XG4gICAgaWYgKCFlbC5vcmlnRGlzcGxheSkge1xuICAgICAgICBpZiAoZGlzcGxheSAhPT0gJ25vbmUnKSB7XG4gICAgICAgICAgICBlbC5vcmlnRGlzcGxheSA9IGRpc3BsYXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbC5vcmlnRGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc3RhdGUgPSAoZGlzcGxheSA9PT0gJ25vbmUnKTtcbiAgICB9XG4gICAgaWYgKHN0YXRlKSB7XG4gICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSBlbC5vcmlnRGlzcGxheTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBET01JbnRlcmZhY2U7XG4iLCIvKipcbiAqIFdvcmxkQXBpLmpzXG4gKlxuICogQWRkL3JlbW92ZS9tYW5pcHVsYXRlIGJvZGllcyBpbiBjbGllbnQncyBwaHlzaWNzIHdvcmxkXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFdvcmxkQXBpID0gZnVuY3Rpb24gKCkge307XG5cbnZhciBib2R5VHlwZXMgPSB7XG4gICAgU2hpcDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1NoaXAuanMnKSxcbiAgICBBc3Rlcm9pZDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0FzdGVyb2lkLmpzJyksXG4gICAgQ3J5c3RhbDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0NyeXN0YWwuanMnKSxcbiAgICBCdWxsZXQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9CdWxsZXQuanMnKSxcbiAgICBHZW5lcmljT3JiOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvR2VuZXJpY09yYi5qcycpLFxuICAgIFBsYW5ldG9pZDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1BsYW5ldG9pZC5qcycpLFxuICAgIFRyZWU6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9UcmVlLmpzJylcbn07XG5cbi8qKlxuICogQWRkIGJvZHkgdG8gd29ybGQgb24gY2xpZW50IHNpZGVcbiAqXG4gKiBAcGFyYW0gdHlwZSB7c3RyaW5nfSAtIHR5cGUgbmFtZSBvZiBvYmplY3QgdG8gYWRkXG4gKiBAcGFyYW0gY29uZmlnIHtvYmplY3R9IC0gcHJvcGVydGllcyBmb3IgbmV3IG9iamVjdFxuICogQHJldHVybnMge1BoYXNlci5TcHJpdGV9IC0gbmV3bHkgYWRkZWQgb2JqZWN0XG4gKi9cblxuV29ybGRBcGkucHJvdG90eXBlLmFkZEJvZHkgPSBmdW5jdGlvbiAodHlwZSwgY29uZmlnKSB7XG4gICAgdmFyIGN0b3IgPSBib2R5VHlwZXNbdHlwZV07XG4gICAgdmFyIHBsYXllclNoaXAgPSBmYWxzZTtcbiAgICBpZiAoIWN0b3IpIHtcbiAgICAgICAgdGhpcy5sb2coJ1Vua25vd24gYm9keSB0eXBlOicsIHR5cGUpO1xuICAgICAgICB0aGlzLmxvZyhjb25maWcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0eXBlID09PSAnU2hpcCcgJiYgY29uZmlnLnByb3BlcnRpZXMucGxheWVyaWQgPT09IHRoaXMucGxheWVyLmlkKSB7XG4gICAgICAgIGNvbmZpZy50YWcgPSB0aGlzLnBsYXllci51c2VybmFtZTtcbiAgICAgICAgLy8gT25seSB0aGUgcGxheWVyJ3Mgb3duIHNoaXAgaXMgdHJlYXRlZCBhcyBkeW5hbWljIGluIHRoZSBsb2NhbCBwaHlzaWNzIHNpbVxuICAgICAgICBjb25maWcubWFzcyA9IHRoaXMuY29uZmlnLnBoeXNpY3NQcm9wZXJ0aWVzLlNoaXAubWFzcztcbiAgICAgICAgcGxheWVyU2hpcCA9IHRydWU7XG4gICAgfVxuICAgIHZhciBib2R5ID0gbmV3IGN0b3IodGhpcy5nYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5nYW1lLmFkZC5leGlzdGluZyhib2R5KTtcbiAgICB0aGlzLmdhbWUucGxheWZpZWxkLmFkZChib2R5KTtcbiAgICBpZiAocGxheWVyU2hpcCkge1xuICAgICAgICB0aGlzLmdhbWUuY2FtZXJhLmZvbGxvdyhib2R5KTtcbiAgICAgICAgdGhpcy5nYW1lLnBsYXllclNoaXAgPSBib2R5O1xuICAgIH1cbiAgICByZXR1cm4gYm9keTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGJvZHkgZnJvbSBnYW1lIHdvcmxkXG4gKlxuICogQHBhcmFtIHNwcml0ZSB7UGhhc2VyLlNwcml0ZX0gLSBvYmplY3QgdG8gcmVtb3ZlXG4gKi9cbldvcmxkQXBpLnByb3RvdHlwZS5yZW1vdmVCb2R5ID0gZnVuY3Rpb24gKHNwcml0ZSkge1xuICAgIHNwcml0ZS5raWxsKCk7XG4gICAgLy8gUmVtb3ZlIG1pbmlzcHJpdGVcbiAgICBpZiAoc3ByaXRlLm1pbmlzcHJpdGUpIHtcbiAgICAgICAgc3ByaXRlLm1pbmlzcHJpdGUua2lsbCgpO1xuICAgIH1cbiAgICB0aGlzLmdhbWUucGh5c2ljcy5wMi5yZW1vdmVCb2R5KHNwcml0ZS5ib2R5KTtcbn07XG5cbi8qKlxuICogQ29uZmlndXJlIG9iamVjdCB3aXRoIGdpdmVuIHByb3BlcnRpZXNcbiAqXG4gKiBAcGFyYW0gcHJvcGVydGllcyB7b2JqZWN0fVxuICovXG4vL1dvcmxkQXBpLnByb3RvdHlwZS5jb25maWd1cmUgPSBmdW5jdGlvbiAocHJvcGVydGllcykge1xuLy8gICAgZm9yICh2YXIgayBpbiB0aGlzLnVwZGF0ZVByb3BlcnRpZXMpIHtcbi8vICAgICAgICB0aGlzW2tdID0gcHJvcGVydGllc1trXTtcbi8vICAgIH1cbi8vfTtcblxubW9kdWxlLmV4cG9ydHMgPSBXb3JsZEFwaTtcbiIsIi8qKiBjbGllbnQuanNcbiAqXG4gKiBNYWluIGVudHJ5IHBvaW50IGZvciBTdGFyY29kZXIgZ2FtZSBjbGllbnRcbiAqXG4gKiBAdHlwZSB7U3RhcmNvZGVyfGV4cG9ydHN9XG4gKi9cblxucmVxdWlyZSgnLi9CbG9ja2x5Q3VzdG9tLmpzJyk7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxuXG5sb2NhbFN0b3JhZ2UuZGVidWcgPSAnJzsgICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2VkIHRvIHRvZ2dsZSBzb2NrZXQuaW8gZGVidWdnaW5nXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHN0YXJjb2RlciA9IG5ldyBTdGFyY29kZXIoKTtcbiAgICBzdGFyY29kZXIuc3RhcnQoKTtcbn0pO1xuIiwiLyoqXG4gKiBQYXRoLmpzXG4gKlxuICogVmVjdG9yIHBhdGhzIHNoYXJlZCBieSBtdWx0aXBsZSBlbGVtZW50c1xuICovXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMub2N0YWdvbiA9IFtcbiAgICBbMiwxXSxcbiAgICBbMSwyXSxcbiAgICBbLTEsMl0sXG4gICAgWy0yLDFdLFxuICAgIFstMiwtMV0sXG4gICAgWy0xLC0yXSxcbiAgICBbMSwtMl0sXG4gICAgWzIsLTFdXG5dO1xuXG5leHBvcnRzLmQyY3Jvc3MgPSBbXG4gICAgWy0xLC0yXSxcbiAgICBbLTEsMl0sXG4gICAgWzIsLTFdLFxuICAgIFstMiwtMV0sXG4gICAgWzEsMl0sXG4gICAgWzEsLTJdLFxuICAgIFstMiwxXSxcbiAgICBbMiwxXVxuXTtcblxuZXhwb3J0cy5zcXVhcmUwID0gW1xuICAgIFstMSwtMl0sXG4gICAgWzIsLTFdLFxuICAgIFsxLDJdLFxuICAgIFstMiwxXVxuXTtcblxuZXhwb3J0cy5zcXVhcmUxID0gW1xuICAgIFsxLC0yXSxcbiAgICBbMiwxXSxcbiAgICBbLTEsMl0sXG4gICAgWy0yLC0xXVxuXTtcblxuZXhwb3J0cy5PQ1RSQURJVVMgPSBNYXRoLnNxcnQoNSk7IiwiLyoqXG4gKiBVcGRhdGVQcm9wZXJ0aWVzLmpzXG4gKlxuICogQ2xpZW50L3NlcnZlciBzeW5jYWJsZSBwcm9wZXJ0aWVzIGZvciBnYW1lIG9iamVjdHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2hpcCA9IGZ1bmN0aW9uICgpIHt9O1xuU2hpcC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsnbGluZVdpZHRoJywgJ2xpbmVDb2xvcicsICdmaWxsQ29sb3InLCAnZmlsbEFscGhhJyxcbiAgICAndmVjdG9yU2NhbGUnLCAnc2hhcGUnLCAnc2hhcGVDbG9zZWQnLCAncGxheWVyaWQnLCAnY3J5c3RhbHMnLCAnZGVhZCddO1xuXG52YXIgQXN0ZXJvaWQgPSBmdW5jdGlvbiAoKSB7fTtcbkFzdGVyb2lkLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWyd2ZWN0b3JTY2FsZSddO1xuXG52YXIgQ3J5c3RhbCA9IGZ1bmN0aW9uICgpIHt9O1xuQ3J5c3RhbC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsndmVjdG9yU2NhbGUnXTtcblxudmFyIEdlbmVyaWNPcmIgPSBmdW5jdGlvbiAoKSB7fTtcbkdlbmVyaWNPcmIucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVDb2xvcicsICd2ZWN0b3JTY2FsZSddO1xuXG52YXIgUGxhbmV0b2lkID0gZnVuY3Rpb24gKCkge307XG5QbGFuZXRvaWQucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVDb2xvcicsICdmaWxsQ29sb3InLCAnbGluZVdpZHRoJywgJ2ZpbGxBbHBoYScsICd2ZWN0b3JTY2FsZScsICdvd25lciddO1xuXG52YXIgVHJlZSA9IGZ1bmN0aW9uICgpIHt9O1xuVHJlZS5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsndmVjdG9yU2NhbGUnLCAnbGluZUNvbG9yJywgJ2dyYXBoJywgJ3N0ZXAnXTtcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uICgpIHt9O1xuQnVsbGV0LnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gW107XG5cbmV4cG9ydHMuU2hpcCA9IFNoaXA7XG5leHBvcnRzLkFzdGVyb2lkID0gQXN0ZXJvaWQ7XG5leHBvcnRzLkNyeXN0YWwgPSBDcnlzdGFsO1xuZXhwb3J0cy5HZW5lcmljT3JiID0gR2VuZXJpY09yYjtcbmV4cG9ydHMuQnVsbGV0ID0gQnVsbGV0O1xuZXhwb3J0cy5QbGFuZXRvaWQgPSBQbGFuZXRvaWQ7XG5leHBvcnRzLlRyZWUgPSBUcmVlO1xuXG4iLCIvKipcbiAqIEFzdGVyb2lkLmpzXG4gKlxuICogQ2xpZW50IHNpZGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkFzdGVyb2lkO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBBc3Rlcm9pZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbiAgICAvL3RoaXMuYm9keS5kYW1waW5nID0gMDtcbn07XG5cbkFzdGVyb2lkLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIGEgPSBuZXcgQXN0ZXJvaWQoZ2FtZSwgb3B0aW9ucyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5Bc3Rlcm9pZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuQXN0ZXJvaWQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQXN0ZXJvaWQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShBc3Rlcm9pZC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQXN0ZXJvaWQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkFzdGVyb2lkLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZjAwZmYnO1xuQXN0ZXJvaWQucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwZmYwMCc7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4yNTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFzdGVyb2lkO1xuLy9TdGFyY29kZXIuQXN0ZXJvaWQgPSBBc3Rlcm9pZDtcbiIsIi8qKlxuICogQnVsbGV0LmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb24gb2Ygc2ltcGxlIHByb2plY3RpbGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5CdWxsZXQ7XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgU2ltcGxlUGFydGljbGUuY2FsbCh0aGlzLCBnYW1lLCAnYnVsbGV0Jyk7XG4gICAgdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkJ1bGxldC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZSk7XG5CdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVsbGV0O1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQnVsbGV0LnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShCdWxsZXQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0OyIsIi8qKlxuICogQ3J5c3RhbC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuQ3J5c3RhbDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgQ3J5c3RhbCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkNyeXN0YWwuYWRkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIHZhciBhID0gbmV3IENyeXN0YWwoZ2FtZSwgY29uZmlnKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gYTtcbn07XG5cbkNyeXN0YWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcbkNyeXN0YWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ3J5c3RhbDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKENyeXN0YWwucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKENyeXN0YWwucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkNyeXN0YWwucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnIzAwZmZmZic7XG5DcnlzdGFsLnByb3RvdHlwZS5fZmlsbENvbG9yID0gJyMwMDAwMDAnO1xuQ3J5c3RhbC5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcbkNyeXN0YWwucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuQ3J5c3RhbC5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMDtcbkNyeXN0YWwucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5DcnlzdGFsLnByb3RvdHlwZS5fZ2VvbWV0cnkgPSBbXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLmQyY3Jvc3N9XG5dO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3J5c3RhbDtcbiIsIi8qKlxuICogR2VuZXJpY09yYi5qc1xuICpcbiAqIEJ1aWxkaW5nIGJsb2NrXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5HZW5lcmljT3JiO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBHZW5lcmljT3JiID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuR2VuZXJpY09yYi5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgdmFyIGEgPSBuZXcgR2VuZXJpY09yYihnYW1lLCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBhO1xufTtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmljT3JiO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoR2VuZXJpY09yYi5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoR2VuZXJpY09yYi5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmYwMDAwJztcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwMDAwMCc7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4wO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUuX2dlb21ldHJ5ID0gW1xuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5kMmNyb3NzfVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmljT3JiO1xuIiwiLyoqXG4gKiBQbGFuZXRvaWQuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlBsYW5ldG9pZDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgUGxhbmV0b2lkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG59O1xuXG5QbGFuZXRvaWQuYWRkID0gZnVuY3Rpb24gKGdhbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgcGxhbmV0b2lkID0gbmV3IFBsYW5ldG9pZChnYW1lLCBvcHRpb25zKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gcGxhbmV0b2lkO1xufTtcblxuUGxhbmV0b2lkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5QbGFuZXRvaWQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGxhbmV0b2lkO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoUGxhbmV0b2lkLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShQbGFuZXRvaWQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbi8vUGxhbmV0b2lkLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZjAwZmYnO1xuLy9QbGFuZXRvaWQucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwZmYwMCc7XG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMjU7XG5QbGFuZXRvaWQucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5QbGFuZXRvaWQucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5QbGFuZXRvaWQucHJvdG90eXBlLl9nZW9tZXRyeSA9IFtcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuZDJjcm9zc30sXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLnNxdWFyZTB9LFxuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5zcXVhcmUxfVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGFuZXRvaWQ7XG4iLCIvKipcbiAqIFNoaXAuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlNoaXA7XG4vL3ZhciBFbmdpbmUgPSByZXF1aXJlKCcuL0VuZ2luZS5qcycpO1xuLy92YXIgV2VhcG9ucyA9IHJlcXVpcmUoJy4vV2VhcG9ucy5qcycpO1xuXG52YXIgU2hpcCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcblxuICAgIGlmIChjb25maWcubWFzcykge1xuICAgICAgICB0aGlzLmJvZHkubWFzcyA9IGNvbmZpZy5tYXNzO1xuICAgIH1cbiAgICAvL3RoaXMuZW5naW5lID0gRW5naW5lLmFkZChnYW1lLCAndGhydXN0JywgNTAwKTtcbiAgICAvL3RoaXMuYWRkQ2hpbGQodGhpcy5lbmdpbmUpO1xuICAgIC8vdGhpcy53ZWFwb25zID0gV2VhcG9ucy5hZGQoZ2FtZSwgJ2J1bGxldCcsIDEyKTtcbiAgICAvL3RoaXMud2VhcG9ucy5zaGlwID0gdGhpcztcbiAgICAvL3RoaXMuYWRkQ2hpbGQodGhpcy53ZWFwb25zKTtcbiAgICB0aGlzLnRhZ1RleHQgPSBnYW1lLmFkZC50ZXh0KDAsIHRoaXMudGV4dHVyZS5oZWlnaHQvMiArIDEsXG4gICAgICAgIGNvbmZpZy50YWcsIHtmb250OiAnYm9sZCAxOHB4IEFyaWFsJywgZmlsbDogdGhpcy5saW5lQ29sb3IgfHwgJyNmZmZmZmYnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICB0aGlzLnRhZ1RleHQuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLnRhZ1RleHQpO1xuICAgIHRoaXMubG9jYWxTdGF0ZSA9IHtcbiAgICAgICAgdGhydXN0OiAnb2ZmJ1xuICAgIH1cbn07XG5cblNoaXAuYWRkID0gZnVuY3Rpb24gKGdhbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgcyA9IG5ldyBTaGlwKGdhbWUsIG9wdGlvbnMpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHMpO1xuICAgIHJldHVybiBzO1xufTtcblxuU2hpcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuU2hpcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTaGlwO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoU2hpcC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoU2hpcC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuLy9TaGlwLnByb3RvdHlwZS5zZXRMaW5lU3R5bGUgPSBmdW5jdGlvbiAoY29sb3IsIGxpbmVXaWR0aCkge1xuLy8gICAgU3RhcmNvZGVyLlZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0TGluZVN0eWxlLmNhbGwodGhpcywgY29sb3IsIGxpbmVXaWR0aCk7XG4vLyAgICB0aGlzLnRhZ1RleHQuc2V0U3R5bGUoe2ZpbGw6IGNvbG9yfSk7XG4vL307XG5cbi8vU2hpcC5wcm90b3R5cGUuc2hhcGUgPSBbXG4vLyAgICBbLTEsLTFdLFxuLy8gICAgWy0wLjUsMF0sXG4vLyAgICBbLTEsMV0sXG4vLyAgICBbMCwwLjVdLFxuLy8gICAgWzEsMV0sXG4vLyAgICBbMC41LDBdLFxuLy8gICAgWzEsLTFdLFxuLy8gICAgWzAsLTAuNV0sXG4vLyAgICBbLTEsLTFdXG4vL107XG4vL1NoaXAucHJvdG90eXBlLl9saW5lV2lkdGggPSA2O1xuXG5TaGlwLnByb3RvdHlwZS51cGRhdGVBcHBlYXJhbmNlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEZJWE1FOiBQcm9iYWJseSBuZWVkIHRvIHJlZmFjdG9yIGNvbnN0cnVjdG9yIGEgYml0IHRvIG1ha2UgdGhpcyBjbGVhbmVyXG4gICAgVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGVBcHBlYXJhbmNlLmNhbGwodGhpcyk7XG4gICAgaWYgKHRoaXMudGFnVGV4dCkge1xuICAgICAgICAvL3RoaXMudGFnVGV4dC5zZXRTdHlsZSh7ZmlsbDogdGhpcy5saW5lQ29sb3J9KTtcbiAgICAgICAgdGhpcy50YWdUZXh0LmZpbGwgPSB0aGlzLmxpbmVDb2xvcjtcbiAgICAgICAgdGhpcy50YWdUZXh0LnkgPSB0aGlzLnRleHR1cmUuaGVpZ2h0LzIgKyAxO1xuICAgIH1cbn07XG5cblNoaXAucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBWZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMpO1xuICAgIC8vIEZJWE1FOiBOZWVkIHRvIGRlYWwgd2l0aCBwbGF5ZXIgdmVyc3VzIGZvcmVpZ24gc2hpcHNcbiAgICBzd2l0Y2ggKHRoaXMubG9jYWxTdGF0ZS50aHJ1c3QpIHtcbiAgICAgICAgY2FzZSAnc3RhcnRpbmcnOlxuICAgICAgICAgICAgdGhpcy5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QucGxheSgpO1xuICAgICAgICAgICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvci5zdGFydE9uKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0YXRlLnRocnVzdCA9ICdvbic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2h1dGRvd24nOlxuICAgICAgICAgICAgdGhpcy5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3Quc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvci5zdG9wT24odGhpcyk7XG4gICAgICAgICAgICB0aGlzLmxvY2FsU3RhdGUudGhydXN0ID0gJ29mZic7XG4gICAgfVxuICAgIC8vIFBsYXllciBzaGlwIG9ubHlcbiAgICB0aGlzLmdhbWUuaW52ZW50b3J5dGV4dC5zZXRUZXh0KHRoaXMuY3J5c3RhbHMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaGlwO1xuLy9TdGFyY29kZXIuU2hpcCA9IFNoaXA7XG4iLCIvKipcbiAqIFNpbXBsZVBhcnRpY2xlLmpzXG4gKlxuICogQmFzaWMgYml0bWFwIHBhcnRpY2xlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSBmdW5jdGlvbiAoZ2FtZSwga2V5KSB7XG4gICAgdmFyIHRleHR1cmUgPSBTaW1wbGVQYXJ0aWNsZS5fdGV4dHVyZUNhY2hlW2tleV07XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIDAsIDAsIHRleHR1cmUpO1xuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUodGhpcywgZmFsc2UsIGZhbHNlKTtcbiAgICB0aGlzLmJvZHkuY2xlYXJTaGFwZXMoKTtcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmJvZHkuYWRkUGFydGljbGUoKTtcbiAgICBzaGFwZS5zZW5zb3IgPSB0cnVlO1xuICAgIC8vdGhpcy5raWxsKCk7XG59O1xuXG5TaW1wbGVQYXJ0aWNsZS5fdGV4dHVyZUNhY2hlID0ge307XG5cblNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSA9IGZ1bmN0aW9uIChnYW1lLCBrZXksIGNvbG9yLCBzaXplKSB7XG4gICAgdmFyIHRleHR1cmUgPSBnYW1lLm1ha2UuYml0bWFwRGF0YShzaXplLCBzaXplKTtcbiAgICB0ZXh0dXJlLmN0eC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICB0ZXh0dXJlLmN0eC5maWxsUmVjdCgwLCAwLCBzaXplLCBzaXplKTtcbiAgICBTaW1wbGVQYXJ0aWNsZS5fdGV4dHVyZUNhY2hlW2tleV0gPSB0ZXh0dXJlO1xufTtcblxuU2ltcGxlUGFydGljbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5TaW1wbGVQYXJ0aWNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTaW1wbGVQYXJ0aWNsZTtcblxuLy9TaW1wbGVQYXJ0aWNsZS5FbWl0dGVyID0gZnVuY3Rpb24gKGdhbWUsIGtleSwgbikge1xuLy8gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSk7XG4vLyAgICBuID0gbiB8fCA1MDtcbi8vICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4vLyAgICAgICAgdGhpcy5hZGQobmV3IFNpbXBsZVBhcnRpY2xlKGdhbWUsIGtleSkpO1xuLy8gICAgfVxuLy8gICAgdGhpcy5fb24gPSBmYWxzZTtcbi8vfTtcbi8vXG4vL1NpbXBsZVBhcnRpY2xlLkVtaXR0ZXIuYWRkID0gZnVuY3Rpb24gKGdhbWUsIGtleSwgbikge1xuLy8gICAgdmFyIGVtaXR0ZXIgPSBuZXcgU2ltcGxlUGFydGljbGUuRW1pdHRlcihnYW1lLCBrZXksIG4pO1xuLy8gICAgZ2FtZS5hZGQuZXhpc3RpbmcoZW1pdHRlcik7XG4vLyAgICByZXR1cm4gZW1pdHRlcjtcbi8vfTtcbi8vXG4vL1NpbXBsZVBhcnRpY2xlLkVtaXR0ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbi8vU2ltcGxlUGFydGljbGUuRW1pdHRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTaW1wbGVQYXJ0aWNsZS5FbWl0dGVyO1xuLy9cbi8vU2ltcGxlUGFydGljbGUuRW1pdHRlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuLy8gICAgLy8gRklYTUU6IFRlc3RpbmcgaGFja1xuLy8gICAgaWYgKHRoaXMuX29uKSB7XG4vLyAgICAgICAgZm9yICh2YXIgaSA9IDA7IGk8MjA7IGkrKykge1xuLy8gICAgICAgICAgICB2YXIgcGFydGljbGUgPSB0aGlzLmdldEZpcnN0RGVhZCgpO1xuLy8gICAgICAgICAgICBpZiAoIXBhcnRpY2xlKSB7XG4vLyAgICAgICAgICAgICAgICBicmVhaztcbi8vICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICBwYXJ0aWNsZS5saWZlc3BhbiA9IDI1MDtcbi8vICAgICAgICAgICAgcGFydGljbGUuYWxwaGEgPSAwLjU7XG4vLyAgICAgICAgICAgIHZhciBkID0gdGhpcy5nYW1lLnJuZC5iZXR3ZWVuKC03LCA3KTtcbi8vICAgICAgICAgICAgcGFydGljbGUucmVzZXQoZCwgMTApO1xuLy8gICAgICAgICAgICBwYXJ0aWNsZS5ib2R5LnZlbG9jaXR5LnkgPSA4MDtcbi8vICAgICAgICAgICAgcGFydGljbGUuYm9keS52ZWxvY2l0eS54ID0gLTMqZDtcbi8vICAgICAgICB9XG4vLyAgICB9XG4vL307XG5cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlUGFydGljbGU7XG4vL1N0YXJjb2Rlci5TaW1wbGVQYXJ0aWNsZSA9IFNpbXBsZVBhcnRpY2xlOyIsIi8qKlxuICogU3luY0JvZHlJbnRlcmZhY2UuanNcbiAqXG4gKiBTaGFyZWQgbWV0aG9kcyBmb3IgVmVjdG9yU3ByaXRlcywgUGFydGljbGVzLCBldGMuXG4gKi9cblxudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gZnVuY3Rpb24gKCkge307XG5cbi8qKlxuICogU2V0IGxvY2F0aW9uIGFuZCBhbmdsZSBvZiBhIHBoeXNpY3Mgb2JqZWN0LiBWYWx1ZSBhcmUgZ2l2ZW4gaW4gd29ybGQgY29vcmRpbmF0ZXMsIG5vdCBwaXhlbHNcbiAqXG4gKiBAcGFyYW0geCB7bnVtYmVyfVxuICogQHBhcmFtIHkge251bWJlcn1cbiAqIEBwYXJhbSBhIHtudW1iZXJ9XG4gKi9cblN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZS5zZXRQb3NBbmdsZSA9IGZ1bmN0aW9uICh4LCB5LCBhKSB7XG4gICAgdGhpcy5ib2R5LmRhdGEucG9zaXRpb25bMF0gPSAtKHggfHwgMCk7XG4gICAgdGhpcy5ib2R5LmRhdGEucG9zaXRpb25bMV0gPSAtKHkgfHwgMCk7XG4gICAgdGhpcy5ib2R5LmRhdGEuYW5nbGUgPSBhIHx8IDA7XG59O1xuXG5TeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUuY29uZmlnID0gZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMudXBkYXRlUHJvcGVydGllcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGsgPSB0aGlzLnVwZGF0ZVByb3BlcnRpZXNbaV07XG4gICAgICAgIGlmICh0eXBlb2YgcHJvcGVydGllc1trXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXNba10gPSBwcm9wZXJ0aWVzW2tdOyAgICAgICAgLy8gRklYTUU/IFZpcnR1YWxpemUgc29tZWhvd1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW5jQm9keUludGVyZmFjZTsiLCIvKipcbiAqIFRocnVzdEdlbmVyYXRvci5qc1xuICpcbiAqIEdyb3VwIHByb3ZpZGluZyBBUEksIGxheWVyaW5nLCBhbmQgcG9vbGluZyBmb3IgdGhydXN0IHBhcnRpY2xlIGVmZmVjdHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSByZXF1aXJlKCcuL1NpbXBsZVBhcnRpY2xlLmpzJyk7XG5cbnZhciBfdGV4dHVyZUtleSA9ICd0aHJ1c3QnO1xuXG4vLyBQb29saW5nIHBhcmFtZXRlcnNcbnZhciBfbWluUG9vbFNpemUgPSAzMDA7XG52YXIgX21pbkZyZWVQYXJ0aWNsZXMgPSAyMDtcbnZhciBfc29mdFBvb2xMaW1pdCA9IDIwMDtcbnZhciBfaGFyZFBvb2xMaW1pdCA9IDUwMDtcblxuLy8gQmVoYXZpb3Igb2YgZW1pdHRlclxudmFyIF9wYXJ0aWNsZXNQZXJCdXJzdCA9IDU7XG52YXIgX3BhcnRpY2xlVFRMID0gMTUwO1xudmFyIF9wYXJ0aWNsZUJhc2VTcGVlZCA9IDU7XG52YXIgX2NvbmVMZW5ndGggPSAxO1xudmFyIF9jb25lV2lkdGhSYXRpbyA9IDAuMjtcbnZhciBfZW5naW5lT2Zmc2V0ID0gLTIwO1xuXG52YXIgVGhydXN0R2VuZXJhdG9yID0gZnVuY3Rpb24gKGdhbWUpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIHRoaXMudGhydXN0aW5nU2hpcHMgPSB7fTtcblxuICAgIC8vIFByZWdlbmVyYXRlIGEgYmF0Y2ggb2YgcGFydGljbGVzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfbWluUG9vbFNpemU7IGkrKykge1xuICAgICAgICB2YXIgcGFydGljbGUgPSB0aGlzLmFkZChuZXcgU2ltcGxlUGFydGljbGUoZ2FtZSwgX3RleHR1cmVLZXkpKTtcbiAgICAgICAgcGFydGljbGUuYWxwaGEgPSAwLjU7XG4gICAgICAgIHBhcnRpY2xlLnJvdGF0aW9uID0gTWF0aC5QSS80O1xuICAgICAgICBwYXJ0aWNsZS5raWxsKCk7XG4gICAgfVxufTtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVGhydXN0R2VuZXJhdG9yO1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLnN0YXJ0T24gPSBmdW5jdGlvbiAoc2hpcCkge1xuICAgIHRoaXMudGhydXN0aW5nU2hpcHNbc2hpcC5pZF0gPSBzaGlwO1xufTtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS5zdG9wT24gPSBmdW5jdGlvbiAoc2hpcCkge1xuICAgIGRlbGV0ZSB0aGlzLnRocnVzdGluZ1NoaXBzW3NoaXAuaWRdO1xufTtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnRocnVzdGluZ1NoaXBzKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBzaGlwID0gdGhpcy50aHJ1c3RpbmdTaGlwc1trZXlzW2ldXTtcbiAgICAgICAgdmFyIHcgPSBzaGlwLndpZHRoO1xuICAgICAgICB2YXIgc2luID0gTWF0aC5zaW4oc2hpcC5yb3RhdGlvbik7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhzaGlwLnJvdGF0aW9uKTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBfcGFydGljbGVzUGVyQnVyc3Q7IGorKykge1xuICAgICAgICAgICAgdmFyIHBhcnRpY2xlID0gdGhpcy5nZXRGaXJzdERlYWQoKTtcbiAgICAgICAgICAgIGlmICghcGFydGljbGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90IGVub3VnaCB0aHJ1c3QgcGFydGljbGVzIGluIHBvb2wnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkID0gdGhpcy5nYW1lLnJuZC5yZWFsSW5SYW5nZSgtX2NvbmVXaWR0aFJhdGlvKncsIF9jb25lV2lkdGhSYXRpbyp3KTtcbiAgICAgICAgICAgIHZhciB4ID0gc2hpcC54ICsgZCpjb3MgKyBfZW5naW5lT2Zmc2V0KnNpbjtcbiAgICAgICAgICAgIHZhciB5ID0gc2hpcC55ICsgZCpzaW4gLSBfZW5naW5lT2Zmc2V0KmNvcztcbiAgICAgICAgICAgIHBhcnRpY2xlLmxpZmVzcGFuID0gX3BhcnRpY2xlVFRMO1xuICAgICAgICAgICAgcGFydGljbGUucmVzZXQoeCwgeSk7XG4gICAgICAgICAgICBwYXJ0aWNsZS5ib2R5LnZlbG9jaXR5LnggPSBfcGFydGljbGVCYXNlU3BlZWQqKF9jb25lTGVuZ3RoKnNpbiAtIGQqY29zKTtcbiAgICAgICAgICAgIHBhcnRpY2xlLmJvZHkudmVsb2NpdHkueSA9IF9wYXJ0aWNsZUJhc2VTcGVlZCooLV9jb25lTGVuZ3RoKmNvcyAtIGQqc2luKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblRocnVzdEdlbmVyYXRvci50ZXh0dXJlS2V5ID0gX3RleHR1cmVLZXk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGhydXN0R2VuZXJhdG9yOyIsIi8qKlxuICogVG9hc3QuanNcbiAqXG4gKiBDbGFzcyBmb3IgdmFyaW91cyBraW5kcyBvZiBwb3AgdXAgbWVzc2FnZXNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVG9hc3QgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSwgdGV4dCwgY29uZmlnKSB7XG4gICAgLy8gVE9ETzogYmV0dGVyIGRlZmF1bHRzLCBtYXliZVxuICAgIFBoYXNlci5UZXh0LmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgdGV4dCwge1xuICAgICAgICBmb250OiAnMTRwdCBBcmlhbCcsXG4gICAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgZmlsbDogJyNmZmE1MDAnXG4gICAgfSk7XG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIC8vIFNldCB1cCBzdHlsZXMgYW5kIHR3ZWVuc1xuICAgIHZhciBzcGVjID0ge307XG4gICAgaWYgKGNvbmZpZy51cCkge1xuICAgICAgICBzcGVjLnkgPSAnLScgKyBjb25maWcudXA7XG4gICAgfVxuICAgIGlmIChjb25maWcuZG93bikge1xuICAgICAgICBzcGVjLnkgPSAnKycgKyBjb25maWcudXA7XG4gICAgfVxuICAgIGlmIChjb25maWcubGVmdCkge1xuICAgICAgICBzcGVjLnggPSAnLScgKyBjb25maWcudXA7XG4gICAgfVxuICAgIGlmIChjb25maWcucmlnaHQpIHtcbiAgICAgICAgc3BlYy54ID0gJysnICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBzd2l0Y2ggKGNvbmZpZy50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3NwaW5uZXInOlxuICAgICAgICAgICAgdGhpcy5mb250U2l6ZSA9ICcyMHB0JztcbiAgICAgICAgICAgIHNwZWMucm90YXRpb24gPSBjb25maWcucmV2b2x1dGlvbnMgPyBjb25maWcucmV2b2x1dGlvbnMgKiAyICogTWF0aC5QSSA6IDIgKiBNYXRoLlBJO1xuICAgICAgICAgICAgdmFyIHR3ZWVuID0gZ2FtZS5hZGQudHdlZW4odGhpcykudG8oc3BlYywgY29uZmlnLmR1cmF0aW9uLCBjb25maWcuZWFzaW5nLCB0cnVlKTtcbiAgICAgICAgICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKGZ1bmN0aW9uICh0b2FzdCkge1xuICAgICAgICAgICAgICAgIHRvYXN0LmtpbGwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyBUT0RPOiBNb3JlIGtpbmRzXG4gICAgfVxufTtcblxuLyoqXG4gKiBDcmVhdGUgbmV3IFRvYXN0IGFuZCBhZGQgdG8gZ2FtZVxuICpcbiAqIEBwYXJhbSBnYW1lXG4gKiBAcGFyYW0geFxuICogQHBhcmFtIHlcbiAqIEBwYXJhbSB0ZXh0XG4gKiBAcGFyYW0gY29uZmlnXG4gKi9cblRvYXN0LmFkZCA9IGZ1bmN0aW9uIChnYW1lLCB4LCB5LCB0ZXh0LCBjb25maWcpIHtcbiAgICB2YXIgdG9hc3QgPSBuZXcgVG9hc3QoZ2FtZSwgeCwgeSwgdGV4dCwgY29uZmlnKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyh0b2FzdCk7XG59O1xuXG4vLyBDb3ZlbmllbmNlIG1ldGhvZHMgZm9yIGNvbW1vbiBjYXNlc1xuXG5Ub2FzdC5zcGluVXAgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSwgdGV4dCkge1xuICAgIHZhciB0b2FzdCA9IG5ldyBUb2FzdCAoZ2FtZSwgeCwgeSwgdGV4dCwge1xuICAgICAgICB0eXBlOiAnc3Bpbm5lcicsXG4gICAgICAgIHJldm9sdXRpb25zOiAxLFxuICAgICAgICBkdXJhdGlvbjogNTAwLFxuICAgICAgICBlYXNpbmc6IFBoYXNlci5FYXNpbmcuRWxhc3RpYy5PdXQsXG4gICAgICAgIHVwOiAxMDBcbiAgICB9KTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyh0b2FzdCk7XG59O1xuXG5Ub2FzdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5UZXh0LnByb3RvdHlwZSk7XG5Ub2FzdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUb2FzdDtcblxubW9kdWxlLmV4cG9ydHMgPSBUb2FzdDtcbiIsIi8qKlxuICogVHJlZS5qc1xuICpcbiAqIENsaWVudCBzaWRlXG4gKi9cblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5UcmVlO1xuXG52YXIgVHJlZSA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMSk7XG59O1xuXG5UcmVlLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICB2YXIgdHJlZSA9IG5ldyBUcmVlIChnYW1lLCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRyZWUpO1xuICAgIHJldHVybiB0cmVlO1xufTtcblxuVHJlZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuVHJlZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUcmVlO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJlZS5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJlZS5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuLyoqXG4gKiBEcmF3IHRyZWUsIG92ZXJyaWRpbmcgc3RhbmRhcmQgc2hhcGUgYW5kIGdlb21ldHJ5IG1ldGhvZCB0byB1c2UgZ3JhcGhcbiAqXG4gKiBAcGFyYW0gcmVuZGVyU2NhbGVcbiAqL1xuVHJlZS5wcm90b3R5cGUuZHJhd1Byb2NlZHVyZSA9IGZ1bmN0aW9uIChyZW5kZXJTY2FsZSkge1xuICAgIHZhciBsaW5lQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpO1xuICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKDEsIGxpbmVDb2xvciwgMSk7XG4gICAgdGhpcy5fZHJhd0JyYW5jaCh0aGlzLmdyYXBoLCB0aGlzLmdhbWUucGh5c2ljcy5wMi5tcHhpKHRoaXMudmVjdG9yU2NhbGUpKnJlbmRlclNjYWxlLCA1KTtcbn07XG5cblRyZWUucHJvdG90eXBlLl9kcmF3QnJhbmNoID0gZnVuY3Rpb24gKGdyYXBoLCBzYywgZGVwdGgpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGdyYXBoLmMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGdyYXBoLmNbaV07XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubW92ZVRvKGdyYXBoLnggKiBzYywgZ3JhcGgueSAqIHNjKTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lVG8oY2hpbGQueCAqIHNjLCBjaGlsZC55ICogc2MpO1xuICAgICAgICBpZiAoZGVwdGggPiB0aGlzLnN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMuX2RyYXdCcmFuY2goY2hpbGQsIHNjLCBkZXB0aCAtIDEpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFRyZWUucHJvdG90eXBlLCAnc3RlcCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0ZXA7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fc3RlcCA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyZWU7IiwiLyoqXG4gKiBTcHJpdGUgd2l0aCBhdHRhY2hlZCBHcmFwaGljcyBvYmplY3QgZm9yIHZlY3Rvci1saWtlIGdyYXBoaWNzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIFZlY3Rvci1iYXNlZCBzcHJpdGVzXG4gKlxuICogQHBhcmFtIGdhbWUge1BoYXNlci5HYW1lfSAtIFBoYXNlciBnYW1lIG9iamVjdFxuICogQHBhcmFtIGNvbmZpZyB7b2JqZWN0fSAtIFBPSk8gd2l0aCBjb25maWcgZGV0YWlsc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBWZWN0b3JTcHJpdGUgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUpO1xuXG4gICAgdGhpcy5ncmFwaGljcyA9IGdhbWUubWFrZS5ncmFwaGljcygpO1xuICAgIHRoaXMudGV4dHVyZSA9IHRoaXMuZ2FtZS5hZGQucmVuZGVyVGV4dHVyZSgpO1xuICAgIHRoaXMubWluaXRleHR1cmUgPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICB0aGlzLm1pbmlzcHJpdGUgPSB0aGlzLmdhbWUubWluaW1hcC5jcmVhdGUoKTtcbiAgICB0aGlzLm1pbmlzcHJpdGUuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcblxuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUodGhpcywgZmFsc2UsIGZhbHNlKTtcbiAgICB0aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xuICAgIHRoaXMuY29uZmlnKGNvbmZpZy5wcm9wZXJ0aWVzKTtcbiAgICB0aGlzLnVwZGF0ZUFwcGVhcmFuY2UoKTtcbiAgICB0aGlzLnVwZGF0ZUJvZHkoKTtcbiAgICB0aGlzLmJvZHkubWFzcyA9IDA7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBWZWN0b3JTcHJpdGUgYW5kIGFkZCB0byBnYW1lIHdvcmxkXG4gKlxuICogQHBhcmFtIGdhbWUge1BoYXNlci5HYW1lfVxuICogQHBhcmFtIHgge251bWJlcn0gLSB4IGNvb3JkXG4gKiBAcGFyYW0geSB7bnVtYmVyfSAtIHkgY29vcmRcbiAqIEByZXR1cm5zIHtWZWN0b3JTcHJpdGV9XG4gKi9cblZlY3RvclNwcml0ZS5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSkge1xuICAgIHZhciB2ID0gbmV3IFZlY3RvclNwcml0ZShnYW1lLCB4LCB5KTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyh2KTtcbiAgICByZXR1cm4gdjtcbn1cblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFZlY3RvclNwcml0ZTtcblxuLy8gRGVmYXVsdCBvY3RhZ29uXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9zaGFwZSA9IFtcbiAgICBbMiwxXSxcbiAgICBbMSwyXSxcbiAgICBbLTEsMl0sXG4gICAgWy0yLDFdLFxuICAgIFstMiwtMV0sXG4gICAgWy0xLC0yXSxcbiAgICBbMSwtMl0sXG4gICAgWzIsLTFdXG5dO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZmZmZmYnO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2ZpbGxDb2xvciA9IG51bGw7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9maWxsQWxwaGEgPSAwLjI1O1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fdmVjdG9yU2NhbGUgPSAxO1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnBoeXNpY3NCb2R5VHlwZSA9ICdjaXJjbGUnO1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnNldFNoYXBlID0gZnVuY3Rpb24gKHNoYXBlKSB7XG4gICAgdGhpcy5zaGFwZSA9IHNoYXBlO1xuICAgIHRoaXMudXBkYXRlQXBwZWFyYW5jZSgpO1xufTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5zZXRMaW5lU3R5bGUgPSBmdW5jdGlvbiAoY29sb3IsIGxpbmVXaWR0aCkge1xuICAgIGlmICghbGluZVdpZHRoIHx8IGxpbmVXaWR0aCA8IDEpIHtcbiAgICAgICAgbGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGggfHwgMTtcbiAgICB9XG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgIHRoaXMubGluZVdpZHRoID0gbGluZVdpZHRoO1xuICAgIHRoaXMudXBkYXRlQXBwZWFyYW5jZSgpO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgY2FjaGVkIGJpdG1hcHMgZm9yIG9iamVjdCBhZnRlciB2ZWN0b3IgcHJvcGVydGllcyBjaGFuZ2VcbiAqL1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGVBcHBlYXJhbmNlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIERyYXcgZnVsbCBzaXplZFxuICAgIHRoaXMuZ3JhcGhpY3MuY2xlYXIoKTtcbiAgICB0aGlzLmdyYXBoaWNzLl9jdXJyZW50Qm91bmRzID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIHRoaXMuZHJhd1Byb2NlZHVyZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5kcmF3UHJvY2VkdXJlKDEpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zaGFwZSkge1xuICAgICAgICB0aGlzLmRyYXcoMSk7XG4gICAgfVxuICAgIHZhciBib3VuZHMgPSB0aGlzLmdyYXBoaWNzLmdldExvY2FsQm91bmRzKCk7XG4gICAgdGhpcy50ZXh0dXJlLnJlc2l6ZShib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIHRydWUpO1xuICAgIHRoaXMudGV4dHVyZS5yZW5kZXJYWSh0aGlzLmdyYXBoaWNzLCAtYm91bmRzLngsIC1ib3VuZHMueSwgdHJ1ZSk7XG4gICAgdGhpcy5zZXRUZXh0dXJlKHRoaXMudGV4dHVyZSk7XG4gICAgLy8gRHJhdyBzbWFsbCBmb3IgbWluaW1hcFxuICAgIHZhciBtYXBTY2FsZSA9IHRoaXMuZ2FtZS5taW5pbWFwLm1hcFNjYWxlO1xuICAgIHRoaXMuZ3JhcGhpY3MuY2xlYXIoKTtcbiAgICB0aGlzLmdyYXBoaWNzLl9jdXJyZW50Qm91bmRzID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIHRoaXMuZHJhd1Byb2NlZHVyZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5kcmF3UHJvY2VkdXJlKG1hcFNjYWxlKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUpIHtcbiAgICAgICAgdGhpcy5kcmF3KG1hcFNjYWxlKTtcbiAgICB9XG4gICAgYm91bmRzID0gdGhpcy5ncmFwaGljcy5nZXRMb2NhbEJvdW5kcygpO1xuICAgIHRoaXMubWluaXRleHR1cmUucmVzaXplKGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgdHJ1ZSk7XG4gICAgdGhpcy5taW5pdGV4dHVyZS5yZW5kZXJYWSh0aGlzLmdyYXBoaWNzLCAtYm91bmRzLngsIC1ib3VuZHMueSwgdHJ1ZSk7XG4gICAgdGhpcy5taW5pc3ByaXRlLnNldFRleHR1cmUodGhpcy5taW5pdGV4dHVyZSk7XG4gICAgdGhpcy5fZGlydHkgPSBmYWxzZTtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlQm9keSA9IGZ1bmN0aW9uICgpIHtcbiAgICBzd2l0Y2ggKHRoaXMucGh5c2ljc0JvZHlUeXBlKSB7XG4gICAgICAgIGNhc2UgXCJjaXJjbGVcIjpcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5jaXJjbGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHIgPSB0aGlzLmdyYXBoaWNzLmdldEJvdW5kcygpO1xuICAgICAgICAgICAgICAgIHZhciByYWRpdXMgPSBNYXRoLnJvdW5kKE1hdGguc3FydChyLndpZHRoKiByLmhlaWdodCkvMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJhZGl1cyA9IHRoaXMucmFkaXVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ib2R5LnNldENpcmNsZShyYWRpdXMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIFRPRE86IE1vcmUgc2hhcGVzXG4gICAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdmVjdG9yIHRvIGJpdG1hcCBvZiBncmFwaGljcyBvYmplY3QgYXQgZ2l2ZW4gc2NhbGVcbiAqXG4gKiBAcGFyYW0gcmVuZGVyU2NhbGUge251bWJlcn0gLSBzY2FsZSBmYWN0b3IgZm9yIHJlbmRlclxuICovXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAocmVuZGVyU2NhbGUpIHtcbiAgICByZW5kZXJTY2FsZSA9IHJlbmRlclNjYWxlIHx8IDE7XG4gICAgLy8gRHJhdyBzaW1wbGUgc2hhcGUsIGlmIGdpdmVuXG4gICAgaWYgKHRoaXMuc2hhcGUpIHtcbiAgICAgICAgdmFyIGxpbmVDb2xvciA9IFBoYXNlci5Db2xvci5oZXhUb1JHQih0aGlzLmxpbmVDb2xvcik7XG4gICAgICAgIGlmIChyZW5kZXJTY2FsZSA9PT0gMSkge1xuICAgICAgICAgICAgdmFyIGxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGluZVdpZHRoID0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHJlbmRlclNjYWxlID09PSAxKSAmJiB0aGlzLmZpbGxDb2xvcikgeyAgICAgICAgLy8gT25seSBmaWxsIGZ1bGwgc2l6ZWRcbiAgICAgICAgICAgIHZhciBmaWxsQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5maWxsQ29sb3IpO1xuICAgICAgICAgICAgdmFyIGZpbGxBbHBoYSA9IHRoaXMuZmlsbEFscGhhIHx8IDE7XG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmJlZ2luRmlsbChmaWxsQ29sb3IsIGZpbGxBbHBoYSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lU3R5bGUobGluZVdpZHRoLCBsaW5lQ29sb3IsIDEpO1xuICAgICAgICB0aGlzLl9kcmF3UG9seWdvbih0aGlzLnNoYXBlLCB0aGlzLnNoYXBlQ2xvc2VkLCByZW5kZXJTY2FsZSk7XG4gICAgICAgIGlmICgocmVuZGVyU2NhbGUgPT09IDEpICYmIHRoaXMuZmlsbENvbG9yKSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmVuZEZpbGwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBEcmF3IGdlb21ldHJ5IHNwZWMsIGlmIGdpdmVuLCBidXQgb25seSBmb3IgdGhlIGZ1bGwgc2l6ZWQgc3ByaXRlXG4gICAgaWYgKChyZW5kZXJTY2FsZSA9PT0gMSkgJiYgdGhpcy5nZW9tZXRyeSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuZ2VvbWV0cnkubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZyA9IHRoaXMuZ2VvbWV0cnlbaV07XG4gICAgICAgICAgICBzd2l0Y2ggKGcudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJwb2x5XCI6XG4gICAgICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBkZWZhdWx0cyBhbmQgc3R1ZmZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhd1BvbHlnb24oZy5wb2ludHMsIGcuY2xvc2VkLCByZW5kZXJTY2FsZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBEcmF3IG9wZW4gb3IgY2xvc2VkIHBvbHlnb24gYXMgc2VxdWVuY2Ugb2YgbGluZVRvIGNhbGxzXG4gKlxuICogQHBhcmFtIHBvaW50cyB7QXJyYXl9IC0gcG9pbnRzIGFzIGFycmF5IG9mIFt4LHldIHBhaXJzXG4gKiBAcGFyYW0gY2xvc2VkIHtib29sZWFufSAtIGlzIHBvbHlnb24gY2xvc2VkP1xuICogQHBhcmFtIHJlbmRlclNjYWxlIHtudW1iZXJ9IC0gc2NhbGUgZmFjdG9yIGZvciByZW5kZXJcbiAqIEBwcml2YXRlXG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2RyYXdQb2x5Z29uID0gZnVuY3Rpb24gKHBvaW50cywgY2xvc2VkLCByZW5kZXJTY2FsZSkge1xuICAgIHZhciBzYyA9IHRoaXMuZ2FtZS5waHlzaWNzLnAyLm1weGkodGhpcy52ZWN0b3JTY2FsZSkqcmVuZGVyU2NhbGU7XG4gICAgcG9pbnRzID0gcG9pbnRzLnNsaWNlKCk7XG4gICAgaWYgKGNsb3NlZCkge1xuICAgICAgICBwb2ludHMucHVzaChwb2ludHNbMF0pO1xuICAgIH1cbiAgICB0aGlzLmdyYXBoaWNzLm1vdmVUbyhwb2ludHNbMF1bMF0gKiBzYywgcG9pbnRzWzBdWzFdICogc2MpO1xuICAgIGZvciAodmFyIGkgPSAxLCBsID0gcG9pbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyhwb2ludHNbaV1bMF0gKiBzYywgcG9pbnRzW2ldWzFdICogc2MpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSW52YWxpZGF0ZSBjYWNoZSBhbmQgcmVkcmF3IGlmIHNwcml0ZSBpcyBtYXJrZWQgZGlydHlcbiAqL1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX2RpcnR5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdkaXJ0eSBWUycpO1xuICAgICAgICB0aGlzLnVwZGF0ZUFwcGVhcmFuY2UoKTtcbiAgICB9XG59O1xuXG4vLyBWZWN0b3IgcHJvcGVydGllcyBkZWZpbmVkIHRvIGhhbmRsZSBtYXJraW5nIHNwcml0ZSBkaXJ0eSB3aGVuIG5lY2Vzc2FyeVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2xpbmVDb2xvcicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpbmVDb2xvcjtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9saW5lQ29sb3IgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdmaWxsQ29sb3InLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9maWxsQ29sb3I7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fZmlsbENvbG9yID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnbGluZVdpZHRoJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGluZVdpZHRoO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2xpbmVXaWR0aCA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2ZpbGxBbHBoYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGxBbHBoYTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9maWxsQWxwaGEgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdzaGFwZUNsb3NlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NoYXBlQ2xvc2VkO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX3NoYXBlQ2xvc2VkID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAndmVjdG9yU2NhbGUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92ZWN0b3JTY2FsZTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl92ZWN0b3JTY2FsZSA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3NoYXBlJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2hhcGU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fc2hhcGUgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdnZW9tZXRyeScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dlb21ldHJ5O1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2dlb21ldHJ5ID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZGVhZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlYWQ7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fZGVhZCA9IHZhbDtcbiAgICAgICAgaWYgKHZhbCkge1xuICAgICAgICAgICAgdGhpcy5raWxsKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJldml2ZSgpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBWZWN0b3JTcHJpdGU7XG4vL1N0YXJjb2Rlci5WZWN0b3JTcHJpdGUgPSBWZWN0b3JTcHJpdGU7IiwiLyoqXG4gKiBDb250cm9scy5qc1xuICpcbiAqIFZpcnR1YWxpemUgYW5kIGltcGxlbWVudCBxdWV1ZSBmb3IgZ2FtZSBjb250cm9sc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG5jb25zb2xlLmxvZygnQ29udHJvbHMnLCBTdGFyY29kZXIpO1xuXG52YXIgQ29udHJvbHMgPSBmdW5jdGlvbiAoZ2FtZSwgcGFyZW50KSB7XG4gICAgUGhhc2VyLlBsdWdpbi5jYWxsKHRoaXMsIGdhbWUsIHBhcmVudCk7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5QbHVnaW4ucHJvdG90eXBlKTtcbkNvbnRyb2xzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbnRyb2xzO1xuXG5Db250cm9scy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChxdWV1ZSkge1xuICAgIHRoaXMucXVldWUgPSBxdWV1ZTtcbiAgICB0aGlzLmNvbnRyb2xzID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcbiAgICB0aGlzLmNvbnRyb2xzLmZpcmUgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5CKTtcbn07XG5cbnZhciBzZXEgPSAwO1xudmFyIHVwID0gZmFsc2UsIGRvd24gPSBmYWxzZSwgbGVmdCA9IGZhbHNlLCByaWdodCA9IGZhbHNlLCBmaXJlID0gZmFsc2U7XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB1cCA9IGRvd24gPSBsZWZ0ID0gcmlnaHQgPSBmYWxzZTtcbiAgICB0aGlzLnF1ZXVlLmxlbmd0aCA9IDA7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUucHJlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFRPRE86IFN1cHBvcnQgb3RoZXIgaW50ZXJhY3Rpb25zL21ldGhvZHNcbiAgICB2YXIgY29udHJvbHMgPSB0aGlzLmNvbnRyb2xzO1xuICAgIGlmIChjb250cm9scy51cC5pc0Rvd24gJiYgIXVwKSB7XG4gICAgICAgIHVwID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndXBfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIWNvbnRyb2xzLnVwLmlzRG93biAmJiB1cCkge1xuICAgICAgICB1cCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICd1cF9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoY29udHJvbHMuZG93bi5pc0Rvd24gJiYgIWRvd24pIHtcbiAgICAgICAgZG93biA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2Rvd25fcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIWNvbnRyb2xzLmRvd24uaXNEb3duICYmIGRvd24pIHtcbiAgICAgICAgZG93biA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdkb3duX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmIChjb250cm9scy5yaWdodC5pc0Rvd24gJiYgIXJpZ2h0KSB7XG4gICAgICAgIHJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAncmlnaHRfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIWNvbnRyb2xzLnJpZ2h0LmlzRG93biAmJiByaWdodCkge1xuICAgICAgICByaWdodCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdyaWdodF9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoY29udHJvbHMubGVmdC5pc0Rvd24gJiYgIWxlZnQpIHtcbiAgICAgICAgbGVmdCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2xlZnRfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIWNvbnRyb2xzLmxlZnQuaXNEb3duICYmIGxlZnQpIHtcbiAgICAgICAgbGVmdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdsZWZ0X3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmIChjb250cm9scy5maXJlLmlzRG93biAmJiAhZmlyZSkge1xuICAgICAgICBmaXJlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZmlyZV9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghY29udHJvbHMuZmlyZS5pc0Rvd24gJiYgZmlyZSkge1xuICAgICAgICBmaXJlID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2ZpcmVfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUucHJvY2Vzc1F1ZXVlID0gZnVuY3Rpb24gKGNiLCBjbGVhcikge1xuICAgIHZhciBxdWV1ZSA9IHRoaXMucXVldWU7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBxdWV1ZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGFjdGlvbiA9IHF1ZXVlW2ldO1xuICAgICAgICBpZiAoYWN0aW9uLmV4ZWN1dGVkKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYihhY3Rpb24pO1xuICAgICAgICBhY3Rpb24uZXRpbWUgPSB0aGlzLmdhbWUudGltZS5ub3c7XG4gICAgICAgIGFjdGlvbi5leGVjdXRlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChjbGVhcikge1xuICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgIH1cbn07XG5cblN0YXJjb2Rlci5Db250cm9scyA9IENvbnRyb2xzO1xubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sczsiLCIvKipcbiAqIFN5bmNDbGllbnQuanNcbiAqXG4gKiBTeW5jIHBoeXNpY3Mgb2JqZWN0cyB3aXRoIHNlcnZlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG52YXIgVVBEQVRFX1FVRVVFX0xJTUlUID0gODtcblxudmFyIFN5bmNDbGllbnQgPSBmdW5jdGlvbiAoZ2FtZSwgcGFyZW50KSB7XG4gICAgUGhhc2VyLlBsdWdpbi5jYWxsKHRoaXMsIGdhbWUsIHBhcmVudCk7XG59O1xuXG5TeW5jQ2xpZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlBsdWdpbi5wcm90b3R5cGUpO1xuU3luY0NsaWVudC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTeW5jQ2xpZW50O1xuXG5cbi8qKlxuICogSW5pdGlhbGl6ZSBwbHVnaW5cbiAqXG4gKiBAcGFyYW0gc29ja2V0IHtTb2NrZXR9IC0gc29ja2V0LmlvIHNvY2tldCBmb3Igc3luYyBjb25uZWN0aW9uXG4gKiBAcGFyYW0gcXVldWUge0FycmF5fSAtIGNvbW1hbmQgcXVldWVcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChzb2NrZXQsIHF1ZXVlKSB7XG4gICAgLy8gVE9ETzogQ29weSBzb21lIGNvbmZpZyBvcHRpb25zXG4gICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XG4gICAgdGhpcy5jbWRRdWV1ZSA9IHF1ZXVlO1xuICAgIHRoaXMuZXh0YW50ID0ge307XG59O1xuXG4vKipcbiAqIFN0YXJ0IHBsdWdpblxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHN0YXJjb2RlciA9IHRoaXMuZ2FtZS5zdGFyY29kZXI7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGxldGUgPSBmYWxzZTtcbiAgICAvLyBGSVhNRTogTmVlZCBtb3JlIHJvYnVzdCBoYW5kbGluZyBvZiBEQy9SQ1xuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmdhbWUucGF1c2VkID0gdHJ1ZTtcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbigncmVjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmdhbWUucGF1c2VkID0gZmFsc2U7XG4gICAgfSk7XG4gICAgLy8gTWVhc3VyZSBjbGllbnQtc2VydmVyIHRpbWUgZGVsdGFcbiAgICB0aGlzLnNvY2tldC5vbigndGltZXN5bmMnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBzZWxmLl9sYXRlbmN5ID0gZGF0YSAtIHNlbGYuZ2FtZS50aW1lLm5vdztcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlYWxUaW1lID0gZGF0YS5yO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGRhdGEuYi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB1cGRhdGUgPSBkYXRhLmJbaV07XG4gICAgICAgICAgICB2YXIgaWQgPSB1cGRhdGUuaWQ7XG4gICAgICAgICAgICB2YXIgc3ByaXRlO1xuICAgICAgICAgICAgdXBkYXRlLnRpbWVzdGFtcCA9IHJlYWxUaW1lO1xuICAgICAgICAgICAgaWYgKHNwcml0ZSA9IHNlbGYuZXh0YW50W2lkXSkge1xuICAgICAgICAgICAgICAgIC8vIEV4aXN0aW5nIHNwcml0ZSAtIHByb2Nlc3MgdXBkYXRlXG4gICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlLnB1c2godXBkYXRlKTtcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLmNvbmZpZyh1cGRhdGUucHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzcHJpdGUudXBkYXRlUXVldWUubGVuZ3RoID4gVVBEQVRFX1FVRVVFX0xJTUlUKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS51cGRhdGVRdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gTmV3IHNwcml0ZSAtIGNyZWF0ZSBhbmQgY29uZmlndXJlXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnTmV3JywgaWQsIHVwZGF0ZS50KTtcbiAgICAgICAgICAgICAgICBzcHJpdGUgPSBzdGFyY29kZXIuYWRkQm9keSh1cGRhdGUudCwgdXBkYXRlKTtcbiAgICAgICAgICAgICAgICBpZiAoc3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS5zZXJ2ZXJJZCA9IGlkO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmV4dGFudFtpZF0gPSBzcHJpdGU7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS51cGRhdGVRdWV1ZSA9IFt1cGRhdGVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwLCBsID0gZGF0YS5ybS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGlkID0gZGF0YS5ybVtpXTtcbiAgICAgICAgICAgIGlmIChzZWxmLmV4dGFudFtpZF0pIHtcbiAgICAgICAgICAgICAgICBzdGFyY29kZXIucmVtb3ZlQm9keShzZWxmLmV4dGFudFtpZF0pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBzZWxmLmV4dGFudFtpZF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogU2VuZCBxdWV1ZWQgY29tbWFuZHMgdG8gc2VydmVyIGFuZCBpbnRlcnBvbGF0ZSBvYmplY3RzIGJhc2VkIG9uIHVwZGF0ZXMgZnJvbSBzZXJ2ZXJcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fdXBkYXRlQ29tcGxldGUpIHtcbiAgICAgICAgdGhpcy5fc2VuZENvbW1hbmRzKCk7XG4gICAgICAgIHRoaXMuX3Byb2Nlc3NQaHlzaWNzVXBkYXRlcygpO1xuICAgICAgICB0aGlzLl91cGRhdGVDb21wbGV0ZSA9IHRydWU7XG4gICAgfVxuIH07XG5cblN5bmNDbGllbnQucHJvdG90eXBlLnBvc3RSZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGxldGUgPSBmYWxzZTtcbn07XG5cbi8qKlxuICogU2VuZCBxdWV1ZWQgY29tbWFuZHMgdGhhdCBoYXZlIGJlZW4gZXhlY3V0ZWQgdG8gdGhlIHNlcnZlclxuICpcbiAqIEBwcml2YXRlXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLl9zZW5kQ29tbWFuZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFjdGlvbnMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5jbWRRdWV1ZS5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIGFjdGlvbiA9IHRoaXMuY21kUXVldWVbaV07XG4gICAgICAgIGlmIChhY3Rpb24uZXhlY3V0ZWQpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChhY3Rpb24pO1xuICAgICAgICAgICAgdGhpcy5jbWRRdWV1ZS5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFjdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2RvJywgYWN0aW9ucyk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ3NlbmRpbmcgYWN0aW9ucycsIGFjdGlvbnMpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSGFuZGxlcyBpbnRlcnBvbGF0aW9uIC8gcHJlZGljdGlvbiByZXNvbHV0aW9uIGZvciBwaHlzaWNzIGJvZGllc1xuICpcbiAqIEBwcml2YXRlXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLl9wcm9jZXNzUGh5c2ljc1VwZGF0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGludGVycFRpbWUgPSB0aGlzLmdhbWUudGltZS5ub3cgKyB0aGlzLl9sYXRlbmN5IC0gdGhpcy5nYW1lLnN0YXJjb2Rlci5jb25maWcucmVuZGVyTGF0ZW5jeTtcbiAgICB2YXIgb2lkcyA9IE9iamVjdC5rZXlzKHRoaXMuZXh0YW50KTtcbiAgICBmb3IgKHZhciBpID0gb2lkcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgc3ByaXRlID0gdGhpcy5leHRhbnRbb2lkc1tpXV07XG4gICAgICAgIHZhciBxdWV1ZSA9IHNwcml0ZS51cGRhdGVRdWV1ZTtcbiAgICAgICAgdmFyIGJlZm9yZSA9IG51bGwsIGFmdGVyID0gbnVsbDtcblxuICAgICAgICAvLyBGaW5kIHVwZGF0ZXMgYmVmb3JlIGFuZCBhZnRlciBpbnRlcnBUaW1lXG4gICAgICAgIHZhciBqID0gMTtcbiAgICAgICAgd2hpbGUgKHF1ZXVlW2pdKSB7XG4gICAgICAgICAgICBpZiAocXVldWVbal0udGltZXN0YW1wID4gaW50ZXJwVGltZSkge1xuICAgICAgICAgICAgICAgIGFmdGVyID0gcXVldWVbal07XG4gICAgICAgICAgICAgICAgYmVmb3JlID0gcXVldWVbai0xXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGorKztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vbmUgLSB3ZSdyZSBiZWhpbmQuXG4gICAgICAgIGlmICghYmVmb3JlICYmICFhZnRlcikge1xuICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+PSAyKSB7ICAgIC8vIFR3byBtb3N0IHJlY2VudCB1cGRhdGVzIGF2YWlsYWJsZT8gVXNlIHRoZW0uXG4gICAgICAgICAgICAgICAgYmVmb3JlID0gcXVldWVbcXVldWUubGVuZ3RoIC0gMl07XG4gICAgICAgICAgICAgICAgYWZ0ZXIgPSBxdWV1ZVtxdWV1ZS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdMYWdnaW5nJywgb2lkc1tpXSk7XG4gICAgICAgICAgICB9IGVsc2UgeyAgICAgICAgICAgICAgICAgICAgLy8gTm8/IEp1c3QgYmFpbFxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ0JhaWxpbmcnLCBvaWRzW2ldKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ09rJywgaW50ZXJwVGltZSwgcXVldWUubGVuZ3RoKTtcbiAgICAgICAgICAgIHF1ZXVlLnNwbGljZSgwLCBqIC0gMSk7ICAgICAvLyBUaHJvdyBvdXQgb2xkZXIgdXBkYXRlc1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNwYW4gPSBhZnRlci50aW1lc3RhbXAgLSBiZWZvcmUudGltZXN0YW1wO1xuICAgICAgICB2YXIgdCA9IChpbnRlcnBUaW1lIC0gYmVmb3JlLnRpbWVzdGFtcCkgLyBzcGFuO1xuICAgICAgICBzcHJpdGUuc2V0UG9zQW5nbGUobGluZWFyKGJlZm9yZS54LCBhZnRlci54LCB0KSwgbGluZWFyKGJlZm9yZS55LCBhZnRlci55LCB0KSwgbGluZWFyKGJlZm9yZS5hLCBhZnRlci5hLCB0KSk7XG4gICAgfVxufTtcblxuLy8gSGVscGVyc1xuXG4vKipcbiAqIEludGVycG9sYXRlIGJldHdlZW4gdHdvIHBvaW50cyB3aXRoIGhlcm1pdGUgc3BsaW5lXG4gKiBOQiAtIGN1cnJlbnRseSB1bnVzZWQgYW5kIHByb2JhYmx5IGJyb2tlblxuICpcbiAqIEBwYXJhbSBwMCB7bnVtYmVyfSAtIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSBwMSB7bnVtYmVyfSAtIGZpbmFsIHZhbHVlXG4gKiBAcGFyYW0gdjAge251bWJlcn0gLSBpbml0aWFsIHNsb3BlXG4gKiBAcGFyYW0gdjEge251bWJlcn0gLSBmaW5hbCBzbG9wZVxuICogQHBhcmFtIHQge251bWJlcn0gLSBwb2ludCBvZiBpbnRlcnBvbGF0aW9uIChiZXR3ZWVuIDAgYW5kIDEpXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIGludGVycG9sYXRlZCB2YWx1ZVxuICovXG5mdW5jdGlvbiBoZXJtaXRlIChwMCwgcDEsIHYwLCB2MSwgdCkge1xuICAgIHZhciB0MiA9IHQqdDtcbiAgICB2YXIgdDMgPSB0KnQyO1xuICAgIHJldHVybiAoMip0MyAtIDMqdDIgKyAxKSpwMCArICh0MyAtIDIqdDIgKyB0KSp2MCArICgtMip0MyArIDMqdDIpKnAxICsgKHQzIC0gdDIpKnYxO1xufVxuXG4vKipcbiAqIEludGVycG9sYXRlIGJldHdlZW4gdHdvIHBvaW50cyB3aXRoIGxpbmVhciBzcGxpbmVcbiAqXG4gKiBAcGFyYW0gcDAge251bWJlcn0gLSBpbml0aWFsIHZhbHVlXG4gKiBAcGFyYW0gcDEge251bWJlcn0gLSBmaW5hbCB2YWx1ZVxuICogQHBhcmFtIHQge251bWJlcn0gLSBwb2ludCBvZiBpbnRlcnBvbGF0aW9uIChiZXR3ZWVuIDAgYW5kIDEpXG4gKiBAcGFyYW0gc2NhbGUge251bWJlcn0gLSBzY2FsZSBmYWN0b3IgdG8gbm9ybWFsaXplIHVuaXRzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIGludGVycG9sYXRlZCB2YWx1ZVxuICovXG5mdW5jdGlvbiBsaW5lYXIgKHAwLCBwMSwgdCwgc2NhbGUpIHtcbiAgICBzY2FsZSA9IHNjYWxlIHx8IDE7XG4gICAgcmV0dXJuIHAwICsgKHAxIC0gcDApKnQqc2NhbGU7XG59XG5cblN0YXJjb2Rlci5TZXJ2ZXJTeW5jID0gU3luY0NsaWVudDtcbm1vZHVsZS5leHBvcnRzID0gU3luY0NsaWVudDsiLCIvKipcbiAqIEJvb3QuanNcbiAqXG4gKiBCb290IHN0YXRlIGZvciBTdGFyY29kZXJcbiAqIExvYWQgYXNzZXRzIGZvciBwcmVsb2FkIHNjcmVlbiBhbmQgY29ubmVjdCB0byBzZXJ2ZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29udHJvbHMgPSByZXF1aXJlKCcuLi9waGFzZXJwbHVnaW5zL0NvbnRyb2xzLmpzJyk7XG52YXIgU3luY0NsaWVudCA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvU3luY0NsaWVudC5qcycpO1xuXG52YXIgQm9vdCA9IGZ1bmN0aW9uICgpIHt9O1xuXG5Cb290LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG5Cb290LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJvb3Q7XG5cbnZhciBfY29ubmVjdGVkID0gZmFsc2U7XG5cbi8qKlxuICogU2V0IHByb3BlcnRpZXMgdGhhdCByZXF1aXJlIGJvb3RlZCBnYW1lIHN0YXRlLCBhdHRhY2ggcGx1Z2lucywgY29ubmVjdCB0byBnYW1lIHNlcnZlclxuICovXG5Cb290LnByb3RvdHlwZS5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIC8vdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkU7XG4gICAgdGhpcy5nYW1lLnJlbmRlcmVyLnJlbmRlclNlc3Npb24ucm91bmRQaXhlbHMgPSB0cnVlO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcFNjYWxlID0gdGhpcy5zdGFyY29kZXIuY29uZmlnLnBoeXNpY3NTY2FsZTtcbiAgICB2YXIgaXBTY2FsZSA9IDEvcFNjYWxlO1xuICAgIHZhciBmbG9vciA9IE1hdGguZmxvb3I7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuY29uZmlnID0ge1xuICAgICAgICBweG06IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gaXBTY2FsZSphO1xuICAgICAgICB9LFxuICAgICAgICBtcHg6IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gZmxvb3IocFNjYWxlKmEpO1xuICAgICAgICB9LFxuICAgICAgICBweG1pOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIC1pcFNjYWxlKmE7XG4gICAgICAgIH0sXG4gICAgICAgIG1weGk6IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gZmxvb3IoLXBTY2FsZSphKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy90aGlzLnN0YXJjb2Rlci5jb250cm9scyA9IHRoaXMuZ2FtZS5wbHVnaW5zLmFkZChDb250cm9scyxcbiAgICAvLyAgICB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oQ29udHJvbHMsIHRoaXMuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICAvLyBTZXQgdXAgc29ja2V0LmlvIGNvbm5lY3Rpb25cbiAgICB0aGlzLnN0YXJjb2Rlci5zb2NrZXQgPSB0aGlzLnN0YXJjb2Rlci5pbyh0aGlzLnN0YXJjb2Rlci5jb25maWcuc2VydmVyVXJpLFxuICAgICAgICB0aGlzLnN0YXJjb2Rlci5jb25maWcuaW9DbGllbnRPcHRpb25zKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zb2NrZXQub24oJ3NlcnZlciByZWFkeScsIGZ1bmN0aW9uIChwbGF5ZXJNc2cpIHtcbiAgICAgICAgLy8gRklYTUU6IEhhcyB0byBpbnRlcmFjdCB3aXRoIHNlc3Npb24gZm9yIGF1dGhlbnRpY2F0aW9uIGV0Yy5cbiAgICAgICAgc2VsZi5zdGFyY29kZXIucGxheWVyID0gcGxheWVyTXNnO1xuICAgICAgICAvL3NlbGYuc3RhcmNvZGVyLnN5bmNjbGllbnQgPSBzZWxmLmdhbWUucGx1Z2lucy5hZGQoU3luY0NsaWVudCxcbiAgICAgICAgLy8gICAgc2VsZi5zdGFyY29kZXIuc29ja2V0LCBzZWxmLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgICAgIHNlbGYuc3RhcmNvZGVyLnN5bmNjbGllbnQgPSBzZWxmLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oU3luY0NsaWVudCxcbiAgICAgICAgICAgIHNlbGYuc3RhcmNvZGVyLnNvY2tldCwgc2VsZi5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgICAgICBfY29ubmVjdGVkID0gdHJ1ZTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQWR2YW5jZSBnYW1lIHN0YXRlIG9uY2UgbmV0d29yayBjb25uZWN0aW9uIGlzIGVzdGFibGlzaGVkXG4gKi9cbkJvb3QucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoX2Nvbm5lY3RlZCkge1xuICAgICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ3NwYWNlJyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCb290OyIsIi8qKlxuICogU3BhY2UuanNcbiAqXG4gKiBNYWluIGdhbWUgc3RhdGUgZm9yIFN0YXJjb2RlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9TaW1wbGVQYXJ0aWNsZS5qcycpO1xudmFyIFRocnVzdEdlbmVyYXRvciA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9UaHJ1c3RHZW5lcmF0b3IuanMnKTtcbnZhciBNaW5pTWFwID0gcmVxdWlyZSgnLi4vcGhhc2VydWkvTWluaU1hcC5qcycpO1xudmFyIFRvYXN0ID0gcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1RvYXN0LmpzJyk7XG5cbnZhciBTcGFjZSA9IGZ1bmN0aW9uICgpIHt9O1xuXG5TcGFjZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuU3BhY2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3BhY2U7XG5cblNwYWNlLnByb3RvdHlwZS5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSh0aGlzLmdhbWUsIFRocnVzdEdlbmVyYXRvci50ZXh0dXJlS2V5LCAnI2ZmNjYwMCcsIDgpO1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSh0aGlzLmdhbWUsICdidWxsZXQnLCAnIzk5OTk5OScsIDQpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdwbGF5ZXJ0aHJ1c3QnLCAnYXNzZXRzL3NvdW5kcy90aHJ1c3RMb29wLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdjaGltZScsICdhc3NldHMvc291bmRzL2NoaW1lLm1wMycpO1xufTtcblxuU3BhY2UucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcm5nID0gdGhpcy5nYW1lLnJuZDtcbiAgICB2YXIgd2IgPSB0aGlzLnN0YXJjb2Rlci5jb25maWcud29ybGRCb3VuZHM7XG4gICAgdmFyIHBzID0gdGhpcy5zdGFyY29kZXIuY29uZmlnLnBoeXNpY3NTY2FsZTtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5QMkpTKTtcbiAgICB0aGlzLndvcmxkLnNldEJvdW5kcy5jYWxsKHRoaXMud29ybGQsIHdiWzBdKnBzLCB3YlsxXSpwcywgKHdiWzJdLXdiWzBdKSpwcywgKHdiWzNdLXdiWzFdKSpwcyk7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MucDIuc2V0Qm91bmRzVG9Xb3JsZCh0cnVlLCB0cnVlLCB0cnVlLCB0cnVlLCBmYWxzZSk7XG5cbiAgICAvLyBEZWJ1Z2dpbmdcbiAgICB0aGlzLmdhbWUudGltZS5hZHZhbmNlZFRpbWluZyA9IHRydWU7XG5cbiAgICB0aGlzLnN0YXJjb2Rlci5jb250cm9scy5yZXNldCgpO1xuXG4gICAgLy8gU291bmRzXG4gICAgdGhpcy5nYW1lLnNvdW5kcyA9IHt9O1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0ID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgncGxheWVydGhydXN0JywgMSwgdHJ1ZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5jaGltZSA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ2NoaW1lJywgMSwgZmFsc2UpO1xuXG4gICAgLy8gQmFja2dyb3VuZFxuICAgIHZhciBzdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwKTtcbiAgICBkcmF3U3RhckZpZWxkKHN0YXJmaWVsZC5jdHgsIDYwMCwgMTYpO1xuICAgIHRoaXMuZ2FtZS5hZGQudGlsZVNwcml0ZSh3YlswXSpwcywgd2JbMV0qcHMsICh3YlsyXS13YlswXSkqcHMsICh3YlszXS13YlsxXSkqcHMsIHN0YXJmaWVsZCk7XG5cbiAgICB0aGlzLnN0YXJjb2Rlci5zeW5jY2xpZW50LnN0YXJ0KCk7XG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0LmVtaXQoJ2NsaWVudCByZWFkeScpO1xuICAgIHRoaXMuX3NldHVwTWVzc2FnZUhhbmRsZXJzKHRoaXMuc3RhcmNvZGVyLnNvY2tldCk7XG5cbiAgICAvLyBHcm91cHMgZm9yIHBhcnRpY2xlIGVmZmVjdHNcbiAgICB0aGlzLmdhbWUudGhydXN0Z2VuZXJhdG9yID0gbmV3IFRocnVzdEdlbmVyYXRvcih0aGlzLmdhbWUpO1xuXG4gICAgLy8gR3JvdXAgZm9yIGdhbWUgb2JqZWN0c1xuICAgIHRoaXMuZ2FtZS5wbGF5ZmllbGQgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAvLyBVSVxuICAgIHRoaXMuZ2FtZS51aSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLmdhbWUudWkuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG5cbiAgICAvLyBJbnZlbnRvcnlcbiAgICB2YXIgbGFiZWwgPSB0aGlzLmdhbWUubWFrZS50ZXh0KDE3MDAsIDI1LCAnSU5WRU5UT1JZJywge2ZvbnQ6ICcyNHB4IEFyaWFsJywgZmlsbDogJyNmZjk5MDAnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICBsYWJlbC5hbmNob3Iuc2V0VG8oMC41KTtcbiAgICB0aGlzLmdhbWUudWkuYWRkKGxhYmVsKTtcbiAgICB0aGlzLmdhbWUuaW52ZW50b3J5dGV4dCA9IHRoaXMuZ2FtZS5tYWtlLnRleHQoMTcwMCwgNTAsICcwIGNyeXN0YWxzJyxcbiAgICAgICAge2ZvbnQ6ICcyNHB4IEFyaWFsJywgZmlsbDogJyNjY2MwMDAnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICB0aGlzLmdhbWUuaW52ZW50b3J5dGV4dC5hbmNob3Iuc2V0VG8oMC41KTtcbiAgICB0aGlzLmdhbWUudWkuYWRkKHRoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0KTtcblxuICAgIC8vTWluaU1hcFxuICAgIHRoaXMuZ2FtZS5taW5pbWFwID0gbmV3IE1pbmlNYXAodGhpcy5nYW1lLCAzMDAsIDMwMCk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZCh0aGlzLmdhbWUubWluaW1hcCk7XG4gICAgdGhpcy5nYW1lLnggPSAxMDtcbiAgICB0aGlzLmdhbWUueSA9IDEwO1xuXG4gICAgLy8gSGVscGVyc1xuICAgIGZ1bmN0aW9uIHJhbmRvbU5vcm1hbCAoKSB7XG4gICAgICAgIHZhciB0ID0gMDtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPDY7IGkrKykge1xuICAgICAgICAgICAgdCArPSBybmcubm9ybWFsKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQvNjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3U3RhciAoY3R4LCB4LCB5LCBkLCBjb2xvcikge1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgubW92ZVRvKHgtZCsxLCB5LWQrMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeCtkLTEsIHkrZC0xKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LWQrMSwgeStkLTEpO1xuICAgICAgICBjdHgubGluZVRvKHgrZC0xLCB5LWQrMSk7XG4gICAgICAgIGN0eC5tb3ZlVG8oeCwgeS1kKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4LCB5K2QpO1xuICAgICAgICBjdHgubW92ZVRvKHgtZCwgeSk7XG4gICAgICAgIGN0eC5saW5lVG8oeCtkLCB5KTtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdTdGFyRmllbGQgKGN0eCwgc2l6ZSwgbikge1xuICAgICAgICB2YXIgeG0gPSBNYXRoLnJvdW5kKHNpemUvMiArIHJhbmRvbU5vcm1hbCgpKnNpemUvNCk7XG4gICAgICAgIHZhciB5bSA9IE1hdGgucm91bmQoc2l6ZS8yICsgcmFuZG9tTm9ybWFsKCkqc2l6ZS80KTtcbiAgICAgICAgdmFyIHF1YWRzID0gW1swLDAseG0tMSx5bS0xXSwgW3htLDAsc2l6ZS0xLHltLTFdLFxuICAgICAgICAgICAgWzAseW0seG0tMSxzaXplLTFdLCBbeG0seW0sc2l6ZS0xLHNpemUtMV1dO1xuICAgICAgICB2YXIgY29sb3I7XG4gICAgICAgIHZhciBpLCBqLCBsLCBxO1xuXG4gICAgICAgIG4gPSBNYXRoLnJvdW5kKG4vNCk7XG4gICAgICAgIGZvciAoaT0wLCBsPXF1YWRzLmxlbmd0aDsgaTxsOyBpKyspIHtcbiAgICAgICAgICAgIHEgPSBxdWFkc1tpXTtcbiAgICAgICAgICAgIGZvciAoaj0wOyBqPG47IGorKykge1xuICAgICAgICAgICAgICAgIGNvbG9yID0gJ2hzbCg2MCwxMDAlLCcgKyBybmcuYmV0d2Vlbig5MCw5OSkgKyAnJSknO1xuICAgICAgICAgICAgICAgIGRyYXdTdGFyKGN0eCxcbiAgICAgICAgICAgICAgICAgICAgcm5nLmJldHdlZW4ocVswXSs3LCBxWzJdLTcpLCBybmcuYmV0d2VlbihxWzFdKzcsIHFbM10tNyksXG4gICAgICAgICAgICAgICAgICAgIHJuZy5iZXR3ZWVuKDIsNCksIGNvbG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufTtcblxuU3BhY2UucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBGSVhNRToganVzdCBhIG1lc3MgZm9yIHRlc3RpbmdcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMucHJvY2Vzc1F1ZXVlKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgIGlmIChhLnR5cGUgPT09ICd1cF9wcmVzc2VkJykge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnBsYXllclNoaXAubG9jYWxTdGF0ZS50aHJ1c3QgPSAnc3RhcnRpbmcnO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUuc291bmRzLnBsYXllcnRocnVzdC5wbGF5KCk7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RhcnRPbihzZWxmLmdhbWUucGxheWVyU2hpcCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYS50eXBlID09PSAndXBfcmVsZWFzZWQnKSB7XG4gICAgICAgICAgICBzZWxmLmdhbWUucGxheWVyU2hpcC5sb2NhbFN0YXRlLnRocnVzdCA9ICdzaHV0ZG93bic7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnN0b3AoKTtcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnRocnVzdGdlbmVyYXRvci5zdG9wT24oc2VsZi5nYW1lLnBsYXllclNoaXApO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5TcGFjZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIC8vY29uc29sZS5sb2coJytyZW5kZXIrJyk7XG4gICAgLy9pZiAodGhpcy5zdGFyY29kZXIudGVtcHNwcml0ZSkge1xuICAgIC8vICAgIHZhciBkID0gdGhpcy5zdGFyY29kZXIudGVtcHNwcml0ZS5wb3NpdGlvbi54IC0gdGhpcy5zdGFyY29kZXIudGVtcHNwcml0ZS5wcmV2aW91c1Bvc2l0aW9uLng7XG4gICAgLy8gICAgY29uc29sZS5sb2coJ0RlbHRhJywgZCwgdGhpcy5nYW1lLnRpbWUuZWxhcHNlZCwgZCAvIHRoaXMuZ2FtZS50aW1lLmVsYXBzZWQpO1xuICAgIC8vfVxuICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyk7XG4gICAgdGhpcy5nYW1lLmRlYnVnLnRleHQoJ0ZwczogJyArIHRoaXMuZ2FtZS50aW1lLmZwcywgNSwgMjApO1xuICAgIC8vdGhpcy5nYW1lLmRlYnVnLmNhbWVyYUluZm8odGhpcy5nYW1lLmNhbWVyYSwgMTAwLCAyMCk7XG4gICAgLy9pZiAodGhpcy5zaGlwKSB7XG4gICAgLy8gICAgdGhpcy5nYW1lLmRlYnVnLnNwcml0ZUluZm8odGhpcy5zaGlwLCA0MjAsIDIwKTtcbiAgICAvL31cbn07XG5cblNwYWNlLnByb3RvdHlwZS5fc2V0dXBNZXNzYWdlSGFuZGxlcnMgPSBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNvY2tldC5vbignbXNnIGNyeXN0YWwgcGlja3VwJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBzZWxmLmdhbWUuc291bmRzLmNoaW1lLnBsYXkoKTtcbiAgICAgICAgVG9hc3Quc3BpblVwKHNlbGYuZ2FtZSwgc2VsZi5nYW1lLnBsYXllclNoaXAueCwgc2VsZi5nYW1lLnBsYXllclNoaXAueSwgJysnICsgdmFsICsgJyBjcnlzdGFscyEnKTtcbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3BhY2U7XG4iLCIvKipcbiAqIE1pbmlNYXAuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTWluaU1hcCA9IGZ1bmN0aW9uIChnYW1lLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICB2YXIgeHIgPSB3aWR0aCAvIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyV2lkdGg7XG4gICAgdmFyIHlyID0gaGVpZ2h0IC8gdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJIZWlnaHQ7XG4gICAgaWYgKHhyIDw9IHlyKSB7XG4gICAgICAgIHRoaXMubWFwU2NhbGUgPSB4cjtcbiAgICAgICAgdGhpcy54T2Zmc2V0ID0gLXhyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJMZWZ0O1xuICAgICAgICB0aGlzLnlPZmZzZXQgPSAteHIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlclRvcCArIChoZWlnaHQgLSB4ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VySGVpZ2h0KSAvIDI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tYXBTY2FsZSA9IHlyO1xuICAgICAgICB0aGlzLnlPZmZzZXQgPSAteXIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlclRvcDtcbiAgICAgICAgdGhpcy54T2Zmc2V0ID0gLXlyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJMZWZ0ICsgKHdpZHRoIC0geXIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlcldpZHRoKSAvIDI7XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaGljcyA9IGdhbWUubWFrZS5ncmFwaGljcygwLCAwKTtcbiAgICB0aGlzLmdyYXBoaWNzLmJlZ2luRmlsbCgweDAwZmYwMCwgMC4yKTtcbiAgICB0aGlzLmdyYXBoaWNzLmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIHRoaXMuZ3JhcGhpY3MuZW5kRmlsbCgpO1xuICAgIHRoaXMuZ3JhcGhpY3MuY2FjaGVBc0JpdG1hcCA9IHRydWU7XG4gICAgdGhpcy5hZGQodGhpcy5ncmFwaGljcyk7XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5NaW5pTWFwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1pbmlNYXA7XG5cbk1pbmlNYXAucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL3RoaXMudGV4dHVyZS5yZW5kZXJYWSh0aGlzLmdyYXBoaWNzLCAwLCAwLCB0cnVlKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuZ2FtZS5wbGF5ZmllbGQuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBib2R5ID0gdGhpcy5nYW1lLnBsYXlmaWVsZC5jaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKCFib2R5Lm1pbmlzcHJpdGUpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGJvZHkubWluaXNwcml0ZS54ID0gdGhpcy53b3JsZFRvTW1YKGJvZHkueCk7XG4gICAgICAgIGJvZHkubWluaXNwcml0ZS55ID0gdGhpcy53b3JsZFRvTW1ZKGJvZHkueSk7XG4gICAgICAgIGJvZHkubWluaXNwcml0ZS5hbmdsZSA9IGJvZHkuYW5nbGU7XG4gICAgLy8gICAgdmFyIHggPSAxMDAgKyBib2R5LnggLyA0MDtcbiAgICAvLyAgICB2YXIgeSA9IDEwMCArIGJvZHkueSAvIDQwO1xuICAgIC8vICAgIHRoaXMudGV4dHVyZS5yZW5kZXJYWShib2R5LmdyYXBoaWNzLCB4LCB5LCBmYWxzZSk7XG4gICAgfVxufTtcblxuTWluaU1hcC5wcm90b3R5cGUud29ybGRUb01tWCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIHggKiB0aGlzLm1hcFNjYWxlICsgdGhpcy54T2Zmc2V0O1xufTtcblxuTWluaU1hcC5wcm90b3R5cGUud29ybGRUb01tWSA9IGZ1bmN0aW9uICh5KSB7XG4gICAgcmV0dXJuIHkgKiB0aGlzLm1hcFNjYWxlICsgdGhpcy55T2Zmc2V0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNaW5pTWFwOyJdfQ==
