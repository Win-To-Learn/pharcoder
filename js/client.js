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
var DOMInterface = require('./client-components/DOMInterface.js');
var CodeEndpointClient = require('./client-components/CodeEndpointClient.js');
var Starfield = require('./client-components/Starfield.js');
var LeaderBoardClient = require('./client-components/LeaderBoardClient.js');
var FlexTextWrapper = require('./client-components/FlexTextWrapper.js');

var states = {
    boot: require('./phaserstates/Boot.js'),
    space: require('./phaserstates/Space.js'),
    login: require('./phaserstates/Login.js'),
    loader: require('./phaserstates/Loader.js')
};

Starcoder.prototype.init = function () {
    this.io = io;
    this.game = new Phaser.Game('100%', '100%', Phaser.AUTO, 'main');
    //this.game = new Phaser.Game(1800, 950, Phaser.CANVAS, 'main');
    this.game.forceSingleUpdate = true;
    this.game.starcoder = this;
    for (var k in states) {
        var state = new states[k]();
        state.starcoder = this;
        this.game.state.add(k, state);
    }
    this.onConnectCB = [];
    this.playerMap = {};
    this.cmdQueue = [];
    this.connected = false;
    this.lastNetError = null;
    this.implementFeature(WorldApi);
    this.implementFeature(CodeEndpointClient);
    this.implementFeature(Starfield);
    this.implementFeature(LeaderBoardClient);
    this.implementFeature(DOMInterface);
    this.implementFeature(FlexTextWrapper);
};

Starcoder.prototype.serverConnect = function () {
    var self = this;
    if (!this.socket) {
        delete this.socket;
        this.connected = false;
        this.lastNetError = null;
    }
    var serverUri = this.config.serverUri;
    if (!serverUri) {
        var protocol = this.config.serverProtol || window.location.protocol;
        var port = this.config.serverPort || '8080';
        serverUri = protocol + '//' + window.location.hostname + ':' + port;
    }
    this.socket = this.io(serverUri, this.config.ioClientOptions);
    this.socket.on('connect', function () {
      console.log('socket connected');
        self.connected = true;
        self.lastNetError = null;
        for (var i = 0, l = self.onConnectCB.length; i < l; i++) {
            self.onConnectCB[i].bind(self, self.socket)();
        }
    });
    this.socket.on('error', function (data) {
      console.log('socket error');
      console.log(data);
        this.lastNetError = data;
    });
};

Starcoder.prototype.serverLogin = function (username, password) {
    var login = {};
    if (!password) {
        // Guest login
        login.gamertag = username;
    } else {
        login.username = username;
        login.password = password;
    }
    this.socket.emit('login', login);
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

Starcoder.prototype.banner = function () {
    console.log('Starcoder client v' + this.config.version, 'built on', this.config.buildTime);
};

Starcoder.prototype.role = 'Client';

module.exports = Starcoder;

},{"./Starcoder.js":3,"./client-components/CodeEndpointClient.js":4,"./client-components/DOMInterface.js":5,"./client-components/FlexTextWrapper.js":6,"./client-components/LeaderBoardClient.js":7,"./client-components/Starfield.js":8,"./client-components/WorldApi.js":9,"./phaserstates/Boot.js":31,"./phaserstates/Loader.js":32,"./phaserstates/Login.js":33,"./phaserstates/Space.js":34}],3:[function(require,module,exports){
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
    serverUri: process.env.SERVER_URI || 'http://localhost:8080',
    //serverAddress: '127.0.0.1',
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
    gamerTags: {
        1: [
            'super',
            'awesome',
            'rainbow',
            'double',
            'triple',
            'vampire',
            'princess',
            'ice',
            'fire',
            'robot',
            'werewolf',
            'sparkle',
            'infinite',
            'cool',
            'yolo',
            'swaggy',
            'zombie',
            'samurai',
            'dancing',
            'power',
            'gold',
            'silver',
            'radioactive',
            'quantum',
            'brilliant',
            'mighty',
            'random'
        ],
        2: [
            'tiger',
            'ninja',
            'princess',
            'robot',
            'pony',
            'dancer',
            'rocker',
            'master',
            'hacker',
            'rainbow',
            'kitten',
            'puppy',
            'boss',
            'wizard',
            'hero',
            'dragon',
            'tribute',
            'genius',
            'blaster',
            'spider'
        ]
    },
    initialBodies: [
        {type: 'Asteroid', number: 25, config: {
            position: {random: 'world'},
            velocity: {random: 'vector', lo: -15, hi: 15},
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
        //{type: 'StarTarget', number: 10, config: {
        //    position: {random: 'world', pad: 30},
        //    vectorScale: 0.5,
        //    stars: [[0, 0], [1,1], [-1,1], [1,-1]]
        //}}
        // FIXME: Trees just for testing
        //{type: 'Tree', number: 10, config: {
        //    position: {random: 'world', pad: 30},
        //    vectorScale: 1,
        //    mass: 5
        //}}
    ]
};

var Starcoder = function () {
    // Initializers virtualized according to role
    var configs = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    this.config = {};
    for (var i = 0, l = configs.length; i < l; i++) {
        this.extendConfig(configs[i]);
    }
    // HACK
    this.extendConfig(config);
    this.banner();
    this.init.apply(this, args);
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

/**
 * Lightweight component implementation, more for logical than functional modularity
 *
 * @param mixin {object} - POJO with methods / properties to be added to prototype, with optional init method
 */
Starcoder.prototype.implementFeature = function (mixin) {
    for (var prop in mixin) {
        switch (prop) {
            case 'onConnectCB':
            case 'onReadyCB':
            case 'onLoginCB':
            case 'onDisconnectCB':
                this[prop].push(mixin[prop]);
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
 * CodeEndpointClient.js
 *
 * Methods for sending code to server and dealing with code related responses
 */
'use strict';

module.exports = {
    sendCode: function (code) {
        this.socket.emit('code', code);
    }
};
},{}],5:[function(require,module,exports){
/**
 * DOMInterface.js
 *
 * Handle DOM configuration/interaction, i.e. non-Phaser stuff
 */
'use strict';

module.exports = {
    init: function () {
        var self = this;
        this.dom = {};              // namespace
        this.dom.codeButton = $('#code-btn');
        this.dom.codePopup = $('#code-popup');
        this.dom.loginPopup= $('#login');
        this.dom.loginButton = $('#submit');

        this.dom.codeButton.on('click', function () {
            self.dom.codePopup.toggle('slow');
        });

        $(window).on('message', function (event) {
            if (event.originalEvent.source === self.dom.codePopup[0].contentWindow) {
                self.sendCode(event.originalEvent.data);
            }
        });

        //this.dom.codePopup.hide();
        for (var i = 1; i <= 2; i++) {
            var tags = this.config.gamerTags[i];
            for (var j = 0, l = tags.length; j < l; j++) {
                $('#gt' + i).append('<option>' + tags[j] + '</option>');
            }
        }
        $('.select').selectmenu();
        $('.loginbutton').button({icons: {primary: 'ui-icon-triangle-1-e'}});

        $('.accordion').accordion({heightStyle: 'content'});
        $('.hidden').hide();

    },

    layoutDOMSpaceState: function () {
        $('#code-btn').show().position({my: 'left bottom', at: 'left bottom', of: '#main'});
        $('#code-popup').position({my: 'center', at: 'center', of: window});
    },

    showLogin: function () {
        var self = this;
        $('#login-window .message').hide();
        $('#login-window').show().position({my: 'center', at: 'center', of: window});
        $('#userlogin').on('click', function () {
            self.serverLogin($('#username').val(), $('#password').val());
        });
        $('#guestlogin').on('click', function () {
            self.serverLogin($('#gt1').val() + ' ' + $('#gt2').val());
        });
    },

    setLoginError: function (error) {
        var msg = $('#login-window .message');
        if (!error) {
            msg.hide();
        } else {
            msg.html(error);
            msg.show();
        }
    },

    hideLogin: function () {
        $('#login-window').hide();
    }
};
},{}],6:[function(require,module,exports){
/**
 * FlexTextWrapper.js
 *
 * Thin convenience wrapper around Phaser text methods
 */

module.exports = {
    makeFlexText: function (x, y, text, style) {
        if (style.bitmap) {
            var t = this.game.make.bitmapText(x, y, style.bitmap, style.size, style.align);
        } else {
            t = this.game.make.text(x, y, text, style);
        }
        return t;
    },

    addFlexText: function (x, y, text, style, group) {
        var t = this.makeFlexText(x, y, text, style);
        group = group || this.world;
        group.add(t);
        return t;
    }
};
},{}],7:[function(require,module,exports){
/**
 * LeaderBoardClient.js
 */
'use strict';

module.exports = {
    init: function () {
        this.leaderBoard = {};
        this.leaderBoardCats = [];
        this.leaderBoardState = null;
    },

    onConnectCB: function (socket) {
        var self = this;
        socket.on('leaderboard', function (lb) {
            for (var cat in lb) {
                // Record new category
                if (!(cat in self.leaderBoard)) {
                    self.leaderBoardCats.push(cat);
                }
                // Start cycling if this is first category
                if (self.leaderBoardState === null) {
                    self.leaderBoardState = 0;
                    self.game.leaderboard.visible = true;
                    setInterval(self.cycleLeaderBoard.bind(self), self.config.leaderBoardClientCycle || 5000);
                }
                // Display if updated board is showing
                if (self.leaderBoardCats[self.leaderBoardState] === cat) {
                    self.game.leaderboard.setContent(cat, lb[cat], self.player.id);
                }

                self.leaderBoard[cat] = lb[cat];
            }
        })
    },

    cycleLeaderBoard: function () {
        this.leaderBoardState = (this.leaderBoardState + 1) % this.leaderBoardCats.length;
        var cat = this.leaderBoardCats[this.leaderBoardState];
        this.game.leaderboard.setContent(cat, this.leaderBoard[cat], this.player.id);
    }
};
},{}],8:[function(require,module,exports){
/**
 * Method for drawing starfields
 */
'use strict';

module.exports = {
    randomNormal: function () {
        var t = 0;
        for (var i=0; i<6; i++) {
            t += this.game.rnd.normal();
        }
        return t/6;
    },

    drawStar: function (ctx, x, y, d, color) {
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
    },

    drawStarField: function (ctx, size, n) {
        var xm = Math.round(size/2 + this.randomNormal()*size/4);
        var ym = Math.round(size/2 + this.randomNormal()*size/4);
        var quads = [[0,0,xm-1,ym-1], [xm,0,size-1,ym-1],
            [0,ym,xm-1,size-1], [xm,ym,size-1,size-1]];
        var color;
        var i, j, l, q;

        n = Math.round(n/4);
        for (i=0, l=quads.length; i<l; i++) {
            q = quads[i];
            for (j=0; j<n; j++) {
                color = 'hsl(60,100%,' + this.game.rnd.between(90,99) + '%)';
                this.drawStar(ctx,
                    this.game.rnd.between(q[0]+7, q[2]-7), this.game.rnd.between(q[1]+7, q[3]-7),
                    this.game.rnd.between(2,4), color);
            }
        }
    }
};
},{}],9:[function(require,module,exports){
/**
 * WorldApi.js
 *
 * Add/remove/manipulate bodies in client's physics world
 */
'use strict';

module.exports = {
    /**
     * Add body to world on client side
     *
     * @param type {string} - type name of object to add
     * @param config {object} - properties for new object
     * @returns {Phaser.Sprite} - newly added object
     */
    addBody: function (type, config) {
        var ctor = bodyTypes[type];
        var playerShip = false;
        if (!ctor) {
            this.log('Unknown body type:', type);
            this.log(config);
            return;
        }
        if (type === 'Ship' && config.properties.playerid === this.player.id) {
            //config.tag = this.player.username;
            //if (config.properties.playerid === this.player.id) {
            // Only the player's own ship is treated as dynamic in the local physics sim
            config.mass = this.config.shipMass;
            playerShip = true;
            //}
        }
        var body = new ctor(this.game, config);
        if (type === 'Ship') {
            this.playerMap[config.properties.playerid] = body;
        }
        //this.game.add.existing(body);
        this.game.playfield.add(body);
        if (playerShip) {
            this.game.camera.follow(body);
            this.game.playerShip = body;
        }
        return body;
    },

    removeBody: function (sprite) {
        //sprite.kill();
        sprite.destroy();
        // Remove minisprite
        if (sprite.minisprite) {
            //sprite.minisprite.kill();
            sprite.minisprite.destroy();
        }
        //this.game.physics.p2.removeBody(sprite.body);
    }
};

var bodyTypes = {
    Ship: require('../phaserbodies/Ship.js'),
    Asteroid: require('../phaserbodies/Asteroid.js'),
    Crystal: require('../phaserbodies/Crystal.js'),
    Bullet: require('../phaserbodies/Bullet.js'),
    GenericOrb: require('../phaserbodies/GenericOrb.js'),
    Planetoid: require('../phaserbodies/Planetoid.js'),
    Tree: require('../phaserbodies/Tree.js'),
    TractorBeam: require('../phaserbodies/TractorBeam.js'),
    StarTarget: require('../phaserbodies/StarTarget.js')
};


},{"../phaserbodies/Asteroid.js":15,"../phaserbodies/Bullet.js":16,"../phaserbodies/Crystal.js":17,"../phaserbodies/GenericOrb.js":18,"../phaserbodies/Planetoid.js":19,"../phaserbodies/Ship.js":20,"../phaserbodies/StarTarget.js":22,"../phaserbodies/TractorBeam.js":26,"../phaserbodies/Tree.js":27}],10:[function(require,module,exports){
/** client.js
 *
 * Main entry point for Starcoder game client
 *
 * @type {Starcoder|exports}
 */
'use strict';

//require('./BlocklyCustom.js');

var commonConfig = require('./common/config.js');
var clientConfig = require('./client/config.js');
var buildConfig = buildConfig || {};

var Starcoder = require('./Starcoder-client.js');



buildConfig.buildTime = "Mon Sep 07 2015 14:43:33 GMT-0400 (EDT)";

//localStorage.debug = '';                        // used to toggle socket.io debugging

//document.addEventListener('DOMContentLoaded', function () {
//    var starcoder = new Starcoder();
//    starcoder.start();
//});

// test

$(function () {
    var starcoder = new Starcoder([commonConfig, clientConfig, buildConfig]);
    starcoder.start();
});

},{"./Starcoder-client.js":2,"./client/config.js":11,"./common/config.js":14}],11:[function(require,module,exports){
/**
 * config.js
 *
 * client side config
 */

module.exports = {
    ioClientOptions: {
        //forceNew: true
        reconnection: false
    },
    fonts: {
        hudCode: {font: '26px Arial', fill: '#00ffff', align: 'center'},
        leaderBoard: {font: '18px Arial', fill: '#0000ff'},
        leaderBoardTitle: {font: 'bold 20px Arial', align: 'center', fill: '#ff0000'}
    },
    gamerTags: {
        1: [
            'super',
            'awesome',
            'rainbow',
            'double',
            'triple',
            'vampire',
            'princess',
            'ice',
            'fire',
            'robot',
            'werewolf',
            'sparkle',
            'infinite',
            'cool',
            'yolo',
            'swaggy',
            'zombie',
            'samurai',
            'dancing',
            'power',
            'gold',
            'silver',
            'radioactive',
            'quantum',
            'brilliant',
            'mighty',
            'random'
        ],
        2: [
            'tiger',
            'ninja',
            'princess',
            'robot',
            'pony',
            'dancer',
            'rocker',
            'master',
            'hacker',
            'rainbow',
            'kitten',
            'puppy',
            'boss',
            'wizard',
            'hero',
            'dragon',
            'tribute',
            'genius',
            'blaster',
            'spider'
        ]
    }
};
},{}],12:[function(require,module,exports){
/**
 * Path.js
 *
 * Vector paths shared by multiple elements
 */
'use strict';

var PI = Math.PI;
var TAU = 2*PI;
var sin = Math.sin;
var cos = Math.cos;

exports.normalize = function (path, scale, x, y, close) {
    path = path.slice();
    var output = [];
    if (close) {
        path.push(path[0]);
    }
    for (var i = 0, l = path.length; i < l; i++) {
        var o = {x: path[i][0] * scale + x, y: path[i][1] * scale + y};
        output.push(o);
    }
    return output;
};

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

exports.star = [
    [sin(0), cos(0)],
    [sin(2*TAU/5), cos(2*TAU/5)],
    [sin(4*TAU/5), cos(4*TAU/5)],
    [sin(TAU/5), cos(TAU/5)],
    [sin(3*TAU/5), cos(3*TAU/5)]
];

exports.OCTRADIUS = Math.sqrt(5);
},{}],13:[function(require,module,exports){
/**
 * UpdateProperties.js
 *
 * Client/server syncable properties for game objects
 */
'use strict';

var Ship = function () {};
Ship.prototype.updateProperties = ['lineWidth', 'lineColor', 'fillColor', 'fillAlpha',
    'vectorScale', 'shape', 'shapeClosed', 'playerid', 'crystals', 'dead', 'tag', 'charge', 'trees'];

var Asteroid = function () {};
Asteroid.prototype.updateProperties = ['vectorScale'];

var Crystal = function () {};
Crystal.prototype.updateProperties = ['vectorScale'];

var GenericOrb = function () {};
GenericOrb.prototype.updateProperties = ['lineColor', 'vectorScale'];

var Planetoid = function () {};
Planetoid.prototype.updateProperties = ['lineColor', 'fillColor', 'lineWidth', 'fillAlpha', 'vectorScale', 'owner'];

var Tree = function () {};
Tree.prototype.updateProperties = ['vectorScale', 'lineColor', 'graph', 'step', 'depth'];

var Bullet = function () {};
Bullet.prototype.updateProperties = ['lineColor'];

var TractorBeam = function () {};
TractorBeam.prototype.updateProperties = [];

var StarTarget = function () {};
StarTarget.prototype.updateProperties = ['stars', 'lineColor', 'vectorScale'];


exports.Ship = Ship;
exports.Asteroid = Asteroid;
exports.Crystal = Crystal;
exports.GenericOrb = GenericOrb;
exports.Bullet = Bullet;
exports.Planetoid = Planetoid;
exports.Tree = Tree;
exports.TractorBeam = TractorBeam;
exports.StarTarget = StarTarget;

},{}],14:[function(require,module,exports){
/**
 * config.js
 *
 * common config
 */

module.exports = {
    version: '0.1',
    //serverUri: 'http://pharcoder-single-1.elasticbeanstalk.com:8080',
    //serverUri: 'http://localhost:8081',
    //serverAddress: '1.2.3.4',
    worldBounds: [-200, -200, 200, 200],
    physicsScale: 20,
    renderLatency: 100,
    frameRate: (1 / 60),
    timeSyncFreq: 10,
    shipMass: 100           // Stopgap pending physics refactor
};
},{}],15:[function(require,module,exports){
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
Asteroid.prototype._fillColor = '#ff0000';
Asteroid.prototype._shapeClosed = true;
Asteroid.prototype._lineWidth = 1;
Asteroid.prototype._fillAlpha = 0.25;
Asteroid.prototype._shape = Paths.octagon;

module.exports = Asteroid;
//Starcoder.Asteroid = Asteroid;

},{"../Starcoder.js":3,"../common/Paths.js":12,"../common/UpdateProperties.js":13,"./SyncBodyInterface.js":23,"./VectorSprite.js":28}],16:[function(require,module,exports){
/**
 * Bullet.js
 *
 * Client side implementation of simple projectile
 */
'use strict';

var Starcoder = require('../Starcoder.js');

//var SimpleParticle = require('./SimpleParticle.js');
var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var UpdateProperties = require('../common/UpdateProperties.js').Bullet;

var Bullet = function (game, config) {
    VectorSprite.call(this, game, config);
    //this.setPosAngle(config.x, config.y, config.a);
};

Bullet.prototype = Object.create(VectorSprite.prototype);
Bullet.prototype.constructor = Bullet;

Starcoder.mixinPrototype(Bullet.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(Bullet.prototype, UpdateProperties.prototype);

Bullet.prototype.visibleOnMap = false;
Bullet.prototype.sharedTextureKey = 'laser';

Bullet.prototype.drawProcedure = function (renderScale, frame) {
    var scale = this.game.physics.p2.mpxi(this.vectorScale) * renderScale;
    this.graphics.lineStyle(4, Phaser.Color.hexToRGB(this.lineColor), 1);
    this.graphics.moveTo(0, 0);
    this.graphics.lineTo(0, 1 * scale);
    this.graphics.lineStyle(2, 0xffffff, 0.25);
    this.graphics.moveTo(0, 0);
    this.graphics.lineTo(0, 1 * scale);
};

module.exports = Bullet;
},{"../Starcoder.js":3,"../common/UpdateProperties.js":13,"./SyncBodyInterface.js":23,"./VectorSprite.js":28}],17:[function(require,module,exports){
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

},{"../Starcoder.js":3,"../common/Paths.js":12,"../common/UpdateProperties.js":13,"./SyncBodyInterface.js":23,"./VectorSprite.js":28}],18:[function(require,module,exports){
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

},{"../Starcoder.js":3,"../common/Paths.js":12,"../common/UpdateProperties.js":13,"./SyncBodyInterface.js":23,"./VectorSprite.js":28}],19:[function(require,module,exports){
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

},{"../Starcoder.js":3,"../common/Paths.js":12,"../common/UpdateProperties.js":13,"./SyncBodyInterface.js":23,"./VectorSprite.js":28}],20:[function(require,module,exports){
/**
 * Ship.js
 *
 * Client side implementation
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
        this.tag, {font: 'bold 18px Arial', fill: this.lineColor || '#ffffff', align: 'center'});
    this.tagText.anchor.setTo(0.5, 0);
    this.addChild(this.tagText);
    this.localState = {
        thrust: 'off'
    }
    this.game.hud.setLaserColor(this.lineColor);
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

Ship.prototype.mapFactor = 3;

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

Ship.prototype.updateTextures = function () {
    // FIXME: Probably need to refactor constructor a bit to make this cleaner
    VectorSprite.prototype.updateTextures.call(this);
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
    if (this.game.playerShip === this) {
        //this.game.inventorytext.setText(this.crystals.toString());
        this.game.hud.setCrystals(this.crystals);
        this.game.hud.setCharge(this.charge);
        this.game.hud.setTrees(this.trees);
    }
};

Object.defineProperty(VectorSprite.prototype, 'tag', {
    get: function () {
        return this._tag;
    },
    set: function (val) {
        this._tag = val;
        this._dirty = true;
    }
});

module.exports = Ship;
//Starcoder.Ship = Ship;

},{"../Starcoder.js":3,"../common/UpdateProperties.js":13,"./SyncBodyInterface.js":23,"./VectorSprite.js":28}],21:[function(require,module,exports){
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

SimpleParticle.cacheTexture = function (game, key, color, size, circle) {
    var texture = game.make.bitmapData(size, size);
    texture.ctx.fillStyle = color;
    if (circle) {
        texture.ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2, false);
        texture.ctx.fill();
    } else {
        texture.ctx.fillRect(0, 0, size, size);
    }
    SimpleParticle._textureCache[key] = texture;
};

SimpleParticle.prototype = Object.create(Phaser.Sprite.prototype);
SimpleParticle.prototype.constructor = SimpleParticle;


module.exports = SimpleParticle;
//Starcoder.SimpleParticle = SimpleParticle;
},{}],22:[function(require,module,exports){
/**
 * StarTarget.js
 *
 * Client side implementation
 */
'use strict';

var Starcoder = require('../Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var UpdateProperties = require('../common/UpdateProperties.js').StarTarget;

var star = require('../common/Paths.js').star;

var StarTarget = function (game, config) {
    VectorSprite.call(this, game, config);
};

StarTarget.prototype = Object.create(VectorSprite.prototype);
StarTarget.prototype.constructor = StarTarget;

Starcoder.mixinPrototype(StarTarget.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(StarTarget.prototype, UpdateProperties.prototype);

StarTarget.prototype.drawProcedure = function (renderScale) {
    var psc = this.game.physics.p2.mpxi(renderScale);
    var gsc = psc*this.vectorScale;
    var lineColor = Phaser.Color.hexToRGB(this.lineColor);
    this.graphics.lineStyle(1, lineColor, 1);
    for (var i = 0, l = this.stars.length; i < l; i++) {
        for (var j = 0, k = star.length; j < k; j++) {
            var x = psc * this.stars[i][0] + gsc * star[j][0];
            var y = psc * this.stars[i][1] + gsc * star[j][1];
            if (j === 0) {
                this.graphics.moveTo(x, y);
                var x0 = x;
                var y0 = y;
            } else {
                this.graphics.lineTo(x, y);
            }
        }
        this.graphics.lineTo(x0, y0);
    }
};

module.exports = StarTarget;
},{"../Starcoder.js":3,"../common/Paths.js":12,"../common/UpdateProperties.js":13,"./SyncBodyInterface.js":23,"./VectorSprite.js":28}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
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
},{"./SimpleParticle.js":21}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
/**
 * TractorBeam.js
 *
 * Client side implementation of a single tractor beam segment
 */
'use strict';

//FIXME: Nicer implementation

var Starcoder = require('../Starcoder.js');

var SimpleParticle = require('./SimpleParticle.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');
var UpdateProperties = require('../common/UpdateProperties.js').TractorBeam;

var TractorBeam = function (game, config) {
    SimpleParticle.call(this, game, 'tractor');
    this.setPosAngle(config.x, config.y, config.a);
};

TractorBeam.prototype = Object.create(SimpleParticle.prototype);
TractorBeam.prototype.constructor = TractorBeam;

Starcoder.mixinPrototype(TractorBeam.prototype, SyncBodyInterface.prototype);
Starcoder.mixinPrototype(TractorBeam.prototype, UpdateProperties.prototype);

module.exports = TractorBeam;
},{"../Starcoder.js":3,"../common/UpdateProperties.js":13,"./SimpleParticle.js":21,"./SyncBodyInterface.js":23}],27:[function(require,module,exports){
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
    this._drawBranch(this.graph, this.game.physics.p2.mpxi(this.vectorScale)*renderScale, this.depth);
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
},{"../Starcoder.js":3,"../common/UpdateProperties.js":13,"./SyncBodyInterface.js":23,"./VectorSprite.js":28}],28:[function(require,module,exports){
/**
 * Sprite with attached Graphics object for vector-like graphics
 */
'use strict';

//var Starcoder = require('../../Starcoder-client.js');

var frameTexturePool = {};
var mapTexturePool = {};

/**
 * Base class for Vector-based sprites
 *
 * @param game {Phaser.Game} - Phaser game object
 * @param config {object} - POJO with config details
 * @constructor
 */
var VectorSprite = function (game, config) {
    Phaser.Sprite.call(this, game);

    //this.graphics = game.make.graphics();
    this.graphics = this.game.sharedGraphics;
    //this.texture = this.game.add.renderTexture();
    //this.minitexture = this.game.add.renderTexture();

    if (!config.nophysics) {
        game.physics.p2.enable(this, false, false);
        this.setPosAngle(config.x, config.y, config.a);
        this.updateBody();
        this.body.mass = 0;
    }
    this.config(config.properties);

    if (this.visibleOnMap) {
        this.minisprite = this.game.minimap.create();
        this.minisprite.anchor.setTo(0.5, 0.5);
    }

    if (this.sharedTextureKey) {
        this.frames = this.getFramePool(this.sharedTextureKey);
        if (this.minisprite) {
            this.minitexture = this.getMapPool(this.sharedTextureKey);
        }
        if (this.frames.length === 0) {
            this.updateTextures();
        } else {
            this.setTexture(this.frames[this.vFrame]);
            if (this.minisprite) {
                this.minisprite.setTexture(this.minitexture);
            }
        }
    } else {
        this.frames = [];
        if (this.minisprite) {
            this.minitexture = this.game.add.renderTexture();
        }
        this.updateTextures();
    }

    //this.updateTextures();
    if (this.fps) {
        this._msPerFrame = 1000 / this.fps;
        this._lastVFrame = this.game.time.now;
    }
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
};

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

VectorSprite.prototype.numFrames = 1;
VectorSprite.prototype.mapFrame = 0;
VectorSprite.prototype.vFrame = 0;

VectorSprite.prototype.visibleOnMap = true;

VectorSprite.prototype.getFramePool = function (key) {
    if (!frameTexturePool[key]) {
        return frameTexturePool[key] = [];
    }
    return frameTexturePool[key];
};

VectorSprite.prototype.getMapPool = function (key) {
    if (!mapTexturePool[key]) {
        mapTexturePool[key] = this.game.add.renderTexture();
    }
    return mapTexturePool[key];
}

VectorSprite.prototype.setShape = function (shape) {
    this.shape = shape;
    this.updateTextures();
};

VectorSprite.prototype.setLineStyle = function (color, lineWidth) {
    if (!lineWidth || lineWidth < 1) {
        lineWidth = this.lineWidth || 1;
    }
    this.color = color;
    this.lineWidth = lineWidth;
    this.updateTextures();
};

/**
 * Update cached bitmaps for object after vector properties change
 */
VectorSprite.prototype.updateTextures = function () {
    // Draw full sized
    if (this.numFrames === 1) {
        this.graphics.clear();
        this.graphics._currentBounds = null;
        if (typeof this.drawProcedure !== 'undefined') {
            this.drawProcedure(1, 0);
        } else if (this.shape) {
            this.draw(1);
        }
        if (!this.frames[0]) {
            this.frames[0] = this.game.add.renderTexture();
        }
        var bounds = this.graphics.getLocalBounds();
        this.frames[0].resize(bounds.width, bounds.height, true);
        this.frames[0].renderXY(this.graphics, -bounds.x, -bounds.y, true);
    } else {
        for (var i = 0; i < this.numFrames; i++) {
            this.graphics.clear();
            this.graphics._currentBounds = null;
            this.drawProcedure(1, i);
            if (!this.frames[i]) {
                this.frames[i] = this.game.add.renderTexture();
            }
            bounds = this.graphics.getLocalBounds();
            this.frames[i].resize(bounds.width, bounds.height, true);
            this.frames[i].renderXY(this.graphics, -bounds.x, -bounds.y, true);
        }
    }
    this.setTexture(this.frames[this.vFrame]);
    // Draw small for minimap
    if (this.minisprite) {
        var mapScale = this.game.minimap.mapScale;
        var mapFactor = this.mapFactor || 1;
        this.graphics.clear();
        this.graphics._currentBounds = null;
        if (typeof this.drawProcedure !== 'undefined') {
            this.drawProcedure(mapScale * mapFactor, this.mapFrame);
        } else if (this.shape) {
            this.draw(mapScale * mapFactor);
        }
        bounds = this.graphics.getLocalBounds();
        this.minitexture.resize(bounds.width, bounds.height, true);
        this.minitexture.renderXY(this.graphics, -bounds.x, -bounds.y, true);
        this.minisprite.setTexture(this.minitexture);
    }
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
        this.updateTextures();
    }
    if (this._msPerFrame && (this.game.time.now >= this._lastVFrame + this._msPerFrame)) {
        this.vFrame = (this.vFrame + 1) % this.numFrames;
        this.setTexture(this.frames[this.vFrame]);
        this._lastVFrame = this.game.time.now;
    }
};

// Vector properties defined to handle marking sprite dirty when necessary

Object.defineProperty(VectorSprite.prototype, 'lineColor', {
    get: function () {
        return this._lineColor;
    },
    set: function (val) {this._lineColor = val;
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
},{}],29:[function(require,module,exports){
/**
 * Controls.js
 *
 * Virtualize and implement queue for game controls
 */
'use strict';

var Starcoder = require('../Starcoder-client.js');

var Controls = function (game, parent) {
    Phaser.Plugin.call(this, game, parent);
};

Controls.prototype = Object.create(Phaser.Plugin.prototype);
Controls.prototype.constructor = Controls;

Controls.prototype.init = function (queue) {
    this.queue = queue;
    this.controls = this.game.input.keyboard.createCursorKeys();
    this.controls.fire = this.game.input.keyboard.addKey(Phaser.Keyboard.B);
    this.controls.tractor = this.game.input.keyboard.addKey(Phaser.Keyboard.T);
    this.joystickState = {
        up: false,
        down: false,
        left: false,
        right: false,
        fire: false
    };

    // Add virtual joystick if plugin is available
    if (Phaser.VirtualJoystick) {
        this.joystick = this.game.starcoder.attachPlugin(Phaser.VirtualJoystick);
    }
};

var seq = 0;
var up = false, down = false, left = false, right = false, fire = false, tractor = false;

Controls.prototype.addVirtualControls = function (texture) {
    texture = texture || 'joystick';
    var scale = 1;            // FIXME
    this.stick = this.joystick.addStick(0, 0, 100,texture);
    //this.stick.motionLock = Phaser.VirtualJoystick.HORIZONTAL;
    this.stick.scale = scale;
    //this.gobutton = this.joystick.addButton(x + 200*scale, y, texture, 'button1-up', 'button1-down');
    this.firebutton = this.joystick.addButton(0, 0, texture, 'button1-up', 'button1-down');
    this.tractorbutton = this.joystick.addButton(0, 0, texture, 'button2-up', 'button2-down');
    this.firebutton.scale = scale;
    //this.gobutton.scale = scale;
    this.tractorbutton.scale = scale;
    this.layoutVirtualControls(scale);
    this.stick.onMove.add(function (stick, f, fX, fY) {
        if (fX >= 0.35) {
            this.joystickState.right = true;
            this.joystickState.left = false;
        } else if (fX <= -0.35) {
            this.joystickState.right = false;
            this.joystickState.left = true;
        } else {
            this.joystickState.right = false;
            this.joystickState.left = false;
        }
        if (fY >= 0.35) {
            this.joystickState.down = true;
            this.joystickState.up = false;
        } else if (fY <= -0.35) {
            this.joystickState.down = false;
            this.joystickState.up = true;
        } else {
            this.joystickState.down = false;;
            this.joystickState.up = false;
        }
    }, this);
    this.stick.onUp.add(function () {
        this.joystickState.right = false;
        this.joystickState.up = false;
        this.joystickState.left = false;
        this.joystickState.down = false;
    }, this);
    this.firebutton.onDown.add(function () {
        this.joystickState.fire = true;
    }, this);
    this.firebutton.onUp.add(function () {
        this.joystickState.fire = false;
    }, this);
    //this.gobutton.onDown.add(function () {
    //    this.joystickState.up = true;
    //}, this);
    //this.gobutton.onUp.add(function () {
    //    this.joystickState.up = false;
    //}, this);
    this.tractorbutton.onDown.add(function () {
        this.joystickState.tractor = true;
    }, this);
    this.tractorbutton.onUp.add(function () {
        this.joystickState.tractor = false;
    }, this);
};

Controls.prototype.layoutVirtualControls = function (scale) {
    var y = this.game.height - 125 * scale;
    var w = this.game.width;
    this.stick.posX = 150 * scale;
    this.stick.posY = y;
    this.firebutton.posX = w - 250 * scale;
    this.firebutton.posY = y;
    this.tractorbutton.posX = w - 125 * scale;
    this.tractorbutton.posY = y;
};

Controls.prototype.reset = function () {
    up = down = left = right = false;
    this.queue.length = 0;
};

Controls.prototype.preUpdate = function () {
    // TODO: Support other interactions/methods
    var controls = this.controls;
    var state = this.joystickState;
    if ((state.up || controls.up.isDown) && !up) {
        up = true;
        this.queue.push({type: 'up_pressed', executed: false, seq: seq++});
    }
    if (!state.up && !controls.up.isDown && up) {
        up = false;
        this.queue.push({type: 'up_released', executed: false, seq: seq++});
    }
    if ((state.down || controls.down.isDown) && !down) {
        down = true;
        this.queue.push({type: 'down_pressed', executed: false, seq: seq++});
    }
    if (!state.down && !controls.down.isDown && down) {
        down = false;
        this.queue.push({type: 'down_released', executed: false, seq: seq++});
    }
    if ((state.right || controls.right.isDown) && !right) {
        right = true;
        this.queue.push({type: 'right_pressed', executed: false, seq: seq++});
    }
    if (!state.right && !controls.right.isDown && right) {
        right = false;
        this.queue.push({type: 'right_released', executed: false, seq: seq++});
    }
    if ((state.left || controls.left.isDown) && !left) {
        left = true;
        this.queue.push({type: 'left_pressed', executed: false, seq: seq++});
    }
    if (!state.left && !controls.left.isDown && left) {
        left = false;
        this.queue.push({type: 'left_released', executed: false, seq: seq++});
    }
    if ((state.fire || controls.fire.isDown) && !fire) {
        fire = true;
        this.queue.push({type: 'fire_pressed', executed: false, seq: seq++});
    }
    if (!state.fire && !controls.fire.isDown && fire) {
        fire = false;
        this.queue.push({type: 'fire_released', executed: false, seq: seq++});
    }
    if ((state.tractor || controls.tractor.isDown) && !tractor) {
        tractor = true;
        this.queue.push({type: 'tractor_pressed', executed: false, seq: seq++});
    }
    if ((!state.tractor && !controls.tractor.isDown) && tractor) {
        tractor = false;//
        this.queue.push({type: 'tractor_released', executed: false, seq: seq++});
    }
};

var action;             // Module scope to avoid allocations

Controls.prototype.processQueue = function (cb, clear) {
    var queue = this.queue;
    for (var i = 0, l = queue.length; i < l; i++) {
        action = queue[i];
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
},{"../Starcoder-client.js":2}],30:[function(require,module,exports){
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


var actions = [];               // Module scope to avoid allocations
var action;
/**
 * Send queued commands that have been executed to the server
 *
 * @private
 */
SyncClient.prototype._sendCommands = function () {
    actions.length = 0;
    for (var i = this.cmdQueue.length-1; i >= 0; i--) {
        action = this.cmdQueue[i];
        if (action.executed) {
            actions.unshift(action);
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
        //if (t < 0 || t > 1) {
        //    console.log('weird time', t);
        //}
        t = Math.min(1, Math.max(0, t));        // FIXME: Stopgap fix - Shouldn't need this
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
},{"../Starcoder-client.js":2}],31:[function(require,module,exports){
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

//var _connected = false;

/**
 * Set properties that require booted game state, attach plugins, connect to game server
 */
Boot.prototype.init = function () {
    //console.log('Init Boot', this.game.width, this.game.height);
    //console.log('iw Boot', window.innerWidth, window.innerHeight, screen.width, screen.height, window.devicePixelRatio);
    //this.game.stage.disableVisibilityChange = true;
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.game.scale.onSizeChange.add(function () {
        console.log('master resize CB');
    });
    this.game.renderer.renderSession.roundPixels = true;
    this.game.sharedGraphics = this.game.make.graphics();
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
    this.starcoder.serverConnect();
    //this.starcoder.controls = this.game.plugins.add(Controls,
    //    this.starcoder.cmdQueue);
    //this.game.joystick = this.starcoder.attachPlugin(Phaser.VirtualJoystick);
    //this.starcoder.controls = this.starcoder.attachPlugin(Controls, this.starcoder.cmdQueue);
    // Set up socket.io connection
    //this.starcoder.socket = this.starcoder.io(this.starcoder.config.serverUri,
    //    this.starcoder.config.ioClientOptions);
    //this.starcoder.socket.on('server ready', function (playerMsg) {
    //    // FIXME: Has to interact with session for authentication etc.
    //    self.starcoder.player = playerMsg;
    //    //self.starcoder.syncclient = self.game.plugins.add(SyncClient,
    //    //    self.starcoder.socket, self.starcoder.cmdQueue);
    //    self.starcoder.syncclient = self.starcoder.attachPlugin(SyncClient,
    //        self.starcoder.socket, self.starcoder.cmdQueue);
    //    _connected = true;
    //});
};

/**
 * Preload minimal assets for progress screen
 */
Boot.prototype.preload = function () {
    this.game.load.image('bar_left', 'assets/images/greenBarLeft.png');
    this.game.load.image('bar_mid', 'assets/images/greenBarMid.png');
    this.game.load.image('bar_right', 'assets/images/greenBarRight.png');
};

/**
 * Kick into next state once initialization and preloading are done
 */
Boot.prototype.create = function () {
    this.game.state.start('loader');
};

/**
 * Advance game state once network connection is established
 */
//Boot.prototype.update = function () {
//    // FIXME: don't wait here - should be in create
//    if (this.starcoder.connected) {
//        //this.game.state.start('space');
//        this.game.state.start('login');
//    }
//};

module.exports = Boot;
},{"../phaserplugins/Controls.js":29,"../phaserplugins/SyncClient.js":30}],32:[function(require,module,exports){
/**
 * Loader.js
 *
 * Phaser state to preload assets and display progress
 */
'use strict';

var Loader = function () {};

Loader.prototype = Object.create(Phaser.State.prototype);
Loader.prototype.constructor = Loader;

Loader.prototype.init = function () {
    // Init and draw starfield
    this.starcoder.starfield = this.game.make.bitmapData(600, 600, 'starfield', true);
    this.starcoder.drawStarField(this.starcoder.starfield.ctx, 600, 16);
    this.game.add.tileSprite(0, 0, this.game.width, this.game.height, this.starcoder.starfield);

    // Position progress bar
    var barWidth = Math.floor(0.4 * this.game.width);
    var originX = (this.game.width - barWidth)/2;
    var left = this.game.add.image(originX, this.game.world.centerY, 'bar_left');
    left.anchor.setTo(0, 0.5);
    var mid = this.game.add.image(originX + left.width, this.game.world.centerY, 'bar_mid');
    mid.anchor.setTo(0, 0.5);
    var right = this.game.add.image(originX + left.width, this.game.world.centerY, 'bar_right');
    right.anchor.setTo(0, 0.5);
    var midWidth = barWidth - 2 * left.width;
    mid.width = 0;
    var loadingText = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 36, 'Loading...',
        {font: '24px Arial', fill: '#ffffff', align: 'center'});
    loadingText.anchor.setTo(0.5);
    var progText = this.game.add.text(originX + left.width, this.game.world.centerY, '0%',
        {font: '24px Arial', fill: '#ffffff', align: 'center'});
    progText.anchor.setTo(0.5);

    this.game.load.onFileComplete.add(function (progress) {
        var w = Math.floor(midWidth * progress / 100);
        mid.width = w;
        right.x = mid.x + w;
        progText.setText(progress + '%');
        progText.x = mid.x + w/2;
    }, this);
};

Loader.prototype.preload = function () {
    // TODO: HD and SD versions
    // Fonts
    this.game.load.bitmapFont('title-font',
        'assets/bitmapfonts/karnivore128.png', 'assets/bitmapfonts/karnivore128.xml');
    this.game.load.bitmapFont('readout-yellow',
        'assets/bitmapfonts/heavy-yellow24.png', 'assets/bitmapfonts/heavy-yellow24.xml');
    this.game.load.audio('playerthrust', 'assets/sounds/thrustLoop.ogg');
    // Sounds
    this.game.load.audio('chime', 'assets/sounds/chime.ogg');
    this.game.load.audio('levelup', 'assets/sounds/levelup.ogg');
    this.game.load.audio('planttree', 'assets/sounds/planttree.ogg');
    this.game.load.audio('bigpop', 'assets/sounds/bigpop.ogg');
    this.game.load.audio('littlepop', 'assets/sounds/littlepop.ogg');
    this.game.load.audio('tagged', 'assets/sounds/tagged.ogg');
    this.game.load.audio('laser', 'assets/sounds/laser.ogg');
    this.game.load.audio('music', 'assets/sounds/ignore.ogg');
    // Spritesheets
    this.game.load.atlas('joystick', 'assets/joystick/generic-joystick.png', 'assets/joystick/generic-joystick.json');
    // Images

};

Loader.prototype.update = function () {
    if (this.starcoder.connected) {
        //this.game.state.start('space');
        this.game.state.start('login');
    }
};

module.exports = Loader;
},{}],33:[function(require,module,exports){
/**
 * Login.js
 *
 * State for displaying login screen.
 */
'use strict';

var Login = function () {};

Login.prototype = Object.create(Phaser.State.prototype);
Login.prototype.constructor = Login;

Login.prototype.init = function () {
    console.log('login');
    var self = this;
    this.starcoder.showLogin();
    this.starcoder.socket.on('logged in', function (player) {
        self.starcoder.hideLogin();
        self.starcoder.player = player;
        self.game.state.start('space');
    });
    this.starcoder.socket.on('login failure', function (error) {
        self.starcoder.setLoginError(error);
    });
};

//Login.prototype.preload = function () {
//    this.game.load.bitmapFont('title-font',
//        'assets/bitmapfonts/karnivore128.png', 'assets/bitmapfonts/karnivore128.xml');
//};

//Login.prototype.resize = function (w, h) {
//    console.log('rs Login', w, h);
//};

Login.prototype.create = function () {
    //var starfield = this.game.make.bitmapData(600, 600);
    //this.starcoder.drawStarField(this.starcoder.starfield.ctx, 600, 16);
    this.starcoder.starfield = this.game.make.bitmapData(600, 600, 'starfield', true);
    this.starcoder.drawStarField(this.starcoder.starfield.ctx, 600, 16);
    this.game.add.tileSprite(0, 0, this.game.width, this.game.height, this.starcoder.starfield);
    var title = this.game.add.bitmapText(this.game.world.centerX, 128, 'title-font', 'STARCODER');
    title.anchor.setTo(0.5, 0.5);
};

module.exports = Login;

},{}],34:[function(require,module,exports){
/**
 * Space.js
 *
 * Main game state for Starcoder
 */
'use strict';

var SimpleParticle = require('../phaserbodies/SimpleParticle.js');
var ThrustGenerator = require('../phaserbodies/ThrustGenerator.js');
var MiniMap = require('../phaserui/MiniMap.js');
var LeaderBoard = require('../phaserui/LeaderBoard.js');
var Toast = require('../phaserbodies/Toast.js');
var HUD = require('../phaserui/HUD.js');

var Controls = require('../phaserplugins/Controls.js');
var SyncClient = require('../phaserplugins/SyncClient.js');

var Space = function () {};

Space.prototype = Object.create(Phaser.State.prototype);
Space.prototype.constructor = Space;

Space.prototype.init = function () {
    this.starcoder.controls = this.starcoder.attachPlugin(Controls, this.starcoder.cmdQueue);
    this.starcoder.syncclient = this.starcoder.attachPlugin(SyncClient,
        this.starcoder.socket, this.starcoder.cmdQueue);
    this.stage.disableVisibilityChange = true;
};

Space.prototype.preload = function () {
    SimpleParticle.cacheTexture(this.game, ThrustGenerator.textureKey, '#ff6600', 8);
    SimpleParticle.cacheTexture(this.game, 'bullet', '#999999', 4);
    SimpleParticle.cacheTexture(this.game, 'tractor', '#eeeeee', 8, true);
    //this.game.load.audio('playerthrust', 'assets/sounds/thrustLoop.ogg');
    //this.game.load.audio('chime', 'assets/sounds/chime.mp3');
    //this.game.load.atlas('joystick', 'assets/joystick/generic-joystick.png', 'assets/joystick/generic-joystick.json');
    //this.game.load.bitmapFont('readout-yellow',
    //    'assets/bitmapfonts/heavy-yellow24.png', 'assets/bitmapfonts/heavy-yellow24.xml');
};

Space.prototype.create = function () {
    console.log('Space size', this.game.width, this.game.height, window.innerWidth, window.innerHeight);
    window.scrollTo(0, 1);
    //console.log('create');
    //var rng = this.game.rnd;
    var wb = this.starcoder.config.worldBounds;
    var ps = this.starcoder.config.physicsScale;
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.world.setBounds.call(this.world, wb[0]*ps, wb[1]*ps, (wb[2]-wb[0])*ps, (wb[3]-wb[1])*ps);
    this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    // Debugging
    //this.game.time.advancedTiming = true;

    // Set up DOM
    this.starcoder.layoutDOMSpaceState();

    this.starcoder.controls.reset();

    // Virtual joystick
    this.starcoder.controls.addVirtualControls('joystick');
    //this.game.vcontrols = {};
    //this.game.vcontrols.stick = this.game.joystick.addStick(
    //    this.game.width - 150, this.game.height - 75, 100, 'joystick');
    //this.game.vcontrols.stick.scale = 0.5;
    //this.game.vcontrols.firebutton = this.game.joystick.addButton(this.game.width - 50, this.game.height - 75,
    //    'joystick', 'button1-up', 'button1-down');
    //this.game.vcontrols.firebutton.scale = 0.5;

    // Sounds
    this.game.sounds = {};
    this.game.sounds.playerthrust = this.game.sound.add('playerthrust', 1, true);
    this.game.sounds.chime = this.game.sound.add('chime', 1, false);
    this.game.sounds.planttree = this.game.sound.add('planttree', 1, false);
    this.game.sounds.bigpop = this.game.sound.add('bigpop', 1, false);
    this.game.sounds.littlepop = this.game.sound.add('littlepop', 1, false);
    this.game.sounds.tagged = this.game.sound.add('tagged', 1, false);
    this.game.sounds.laser = this.game.sound.add('laser', 1, false);

    this.game.sounds.music = this.game.sound.add('music', 1, true);
    this.game.sounds.music.play();

    // Background
    //var starfield = this.game.make.bitmapData(600, 600);
    //this.starcoder.drawStarField(starfield.ctx, 600, 16);
    this.starcoder.starfield = this.game.make.bitmapData(600, 600, 'starfield', true);
    this.starcoder.drawStarField(this.starcoder.starfield.ctx, 600, 16);
    this.game.add.tileSprite(wb[0]*ps, wb[1]*ps, (wb[2]-wb[0])*ps, (wb[3]-wb[1])*ps, this.starcoder.starfield);

    this.starcoder.syncclient.start();
    //this.starcoder.socket.emit('client ready');
    this.starcoder.socket.emit('ready');
    this._setupMessageHandlers(this.starcoder.socket);

    // Groups for particle effects
    this.game.thrustgenerator = new ThrustGenerator(this.game);

    // Group for game objects
    this.game.playfield = this.game.add.group();

    // UI
    this.game.ui = this.game.add.group();
    this.game.ui.fixedToCamera = true;

    // Inventory - tinker with position
    //var label = this.game.make.text(this.game.width / 2, 25, 'INVENTORY',
    //    {font: '24px Arial', fill: '#ff9900', align: 'center'});
    //label.anchor.setTo(0.5, 0.5);
    //this.game.ui.add(label);
    //this.game.inventorytext = this.game.make.text(this.game.width - 100, 50, '0 crystals',
    //    {font: '24px Arial', fill: '#ccc000', align: 'center'});
    //this.game.inventorytext = this.game.make.bitmapText(2000, 50, 'readout-yellow', '0');
    //this.game.inventorytext.anchor.setTo(0.5, 0.5);
    //this.game.ui.add(this.game.inventorytext);
    this.game.hud = new HUD(this.game, (this.game.width - 180)/ 2, 2, 180, 120);
    this.game.ui.add(this.game.hud);
    //this.game.hud.anchor.setTo(0.5, 0);

    // MiniMap
    this.game.minimap = new MiniMap(this.game, 300, 300);
    this.game.ui.add(this.game.minimap);
    this.game.minimap.x = 10;
    this.game.minimap.y = 10;

    // Leaderboard
    this.game.leaderboard = new LeaderBoard(this.game, this.starcoder.playerMap, 200, 300);
    this.game.ui.add(this.game.leaderboard);
    this.game.leaderboard.x = this.game.width - 200;
    this.game.leaderboard.y = 0;
    this.game.leaderboard.visible = false;
    var self = this;

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
    //this.game.debug.text('Fps: ' + this.game.time.fps, 5, 20);
    //this.game.vcontrols.stick.debug(true, true);
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
    socket.on('msg plant tree', function (val) {
        self.game.sounds.planttree.play();
    });
    socket.on('msg asteroid pop', function (size) {
        if (size > 1) {
            self.game.sounds.bigpop.play();
        } else {
            self.game.sounds.littlepop.play();
        }
    });
    socket.on('msg tagged', function (val) {
        self.game.sounds.tagged.play();
    });
    socket.on('msg laser', function (val) {
        self.game.sounds.laser.play();
    });
};

module.exports = Space;

},{"../phaserbodies/SimpleParticle.js":21,"../phaserbodies/ThrustGenerator.js":24,"../phaserbodies/Toast.js":25,"../phaserplugins/Controls.js":29,"../phaserplugins/SyncClient.js":30,"../phaserui/HUD.js":35,"../phaserui/LeaderBoard.js":36,"../phaserui/MiniMap.js":37}],35:[function(require,module,exports){
/**
 * HUD.js
 *
 * Display for inventory and status
 */
'use strict';

var Paths = require('../common/Paths.js');
var Bullet = require('../phaserbodies/Bullet.js');

var HUD = function (game, x, y, width, height) {
    Phaser.Graphics.call(this, game, x, y);
    this.layout(width, height);
};

HUD.prototype = Phaser.Graphics.prototype;
HUD.prototype.constructor = HUD;

HUD.prototype.layout = function (width, height) {
    var xunit = Math.floor(width / 18);
    var yunit = Math.floor(height / 8);
    // Outline
    this.lineStyle(2, 0xcccccc, 1.0);
    // Crossline
    this.moveTo(0, 4 * yunit);
    this.lineTo(width, 4 * yunit);
    this.drawRect(0, 0, width, height);
    // Code Area
    this.codetext = this.game.make.text(xunit * 9, yunit * 2, 'CODE',
        {font: '24px Arial', fill: '#ff9900', align: 'center'});
    this.codetext.anchor.setTo(0.5, 0.5);
    this.addChild(this.codetext);
    // Inventory area
    // Crystal icon
    this.lineStyle(1, 0x00ffff, 1.0);
    this.drawPolygon(Paths.normalize(Paths.octagon, 5, xunit * 2, yunit * 5, true));
    this.drawPolygon(Paths.normalize(Paths.d2cross, 5, xunit * 2, yunit * 5, true));
    // Amount
    //this.crystaltext = this.game.make.text(xunit * 6, yunit * 5.25, '0',
    //    {font: '26px Arial', fill: '#00ffff', align: 'center'});
    this.crystaltext = this.game.starcoder.makeFlexText(xunit * 6, yunit * 5.25, '0',
        this.game.starcoder.config.fonts.hudCode);
    this.crystaltext.anchor.setTo(0.5, 0.5);
    this.addChild(this.crystaltext);
    // Tree icon
    this.lineStyle(1, 0x00ff00, 1.0);
    for (var i = 0, l = treeIconPaths.length; i < l; i++) {
        this.drawPolygon(Paths.normalize(treeIconPaths[i], 5, xunit * 11, yunit * 5, false));
    }
    // Amount
    this.treetext = this.game.make.text(xunit * 15, yunit * 5.25, '0',
        {font: '26px Arial', fill: '#00ff00', align: 'center'});
    this.treetext.anchor.setTo(0.5, 0.5);
    this.addChild(this.treetext);
    this.lasers = [];
    for (i = 0; i < 5; i++) {
        var laser = new Bullet(this.game, {nophysics: true, properties: {lineColor: '#ff0000'}});
        laser.x = xunit * 2 + i * 24;
        laser.y = yunit * 7;
        laser.anchor.setTo(0.5);
        laser.angle = 90;
        this.addChild(laser);
        this.lasers.push(laser);
    }

};

HUD.prototype.setLaserColor = function (color) {
    this.lasers[0].config({lineColor: color});
    this.lasers[0].updateTextures();
};

HUD.prototype.setCrystals = function (x) {
    this.crystaltext.setText(x.toString());
};


HUD.prototype.setTrees = function (x) {
    this.treetext.setText(x.toString());
};

HUD.prototype.setCharge = function (x) {
    for (var i = 0, l = this.lasers.length; i < l; i++) {
        if (x > i) {
            this.lasers[i].visible = true;
        } else {
            this.lasers[i].visible = false;
        }
    }
};

var treeIconPaths = [
    [[0,2],[0,-2]],
    [[-2,-2],[0,1],[2,-2]],
    [[-1,-2],[0,-1],[1,-2]],
    [[-2,-1],[-1,-0.5],[-2,0]],
    [[2,-1],[1,-0.5],[2,0]]
];

module.exports = HUD;

},{"../common/Paths.js":12,"../phaserbodies/Bullet.js":16}],36:[function(require,module,exports){
/**
 * LeaderBoard.js
 */
'use strict';

var LeaderBoard = function (game, playermap, width, height) {
    Phaser.Group.call(this, game);
    this.playerMap = playermap;
    this.open = true;
    this.mainWidth = width;
    this.mainHeight = height;
    this.iconSize = 24;         // Make responsive?
    this.fontSize = 18;
    this.numLines = Math.floor((height - this.iconSize - 2) / (this.fontSize + 2));

    this.main = game.make.group();
    this.main.pivot.setTo(width, 0);
    this.main.x = width;
    this.add(this.main);

    // Background
    var bitmap = this.game.make.bitmapData(width, height);
    bitmap.ctx.fillStyle = 'rgba(128, 128, 128, 0.25)';
    //bitmap.ctx.fillStyle = '#999999';
    //bitmap.ctx.globalAlpha = 0.5;
    bitmap.ctx.fillRect(0, 0, width, height);
    //this.board = new Phaser.Sprite(game, width, 0, this.bitmap);
    //this.board.pivot.setTo(width, 0);
    this.main.add(new Phaser.Sprite(game, 0, 0, bitmap));

    // Title
    this.title = game.starcoder.addFlexText((width - this.iconSize) / 2, 4, 'Tags',
        this.game.starcoder.config.fonts.leaderBoardTitle, this.main);
    this.title.anchor.setTo(0.5, 0);

    // Display lines
    this.lines = [];
    for (var i = 0; i < this.numLines; i++) {
        var line = game.starcoder.addFlexText(4, this.iconSize + 2 + i * (this.fontSize + 2),
            '-', this.game.starcoder.config.fonts.leaderBoard, this.main);
        line.kill();
        this.lines.push(line);
    }

    // Toggle button
    var button = this.makeButton();       // Good dimensions TBD. Make responsive?
    button.anchor.setTo(1, 0);      // upper right;
    button.x = width;
    //button.y = 0;
    button.inputEnabled = true;
    button.events.onInputDown.add(this.toggleDisplay, this);
    this.add(button);

    //// List
    //this.list = game.make.group();
    //this.list.x = width;
    //this.list.y = 0;
    //this.list.pivot.setTo(width, 0);
    //this.tween = game.tweens.create(this.board.scale);
    //
    //this.add(this.list);
    //// testing
    //var t = ['tiger princess', 'ninja laser', 'robot fish', 'potato puppy', 'vampire quiche', 'wizard pasta'];
    //for (var i = 0; i < t.length; i++) {
    //    var text = game.make.text(2, i*16, t[i], {font: '14px Arial', fill: '#0000ff'});
    //    this.list.add(text);
    //}
};

LeaderBoard.prototype = Object.create(Phaser.Group.prototype);
LeaderBoard.prototype.constructor = LeaderBoard;

LeaderBoard.prototype.makeButton = function () {
    var unit = this.iconSize / 5;
    var texture = this.game.make.bitmapData(this.iconSize, this.iconSize);
    var ctx = texture.ctx;
    // Draw quarter circle
    ctx.fillStyle = '#ffffff';
    //ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(this.iconSize, 0);
    ctx.lineTo(0, 0);
    ctx.arc(this.iconSize, 0, this.iconSize, Math.PI, 3 * Math.PI / 2, true);
    ctx.fill();
    // Draw steps
    ctx.strokeStyle = '#000000';
    //ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(1.5*unit, 3*unit);
    ctx.lineTo(1.5*unit, 2*unit);
    ctx.lineTo(2.5*unit, 2*unit);
    ctx.lineTo(2.5*unit, unit);
    ctx.lineTo(3.5*unit, unit);
    ctx.lineTo(3.5*unit, 2*unit);
    ctx.lineTo(4.5*unit, 2*unit);
    ctx.lineTo(4.5*unit, 3*unit);
    ctx.closePath();
    ctx.stroke();
    return new Phaser.Sprite(this.game, 0, 0, texture);
};

LeaderBoard.prototype.setContent = function (title, list, playerid) {
    this.title.setText(title);
    var playerVisible = false;
    for (var i = 0; i < this.numLines; i++) {
        var pid = list[i] && list[i].id;
        if (pid && this.playerMap[pid]) {
            var tag = this.playerMap[pid].tag;
            var line = this.lines[i];
            line.setText((i + 1) + '. ' + tag + ' (' + list[i].val + ')');
            if (pid === playerid) {
                line.fontWeight = 'bold';
                playerVisible = true;
            } else {
                line.fontWeight = 'normal';
            }
            line.revive();
        } else {
            this.lines[i].kill();
        }
    }
    // Player not in top N
    if (!playerVisible) {
        for (i = this.numLines; i < list.length; i++) {
            if (list[i].id === playerid) {
                break;
            }
        }
        // Found - display at end
        if (i < list.length) {
            line[this.numLines - 1].setText((i + 1) + '. ' + this.playerMap[playerid] + ' (' + list[i].val + ')');
        }
    }
};

LeaderBoard.prototype.toggleDisplay = function () {
    if (!this.game.tweens.isTweening(this.main.scale)) {
        if (this.open) {
            this.game.add.tween(this.main.scale).to({x: 0, y: 0}, 500, Phaser.Easing.Quadratic.Out, true);
            this.open = false;
        } else {
            this.game.add.tween(this.main.scale).to({x: 1, y: 1}, 500, Phaser.Easing.Quadratic.Out, true);
            this.open = true;
        }
    }
};

module.exports = LeaderBoard;
},{}],37:[function(require,module,exports){
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
    this.graphics.beginFill(0xffff00, 0.2);
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
},{}]},{},[10])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL1N0YXJjb2Rlci1jbGllbnQuanMiLCJzcmMvU3RhcmNvZGVyLmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL0NvZGVFbmRwb2ludENsaWVudC5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9ET01JbnRlcmZhY2UuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvRmxleFRleHRXcmFwcGVyLmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL0xlYWRlckJvYXJkQ2xpZW50LmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL1N0YXJmaWVsZC5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9Xb3JsZEFwaS5qcyIsInNyYy9jbGllbnQuanMiLCJzcmMvY2xpZW50L2NvbmZpZy5qcyIsInNyYy9jb21tb24vUGF0aHMuanMiLCJzcmMvY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMiLCJzcmMvY29tbW9uL2NvbmZpZy5qcyIsInNyYy9waGFzZXJib2RpZXMvQXN0ZXJvaWQuanMiLCJzcmMvcGhhc2VyYm9kaWVzL0J1bGxldC5qcyIsInNyYy9waGFzZXJib2RpZXMvQ3J5c3RhbC5qcyIsInNyYy9waGFzZXJib2RpZXMvR2VuZXJpY09yYi5qcyIsInNyYy9waGFzZXJib2RpZXMvUGxhbmV0b2lkLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TaGlwLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TaW1wbGVQYXJ0aWNsZS5qcyIsInNyYy9waGFzZXJib2RpZXMvU3RhclRhcmdldC5qcyIsInNyYy9waGFzZXJib2RpZXMvU3luY0JvZHlJbnRlcmZhY2UuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1RocnVzdEdlbmVyYXRvci5qcyIsInNyYy9waGFzZXJib2RpZXMvVG9hc3QuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1RyYWN0b3JCZWFtLmpzIiwic3JjL3BoYXNlcmJvZGllcy9UcmVlLmpzIiwic3JjL3BoYXNlcmJvZGllcy9WZWN0b3JTcHJpdGUuanMiLCJzcmMvcGhhc2VycGx1Z2lucy9Db250cm9scy5qcyIsInNyYy9waGFzZXJwbHVnaW5zL1N5bmNDbGllbnQuanMiLCJzcmMvcGhhc2Vyc3RhdGVzL0Jvb3QuanMiLCJzcmMvcGhhc2Vyc3RhdGVzL0xvYWRlci5qcyIsInNyYy9waGFzZXJzdGF0ZXMvTG9naW4uanMiLCJzcmMvcGhhc2Vyc3RhdGVzL1NwYWNlLmpzIiwic3JjL3BoYXNlcnVpL0hVRC5qcyIsInNyYy9waGFzZXJ1aS9MZWFkZXJCb2FyZC5qcyIsInNyYy9waGFzZXJ1aS9NaW5pTWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKipcbiAqIFN0YXJjb2Rlci1jbGllbnQuanNcbiAqXG4gKiBTdGFyY29kZXIgbWFzdGVyIG9iamVjdCBleHRlbmRlZCB3aXRoIGNsaWVudCBvbmx5IHByb3BlcnRpZXMgYW5kIG1ldGhvZHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFdvcmxkQXBpID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9Xb3JsZEFwaS5qcycpO1xudmFyIERPTUludGVyZmFjZSA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvRE9NSW50ZXJmYWNlLmpzJyk7XG52YXIgQ29kZUVuZHBvaW50Q2xpZW50ID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9Db2RlRW5kcG9pbnRDbGllbnQuanMnKTtcbnZhciBTdGFyZmllbGQgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL1N0YXJmaWVsZC5qcycpO1xudmFyIExlYWRlckJvYXJkQ2xpZW50ID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9MZWFkZXJCb2FyZENsaWVudC5qcycpO1xudmFyIEZsZXhUZXh0V3JhcHBlciA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvRmxleFRleHRXcmFwcGVyLmpzJyk7XG5cbnZhciBzdGF0ZXMgPSB7XG4gICAgYm9vdDogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvQm9vdC5qcycpLFxuICAgIHNwYWNlOiByZXF1aXJlKCcuL3BoYXNlcnN0YXRlcy9TcGFjZS5qcycpLFxuICAgIGxvZ2luOiByZXF1aXJlKCcuL3BoYXNlcnN0YXRlcy9Mb2dpbi5qcycpLFxuICAgIGxvYWRlcjogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvTG9hZGVyLmpzJylcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlvID0gaW87XG4gICAgdGhpcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKCcxMDAlJywgJzEwMCUnLCBQaGFzZXIuQVVUTywgJ21haW4nKTtcbiAgICAvL3RoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSgxODAwLCA5NTAsIFBoYXNlci5DQU5WQVMsICdtYWluJyk7XG4gICAgdGhpcy5nYW1lLmZvcmNlU2luZ2xlVXBkYXRlID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUuc3RhcmNvZGVyID0gdGhpcztcbiAgICBmb3IgKHZhciBrIGluIHN0YXRlcykge1xuICAgICAgICB2YXIgc3RhdGUgPSBuZXcgc3RhdGVzW2tdKCk7XG4gICAgICAgIHN0YXRlLnN0YXJjb2RlciA9IHRoaXM7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoaywgc3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLm9uQ29ubmVjdENCID0gW107XG4gICAgdGhpcy5wbGF5ZXJNYXAgPSB7fTtcbiAgICB0aGlzLmNtZFF1ZXVlID0gW107XG4gICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmxhc3ROZXRFcnJvciA9IG51bGw7XG4gICAgdGhpcy5pbXBsZW1lbnRGZWF0dXJlKFdvcmxkQXBpKTtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoQ29kZUVuZHBvaW50Q2xpZW50KTtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoU3RhcmZpZWxkKTtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoTGVhZGVyQm9hcmRDbGllbnQpO1xuICAgIHRoaXMuaW1wbGVtZW50RmVhdHVyZShET01JbnRlcmZhY2UpO1xuICAgIHRoaXMuaW1wbGVtZW50RmVhdHVyZShGbGV4VGV4dFdyYXBwZXIpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5zZXJ2ZXJDb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoIXRoaXMuc29ja2V0KSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNvY2tldDtcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sYXN0TmV0RXJyb3IgPSBudWxsO1xuICAgIH1cbiAgICB2YXIgc2VydmVyVXJpID0gdGhpcy5jb25maWcuc2VydmVyVXJpO1xuICAgIGlmICghc2VydmVyVXJpKSB7XG4gICAgICAgIHZhciBwcm90b2NvbCA9IHRoaXMuY29uZmlnLnNlcnZlclByb3RvbCB8fCB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2w7XG4gICAgICAgIHZhciBwb3J0ID0gdGhpcy5jb25maWcuc2VydmVyUG9ydCB8fCAnODA4MCc7XG4gICAgICAgIHNlcnZlclVyaSA9IHByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArICc6JyArIHBvcnQ7XG4gICAgfVxuICAgIHRoaXMuc29ja2V0ID0gdGhpcy5pbyhzZXJ2ZXJVcmksIHRoaXMuY29uZmlnLmlvQ2xpZW50T3B0aW9ucyk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygnc29ja2V0IGNvbm5lY3RlZCcpO1xuICAgICAgICBzZWxmLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHNlbGYubGFzdE5ldEVycm9yID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzZWxmLm9uQ29ubmVjdENCLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgc2VsZi5vbkNvbm5lY3RDQltpXS5iaW5kKHNlbGYsIHNlbGYuc29ja2V0KSgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Vycm9yJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdzb2NrZXQgZXJyb3InKTtcbiAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICB0aGlzLmxhc3ROZXRFcnJvciA9IGRhdGE7XG4gICAgfSk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLnNlcnZlckxvZ2luID0gZnVuY3Rpb24gKHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgIHZhciBsb2dpbiA9IHt9O1xuICAgIGlmICghcGFzc3dvcmQpIHtcbiAgICAgICAgLy8gR3Vlc3QgbG9naW5cbiAgICAgICAgbG9naW4uZ2FtZXJ0YWcgPSB1c2VybmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2dpbi51c2VybmFtZSA9IHVzZXJuYW1lO1xuICAgICAgICBsb2dpbi5wYXNzd29yZCA9IHBhc3N3b3JkO1xuICAgIH1cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdsb2dpbicsIGxvZ2luKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdib290Jyk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLmF0dGFjaFBsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcGx1Z2luID0gdGhpcy5nYW1lLnBsdWdpbnMuYWRkLmFwcGx5KHRoaXMuZ2FtZS5wbHVnaW5zLCBhcmd1bWVudHMpO1xuICAgIHBsdWdpbi5zdGFyY29kZXIgPSB0aGlzO1xuICAgIHBsdWdpbi5sb2cgPSB0aGlzLmxvZztcbiAgICByZXR1cm4gcGx1Z2luO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5iYW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ1N0YXJjb2RlciBjbGllbnQgdicgKyB0aGlzLmNvbmZpZy52ZXJzaW9uLCAnYnVpbHQgb24nLCB0aGlzLmNvbmZpZy5idWlsZFRpbWUpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5yb2xlID0gJ0NsaWVudCc7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcmNvZGVyO1xuIiwiLyoqXG4gKiBTdGFyY29kZXIuanNcbiAqXG4gKiBTZXQgdXAgZ2xvYmFsIFN0YXJjb2RlciBuYW1lc3BhY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL3ZhciBTdGFyY29kZXIgPSB7XG4vLyAgICBjb25maWc6IHtcbi8vICAgICAgICB3b3JsZEJvdW5kczogWy00MjAwLCAtNDIwMCwgODQwMCwgODQwMF1cbi8vXG4vLyAgICB9LFxuLy8gICAgU3RhdGVzOiB7fVxuLy99O1xuXG52YXIgY29uZmlnID0ge1xuICAgIHZlcnNpb246ICcwLjEnLFxuICAgIHNlcnZlclVyaTogcHJvY2Vzcy5lbnYuU0VSVkVSX1VSSSB8fCAnaHR0cDovL2xvY2FsaG9zdDo4MDgwJyxcbiAgICAvL3NlcnZlckFkZHJlc3M6ICcxMjcuMC4wLjEnLFxuICAgIC8vd29ybGRCb3VuZHM6IFstNDIwMCwgLTQyMDAsIDg0MDAsIDg0MDBdLFxuICAgIHdvcmxkQm91bmRzOiBbLTIwMCwgLTIwMCwgMjAwLCAyMDBdLFxuICAgIGlvQ2xpZW50T3B0aW9uczoge1xuICAgICAgICAvL2ZvcmNlTmV3OiB0cnVlXG4gICAgICAgIHJlY29ubmVjdGlvbjogZmFsc2VcbiAgICB9LFxuICAgIHVwZGF0ZUludGVydmFsOiA1MCxcbiAgICByZW5kZXJMYXRlbmN5OiAxMDAsXG4gICAgcGh5c2ljc1NjYWxlOiAyMCxcbiAgICBmcmFtZVJhdGU6ICgxIC8gNjApLFxuICAgIHRpbWVTeW5jRnJlcTogMTAsXG4gICAgcGh5c2ljc1Byb3BlcnRpZXM6IHtcbiAgICAgICAgU2hpcDoge1xuICAgICAgICAgICAgbWFzczogMTBcbiAgICAgICAgfSxcbiAgICAgICAgQXN0ZXJvaWQ6IHtcbiAgICAgICAgICAgIG1hc3M6IDIwXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdhbWVyVGFnczoge1xuICAgICAgICAxOiBbXG4gICAgICAgICAgICAnc3VwZXInLFxuICAgICAgICAgICAgJ2F3ZXNvbWUnLFxuICAgICAgICAgICAgJ3JhaW5ib3cnLFxuICAgICAgICAgICAgJ2RvdWJsZScsXG4gICAgICAgICAgICAndHJpcGxlJyxcbiAgICAgICAgICAgICd2YW1waXJlJyxcbiAgICAgICAgICAgICdwcmluY2VzcycsXG4gICAgICAgICAgICAnaWNlJyxcbiAgICAgICAgICAgICdmaXJlJyxcbiAgICAgICAgICAgICdyb2JvdCcsXG4gICAgICAgICAgICAnd2VyZXdvbGYnLFxuICAgICAgICAgICAgJ3NwYXJrbGUnLFxuICAgICAgICAgICAgJ2luZmluaXRlJyxcbiAgICAgICAgICAgICdjb29sJyxcbiAgICAgICAgICAgICd5b2xvJyxcbiAgICAgICAgICAgICdzd2FnZ3knLFxuICAgICAgICAgICAgJ3pvbWJpZScsXG4gICAgICAgICAgICAnc2FtdXJhaScsXG4gICAgICAgICAgICAnZGFuY2luZycsXG4gICAgICAgICAgICAncG93ZXInLFxuICAgICAgICAgICAgJ2dvbGQnLFxuICAgICAgICAgICAgJ3NpbHZlcicsXG4gICAgICAgICAgICAncmFkaW9hY3RpdmUnLFxuICAgICAgICAgICAgJ3F1YW50dW0nLFxuICAgICAgICAgICAgJ2JyaWxsaWFudCcsXG4gICAgICAgICAgICAnbWlnaHR5JyxcbiAgICAgICAgICAgICdyYW5kb20nXG4gICAgICAgIF0sXG4gICAgICAgIDI6IFtcbiAgICAgICAgICAgICd0aWdlcicsXG4gICAgICAgICAgICAnbmluamEnLFxuICAgICAgICAgICAgJ3ByaW5jZXNzJyxcbiAgICAgICAgICAgICdyb2JvdCcsXG4gICAgICAgICAgICAncG9ueScsXG4gICAgICAgICAgICAnZGFuY2VyJyxcbiAgICAgICAgICAgICdyb2NrZXInLFxuICAgICAgICAgICAgJ21hc3RlcicsXG4gICAgICAgICAgICAnaGFja2VyJyxcbiAgICAgICAgICAgICdyYWluYm93JyxcbiAgICAgICAgICAgICdraXR0ZW4nLFxuICAgICAgICAgICAgJ3B1cHB5JyxcbiAgICAgICAgICAgICdib3NzJyxcbiAgICAgICAgICAgICd3aXphcmQnLFxuICAgICAgICAgICAgJ2hlcm8nLFxuICAgICAgICAgICAgJ2RyYWdvbicsXG4gICAgICAgICAgICAndHJpYnV0ZScsXG4gICAgICAgICAgICAnZ2VuaXVzJyxcbiAgICAgICAgICAgICdibGFzdGVyJyxcbiAgICAgICAgICAgICdzcGlkZXInXG4gICAgICAgIF1cbiAgICB9LFxuICAgIGluaXRpYWxCb2RpZXM6IFtcbiAgICAgICAge3R5cGU6ICdBc3Rlcm9pZCcsIG51bWJlcjogMjUsIGNvbmZpZzoge1xuICAgICAgICAgICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCd9LFxuICAgICAgICAgICAgdmVsb2NpdHk6IHtyYW5kb206ICd2ZWN0b3InLCBsbzogLTE1LCBoaTogMTV9LFxuICAgICAgICAgICAgYW5ndWxhclZlbG9jaXR5OiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogLTUsIGhpOiA1fSxcbiAgICAgICAgICAgIHZlY3RvclNjYWxlOiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogMC42LCBoaTogMS40fSxcbiAgICAgICAgICAgIG1hc3M6IDEwXG4gICAgICAgIH19LFxuICAgICAgICAvL3t0eXBlOiAnQ3J5c3RhbCcsIG51bWJlcjogMTAsIGNvbmZpZzoge1xuICAgICAgICAvLyAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJ30sXG4gICAgICAgIC8vICAgIHZlbG9jaXR5OiB7cmFuZG9tOiAndmVjdG9yJywgbG86IC00LCBoaTogNCwgbm9ybWFsOiB0cnVlfSxcbiAgICAgICAgLy8gICAgdmVjdG9yU2NhbGU6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAwLjQsIGhpOiAwLjh9LFxuICAgICAgICAvLyAgICBtYXNzOiA1XG4gICAgICAgIC8vfX1cbiAgICAgICAge3R5cGU6ICdIeWRyYScsIG51bWJlcjogMSwgY29uZmlnOiB7XG4gICAgICAgICAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJywgcGFkOiA1MH1cbiAgICAgICAgfX0sXG4gICAgICAgIHt0eXBlOiAnUGxhbmV0b2lkJywgbnVtYmVyOiA2LCBjb25maWc6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDMwfSxcbiAgICAgICAgICAgIGFuZ3VsYXJWZWxvY2l0eToge3JhbmRvbTogJ2Zsb2F0JywgbG86IC0yLCBoaTogMn0sXG4gICAgICAgICAgICB2ZWN0b3JTY2FsZTogMi41LFxuICAgICAgICAgICAgbWFzczogMTAwXG4gICAgICAgIH19LFxuICAgICAgICAvL3t0eXBlOiAnU3RhclRhcmdldCcsIG51bWJlcjogMTAsIGNvbmZpZzoge1xuICAgICAgICAvLyAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJywgcGFkOiAzMH0sXG4gICAgICAgIC8vICAgIHZlY3RvclNjYWxlOiAwLjUsXG4gICAgICAgIC8vICAgIHN0YXJzOiBbWzAsIDBdLCBbMSwxXSwgWy0xLDFdLCBbMSwtMV1dXG4gICAgICAgIC8vfX1cbiAgICAgICAgLy8gRklYTUU6IFRyZWVzIGp1c3QgZm9yIHRlc3RpbmdcbiAgICAgICAgLy97dHlwZTogJ1RyZWUnLCBudW1iZXI6IDEwLCBjb25maWc6IHtcbiAgICAgICAgLy8gICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCcsIHBhZDogMzB9LFxuICAgICAgICAvLyAgICB2ZWN0b3JTY2FsZTogMSxcbiAgICAgICAgLy8gICAgbWFzczogNVxuICAgICAgICAvL319XG4gICAgXVxufTtcblxudmFyIFN0YXJjb2RlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBJbml0aWFsaXplcnMgdmlydHVhbGl6ZWQgYWNjb3JkaW5nIHRvIHJvbGVcbiAgICB2YXIgY29uZmlncyA9IGFyZ3VtZW50c1swXTtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgdGhpcy5jb25maWcgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNvbmZpZ3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZXh0ZW5kQ29uZmlnKGNvbmZpZ3NbaV0pO1xuICAgIH1cbiAgICAvLyBIQUNLXG4gICAgdGhpcy5leHRlbmRDb25maWcoY29uZmlnKTtcbiAgICB0aGlzLmJhbm5lcigpO1xuICAgIHRoaXMuaW5pdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAvL3RoaXMuaW5pdE5ldC5jYWxsKHRoaXMpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5leHRlbmRDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgZm9yICh2YXIgayBpbiBjb25maWcpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWdba10gPSBjb25maWdba107XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vLyBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgY29tbW9uIGNvbmZpZyBvcHRpb25zXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAnd29ybGRXaWR0aCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzJdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyV2lkdGgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiAodGhpcy5jb25maWcud29ybGRCb3VuZHNbMl0gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1swXSk7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAnd29ybGRIZWlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlckhlaWdodCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqICh0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdKTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJMZWZ0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyVG9wJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMV07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyUmlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1syXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJCb3R0b20nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXTtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBBZGQgbWl4aW4gcHJvcGVydGllcyB0byB0YXJnZXQuIEFkYXB0ZWQgKHNsaWdodGx5KSBmcm9tIFBoYXNlclxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXRcbiAqIEBwYXJhbSB7b2JqZWN0fSBtaXhpblxuICovXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUgPSBmdW5jdGlvbiAodGFyZ2V0LCBtaXhpbikge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobWl4aW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgdmFyIHZhbCA9IG1peGluW2tleV07XG4gICAgICAgIGlmICh2YWwgJiZcbiAgICAgICAgICAgICh0eXBlb2YgdmFsLmdldCA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgdmFsLnNldCA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgdmFsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gdmFsO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBMaWdodHdlaWdodCBjb21wb25lbnQgaW1wbGVtZW50YXRpb24sIG1vcmUgZm9yIGxvZ2ljYWwgdGhhbiBmdW5jdGlvbmFsIG1vZHVsYXJpdHlcbiAqXG4gKiBAcGFyYW0gbWl4aW4ge29iamVjdH0gLSBQT0pPIHdpdGggbWV0aG9kcyAvIHByb3BlcnRpZXMgdG8gYmUgYWRkZWQgdG8gcHJvdG90eXBlLCB3aXRoIG9wdGlvbmFsIGluaXQgbWV0aG9kXG4gKi9cblN0YXJjb2Rlci5wcm90b3R5cGUuaW1wbGVtZW50RmVhdHVyZSA9IGZ1bmN0aW9uIChtaXhpbikge1xuICAgIGZvciAodmFyIHByb3AgaW4gbWl4aW4pIHtcbiAgICAgICAgc3dpdGNoIChwcm9wKSB7XG4gICAgICAgICAgICBjYXNlICdvbkNvbm5lY3RDQic6XG4gICAgICAgICAgICBjYXNlICdvblJlYWR5Q0InOlxuICAgICAgICAgICAgY2FzZSAnb25Mb2dpbkNCJzpcbiAgICAgICAgICAgIGNhc2UgJ29uRGlzY29ubmVjdENCJzpcbiAgICAgICAgICAgICAgICB0aGlzW3Byb3BdLnB1c2gobWl4aW5bcHJvcF0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaW5pdCc6XG4gICAgICAgICAgICAgICAgYnJlYWs7ICAgICAgLy8gTm9PcFxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBTdGFyY29kZXIucHJvdG90eXBlW3Byb3BdID0gbWl4aW5bcHJvcF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1peGluLmluaXQpIHtcbiAgICAgICAgbWl4aW4uaW5pdC5jYWxsKHRoaXMpO1xuICAgIH1cbn07XG5cbi8qKlxuICogQ3VzdG9tIGxvZ2dpbmcgZnVuY3Rpb24gdG8gYmUgZmVhdHVyZWZpZWQgYXMgbmVjZXNzYXJ5XG4gKi9cblN0YXJjb2Rlci5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFyY29kZXI7XG4iLCIvKipcbiAqIENvZGVFbmRwb2ludENsaWVudC5qc1xuICpcbiAqIE1ldGhvZHMgZm9yIHNlbmRpbmcgY29kZSB0byBzZXJ2ZXIgYW5kIGRlYWxpbmcgd2l0aCBjb2RlIHJlbGF0ZWQgcmVzcG9uc2VzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2VuZENvZGU6IGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2NvZGUnLCBjb2RlKTtcbiAgICB9XG59OyIsIi8qKlxuICogRE9NSW50ZXJmYWNlLmpzXG4gKlxuICogSGFuZGxlIERPTSBjb25maWd1cmF0aW9uL2ludGVyYWN0aW9uLCBpLmUuIG5vbi1QaGFzZXIgc3R1ZmZcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5kb20gPSB7fTsgICAgICAgICAgICAgIC8vIG5hbWVzcGFjZVxuICAgICAgICB0aGlzLmRvbS5jb2RlQnV0dG9uID0gJCgnI2NvZGUtYnRuJyk7XG4gICAgICAgIHRoaXMuZG9tLmNvZGVQb3B1cCA9ICQoJyNjb2RlLXBvcHVwJyk7XG4gICAgICAgIHRoaXMuZG9tLmxvZ2luUG9wdXA9ICQoJyNsb2dpbicpO1xuICAgICAgICB0aGlzLmRvbS5sb2dpbkJ1dHRvbiA9ICQoJyNzdWJtaXQnKTtcblxuICAgICAgICB0aGlzLmRvbS5jb2RlQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZG9tLmNvZGVQb3B1cC50b2dnbGUoJ3Nsb3cnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudC5zb3VyY2UgPT09IHNlbGYuZG9tLmNvZGVQb3B1cFswXS5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZW5kQ29kZShldmVudC5vcmlnaW5hbEV2ZW50LmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL3RoaXMuZG9tLmNvZGVQb3B1cC5oaWRlKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IDI7IGkrKykge1xuICAgICAgICAgICAgdmFyIHRhZ3MgPSB0aGlzLmNvbmZpZy5nYW1lclRhZ3NbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMCwgbCA9IHRhZ3MubGVuZ3RoOyBqIDwgbDsgaisrKSB7XG4gICAgICAgICAgICAgICAgJCgnI2d0JyArIGkpLmFwcGVuZCgnPG9wdGlvbj4nICsgdGFnc1tqXSArICc8L29wdGlvbj4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAkKCcuc2VsZWN0Jykuc2VsZWN0bWVudSgpO1xuICAgICAgICAkKCcubG9naW5idXR0b24nKS5idXR0b24oe2ljb25zOiB7cHJpbWFyeTogJ3VpLWljb24tdHJpYW5nbGUtMS1lJ319KTtcblxuICAgICAgICAkKCcuYWNjb3JkaW9uJykuYWNjb3JkaW9uKHtoZWlnaHRTdHlsZTogJ2NvbnRlbnQnfSk7XG4gICAgICAgICQoJy5oaWRkZW4nKS5oaWRlKCk7XG5cbiAgICB9LFxuXG4gICAgbGF5b3V0RE9NU3BhY2VTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCcjY29kZS1idG4nKS5zaG93KCkucG9zaXRpb24oe215OiAnbGVmdCBib3R0b20nLCBhdDogJ2xlZnQgYm90dG9tJywgb2Y6ICcjbWFpbid9KTtcbiAgICAgICAgJCgnI2NvZGUtcG9wdXAnKS5wb3NpdGlvbih7bXk6ICdjZW50ZXInLCBhdDogJ2NlbnRlcicsIG9mOiB3aW5kb3d9KTtcbiAgICB9LFxuXG4gICAgc2hvd0xvZ2luOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgJCgnI2xvZ2luLXdpbmRvdyAubWVzc2FnZScpLmhpZGUoKTtcbiAgICAgICAgJCgnI2xvZ2luLXdpbmRvdycpLnNob3coKS5wb3NpdGlvbih7bXk6ICdjZW50ZXInLCBhdDogJ2NlbnRlcicsIG9mOiB3aW5kb3d9KTtcbiAgICAgICAgJCgnI3VzZXJsb2dpbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuc2VydmVyTG9naW4oJCgnI3VzZXJuYW1lJykudmFsKCksICQoJyNwYXNzd29yZCcpLnZhbCgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJyNndWVzdGxvZ2luJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5zZXJ2ZXJMb2dpbigkKCcjZ3QxJykudmFsKCkgKyAnICcgKyAkKCcjZ3QyJykudmFsKCkpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgc2V0TG9naW5FcnJvcjogZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIHZhciBtc2cgPSAkKCcjbG9naW4td2luZG93IC5tZXNzYWdlJyk7XG4gICAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgICAgIG1zZy5oaWRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtc2cuaHRtbChlcnJvcik7XG4gICAgICAgICAgICBtc2cuc2hvdygpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGhpZGVMb2dpbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCcjbG9naW4td2luZG93JykuaGlkZSgpO1xuICAgIH1cbn07IiwiLyoqXG4gKiBGbGV4VGV4dFdyYXBwZXIuanNcbiAqXG4gKiBUaGluIGNvbnZlbmllbmNlIHdyYXBwZXIgYXJvdW5kIFBoYXNlciB0ZXh0IG1ldGhvZHNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBtYWtlRmxleFRleHQ6IGZ1bmN0aW9uICh4LCB5LCB0ZXh0LCBzdHlsZSkge1xuICAgICAgICBpZiAoc3R5bGUuYml0bWFwKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcFRleHQoeCwgeSwgc3R5bGUuYml0bWFwLCBzdHlsZS5zaXplLCBzdHlsZS5hbGlnbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0ID0gdGhpcy5nYW1lLm1ha2UudGV4dCh4LCB5LCB0ZXh0LCBzdHlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfSxcblxuICAgIGFkZEZsZXhUZXh0OiBmdW5jdGlvbiAoeCwgeSwgdGV4dCwgc3R5bGUsIGdyb3VwKSB7XG4gICAgICAgIHZhciB0ID0gdGhpcy5tYWtlRmxleFRleHQoeCwgeSwgdGV4dCwgc3R5bGUpO1xuICAgICAgICBncm91cCA9IGdyb3VwIHx8IHRoaXMud29ybGQ7XG4gICAgICAgIGdyb3VwLmFkZCh0KTtcbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfVxufTsiLCIvKipcbiAqIExlYWRlckJvYXJkQ2xpZW50LmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxlYWRlckJvYXJkID0ge307XG4gICAgICAgIHRoaXMubGVhZGVyQm9hcmRDYXRzID0gW107XG4gICAgICAgIHRoaXMubGVhZGVyQm9hcmRTdGF0ZSA9IG51bGw7XG4gICAgfSxcblxuICAgIG9uQ29ubmVjdENCOiBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc29ja2V0Lm9uKCdsZWFkZXJib2FyZCcsIGZ1bmN0aW9uIChsYikge1xuICAgICAgICAgICAgZm9yICh2YXIgY2F0IGluIGxiKSB7XG4gICAgICAgICAgICAgICAgLy8gUmVjb3JkIG5ldyBjYXRlZ29yeVxuICAgICAgICAgICAgICAgIGlmICghKGNhdCBpbiBzZWxmLmxlYWRlckJvYXJkKSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmxlYWRlckJvYXJkQ2F0cy5wdXNoKGNhdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IGN5Y2xpbmcgaWYgdGhpcyBpcyBmaXJzdCBjYXRlZ29yeVxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmxlYWRlckJvYXJkU3RhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sZWFkZXJCb2FyZFN0YXRlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nYW1lLmxlYWRlcmJvYXJkLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBzZXRJbnRlcnZhbChzZWxmLmN5Y2xlTGVhZGVyQm9hcmQuYmluZChzZWxmKSwgc2VsZi5jb25maWcubGVhZGVyQm9hcmRDbGllbnRDeWNsZSB8fCA1MDAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRGlzcGxheSBpZiB1cGRhdGVkIGJvYXJkIGlzIHNob3dpbmdcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5sZWFkZXJCb2FyZENhdHNbc2VsZi5sZWFkZXJCb2FyZFN0YXRlXSA9PT0gY2F0KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2FtZS5sZWFkZXJib2FyZC5zZXRDb250ZW50KGNhdCwgbGJbY2F0XSwgc2VsZi5wbGF5ZXIuaWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNlbGYubGVhZGVyQm9hcmRbY2F0XSA9IGxiW2NhdF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIGN5Y2xlTGVhZGVyQm9hcmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sZWFkZXJCb2FyZFN0YXRlID0gKHRoaXMubGVhZGVyQm9hcmRTdGF0ZSArIDEpICUgdGhpcy5sZWFkZXJCb2FyZENhdHMubGVuZ3RoO1xuICAgICAgICB2YXIgY2F0ID0gdGhpcy5sZWFkZXJCb2FyZENhdHNbdGhpcy5sZWFkZXJCb2FyZFN0YXRlXTtcbiAgICAgICAgdGhpcy5nYW1lLmxlYWRlcmJvYXJkLnNldENvbnRlbnQoY2F0LCB0aGlzLmxlYWRlckJvYXJkW2NhdF0sIHRoaXMucGxheWVyLmlkKTtcbiAgICB9XG59OyIsIi8qKlxuICogTWV0aG9kIGZvciBkcmF3aW5nIHN0YXJmaWVsZHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByYW5kb21Ob3JtYWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHQgPSAwO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8NjsgaSsrKSB7XG4gICAgICAgICAgICB0ICs9IHRoaXMuZ2FtZS5ybmQubm9ybWFsKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQvNjtcbiAgICB9LFxuXG4gICAgZHJhd1N0YXI6IGZ1bmN0aW9uIChjdHgsIHgsIHksIGQsIGNvbG9yKSB7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oeC1kKzEsIHktZCsxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4K2QtMSwgeStkLTEpO1xuICAgICAgICBjdHgubW92ZVRvKHgtZCsxLCB5K2QtMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeCtkLTEsIHktZCsxKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LCB5LWQpO1xuICAgICAgICBjdHgubGluZVRvKHgsIHkrZCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oeC1kLCB5KTtcbiAgICAgICAgY3R4LmxpbmVUbyh4K2QsIHkpO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfSxcblxuICAgIGRyYXdTdGFyRmllbGQ6IGZ1bmN0aW9uIChjdHgsIHNpemUsIG4pIHtcbiAgICAgICAgdmFyIHhtID0gTWF0aC5yb3VuZChzaXplLzIgKyB0aGlzLnJhbmRvbU5vcm1hbCgpKnNpemUvNCk7XG4gICAgICAgIHZhciB5bSA9IE1hdGgucm91bmQoc2l6ZS8yICsgdGhpcy5yYW5kb21Ob3JtYWwoKSpzaXplLzQpO1xuICAgICAgICB2YXIgcXVhZHMgPSBbWzAsMCx4bS0xLHltLTFdLCBbeG0sMCxzaXplLTEseW0tMV0sXG4gICAgICAgICAgICBbMCx5bSx4bS0xLHNpemUtMV0sIFt4bSx5bSxzaXplLTEsc2l6ZS0xXV07XG4gICAgICAgIHZhciBjb2xvcjtcbiAgICAgICAgdmFyIGksIGosIGwsIHE7XG5cbiAgICAgICAgbiA9IE1hdGgucm91bmQobi80KTtcbiAgICAgICAgZm9yIChpPTAsIGw9cXVhZHMubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgICAgICAgICAgcSA9IHF1YWRzW2ldO1xuICAgICAgICAgICAgZm9yIChqPTA7IGo8bjsgaisrKSB7XG4gICAgICAgICAgICAgICAgY29sb3IgPSAnaHNsKDYwLDEwMCUsJyArIHRoaXMuZ2FtZS5ybmQuYmV0d2Vlbig5MCw5OSkgKyAnJSknO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1N0YXIoY3R4LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWUucm5kLmJldHdlZW4ocVswXSs3LCBxWzJdLTcpLCB0aGlzLmdhbWUucm5kLmJldHdlZW4ocVsxXSs3LCBxWzNdLTcpLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWUucm5kLmJldHdlZW4oMiw0KSwgY29sb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTsiLCIvKipcbiAqIFdvcmxkQXBpLmpzXG4gKlxuICogQWRkL3JlbW92ZS9tYW5pcHVsYXRlIGJvZGllcyBpbiBjbGllbnQncyBwaHlzaWNzIHdvcmxkXG4gKi9cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogQWRkIGJvZHkgdG8gd29ybGQgb24gY2xpZW50IHNpZGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0eXBlIHtzdHJpbmd9IC0gdHlwZSBuYW1lIG9mIG9iamVjdCB0byBhZGRcbiAgICAgKiBAcGFyYW0gY29uZmlnIHtvYmplY3R9IC0gcHJvcGVydGllcyBmb3IgbmV3IG9iamVjdFxuICAgICAqIEByZXR1cm5zIHtQaGFzZXIuU3ByaXRlfSAtIG5ld2x5IGFkZGVkIG9iamVjdFxuICAgICAqL1xuICAgIGFkZEJvZHk6IGZ1bmN0aW9uICh0eXBlLCBjb25maWcpIHtcbiAgICAgICAgdmFyIGN0b3IgPSBib2R5VHlwZXNbdHlwZV07XG4gICAgICAgIHZhciBwbGF5ZXJTaGlwID0gZmFsc2U7XG4gICAgICAgIGlmICghY3Rvcikge1xuICAgICAgICAgICAgdGhpcy5sb2coJ1Vua25vd24gYm9keSB0eXBlOicsIHR5cGUpO1xuICAgICAgICAgICAgdGhpcy5sb2coY29uZmlnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gJ1NoaXAnICYmIGNvbmZpZy5wcm9wZXJ0aWVzLnBsYXllcmlkID09PSB0aGlzLnBsYXllci5pZCkge1xuICAgICAgICAgICAgLy9jb25maWcudGFnID0gdGhpcy5wbGF5ZXIudXNlcm5hbWU7XG4gICAgICAgICAgICAvL2lmIChjb25maWcucHJvcGVydGllcy5wbGF5ZXJpZCA9PT0gdGhpcy5wbGF5ZXIuaWQpIHtcbiAgICAgICAgICAgIC8vIE9ubHkgdGhlIHBsYXllcidzIG93biBzaGlwIGlzIHRyZWF0ZWQgYXMgZHluYW1pYyBpbiB0aGUgbG9jYWwgcGh5c2ljcyBzaW1cbiAgICAgICAgICAgIGNvbmZpZy5tYXNzID0gdGhpcy5jb25maWcuc2hpcE1hc3M7XG4gICAgICAgICAgICBwbGF5ZXJTaGlwID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vfVxuICAgICAgICB9XG4gICAgICAgIHZhciBib2R5ID0gbmV3IGN0b3IodGhpcy5nYW1lLCBjb25maWcpO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ1NoaXAnKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXllck1hcFtjb25maWcucHJvcGVydGllcy5wbGF5ZXJpZF0gPSBib2R5O1xuICAgICAgICB9XG4gICAgICAgIC8vdGhpcy5nYW1lLmFkZC5leGlzdGluZyhib2R5KTtcbiAgICAgICAgdGhpcy5nYW1lLnBsYXlmaWVsZC5hZGQoYm9keSk7XG4gICAgICAgIGlmIChwbGF5ZXJTaGlwKSB7XG4gICAgICAgICAgICB0aGlzLmdhbWUuY2FtZXJhLmZvbGxvdyhib2R5KTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5wbGF5ZXJTaGlwID0gYm9keTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYm9keTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlQm9keTogZnVuY3Rpb24gKHNwcml0ZSkge1xuICAgICAgICAvL3Nwcml0ZS5raWxsKCk7XG4gICAgICAgIHNwcml0ZS5kZXN0cm95KCk7XG4gICAgICAgIC8vIFJlbW92ZSBtaW5pc3ByaXRlXG4gICAgICAgIGlmIChzcHJpdGUubWluaXNwcml0ZSkge1xuICAgICAgICAgICAgLy9zcHJpdGUubWluaXNwcml0ZS5raWxsKCk7XG4gICAgICAgICAgICBzcHJpdGUubWluaXNwcml0ZS5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgLy90aGlzLmdhbWUucGh5c2ljcy5wMi5yZW1vdmVCb2R5KHNwcml0ZS5ib2R5KTtcbiAgICB9XG59O1xuXG52YXIgYm9keVR5cGVzID0ge1xuICAgIFNoaXA6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9TaGlwLmpzJyksXG4gICAgQXN0ZXJvaWQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9Bc3Rlcm9pZC5qcycpLFxuICAgIENyeXN0YWw6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9DcnlzdGFsLmpzJyksXG4gICAgQnVsbGV0OiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvQnVsbGV0LmpzJyksXG4gICAgR2VuZXJpY09yYjogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0dlbmVyaWNPcmIuanMnKSxcbiAgICBQbGFuZXRvaWQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9QbGFuZXRvaWQuanMnKSxcbiAgICBUcmVlOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVHJlZS5qcycpLFxuICAgIFRyYWN0b3JCZWFtOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVHJhY3RvckJlYW0uanMnKSxcbiAgICBTdGFyVGFyZ2V0OiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvU3RhclRhcmdldC5qcycpXG59O1xuXG4iLCIvKiogY2xpZW50LmpzXG4gKlxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgU3RhcmNvZGVyIGdhbWUgY2xpZW50XG4gKlxuICogQHR5cGUge1N0YXJjb2RlcnxleHBvcnRzfVxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8vcmVxdWlyZSgnLi9CbG9ja2x5Q3VzdG9tLmpzJyk7XG5cbnZhciBjb21tb25Db25maWcgPSByZXF1aXJlKCcuL2NvbW1vbi9jb25maWcuanMnKTtcbnZhciBjbGllbnRDb25maWcgPSByZXF1aXJlKCcuL2NsaWVudC9jb25maWcuanMnKTtcbnZhciBidWlsZENvbmZpZyA9IGJ1aWxkQ29uZmlnIHx8IHt9O1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG5cbi8vIEBCVUlMRENPTkZJR0BcblxuLy8gQEJVSUxEVElNRUBcblxuLy9sb2NhbFN0b3JhZ2UuZGVidWcgPSAnJzsgICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2VkIHRvIHRvZ2dsZSBzb2NrZXQuaW8gZGVidWdnaW5nXG5cbi8vZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbi8vICAgIHZhciBzdGFyY29kZXIgPSBuZXcgU3RhcmNvZGVyKCk7XG4vLyAgICBzdGFyY29kZXIuc3RhcnQoKTtcbi8vfSk7XG5cbi8vIHRlc3RcblxuJChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHN0YXJjb2RlciA9IG5ldyBTdGFyY29kZXIoW2NvbW1vbkNvbmZpZywgY2xpZW50Q29uZmlnLCBidWlsZENvbmZpZ10pO1xuICAgIHN0YXJjb2Rlci5zdGFydCgpO1xufSk7XG4iLCIvKipcbiAqIGNvbmZpZy5qc1xuICpcbiAqIGNsaWVudCBzaWRlIGNvbmZpZ1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGlvQ2xpZW50T3B0aW9uczoge1xuICAgICAgICAvL2ZvcmNlTmV3OiB0cnVlXG4gICAgICAgIHJlY29ubmVjdGlvbjogZmFsc2VcbiAgICB9LFxuICAgIGZvbnRzOiB7XG4gICAgICAgIGh1ZENvZGU6IHtmb250OiAnMjZweCBBcmlhbCcsIGZpbGw6ICcjMDBmZmZmJywgYWxpZ246ICdjZW50ZXInfSxcbiAgICAgICAgbGVhZGVyQm9hcmQ6IHtmb250OiAnMThweCBBcmlhbCcsIGZpbGw6ICcjMDAwMGZmJ30sXG4gICAgICAgIGxlYWRlckJvYXJkVGl0bGU6IHtmb250OiAnYm9sZCAyMHB4IEFyaWFsJywgYWxpZ246ICdjZW50ZXInLCBmaWxsOiAnI2ZmMDAwMCd9XG4gICAgfSxcbiAgICBnYW1lclRhZ3M6IHtcbiAgICAgICAgMTogW1xuICAgICAgICAgICAgJ3N1cGVyJyxcbiAgICAgICAgICAgICdhd2Vzb21lJyxcbiAgICAgICAgICAgICdyYWluYm93JyxcbiAgICAgICAgICAgICdkb3VibGUnLFxuICAgICAgICAgICAgJ3RyaXBsZScsXG4gICAgICAgICAgICAndmFtcGlyZScsXG4gICAgICAgICAgICAncHJpbmNlc3MnLFxuICAgICAgICAgICAgJ2ljZScsXG4gICAgICAgICAgICAnZmlyZScsXG4gICAgICAgICAgICAncm9ib3QnLFxuICAgICAgICAgICAgJ3dlcmV3b2xmJyxcbiAgICAgICAgICAgICdzcGFya2xlJyxcbiAgICAgICAgICAgICdpbmZpbml0ZScsXG4gICAgICAgICAgICAnY29vbCcsXG4gICAgICAgICAgICAneW9sbycsXG4gICAgICAgICAgICAnc3dhZ2d5JyxcbiAgICAgICAgICAgICd6b21iaWUnLFxuICAgICAgICAgICAgJ3NhbXVyYWknLFxuICAgICAgICAgICAgJ2RhbmNpbmcnLFxuICAgICAgICAgICAgJ3Bvd2VyJyxcbiAgICAgICAgICAgICdnb2xkJyxcbiAgICAgICAgICAgICdzaWx2ZXInLFxuICAgICAgICAgICAgJ3JhZGlvYWN0aXZlJyxcbiAgICAgICAgICAgICdxdWFudHVtJyxcbiAgICAgICAgICAgICdicmlsbGlhbnQnLFxuICAgICAgICAgICAgJ21pZ2h0eScsXG4gICAgICAgICAgICAncmFuZG9tJ1xuICAgICAgICBdLFxuICAgICAgICAyOiBbXG4gICAgICAgICAgICAndGlnZXInLFxuICAgICAgICAgICAgJ25pbmphJyxcbiAgICAgICAgICAgICdwcmluY2VzcycsXG4gICAgICAgICAgICAncm9ib3QnLFxuICAgICAgICAgICAgJ3BvbnknLFxuICAgICAgICAgICAgJ2RhbmNlcicsXG4gICAgICAgICAgICAncm9ja2VyJyxcbiAgICAgICAgICAgICdtYXN0ZXInLFxuICAgICAgICAgICAgJ2hhY2tlcicsXG4gICAgICAgICAgICAncmFpbmJvdycsXG4gICAgICAgICAgICAna2l0dGVuJyxcbiAgICAgICAgICAgICdwdXBweScsXG4gICAgICAgICAgICAnYm9zcycsXG4gICAgICAgICAgICAnd2l6YXJkJyxcbiAgICAgICAgICAgICdoZXJvJyxcbiAgICAgICAgICAgICdkcmFnb24nLFxuICAgICAgICAgICAgJ3RyaWJ1dGUnLFxuICAgICAgICAgICAgJ2dlbml1cycsXG4gICAgICAgICAgICAnYmxhc3RlcicsXG4gICAgICAgICAgICAnc3BpZGVyJ1xuICAgICAgICBdXG4gICAgfVxufTsiLCIvKipcbiAqIFBhdGguanNcbiAqXG4gKiBWZWN0b3IgcGF0aHMgc2hhcmVkIGJ5IG11bHRpcGxlIGVsZW1lbnRzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFBJID0gTWF0aC5QSTtcbnZhciBUQVUgPSAyKlBJO1xudmFyIHNpbiA9IE1hdGguc2luO1xudmFyIGNvcyA9IE1hdGguY29zO1xuXG5leHBvcnRzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uIChwYXRoLCBzY2FsZSwgeCwgeSwgY2xvc2UpIHtcbiAgICBwYXRoID0gcGF0aC5zbGljZSgpO1xuICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICBpZiAoY2xvc2UpIHtcbiAgICAgICAgcGF0aC5wdXNoKHBhdGhbMF0pO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHBhdGgubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBvID0ge3g6IHBhdGhbaV1bMF0gKiBzY2FsZSArIHgsIHk6IHBhdGhbaV1bMV0gKiBzY2FsZSArIHl9O1xuICAgICAgICBvdXRwdXQucHVzaChvKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbmV4cG9ydHMub2N0YWdvbiA9IFtcbiAgICBbMiwxXSxcbiAgICBbMSwyXSxcbiAgICBbLTEsMl0sXG4gICAgWy0yLDFdLFxuICAgIFstMiwtMV0sXG4gICAgWy0xLC0yXSxcbiAgICBbMSwtMl0sXG4gICAgWzIsLTFdXG5dO1xuXG5leHBvcnRzLmQyY3Jvc3MgPSBbXG4gICAgWy0xLC0yXSxcbiAgICBbLTEsMl0sXG4gICAgWzIsLTFdLFxuICAgIFstMiwtMV0sXG4gICAgWzEsMl0sXG4gICAgWzEsLTJdLFxuICAgIFstMiwxXSxcbiAgICBbMiwxXVxuXTtcblxuZXhwb3J0cy5zcXVhcmUwID0gW1xuICAgIFstMSwtMl0sXG4gICAgWzIsLTFdLFxuICAgIFsxLDJdLFxuICAgIFstMiwxXVxuXTtcblxuZXhwb3J0cy5zcXVhcmUxID0gW1xuICAgIFsxLC0yXSxcbiAgICBbMiwxXSxcbiAgICBbLTEsMl0sXG4gICAgWy0yLC0xXVxuXTtcblxuZXhwb3J0cy5zdGFyID0gW1xuICAgIFtzaW4oMCksIGNvcygwKV0sXG4gICAgW3NpbigyKlRBVS81KSwgY29zKDIqVEFVLzUpXSxcbiAgICBbc2luKDQqVEFVLzUpLCBjb3MoNCpUQVUvNSldLFxuICAgIFtzaW4oVEFVLzUpLCBjb3MoVEFVLzUpXSxcbiAgICBbc2luKDMqVEFVLzUpLCBjb3MoMypUQVUvNSldXG5dO1xuXG5leHBvcnRzLk9DVFJBRElVUyA9IE1hdGguc3FydCg1KTsiLCIvKipcbiAqIFVwZGF0ZVByb3BlcnRpZXMuanNcbiAqXG4gKiBDbGllbnQvc2VydmVyIHN5bmNhYmxlIHByb3BlcnRpZXMgZm9yIGdhbWUgb2JqZWN0c1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaGlwID0gZnVuY3Rpb24gKCkge307XG5TaGlwLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lV2lkdGgnLCAnbGluZUNvbG9yJywgJ2ZpbGxDb2xvcicsICdmaWxsQWxwaGEnLFxuICAgICd2ZWN0b3JTY2FsZScsICdzaGFwZScsICdzaGFwZUNsb3NlZCcsICdwbGF5ZXJpZCcsICdjcnlzdGFscycsICdkZWFkJywgJ3RhZycsICdjaGFyZ2UnLCAndHJlZXMnXTtcblxudmFyIEFzdGVyb2lkID0gZnVuY3Rpb24gKCkge307XG5Bc3Rlcm9pZC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsndmVjdG9yU2NhbGUnXTtcblxudmFyIENyeXN0YWwgPSBmdW5jdGlvbiAoKSB7fTtcbkNyeXN0YWwucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3ZlY3RvclNjYWxlJ107XG5cbnZhciBHZW5lcmljT3JiID0gZnVuY3Rpb24gKCkge307XG5HZW5lcmljT3JiLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lQ29sb3InLCAndmVjdG9yU2NhbGUnXTtcblxudmFyIFBsYW5ldG9pZCA9IGZ1bmN0aW9uICgpIHt9O1xuUGxhbmV0b2lkLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lQ29sb3InLCAnZmlsbENvbG9yJywgJ2xpbmVXaWR0aCcsICdmaWxsQWxwaGEnLCAndmVjdG9yU2NhbGUnLCAnb3duZXInXTtcblxudmFyIFRyZWUgPSBmdW5jdGlvbiAoKSB7fTtcblRyZWUucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3ZlY3RvclNjYWxlJywgJ2xpbmVDb2xvcicsICdncmFwaCcsICdzdGVwJywgJ2RlcHRoJ107XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoKSB7fTtcbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsnbGluZUNvbG9yJ107XG5cbnZhciBUcmFjdG9yQmVhbSA9IGZ1bmN0aW9uICgpIHt9O1xuVHJhY3RvckJlYW0ucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbXTtcblxudmFyIFN0YXJUYXJnZXQgPSBmdW5jdGlvbiAoKSB7fTtcblN0YXJUYXJnZXQucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3N0YXJzJywgJ2xpbmVDb2xvcicsICd2ZWN0b3JTY2FsZSddO1xuXG5cbmV4cG9ydHMuU2hpcCA9IFNoaXA7XG5leHBvcnRzLkFzdGVyb2lkID0gQXN0ZXJvaWQ7XG5leHBvcnRzLkNyeXN0YWwgPSBDcnlzdGFsO1xuZXhwb3J0cy5HZW5lcmljT3JiID0gR2VuZXJpY09yYjtcbmV4cG9ydHMuQnVsbGV0ID0gQnVsbGV0O1xuZXhwb3J0cy5QbGFuZXRvaWQgPSBQbGFuZXRvaWQ7XG5leHBvcnRzLlRyZWUgPSBUcmVlO1xuZXhwb3J0cy5UcmFjdG9yQmVhbSA9IFRyYWN0b3JCZWFtO1xuZXhwb3J0cy5TdGFyVGFyZ2V0ID0gU3RhclRhcmdldDtcbiIsIi8qKlxuICogY29uZmlnLmpzXG4gKlxuICogY29tbW9uIGNvbmZpZ1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHZlcnNpb246ICcwLjEnLFxuICAgIC8vc2VydmVyVXJpOiAnaHR0cDovL3BoYXJjb2Rlci1zaW5nbGUtMS5lbGFzdGljYmVhbnN0YWxrLmNvbTo4MDgwJyxcbiAgICAvL3NlcnZlclVyaTogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MScsXG4gICAgLy9zZXJ2ZXJBZGRyZXNzOiAnMS4yLjMuNCcsXG4gICAgd29ybGRCb3VuZHM6IFstMjAwLCAtMjAwLCAyMDAsIDIwMF0sXG4gICAgcGh5c2ljc1NjYWxlOiAyMCxcbiAgICByZW5kZXJMYXRlbmN5OiAxMDAsXG4gICAgZnJhbWVSYXRlOiAoMSAvIDYwKSxcbiAgICB0aW1lU3luY0ZyZXE6IDEwLFxuICAgIHNoaXBNYXNzOiAxMDAgICAgICAgICAgIC8vIFN0b3BnYXAgcGVuZGluZyBwaHlzaWNzIHJlZmFjdG9yXG59OyIsIi8qKlxuICogQXN0ZXJvaWQuanNcbiAqXG4gKiBDbGllbnQgc2lkZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuQXN0ZXJvaWQ7XG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcblxudmFyIEFzdGVyb2lkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xuICAgIC8vdGhpcy5ib2R5LmRhbXBpbmcgPSAwO1xufTtcblxuQXN0ZXJvaWQuYWRkID0gZnVuY3Rpb24gKGdhbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgYSA9IG5ldyBBc3Rlcm9pZChnYW1lLCBvcHRpb25zKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gYTtcbn07XG5cbkFzdGVyb2lkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBc3Rlcm9pZDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEFzdGVyb2lkLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShBc3Rlcm9pZC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuQXN0ZXJvaWQucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnI2ZmMDBmZic7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX2ZpbGxDb2xvciA9ICcjZmYwMDAwJztcbkFzdGVyb2lkLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuQXN0ZXJvaWQucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuQXN0ZXJvaWQucHJvdG90eXBlLl9maWxsQWxwaGEgPSAwLjI1O1xuQXN0ZXJvaWQucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5cbm1vZHVsZS5leHBvcnRzID0gQXN0ZXJvaWQ7XG4vL1N0YXJjb2Rlci5Bc3Rlcm9pZCA9IEFzdGVyb2lkO1xuIiwiLyoqXG4gKiBCdWxsZXQuanNcbiAqXG4gKiBDbGllbnQgc2lkZSBpbXBsZW1lbnRhdGlvbiBvZiBzaW1wbGUgcHJvamVjdGlsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxuLy92YXIgU2ltcGxlUGFydGljbGUgPSByZXF1aXJlKCcuL1NpbXBsZVBhcnRpY2xlLmpzJyk7XG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5CdWxsZXQ7XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG59O1xuXG5CdWxsZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcbkJ1bGxldC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCdWxsZXQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShCdWxsZXQucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEJ1bGxldC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuQnVsbGV0LnByb3RvdHlwZS52aXNpYmxlT25NYXAgPSBmYWxzZTtcbkJ1bGxldC5wcm90b3R5cGUuc2hhcmVkVGV4dHVyZUtleSA9ICdsYXNlcic7XG5cbkJ1bGxldC5wcm90b3R5cGUuZHJhd1Byb2NlZHVyZSA9IGZ1bmN0aW9uIChyZW5kZXJTY2FsZSwgZnJhbWUpIHtcbiAgICB2YXIgc2NhbGUgPSB0aGlzLmdhbWUucGh5c2ljcy5wMi5tcHhpKHRoaXMudmVjdG9yU2NhbGUpICogcmVuZGVyU2NhbGU7XG4gICAgdGhpcy5ncmFwaGljcy5saW5lU3R5bGUoNCwgUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMubGluZUNvbG9yKSwgMSk7XG4gICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8oMCwgMCk7XG4gICAgdGhpcy5ncmFwaGljcy5saW5lVG8oMCwgMSAqIHNjYWxlKTtcbiAgICB0aGlzLmdyYXBoaWNzLmxpbmVTdHlsZSgyLCAweGZmZmZmZiwgMC4yNSk7XG4gICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8oMCwgMCk7XG4gICAgdGhpcy5ncmFwaGljcy5saW5lVG8oMCwgMSAqIHNjYWxlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0OyIsIi8qKlxuICogQ3J5c3RhbC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuQ3J5c3RhbDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgQ3J5c3RhbCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkNyeXN0YWwuYWRkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIHZhciBhID0gbmV3IENyeXN0YWwoZ2FtZSwgY29uZmlnKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gYTtcbn07XG5cbkNyeXN0YWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcbkNyeXN0YWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ3J5c3RhbDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKENyeXN0YWwucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKENyeXN0YWwucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkNyeXN0YWwucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnIzAwZmZmZic7XG5DcnlzdGFsLnByb3RvdHlwZS5fZmlsbENvbG9yID0gJyMwMDAwMDAnO1xuQ3J5c3RhbC5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcbkNyeXN0YWwucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuQ3J5c3RhbC5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMDtcbkNyeXN0YWwucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5DcnlzdGFsLnByb3RvdHlwZS5fZ2VvbWV0cnkgPSBbXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLmQyY3Jvc3N9XG5dO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3J5c3RhbDtcbiIsIi8qKlxuICogR2VuZXJpY09yYi5qc1xuICpcbiAqIEJ1aWxkaW5nIGJsb2NrXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5HZW5lcmljT3JiO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBHZW5lcmljT3JiID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuR2VuZXJpY09yYi5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgdmFyIGEgPSBuZXcgR2VuZXJpY09yYihnYW1lLCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBhO1xufTtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmljT3JiO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoR2VuZXJpY09yYi5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoR2VuZXJpY09yYi5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmYwMDAwJztcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwMDAwMCc7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4wO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUuX2dlb21ldHJ5ID0gW1xuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5kMmNyb3NzfVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmljT3JiO1xuIiwiLyoqXG4gKiBQbGFuZXRvaWQuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlBsYW5ldG9pZDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgUGxhbmV0b2lkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG59O1xuXG5QbGFuZXRvaWQuYWRkID0gZnVuY3Rpb24gKGdhbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgcGxhbmV0b2lkID0gbmV3IFBsYW5ldG9pZChnYW1lLCBvcHRpb25zKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gcGxhbmV0b2lkO1xufTtcblxuUGxhbmV0b2lkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5QbGFuZXRvaWQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGxhbmV0b2lkO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoUGxhbmV0b2lkLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShQbGFuZXRvaWQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbi8vUGxhbmV0b2lkLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZjAwZmYnO1xuLy9QbGFuZXRvaWQucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwZmYwMCc7XG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMjU7XG5QbGFuZXRvaWQucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5QbGFuZXRvaWQucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5QbGFuZXRvaWQucHJvdG90eXBlLl9nZW9tZXRyeSA9IFtcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuZDJjcm9zc30sXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLnNxdWFyZTB9LFxuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5zcXVhcmUxfVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGFuZXRvaWQ7XG4iLCIvKipcbiAqIFNoaXAuanNcbiAqXG4gKiBDbGllbnQgc2lkZSBpbXBsZW1lbnRhdGlvblxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuU2hpcDtcbi8vdmFyIEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lLmpzJyk7XG4vL3ZhciBXZWFwb25zID0gcmVxdWlyZSgnLi9XZWFwb25zLmpzJyk7XG5cbnZhciBTaGlwID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xuXG4gICAgaWYgKGNvbmZpZy5tYXNzKSB7XG4gICAgICAgIHRoaXMuYm9keS5tYXNzID0gY29uZmlnLm1hc3M7XG4gICAgfVxuICAgIC8vdGhpcy5lbmdpbmUgPSBFbmdpbmUuYWRkKGdhbWUsICd0aHJ1c3QnLCA1MDApO1xuICAgIC8vdGhpcy5hZGRDaGlsZCh0aGlzLmVuZ2luZSk7XG4gICAgLy90aGlzLndlYXBvbnMgPSBXZWFwb25zLmFkZChnYW1lLCAnYnVsbGV0JywgMTIpO1xuICAgIC8vdGhpcy53ZWFwb25zLnNoaXAgPSB0aGlzO1xuICAgIC8vdGhpcy5hZGRDaGlsZCh0aGlzLndlYXBvbnMpO1xuICAgIHRoaXMudGFnVGV4dCA9IGdhbWUuYWRkLnRleHQoMCwgdGhpcy50ZXh0dXJlLmhlaWdodC8yICsgMSxcbiAgICAgICAgdGhpcy50YWcsIHtmb250OiAnYm9sZCAxOHB4IEFyaWFsJywgZmlsbDogdGhpcy5saW5lQ29sb3IgfHwgJyNmZmZmZmYnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICB0aGlzLnRhZ1RleHQuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLnRhZ1RleHQpO1xuICAgIHRoaXMubG9jYWxTdGF0ZSA9IHtcbiAgICAgICAgdGhydXN0OiAnb2ZmJ1xuICAgIH1cbiAgICB0aGlzLmdhbWUuaHVkLnNldExhc2VyQ29sb3IodGhpcy5saW5lQ29sb3IpO1xufTtcblxuU2hpcC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgb3B0aW9ucykge1xuICAgIHZhciBzID0gbmV3IFNoaXAoZ2FtZSwgb3B0aW9ucyk7XG4gICAgZ2FtZS5hZGQuZXhpc3Rpbmcocyk7XG4gICAgcmV0dXJuIHM7XG59O1xuXG5TaGlwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5TaGlwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNoaXA7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTaGlwLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTaGlwLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5TaGlwLnByb3RvdHlwZS5tYXBGYWN0b3IgPSAzO1xuXG4vL1NoaXAucHJvdG90eXBlLnNldExpbmVTdHlsZSA9IGZ1bmN0aW9uIChjb2xvciwgbGluZVdpZHRoKSB7XG4vLyAgICBTdGFyY29kZXIuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5zZXRMaW5lU3R5bGUuY2FsbCh0aGlzLCBjb2xvciwgbGluZVdpZHRoKTtcbi8vICAgIHRoaXMudGFnVGV4dC5zZXRTdHlsZSh7ZmlsbDogY29sb3J9KTtcbi8vfTtcblxuLy9TaGlwLnByb3RvdHlwZS5zaGFwZSA9IFtcbi8vICAgIFstMSwtMV0sXG4vLyAgICBbLTAuNSwwXSxcbi8vICAgIFstMSwxXSxcbi8vICAgIFswLDAuNV0sXG4vLyAgICBbMSwxXSxcbi8vICAgIFswLjUsMF0sXG4vLyAgICBbMSwtMV0sXG4vLyAgICBbMCwtMC41XSxcbi8vICAgIFstMSwtMV1cbi8vXTtcbi8vU2hpcC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDY7XG5cblNoaXAucHJvdG90eXBlLnVwZGF0ZVRleHR1cmVzID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEZJWE1FOiBQcm9iYWJseSBuZWVkIHRvIHJlZmFjdG9yIGNvbnN0cnVjdG9yIGEgYml0IHRvIG1ha2UgdGhpcyBjbGVhbmVyXG4gICAgVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGVUZXh0dXJlcy5jYWxsKHRoaXMpO1xuICAgIGlmICh0aGlzLnRhZ1RleHQpIHtcbiAgICAgICAgLy90aGlzLnRhZ1RleHQuc2V0U3R5bGUoe2ZpbGw6IHRoaXMubGluZUNvbG9yfSk7XG4gICAgICAgIHRoaXMudGFnVGV4dC5maWxsID0gdGhpcy5saW5lQ29sb3I7XG4gICAgICAgIHRoaXMudGFnVGV4dC55ID0gdGhpcy50ZXh0dXJlLmhlaWdodC8yICsgMTtcbiAgICB9XG59O1xuXG5TaGlwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzKTtcbiAgICAvLyBGSVhNRTogTmVlZCB0byBkZWFsIHdpdGggcGxheWVyIHZlcnN1cyBmb3JlaWduIHNoaXBzXG4gICAgc3dpdGNoICh0aGlzLmxvY2FsU3RhdGUudGhydXN0KSB7XG4gICAgICAgIGNhc2UgJ3N0YXJ0aW5nJzpcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnBsYXkoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RhcnRPbih0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdGF0ZS50aHJ1c3QgPSAnb24nO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NodXRkb3duJzpcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RvcE9uKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0YXRlLnRocnVzdCA9ICdvZmYnO1xuICAgIH1cbiAgICAvLyBQbGF5ZXIgc2hpcCBvbmx5XG4gICAgaWYgKHRoaXMuZ2FtZS5wbGF5ZXJTaGlwID09PSB0aGlzKSB7XG4gICAgICAgIC8vdGhpcy5nYW1lLmludmVudG9yeXRleHQuc2V0VGV4dCh0aGlzLmNyeXN0YWxzLnRvU3RyaW5nKCkpO1xuICAgICAgICB0aGlzLmdhbWUuaHVkLnNldENyeXN0YWxzKHRoaXMuY3J5c3RhbHMpO1xuICAgICAgICB0aGlzLmdhbWUuaHVkLnNldENoYXJnZSh0aGlzLmNoYXJnZSk7XG4gICAgICAgIHRoaXMuZ2FtZS5odWQuc2V0VHJlZXModGhpcy50cmVlcyk7XG4gICAgfVxufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICd0YWcnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90YWc7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fdGFnID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcDtcbi8vU3RhcmNvZGVyLlNoaXAgPSBTaGlwO1xuIiwiLyoqXG4gKiBTaW1wbGVQYXJ0aWNsZS5qc1xuICpcbiAqIEJhc2ljIGJpdG1hcCBwYXJ0aWNsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8vdmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uLy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gZnVuY3Rpb24gKGdhbWUsIGtleSkge1xuICAgIHZhciB0ZXh0dXJlID0gU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZVtrZXldO1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCAwLCAwLCB0ZXh0dXJlKTtcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHRoaXMsIGZhbHNlLCBmYWxzZSk7XG4gICAgdGhpcy5ib2R5LmNsZWFyU2hhcGVzKCk7XG4gICAgdmFyIHNoYXBlID0gdGhpcy5ib2R5LmFkZFBhcnRpY2xlKCk7XG4gICAgc2hhcGUuc2Vuc29yID0gdHJ1ZTtcbiAgICAvL3RoaXMua2lsbCgpO1xufTtcblxuU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZSA9IHt9O1xuXG5TaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUgPSBmdW5jdGlvbiAoZ2FtZSwga2V5LCBjb2xvciwgc2l6ZSwgY2lyY2xlKSB7XG4gICAgdmFyIHRleHR1cmUgPSBnYW1lLm1ha2UuYml0bWFwRGF0YShzaXplLCBzaXplKTtcbiAgICB0ZXh0dXJlLmN0eC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICBpZiAoY2lyY2xlKSB7XG4gICAgICAgIHRleHR1cmUuY3R4LmFyYyhzaXplLzIsIHNpemUvMiwgc2l6ZS8yLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xuICAgICAgICB0ZXh0dXJlLmN0eC5maWxsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dHVyZS5jdHguZmlsbFJlY3QoMCwgMCwgc2l6ZSwgc2l6ZSk7XG4gICAgfVxuICAgIFNpbXBsZVBhcnRpY2xlLl90ZXh0dXJlQ2FjaGVba2V5XSA9IHRleHR1cmU7XG59O1xuXG5TaW1wbGVQYXJ0aWNsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcblNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNpbXBsZVBhcnRpY2xlO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlUGFydGljbGU7XG4vL1N0YXJjb2Rlci5TaW1wbGVQYXJ0aWNsZSA9IFNpbXBsZVBhcnRpY2xlOyIsIi8qKlxuICogU3RhclRhcmdldC5qc1xuICpcbiAqIENsaWVudCBzaWRlIGltcGxlbWVudGF0aW9uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5TdGFyVGFyZ2V0O1xuXG52YXIgc3RhciA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpLnN0YXI7XG5cbnZhciBTdGFyVGFyZ2V0ID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG59O1xuXG5TdGFyVGFyZ2V0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5TdGFyVGFyZ2V0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0YXJUYXJnZXQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTdGFyVGFyZ2V0LnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTdGFyVGFyZ2V0LnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5TdGFyVGFyZ2V0LnByb3RvdHlwZS5kcmF3UHJvY2VkdXJlID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlKSB7XG4gICAgdmFyIHBzYyA9IHRoaXMuZ2FtZS5waHlzaWNzLnAyLm1weGkocmVuZGVyU2NhbGUpO1xuICAgIHZhciBnc2MgPSBwc2MqdGhpcy52ZWN0b3JTY2FsZTtcbiAgICB2YXIgbGluZUNvbG9yID0gUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMubGluZUNvbG9yKTtcbiAgICB0aGlzLmdyYXBoaWNzLmxpbmVTdHlsZSgxLCBsaW5lQ29sb3IsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5zdGFycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDAsIGsgPSBzdGFyLmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgdmFyIHggPSBwc2MgKiB0aGlzLnN0YXJzW2ldWzBdICsgZ3NjICogc3RhcltqXVswXTtcbiAgICAgICAgICAgIHZhciB5ID0gcHNjICogdGhpcy5zdGFyc1tpXVsxXSArIGdzYyAqIHN0YXJbal1bMV07XG4gICAgICAgICAgICBpZiAoaiA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MubW92ZVRvKHgsIHkpO1xuICAgICAgICAgICAgICAgIHZhciB4MCA9IHg7XG4gICAgICAgICAgICAgICAgdmFyIHkwID0geTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lVG8oeCwgeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lVG8oeDAsIHkwKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJUYXJnZXQ7IiwiLyoqXG4gKiBTeW5jQm9keUludGVyZmFjZS5qc1xuICpcbiAqIFNoYXJlZCBtZXRob2RzIGZvciBWZWN0b3JTcHJpdGVzLCBQYXJ0aWNsZXMsIGV0Yy5cbiAqL1xuXG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSBmdW5jdGlvbiAoKSB7fTtcblxuLyoqXG4gKiBTZXQgbG9jYXRpb24gYW5kIGFuZ2xlIG9mIGEgcGh5c2ljcyBvYmplY3QuIFZhbHVlIGFyZSBnaXZlbiBpbiB3b3JsZCBjb29yZGluYXRlcywgbm90IHBpeGVsc1xuICpcbiAqIEBwYXJhbSB4IHtudW1iZXJ9XG4gKiBAcGFyYW0geSB7bnVtYmVyfVxuICogQHBhcmFtIGEge251bWJlcn1cbiAqL1xuU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlLnNldFBvc0FuZ2xlID0gZnVuY3Rpb24gKHgsIHksIGEpIHtcbiAgICB0aGlzLmJvZHkuZGF0YS5wb3NpdGlvblswXSA9IC0oeCB8fCAwKTtcbiAgICB0aGlzLmJvZHkuZGF0YS5wb3NpdGlvblsxXSA9IC0oeSB8fCAwKTtcbiAgICB0aGlzLmJvZHkuZGF0YS5hbmdsZSA9IGEgfHwgMDtcbn07XG5cblN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZS5jb25maWcgPSBmdW5jdGlvbiAocHJvcGVydGllcykge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy51cGRhdGVQcm9wZXJ0aWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgayA9IHRoaXMudXBkYXRlUHJvcGVydGllc1tpXTtcbiAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzW2tdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpc1trXSA9IHByb3BlcnRpZXNba107ICAgICAgICAvLyBGSVhNRT8gVmlydHVhbGl6ZSBzb21laG93XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bmNCb2R5SW50ZXJmYWNlOyIsIi8qKlxuICogVGhydXN0R2VuZXJhdG9yLmpzXG4gKlxuICogR3JvdXAgcHJvdmlkaW5nIEFQSSwgbGF5ZXJpbmcsIGFuZCBwb29saW5nIGZvciB0aHJ1c3QgcGFydGljbGUgZWZmZWN0c1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcblxudmFyIF90ZXh0dXJlS2V5ID0gJ3RocnVzdCc7XG5cbi8vIFBvb2xpbmcgcGFyYW1ldGVyc1xudmFyIF9taW5Qb29sU2l6ZSA9IDMwMDtcbnZhciBfbWluRnJlZVBhcnRpY2xlcyA9IDIwO1xudmFyIF9zb2Z0UG9vbExpbWl0ID0gMjAwO1xudmFyIF9oYXJkUG9vbExpbWl0ID0gNTAwO1xuXG4vLyBCZWhhdmlvciBvZiBlbWl0dGVyXG52YXIgX3BhcnRpY2xlc1BlckJ1cnN0ID0gNTtcbnZhciBfcGFydGljbGVUVEwgPSAxNTA7XG52YXIgX3BhcnRpY2xlQmFzZVNwZWVkID0gNTtcbnZhciBfY29uZUxlbmd0aCA9IDE7XG52YXIgX2NvbmVXaWR0aFJhdGlvID0gMC4yO1xudmFyIF9lbmdpbmVPZmZzZXQgPSAtMjA7XG5cbnZhciBUaHJ1c3RHZW5lcmF0b3IgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUpO1xuXG4gICAgdGhpcy50aHJ1c3RpbmdTaGlwcyA9IHt9O1xuXG4gICAgLy8gUHJlZ2VuZXJhdGUgYSBiYXRjaCBvZiBwYXJ0aWNsZXNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9taW5Qb29sU2l6ZTsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0aWNsZSA9IHRoaXMuYWRkKG5ldyBTaW1wbGVQYXJ0aWNsZShnYW1lLCBfdGV4dHVyZUtleSkpO1xuICAgICAgICBwYXJ0aWNsZS5hbHBoYSA9IDAuNTtcbiAgICAgICAgcGFydGljbGUucm90YXRpb24gPSBNYXRoLlBJLzQ7XG4gICAgICAgIHBhcnRpY2xlLmtpbGwoKTtcbiAgICB9XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUaHJ1c3RHZW5lcmF0b3I7XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUuc3RhcnRPbiA9IGZ1bmN0aW9uIChzaGlwKSB7XG4gICAgdGhpcy50aHJ1c3RpbmdTaGlwc1tzaGlwLmlkXSA9IHNoaXA7XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLnN0b3BPbiA9IGZ1bmN0aW9uIChzaGlwKSB7XG4gICAgZGVsZXRlIHRoaXMudGhydXN0aW5nU2hpcHNbc2hpcC5pZF07XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMudGhydXN0aW5nU2hpcHMpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHNoaXAgPSB0aGlzLnRocnVzdGluZ1NoaXBzW2tleXNbaV1dO1xuICAgICAgICB2YXIgdyA9IHNoaXAud2lkdGg7XG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihzaGlwLnJvdGF0aW9uKTtcbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKHNoaXAucm90YXRpb24pO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IF9wYXJ0aWNsZXNQZXJCdXJzdDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgcGFydGljbGUgPSB0aGlzLmdldEZpcnN0RGVhZCgpO1xuICAgICAgICAgICAgaWYgKCFwYXJ0aWNsZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3QgZW5vdWdoIHRocnVzdCBwYXJ0aWNsZXMgaW4gcG9vbCcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGQgPSB0aGlzLmdhbWUucm5kLnJlYWxJblJhbmdlKC1fY29uZVdpZHRoUmF0aW8qdywgX2NvbmVXaWR0aFJhdGlvKncpO1xuICAgICAgICAgICAgdmFyIHggPSBzaGlwLnggKyBkKmNvcyArIF9lbmdpbmVPZmZzZXQqc2luO1xuICAgICAgICAgICAgdmFyIHkgPSBzaGlwLnkgKyBkKnNpbiAtIF9lbmdpbmVPZmZzZXQqY29zO1xuICAgICAgICAgICAgcGFydGljbGUubGlmZXNwYW4gPSBfcGFydGljbGVUVEw7XG4gICAgICAgICAgICBwYXJ0aWNsZS5yZXNldCh4LCB5KTtcbiAgICAgICAgICAgIHBhcnRpY2xlLmJvZHkudmVsb2NpdHkueCA9IF9wYXJ0aWNsZUJhc2VTcGVlZCooX2NvbmVMZW5ndGgqc2luIC0gZCpjb3MpO1xuICAgICAgICAgICAgcGFydGljbGUuYm9keS52ZWxvY2l0eS55ID0gX3BhcnRpY2xlQmFzZVNwZWVkKigtX2NvbmVMZW5ndGgqY29zIC0gZCpzaW4pO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuVGhydXN0R2VuZXJhdG9yLnRleHR1cmVLZXkgPSBfdGV4dHVyZUtleTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaHJ1c3RHZW5lcmF0b3I7IiwiLyoqXG4gKiBUb2FzdC5qc1xuICpcbiAqIENsYXNzIGZvciB2YXJpb3VzIGtpbmRzIG9mIHBvcCB1cCBtZXNzYWdlc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBUb2FzdCA9IGZ1bmN0aW9uIChnYW1lLCB4LCB5LCB0ZXh0LCBjb25maWcpIHtcbiAgICAvLyBUT0RPOiBiZXR0ZXIgZGVmYXVsdHMsIG1heWJlXG4gICAgUGhhc2VyLlRleHQuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCB0ZXh0LCB7XG4gICAgICAgIGZvbnQ6ICcxNHB0IEFyaWFsJyxcbiAgICAgICAgYWxpZ246ICdjZW50ZXInLFxuICAgICAgICBmaWxsOiAnI2ZmYTUwMCdcbiAgICB9KTtcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgLy8gU2V0IHVwIHN0eWxlcyBhbmQgdHdlZW5zXG4gICAgdmFyIHNwZWMgPSB7fTtcbiAgICBpZiAoY29uZmlnLnVwKSB7XG4gICAgICAgIHNwZWMueSA9ICctJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5kb3duKSB7XG4gICAgICAgIHNwZWMueSA9ICcrJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5sZWZ0KSB7XG4gICAgICAgIHNwZWMueCA9ICctJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5yaWdodCkge1xuICAgICAgICBzcGVjLnggPSAnKycgKyBjb25maWcudXA7XG4gICAgfVxuICAgIHN3aXRjaCAoY29uZmlnLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnc3Bpbm5lcic6XG4gICAgICAgICAgICB0aGlzLmZvbnRTaXplID0gJzIwcHQnO1xuICAgICAgICAgICAgc3BlYy5yb3RhdGlvbiA9IGNvbmZpZy5yZXZvbHV0aW9ucyA/IGNvbmZpZy5yZXZvbHV0aW9ucyAqIDIgKiBNYXRoLlBJIDogMiAqIE1hdGguUEk7XG4gICAgICAgICAgICB2YXIgdHdlZW4gPSBnYW1lLmFkZC50d2Vlbih0aGlzKS50byhzcGVjLCBjb25maWcuZHVyYXRpb24sIGNvbmZpZy5lYXNpbmcsIHRydWUpO1xuICAgICAgICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoZnVuY3Rpb24gKHRvYXN0KSB7XG4gICAgICAgICAgICAgICAgdG9hc3Qua2lsbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIFRPRE86IE1vcmUga2luZHNcbiAgICB9XG59O1xuXG4vKipcbiAqIENyZWF0ZSBuZXcgVG9hc3QgYW5kIGFkZCB0byBnYW1lXG4gKlxuICogQHBhcmFtIGdhbWVcbiAqIEBwYXJhbSB4XG4gKiBAcGFyYW0geVxuICogQHBhcmFtIHRleHRcbiAqIEBwYXJhbSBjb25maWdcbiAqL1xuVG9hc3QuYWRkID0gZnVuY3Rpb24gKGdhbWUsIHgsIHksIHRleHQsIGNvbmZpZykge1xuICAgIHZhciB0b2FzdCA9IG5ldyBUb2FzdChnYW1lLCB4LCB5LCB0ZXh0LCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRvYXN0KTtcbn07XG5cbi8vIENvdmVuaWVuY2UgbWV0aG9kcyBmb3IgY29tbW9uIGNhc2VzXG5cblRvYXN0LnNwaW5VcCA9IGZ1bmN0aW9uIChnYW1lLCB4LCB5LCB0ZXh0KSB7XG4gICAgdmFyIHRvYXN0ID0gbmV3IFRvYXN0IChnYW1lLCB4LCB5LCB0ZXh0LCB7XG4gICAgICAgIHR5cGU6ICdzcGlubmVyJyxcbiAgICAgICAgcmV2b2x1dGlvbnM6IDEsXG4gICAgICAgIGR1cmF0aW9uOiA1MDAsXG4gICAgICAgIGVhc2luZzogUGhhc2VyLkVhc2luZy5FbGFzdGljLk91dCxcbiAgICAgICAgdXA6IDEwMFxuICAgIH0pO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRvYXN0KTtcbn07XG5cblRvYXN0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlRleHQucHJvdG90eXBlKTtcblRvYXN0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRvYXN0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvYXN0O1xuIiwiLyoqXG4gKiBUcmFjdG9yQmVhbS5qc1xuICpcbiAqIENsaWVudCBzaWRlIGltcGxlbWVudGF0aW9uIG9mIGEgc2luZ2xlIHRyYWN0b3IgYmVhbSBzZWdtZW50XG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy9GSVhNRTogTmljZXIgaW1wbGVtZW50YXRpb25cblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSByZXF1aXJlKCcuL1NpbXBsZVBhcnRpY2xlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuVHJhY3RvckJlYW07XG5cbnZhciBUcmFjdG9yQmVhbSA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWxsKHRoaXMsIGdhbWUsICd0cmFjdG9yJyk7XG4gICAgdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cblRyYWN0b3JCZWFtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU2ltcGxlUGFydGljbGUucHJvdG90eXBlKTtcblRyYWN0b3JCZWFtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRyYWN0b3JCZWFtO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJhY3RvckJlYW0ucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFRyYWN0b3JCZWFtLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWN0b3JCZWFtOyIsIi8qKlxuICogVHJlZS5qc1xuICpcbiAqIENsaWVudCBzaWRlXG4gKi9cblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5UcmVlO1xuXG52YXIgVHJlZSA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMSk7XG59O1xuXG5UcmVlLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICB2YXIgdHJlZSA9IG5ldyBUcmVlIChnYW1lLCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRyZWUpO1xuICAgIHJldHVybiB0cmVlO1xufTtcblxuVHJlZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuVHJlZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUcmVlO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJlZS5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJlZS5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuLyoqXG4gKiBEcmF3IHRyZWUsIG92ZXJyaWRpbmcgc3RhbmRhcmQgc2hhcGUgYW5kIGdlb21ldHJ5IG1ldGhvZCB0byB1c2UgZ3JhcGhcbiAqXG4gKiBAcGFyYW0gcmVuZGVyU2NhbGVcbiAqL1xuVHJlZS5wcm90b3R5cGUuZHJhd1Byb2NlZHVyZSA9IGZ1bmN0aW9uIChyZW5kZXJTY2FsZSkge1xuICAgIHZhciBsaW5lQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpO1xuICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKDEsIGxpbmVDb2xvciwgMSk7XG4gICAgdGhpcy5fZHJhd0JyYW5jaCh0aGlzLmdyYXBoLCB0aGlzLmdhbWUucGh5c2ljcy5wMi5tcHhpKHRoaXMudmVjdG9yU2NhbGUpKnJlbmRlclNjYWxlLCB0aGlzLmRlcHRoKTtcbn07XG5cblRyZWUucHJvdG90eXBlLl9kcmF3QnJhbmNoID0gZnVuY3Rpb24gKGdyYXBoLCBzYywgZGVwdGgpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGdyYXBoLmMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGdyYXBoLmNbaV07XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubW92ZVRvKGdyYXBoLnggKiBzYywgZ3JhcGgueSAqIHNjKTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lVG8oY2hpbGQueCAqIHNjLCBjaGlsZC55ICogc2MpO1xuICAgICAgICBpZiAoZGVwdGggPiB0aGlzLnN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMuX2RyYXdCcmFuY2goY2hpbGQsIHNjLCBkZXB0aCAtIDEpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFRyZWUucHJvdG90eXBlLCAnc3RlcCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0ZXA7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fc3RlcCA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyZWU7IiwiLyoqXG4gKiBTcHJpdGUgd2l0aCBhdHRhY2hlZCBHcmFwaGljcyBvYmplY3QgZm9yIHZlY3Rvci1saWtlIGdyYXBoaWNzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG52YXIgZnJhbWVUZXh0dXJlUG9vbCA9IHt9O1xudmFyIG1hcFRleHR1cmVQb29sID0ge307XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgVmVjdG9yLWJhc2VkIHNwcml0ZXNcbiAqXG4gKiBAcGFyYW0gZ2FtZSB7UGhhc2VyLkdhbWV9IC0gUGhhc2VyIGdhbWUgb2JqZWN0XG4gKiBAcGFyYW0gY29uZmlnIHtvYmplY3R9IC0gUE9KTyB3aXRoIGNvbmZpZyBkZXRhaWxzXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIFZlY3RvclNwcml0ZSA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICAvL3RoaXMuZ3JhcGhpY3MgPSBnYW1lLm1ha2UuZ3JhcGhpY3MoKTtcbiAgICB0aGlzLmdyYXBoaWNzID0gdGhpcy5nYW1lLnNoYXJlZEdyYXBoaWNzO1xuICAgIC8vdGhpcy50ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgLy90aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG5cbiAgICBpZiAoIWNvbmZpZy5ub3BoeXNpY3MpIHtcbiAgICAgICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZSh0aGlzLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICB0aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xuICAgICAgICB0aGlzLnVwZGF0ZUJvZHkoKTtcbiAgICAgICAgdGhpcy5ib2R5Lm1hc3MgPSAwO1xuICAgIH1cbiAgICB0aGlzLmNvbmZpZyhjb25maWcucHJvcGVydGllcyk7XG5cbiAgICBpZiAodGhpcy52aXNpYmxlT25NYXApIHtcbiAgICAgICAgdGhpcy5taW5pc3ByaXRlID0gdGhpcy5nYW1lLm1pbmltYXAuY3JlYXRlKCk7XG4gICAgICAgIHRoaXMubWluaXNwcml0ZS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNoYXJlZFRleHR1cmVLZXkpIHtcbiAgICAgICAgdGhpcy5mcmFtZXMgPSB0aGlzLmdldEZyYW1lUG9vbCh0aGlzLnNoYXJlZFRleHR1cmVLZXkpO1xuICAgICAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICB0aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nZXRNYXBQb29sKHRoaXMuc2hhcmVkVGV4dHVyZUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZnJhbWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRUZXh0dXJlKHRoaXMuZnJhbWVzW3RoaXMudkZyYW1lXSk7XG4gICAgICAgICAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taW5pc3ByaXRlLnNldFRleHR1cmUodGhpcy5taW5pdGV4dHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZyYW1lcyA9IFtdO1xuICAgICAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICB0aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xuICAgIH1cblxuICAgIC8vdGhpcy51cGRhdGVUZXh0dXJlcygpO1xuICAgIGlmICh0aGlzLmZwcykge1xuICAgICAgICB0aGlzLl9tc1BlckZyYW1lID0gMTAwMCAvIHRoaXMuZnBzO1xuICAgICAgICB0aGlzLl9sYXN0VkZyYW1lID0gdGhpcy5nYW1lLnRpbWUubm93O1xuICAgIH1cbn07XG5cbi8qKlxuICogQ3JlYXRlIFZlY3RvclNwcml0ZSBhbmQgYWRkIHRvIGdhbWUgd29ybGRcbiAqXG4gKiBAcGFyYW0gZ2FtZSB7UGhhc2VyLkdhbWV9XG4gKiBAcGFyYW0geCB7bnVtYmVyfSAtIHggY29vcmRcbiAqIEBwYXJhbSB5IHtudW1iZXJ9IC0geSBjb29yZFxuICogQHJldHVybnMge1ZlY3RvclNwcml0ZX1cbiAqL1xuVmVjdG9yU3ByaXRlLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCB4LCB5KSB7XG4gICAgdmFyIHYgPSBuZXcgVmVjdG9yU3ByaXRlKGdhbWUsIHgsIHkpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHYpO1xuICAgIHJldHVybiB2O1xufTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFZlY3RvclNwcml0ZTtcblxuLy8gRGVmYXVsdCBvY3RhZ29uXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9zaGFwZSA9IFtcbiAgICBbMiwxXSxcbiAgICBbMSwyXSxcbiAgICBbLTEsMl0sXG4gICAgWy0yLDFdLFxuICAgIFstMiwtMV0sXG4gICAgWy0xLC0yXSxcbiAgICBbMSwtMl0sXG4gICAgWzIsLTFdXG5dO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZmZmZmYnO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2ZpbGxDb2xvciA9IG51bGw7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9maWxsQWxwaGEgPSAwLjI1O1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fdmVjdG9yU2NhbGUgPSAxO1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnBoeXNpY3NCb2R5VHlwZSA9ICdjaXJjbGUnO1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLm51bUZyYW1lcyA9IDE7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLm1hcEZyYW1lID0gMDtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUudkZyYW1lID0gMDtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS52aXNpYmxlT25NYXAgPSB0cnVlO1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmdldEZyYW1lUG9vbCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoIWZyYW1lVGV4dHVyZVBvb2xba2V5XSkge1xuICAgICAgICByZXR1cm4gZnJhbWVUZXh0dXJlUG9vbFtrZXldID0gW107XG4gICAgfVxuICAgIHJldHVybiBmcmFtZVRleHR1cmVQb29sW2tleV07XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmdldE1hcFBvb2wgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKCFtYXBUZXh0dXJlUG9vbFtrZXldKSB7XG4gICAgICAgIG1hcFRleHR1cmVQb29sW2tleV0gPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcFRleHR1cmVQb29sW2tleV07XG59XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0U2hhcGUgPSBmdW5jdGlvbiAoc2hhcGUpIHtcbiAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xufTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5zZXRMaW5lU3R5bGUgPSBmdW5jdGlvbiAoY29sb3IsIGxpbmVXaWR0aCkge1xuICAgIGlmICghbGluZVdpZHRoIHx8IGxpbmVXaWR0aCA8IDEpIHtcbiAgICAgICAgbGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGggfHwgMTtcbiAgICB9XG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgIHRoaXMubGluZVdpZHRoID0gbGluZVdpZHRoO1xuICAgIHRoaXMudXBkYXRlVGV4dHVyZXMoKTtcbn07XG5cbi8qKlxuICogVXBkYXRlIGNhY2hlZCBiaXRtYXBzIGZvciBvYmplY3QgYWZ0ZXIgdmVjdG9yIHByb3BlcnRpZXMgY2hhbmdlXG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlVGV4dHVyZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gRHJhdyBmdWxsIHNpemVkXG4gICAgaWYgKHRoaXMubnVtRnJhbWVzID09PSAxKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5fY3VycmVudEJvdW5kcyA9IG51bGw7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5kcmF3UHJvY2VkdXJlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpcy5kcmF3UHJvY2VkdXJlKDEsIDApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhdygxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuZnJhbWVzWzBdKSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lc1swXSA9IHRoaXMuZ2FtZS5hZGQucmVuZGVyVGV4dHVyZSgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBib3VuZHMgPSB0aGlzLmdyYXBoaWNzLmdldExvY2FsQm91bmRzKCk7XG4gICAgICAgIHRoaXMuZnJhbWVzWzBdLnJlc2l6ZShib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIHRydWUpO1xuICAgICAgICB0aGlzLmZyYW1lc1swXS5yZW5kZXJYWSh0aGlzLmdyYXBoaWNzLCAtYm91bmRzLngsIC1ib3VuZHMueSwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm51bUZyYW1lczsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLl9jdXJyZW50Qm91bmRzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuZHJhd1Byb2NlZHVyZSgxLCBpKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5mcmFtZXNbaV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lc1tpXSA9IHRoaXMuZ2FtZS5hZGQucmVuZGVyVGV4dHVyZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm91bmRzID0gdGhpcy5ncmFwaGljcy5nZXRMb2NhbEJvdW5kcygpO1xuICAgICAgICAgICAgdGhpcy5mcmFtZXNbaV0ucmVzaXplKGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmZyYW1lc1tpXS5yZW5kZXJYWSh0aGlzLmdyYXBoaWNzLCAtYm91bmRzLngsIC1ib3VuZHMueSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRUZXh0dXJlKHRoaXMuZnJhbWVzW3RoaXMudkZyYW1lXSk7XG4gICAgLy8gRHJhdyBzbWFsbCBmb3IgbWluaW1hcFxuICAgIGlmICh0aGlzLm1pbmlzcHJpdGUpIHtcbiAgICAgICAgdmFyIG1hcFNjYWxlID0gdGhpcy5nYW1lLm1pbmltYXAubWFwU2NhbGU7XG4gICAgICAgIHZhciBtYXBGYWN0b3IgPSB0aGlzLm1hcEZhY3RvciB8fCAxO1xuICAgICAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MuX2N1cnJlbnRCb3VuZHMgPSBudWxsO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuZHJhd1Byb2NlZHVyZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd1Byb2NlZHVyZShtYXBTY2FsZSAqIG1hcEZhY3RvciwgdGhpcy5tYXBGcmFtZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaGFwZSkge1xuICAgICAgICAgICAgdGhpcy5kcmF3KG1hcFNjYWxlICogbWFwRmFjdG9yKTtcbiAgICAgICAgfVxuICAgICAgICBib3VuZHMgPSB0aGlzLmdyYXBoaWNzLmdldExvY2FsQm91bmRzKCk7XG4gICAgICAgIHRoaXMubWluaXRleHR1cmUucmVzaXplKGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMubWluaXRleHR1cmUucmVuZGVyWFkodGhpcy5ncmFwaGljcywgLWJvdW5kcy54LCAtYm91bmRzLnksIHRydWUpO1xuICAgICAgICB0aGlzLm1pbmlzcHJpdGUuc2V0VGV4dHVyZSh0aGlzLm1pbml0ZXh0dXJlKTtcbiAgICB9XG4gICAgdGhpcy5fZGlydHkgPSBmYWxzZTtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlQm9keSA9IGZ1bmN0aW9uICgpIHtcbiAgICBzd2l0Y2ggKHRoaXMucGh5c2ljc0JvZHlUeXBlKSB7XG4gICAgICAgIGNhc2UgXCJjaXJjbGVcIjpcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5jaXJjbGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHIgPSB0aGlzLmdyYXBoaWNzLmdldEJvdW5kcygpO1xuICAgICAgICAgICAgICAgIHZhciByYWRpdXMgPSBNYXRoLnJvdW5kKE1hdGguc3FydChyLndpZHRoKiByLmhlaWdodCkvMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJhZGl1cyA9IHRoaXMucmFkaXVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ib2R5LnNldENpcmNsZShyYWRpdXMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIFRPRE86IE1vcmUgc2hhcGVzXG4gICAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdmVjdG9yIHRvIGJpdG1hcCBvZiBncmFwaGljcyBvYmplY3QgYXQgZ2l2ZW4gc2NhbGVcbiAqXG4gKiBAcGFyYW0gcmVuZGVyU2NhbGUge251bWJlcn0gLSBzY2FsZSBmYWN0b3IgZm9yIHJlbmRlclxuICovXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAocmVuZGVyU2NhbGUpIHtcbiAgICByZW5kZXJTY2FsZSA9IHJlbmRlclNjYWxlIHx8IDE7XG4gICAgLy8gRHJhdyBzaW1wbGUgc2hhcGUsIGlmIGdpdmVuXG4gICAgaWYgKHRoaXMuc2hhcGUpIHtcbiAgICAgICAgdmFyIGxpbmVDb2xvciA9IFBoYXNlci5Db2xvci5oZXhUb1JHQih0aGlzLmxpbmVDb2xvcik7XG4gICAgICAgIGlmIChyZW5kZXJTY2FsZSA9PT0gMSkge1xuICAgICAgICAgICAgdmFyIGxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGluZVdpZHRoID0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHJlbmRlclNjYWxlID09PSAxKSAmJiB0aGlzLmZpbGxDb2xvcikgeyAgICAgICAgLy8gT25seSBmaWxsIGZ1bGwgc2l6ZWRcbiAgICAgICAgICAgIHZhciBmaWxsQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5maWxsQ29sb3IpO1xuICAgICAgICAgICAgdmFyIGZpbGxBbHBoYSA9IHRoaXMuZmlsbEFscGhhIHx8IDE7XG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmJlZ2luRmlsbChmaWxsQ29sb3IsIGZpbGxBbHBoYSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lU3R5bGUobGluZVdpZHRoLCBsaW5lQ29sb3IsIDEpO1xuICAgICAgICB0aGlzLl9kcmF3UG9seWdvbih0aGlzLnNoYXBlLCB0aGlzLnNoYXBlQ2xvc2VkLCByZW5kZXJTY2FsZSk7XG4gICAgICAgIGlmICgocmVuZGVyU2NhbGUgPT09IDEpICYmIHRoaXMuZmlsbENvbG9yKSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmVuZEZpbGwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBEcmF3IGdlb21ldHJ5IHNwZWMsIGlmIGdpdmVuLCBidXQgb25seSBmb3IgdGhlIGZ1bGwgc2l6ZWQgc3ByaXRlXG4gICAgaWYgKChyZW5kZXJTY2FsZSA9PT0gMSkgJiYgdGhpcy5nZW9tZXRyeSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuZ2VvbWV0cnkubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZyA9IHRoaXMuZ2VvbWV0cnlbaV07XG4gICAgICAgICAgICBzd2l0Y2ggKGcudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJwb2x5XCI6XG4gICAgICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBkZWZhdWx0cyBhbmQgc3R1ZmZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhd1BvbHlnb24oZy5wb2ludHMsIGcuY2xvc2VkLCByZW5kZXJTY2FsZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBEcmF3IG9wZW4gb3IgY2xvc2VkIHBvbHlnb24gYXMgc2VxdWVuY2Ugb2YgbGluZVRvIGNhbGxzXG4gKlxuICogQHBhcmFtIHBvaW50cyB7QXJyYXl9IC0gcG9pbnRzIGFzIGFycmF5IG9mIFt4LHldIHBhaXJzXG4gKiBAcGFyYW0gY2xvc2VkIHtib29sZWFufSAtIGlzIHBvbHlnb24gY2xvc2VkP1xuICogQHBhcmFtIHJlbmRlclNjYWxlIHtudW1iZXJ9IC0gc2NhbGUgZmFjdG9yIGZvciByZW5kZXJcbiAqIEBwcml2YXRlXG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2RyYXdQb2x5Z29uID0gZnVuY3Rpb24gKHBvaW50cywgY2xvc2VkLCByZW5kZXJTY2FsZSkge1xuICAgIHZhciBzYyA9IHRoaXMuZ2FtZS5waHlzaWNzLnAyLm1weGkodGhpcy52ZWN0b3JTY2FsZSkqcmVuZGVyU2NhbGU7XG4gICAgcG9pbnRzID0gcG9pbnRzLnNsaWNlKCk7XG4gICAgaWYgKGNsb3NlZCkge1xuICAgICAgICBwb2ludHMucHVzaChwb2ludHNbMF0pO1xuICAgIH1cbiAgICB0aGlzLmdyYXBoaWNzLm1vdmVUbyhwb2ludHNbMF1bMF0gKiBzYywgcG9pbnRzWzBdWzFdICogc2MpO1xuICAgIGZvciAodmFyIGkgPSAxLCBsID0gcG9pbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyhwb2ludHNbaV1bMF0gKiBzYywgcG9pbnRzW2ldWzFdICogc2MpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSW52YWxpZGF0ZSBjYWNoZSBhbmQgcmVkcmF3IGlmIHNwcml0ZSBpcyBtYXJrZWQgZGlydHlcbiAqL1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX2RpcnR5KSB7XG4gICAgICAgIHRoaXMudXBkYXRlVGV4dHVyZXMoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX21zUGVyRnJhbWUgJiYgKHRoaXMuZ2FtZS50aW1lLm5vdyA+PSB0aGlzLl9sYXN0VkZyYW1lICsgdGhpcy5fbXNQZXJGcmFtZSkpIHtcbiAgICAgICAgdGhpcy52RnJhbWUgPSAodGhpcy52RnJhbWUgKyAxKSAlIHRoaXMubnVtRnJhbWVzO1xuICAgICAgICB0aGlzLnNldFRleHR1cmUodGhpcy5mcmFtZXNbdGhpcy52RnJhbWVdKTtcbiAgICAgICAgdGhpcy5fbGFzdFZGcmFtZSA9IHRoaXMuZ2FtZS50aW1lLm5vdztcbiAgICB9XG59O1xuXG4vLyBWZWN0b3IgcHJvcGVydGllcyBkZWZpbmVkIHRvIGhhbmRsZSBtYXJraW5nIHNwcml0ZSBkaXJ0eSB3aGVuIG5lY2Vzc2FyeVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2xpbmVDb2xvcicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpbmVDb2xvcjtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge3RoaXMuX2xpbmVDb2xvciA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2ZpbGxDb2xvcicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGxDb2xvcjtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9maWxsQ29sb3IgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdsaW5lV2lkdGgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9saW5lV2lkdGg7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fbGluZVdpZHRoID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZmlsbEFscGhhJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlsbEFscGhhO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2ZpbGxBbHBoYSA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3NoYXBlQ2xvc2VkJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2hhcGVDbG9zZWQ7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fc2hhcGVDbG9zZWQgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICd2ZWN0b3JTY2FsZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZlY3RvclNjYWxlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX3ZlY3RvclNjYWxlID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnc2hhcGUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFwZTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9zaGFwZSA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2dlb21ldHJ5Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2VvbWV0cnk7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fZ2VvbWV0cnkgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdkZWFkJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVhZDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9kZWFkID0gdmFsO1xuICAgICAgICBpZiAodmFsKSB7XG4gICAgICAgICAgICB0aGlzLmtpbGwoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmV2aXZlKCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZlY3RvclNwcml0ZTtcbi8vU3RhcmNvZGVyLlZlY3RvclNwcml0ZSA9IFZlY3RvclNwcml0ZTsiLCIvKipcbiAqIENvbnRyb2xzLmpzXG4gKlxuICogVmlydHVhbGl6ZSBhbmQgaW1wbGVtZW50IHF1ZXVlIGZvciBnYW1lIGNvbnRyb2xzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxudmFyIENvbnRyb2xzID0gZnVuY3Rpb24gKGdhbWUsIHBhcmVudCkge1xuICAgIFBoYXNlci5QbHVnaW4uY2FsbCh0aGlzLCBnYW1lLCBwYXJlbnQpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuUGx1Z2luLnByb3RvdHlwZSk7XG5Db250cm9scy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb250cm9scztcblxuQ29udHJvbHMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAocXVldWUpIHtcbiAgICB0aGlzLnF1ZXVlID0gcXVldWU7XG4gICAgdGhpcy5jb250cm9scyA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG4gICAgdGhpcy5jb250cm9scy5maXJlID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuQik7XG4gICAgdGhpcy5jb250cm9scy50cmFjdG9yID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVCk7XG4gICAgdGhpcy5qb3lzdGlja1N0YXRlID0ge1xuICAgICAgICB1cDogZmFsc2UsXG4gICAgICAgIGRvd246IGZhbHNlLFxuICAgICAgICBsZWZ0OiBmYWxzZSxcbiAgICAgICAgcmlnaHQ6IGZhbHNlLFxuICAgICAgICBmaXJlOiBmYWxzZVxuICAgIH07XG5cbiAgICAvLyBBZGQgdmlydHVhbCBqb3lzdGljayBpZiBwbHVnaW4gaXMgYXZhaWxhYmxlXG4gICAgaWYgKFBoYXNlci5WaXJ0dWFsSm95c3RpY2spIHtcbiAgICAgICAgdGhpcy5qb3lzdGljayA9IHRoaXMuZ2FtZS5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKFBoYXNlci5WaXJ0dWFsSm95c3RpY2spO1xuICAgIH1cbn07XG5cbnZhciBzZXEgPSAwO1xudmFyIHVwID0gZmFsc2UsIGRvd24gPSBmYWxzZSwgbGVmdCA9IGZhbHNlLCByaWdodCA9IGZhbHNlLCBmaXJlID0gZmFsc2UsIHRyYWN0b3IgPSBmYWxzZTtcblxuQ29udHJvbHMucHJvdG90eXBlLmFkZFZpcnR1YWxDb250cm9scyA9IGZ1bmN0aW9uICh0ZXh0dXJlKSB7XG4gICAgdGV4dHVyZSA9IHRleHR1cmUgfHwgJ2pveXN0aWNrJztcbiAgICB2YXIgc2NhbGUgPSAxOyAgICAgICAgICAgIC8vIEZJWE1FXG4gICAgdGhpcy5zdGljayA9IHRoaXMuam95c3RpY2suYWRkU3RpY2soMCwgMCwgMTAwLHRleHR1cmUpO1xuICAgIC8vdGhpcy5zdGljay5tb3Rpb25Mb2NrID0gUGhhc2VyLlZpcnR1YWxKb3lzdGljay5IT1JJWk9OVEFMO1xuICAgIHRoaXMuc3RpY2suc2NhbGUgPSBzY2FsZTtcbiAgICAvL3RoaXMuZ29idXR0b24gPSB0aGlzLmpveXN0aWNrLmFkZEJ1dHRvbih4ICsgMjAwKnNjYWxlLCB5LCB0ZXh0dXJlLCAnYnV0dG9uMS11cCcsICdidXR0b24xLWRvd24nKTtcbiAgICB0aGlzLmZpcmVidXR0b24gPSB0aGlzLmpveXN0aWNrLmFkZEJ1dHRvbigwLCAwLCB0ZXh0dXJlLCAnYnV0dG9uMS11cCcsICdidXR0b24xLWRvd24nKTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24gPSB0aGlzLmpveXN0aWNrLmFkZEJ1dHRvbigwLCAwLCB0ZXh0dXJlLCAnYnV0dG9uMi11cCcsICdidXR0b24yLWRvd24nKTtcbiAgICB0aGlzLmZpcmVidXR0b24uc2NhbGUgPSBzY2FsZTtcbiAgICAvL3RoaXMuZ29idXR0b24uc2NhbGUgPSBzY2FsZTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24uc2NhbGUgPSBzY2FsZTtcbiAgICB0aGlzLmxheW91dFZpcnR1YWxDb250cm9scyhzY2FsZSk7XG4gICAgdGhpcy5zdGljay5vbk1vdmUuYWRkKGZ1bmN0aW9uIChzdGljaywgZiwgZlgsIGZZKSB7XG4gICAgICAgIGlmIChmWCA+PSAwLjM1KSB7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUucmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmxlZnQgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChmWCA8PSAtMC4zNSkge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUubGVmdCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUucmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5sZWZ0ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZZID49IDAuMzUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGZZIDw9IC0wLjM1KSB7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUuZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gZmFsc2U7O1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LCB0aGlzKTtcbiAgICB0aGlzLnN0aWNrLm9uVXAuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUubGVmdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUuZG93biA9IGZhbHNlO1xuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMuZmlyZWJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmZpcmUgPSB0cnVlO1xuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMuZmlyZWJ1dHRvbi5vblVwLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5maXJlID0gZmFsc2U7XG4gICAgfSwgdGhpcyk7XG4gICAgLy90aGlzLmdvYnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24gKCkge1xuICAgIC8vICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IHRydWU7XG4gICAgLy99LCB0aGlzKTtcbiAgICAvL3RoaXMuZ29idXR0b24ub25VcC5hZGQoZnVuY3Rpb24gKCkge1xuICAgIC8vICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IGZhbHNlO1xuICAgIC8vfSwgdGhpcyk7XG4gICAgdGhpcy50cmFjdG9yYnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudHJhY3RvciA9IHRydWU7XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy50cmFjdG9yYnV0dG9uLm9uVXAuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnRyYWN0b3IgPSBmYWxzZTtcbiAgICB9LCB0aGlzKTtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5sYXlvdXRWaXJ0dWFsQ29udHJvbHMgPSBmdW5jdGlvbiAoc2NhbGUpIHtcbiAgICB2YXIgeSA9IHRoaXMuZ2FtZS5oZWlnaHQgLSAxMjUgKiBzY2FsZTtcbiAgICB2YXIgdyA9IHRoaXMuZ2FtZS53aWR0aDtcbiAgICB0aGlzLnN0aWNrLnBvc1ggPSAxNTAgKiBzY2FsZTtcbiAgICB0aGlzLnN0aWNrLnBvc1kgPSB5O1xuICAgIHRoaXMuZmlyZWJ1dHRvbi5wb3NYID0gdyAtIDI1MCAqIHNjYWxlO1xuICAgIHRoaXMuZmlyZWJ1dHRvbi5wb3NZID0geTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24ucG9zWCA9IHcgLSAxMjUgKiBzY2FsZTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24ucG9zWSA9IHk7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdXAgPSBkb3duID0gbGVmdCA9IHJpZ2h0ID0gZmFsc2U7XG4gICAgdGhpcy5xdWV1ZS5sZW5ndGggPSAwO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLnByZVVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPOiBTdXBwb3J0IG90aGVyIGludGVyYWN0aW9ucy9tZXRob2RzXG4gICAgdmFyIGNvbnRyb2xzID0gdGhpcy5jb250cm9scztcbiAgICB2YXIgc3RhdGUgPSB0aGlzLmpveXN0aWNrU3RhdGU7XG4gICAgaWYgKChzdGF0ZS51cCB8fCBjb250cm9scy51cC5pc0Rvd24pICYmICF1cCkge1xuICAgICAgICB1cCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3VwX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS51cCAmJiAhY29udHJvbHMudXAuaXNEb3duICYmIHVwKSB7XG4gICAgICAgIHVwID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3VwX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUuZG93biB8fCBjb250cm9scy5kb3duLmlzRG93bikgJiYgIWRvd24pIHtcbiAgICAgICAgZG93biA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2Rvd25fcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLmRvd24gJiYgIWNvbnRyb2xzLmRvd24uaXNEb3duICYmIGRvd24pIHtcbiAgICAgICAgZG93biA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdkb3duX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUucmlnaHQgfHwgY29udHJvbHMucmlnaHQuaXNEb3duKSAmJiAhcmlnaHQpIHtcbiAgICAgICAgcmlnaHQgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdyaWdodF9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghc3RhdGUucmlnaHQgJiYgIWNvbnRyb2xzLnJpZ2h0LmlzRG93biAmJiByaWdodCkge1xuICAgICAgICByaWdodCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdyaWdodF9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKHN0YXRlLmxlZnQgfHwgY29udHJvbHMubGVmdC5pc0Rvd24pICYmICFsZWZ0KSB7XG4gICAgICAgIGxlZnQgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdsZWZ0X3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS5sZWZ0ICYmICFjb250cm9scy5sZWZ0LmlzRG93biAmJiBsZWZ0KSB7XG4gICAgICAgIGxlZnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnbGVmdF9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKHN0YXRlLmZpcmUgfHwgY29udHJvbHMuZmlyZS5pc0Rvd24pICYmICFmaXJlKSB7XG4gICAgICAgIGZpcmUgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdmaXJlX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS5maXJlICYmICFjb250cm9scy5maXJlLmlzRG93biAmJiBmaXJlKSB7XG4gICAgICAgIGZpcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZmlyZV9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKHN0YXRlLnRyYWN0b3IgfHwgY29udHJvbHMudHJhY3Rvci5pc0Rvd24pICYmICF0cmFjdG9yKSB7XG4gICAgICAgIHRyYWN0b3IgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICd0cmFjdG9yX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCghc3RhdGUudHJhY3RvciAmJiAhY29udHJvbHMudHJhY3Rvci5pc0Rvd24pICYmIHRyYWN0b3IpIHtcbiAgICAgICAgdHJhY3RvciA9IGZhbHNlOy8vXG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3RyYWN0b3JfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG59O1xuXG52YXIgYWN0aW9uOyAgICAgICAgICAgICAvLyBNb2R1bGUgc2NvcGUgdG8gYXZvaWQgYWxsb2NhdGlvbnNcblxuQ29udHJvbHMucHJvdG90eXBlLnByb2Nlc3NRdWV1ZSA9IGZ1bmN0aW9uIChjYiwgY2xlYXIpIHtcbiAgICB2YXIgcXVldWUgPSB0aGlzLnF1ZXVlO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcXVldWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGFjdGlvbiA9IHF1ZXVlW2ldO1xuICAgICAgICBpZiAoYWN0aW9uLmV4ZWN1dGVkKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYihhY3Rpb24pO1xuICAgICAgICBhY3Rpb24uZXRpbWUgPSB0aGlzLmdhbWUudGltZS5ub3c7XG4gICAgICAgIGFjdGlvbi5leGVjdXRlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChjbGVhcikge1xuICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgIH1cbn07XG5cblN0YXJjb2Rlci5Db250cm9scyA9IENvbnRyb2xzO1xubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sczsiLCIvKipcbiAqIFN5bmNDbGllbnQuanNcbiAqXG4gKiBTeW5jIHBoeXNpY3Mgb2JqZWN0cyB3aXRoIHNlcnZlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG52YXIgVVBEQVRFX1FVRVVFX0xJTUlUID0gODtcblxudmFyIFN5bmNDbGllbnQgPSBmdW5jdGlvbiAoZ2FtZSwgcGFyZW50KSB7XG4gICAgUGhhc2VyLlBsdWdpbi5jYWxsKHRoaXMsIGdhbWUsIHBhcmVudCk7XG59O1xuXG5TeW5jQ2xpZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlBsdWdpbi5wcm90b3R5cGUpO1xuU3luY0NsaWVudC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTeW5jQ2xpZW50O1xuXG5cbi8qKlxuICogSW5pdGlhbGl6ZSBwbHVnaW5cbiAqXG4gKiBAcGFyYW0gc29ja2V0IHtTb2NrZXR9IC0gc29ja2V0LmlvIHNvY2tldCBmb3Igc3luYyBjb25uZWN0aW9uXG4gKiBAcGFyYW0gcXVldWUge0FycmF5fSAtIGNvbW1hbmQgcXVldWVcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChzb2NrZXQsIHF1ZXVlKSB7XG4gICAgLy8gVE9ETzogQ29weSBzb21lIGNvbmZpZyBvcHRpb25zXG4gICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XG4gICAgdGhpcy5jbWRRdWV1ZSA9IHF1ZXVlO1xuICAgIHRoaXMuZXh0YW50ID0ge307XG59O1xuXG4vKipcbiAqIFN0YXJ0IHBsdWdpblxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHN0YXJjb2RlciA9IHRoaXMuZ2FtZS5zdGFyY29kZXI7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGxldGUgPSBmYWxzZTtcbiAgICAvLyBGSVhNRTogTmVlZCBtb3JlIHJvYnVzdCBoYW5kbGluZyBvZiBEQy9SQ1xuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmdhbWUucGF1c2VkID0gdHJ1ZTtcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbigncmVjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmdhbWUucGF1c2VkID0gZmFsc2U7XG4gICAgfSk7XG4gICAgLy8gTWVhc3VyZSBjbGllbnQtc2VydmVyIHRpbWUgZGVsdGFcbiAgICB0aGlzLnNvY2tldC5vbigndGltZXN5bmMnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBzZWxmLl9sYXRlbmN5ID0gZGF0YSAtIHNlbGYuZ2FtZS50aW1lLm5vdztcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlYWxUaW1lID0gZGF0YS5yO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGRhdGEuYi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB1cGRhdGUgPSBkYXRhLmJbaV07XG4gICAgICAgICAgICB2YXIgaWQgPSB1cGRhdGUuaWQ7XG4gICAgICAgICAgICB2YXIgc3ByaXRlO1xuICAgICAgICAgICAgdXBkYXRlLnRpbWVzdGFtcCA9IHJlYWxUaW1lO1xuICAgICAgICAgICAgaWYgKHNwcml0ZSA9IHNlbGYuZXh0YW50W2lkXSkge1xuICAgICAgICAgICAgICAgIC8vIEV4aXN0aW5nIHNwcml0ZSAtIHByb2Nlc3MgdXBkYXRlXG4gICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlLnB1c2godXBkYXRlKTtcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLmNvbmZpZyh1cGRhdGUucHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzcHJpdGUudXBkYXRlUXVldWUubGVuZ3RoID4gVVBEQVRFX1FVRVVFX0xJTUlUKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS51cGRhdGVRdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gTmV3IHNwcml0ZSAtIGNyZWF0ZSBhbmQgY29uZmlndXJlXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnTmV3JywgaWQsIHVwZGF0ZS50KTtcbiAgICAgICAgICAgICAgICBzcHJpdGUgPSBzdGFyY29kZXIuYWRkQm9keSh1cGRhdGUudCwgdXBkYXRlKTtcbiAgICAgICAgICAgICAgICBpZiAoc3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS5zZXJ2ZXJJZCA9IGlkO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmV4dGFudFtpZF0gPSBzcHJpdGU7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS51cGRhdGVRdWV1ZSA9IFt1cGRhdGVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwLCBsID0gZGF0YS5ybS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGlkID0gZGF0YS5ybVtpXTtcbiAgICAgICAgICAgIGlmIChzZWxmLmV4dGFudFtpZF0pIHtcbiAgICAgICAgICAgICAgICBzdGFyY29kZXIucmVtb3ZlQm9keShzZWxmLmV4dGFudFtpZF0pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBzZWxmLmV4dGFudFtpZF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogU2VuZCBxdWV1ZWQgY29tbWFuZHMgdG8gc2VydmVyIGFuZCBpbnRlcnBvbGF0ZSBvYmplY3RzIGJhc2VkIG9uIHVwZGF0ZXMgZnJvbSBzZXJ2ZXJcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fdXBkYXRlQ29tcGxldGUpIHtcbiAgICAgICAgdGhpcy5fc2VuZENvbW1hbmRzKCk7XG4gICAgICAgIHRoaXMuX3Byb2Nlc3NQaHlzaWNzVXBkYXRlcygpO1xuICAgICAgICB0aGlzLl91cGRhdGVDb21wbGV0ZSA9IHRydWU7XG4gICAgfVxuIH07XG5cblN5bmNDbGllbnQucHJvdG90eXBlLnBvc3RSZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGxldGUgPSBmYWxzZTtcbn07XG5cblxudmFyIGFjdGlvbnMgPSBbXTsgICAgICAgICAgICAgICAvLyBNb2R1bGUgc2NvcGUgdG8gYXZvaWQgYWxsb2NhdGlvbnNcbnZhciBhY3Rpb247XG4vKipcbiAqIFNlbmQgcXVldWVkIGNvbW1hbmRzIHRoYXQgaGF2ZSBiZWVuIGV4ZWN1dGVkIHRvIHRoZSBzZXJ2ZXJcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5fc2VuZENvbW1hbmRzID0gZnVuY3Rpb24gKCkge1xuICAgIGFjdGlvbnMubGVuZ3RoID0gMDtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5jbWRRdWV1ZS5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgYWN0aW9uID0gdGhpcy5jbWRRdWV1ZVtpXTtcbiAgICAgICAgaWYgKGFjdGlvbi5leGVjdXRlZCkge1xuICAgICAgICAgICAgYWN0aW9ucy51bnNoaWZ0KGFjdGlvbik7XG4gICAgICAgICAgICB0aGlzLmNtZFF1ZXVlLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnZG8nLCBhY3Rpb25zKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnc2VuZGluZyBhY3Rpb25zJywgYWN0aW9ucyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVzIGludGVycG9sYXRpb24gLyBwcmVkaWN0aW9uIHJlc29sdXRpb24gZm9yIHBoeXNpY3MgYm9kaWVzXG4gKlxuICogQHByaXZhdGVcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUuX3Byb2Nlc3NQaHlzaWNzVXBkYXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaW50ZXJwVGltZSA9IHRoaXMuZ2FtZS50aW1lLm5vdyArIHRoaXMuX2xhdGVuY3kgLSB0aGlzLmdhbWUuc3RhcmNvZGVyLmNvbmZpZy5yZW5kZXJMYXRlbmN5O1xuICAgIHZhciBvaWRzID0gT2JqZWN0LmtleXModGhpcy5leHRhbnQpO1xuICAgIGZvciAodmFyIGkgPSBvaWRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBzcHJpdGUgPSB0aGlzLmV4dGFudFtvaWRzW2ldXTtcbiAgICAgICAgdmFyIHF1ZXVlID0gc3ByaXRlLnVwZGF0ZVF1ZXVlO1xuICAgICAgICB2YXIgYmVmb3JlID0gbnVsbCwgYWZ0ZXIgPSBudWxsO1xuXG4gICAgICAgIC8vIEZpbmQgdXBkYXRlcyBiZWZvcmUgYW5kIGFmdGVyIGludGVycFRpbWVcbiAgICAgICAgdmFyIGogPSAxO1xuICAgICAgICB3aGlsZSAocXVldWVbal0pIHtcbiAgICAgICAgICAgIGlmIChxdWV1ZVtqXS50aW1lc3RhbXAgPiBpbnRlcnBUaW1lKSB7XG4gICAgICAgICAgICAgICAgYWZ0ZXIgPSBxdWV1ZVtqXTtcbiAgICAgICAgICAgICAgICBiZWZvcmUgPSBxdWV1ZVtqLTFdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaisrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm9uZSAtIHdlJ3JlIGJlaGluZC5cbiAgICAgICAgaWYgKCFiZWZvcmUgJiYgIWFmdGVyKSB7XG4gICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID49IDIpIHsgICAgLy8gVHdvIG1vc3QgcmVjZW50IHVwZGF0ZXMgYXZhaWxhYmxlPyBVc2UgdGhlbS5cbiAgICAgICAgICAgICAgICBiZWZvcmUgPSBxdWV1ZVtxdWV1ZS5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICBhZnRlciA9IHF1ZXVlW3F1ZXVlLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ0xhZ2dpbmcnLCBvaWRzW2ldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7ICAgICAgICAgICAgICAgICAgICAvLyBObz8gSnVzdCBiYWlsXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnQmFpbGluZycsIG9pZHNbaV0pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnT2snLCBpbnRlcnBUaW1lLCBxdWV1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgcXVldWUuc3BsaWNlKDAsIGogLSAxKTsgICAgIC8vIFRocm93IG91dCBvbGRlciB1cGRhdGVzXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3BhbiA9IGFmdGVyLnRpbWVzdGFtcCAtIGJlZm9yZS50aW1lc3RhbXA7XG4gICAgICAgIHZhciB0ID0gKGludGVycFRpbWUgLSBiZWZvcmUudGltZXN0YW1wKSAvIHNwYW47XG4gICAgICAgIC8vaWYgKHQgPCAwIHx8IHQgPiAxKSB7XG4gICAgICAgIC8vICAgIGNvbnNvbGUubG9nKCd3ZWlyZCB0aW1lJywgdCk7XG4gICAgICAgIC8vfVxuICAgICAgICB0ID0gTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgdCkpOyAgICAgICAgLy8gRklYTUU6IFN0b3BnYXAgZml4IC0gU2hvdWxkbid0IG5lZWQgdGhpc1xuICAgICAgICBzcHJpdGUuc2V0UG9zQW5nbGUobGluZWFyKGJlZm9yZS54LCBhZnRlci54LCB0KSwgbGluZWFyKGJlZm9yZS55LCBhZnRlci55LCB0KSwgbGluZWFyKGJlZm9yZS5hLCBhZnRlci5hLCB0KSk7XG4gICAgfVxufTtcblxuLy8gSGVscGVyc1xuXG4vKipcbiAqIEludGVycG9sYXRlIGJldHdlZW4gdHdvIHBvaW50cyB3aXRoIGhlcm1pdGUgc3BsaW5lXG4gKiBOQiAtIGN1cnJlbnRseSB1bnVzZWQgYW5kIHByb2JhYmx5IGJyb2tlblxuICpcbiAqIEBwYXJhbSBwMCB7bnVtYmVyfSAtIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSBwMSB7bnVtYmVyfSAtIGZpbmFsIHZhbHVlXG4gKiBAcGFyYW0gdjAge251bWJlcn0gLSBpbml0aWFsIHNsb3BlXG4gKiBAcGFyYW0gdjEge251bWJlcn0gLSBmaW5hbCBzbG9wZVxuICogQHBhcmFtIHQge251bWJlcn0gLSBwb2ludCBvZiBpbnRlcnBvbGF0aW9uIChiZXR3ZWVuIDAgYW5kIDEpXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIGludGVycG9sYXRlZCB2YWx1ZVxuICovXG5mdW5jdGlvbiBoZXJtaXRlIChwMCwgcDEsIHYwLCB2MSwgdCkge1xuICAgIHZhciB0MiA9IHQqdDtcbiAgICB2YXIgdDMgPSB0KnQyO1xuICAgIHJldHVybiAoMip0MyAtIDMqdDIgKyAxKSpwMCArICh0MyAtIDIqdDIgKyB0KSp2MCArICgtMip0MyArIDMqdDIpKnAxICsgKHQzIC0gdDIpKnYxO1xufVxuXG4vKipcbiAqIEludGVycG9sYXRlIGJldHdlZW4gdHdvIHBvaW50cyB3aXRoIGxpbmVhciBzcGxpbmVcbiAqXG4gKiBAcGFyYW0gcDAge251bWJlcn0gLSBpbml0aWFsIHZhbHVlXG4gKiBAcGFyYW0gcDEge251bWJlcn0gLSBmaW5hbCB2YWx1ZVxuICogQHBhcmFtIHQge251bWJlcn0gLSBwb2ludCBvZiBpbnRlcnBvbGF0aW9uIChiZXR3ZWVuIDAgYW5kIDEpXG4gKiBAcGFyYW0gc2NhbGUge251bWJlcn0gLSBzY2FsZSBmYWN0b3IgdG8gbm9ybWFsaXplIHVuaXRzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIGludGVycG9sYXRlZCB2YWx1ZVxuICovXG5mdW5jdGlvbiBsaW5lYXIgKHAwLCBwMSwgdCwgc2NhbGUpIHtcbiAgICBzY2FsZSA9IHNjYWxlIHx8IDE7XG4gICAgcmV0dXJuIHAwICsgKHAxIC0gcDApKnQqc2NhbGU7XG59XG5cblN0YXJjb2Rlci5TZXJ2ZXJTeW5jID0gU3luY0NsaWVudDtcbm1vZHVsZS5leHBvcnRzID0gU3luY0NsaWVudDsiLCIvKipcbiAqIEJvb3QuanNcbiAqXG4gKiBCb290IHN0YXRlIGZvciBTdGFyY29kZXJcbiAqIExvYWQgYXNzZXRzIGZvciBwcmVsb2FkIHNjcmVlbiBhbmQgY29ubmVjdCB0byBzZXJ2ZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29udHJvbHMgPSByZXF1aXJlKCcuLi9waGFzZXJwbHVnaW5zL0NvbnRyb2xzLmpzJyk7XG52YXIgU3luY0NsaWVudCA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvU3luY0NsaWVudC5qcycpO1xuXG52YXIgQm9vdCA9IGZ1bmN0aW9uICgpIHt9O1xuXG5Cb290LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG5Cb290LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJvb3Q7XG5cbi8vdmFyIF9jb25uZWN0ZWQgPSBmYWxzZTtcblxuLyoqXG4gKiBTZXQgcHJvcGVydGllcyB0aGF0IHJlcXVpcmUgYm9vdGVkIGdhbWUgc3RhdGUsIGF0dGFjaCBwbHVnaW5zLCBjb25uZWN0IHRvIGdhbWUgc2VydmVyXG4gKi9cbkJvb3QucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy9jb25zb2xlLmxvZygnSW5pdCBCb290JywgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0KTtcbiAgICAvL2NvbnNvbGUubG9nKCdpdyBCb290Jywgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCwgc2NyZWVuLndpZHRoLCBzY3JlZW4uaGVpZ2h0LCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyk7XG4gICAgLy90aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlO1xuICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRTtcbiAgICB0aGlzLmdhbWUuc2NhbGUub25TaXplQ2hhbmdlLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdtYXN0ZXIgcmVzaXplIENCJyk7XG4gICAgfSk7XG4gICAgdGhpcy5nYW1lLnJlbmRlcmVyLnJlbmRlclNlc3Npb24ucm91bmRQaXhlbHMgPSB0cnVlO1xuICAgIHRoaXMuZ2FtZS5zaGFyZWRHcmFwaGljcyA9IHRoaXMuZ2FtZS5tYWtlLmdyYXBoaWNzKCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBwU2NhbGUgPSB0aGlzLnN0YXJjb2Rlci5jb25maWcucGh5c2ljc1NjYWxlO1xuICAgIHZhciBpcFNjYWxlID0gMS9wU2NhbGU7XG4gICAgdmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5jb25maWcgPSB7XG4gICAgICAgIHB4bTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBpcFNjYWxlKmE7XG4gICAgICAgIH0sXG4gICAgICAgIG1weDogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBmbG9vcihwU2NhbGUqYSk7XG4gICAgICAgIH0sXG4gICAgICAgIHB4bWk6IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gLWlwU2NhbGUqYTtcbiAgICAgICAgfSxcbiAgICAgICAgbXB4aTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBmbG9vcigtcFNjYWxlKmEpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zZXJ2ZXJDb25uZWN0KCk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5jb250cm9scyA9IHRoaXMuZ2FtZS5wbHVnaW5zLmFkZChDb250cm9scyxcbiAgICAvLyAgICB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy90aGlzLmdhbWUuam95c3RpY2sgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oUGhhc2VyLlZpcnR1YWxKb3lzdGljayk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5jb250cm9scyA9IHRoaXMuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihDb250cm9scywgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIC8vIFNldCB1cCBzb2NrZXQuaW8gY29ubmVjdGlvblxuICAgIC8vdGhpcy5zdGFyY29kZXIuc29ja2V0ID0gdGhpcy5zdGFyY29kZXIuaW8odGhpcy5zdGFyY29kZXIuY29uZmlnLnNlcnZlclVyaSxcbiAgICAvLyAgICB0aGlzLnN0YXJjb2Rlci5jb25maWcuaW9DbGllbnRPcHRpb25zKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLnNvY2tldC5vbignc2VydmVyIHJlYWR5JywgZnVuY3Rpb24gKHBsYXllck1zZykge1xuICAgIC8vICAgIC8vIEZJWE1FOiBIYXMgdG8gaW50ZXJhY3Qgd2l0aCBzZXNzaW9uIGZvciBhdXRoZW50aWNhdGlvbiBldGMuXG4gICAgLy8gICAgc2VsZi5zdGFyY29kZXIucGxheWVyID0gcGxheWVyTXNnO1xuICAgIC8vICAgIC8vc2VsZi5zdGFyY29kZXIuc3luY2NsaWVudCA9IHNlbGYuZ2FtZS5wbHVnaW5zLmFkZChTeW5jQ2xpZW50LFxuICAgIC8vICAgIC8vICAgIHNlbGYuc3RhcmNvZGVyLnNvY2tldCwgc2VsZi5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIC8vICAgIHNlbGYuc3RhcmNvZGVyLnN5bmNjbGllbnQgPSBzZWxmLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oU3luY0NsaWVudCxcbiAgICAvLyAgICAgICAgc2VsZi5zdGFyY29kZXIuc29ja2V0LCBzZWxmLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy8gICAgX2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgLy99KTtcbn07XG5cbi8qKlxuICogUHJlbG9hZCBtaW5pbWFsIGFzc2V0cyBmb3IgcHJvZ3Jlc3Mgc2NyZWVuXG4gKi9cbkJvb3QucHJvdG90eXBlLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2Jhcl9sZWZ0JywgJ2Fzc2V0cy9pbWFnZXMvZ3JlZW5CYXJMZWZ0LnBuZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCdiYXJfbWlkJywgJ2Fzc2V0cy9pbWFnZXMvZ3JlZW5CYXJNaWQucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2Jhcl9yaWdodCcsICdhc3NldHMvaW1hZ2VzL2dyZWVuQmFyUmlnaHQucG5nJyk7XG59O1xuXG4vKipcbiAqIEtpY2sgaW50byBuZXh0IHN0YXRlIG9uY2UgaW5pdGlhbGl6YXRpb24gYW5kIHByZWxvYWRpbmcgYXJlIGRvbmVcbiAqL1xuQm9vdC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnbG9hZGVyJyk7XG59O1xuXG4vKipcbiAqIEFkdmFuY2UgZ2FtZSBzdGF0ZSBvbmNlIG5ldHdvcmsgY29ubmVjdGlvbiBpcyBlc3RhYmxpc2hlZFxuICovXG4vL0Jvb3QucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbi8vICAgIC8vIEZJWE1FOiBkb24ndCB3YWl0IGhlcmUgLSBzaG91bGQgYmUgaW4gY3JlYXRlXG4vLyAgICBpZiAodGhpcy5zdGFyY29kZXIuY29ubmVjdGVkKSB7XG4vLyAgICAgICAgLy90aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ3NwYWNlJyk7XG4vLyAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdsb2dpbicpO1xuLy8gICAgfVxuLy99O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb3Q7IiwiLyoqXG4gKiBMb2FkZXIuanNcbiAqXG4gKiBQaGFzZXIgc3RhdGUgdG8gcHJlbG9hZCBhc3NldHMgYW5kIGRpc3BsYXkgcHJvZ3Jlc3NcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTG9hZGVyID0gZnVuY3Rpb24gKCkge307XG5cbkxvYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuTG9hZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvYWRlcjtcblxuTG9hZGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEluaXQgYW5kIGRyYXcgc3RhcmZpZWxkXG4gICAgdGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSg2MDAsIDYwMCwgJ3N0YXJmaWVsZCcsIHRydWUpO1xuICAgIHRoaXMuc3RhcmNvZGVyLmRyYXdTdGFyRmllbGQodGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkLmN0eCwgNjAwLCAxNik7XG4gICAgdGhpcy5nYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCwgdGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkKTtcblxuICAgIC8vIFBvc2l0aW9uIHByb2dyZXNzIGJhclxuICAgIHZhciBiYXJXaWR0aCA9IE1hdGguZmxvb3IoMC40ICogdGhpcy5nYW1lLndpZHRoKTtcbiAgICB2YXIgb3JpZ2luWCA9ICh0aGlzLmdhbWUud2lkdGggLSBiYXJXaWR0aCkvMjtcbiAgICB2YXIgbGVmdCA9IHRoaXMuZ2FtZS5hZGQuaW1hZ2Uob3JpZ2luWCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclksICdiYXJfbGVmdCcpO1xuICAgIGxlZnQuYW5jaG9yLnNldFRvKDAsIDAuNSk7XG4gICAgdmFyIG1pZCA9IHRoaXMuZ2FtZS5hZGQuaW1hZ2Uob3JpZ2luWCArIGxlZnQud2lkdGgsIHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJZLCAnYmFyX21pZCcpO1xuICAgIG1pZC5hbmNob3Iuc2V0VG8oMCwgMC41KTtcbiAgICB2YXIgcmlnaHQgPSB0aGlzLmdhbWUuYWRkLmltYWdlKG9yaWdpblggKyBsZWZ0LndpZHRoLCB0aGlzLmdhbWUud29ybGQuY2VudGVyWSwgJ2Jhcl9yaWdodCcpO1xuICAgIHJpZ2h0LmFuY2hvci5zZXRUbygwLCAwLjUpO1xuICAgIHZhciBtaWRXaWR0aCA9IGJhcldpZHRoIC0gMiAqIGxlZnQud2lkdGg7XG4gICAgbWlkLndpZHRoID0gMDtcbiAgICB2YXIgbG9hZGluZ1RleHQgPSB0aGlzLmdhbWUuYWRkLnRleHQodGhpcy5nYW1lLndvcmxkLmNlbnRlclgsIHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJZIC0gMzYsICdMb2FkaW5nLi4uJyxcbiAgICAgICAge2ZvbnQ6ICcyNHB4IEFyaWFsJywgZmlsbDogJyNmZmZmZmYnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICBsb2FkaW5nVGV4dC5hbmNob3Iuc2V0VG8oMC41KTtcbiAgICB2YXIgcHJvZ1RleHQgPSB0aGlzLmdhbWUuYWRkLnRleHQob3JpZ2luWCArIGxlZnQud2lkdGgsIHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJZLCAnMCUnLFxuICAgICAgICB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2ZmZmZmZicsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIHByb2dUZXh0LmFuY2hvci5zZXRUbygwLjUpO1xuXG4gICAgdGhpcy5nYW1lLmxvYWQub25GaWxlQ29tcGxldGUuYWRkKGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICB2YXIgdyA9IE1hdGguZmxvb3IobWlkV2lkdGggKiBwcm9ncmVzcyAvIDEwMCk7XG4gICAgICAgIG1pZC53aWR0aCA9IHc7XG4gICAgICAgIHJpZ2h0LnggPSBtaWQueCArIHc7XG4gICAgICAgIHByb2dUZXh0LnNldFRleHQocHJvZ3Jlc3MgKyAnJScpO1xuICAgICAgICBwcm9nVGV4dC54ID0gbWlkLnggKyB3LzI7XG4gICAgfSwgdGhpcyk7XG59O1xuXG5Mb2FkZXIucHJvdG90eXBlLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gVE9ETzogSEQgYW5kIFNEIHZlcnNpb25zXG4gICAgLy8gRm9udHNcbiAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KCd0aXRsZS1mb250JyxcbiAgICAgICAgJ2Fzc2V0cy9iaXRtYXBmb250cy9rYXJuaXZvcmUxMjgucG5nJywgJ2Fzc2V0cy9iaXRtYXBmb250cy9rYXJuaXZvcmUxMjgueG1sJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYml0bWFwRm9udCgncmVhZG91dC15ZWxsb3cnLFxuICAgICAgICAnYXNzZXRzL2JpdG1hcGZvbnRzL2hlYXZ5LXllbGxvdzI0LnBuZycsICdhc3NldHMvYml0bWFwZm9udHMvaGVhdnkteWVsbG93MjQueG1sJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ3BsYXllcnRocnVzdCcsICdhc3NldHMvc291bmRzL3RocnVzdExvb3Aub2dnJyk7XG4gICAgLy8gU291bmRzXG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ2NoaW1lJywgJ2Fzc2V0cy9zb3VuZHMvY2hpbWUub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ2xldmVsdXAnLCAnYXNzZXRzL3NvdW5kcy9sZXZlbHVwLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdwbGFudHRyZWUnLCAnYXNzZXRzL3NvdW5kcy9wbGFudHRyZWUub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ2JpZ3BvcCcsICdhc3NldHMvc291bmRzL2JpZ3BvcC5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnbGl0dGxlcG9wJywgJ2Fzc2V0cy9zb3VuZHMvbGl0dGxlcG9wLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCd0YWdnZWQnLCAnYXNzZXRzL3NvdW5kcy90YWdnZWQub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ2xhc2VyJywgJ2Fzc2V0cy9zb3VuZHMvbGFzZXIub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ211c2ljJywgJ2Fzc2V0cy9zb3VuZHMvaWdub3JlLm9nZycpO1xuICAgIC8vIFNwcml0ZXNoZWV0c1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKCdqb3lzdGljaycsICdhc3NldHMvam95c3RpY2svZ2VuZXJpYy1qb3lzdGljay5wbmcnLCAnYXNzZXRzL2pveXN0aWNrL2dlbmVyaWMtam95c3RpY2suanNvbicpO1xuICAgIC8vIEltYWdlc1xuXG59O1xuXG5Mb2FkZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGFyY29kZXIuY29ubmVjdGVkKSB7XG4gICAgICAgIC8vdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdzcGFjZScpO1xuICAgICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ2xvZ2luJyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkZXI7IiwiLyoqXG4gKiBMb2dpbi5qc1xuICpcbiAqIFN0YXRlIGZvciBkaXNwbGF5aW5nIGxvZ2luIHNjcmVlbi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTG9naW4gPSBmdW5jdGlvbiAoKSB7fTtcblxuTG9naW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbkxvZ2luLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvZ2luO1xuXG5Mb2dpbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnbG9naW4nKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5zdGFyY29kZXIuc2hvd0xvZ2luKCk7XG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0Lm9uKCdsb2dnZWQgaW4nLCBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgIHNlbGYuc3RhcmNvZGVyLmhpZGVMb2dpbigpO1xuICAgICAgICBzZWxmLnN0YXJjb2Rlci5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICAgIHNlbGYuZ2FtZS5zdGF0ZS5zdGFydCgnc3BhY2UnKTtcbiAgICB9KTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zb2NrZXQub24oJ2xvZ2luIGZhaWx1cmUnLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgc2VsZi5zdGFyY29kZXIuc2V0TG9naW5FcnJvcihlcnJvcik7XG4gICAgfSk7XG59O1xuXG4vL0xvZ2luLnByb3RvdHlwZS5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuLy8gICAgdGhpcy5nYW1lLmxvYWQuYml0bWFwRm9udCgndGl0bGUtZm9udCcsXG4vLyAgICAgICAgJ2Fzc2V0cy9iaXRtYXBmb250cy9rYXJuaXZvcmUxMjgucG5nJywgJ2Fzc2V0cy9iaXRtYXBmb250cy9rYXJuaXZvcmUxMjgueG1sJyk7XG4vL307XG5cbi8vTG9naW4ucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uICh3LCBoKSB7XG4vLyAgICBjb25zb2xlLmxvZygncnMgTG9naW4nLCB3LCBoKTtcbi8vfTtcblxuTG9naW4ucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL3ZhciBzdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLmRyYXdTdGFyRmllbGQodGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkLmN0eCwgNjAwLCAxNik7XG4gICAgdGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSg2MDAsIDYwMCwgJ3N0YXJmaWVsZCcsIHRydWUpO1xuICAgIHRoaXMuc3RhcmNvZGVyLmRyYXdTdGFyRmllbGQodGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkLmN0eCwgNjAwLCAxNik7XG4gICAgdGhpcy5nYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCwgdGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkKTtcbiAgICB2YXIgdGl0bGUgPSB0aGlzLmdhbWUuYWRkLmJpdG1hcFRleHQodGhpcy5nYW1lLndvcmxkLmNlbnRlclgsIDEyOCwgJ3RpdGxlLWZvbnQnLCAnU1RBUkNPREVSJyk7XG4gICAgdGl0bGUuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9naW47XG4iLCIvKipcbiAqIFNwYWNlLmpzXG4gKlxuICogTWFpbiBnYW1lIHN0YXRlIGZvciBTdGFyY29kZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBUaHJ1c3RHZW5lcmF0b3IgPSByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVGhydXN0R2VuZXJhdG9yLmpzJyk7XG52YXIgTWluaU1hcCA9IHJlcXVpcmUoJy4uL3BoYXNlcnVpL01pbmlNYXAuanMnKTtcbnZhciBMZWFkZXJCb2FyZCA9IHJlcXVpcmUoJy4uL3BoYXNlcnVpL0xlYWRlckJvYXJkLmpzJyk7XG52YXIgVG9hc3QgPSByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVG9hc3QuanMnKTtcbnZhciBIVUQgPSByZXF1aXJlKCcuLi9waGFzZXJ1aS9IVUQuanMnKTtcblxudmFyIENvbnRyb2xzID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9Db250cm9scy5qcycpO1xudmFyIFN5bmNDbGllbnQgPSByZXF1aXJlKCcuLi9waGFzZXJwbHVnaW5zL1N5bmNDbGllbnQuanMnKTtcblxudmFyIFNwYWNlID0gZnVuY3Rpb24gKCkge307XG5cblNwYWNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG5TcGFjZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTcGFjZTtcblxuU3BhY2UucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oQ29udHJvbHMsIHRoaXMuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zeW5jY2xpZW50ID0gdGhpcy5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKFN5bmNDbGllbnQsXG4gICAgICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldCwgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIHRoaXMuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlO1xufTtcblxuU3BhY2UucHJvdG90eXBlLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgU2ltcGxlUGFydGljbGUuY2FjaGVUZXh0dXJlKHRoaXMuZ2FtZSwgVGhydXN0R2VuZXJhdG9yLnRleHR1cmVLZXksICcjZmY2NjAwJywgOCk7XG4gICAgU2ltcGxlUGFydGljbGUuY2FjaGVUZXh0dXJlKHRoaXMuZ2FtZSwgJ2J1bGxldCcsICcjOTk5OTk5JywgNCk7XG4gICAgU2ltcGxlUGFydGljbGUuY2FjaGVUZXh0dXJlKHRoaXMuZ2FtZSwgJ3RyYWN0b3InLCAnI2VlZWVlZScsIDgsIHRydWUpO1xuICAgIC8vdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ3BsYXllcnRocnVzdCcsICdhc3NldHMvc291bmRzL3RocnVzdExvb3Aub2dnJyk7XG4gICAgLy90aGlzLmdhbWUubG9hZC5hdWRpbygnY2hpbWUnLCAnYXNzZXRzL3NvdW5kcy9jaGltZS5tcDMnKTtcbiAgICAvL3RoaXMuZ2FtZS5sb2FkLmF0bGFzKCdqb3lzdGljaycsICdhc3NldHMvam95c3RpY2svZ2VuZXJpYy1qb3lzdGljay5wbmcnLCAnYXNzZXRzL2pveXN0aWNrL2dlbmVyaWMtam95c3RpY2suanNvbicpO1xuICAgIC8vdGhpcy5nYW1lLmxvYWQuYml0bWFwRm9udCgncmVhZG91dC15ZWxsb3cnLFxuICAgIC8vICAgICdhc3NldHMvYml0bWFwZm9udHMvaGVhdnkteWVsbG93MjQucG5nJywgJ2Fzc2V0cy9iaXRtYXBmb250cy9oZWF2eS15ZWxsb3cyNC54bWwnKTtcbn07XG5cblNwYWNlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ1NwYWNlIHNpemUnLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIHdpbmRvdy5zY3JvbGxUbygwLCAxKTtcbiAgICAvL2NvbnNvbGUubG9nKCdjcmVhdGUnKTtcbiAgICAvL3ZhciBybmcgPSB0aGlzLmdhbWUucm5kO1xuICAgIHZhciB3YiA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy53b3JsZEJvdW5kcztcbiAgICB2YXIgcHMgPSB0aGlzLnN0YXJjb2Rlci5jb25maWcucGh5c2ljc1NjYWxlO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLlAySlMpO1xuICAgIHRoaXMud29ybGQuc2V0Qm91bmRzLmNhbGwodGhpcy53b3JsZCwgd2JbMF0qcHMsIHdiWzFdKnBzLCAod2JbMl0td2JbMF0pKnBzLCAod2JbM10td2JbMV0pKnBzKTtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5wMi5zZXRCb3VuZHNUb1dvcmxkKHRydWUsIHRydWUsIHRydWUsIHRydWUsIGZhbHNlKTtcblxuICAgIC8vIERlYnVnZ2luZ1xuICAgIC8vdGhpcy5nYW1lLnRpbWUuYWR2YW5jZWRUaW1pbmcgPSB0cnVlO1xuXG4gICAgLy8gU2V0IHVwIERPTVxuICAgIHRoaXMuc3RhcmNvZGVyLmxheW91dERPTVNwYWNlU3RhdGUoKTtcblxuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzLnJlc2V0KCk7XG5cbiAgICAvLyBWaXJ0dWFsIGpveXN0aWNrXG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMuYWRkVmlydHVhbENvbnRyb2xzKCdqb3lzdGljaycpO1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scyA9IHt9O1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5zdGljayA9IHRoaXMuZ2FtZS5qb3lzdGljay5hZGRTdGljayhcbiAgICAvLyAgICB0aGlzLmdhbWUud2lkdGggLSAxNTAsIHRoaXMuZ2FtZS5oZWlnaHQgLSA3NSwgMTAwLCAnam95c3RpY2snKTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuc3RpY2suc2NhbGUgPSAwLjU7XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzLmZpcmVidXR0b24gPSB0aGlzLmdhbWUuam95c3RpY2suYWRkQnV0dG9uKHRoaXMuZ2FtZS53aWR0aCAtIDUwLCB0aGlzLmdhbWUuaGVpZ2h0IC0gNzUsXG4gICAgLy8gICAgJ2pveXN0aWNrJywgJ2J1dHRvbjEtdXAnLCAnYnV0dG9uMS1kb3duJyk7XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzLmZpcmVidXR0b24uc2NhbGUgPSAwLjU7XG5cbiAgICAvLyBTb3VuZHNcbiAgICB0aGlzLmdhbWUuc291bmRzID0ge307XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdwbGF5ZXJ0aHJ1c3QnLCAxLCB0cnVlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLmNoaW1lID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgnY2hpbWUnLCAxLCBmYWxzZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5wbGFudHRyZWUgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdwbGFudHRyZWUnLCAxLCBmYWxzZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5iaWdwb3AgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdiaWdwb3AnLCAxLCBmYWxzZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5saXR0bGVwb3AgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdsaXR0bGVwb3AnLCAxLCBmYWxzZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy50YWdnZWQgPSB0aGlzLmdhbWUuc291bmQuYWRkKCd0YWdnZWQnLCAxLCBmYWxzZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5sYXNlciA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ2xhc2VyJywgMSwgZmFsc2UpO1xuXG4gICAgdGhpcy5nYW1lLnNvdW5kcy5tdXNpYyA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ211c2ljJywgMSwgdHJ1ZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5tdXNpYy5wbGF5KCk7XG5cbiAgICAvLyBCYWNrZ3JvdW5kXG4gICAgLy92YXIgc3RhcmZpZWxkID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSg2MDAsIDYwMCk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5kcmF3U3RhckZpZWxkKHN0YXJmaWVsZC5jdHgsIDYwMCwgMTYpO1xuICAgIHRoaXMuc3RhcmNvZGVyLnN0YXJmaWVsZCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEoNjAwLCA2MDAsICdzdGFyZmllbGQnLCB0cnVlKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5kcmF3U3RhckZpZWxkKHRoaXMuc3RhcmNvZGVyLnN0YXJmaWVsZC5jdHgsIDYwMCwgMTYpO1xuICAgIHRoaXMuZ2FtZS5hZGQudGlsZVNwcml0ZSh3YlswXSpwcywgd2JbMV0qcHMsICh3YlsyXS13YlswXSkqcHMsICh3YlszXS13YlsxXSkqcHMsIHRoaXMuc3RhcmNvZGVyLnN0YXJmaWVsZCk7XG5cbiAgICB0aGlzLnN0YXJjb2Rlci5zeW5jY2xpZW50LnN0YXJ0KCk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5zb2NrZXQuZW1pdCgnY2xpZW50IHJlYWR5Jyk7XG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0LmVtaXQoJ3JlYWR5Jyk7XG4gICAgdGhpcy5fc2V0dXBNZXNzYWdlSGFuZGxlcnModGhpcy5zdGFyY29kZXIuc29ja2V0KTtcblxuICAgIC8vIEdyb3VwcyBmb3IgcGFydGljbGUgZWZmZWN0c1xuICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3IgPSBuZXcgVGhydXN0R2VuZXJhdG9yKHRoaXMuZ2FtZSk7XG5cbiAgICAvLyBHcm91cCBmb3IgZ2FtZSBvYmplY3RzXG4gICAgdGhpcy5nYW1lLnBsYXlmaWVsZCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgIC8vIFVJXG4gICAgdGhpcy5nYW1lLnVpID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgIHRoaXMuZ2FtZS51aS5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcblxuICAgIC8vIEludmVudG9yeSAtIHRpbmtlciB3aXRoIHBvc2l0aW9uXG4gICAgLy92YXIgbGFiZWwgPSB0aGlzLmdhbWUubWFrZS50ZXh0KHRoaXMuZ2FtZS53aWR0aCAvIDIsIDI1LCAnSU5WRU5UT1JZJyxcbiAgICAvLyAgICB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2ZmOTkwMCcsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIC8vbGFiZWwuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICAvL3RoaXMuZ2FtZS51aS5hZGQobGFiZWwpO1xuICAgIC8vdGhpcy5nYW1lLmludmVudG9yeXRleHQgPSB0aGlzLmdhbWUubWFrZS50ZXh0KHRoaXMuZ2FtZS53aWR0aCAtIDEwMCwgNTAsICcwIGNyeXN0YWxzJyxcbiAgICAvLyAgICB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2NjYzAwMCcsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIC8vdGhpcy5nYW1lLmludmVudG9yeXRleHQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBUZXh0KDIwMDAsIDUwLCAncmVhZG91dC15ZWxsb3cnLCAnMCcpO1xuICAgIC8vdGhpcy5nYW1lLmludmVudG9yeXRleHQuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICAvL3RoaXMuZ2FtZS51aS5hZGQodGhpcy5nYW1lLmludmVudG9yeXRleHQpO1xuICAgIHRoaXMuZ2FtZS5odWQgPSBuZXcgSFVEKHRoaXMuZ2FtZSwgKHRoaXMuZ2FtZS53aWR0aCAtIDE4MCkvIDIsIDIsIDE4MCwgMTIwKTtcbiAgICB0aGlzLmdhbWUudWkuYWRkKHRoaXMuZ2FtZS5odWQpO1xuICAgIC8vdGhpcy5nYW1lLmh1ZC5hbmNob3Iuc2V0VG8oMC41LCAwKTtcblxuICAgIC8vIE1pbmlNYXBcbiAgICB0aGlzLmdhbWUubWluaW1hcCA9IG5ldyBNaW5pTWFwKHRoaXMuZ2FtZSwgMzAwLCAzMDApO1xuICAgIHRoaXMuZ2FtZS51aS5hZGQodGhpcy5nYW1lLm1pbmltYXApO1xuICAgIHRoaXMuZ2FtZS5taW5pbWFwLnggPSAxMDtcbiAgICB0aGlzLmdhbWUubWluaW1hcC55ID0gMTA7XG5cbiAgICAvLyBMZWFkZXJib2FyZFxuICAgIHRoaXMuZ2FtZS5sZWFkZXJib2FyZCA9IG5ldyBMZWFkZXJCb2FyZCh0aGlzLmdhbWUsIHRoaXMuc3RhcmNvZGVyLnBsYXllck1hcCwgMjAwLCAzMDApO1xuICAgIHRoaXMuZ2FtZS51aS5hZGQodGhpcy5nYW1lLmxlYWRlcmJvYXJkKTtcbiAgICB0aGlzLmdhbWUubGVhZGVyYm9hcmQueCA9IHRoaXMuZ2FtZS53aWR0aCAtIDIwMDtcbiAgICB0aGlzLmdhbWUubGVhZGVyYm9hcmQueSA9IDA7XG4gICAgdGhpcy5nYW1lLmxlYWRlcmJvYXJkLnZpc2libGUgPSBmYWxzZTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbn07XG5cblNwYWNlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gRklYTUU6IGp1c3QgYSBtZXNzIGZvciB0ZXN0aW5nXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzLnByb2Nlc3NRdWV1ZShmdW5jdGlvbiAoYSkge1xuICAgICAgICBpZiAoYS50eXBlID09PSAndXBfcHJlc3NlZCcpIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLmxvY2FsU3RhdGUudGhydXN0ID0gJ3N0YXJ0aW5nJztcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QucGxheSgpO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUudGhydXN0Z2VuZXJhdG9yLnN0YXJ0T24oc2VsZi5nYW1lLnBsYXllclNoaXApO1xuICAgICAgICB9IGVsc2UgaWYgKGEudHlwZSA9PT0gJ3VwX3JlbGVhc2VkJykge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnBsYXllclNoaXAubG9jYWxTdGF0ZS50aHJ1c3QgPSAnc2h1dGRvd24nO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUuc291bmRzLnBsYXllcnRocnVzdC5zdG9wKCk7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RvcE9uKHNlbGYuZ2FtZS5wbGF5ZXJTaGlwKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuU3BhY2UucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2NvbnNvbGUubG9nKCcrcmVuZGVyKycpO1xuICAgIC8vaWYgKHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUpIHtcbiAgICAvLyAgICB2YXIgZCA9IHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUucG9zaXRpb24ueCAtIHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUucHJldmlvdXNQb3NpdGlvbi54O1xuICAgIC8vICAgIGNvbnNvbGUubG9nKCdEZWx0YScsIGQsIHRoaXMuZ2FtZS50aW1lLmVsYXBzZWQsIGQgLyB0aGlzLmdhbWUudGltZS5lbGFwc2VkKTtcbiAgICAvL31cbiAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpO1xuICAgIC8vdGhpcy5nYW1lLmRlYnVnLnRleHQoJ0ZwczogJyArIHRoaXMuZ2FtZS50aW1lLmZwcywgNSwgMjApO1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5zdGljay5kZWJ1Zyh0cnVlLCB0cnVlKTtcbiAgICAvL3RoaXMuZ2FtZS5kZWJ1Zy5jYW1lcmFJbmZvKHRoaXMuZ2FtZS5jYW1lcmEsIDEwMCwgMjApO1xuICAgIC8vaWYgKHRoaXMuc2hpcCkge1xuICAgIC8vICAgIHRoaXMuZ2FtZS5kZWJ1Zy5zcHJpdGVJbmZvKHRoaXMuc2hpcCwgNDIwLCAyMCk7XG4gICAgLy99XG59O1xuXG5TcGFjZS5wcm90b3R5cGUuX3NldHVwTWVzc2FnZUhhbmRsZXJzID0gZnVuY3Rpb24gKHNvY2tldCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzb2NrZXQub24oJ21zZyBjcnlzdGFsIHBpY2t1cCcsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5jaGltZS5wbGF5KCk7XG4gICAgICAgIFRvYXN0LnNwaW5VcChzZWxmLmdhbWUsIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLngsIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLnksICcrJyArIHZhbCArICcgY3J5c3RhbHMhJyk7XG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCdtc2cgcGxhbnQgdHJlZScsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5wbGFudHRyZWUucGxheSgpO1xuICAgIH0pO1xuICAgIHNvY2tldC5vbignbXNnIGFzdGVyb2lkIHBvcCcsIGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICAgIGlmIChzaXplID4gMSkge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5iaWdwb3AucGxheSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5saXR0bGVwb3AucGxheSgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCdtc2cgdGFnZ2VkJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBzZWxmLmdhbWUuc291bmRzLnRhZ2dlZC5wbGF5KCk7XG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCdtc2cgbGFzZXInLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMubGFzZXIucGxheSgpO1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGFjZTtcbiIsIi8qKlxuICogSFVELmpzXG4gKlxuICogRGlzcGxheSBmb3IgaW52ZW50b3J5IGFuZCBzdGF0dXNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcbnZhciBCdWxsZXQgPSByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvQnVsbGV0LmpzJyk7XG5cbnZhciBIVUQgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgIFBoYXNlci5HcmFwaGljcy5jYWxsKHRoaXMsIGdhbWUsIHgsIHkpO1xuICAgIHRoaXMubGF5b3V0KHdpZHRoLCBoZWlnaHQpO1xufTtcblxuSFVELnByb3RvdHlwZSA9IFBoYXNlci5HcmFwaGljcy5wcm90b3R5cGU7XG5IVUQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSFVEO1xuXG5IVUQucHJvdG90eXBlLmxheW91dCA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIHh1bml0ID0gTWF0aC5mbG9vcih3aWR0aCAvIDE4KTtcbiAgICB2YXIgeXVuaXQgPSBNYXRoLmZsb29yKGhlaWdodCAvIDgpO1xuICAgIC8vIE91dGxpbmVcbiAgICB0aGlzLmxpbmVTdHlsZSgyLCAweGNjY2NjYywgMS4wKTtcbiAgICAvLyBDcm9zc2xpbmVcbiAgICB0aGlzLm1vdmVUbygwLCA0ICogeXVuaXQpO1xuICAgIHRoaXMubGluZVRvKHdpZHRoLCA0ICogeXVuaXQpO1xuICAgIHRoaXMuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgLy8gQ29kZSBBcmVhXG4gICAgdGhpcy5jb2RldGV4dCA9IHRoaXMuZ2FtZS5tYWtlLnRleHQoeHVuaXQgKiA5LCB5dW5pdCAqIDIsICdDT0RFJyxcbiAgICAgICAge2ZvbnQ6ICcyNHB4IEFyaWFsJywgZmlsbDogJyNmZjk5MDAnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICB0aGlzLmNvZGV0ZXh0LmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLmNvZGV0ZXh0KTtcbiAgICAvLyBJbnZlbnRvcnkgYXJlYVxuICAgIC8vIENyeXN0YWwgaWNvblxuICAgIHRoaXMubGluZVN0eWxlKDEsIDB4MDBmZmZmLCAxLjApO1xuICAgIHRoaXMuZHJhd1BvbHlnb24oUGF0aHMubm9ybWFsaXplKFBhdGhzLm9jdGFnb24sIDUsIHh1bml0ICogMiwgeXVuaXQgKiA1LCB0cnVlKSk7XG4gICAgdGhpcy5kcmF3UG9seWdvbihQYXRocy5ub3JtYWxpemUoUGF0aHMuZDJjcm9zcywgNSwgeHVuaXQgKiAyLCB5dW5pdCAqIDUsIHRydWUpKTtcbiAgICAvLyBBbW91bnRcbiAgICAvL3RoaXMuY3J5c3RhbHRleHQgPSB0aGlzLmdhbWUubWFrZS50ZXh0KHh1bml0ICogNiwgeXVuaXQgKiA1LjI1LCAnMCcsXG4gICAgLy8gICAge2ZvbnQ6ICcyNnB4IEFyaWFsJywgZmlsbDogJyMwMGZmZmYnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICB0aGlzLmNyeXN0YWx0ZXh0ID0gdGhpcy5nYW1lLnN0YXJjb2Rlci5tYWtlRmxleFRleHQoeHVuaXQgKiA2LCB5dW5pdCAqIDUuMjUsICcwJyxcbiAgICAgICAgdGhpcy5nYW1lLnN0YXJjb2Rlci5jb25maWcuZm9udHMuaHVkQ29kZSk7XG4gICAgdGhpcy5jcnlzdGFsdGV4dC5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5jcnlzdGFsdGV4dCk7XG4gICAgLy8gVHJlZSBpY29uXG4gICAgdGhpcy5saW5lU3R5bGUoMSwgMHgwMGZmMDAsIDEuMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0cmVlSWNvblBhdGhzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLmRyYXdQb2x5Z29uKFBhdGhzLm5vcm1hbGl6ZSh0cmVlSWNvblBhdGhzW2ldLCA1LCB4dW5pdCAqIDExLCB5dW5pdCAqIDUsIGZhbHNlKSk7XG4gICAgfVxuICAgIC8vIEFtb3VudFxuICAgIHRoaXMudHJlZXRleHQgPSB0aGlzLmdhbWUubWFrZS50ZXh0KHh1bml0ICogMTUsIHl1bml0ICogNS4yNSwgJzAnLFxuICAgICAgICB7Zm9udDogJzI2cHggQXJpYWwnLCBmaWxsOiAnIzAwZmYwMCcsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIHRoaXMudHJlZXRleHQuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMudHJlZXRleHQpO1xuICAgIHRoaXMubGFzZXJzID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICB2YXIgbGFzZXIgPSBuZXcgQnVsbGV0KHRoaXMuZ2FtZSwge25vcGh5c2ljczogdHJ1ZSwgcHJvcGVydGllczoge2xpbmVDb2xvcjogJyNmZjAwMDAnfX0pO1xuICAgICAgICBsYXNlci54ID0geHVuaXQgKiAyICsgaSAqIDI0O1xuICAgICAgICBsYXNlci55ID0geXVuaXQgKiA3O1xuICAgICAgICBsYXNlci5hbmNob3Iuc2V0VG8oMC41KTtcbiAgICAgICAgbGFzZXIuYW5nbGUgPSA5MDtcbiAgICAgICAgdGhpcy5hZGRDaGlsZChsYXNlcik7XG4gICAgICAgIHRoaXMubGFzZXJzLnB1c2gobGFzZXIpO1xuICAgIH1cblxufTtcblxuSFVELnByb3RvdHlwZS5zZXRMYXNlckNvbG9yID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgdGhpcy5sYXNlcnNbMF0uY29uZmlnKHtsaW5lQ29sb3I6IGNvbG9yfSk7XG4gICAgdGhpcy5sYXNlcnNbMF0udXBkYXRlVGV4dHVyZXMoKTtcbn07XG5cbkhVRC5wcm90b3R5cGUuc2V0Q3J5c3RhbHMgPSBmdW5jdGlvbiAoeCkge1xuICAgIHRoaXMuY3J5c3RhbHRleHQuc2V0VGV4dCh4LnRvU3RyaW5nKCkpO1xufTtcblxuXG5IVUQucHJvdG90eXBlLnNldFRyZWVzID0gZnVuY3Rpb24gKHgpIHtcbiAgICB0aGlzLnRyZWV0ZXh0LnNldFRleHQoeC50b1N0cmluZygpKTtcbn07XG5cbkhVRC5wcm90b3R5cGUuc2V0Q2hhcmdlID0gZnVuY3Rpb24gKHgpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGFzZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoeCA+IGkpIHtcbiAgICAgICAgICAgIHRoaXMubGFzZXJzW2ldLnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sYXNlcnNbaV0udmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxudmFyIHRyZWVJY29uUGF0aHMgPSBbXG4gICAgW1swLDJdLFswLC0yXV0sXG4gICAgW1stMiwtMl0sWzAsMV0sWzIsLTJdXSxcbiAgICBbWy0xLC0yXSxbMCwtMV0sWzEsLTJdXSxcbiAgICBbWy0yLC0xXSxbLTEsLTAuNV0sWy0yLDBdXSxcbiAgICBbWzIsLTFdLFsxLC0wLjVdLFsyLDBdXVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBIVUQ7XG4iLCIvKipcbiAqIExlYWRlckJvYXJkLmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIExlYWRlckJvYXJkID0gZnVuY3Rpb24gKGdhbWUsIHBsYXllcm1hcCwgd2lkdGgsIGhlaWdodCkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUpO1xuICAgIHRoaXMucGxheWVyTWFwID0gcGxheWVybWFwO1xuICAgIHRoaXMub3BlbiA9IHRydWU7XG4gICAgdGhpcy5tYWluV2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLm1haW5IZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5pY29uU2l6ZSA9IDI0OyAgICAgICAgIC8vIE1ha2UgcmVzcG9uc2l2ZT9cbiAgICB0aGlzLmZvbnRTaXplID0gMTg7XG4gICAgdGhpcy5udW1MaW5lcyA9IE1hdGguZmxvb3IoKGhlaWdodCAtIHRoaXMuaWNvblNpemUgLSAyKSAvICh0aGlzLmZvbnRTaXplICsgMikpO1xuXG4gICAgdGhpcy5tYWluID0gZ2FtZS5tYWtlLmdyb3VwKCk7XG4gICAgdGhpcy5tYWluLnBpdm90LnNldFRvKHdpZHRoLCAwKTtcbiAgICB0aGlzLm1haW4ueCA9IHdpZHRoO1xuICAgIHRoaXMuYWRkKHRoaXMubWFpbik7XG5cbiAgICAvLyBCYWNrZ3JvdW5kXG4gICAgdmFyIGJpdG1hcCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgYml0bWFwLmN0eC5maWxsU3R5bGUgPSAncmdiYSgxMjgsIDEyOCwgMTI4LCAwLjI1KSc7XG4gICAgLy9iaXRtYXAuY3R4LmZpbGxTdHlsZSA9ICcjOTk5OTk5JztcbiAgICAvL2JpdG1hcC5jdHguZ2xvYmFsQWxwaGEgPSAwLjU7XG4gICAgYml0bWFwLmN0eC5maWxsUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAvL3RoaXMuYm9hcmQgPSBuZXcgUGhhc2VyLlNwcml0ZShnYW1lLCB3aWR0aCwgMCwgdGhpcy5iaXRtYXApO1xuICAgIC8vdGhpcy5ib2FyZC5waXZvdC5zZXRUbyh3aWR0aCwgMCk7XG4gICAgdGhpcy5tYWluLmFkZChuZXcgUGhhc2VyLlNwcml0ZShnYW1lLCAwLCAwLCBiaXRtYXApKTtcblxuICAgIC8vIFRpdGxlXG4gICAgdGhpcy50aXRsZSA9IGdhbWUuc3RhcmNvZGVyLmFkZEZsZXhUZXh0KCh3aWR0aCAtIHRoaXMuaWNvblNpemUpIC8gMiwgNCwgJ1RhZ3MnLFxuICAgICAgICB0aGlzLmdhbWUuc3RhcmNvZGVyLmNvbmZpZy5mb250cy5sZWFkZXJCb2FyZFRpdGxlLCB0aGlzLm1haW4pO1xuICAgIHRoaXMudGl0bGUuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG5cbiAgICAvLyBEaXNwbGF5IGxpbmVzXG4gICAgdGhpcy5saW5lcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5udW1MaW5lczsgaSsrKSB7XG4gICAgICAgIHZhciBsaW5lID0gZ2FtZS5zdGFyY29kZXIuYWRkRmxleFRleHQoNCwgdGhpcy5pY29uU2l6ZSArIDIgKyBpICogKHRoaXMuZm9udFNpemUgKyAyKSxcbiAgICAgICAgICAgICctJywgdGhpcy5nYW1lLnN0YXJjb2Rlci5jb25maWcuZm9udHMubGVhZGVyQm9hcmQsIHRoaXMubWFpbik7XG4gICAgICAgIGxpbmUua2lsbCgpO1xuICAgICAgICB0aGlzLmxpbmVzLnB1c2gobGluZSk7XG4gICAgfVxuXG4gICAgLy8gVG9nZ2xlIGJ1dHRvblxuICAgIHZhciBidXR0b24gPSB0aGlzLm1ha2VCdXR0b24oKTsgICAgICAgLy8gR29vZCBkaW1lbnNpb25zIFRCRC4gTWFrZSByZXNwb25zaXZlP1xuICAgIGJ1dHRvbi5hbmNob3Iuc2V0VG8oMSwgMCk7ICAgICAgLy8gdXBwZXIgcmlnaHQ7XG4gICAgYnV0dG9uLnggPSB3aWR0aDtcbiAgICAvL2J1dHRvbi55ID0gMDtcbiAgICBidXR0b24uaW5wdXRFbmFibGVkID0gdHJ1ZTtcbiAgICBidXR0b24uZXZlbnRzLm9uSW5wdXREb3duLmFkZCh0aGlzLnRvZ2dsZURpc3BsYXksIHRoaXMpO1xuICAgIHRoaXMuYWRkKGJ1dHRvbik7XG5cbiAgICAvLy8vIExpc3RcbiAgICAvL3RoaXMubGlzdCA9IGdhbWUubWFrZS5ncm91cCgpO1xuICAgIC8vdGhpcy5saXN0LnggPSB3aWR0aDtcbiAgICAvL3RoaXMubGlzdC55ID0gMDtcbiAgICAvL3RoaXMubGlzdC5waXZvdC5zZXRUbyh3aWR0aCwgMCk7XG4gICAgLy90aGlzLnR3ZWVuID0gZ2FtZS50d2VlbnMuY3JlYXRlKHRoaXMuYm9hcmQuc2NhbGUpO1xuICAgIC8vXG4gICAgLy90aGlzLmFkZCh0aGlzLmxpc3QpO1xuICAgIC8vLy8gdGVzdGluZ1xuICAgIC8vdmFyIHQgPSBbJ3RpZ2VyIHByaW5jZXNzJywgJ25pbmphIGxhc2VyJywgJ3JvYm90IGZpc2gnLCAncG90YXRvIHB1cHB5JywgJ3ZhbXBpcmUgcXVpY2hlJywgJ3dpemFyZCBwYXN0YSddO1xuICAgIC8vZm9yICh2YXIgaSA9IDA7IGkgPCB0Lmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gICAgdmFyIHRleHQgPSBnYW1lLm1ha2UudGV4dCgyLCBpKjE2LCB0W2ldLCB7Zm9udDogJzE0cHggQXJpYWwnLCBmaWxsOiAnIzAwMDBmZid9KTtcbiAgICAvLyAgICB0aGlzLmxpc3QuYWRkKHRleHQpO1xuICAgIC8vfVxufTtcblxuTGVhZGVyQm9hcmQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkxlYWRlckJvYXJkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExlYWRlckJvYXJkO1xuXG5MZWFkZXJCb2FyZC5wcm90b3R5cGUubWFrZUJ1dHRvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdW5pdCA9IHRoaXMuaWNvblNpemUgLyA1O1xuICAgIHZhciB0ZXh0dXJlID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSh0aGlzLmljb25TaXplLCB0aGlzLmljb25TaXplKTtcbiAgICB2YXIgY3R4ID0gdGV4dHVyZS5jdHg7XG4gICAgLy8gRHJhdyBxdWFydGVyIGNpcmNsZVxuICAgIGN0eC5maWxsU3R5bGUgPSAnI2ZmZmZmZic7XG4gICAgLy9jdHguZ2xvYmFsQWxwaGEgPSAwLjU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8odGhpcy5pY29uU2l6ZSwgMCk7XG4gICAgY3R4LmxpbmVUbygwLCAwKTtcbiAgICBjdHguYXJjKHRoaXMuaWNvblNpemUsIDAsIHRoaXMuaWNvblNpemUsIE1hdGguUEksIDMgKiBNYXRoLlBJIC8gMiwgdHJ1ZSk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICAvLyBEcmF3IHN0ZXBzXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJyMwMDAwMDAnO1xuICAgIC8vY3R4Lmdsb2JhbEFscGhhID0gMTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbygxLjUqdW5pdCwgMyp1bml0KTtcbiAgICBjdHgubGluZVRvKDEuNSp1bml0LCAyKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oMi41KnVuaXQsIDIqdW5pdCk7XG4gICAgY3R4LmxpbmVUbygyLjUqdW5pdCwgdW5pdCk7XG4gICAgY3R4LmxpbmVUbygzLjUqdW5pdCwgdW5pdCk7XG4gICAgY3R4LmxpbmVUbygzLjUqdW5pdCwgMip1bml0KTtcbiAgICBjdHgubGluZVRvKDQuNSp1bml0LCAyKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oNC41KnVuaXQsIDMqdW5pdCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICByZXR1cm4gbmV3IFBoYXNlci5TcHJpdGUodGhpcy5nYW1lLCAwLCAwLCB0ZXh0dXJlKTtcbn07XG5cbkxlYWRlckJvYXJkLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gKHRpdGxlLCBsaXN0LCBwbGF5ZXJpZCkge1xuICAgIHRoaXMudGl0bGUuc2V0VGV4dCh0aXRsZSk7XG4gICAgdmFyIHBsYXllclZpc2libGUgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubnVtTGluZXM7IGkrKykge1xuICAgICAgICB2YXIgcGlkID0gbGlzdFtpXSAmJiBsaXN0W2ldLmlkO1xuICAgICAgICBpZiAocGlkICYmIHRoaXMucGxheWVyTWFwW3BpZF0pIHtcbiAgICAgICAgICAgIHZhciB0YWcgPSB0aGlzLnBsYXllck1hcFtwaWRdLnRhZztcbiAgICAgICAgICAgIHZhciBsaW5lID0gdGhpcy5saW5lc1tpXTtcbiAgICAgICAgICAgIGxpbmUuc2V0VGV4dCgoaSArIDEpICsgJy4gJyArIHRhZyArICcgKCcgKyBsaXN0W2ldLnZhbCArICcpJyk7XG4gICAgICAgICAgICBpZiAocGlkID09PSBwbGF5ZXJpZCkge1xuICAgICAgICAgICAgICAgIGxpbmUuZm9udFdlaWdodCA9ICdib2xkJztcbiAgICAgICAgICAgICAgICBwbGF5ZXJWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGluZS5mb250V2VpZ2h0ID0gJ25vcm1hbCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5lLnJldml2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5saW5lc1tpXS5raWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gUGxheWVyIG5vdCBpbiB0b3AgTlxuICAgIGlmICghcGxheWVyVmlzaWJsZSkge1xuICAgICAgICBmb3IgKGkgPSB0aGlzLm51bUxpbmVzOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGxpc3RbaV0uaWQgPT09IHBsYXllcmlkKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRm91bmQgLSBkaXNwbGF5IGF0IGVuZFxuICAgICAgICBpZiAoaSA8IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICBsaW5lW3RoaXMubnVtTGluZXMgLSAxXS5zZXRUZXh0KChpICsgMSkgKyAnLiAnICsgdGhpcy5wbGF5ZXJNYXBbcGxheWVyaWRdICsgJyAoJyArIGxpc3RbaV0udmFsICsgJyknKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkxlYWRlckJvYXJkLnByb3RvdHlwZS50b2dnbGVEaXNwbGF5ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5nYW1lLnR3ZWVucy5pc1R3ZWVuaW5nKHRoaXMubWFpbi5zY2FsZSkpIHtcbiAgICAgICAgaWYgKHRoaXMub3Blbikge1xuICAgICAgICAgICAgdGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzLm1haW4uc2NhbGUpLnRvKHt4OiAwLCB5OiAwfSwgNTAwLCBQaGFzZXIuRWFzaW5nLlF1YWRyYXRpYy5PdXQsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMubWFpbi5zY2FsZSkudG8oe3g6IDEsIHk6IDF9LCA1MDAsIFBoYXNlci5FYXNpbmcuUXVhZHJhdGljLk91dCwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMZWFkZXJCb2FyZDsiLCIvKipcbiAqIE1pbmlNYXAuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTWluaU1hcCA9IGZ1bmN0aW9uIChnYW1lLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICB2YXIgeHIgPSB3aWR0aCAvIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyV2lkdGg7XG4gICAgdmFyIHlyID0gaGVpZ2h0IC8gdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJIZWlnaHQ7XG4gICAgaWYgKHhyIDw9IHlyKSB7XG4gICAgICAgIHRoaXMubWFwU2NhbGUgPSB4cjtcbiAgICAgICAgdGhpcy54T2Zmc2V0ID0gLXhyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJMZWZ0O1xuICAgICAgICB0aGlzLnlPZmZzZXQgPSAteHIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlclRvcCArIChoZWlnaHQgLSB4ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VySGVpZ2h0KSAvIDI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tYXBTY2FsZSA9IHlyO1xuICAgICAgICB0aGlzLnlPZmZzZXQgPSAteXIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlclRvcDtcbiAgICAgICAgdGhpcy54T2Zmc2V0ID0gLXlyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJMZWZ0ICsgKHdpZHRoIC0geXIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlcldpZHRoKSAvIDI7XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaGljcyA9IGdhbWUubWFrZS5ncmFwaGljcygwLCAwKTtcbiAgICB0aGlzLmdyYXBoaWNzLmJlZ2luRmlsbCgweGZmZmYwMCwgMC4yKTtcbiAgICB0aGlzLmdyYXBoaWNzLmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIHRoaXMuZ3JhcGhpY3MuZW5kRmlsbCgpO1xuICAgIHRoaXMuZ3JhcGhpY3MuY2FjaGVBc0JpdG1hcCA9IHRydWU7XG4gICAgdGhpcy5hZGQodGhpcy5ncmFwaGljcyk7XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5NaW5pTWFwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1pbmlNYXA7XG5cbk1pbmlNYXAucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL3RoaXMudGV4dHVyZS5yZW5kZXJYWSh0aGlzLmdyYXBoaWNzLCAwLCAwLCB0cnVlKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuZ2FtZS5wbGF5ZmllbGQuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBib2R5ID0gdGhpcy5nYW1lLnBsYXlmaWVsZC5jaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKCFib2R5Lm1pbmlzcHJpdGUpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGJvZHkubWluaXNwcml0ZS54ID0gdGhpcy53b3JsZFRvTW1YKGJvZHkueCk7XG4gICAgICAgIGJvZHkubWluaXNwcml0ZS55ID0gdGhpcy53b3JsZFRvTW1ZKGJvZHkueSk7XG4gICAgICAgIGJvZHkubWluaXNwcml0ZS5hbmdsZSA9IGJvZHkuYW5nbGU7XG4gICAgLy8gICAgdmFyIHggPSAxMDAgKyBib2R5LnggLyA0MDtcbiAgICAvLyAgICB2YXIgeSA9IDEwMCArIGJvZHkueSAvIDQwO1xuICAgIC8vICAgIHRoaXMudGV4dHVyZS5yZW5kZXJYWShib2R5LmdyYXBoaWNzLCB4LCB5LCBmYWxzZSk7XG4gICAgfVxufTtcblxuTWluaU1hcC5wcm90b3R5cGUud29ybGRUb01tWCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIHggKiB0aGlzLm1hcFNjYWxlICsgdGhpcy54T2Zmc2V0O1xufTtcblxuTWluaU1hcC5wcm90b3R5cGUud29ybGRUb01tWSA9IGZ1bmN0aW9uICh5KSB7XG4gICAgcmV0dXJuIHkgKiB0aGlzLm1hcFNjYWxlICsgdGhpcy55T2Zmc2V0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNaW5pTWFwOyJdfQ==
