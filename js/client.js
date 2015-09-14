(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Starcoder-client.js
 *
 * Starcoder master object extended with client only properties and methods
 */
'use strict';

var Starcoder = require('./Starcoder.js');

var WorldApi = require('./client-components/WorldApi.js');
//var DOMInterface = require('./client-components/DOMInterface.js');
var CodeEndpointClient = require('./client-components/CodeEndpointClient.js');
var Starfield = require('./client-components/Starfield.js');
var LeaderBoardClient = require('./client-components/LeaderBoardClient.js');
var FlexTextWrapper = require('./client-components/FlexTextWrapper.js');
var CodeUI = require('./client-components/CodeUI.js');


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
    //this.implementFeature(DOMInterface);
    this.implementFeature(CodeUI);
    this.implementFeature(FlexTextWrapper);
};

Starcoder.prototype.serverConnect = function () {
    var self = this;
    if (this.socket) {
        delete this.socket;
        this.connected = false;
        this.lastNetError = null;
    }
    $.ajax({
        url: '/api/identity',
        method: 'GET',
        success: function (data, status) {
            //console.log('data', data);
            var serverUri = data.serverUri;
            self.player = data.player;
            self.player.id = self.player._id;
            self.socket = self.io(serverUri, self.config.ioClientOptions);
            self.socket.on('connect', function () {
                self.connected = true;
                self.lastNetError = null;
                for (var i = 0, l = self.onConnectCB.length; i < l; i++) {
                    self.onConnectCB[i].call(self, self.socket);
                }
                self.socket.emit('login', self.player);
            })
        }
    })
};

//Starcoder.prototype.serverConnect = function () {
//    var self = this;
//    if (!this.socket) {
//        delete this.socket;
//        this.connected = false;
//        this.lastNetError = null;
//    }
//    var serverUri = this.config.serverUri;
//    if (!serverUri) {
//        var protocol = this.config.serverProtol || window.location.protocol;
//        var port = this.config.serverPort || '8080';
//        serverUri = protocol + '//' + window.location.hostname + ':' + port;
//    }
//    this.socket = this.io(serverUri, this.config.ioClientOptions);
//    this.socket.on('connect', function () {
//        self.connected = true;
//        self.lastNetError = null;
//        for (var i = 0, l = self.onConnectCB.length; i < l; i++) {
//            self.onConnectCB[i].bind(self, self.socket)();
//        }
//    });
//    this.socket.on('error', function (data) {
//      console.log('socket error');
//      console.log(data);
//        this.lastNetError = data;
//    });
//};

//Starcoder.prototype.serverLogin = function (username, password) {
//    var login = {};
//    if (!password) {
//        // Guest login
//        login.gamertag = username;
//    } else {
//        login.username = username;
//        login.password = password;
//    }
//    this.socket.emit('login', login);
//};

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

},{"./Starcoder.js":2,"./client-components/CodeEndpointClient.js":3,"./client-components/CodeUI.js":4,"./client-components/FlexTextWrapper.js":5,"./client-components/LeaderBoardClient.js":6,"./client-components/Starfield.js":7,"./client-components/WorldApi.js":8,"./phaserstates/Boot.js":29,"./phaserstates/Loader.js":30,"./phaserstates/Login.js":31,"./phaserstates/Space.js":32}],2:[function(require,module,exports){
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
    serverUri: 'http://localhost:8080',
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
    interpreterRate: (1 / 30),
    interpreterStatusThresholds: {
        kill: 10,
        critical: 5,
        warn: 1
    },
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
    //this.extendConfig(config);
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

},{}],3:[function(require,module,exports){
/**
 * CodeEndpointClient.js
 *
 * Methods for sending code to server and dealing with code related responses
 */
'use strict';

module.exports = {
    onConnectCB: function (socket) {
        var self = this;
        socket.on('code status', function (status) {
            console.log('STATUS', status);
        });
        socket.on('code syntax error', function (error) {
            console.log('SYNTAX', error);
        });
        socket.on('code runtime error', function (error) {
            console.log('RUNTIME', error);
        });
        socket.on('code saved', function (label) {
            self.addCodeLabel(label);
        });
        socket.on('code loaded', function (code) {
            //console.log('load code', code);
            self.setCodeForUI(code);
        });
        socket.on('code labels', function (labels) {
            for (var i = 0, l = labels.length; i < l; i++) {
                self.addCodeLabel(labels[i]);
            }
        });
    },

    sendCodeMessage: function (kind, data) {
        console.log('sending', kind, data);
        this.socket.emit('code ' + kind, data);
    }
};
},{}],4:[function(require,module,exports){
/**
 * Created by jay on 9/12/15.
 */
'use strict';

module.exports = {
    init: function () {
        var self = this;
        this.codeWindowMode = 'blockly';
        this.codeLabelCache = {};
        this.blocklyWorkspace = Blockly.inject('blockly', {toolbox: document.getElementById('toolbox')});
        //var button = $('#send-code');
        this.aceEditor = ace.edit('aceeditor');
        var JavaScriptMode = ace.require("ace/mode/javascript").Mode;
        this.aceEditor.getSession().setMode(new JavaScriptMode());
        this.aceEditor.setTheme("ace/theme/twilight");

        $('button').button();
        $('#select-code').selectmenu({position: {within: '#code-window'}});

        $('#tabs').tabs({
            activate: function (event, ui) {
                if (ui.oldPanel.is('#blockly')) {
                    $('.blocklyToolboxDiv').hide();
                    //self.aceEditor.setValue(Blockly.JavaScript.workspaceToCode(self.blocklyWorkspace));
                    self.aceEditor.resize();
                    self.codeWindowMode = 'ace';
                } else {
                    Blockly.svgResize(self.blocklyWorkspace);
                    $('.blocklyToolboxDiv').show();
                    self.codeWindowMode = 'blockly';
                }
            }

        });

        this.blocklyWorkspace.addChangeListener(function () {
            //code = Blockly.JavaScript.workspaceToCode(workspace);
            self.aceEditor.setValue(Blockly.JavaScript.workspaceToCode(self.blocklyWorkspace));
        });

        $('#send-code').on('click', function () {
            if (self.codeWindowMode === 'blockly') {
                self.sendCodeMessage('exec', Blockly.JavaScript.workspaceToCode(self.blocklyWorkspace));
            } else {
                self.sendCodeMessage('exec', self.aceEditor.getValue());
            }
        });
        $('#save-code').on('click', function () {
            var label = $('#code-name').val();
            if (label.length) {
                if (self.codeWindowMode === 'blockly') {
                    // Blockly mode - send XML rep of blocks
                    var xml = Blockly.Xml.workspaceToDom(self.blocklyWorkspace);
                    var xml_text = Blockly.Xml.domToText(xml);
                    self.sendCodeMessage('save', {label: label, blockly: xml_text});
                } else {
                    self.sendCodeMessage('save', {label: label, js: self.aceEditor.getValue()});
                }
                $('#code-name').val('');
            }
        });
        $('#load-code').on('click', function () {
            var op = $('#select-code option:selected');
            if (op.index() > 0) {
                self.sendCodeMessage('load', op.text());
            }
        });
        this.toggleCodeWindow(false)
    },

    toggleCodeWindow: function (state) {
        if (typeof state !== 'boolean') {
            this.codeWindowState = !this.codeWindowState;
        } else {
            this.codeWindowState = state;
        }
        if (this.codeWindowState) {
            $('#code-window').show();
            $('.blocklyToolboxDiv').show();
            if (this.codeWindowMode === 'blockly') {
                Blockly.svgResize(this.blocklyWorkspace);
            } else if (this.codeWindowMode === 'ace') {
                this.aceEditor.resize();
            }
            this.game.input.keyboard.enabled = false;
        } else {
            $('#code-window').hide();
            $('.blocklyToolboxDiv').hide();
            if (this.game.input) {
                this.game.input.keyboard.enabled = true;
            }
        }
    },

    addCodeLabel: function (label) {
        if (this.codeLabelCache[label] || label.length < 1) {
            return;
        }
        $('#select-code').append('<option>' + label + '</option>').selectmenu('refresh');
    },

    setCodeForUI: function (code) {
        $('#code-name').val(code.label);
        if (code.blockly) {
            this.blocklyWorkspace.clear();
            var xml = Blockly.Xml.textToDom(code.blockly);
            Blockly.Xml.domToWorkspace(this.blocklyWorkspace, xml);
            this.aceEditor.setValue(Blockly.JavaScript.workspaceToCode(this.blocklyWorkspace));
            $('#tabs').tabs('option', 'active', 0);
        } else {
            this.blocklyWorkspace.clear();
            this.aceEditor.setValue(code.js);
            $('#tabs').tabs('option', 'active', 1);
        }
    }
};
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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


},{"../phaserbodies/Asteroid.js":13,"../phaserbodies/Bullet.js":14,"../phaserbodies/Crystal.js":15,"../phaserbodies/GenericOrb.js":16,"../phaserbodies/Planetoid.js":17,"../phaserbodies/Ship.js":18,"../phaserbodies/StarTarget.js":20,"../phaserbodies/TractorBeam.js":24,"../phaserbodies/Tree.js":25}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":10,"../common/UpdateProperties.js":11,"./SyncBodyInterface.js":21,"./VectorSprite.js":26}],14:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/UpdateProperties.js":11,"./SyncBodyInterface.js":21,"./VectorSprite.js":26}],15:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":10,"../common/UpdateProperties.js":11,"./SyncBodyInterface.js":21,"./VectorSprite.js":26}],16:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":10,"../common/UpdateProperties.js":11,"./SyncBodyInterface.js":21,"./VectorSprite.js":26}],17:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":10,"../common/UpdateProperties.js":11,"./SyncBodyInterface.js":21,"./VectorSprite.js":26}],18:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/UpdateProperties.js":11,"./SyncBodyInterface.js":21,"./VectorSprite.js":26}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/Paths.js":10,"../common/UpdateProperties.js":11,"./SyncBodyInterface.js":21,"./VectorSprite.js":26}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
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
},{"./SimpleParticle.js":19}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/UpdateProperties.js":11,"./SimpleParticle.js":19,"./SyncBodyInterface.js":21}],25:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/UpdateProperties.js":11,"./SyncBodyInterface.js":21,"./VectorSprite.js":26}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
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
},{"../Starcoder-client.js":1}],28:[function(require,module,exports){
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
},{"../Starcoder-client.js":1}],29:[function(require,module,exports){
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
},{"../phaserplugins/Controls.js":27,"../phaserplugins/SyncClient.js":28}],30:[function(require,module,exports){
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
        this.game.state.start('space');
        //this.game.state.start('login');
    }
};

module.exports = Loader;
},{}],31:[function(require,module,exports){
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

},{}],32:[function(require,module,exports){
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
    //this.starcoder.layoutDOMSpaceState();

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
    socket.on('music', function (state) {
        if (state === 'on') {
            self.game.sounds.music.resume();
        } else {
            self.game.sounds.music.pause();
        }
    });
};

module.exports = Space;

},{"../phaserbodies/SimpleParticle.js":19,"../phaserbodies/ThrustGenerator.js":22,"../phaserbodies/Toast.js":23,"../phaserplugins/Controls.js":27,"../phaserplugins/SyncClient.js":28,"../phaserui/HUD.js":33,"../phaserui/LeaderBoard.js":34,"../phaserui/MiniMap.js":35}],33:[function(require,module,exports){
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
    this.codetext = this.game.starcoder.makeFlexText(xunit * 9, yunit * 2, 'CODE',
        {font: '24px Arial', fill: '#ff9900', align: 'center'});
    this.codetext.anchor.setTo(0.5, 0.5);
    this.codetext.inputEnabled = true;
    this.codetext.events.onInputDown.add(this.game.starcoder.toggleCodeWindow, this.game.starcoder);
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

},{"../common/Paths.js":10,"../phaserbodies/Bullet.js":14}],34:[function(require,module,exports){
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
},{}],35:[function(require,module,exports){
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
},{}],36:[function(require,module,exports){
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



buildConfig.buildTime = "Sun Sep 13 2015 21:08:18 GMT-0400 (EDT)";

//localStorage.debug = '';                        // used to toggle socket.io debugging output

//document.addEventListener('DOMContentLoaded', function () {
//    var starcoder = new Starcoder();
//    starcoder.start();
//});

// test

$(function () {
    var starcoder = new Starcoder([commonConfig, clientConfig, buildConfig]);
    starcoder.start();
});

},{"./Starcoder-client.js":1,"./client/config.js":9,"./common/config.js":12}]},{},[36])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvU3RhcmNvZGVyLWNsaWVudC5qcyIsInNyYy9TdGFyY29kZXIuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvQ29kZUVuZHBvaW50Q2xpZW50LmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL0NvZGVVSS5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9GbGV4VGV4dFdyYXBwZXIuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvTGVhZGVyQm9hcmRDbGllbnQuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvU3RhcmZpZWxkLmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL1dvcmxkQXBpLmpzIiwic3JjL2NsaWVudC9jb25maWcuanMiLCJzcmMvY29tbW9uL1BhdGhzLmpzIiwic3JjL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzIiwic3JjL2NvbW1vbi9jb25maWcuanMiLCJzcmMvcGhhc2VyYm9kaWVzL0FzdGVyb2lkLmpzIiwic3JjL3BoYXNlcmJvZGllcy9CdWxsZXQuanMiLCJzcmMvcGhhc2VyYm9kaWVzL0NyeXN0YWwuanMiLCJzcmMvcGhhc2VyYm9kaWVzL0dlbmVyaWNPcmIuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1BsYW5ldG9pZC5qcyIsInNyYy9waGFzZXJib2RpZXMvU2hpcC5qcyIsInNyYy9waGFzZXJib2RpZXMvU2ltcGxlUGFydGljbGUuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1N0YXJUYXJnZXQuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1N5bmNCb2R5SW50ZXJmYWNlLmpzIiwic3JjL3BoYXNlcmJvZGllcy9UaHJ1c3RHZW5lcmF0b3IuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1RvYXN0LmpzIiwic3JjL3BoYXNlcmJvZGllcy9UcmFjdG9yQmVhbS5qcyIsInNyYy9waGFzZXJib2RpZXMvVHJlZS5qcyIsInNyYy9waGFzZXJib2RpZXMvVmVjdG9yU3ByaXRlLmpzIiwic3JjL3BoYXNlcnBsdWdpbnMvQ29udHJvbHMuanMiLCJzcmMvcGhhc2VycGx1Z2lucy9TeW5jQ2xpZW50LmpzIiwic3JjL3BoYXNlcnN0YXRlcy9Cb290LmpzIiwic3JjL3BoYXNlcnN0YXRlcy9Mb2FkZXIuanMiLCJzcmMvcGhhc2Vyc3RhdGVzL0xvZ2luLmpzIiwic3JjL3BoYXNlcnN0YXRlcy9TcGFjZS5qcyIsInNyYy9waGFzZXJ1aS9IVUQuanMiLCJzcmMvcGhhc2VydWkvTGVhZGVyQm9hcmQuanMiLCJzcmMvcGhhc2VydWkvTWluaU1hcC5qcyIsInNyYy9jbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogU3RhcmNvZGVyLWNsaWVudC5qc1xuICpcbiAqIFN0YXJjb2RlciBtYXN0ZXIgb2JqZWN0IGV4dGVuZGVkIHdpdGggY2xpZW50IG9ubHkgcHJvcGVydGllcyBhbmQgbWV0aG9kc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgV29ybGRBcGkgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL1dvcmxkQXBpLmpzJyk7XG4vL3ZhciBET01JbnRlcmZhY2UgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL0RPTUludGVyZmFjZS5qcycpO1xudmFyIENvZGVFbmRwb2ludENsaWVudCA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvQ29kZUVuZHBvaW50Q2xpZW50LmpzJyk7XG52YXIgU3RhcmZpZWxkID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9TdGFyZmllbGQuanMnKTtcbnZhciBMZWFkZXJCb2FyZENsaWVudCA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvTGVhZGVyQm9hcmRDbGllbnQuanMnKTtcbnZhciBGbGV4VGV4dFdyYXBwZXIgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL0ZsZXhUZXh0V3JhcHBlci5qcycpO1xudmFyIENvZGVVSSA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvQ29kZVVJLmpzJyk7XG5cblxudmFyIHN0YXRlcyA9IHtcbiAgICBib290OiByZXF1aXJlKCcuL3BoYXNlcnN0YXRlcy9Cb290LmpzJyksXG4gICAgc3BhY2U6IHJlcXVpcmUoJy4vcGhhc2Vyc3RhdGVzL1NwYWNlLmpzJyksXG4gICAgbG9naW46IHJlcXVpcmUoJy4vcGhhc2Vyc3RhdGVzL0xvZ2luLmpzJyksXG4gICAgbG9hZGVyOiByZXF1aXJlKCcuL3BoYXNlcnN0YXRlcy9Mb2FkZXIuanMnKVxufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW8gPSBpbztcbiAgICB0aGlzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoJzEwMCUnLCAnMTAwJScsIFBoYXNlci5BVVRPLCAnbWFpbicpO1xuICAgIC8vdGhpcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKDE4MDAsIDk1MCwgUGhhc2VyLkNBTlZBUywgJ21haW4nKTtcbiAgICB0aGlzLmdhbWUuZm9yY2VTaW5nbGVVcGRhdGUgPSB0cnVlO1xuICAgIHRoaXMuZ2FtZS5zdGFyY29kZXIgPSB0aGlzO1xuICAgIGZvciAodmFyIGsgaW4gc3RhdGVzKSB7XG4gICAgICAgIHZhciBzdGF0ZSA9IG5ldyBzdGF0ZXNba10oKTtcbiAgICAgICAgc3RhdGUuc3RhcmNvZGVyID0gdGhpcztcbiAgICAgICAgdGhpcy5nYW1lLnN0YXRlLmFkZChrLCBzdGF0ZSk7XG4gICAgfVxuICAgIHRoaXMub25Db25uZWN0Q0IgPSBbXTtcbiAgICB0aGlzLnBsYXllck1hcCA9IHt9O1xuICAgIHRoaXMuY21kUXVldWUgPSBbXTtcbiAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMubGFzdE5ldEVycm9yID0gbnVsbDtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoV29ybGRBcGkpO1xuICAgIHRoaXMuaW1wbGVtZW50RmVhdHVyZShDb2RlRW5kcG9pbnRDbGllbnQpO1xuICAgIHRoaXMuaW1wbGVtZW50RmVhdHVyZShTdGFyZmllbGQpO1xuICAgIHRoaXMuaW1wbGVtZW50RmVhdHVyZShMZWFkZXJCb2FyZENsaWVudCk7XG4gICAgLy90aGlzLmltcGxlbWVudEZlYXR1cmUoRE9NSW50ZXJmYWNlKTtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoQ29kZVVJKTtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoRmxleFRleHRXcmFwcGVyKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuc2VydmVyQ29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHRoaXMuc29ja2V0KSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNvY2tldDtcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sYXN0TmV0RXJyb3IgPSBudWxsO1xuICAgIH1cbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcvYXBpL2lkZW50aXR5JyxcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEsIHN0YXR1cykge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnZGF0YScsIGRhdGEpO1xuICAgICAgICAgICAgdmFyIHNlcnZlclVyaSA9IGRhdGEuc2VydmVyVXJpO1xuICAgICAgICAgICAgc2VsZi5wbGF5ZXIgPSBkYXRhLnBsYXllcjtcbiAgICAgICAgICAgIHNlbGYucGxheWVyLmlkID0gc2VsZi5wbGF5ZXIuX2lkO1xuICAgICAgICAgICAgc2VsZi5zb2NrZXQgPSBzZWxmLmlvKHNlcnZlclVyaSwgc2VsZi5jb25maWcuaW9DbGllbnRPcHRpb25zKTtcbiAgICAgICAgICAgIHNlbGYuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzZWxmLmxhc3ROZXRFcnJvciA9IG51bGw7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzZWxmLm9uQ29ubmVjdENCLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uQ29ubmVjdENCW2ldLmNhbGwoc2VsZiwgc2VsZi5zb2NrZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWxmLnNvY2tldC5lbWl0KCdsb2dpbicsIHNlbGYucGxheWVyKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9KVxufTtcblxuLy9TdGFyY29kZXIucHJvdG90eXBlLnNlcnZlckNvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICB2YXIgc2VsZiA9IHRoaXM7XG4vLyAgICBpZiAoIXRoaXMuc29ja2V0KSB7XG4vLyAgICAgICAgZGVsZXRlIHRoaXMuc29ja2V0O1xuLy8gICAgICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4vLyAgICAgICAgdGhpcy5sYXN0TmV0RXJyb3IgPSBudWxsO1xuLy8gICAgfVxuLy8gICAgdmFyIHNlcnZlclVyaSA9IHRoaXMuY29uZmlnLnNlcnZlclVyaTtcbi8vICAgIGlmICghc2VydmVyVXJpKSB7XG4vLyAgICAgICAgdmFyIHByb3RvY29sID0gdGhpcy5jb25maWcuc2VydmVyUHJvdG9sIHx8IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbDtcbi8vICAgICAgICB2YXIgcG9ydCA9IHRoaXMuY29uZmlnLnNlcnZlclBvcnQgfHwgJzgwODAnO1xuLy8gICAgICAgIHNlcnZlclVyaSA9IHByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArICc6JyArIHBvcnQ7XG4vLyAgICB9XG4vLyAgICB0aGlzLnNvY2tldCA9IHRoaXMuaW8oc2VydmVyVXJpLCB0aGlzLmNvbmZpZy5pb0NsaWVudE9wdGlvbnMpO1xuLy8gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgc2VsZi5jb25uZWN0ZWQgPSB0cnVlO1xuLy8gICAgICAgIHNlbGYubGFzdE5ldEVycm9yID0gbnVsbDtcbi8vICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHNlbGYub25Db25uZWN0Q0IubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4vLyAgICAgICAgICAgIHNlbGYub25Db25uZWN0Q0JbaV0uYmluZChzZWxmLCBzZWxmLnNvY2tldCkoKTtcbi8vICAgICAgICB9XG4vLyAgICB9KTtcbi8vICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvcicsIGZ1bmN0aW9uIChkYXRhKSB7XG4vLyAgICAgIGNvbnNvbGUubG9nKCdzb2NrZXQgZXJyb3InKTtcbi8vICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4vLyAgICAgICAgdGhpcy5sYXN0TmV0RXJyb3IgPSBkYXRhO1xuLy8gICAgfSk7XG4vL307XG5cbi8vU3RhcmNvZGVyLnByb3RvdHlwZS5zZXJ2ZXJMb2dpbiA9IGZ1bmN0aW9uICh1c2VybmFtZSwgcGFzc3dvcmQpIHtcbi8vICAgIHZhciBsb2dpbiA9IHt9O1xuLy8gICAgaWYgKCFwYXNzd29yZCkge1xuLy8gICAgICAgIC8vIEd1ZXN0IGxvZ2luXG4vLyAgICAgICAgbG9naW4uZ2FtZXJ0YWcgPSB1c2VybmFtZTtcbi8vICAgIH0gZWxzZSB7XG4vLyAgICAgICAgbG9naW4udXNlcm5hbWUgPSB1c2VybmFtZTtcbi8vICAgICAgICBsb2dpbi5wYXNzd29yZCA9IHBhc3N3b3JkO1xuLy8gICAgfVxuLy8gICAgdGhpcy5zb2NrZXQuZW1pdCgnbG9naW4nLCBsb2dpbik7XG4vL307XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdib290Jyk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLmF0dGFjaFBsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcGx1Z2luID0gdGhpcy5nYW1lLnBsdWdpbnMuYWRkLmFwcGx5KHRoaXMuZ2FtZS5wbHVnaW5zLCBhcmd1bWVudHMpO1xuICAgIHBsdWdpbi5zdGFyY29kZXIgPSB0aGlzO1xuICAgIHBsdWdpbi5sb2cgPSB0aGlzLmxvZztcbiAgICByZXR1cm4gcGx1Z2luO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5iYW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ1N0YXJjb2RlciBjbGllbnQgdicgKyB0aGlzLmNvbmZpZy52ZXJzaW9uLCAnYnVpbHQgb24nLCB0aGlzLmNvbmZpZy5idWlsZFRpbWUpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5yb2xlID0gJ0NsaWVudCc7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcmNvZGVyO1xuIiwiLyoqXG4gKiBTdGFyY29kZXIuanNcbiAqXG4gKiBTZXQgdXAgZ2xvYmFsIFN0YXJjb2RlciBuYW1lc3BhY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL3ZhciBTdGFyY29kZXIgPSB7XG4vLyAgICBjb25maWc6IHtcbi8vICAgICAgICB3b3JsZEJvdW5kczogWy00MjAwLCAtNDIwMCwgODQwMCwgODQwMF1cbi8vXG4vLyAgICB9LFxuLy8gICAgU3RhdGVzOiB7fVxuLy99O1xuXG52YXIgY29uZmlnID0ge1xuICAgIHZlcnNpb246ICcwLjEnLFxuICAgIHNlcnZlclVyaTogJ0dVTFBfUkVQTEFDRV9TRVJWRVJfVVJJJyxcbiAgICAvL3NlcnZlckFkZHJlc3M6ICcxMjcuMC4wLjEnLFxuICAgIC8vd29ybGRCb3VuZHM6IFstNDIwMCwgLTQyMDAsIDg0MDAsIDg0MDBdLFxuICAgIHdvcmxkQm91bmRzOiBbLTIwMCwgLTIwMCwgMjAwLCAyMDBdLFxuICAgIGlvQ2xpZW50T3B0aW9uczoge1xuICAgICAgICAvL2ZvcmNlTmV3OiB0cnVlXG4gICAgICAgIHJlY29ubmVjdGlvbjogZmFsc2VcbiAgICB9LFxuICAgIHVwZGF0ZUludGVydmFsOiA1MCxcbiAgICByZW5kZXJMYXRlbmN5OiAxMDAsXG4gICAgcGh5c2ljc1NjYWxlOiAyMCxcbiAgICBmcmFtZVJhdGU6ICgxIC8gNjApLFxuICAgIHRpbWVTeW5jRnJlcTogMTAsXG4gICAgaW50ZXJwcmV0ZXJSYXRlOiAoMSAvIDMwKSxcbiAgICBpbnRlcnByZXRlclN0YXR1c1RocmVzaG9sZHM6IHtcbiAgICAgICAga2lsbDogMTAsXG4gICAgICAgIGNyaXRpY2FsOiA1LFxuICAgICAgICB3YXJuOiAxXG4gICAgfSxcbiAgICBwaHlzaWNzUHJvcGVydGllczoge1xuICAgICAgICBTaGlwOiB7XG4gICAgICAgICAgICBtYXNzOiAxMFxuICAgICAgICB9LFxuICAgICAgICBBc3Rlcm9pZDoge1xuICAgICAgICAgICAgbWFzczogMjBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2FtZXJUYWdzOiB7XG4gICAgICAgIDE6IFtcbiAgICAgICAgICAgICdzdXBlcicsXG4gICAgICAgICAgICAnYXdlc29tZScsXG4gICAgICAgICAgICAncmFpbmJvdycsXG4gICAgICAgICAgICAnZG91YmxlJyxcbiAgICAgICAgICAgICd0cmlwbGUnLFxuICAgICAgICAgICAgJ3ZhbXBpcmUnLFxuICAgICAgICAgICAgJ3ByaW5jZXNzJyxcbiAgICAgICAgICAgICdpY2UnLFxuICAgICAgICAgICAgJ2ZpcmUnLFxuICAgICAgICAgICAgJ3JvYm90JyxcbiAgICAgICAgICAgICd3ZXJld29sZicsXG4gICAgICAgICAgICAnc3BhcmtsZScsXG4gICAgICAgICAgICAnaW5maW5pdGUnLFxuICAgICAgICAgICAgJ2Nvb2wnLFxuICAgICAgICAgICAgJ3lvbG8nLFxuICAgICAgICAgICAgJ3N3YWdneScsXG4gICAgICAgICAgICAnem9tYmllJyxcbiAgICAgICAgICAgICdzYW11cmFpJyxcbiAgICAgICAgICAgICdkYW5jaW5nJyxcbiAgICAgICAgICAgICdwb3dlcicsXG4gICAgICAgICAgICAnZ29sZCcsXG4gICAgICAgICAgICAnc2lsdmVyJyxcbiAgICAgICAgICAgICdyYWRpb2FjdGl2ZScsXG4gICAgICAgICAgICAncXVhbnR1bScsXG4gICAgICAgICAgICAnYnJpbGxpYW50JyxcbiAgICAgICAgICAgICdtaWdodHknLFxuICAgICAgICAgICAgJ3JhbmRvbSdcbiAgICAgICAgXSxcbiAgICAgICAgMjogW1xuICAgICAgICAgICAgJ3RpZ2VyJyxcbiAgICAgICAgICAgICduaW5qYScsXG4gICAgICAgICAgICAncHJpbmNlc3MnLFxuICAgICAgICAgICAgJ3JvYm90JyxcbiAgICAgICAgICAgICdwb255JyxcbiAgICAgICAgICAgICdkYW5jZXInLFxuICAgICAgICAgICAgJ3JvY2tlcicsXG4gICAgICAgICAgICAnbWFzdGVyJyxcbiAgICAgICAgICAgICdoYWNrZXInLFxuICAgICAgICAgICAgJ3JhaW5ib3cnLFxuICAgICAgICAgICAgJ2tpdHRlbicsXG4gICAgICAgICAgICAncHVwcHknLFxuICAgICAgICAgICAgJ2Jvc3MnLFxuICAgICAgICAgICAgJ3dpemFyZCcsXG4gICAgICAgICAgICAnaGVybycsXG4gICAgICAgICAgICAnZHJhZ29uJyxcbiAgICAgICAgICAgICd0cmlidXRlJyxcbiAgICAgICAgICAgICdnZW5pdXMnLFxuICAgICAgICAgICAgJ2JsYXN0ZXInLFxuICAgICAgICAgICAgJ3NwaWRlcidcbiAgICAgICAgXVxuICAgIH0sXG4gICAgaW5pdGlhbEJvZGllczogW1xuICAgICAgICB7dHlwZTogJ0FzdGVyb2lkJywgbnVtYmVyOiAyNSwgY29uZmlnOiB7XG4gICAgICAgICAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJ30sXG4gICAgICAgICAgICB2ZWxvY2l0eToge3JhbmRvbTogJ3ZlY3RvcicsIGxvOiAtMTUsIGhpOiAxNX0sXG4gICAgICAgICAgICBhbmd1bGFyVmVsb2NpdHk6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAtNSwgaGk6IDV9LFxuICAgICAgICAgICAgdmVjdG9yU2NhbGU6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAwLjYsIGhpOiAxLjR9LFxuICAgICAgICAgICAgbWFzczogMTBcbiAgICAgICAgfX0sXG4gICAgICAgIC8ve3R5cGU6ICdDcnlzdGFsJywgbnVtYmVyOiAxMCwgY29uZmlnOiB7XG4gICAgICAgIC8vICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnfSxcbiAgICAgICAgLy8gICAgdmVsb2NpdHk6IHtyYW5kb206ICd2ZWN0b3InLCBsbzogLTQsIGhpOiA0LCBub3JtYWw6IHRydWV9LFxuICAgICAgICAvLyAgICB2ZWN0b3JTY2FsZToge3JhbmRvbTogJ2Zsb2F0JywgbG86IDAuNCwgaGk6IDAuOH0sXG4gICAgICAgIC8vICAgIG1hc3M6IDVcbiAgICAgICAgLy99fVxuICAgICAgICB7dHlwZTogJ0h5ZHJhJywgbnVtYmVyOiAxLCBjb25maWc6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDUwfVxuICAgICAgICB9fSxcbiAgICAgICAge3R5cGU6ICdQbGFuZXRvaWQnLCBudW1iZXI6IDYsIGNvbmZpZzoge1xuICAgICAgICAgICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCcsIHBhZDogMzB9LFxuICAgICAgICAgICAgYW5ndWxhclZlbG9jaXR5OiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogLTIsIGhpOiAyfSxcbiAgICAgICAgICAgIHZlY3RvclNjYWxlOiAyLjUsXG4gICAgICAgICAgICBtYXNzOiAxMDBcbiAgICAgICAgfX0sXG4gICAgICAgIC8ve3R5cGU6ICdTdGFyVGFyZ2V0JywgbnVtYmVyOiAxMCwgY29uZmlnOiB7XG4gICAgICAgIC8vICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDMwfSxcbiAgICAgICAgLy8gICAgdmVjdG9yU2NhbGU6IDAuNSxcbiAgICAgICAgLy8gICAgc3RhcnM6IFtbMCwgMF0sIFsxLDFdLCBbLTEsMV0sIFsxLC0xXV1cbiAgICAgICAgLy99fVxuICAgICAgICAvLyBGSVhNRTogVHJlZXMganVzdCBmb3IgdGVzdGluZ1xuICAgICAgICAvL3t0eXBlOiAnVHJlZScsIG51bWJlcjogMTAsIGNvbmZpZzoge1xuICAgICAgICAvLyAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJywgcGFkOiAzMH0sXG4gICAgICAgIC8vICAgIHZlY3RvclNjYWxlOiAxLFxuICAgICAgICAvLyAgICBtYXNzOiA1XG4gICAgICAgIC8vfX1cbiAgICBdXG59O1xuXG52YXIgU3RhcmNvZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEluaXRpYWxpemVycyB2aXJ0dWFsaXplZCBhY2NvcmRpbmcgdG8gcm9sZVxuICAgIHZhciBjb25maWdzID0gYXJndW1lbnRzWzBdO1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICB0aGlzLmNvbmZpZyA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY29uZmlncy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdGhpcy5leHRlbmRDb25maWcoY29uZmlnc1tpXSk7XG4gICAgfVxuICAgIC8vIEhBQ0tcbiAgICAvL3RoaXMuZXh0ZW5kQ29uZmlnKGNvbmZpZyk7XG4gICAgdGhpcy5iYW5uZXIoKTtcbiAgICB0aGlzLmluaXQuYXBwbHkodGhpcywgYXJncyk7XG4gICAgLy90aGlzLmluaXROZXQuY2FsbCh0aGlzKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuZXh0ZW5kQ29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIGZvciAodmFyIGsgaW4gY29uZmlnKSB7XG4gICAgICAgIGlmIChjb25maWcuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnW2tdID0gY29uZmlnW2tdO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGNvbW1vbiBjb25maWcgb3B0aW9uc1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3dvcmxkV2lkdGgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1syXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzBdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlcldpZHRoJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogKHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzJdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF0pO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3dvcmxkSGVpZ2h0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcud29ybGRCb3VuZHNbM10gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1sxXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJIZWlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiAodGhpcy5jb25maWcud29ybGRCb3VuZHNbM10gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1sxXSk7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyTGVmdCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzBdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlclRvcCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlclJpZ2h0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMl07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyQm90dG9tJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbM107XG4gICAgfVxufSk7XG5cbi8qKlxuICogQWRkIG1peGluIHByb3BlcnRpZXMgdG8gdGFyZ2V0LiBBZGFwdGVkIChzbGlnaHRseSkgZnJvbSBQaGFzZXJcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0XG4gKiBAcGFyYW0ge29iamVjdH0gbWl4aW5cbiAqL1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlID0gZnVuY3Rpb24gKHRhcmdldCwgbWl4aW4pIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG1peGluKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgIHZhciB2YWwgPSBtaXhpbltrZXldO1xuICAgICAgICBpZiAodmFsICYmXG4gICAgICAgICAgICAodHlwZW9mIHZhbC5nZXQgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHZhbC5zZXQgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHZhbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHZhbDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogTGlnaHR3ZWlnaHQgY29tcG9uZW50IGltcGxlbWVudGF0aW9uLCBtb3JlIGZvciBsb2dpY2FsIHRoYW4gZnVuY3Rpb25hbCBtb2R1bGFyaXR5XG4gKlxuICogQHBhcmFtIG1peGluIHtvYmplY3R9IC0gUE9KTyB3aXRoIG1ldGhvZHMgLyBwcm9wZXJ0aWVzIHRvIGJlIGFkZGVkIHRvIHByb3RvdHlwZSwgd2l0aCBvcHRpb25hbCBpbml0IG1ldGhvZFxuICovXG5TdGFyY29kZXIucHJvdG90eXBlLmltcGxlbWVudEZlYXR1cmUgPSBmdW5jdGlvbiAobWl4aW4pIHtcbiAgICBmb3IgKHZhciBwcm9wIGluIG1peGluKSB7XG4gICAgICAgIHN3aXRjaCAocHJvcCkge1xuICAgICAgICAgICAgY2FzZSAnb25Db25uZWN0Q0InOlxuICAgICAgICAgICAgY2FzZSAnb25SZWFkeUNCJzpcbiAgICAgICAgICAgIGNhc2UgJ29uTG9naW5DQic6XG4gICAgICAgICAgICBjYXNlICdvbkRpc2Nvbm5lY3RDQic6XG4gICAgICAgICAgICAgICAgdGhpc1twcm9wXS5wdXNoKG1peGluW3Byb3BdKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2luaXQnOlxuICAgICAgICAgICAgICAgIGJyZWFrOyAgICAgIC8vIE5vT3BcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgU3RhcmNvZGVyLnByb3RvdHlwZVtwcm9wXSA9IG1peGluW3Byb3BdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChtaXhpbi5pbml0KSB7XG4gICAgICAgIG1peGluLmluaXQuY2FsbCh0aGlzKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEN1c3RvbSBsb2dnaW5nIGZ1bmN0aW9uIHRvIGJlIGZlYXR1cmVmaWVkIGFzIG5lY2Vzc2FyeVxuICovXG5TdGFyY29kZXIucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcmNvZGVyO1xuIiwiLyoqXG4gKiBDb2RlRW5kcG9pbnRDbGllbnQuanNcbiAqXG4gKiBNZXRob2RzIGZvciBzZW5kaW5nIGNvZGUgdG8gc2VydmVyIGFuZCBkZWFsaW5nIHdpdGggY29kZSByZWxhdGVkIHJlc3BvbnNlc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG9uQ29ubmVjdENCOiBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc29ja2V0Lm9uKCdjb2RlIHN0YXR1cycsIGZ1bmN0aW9uIChzdGF0dXMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTVEFUVVMnLCBzdGF0dXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgc29ja2V0Lm9uKCdjb2RlIHN5bnRheCBlcnJvcicsIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NZTlRBWCcsIGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNvY2tldC5vbignY29kZSBydW50aW1lIGVycm9yJywgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUlVOVElNRScsIGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNvY2tldC5vbignY29kZSBzYXZlZCcsIGZ1bmN0aW9uIChsYWJlbCkge1xuICAgICAgICAgICAgc2VsZi5hZGRDb2RlTGFiZWwobGFiZWwpO1xuICAgICAgICB9KTtcbiAgICAgICAgc29ja2V0Lm9uKCdjb2RlIGxvYWRlZCcsIGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdsb2FkIGNvZGUnLCBjb2RlKTtcbiAgICAgICAgICAgIHNlbGYuc2V0Q29kZUZvclVJKGNvZGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgc29ja2V0Lm9uKCdjb2RlIGxhYmVscycsIGZ1bmN0aW9uIChsYWJlbHMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGFiZWxzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgIHNlbGYuYWRkQ29kZUxhYmVsKGxhYmVsc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzZW5kQ29kZU1lc3NhZ2U6IGZ1bmN0aW9uIChraW5kLCBkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzZW5kaW5nJywga2luZCwgZGF0YSk7XG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2NvZGUgJyArIGtpbmQsIGRhdGEpO1xuICAgIH1cbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGpheSBvbiA5LzEyLzE1LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmNvZGVXaW5kb3dNb2RlID0gJ2Jsb2NrbHknO1xuICAgICAgICB0aGlzLmNvZGVMYWJlbENhY2hlID0ge307XG4gICAgICAgIHRoaXMuYmxvY2tseVdvcmtzcGFjZSA9IEJsb2NrbHkuaW5qZWN0KCdibG9ja2x5Jywge3Rvb2xib3g6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sYm94Jyl9KTtcbiAgICAgICAgLy92YXIgYnV0dG9uID0gJCgnI3NlbmQtY29kZScpO1xuICAgICAgICB0aGlzLmFjZUVkaXRvciA9IGFjZS5lZGl0KCdhY2VlZGl0b3InKTtcbiAgICAgICAgdmFyIEphdmFTY3JpcHRNb2RlID0gYWNlLnJlcXVpcmUoXCJhY2UvbW9kZS9qYXZhc2NyaXB0XCIpLk1vZGU7XG4gICAgICAgIHRoaXMuYWNlRWRpdG9yLmdldFNlc3Npb24oKS5zZXRNb2RlKG5ldyBKYXZhU2NyaXB0TW9kZSgpKTtcbiAgICAgICAgdGhpcy5hY2VFZGl0b3Iuc2V0VGhlbWUoXCJhY2UvdGhlbWUvdHdpbGlnaHRcIik7XG5cbiAgICAgICAgJCgnYnV0dG9uJykuYnV0dG9uKCk7XG4gICAgICAgICQoJyNzZWxlY3QtY29kZScpLnNlbGVjdG1lbnUoe3Bvc2l0aW9uOiB7d2l0aGluOiAnI2NvZGUtd2luZG93J319KTtcblxuICAgICAgICAkKCcjdGFicycpLnRhYnMoe1xuICAgICAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcbiAgICAgICAgICAgICAgICBpZiAodWkub2xkUGFuZWwuaXMoJyNibG9ja2x5JykpIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnLmJsb2NrbHlUb29sYm94RGl2JykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAvL3NlbGYuYWNlRWRpdG9yLnNldFZhbHVlKEJsb2NrbHkuSmF2YVNjcmlwdC53b3Jrc3BhY2VUb0NvZGUoc2VsZi5ibG9ja2x5V29ya3NwYWNlKSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWNlRWRpdG9yLnJlc2l6ZSgpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmNvZGVXaW5kb3dNb2RlID0gJ2FjZSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgQmxvY2tseS5zdmdSZXNpemUoc2VsZi5ibG9ja2x5V29ya3NwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnLmJsb2NrbHlUb29sYm94RGl2Jykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmNvZGVXaW5kb3dNb2RlID0gJ2Jsb2NrbHknO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmJsb2NrbHlXb3Jrc3BhY2UuYWRkQ2hhbmdlTGlzdGVuZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy9jb2RlID0gQmxvY2tseS5KYXZhU2NyaXB0LndvcmtzcGFjZVRvQ29kZSh3b3Jrc3BhY2UpO1xuICAgICAgICAgICAgc2VsZi5hY2VFZGl0b3Iuc2V0VmFsdWUoQmxvY2tseS5KYXZhU2NyaXB0LndvcmtzcGFjZVRvQ29kZShzZWxmLmJsb2NrbHlXb3Jrc3BhY2UpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnI3NlbmQtY29kZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLmNvZGVXaW5kb3dNb2RlID09PSAnYmxvY2tseScpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNlbmRDb2RlTWVzc2FnZSgnZXhlYycsIEJsb2NrbHkuSmF2YVNjcmlwdC53b3Jrc3BhY2VUb0NvZGUoc2VsZi5ibG9ja2x5V29ya3NwYWNlKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuc2VuZENvZGVNZXNzYWdlKCdleGVjJywgc2VsZi5hY2VFZGl0b3IuZ2V0VmFsdWUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAkKCcjc2F2ZS1jb2RlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gJCgnI2NvZGUtbmFtZScpLnZhbCgpO1xuICAgICAgICAgICAgaWYgKGxhYmVsLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmNvZGVXaW5kb3dNb2RlID09PSAnYmxvY2tseScpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQmxvY2tseSBtb2RlIC0gc2VuZCBYTUwgcmVwIG9mIGJsb2Nrc1xuICAgICAgICAgICAgICAgICAgICB2YXIgeG1sID0gQmxvY2tseS5YbWwud29ya3NwYWNlVG9Eb20oc2VsZi5ibG9ja2x5V29ya3NwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHhtbF90ZXh0ID0gQmxvY2tseS5YbWwuZG9tVG9UZXh0KHhtbCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2VuZENvZGVNZXNzYWdlKCdzYXZlJywge2xhYmVsOiBsYWJlbCwgYmxvY2tseTogeG1sX3RleHR9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnNlbmRDb2RlTWVzc2FnZSgnc2F2ZScsIHtsYWJlbDogbGFiZWwsIGpzOiBzZWxmLmFjZUVkaXRvci5nZXRWYWx1ZSgpfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICQoJyNjb2RlLW5hbWUnKS52YWwoJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgJCgnI2xvYWQtY29kZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBvcCA9ICQoJyNzZWxlY3QtY29kZSBvcHRpb246c2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIGlmIChvcC5pbmRleCgpID4gMCkge1xuICAgICAgICAgICAgICAgIHNlbGYuc2VuZENvZGVNZXNzYWdlKCdsb2FkJywgb3AudGV4dCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudG9nZ2xlQ29kZVdpbmRvdyhmYWxzZSlcbiAgICB9LFxuXG4gICAgdG9nZ2xlQ29kZVdpbmRvdzogZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3RhdGUgIT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgdGhpcy5jb2RlV2luZG93U3RhdGUgPSAhdGhpcy5jb2RlV2luZG93U3RhdGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvZGVXaW5kb3dTdGF0ZSA9IHN0YXRlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNvZGVXaW5kb3dTdGF0ZSkge1xuICAgICAgICAgICAgJCgnI2NvZGUtd2luZG93Jykuc2hvdygpO1xuICAgICAgICAgICAgJCgnLmJsb2NrbHlUb29sYm94RGl2Jykuc2hvdygpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY29kZVdpbmRvd01vZGUgPT09ICdibG9ja2x5Jykge1xuICAgICAgICAgICAgICAgIEJsb2NrbHkuc3ZnUmVzaXplKHRoaXMuYmxvY2tseVdvcmtzcGFjZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY29kZVdpbmRvd01vZGUgPT09ICdhY2UnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY2VFZGl0b3IucmVzaXplKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnI2NvZGUtd2luZG93JykuaGlkZSgpO1xuICAgICAgICAgICAgJCgnLmJsb2NrbHlUb29sYm94RGl2JykuaGlkZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZ2FtZS5pbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhZGRDb2RlTGFiZWw6IGZ1bmN0aW9uIChsYWJlbCkge1xuICAgICAgICBpZiAodGhpcy5jb2RlTGFiZWxDYWNoZVtsYWJlbF0gfHwgbGFiZWwubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICQoJyNzZWxlY3QtY29kZScpLmFwcGVuZCgnPG9wdGlvbj4nICsgbGFiZWwgKyAnPC9vcHRpb24+Jykuc2VsZWN0bWVudSgncmVmcmVzaCcpO1xuICAgIH0sXG5cbiAgICBzZXRDb2RlRm9yVUk6IGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgICAgICQoJyNjb2RlLW5hbWUnKS52YWwoY29kZS5sYWJlbCk7XG4gICAgICAgIGlmIChjb2RlLmJsb2NrbHkpIHtcbiAgICAgICAgICAgIHRoaXMuYmxvY2tseVdvcmtzcGFjZS5jbGVhcigpO1xuICAgICAgICAgICAgdmFyIHhtbCA9IEJsb2NrbHkuWG1sLnRleHRUb0RvbShjb2RlLmJsb2NrbHkpO1xuICAgICAgICAgICAgQmxvY2tseS5YbWwuZG9tVG9Xb3Jrc3BhY2UodGhpcy5ibG9ja2x5V29ya3NwYWNlLCB4bWwpO1xuICAgICAgICAgICAgdGhpcy5hY2VFZGl0b3Iuc2V0VmFsdWUoQmxvY2tseS5KYXZhU2NyaXB0LndvcmtzcGFjZVRvQ29kZSh0aGlzLmJsb2NrbHlXb3Jrc3BhY2UpKTtcbiAgICAgICAgICAgICQoJyN0YWJzJykudGFicygnb3B0aW9uJywgJ2FjdGl2ZScsIDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ibG9ja2x5V29ya3NwYWNlLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLmFjZUVkaXRvci5zZXRWYWx1ZShjb2RlLmpzKTtcbiAgICAgICAgICAgICQoJyN0YWJzJykudGFicygnb3B0aW9uJywgJ2FjdGl2ZScsIDEpO1xuICAgICAgICB9XG4gICAgfVxufTsiLCIvKipcbiAqIEZsZXhUZXh0V3JhcHBlci5qc1xuICpcbiAqIFRoaW4gY29udmVuaWVuY2Ugd3JhcHBlciBhcm91bmQgUGhhc2VyIHRleHQgbWV0aG9kc1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1ha2VGbGV4VGV4dDogZnVuY3Rpb24gKHgsIHksIHRleHQsIHN0eWxlKSB7XG4gICAgICAgIGlmIChzdHlsZS5iaXRtYXApIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwVGV4dCh4LCB5LCBzdHlsZS5iaXRtYXAsIHN0eWxlLnNpemUsIHN0eWxlLmFsaWduKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHQgPSB0aGlzLmdhbWUubWFrZS50ZXh0KHgsIHksIHRleHQsIHN0eWxlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9LFxuXG4gICAgYWRkRmxleFRleHQ6IGZ1bmN0aW9uICh4LCB5LCB0ZXh0LCBzdHlsZSwgZ3JvdXApIHtcbiAgICAgICAgdmFyIHQgPSB0aGlzLm1ha2VGbGV4VGV4dCh4LCB5LCB0ZXh0LCBzdHlsZSk7XG4gICAgICAgIGdyb3VwID0gZ3JvdXAgfHwgdGhpcy53b3JsZDtcbiAgICAgICAgZ3JvdXAuYWRkKHQpO1xuICAgICAgICByZXR1cm4gdDtcbiAgICB9XG59OyIsIi8qKlxuICogTGVhZGVyQm9hcmRDbGllbnQuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubGVhZGVyQm9hcmQgPSB7fTtcbiAgICAgICAgdGhpcy5sZWFkZXJCb2FyZENhdHMgPSBbXTtcbiAgICAgICAgdGhpcy5sZWFkZXJCb2FyZFN0YXRlID0gbnVsbDtcbiAgICB9LFxuXG4gICAgb25Db25uZWN0Q0I6IGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzb2NrZXQub24oJ2xlYWRlcmJvYXJkJywgZnVuY3Rpb24gKGxiKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBjYXQgaW4gbGIpIHtcbiAgICAgICAgICAgICAgICAvLyBSZWNvcmQgbmV3IGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgaWYgKCEoY2F0IGluIHNlbGYubGVhZGVyQm9hcmQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubGVhZGVyQm9hcmRDYXRzLnB1c2goY2F0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU3RhcnQgY3ljbGluZyBpZiB0aGlzIGlzIGZpcnN0IGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYubGVhZGVyQm9hcmRTdGF0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmxlYWRlckJvYXJkU3RhdGUgPSAwO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmdhbWUubGVhZGVyYm9hcmQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNldEludGVydmFsKHNlbGYuY3ljbGVMZWFkZXJCb2FyZC5iaW5kKHNlbGYpLCBzZWxmLmNvbmZpZy5sZWFkZXJCb2FyZENsaWVudEN5Y2xlIHx8IDUwMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBEaXNwbGF5IGlmIHVwZGF0ZWQgYm9hcmQgaXMgc2hvd2luZ1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmxlYWRlckJvYXJkQ2F0c1tzZWxmLmxlYWRlckJvYXJkU3RhdGVdID09PSBjYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nYW1lLmxlYWRlcmJvYXJkLnNldENvbnRlbnQoY2F0LCBsYltjYXRdLCBzZWxmLnBsYXllci5pZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5sZWFkZXJCb2FyZFtjYXRdID0gbGJbY2F0XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgY3ljbGVMZWFkZXJCb2FyZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxlYWRlckJvYXJkU3RhdGUgPSAodGhpcy5sZWFkZXJCb2FyZFN0YXRlICsgMSkgJSB0aGlzLmxlYWRlckJvYXJkQ2F0cy5sZW5ndGg7XG4gICAgICAgIHZhciBjYXQgPSB0aGlzLmxlYWRlckJvYXJkQ2F0c1t0aGlzLmxlYWRlckJvYXJkU3RhdGVdO1xuICAgICAgICB0aGlzLmdhbWUubGVhZGVyYm9hcmQuc2V0Q29udGVudChjYXQsIHRoaXMubGVhZGVyQm9hcmRbY2F0XSwgdGhpcy5wbGF5ZXIuaWQpO1xuICAgIH1cbn07IiwiLyoqXG4gKiBNZXRob2QgZm9yIGRyYXdpbmcgc3RhcmZpZWxkc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHJhbmRvbU5vcm1hbDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdCA9IDA7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTw2OyBpKyspIHtcbiAgICAgICAgICAgIHQgKz0gdGhpcy5nYW1lLnJuZC5ub3JtYWwoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdC82O1xuICAgIH0sXG5cbiAgICBkcmF3U3RhcjogZnVuY3Rpb24gKGN0eCwgeCwgeSwgZCwgY29sb3IpIHtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LWQrMSwgeS1kKzEpO1xuICAgICAgICBjdHgubGluZVRvKHgrZC0xLCB5K2QtMSk7XG4gICAgICAgIGN0eC5tb3ZlVG8oeC1kKzEsIHkrZC0xKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4K2QtMSwgeS1kKzEpO1xuICAgICAgICBjdHgubW92ZVRvKHgsIHktZCk7XG4gICAgICAgIGN0eC5saW5lVG8oeCwgeStkKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LWQsIHkpO1xuICAgICAgICBjdHgubGluZVRvKHgrZCwgeSk7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9LFxuXG4gICAgZHJhd1N0YXJGaWVsZDogZnVuY3Rpb24gKGN0eCwgc2l6ZSwgbikge1xuICAgICAgICB2YXIgeG0gPSBNYXRoLnJvdW5kKHNpemUvMiArIHRoaXMucmFuZG9tTm9ybWFsKCkqc2l6ZS80KTtcbiAgICAgICAgdmFyIHltID0gTWF0aC5yb3VuZChzaXplLzIgKyB0aGlzLnJhbmRvbU5vcm1hbCgpKnNpemUvNCk7XG4gICAgICAgIHZhciBxdWFkcyA9IFtbMCwwLHhtLTEseW0tMV0sIFt4bSwwLHNpemUtMSx5bS0xXSxcbiAgICAgICAgICAgIFswLHltLHhtLTEsc2l6ZS0xXSwgW3htLHltLHNpemUtMSxzaXplLTFdXTtcbiAgICAgICAgdmFyIGNvbG9yO1xuICAgICAgICB2YXIgaSwgaiwgbCwgcTtcblxuICAgICAgICBuID0gTWF0aC5yb3VuZChuLzQpO1xuICAgICAgICBmb3IgKGk9MCwgbD1xdWFkcy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgICAgICAgICBxID0gcXVhZHNbaV07XG4gICAgICAgICAgICBmb3IgKGo9MDsgajxuOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjb2xvciA9ICdoc2woNjAsMTAwJSwnICsgdGhpcy5nYW1lLnJuZC5iZXR3ZWVuKDkwLDk5KSArICclKSc7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3U3RhcihjdHgsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5ybmQuYmV0d2VlbihxWzBdKzcsIHFbMl0tNyksIHRoaXMuZ2FtZS5ybmQuYmV0d2VlbihxWzFdKzcsIHFbM10tNyksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5ybmQuYmV0d2VlbigyLDQpLCBjb2xvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59OyIsIi8qKlxuICogV29ybGRBcGkuanNcbiAqXG4gKiBBZGQvcmVtb3ZlL21hbmlwdWxhdGUgYm9kaWVzIGluIGNsaWVudCdzIHBoeXNpY3Mgd29ybGRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBBZGQgYm9keSB0byB3b3JsZCBvbiBjbGllbnQgc2lkZVxuICAgICAqXG4gICAgICogQHBhcmFtIHR5cGUge3N0cmluZ30gLSB0eXBlIG5hbWUgb2Ygb2JqZWN0IHRvIGFkZFxuICAgICAqIEBwYXJhbSBjb25maWcge29iamVjdH0gLSBwcm9wZXJ0aWVzIGZvciBuZXcgb2JqZWN0XG4gICAgICogQHJldHVybnMge1BoYXNlci5TcHJpdGV9IC0gbmV3bHkgYWRkZWQgb2JqZWN0XG4gICAgICovXG4gICAgYWRkQm9keTogZnVuY3Rpb24gKHR5cGUsIGNvbmZpZykge1xuICAgICAgICB2YXIgY3RvciA9IGJvZHlUeXBlc1t0eXBlXTtcbiAgICAgICAgdmFyIHBsYXllclNoaXAgPSBmYWxzZTtcbiAgICAgICAgaWYgKCFjdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmxvZygnVW5rbm93biBib2R5IHR5cGU6JywgdHlwZSk7XG4gICAgICAgICAgICB0aGlzLmxvZyhjb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlID09PSAnU2hpcCcgJiYgY29uZmlnLnByb3BlcnRpZXMucGxheWVyaWQgPT09IHRoaXMucGxheWVyLmlkKSB7XG4gICAgICAgICAgICAvL2NvbmZpZy50YWcgPSB0aGlzLnBsYXllci51c2VybmFtZTtcbiAgICAgICAgICAgIC8vaWYgKGNvbmZpZy5wcm9wZXJ0aWVzLnBsYXllcmlkID09PSB0aGlzLnBsYXllci5pZCkge1xuICAgICAgICAgICAgLy8gT25seSB0aGUgcGxheWVyJ3Mgb3duIHNoaXAgaXMgdHJlYXRlZCBhcyBkeW5hbWljIGluIHRoZSBsb2NhbCBwaHlzaWNzIHNpbVxuICAgICAgICAgICAgY29uZmlnLm1hc3MgPSB0aGlzLmNvbmZpZy5zaGlwTWFzcztcbiAgICAgICAgICAgIHBsYXllclNoaXAgPSB0cnVlO1xuICAgICAgICAgICAgLy99XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvZHkgPSBuZXcgY3Rvcih0aGlzLmdhbWUsIGNvbmZpZyk7XG4gICAgICAgIGlmICh0eXBlID09PSAnU2hpcCcpIHtcbiAgICAgICAgICAgIHRoaXMucGxheWVyTWFwW2NvbmZpZy5wcm9wZXJ0aWVzLnBsYXllcmlkXSA9IGJvZHk7XG4gICAgICAgIH1cbiAgICAgICAgLy90aGlzLmdhbWUuYWRkLmV4aXN0aW5nKGJvZHkpO1xuICAgICAgICB0aGlzLmdhbWUucGxheWZpZWxkLmFkZChib2R5KTtcbiAgICAgICAgaWYgKHBsYXllclNoaXApIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5jYW1lcmEuZm9sbG93KGJvZHkpO1xuICAgICAgICAgICAgdGhpcy5nYW1lLnBsYXllclNoaXAgPSBib2R5O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib2R5O1xuICAgIH0sXG5cbiAgICByZW1vdmVCb2R5OiBmdW5jdGlvbiAoc3ByaXRlKSB7XG4gICAgICAgIC8vc3ByaXRlLmtpbGwoKTtcbiAgICAgICAgc3ByaXRlLmRlc3Ryb3koKTtcbiAgICAgICAgLy8gUmVtb3ZlIG1pbmlzcHJpdGVcbiAgICAgICAgaWYgKHNwcml0ZS5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICAvL3Nwcml0ZS5taW5pc3ByaXRlLmtpbGwoKTtcbiAgICAgICAgICAgIHNwcml0ZS5taW5pc3ByaXRlLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICAvL3RoaXMuZ2FtZS5waHlzaWNzLnAyLnJlbW92ZUJvZHkoc3ByaXRlLmJvZHkpO1xuICAgIH1cbn07XG5cbnZhciBib2R5VHlwZXMgPSB7XG4gICAgU2hpcDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1NoaXAuanMnKSxcbiAgICBBc3Rlcm9pZDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0FzdGVyb2lkLmpzJyksXG4gICAgQ3J5c3RhbDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0NyeXN0YWwuanMnKSxcbiAgICBCdWxsZXQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9CdWxsZXQuanMnKSxcbiAgICBHZW5lcmljT3JiOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvR2VuZXJpY09yYi5qcycpLFxuICAgIFBsYW5ldG9pZDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1BsYW5ldG9pZC5qcycpLFxuICAgIFRyZWU6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9UcmVlLmpzJyksXG4gICAgVHJhY3RvckJlYW06IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9UcmFjdG9yQmVhbS5qcycpLFxuICAgIFN0YXJUYXJnZXQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9TdGFyVGFyZ2V0LmpzJylcbn07XG5cbiIsIi8qKlxuICogY29uZmlnLmpzXG4gKlxuICogY2xpZW50IHNpZGUgY29uZmlnXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW9DbGllbnRPcHRpb25zOiB7XG4gICAgICAgIC8vZm9yY2VOZXc6IHRydWVcbiAgICAgICAgcmVjb25uZWN0aW9uOiBmYWxzZVxuICAgIH0sXG4gICAgZm9udHM6IHtcbiAgICAgICAgaHVkQ29kZToge2ZvbnQ6ICcyNnB4IEFyaWFsJywgZmlsbDogJyMwMGZmZmYnLCBhbGlnbjogJ2NlbnRlcid9LFxuICAgICAgICBsZWFkZXJCb2FyZDoge2ZvbnQ6ICcxOHB4IEFyaWFsJywgZmlsbDogJyMwMDAwZmYnfSxcbiAgICAgICAgbGVhZGVyQm9hcmRUaXRsZToge2ZvbnQ6ICdib2xkIDIwcHggQXJpYWwnLCBhbGlnbjogJ2NlbnRlcicsIGZpbGw6ICcjZmYwMDAwJ31cbiAgICB9LFxuICAgIGdhbWVyVGFnczoge1xuICAgICAgICAxOiBbXG4gICAgICAgICAgICAnc3VwZXInLFxuICAgICAgICAgICAgJ2F3ZXNvbWUnLFxuICAgICAgICAgICAgJ3JhaW5ib3cnLFxuICAgICAgICAgICAgJ2RvdWJsZScsXG4gICAgICAgICAgICAndHJpcGxlJyxcbiAgICAgICAgICAgICd2YW1waXJlJyxcbiAgICAgICAgICAgICdwcmluY2VzcycsXG4gICAgICAgICAgICAnaWNlJyxcbiAgICAgICAgICAgICdmaXJlJyxcbiAgICAgICAgICAgICdyb2JvdCcsXG4gICAgICAgICAgICAnd2VyZXdvbGYnLFxuICAgICAgICAgICAgJ3NwYXJrbGUnLFxuICAgICAgICAgICAgJ2luZmluaXRlJyxcbiAgICAgICAgICAgICdjb29sJyxcbiAgICAgICAgICAgICd5b2xvJyxcbiAgICAgICAgICAgICdzd2FnZ3knLFxuICAgICAgICAgICAgJ3pvbWJpZScsXG4gICAgICAgICAgICAnc2FtdXJhaScsXG4gICAgICAgICAgICAnZGFuY2luZycsXG4gICAgICAgICAgICAncG93ZXInLFxuICAgICAgICAgICAgJ2dvbGQnLFxuICAgICAgICAgICAgJ3NpbHZlcicsXG4gICAgICAgICAgICAncmFkaW9hY3RpdmUnLFxuICAgICAgICAgICAgJ3F1YW50dW0nLFxuICAgICAgICAgICAgJ2JyaWxsaWFudCcsXG4gICAgICAgICAgICAnbWlnaHR5JyxcbiAgICAgICAgICAgICdyYW5kb20nXG4gICAgICAgIF0sXG4gICAgICAgIDI6IFtcbiAgICAgICAgICAgICd0aWdlcicsXG4gICAgICAgICAgICAnbmluamEnLFxuICAgICAgICAgICAgJ3ByaW5jZXNzJyxcbiAgICAgICAgICAgICdyb2JvdCcsXG4gICAgICAgICAgICAncG9ueScsXG4gICAgICAgICAgICAnZGFuY2VyJyxcbiAgICAgICAgICAgICdyb2NrZXInLFxuICAgICAgICAgICAgJ21hc3RlcicsXG4gICAgICAgICAgICAnaGFja2VyJyxcbiAgICAgICAgICAgICdyYWluYm93JyxcbiAgICAgICAgICAgICdraXR0ZW4nLFxuICAgICAgICAgICAgJ3B1cHB5JyxcbiAgICAgICAgICAgICdib3NzJyxcbiAgICAgICAgICAgICd3aXphcmQnLFxuICAgICAgICAgICAgJ2hlcm8nLFxuICAgICAgICAgICAgJ2RyYWdvbicsXG4gICAgICAgICAgICAndHJpYnV0ZScsXG4gICAgICAgICAgICAnZ2VuaXVzJyxcbiAgICAgICAgICAgICdibGFzdGVyJyxcbiAgICAgICAgICAgICdzcGlkZXInXG4gICAgICAgIF1cbiAgICB9XG59OyIsIi8qKlxuICogUGF0aC5qc1xuICpcbiAqIFZlY3RvciBwYXRocyBzaGFyZWQgYnkgbXVsdGlwbGUgZWxlbWVudHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUEkgPSBNYXRoLlBJO1xudmFyIFRBVSA9IDIqUEk7XG52YXIgc2luID0gTWF0aC5zaW47XG52YXIgY29zID0gTWF0aC5jb3M7XG5cbmV4cG9ydHMubm9ybWFsaXplID0gZnVuY3Rpb24gKHBhdGgsIHNjYWxlLCB4LCB5LCBjbG9zZSkge1xuICAgIHBhdGggPSBwYXRoLnNsaWNlKCk7XG4gICAgdmFyIG91dHB1dCA9IFtdO1xuICAgIGlmIChjbG9zZSkge1xuICAgICAgICBwYXRoLnB1c2gocGF0aFswXSk7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcGF0aC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIG8gPSB7eDogcGF0aFtpXVswXSAqIHNjYWxlICsgeCwgeTogcGF0aFtpXVsxXSAqIHNjYWxlICsgeX07XG4gICAgICAgIG91dHB1dC5wdXNoKG8pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuZXhwb3J0cy5vY3RhZ29uID0gW1xuICAgIFsyLDFdLFxuICAgIFsxLDJdLFxuICAgIFstMSwyXSxcbiAgICBbLTIsMV0sXG4gICAgWy0yLC0xXSxcbiAgICBbLTEsLTJdLFxuICAgIFsxLC0yXSxcbiAgICBbMiwtMV1cbl07XG5cbmV4cG9ydHMuZDJjcm9zcyA9IFtcbiAgICBbLTEsLTJdLFxuICAgIFstMSwyXSxcbiAgICBbMiwtMV0sXG4gICAgWy0yLC0xXSxcbiAgICBbMSwyXSxcbiAgICBbMSwtMl0sXG4gICAgWy0yLDFdLFxuICAgIFsyLDFdXG5dO1xuXG5leHBvcnRzLnNxdWFyZTAgPSBbXG4gICAgWy0xLC0yXSxcbiAgICBbMiwtMV0sXG4gICAgWzEsMl0sXG4gICAgWy0yLDFdXG5dO1xuXG5leHBvcnRzLnNxdWFyZTEgPSBbXG4gICAgWzEsLTJdLFxuICAgIFsyLDFdLFxuICAgIFstMSwyXSxcbiAgICBbLTIsLTFdXG5dO1xuXG5leHBvcnRzLnN0YXIgPSBbXG4gICAgW3NpbigwKSwgY29zKDApXSxcbiAgICBbc2luKDIqVEFVLzUpLCBjb3MoMipUQVUvNSldLFxuICAgIFtzaW4oNCpUQVUvNSksIGNvcyg0KlRBVS81KV0sXG4gICAgW3NpbihUQVUvNSksIGNvcyhUQVUvNSldLFxuICAgIFtzaW4oMypUQVUvNSksIGNvcygzKlRBVS81KV1cbl07XG5cbmV4cG9ydHMuT0NUUkFESVVTID0gTWF0aC5zcXJ0KDUpOyIsIi8qKlxuICogVXBkYXRlUHJvcGVydGllcy5qc1xuICpcbiAqIENsaWVudC9zZXJ2ZXIgc3luY2FibGUgcHJvcGVydGllcyBmb3IgZ2FtZSBvYmplY3RzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNoaXAgPSBmdW5jdGlvbiAoKSB7fTtcblNoaXAucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVXaWR0aCcsICdsaW5lQ29sb3InLCAnZmlsbENvbG9yJywgJ2ZpbGxBbHBoYScsXG4gICAgJ3ZlY3RvclNjYWxlJywgJ3NoYXBlJywgJ3NoYXBlQ2xvc2VkJywgJ3BsYXllcmlkJywgJ2NyeXN0YWxzJywgJ2RlYWQnLCAndGFnJywgJ2NoYXJnZScsICd0cmVlcyddO1xuXG52YXIgQXN0ZXJvaWQgPSBmdW5jdGlvbiAoKSB7fTtcbkFzdGVyb2lkLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWyd2ZWN0b3JTY2FsZSddO1xuXG52YXIgQ3J5c3RhbCA9IGZ1bmN0aW9uICgpIHt9O1xuQ3J5c3RhbC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsndmVjdG9yU2NhbGUnXTtcblxudmFyIEdlbmVyaWNPcmIgPSBmdW5jdGlvbiAoKSB7fTtcbkdlbmVyaWNPcmIucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVDb2xvcicsICd2ZWN0b3JTY2FsZSddO1xuXG52YXIgUGxhbmV0b2lkID0gZnVuY3Rpb24gKCkge307XG5QbGFuZXRvaWQucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVDb2xvcicsICdmaWxsQ29sb3InLCAnbGluZVdpZHRoJywgJ2ZpbGxBbHBoYScsICd2ZWN0b3JTY2FsZScsICdvd25lciddO1xuXG52YXIgVHJlZSA9IGZ1bmN0aW9uICgpIHt9O1xuVHJlZS5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsndmVjdG9yU2NhbGUnLCAnbGluZUNvbG9yJywgJ2dyYXBoJywgJ3N0ZXAnLCAnZGVwdGgnXTtcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uICgpIHt9O1xuQnVsbGV0LnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lQ29sb3InXTtcblxudmFyIFRyYWN0b3JCZWFtID0gZnVuY3Rpb24gKCkge307XG5UcmFjdG9yQmVhbS5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFtdO1xuXG52YXIgU3RhclRhcmdldCA9IGZ1bmN0aW9uICgpIHt9O1xuU3RhclRhcmdldC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsnc3RhcnMnLCAnbGluZUNvbG9yJywgJ3ZlY3RvclNjYWxlJ107XG5cblxuZXhwb3J0cy5TaGlwID0gU2hpcDtcbmV4cG9ydHMuQXN0ZXJvaWQgPSBBc3Rlcm9pZDtcbmV4cG9ydHMuQ3J5c3RhbCA9IENyeXN0YWw7XG5leHBvcnRzLkdlbmVyaWNPcmIgPSBHZW5lcmljT3JiO1xuZXhwb3J0cy5CdWxsZXQgPSBCdWxsZXQ7XG5leHBvcnRzLlBsYW5ldG9pZCA9IFBsYW5ldG9pZDtcbmV4cG9ydHMuVHJlZSA9IFRyZWU7XG5leHBvcnRzLlRyYWN0b3JCZWFtID0gVHJhY3RvckJlYW07XG5leHBvcnRzLlN0YXJUYXJnZXQgPSBTdGFyVGFyZ2V0O1xuIiwiLyoqXG4gKiBjb25maWcuanNcbiAqXG4gKiBjb21tb24gY29uZmlnXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdmVyc2lvbjogJzAuMScsXG4gICAgLy9zZXJ2ZXJVcmk6ICdodHRwOi8vcGhhcmNvZGVyLXNpbmdsZS0xLmVsYXN0aWNiZWFuc3RhbGsuY29tOjgwODAnLFxuICAgIC8vc2VydmVyVXJpOiAnaHR0cDovL2xvY2FsaG9zdDo4MDgxJyxcbiAgICAvL3NlcnZlckFkZHJlc3M6ICcxLjIuMy40JyxcbiAgICB3b3JsZEJvdW5kczogWy0yMDAsIC0yMDAsIDIwMCwgMjAwXSxcbiAgICBwaHlzaWNzU2NhbGU6IDIwLFxuICAgIHJlbmRlckxhdGVuY3k6IDEwMCxcbiAgICBmcmFtZVJhdGU6ICgxIC8gNjApLFxuICAgIHRpbWVTeW5jRnJlcTogMTAsXG4gICAgc2hpcE1hc3M6IDEwMCAgICAgICAgICAgLy8gU3RvcGdhcCBwZW5kaW5nIHBoeXNpY3MgcmVmYWN0b3Jcbn07IiwiLyoqXG4gKiBBc3Rlcm9pZC5qc1xuICpcbiAqIENsaWVudCBzaWRlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5Bc3Rlcm9pZDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgQXN0ZXJvaWQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG4gICAgLy90aGlzLmJvZHkuZGFtcGluZyA9IDA7XG59O1xuXG5Bc3Rlcm9pZC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgb3B0aW9ucykge1xuICAgIHZhciBhID0gbmV3IEFzdGVyb2lkKGdhbWUsIG9wdGlvbnMpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBhO1xufTtcblxuQXN0ZXJvaWQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcbkFzdGVyb2lkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFzdGVyb2lkO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQXN0ZXJvaWQucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEFzdGVyb2lkLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5Bc3Rlcm9pZC5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmYwMGZmJztcbkFzdGVyb2lkLnByb3RvdHlwZS5fZmlsbENvbG9yID0gJyNmZjAwMDAnO1xuQXN0ZXJvaWQucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMjU7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBBc3Rlcm9pZDtcbi8vU3RhcmNvZGVyLkFzdGVyb2lkID0gQXN0ZXJvaWQ7XG4iLCIvKipcbiAqIEJ1bGxldC5qc1xuICpcbiAqIENsaWVudCBzaWRlIGltcGxlbWVudGF0aW9uIG9mIHNpbXBsZSBwcm9qZWN0aWxlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG4vL3ZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkJ1bGxldDtcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkJ1bGxldC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuQnVsbGV0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJ1bGxldDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEJ1bGxldC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQnVsbGV0LnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5CdWxsZXQucHJvdG90eXBlLnZpc2libGVPbk1hcCA9IGZhbHNlO1xuQnVsbGV0LnByb3RvdHlwZS5zaGFyZWRUZXh0dXJlS2V5ID0gJ2xhc2VyJztcblxuQnVsbGV0LnByb3RvdHlwZS5kcmF3UHJvY2VkdXJlID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlLCBmcmFtZSkge1xuICAgIHZhciBzY2FsZSA9IHRoaXMuZ2FtZS5waHlzaWNzLnAyLm1weGkodGhpcy52ZWN0b3JTY2FsZSkgKiByZW5kZXJTY2FsZTtcbiAgICB0aGlzLmdyYXBoaWNzLmxpbmVTdHlsZSg0LCBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpLCAxKTtcbiAgICB0aGlzLmdyYXBoaWNzLm1vdmVUbygwLCAwKTtcbiAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbygwLCAxICogc2NhbGUpO1xuICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKDIsIDB4ZmZmZmZmLCAwLjI1KTtcbiAgICB0aGlzLmdyYXBoaWNzLm1vdmVUbygwLCAwKTtcbiAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbygwLCAxICogc2NhbGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdWxsZXQ7IiwiLyoqXG4gKiBDcnlzdGFsLmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5DcnlzdGFsO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBDcnlzdGFsID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuQ3J5c3RhbC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgdmFyIGEgPSBuZXcgQ3J5c3RhbChnYW1lLCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBhO1xufTtcblxuQ3J5c3RhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuQ3J5c3RhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDcnlzdGFsO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQ3J5c3RhbC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQ3J5c3RhbC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuQ3J5c3RhbC5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjMDBmZmZmJztcbkNyeXN0YWwucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwMDAwMCc7XG5DcnlzdGFsLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuQ3J5c3RhbC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5DcnlzdGFsLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4wO1xuQ3J5c3RhbC5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcbkNyeXN0YWwucHJvdG90eXBlLl9nZW9tZXRyeSA9IFtcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuZDJjcm9zc31cbl07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDcnlzdGFsO1xuIiwiLyoqXG4gKiBHZW5lcmljT3JiLmpzXG4gKlxuICogQnVpbGRpbmcgYmxvY2tcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkdlbmVyaWNPcmI7XG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcblxudmFyIEdlbmVyaWNPcmIgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG59O1xuXG5HZW5lcmljT3JiLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICB2YXIgYSA9IG5ldyBHZW5lcmljT3JiKGdhbWUsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5HZW5lcmljT3JiLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyaWNPcmI7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShHZW5lcmljT3JiLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShHZW5lcmljT3JiLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5HZW5lcmljT3JiLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZjAwMDAnO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX2ZpbGxDb2xvciA9ICcjMDAwMDAwJztcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9maWxsQWxwaGEgPSAwLjA7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuXG5HZW5lcmljT3JiLnByb3RvdHlwZS5fZ2VvbWV0cnkgPSBbXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLmQyY3Jvc3N9XG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdlbmVyaWNPcmI7XG4iLCIvKipcbiAqIFBsYW5ldG9pZC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuUGxhbmV0b2lkO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBQbGFuZXRvaWQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbn07XG5cblBsYW5ldG9pZC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgb3B0aW9ucykge1xuICAgIHZhciBwbGFuZXRvaWQgPSBuZXcgUGxhbmV0b2lkKGdhbWUsIG9wdGlvbnMpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBwbGFuZXRvaWQ7XG59O1xuXG5QbGFuZXRvaWQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcblBsYW5ldG9pZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQbGFuZXRvaWQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShQbGFuZXRvaWQucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFBsYW5ldG9pZC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuLy9QbGFuZXRvaWQucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnI2ZmMDBmZic7XG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2ZpbGxDb2xvciA9ICcjMDBmZjAwJztcbi8vUGxhbmV0b2lkLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcbi8vUGxhbmV0b2lkLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4yNTtcblBsYW5ldG9pZC5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcblBsYW5ldG9pZC5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcblBsYW5ldG9pZC5wcm90b3R5cGUuX2dlb21ldHJ5ID0gW1xuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5kMmNyb3NzfSxcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuc3F1YXJlMH0sXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLnNxdWFyZTF9XG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYW5ldG9pZDtcbiIsIi8qKlxuICogU2hpcC5qc1xuICpcbiAqIENsaWVudCBzaWRlIGltcGxlbWVudGF0aW9uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5TaGlwO1xuLy92YXIgRW5naW5lID0gcmVxdWlyZSgnLi9FbmdpbmUuanMnKTtcbi8vdmFyIFdlYXBvbnMgPSByZXF1aXJlKCcuL1dlYXBvbnMuanMnKTtcblxudmFyIFNoaXAgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG5cbiAgICBpZiAoY29uZmlnLm1hc3MpIHtcbiAgICAgICAgdGhpcy5ib2R5Lm1hc3MgPSBjb25maWcubWFzcztcbiAgICB9XG4gICAgLy90aGlzLmVuZ2luZSA9IEVuZ2luZS5hZGQoZ2FtZSwgJ3RocnVzdCcsIDUwMCk7XG4gICAgLy90aGlzLmFkZENoaWxkKHRoaXMuZW5naW5lKTtcbiAgICAvL3RoaXMud2VhcG9ucyA9IFdlYXBvbnMuYWRkKGdhbWUsICdidWxsZXQnLCAxMik7XG4gICAgLy90aGlzLndlYXBvbnMuc2hpcCA9IHRoaXM7XG4gICAgLy90aGlzLmFkZENoaWxkKHRoaXMud2VhcG9ucyk7XG4gICAgdGhpcy50YWdUZXh0ID0gZ2FtZS5hZGQudGV4dCgwLCB0aGlzLnRleHR1cmUuaGVpZ2h0LzIgKyAxLFxuICAgICAgICB0aGlzLnRhZywge2ZvbnQ6ICdib2xkIDE4cHggQXJpYWwnLCBmaWxsOiB0aGlzLmxpbmVDb2xvciB8fCAnI2ZmZmZmZicsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIHRoaXMudGFnVGV4dC5hbmNob3Iuc2V0VG8oMC41LCAwKTtcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMudGFnVGV4dCk7XG4gICAgdGhpcy5sb2NhbFN0YXRlID0ge1xuICAgICAgICB0aHJ1c3Q6ICdvZmYnXG4gICAgfVxuICAgIHRoaXMuZ2FtZS5odWQuc2V0TGFzZXJDb2xvcih0aGlzLmxpbmVDb2xvcik7XG59O1xuXG5TaGlwLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIHMgPSBuZXcgU2hpcChnYW1lLCBvcHRpb25zKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhzKTtcbiAgICByZXR1cm4gcztcbn07XG5cblNoaXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcblNoaXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2hpcDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFNoaXAucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFNoaXAucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cblNoaXAucHJvdG90eXBlLm1hcEZhY3RvciA9IDM7XG5cbi8vU2hpcC5wcm90b3R5cGUuc2V0TGluZVN0eWxlID0gZnVuY3Rpb24gKGNvbG9yLCBsaW5lV2lkdGgpIHtcbi8vICAgIFN0YXJjb2Rlci5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnNldExpbmVTdHlsZS5jYWxsKHRoaXMsIGNvbG9yLCBsaW5lV2lkdGgpO1xuLy8gICAgdGhpcy50YWdUZXh0LnNldFN0eWxlKHtmaWxsOiBjb2xvcn0pO1xuLy99O1xuXG4vL1NoaXAucHJvdG90eXBlLnNoYXBlID0gW1xuLy8gICAgWy0xLC0xXSxcbi8vICAgIFstMC41LDBdLFxuLy8gICAgWy0xLDFdLFxuLy8gICAgWzAsMC41XSxcbi8vICAgIFsxLDFdLFxuLy8gICAgWzAuNSwwXSxcbi8vICAgIFsxLC0xXSxcbi8vICAgIFswLC0wLjVdLFxuLy8gICAgWy0xLC0xXVxuLy9dO1xuLy9TaGlwLnByb3RvdHlwZS5fbGluZVdpZHRoID0gNjtcblxuU2hpcC5wcm90b3R5cGUudXBkYXRlVGV4dHVyZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gRklYTUU6IFByb2JhYmx5IG5lZWQgdG8gcmVmYWN0b3IgY29uc3RydWN0b3IgYSBiaXQgdG8gbWFrZSB0aGlzIGNsZWFuZXJcbiAgICBWZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZVRleHR1cmVzLmNhbGwodGhpcyk7XG4gICAgaWYgKHRoaXMudGFnVGV4dCkge1xuICAgICAgICAvL3RoaXMudGFnVGV4dC5zZXRTdHlsZSh7ZmlsbDogdGhpcy5saW5lQ29sb3J9KTtcbiAgICAgICAgdGhpcy50YWdUZXh0LmZpbGwgPSB0aGlzLmxpbmVDb2xvcjtcbiAgICAgICAgdGhpcy50YWdUZXh0LnkgPSB0aGlzLnRleHR1cmUuaGVpZ2h0LzIgKyAxO1xuICAgIH1cbn07XG5cblNoaXAucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBWZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMpO1xuICAgIC8vIEZJWE1FOiBOZWVkIHRvIGRlYWwgd2l0aCBwbGF5ZXIgdmVyc3VzIGZvcmVpZ24gc2hpcHNcbiAgICBzd2l0Y2ggKHRoaXMubG9jYWxTdGF0ZS50aHJ1c3QpIHtcbiAgICAgICAgY2FzZSAnc3RhcnRpbmcnOlxuICAgICAgICAgICAgdGhpcy5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QucGxheSgpO1xuICAgICAgICAgICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvci5zdGFydE9uKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0YXRlLnRocnVzdCA9ICdvbic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2h1dGRvd24nOlxuICAgICAgICAgICAgdGhpcy5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3Quc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvci5zdG9wT24odGhpcyk7XG4gICAgICAgICAgICB0aGlzLmxvY2FsU3RhdGUudGhydXN0ID0gJ29mZic7XG4gICAgfVxuICAgIC8vIFBsYXllciBzaGlwIG9ubHlcbiAgICBpZiAodGhpcy5nYW1lLnBsYXllclNoaXAgPT09IHRoaXMpIHtcbiAgICAgICAgLy90aGlzLmdhbWUuaW52ZW50b3J5dGV4dC5zZXRUZXh0KHRoaXMuY3J5c3RhbHMudG9TdHJpbmcoKSk7XG4gICAgICAgIHRoaXMuZ2FtZS5odWQuc2V0Q3J5c3RhbHModGhpcy5jcnlzdGFscyk7XG4gICAgICAgIHRoaXMuZ2FtZS5odWQuc2V0Q2hhcmdlKHRoaXMuY2hhcmdlKTtcbiAgICAgICAgdGhpcy5nYW1lLmh1ZC5zZXRUcmVlcyh0aGlzLnRyZWVzKTtcbiAgICB9XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3RhZycsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RhZztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl90YWcgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaGlwO1xuLy9TdGFyY29kZXIuU2hpcCA9IFNoaXA7XG4iLCIvKipcbiAqIFNpbXBsZVBhcnRpY2xlLmpzXG4gKlxuICogQmFzaWMgYml0bWFwIHBhcnRpY2xlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSBmdW5jdGlvbiAoZ2FtZSwga2V5KSB7XG4gICAgdmFyIHRleHR1cmUgPSBTaW1wbGVQYXJ0aWNsZS5fdGV4dHVyZUNhY2hlW2tleV07XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIDAsIDAsIHRleHR1cmUpO1xuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUodGhpcywgZmFsc2UsIGZhbHNlKTtcbiAgICB0aGlzLmJvZHkuY2xlYXJTaGFwZXMoKTtcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmJvZHkuYWRkUGFydGljbGUoKTtcbiAgICBzaGFwZS5zZW5zb3IgPSB0cnVlO1xuICAgIC8vdGhpcy5raWxsKCk7XG59O1xuXG5TaW1wbGVQYXJ0aWNsZS5fdGV4dHVyZUNhY2hlID0ge307XG5cblNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSA9IGZ1bmN0aW9uIChnYW1lLCBrZXksIGNvbG9yLCBzaXplLCBjaXJjbGUpIHtcbiAgICB2YXIgdGV4dHVyZSA9IGdhbWUubWFrZS5iaXRtYXBEYXRhKHNpemUsIHNpemUpO1xuICAgIHRleHR1cmUuY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIGlmIChjaXJjbGUpIHtcbiAgICAgICAgdGV4dHVyZS5jdHguYXJjKHNpemUvMiwgc2l6ZS8yLCBzaXplLzIsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XG4gICAgICAgIHRleHR1cmUuY3R4LmZpbGwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0dXJlLmN0eC5maWxsUmVjdCgwLCAwLCBzaXplLCBzaXplKTtcbiAgICB9XG4gICAgU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZVtrZXldID0gdGV4dHVyZTtcbn07XG5cblNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuU2ltcGxlUGFydGljbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2ltcGxlUGFydGljbGU7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVQYXJ0aWNsZTtcbi8vU3RhcmNvZGVyLlNpbXBsZVBhcnRpY2xlID0gU2ltcGxlUGFydGljbGU7IiwiLyoqXG4gKiBTdGFyVGFyZ2V0LmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb25cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlN0YXJUYXJnZXQ7XG5cbnZhciBzdGFyID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJykuc3RhcjtcblxudmFyIFN0YXJUYXJnZXQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbn07XG5cblN0YXJUYXJnZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcblN0YXJUYXJnZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RhclRhcmdldDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJUYXJnZXQucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJUYXJnZXQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cblN0YXJUYXJnZXQucHJvdG90eXBlLmRyYXdQcm9jZWR1cmUgPSBmdW5jdGlvbiAocmVuZGVyU2NhbGUpIHtcbiAgICB2YXIgcHNjID0gdGhpcy5nYW1lLnBoeXNpY3MucDIubXB4aShyZW5kZXJTY2FsZSk7XG4gICAgdmFyIGdzYyA9IHBzYyp0aGlzLnZlY3RvclNjYWxlO1xuICAgIHZhciBsaW5lQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpO1xuICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKDEsIGxpbmVDb2xvciwgMSk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnN0YXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gMCwgayA9IHN0YXIubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHBzYyAqIHRoaXMuc3RhcnNbaV1bMF0gKyBnc2MgKiBzdGFyW2pdWzBdO1xuICAgICAgICAgICAgdmFyIHkgPSBwc2MgKiB0aGlzLnN0YXJzW2ldWzFdICsgZ3NjICogc3RhcltqXVsxXTtcbiAgICAgICAgICAgIGlmIChqID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8oeCwgeSk7XG4gICAgICAgICAgICAgICAgdmFyIHgwID0geDtcbiAgICAgICAgICAgICAgICB2YXIgeTAgPSB5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyh4LCB5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyh4MCwgeTApO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhclRhcmdldDsiLCIvKipcbiAqIFN5bmNCb2R5SW50ZXJmYWNlLmpzXG4gKlxuICogU2hhcmVkIG1ldGhvZHMgZm9yIFZlY3RvclNwcml0ZXMsIFBhcnRpY2xlcywgZXRjLlxuICovXG5cbnZhciBTeW5jQm9keUludGVyZmFjZSA9IGZ1bmN0aW9uICgpIHt9O1xuXG4vKipcbiAqIFNldCBsb2NhdGlvbiBhbmQgYW5nbGUgb2YgYSBwaHlzaWNzIG9iamVjdC4gVmFsdWUgYXJlIGdpdmVuIGluIHdvcmxkIGNvb3JkaW5hdGVzLCBub3QgcGl4ZWxzXG4gKlxuICogQHBhcmFtIHgge251bWJlcn1cbiAqIEBwYXJhbSB5IHtudW1iZXJ9XG4gKiBAcGFyYW0gYSB7bnVtYmVyfVxuICovXG5TeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUuc2V0UG9zQW5nbGUgPSBmdW5jdGlvbiAoeCwgeSwgYSkge1xuICAgIHRoaXMuYm9keS5kYXRhLnBvc2l0aW9uWzBdID0gLSh4IHx8IDApO1xuICAgIHRoaXMuYm9keS5kYXRhLnBvc2l0aW9uWzFdID0gLSh5IHx8IDApO1xuICAgIHRoaXMuYm9keS5kYXRhLmFuZ2xlID0gYSB8fCAwO1xufTtcblxuU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlLmNvbmZpZyA9IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnVwZGF0ZVByb3BlcnRpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBrID0gdGhpcy51cGRhdGVQcm9wZXJ0aWVzW2ldO1xuICAgICAgICBpZiAodHlwZW9mIHByb3BlcnRpZXNba10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzW2tdID0gcHJvcGVydGllc1trXTsgICAgICAgIC8vIEZJWE1FPyBWaXJ0dWFsaXplIHNvbWVob3dcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3luY0JvZHlJbnRlcmZhY2U7IiwiLyoqXG4gKiBUaHJ1c3RHZW5lcmF0b3IuanNcbiAqXG4gKiBHcm91cCBwcm92aWRpbmcgQVBJLCBsYXllcmluZywgYW5kIHBvb2xpbmcgZm9yIHRocnVzdCBwYXJ0aWNsZSBlZmZlY3RzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gcmVxdWlyZSgnLi9TaW1wbGVQYXJ0aWNsZS5qcycpO1xuXG52YXIgX3RleHR1cmVLZXkgPSAndGhydXN0JztcblxuLy8gUG9vbGluZyBwYXJhbWV0ZXJzXG52YXIgX21pblBvb2xTaXplID0gMzAwO1xudmFyIF9taW5GcmVlUGFydGljbGVzID0gMjA7XG52YXIgX3NvZnRQb29sTGltaXQgPSAyMDA7XG52YXIgX2hhcmRQb29sTGltaXQgPSA1MDA7XG5cbi8vIEJlaGF2aW9yIG9mIGVtaXR0ZXJcbnZhciBfcGFydGljbGVzUGVyQnVyc3QgPSA1O1xudmFyIF9wYXJ0aWNsZVRUTCA9IDE1MDtcbnZhciBfcGFydGljbGVCYXNlU3BlZWQgPSA1O1xudmFyIF9jb25lTGVuZ3RoID0gMTtcbnZhciBfY29uZVdpZHRoUmF0aW8gPSAwLjI7XG52YXIgX2VuZ2luZU9mZnNldCA9IC0yMDtcblxudmFyIFRocnVzdEdlbmVyYXRvciA9IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICB0aGlzLnRocnVzdGluZ1NoaXBzID0ge307XG5cbiAgICAvLyBQcmVnZW5lcmF0ZSBhIGJhdGNoIG9mIHBhcnRpY2xlc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX21pblBvb2xTaXplOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnRpY2xlID0gdGhpcy5hZGQobmV3IFNpbXBsZVBhcnRpY2xlKGdhbWUsIF90ZXh0dXJlS2V5KSk7XG4gICAgICAgIHBhcnRpY2xlLmFscGhhID0gMC41O1xuICAgICAgICBwYXJ0aWNsZS5yb3RhdGlvbiA9IE1hdGguUEkvNDtcbiAgICAgICAgcGFydGljbGUua2lsbCgpO1xuICAgIH1cbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRocnVzdEdlbmVyYXRvcjtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS5zdGFydE9uID0gZnVuY3Rpb24gKHNoaXApIHtcbiAgICB0aGlzLnRocnVzdGluZ1NoaXBzW3NoaXAuaWRdID0gc2hpcDtcbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUuc3RvcE9uID0gZnVuY3Rpb24gKHNoaXApIHtcbiAgICBkZWxldGUgdGhpcy50aHJ1c3RpbmdTaGlwc1tzaGlwLmlkXTtcbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy50aHJ1c3RpbmdTaGlwcyk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBrZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgc2hpcCA9IHRoaXMudGhydXN0aW5nU2hpcHNba2V5c1tpXV07XG4gICAgICAgIHZhciB3ID0gc2hpcC53aWR0aDtcbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKHNoaXAucm90YXRpb24pO1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3Moc2hpcC5yb3RhdGlvbik7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX3BhcnRpY2xlc1BlckJ1cnN0OyBqKyspIHtcbiAgICAgICAgICAgIHZhciBwYXJ0aWNsZSA9IHRoaXMuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICAgICAgICBpZiAoIXBhcnRpY2xlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vdCBlbm91Z2ggdGhydXN0IHBhcnRpY2xlcyBpbiBwb29sJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZCA9IHRoaXMuZ2FtZS5ybmQucmVhbEluUmFuZ2UoLV9jb25lV2lkdGhSYXRpbyp3LCBfY29uZVdpZHRoUmF0aW8qdyk7XG4gICAgICAgICAgICB2YXIgeCA9IHNoaXAueCArIGQqY29zICsgX2VuZ2luZU9mZnNldCpzaW47XG4gICAgICAgICAgICB2YXIgeSA9IHNoaXAueSArIGQqc2luIC0gX2VuZ2luZU9mZnNldCpjb3M7XG4gICAgICAgICAgICBwYXJ0aWNsZS5saWZlc3BhbiA9IF9wYXJ0aWNsZVRUTDtcbiAgICAgICAgICAgIHBhcnRpY2xlLnJlc2V0KHgsIHkpO1xuICAgICAgICAgICAgcGFydGljbGUuYm9keS52ZWxvY2l0eS54ID0gX3BhcnRpY2xlQmFzZVNwZWVkKihfY29uZUxlbmd0aCpzaW4gLSBkKmNvcyk7XG4gICAgICAgICAgICBwYXJ0aWNsZS5ib2R5LnZlbG9jaXR5LnkgPSBfcGFydGljbGVCYXNlU3BlZWQqKC1fY29uZUxlbmd0aCpjb3MgLSBkKnNpbik7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IudGV4dHVyZUtleSA9IF90ZXh0dXJlS2V5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRocnVzdEdlbmVyYXRvcjsiLCIvKipcbiAqIFRvYXN0LmpzXG4gKlxuICogQ2xhc3MgZm9yIHZhcmlvdXMga2luZHMgb2YgcG9wIHVwIG1lc3NhZ2VzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFRvYXN0ID0gZnVuY3Rpb24gKGdhbWUsIHgsIHksIHRleHQsIGNvbmZpZykge1xuICAgIC8vIFRPRE86IGJldHRlciBkZWZhdWx0cywgbWF5YmVcbiAgICBQaGFzZXIuVGV4dC5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIHRleHQsIHtcbiAgICAgICAgZm9udDogJzE0cHQgQXJpYWwnLFxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXG4gICAgICAgIGZpbGw6ICcjZmZhNTAwJ1xuICAgIH0pO1xuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICAvLyBTZXQgdXAgc3R5bGVzIGFuZCB0d2VlbnNcbiAgICB2YXIgc3BlYyA9IHt9O1xuICAgIGlmIChjb25maWcudXApIHtcbiAgICAgICAgc3BlYy55ID0gJy0nICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmRvd24pIHtcbiAgICAgICAgc3BlYy55ID0gJysnICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmxlZnQpIHtcbiAgICAgICAgc3BlYy54ID0gJy0nICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLnJpZ2h0KSB7XG4gICAgICAgIHNwZWMueCA9ICcrJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgc3dpdGNoIChjb25maWcudHlwZSkge1xuICAgICAgICBjYXNlICdzcGlubmVyJzpcbiAgICAgICAgICAgIHRoaXMuZm9udFNpemUgPSAnMjBwdCc7XG4gICAgICAgICAgICBzcGVjLnJvdGF0aW9uID0gY29uZmlnLnJldm9sdXRpb25zID8gY29uZmlnLnJldm9sdXRpb25zICogMiAqIE1hdGguUEkgOiAyICogTWF0aC5QSTtcbiAgICAgICAgICAgIHZhciB0d2VlbiA9IGdhbWUuYWRkLnR3ZWVuKHRoaXMpLnRvKHNwZWMsIGNvbmZpZy5kdXJhdGlvbiwgY29uZmlnLmVhc2luZywgdHJ1ZSk7XG4gICAgICAgICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZChmdW5jdGlvbiAodG9hc3QpIHtcbiAgICAgICAgICAgICAgICB0b2FzdC5raWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gVE9ETzogTW9yZSBraW5kc1xuICAgIH1cbn07XG5cbi8qKlxuICogQ3JlYXRlIG5ldyBUb2FzdCBhbmQgYWRkIHRvIGdhbWVcbiAqXG4gKiBAcGFyYW0gZ2FtZVxuICogQHBhcmFtIHhcbiAqIEBwYXJhbSB5XG4gKiBAcGFyYW0gdGV4dFxuICogQHBhcmFtIGNvbmZpZ1xuICovXG5Ub2FzdC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSwgdGV4dCwgY29uZmlnKSB7XG4gICAgdmFyIHRvYXN0ID0gbmV3IFRvYXN0KGdhbWUsIHgsIHksIHRleHQsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodG9hc3QpO1xufTtcblxuLy8gQ292ZW5pZW5jZSBtZXRob2RzIGZvciBjb21tb24gY2FzZXNcblxuVG9hc3Quc3BpblVwID0gZnVuY3Rpb24gKGdhbWUsIHgsIHksIHRleHQpIHtcbiAgICB2YXIgdG9hc3QgPSBuZXcgVG9hc3QgKGdhbWUsIHgsIHksIHRleHQsIHtcbiAgICAgICAgdHlwZTogJ3NwaW5uZXInLFxuICAgICAgICByZXZvbHV0aW9uczogMSxcbiAgICAgICAgZHVyYXRpb246IDUwMCxcbiAgICAgICAgZWFzaW5nOiBQaGFzZXIuRWFzaW5nLkVsYXN0aWMuT3V0LFxuICAgICAgICB1cDogMTAwXG4gICAgfSk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodG9hc3QpO1xufTtcblxuVG9hc3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuVGV4dC5wcm90b3R5cGUpO1xuVG9hc3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVG9hc3Q7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9hc3Q7XG4iLCIvKipcbiAqIFRyYWN0b3JCZWFtLmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb24gb2YgYSBzaW5nbGUgdHJhY3RvciBiZWFtIHNlZ21lbnRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL0ZJWE1FOiBOaWNlciBpbXBsZW1lbnRhdGlvblxuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5UcmFjdG9yQmVhbTtcblxudmFyIFRyYWN0b3JCZWFtID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhbGwodGhpcywgZ2FtZSwgJ3RyYWN0b3InKTtcbiAgICB0aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuVHJhY3RvckJlYW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTaW1wbGVQYXJ0aWNsZS5wcm90b3R5cGUpO1xuVHJhY3RvckJlYW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVHJhY3RvckJlYW07XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShUcmFjdG9yQmVhbS5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJhY3RvckJlYW0ucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhY3RvckJlYW07IiwiLyoqXG4gKiBUcmVlLmpzXG4gKlxuICogQ2xpZW50IHNpZGVcbiAqL1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlRyZWU7XG5cbnZhciBUcmVlID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAxKTtcbn07XG5cblRyZWUuYWRkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIHZhciB0cmVlID0gbmV3IFRyZWUgKGdhbWUsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodHJlZSk7XG4gICAgcmV0dXJuIHRyZWU7XG59O1xuXG5UcmVlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5UcmVlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRyZWU7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShUcmVlLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShUcmVlLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG4vKipcbiAqIERyYXcgdHJlZSwgb3ZlcnJpZGluZyBzdGFuZGFyZCBzaGFwZSBhbmQgZ2VvbWV0cnkgbWV0aG9kIHRvIHVzZSBncmFwaFxuICpcbiAqIEBwYXJhbSByZW5kZXJTY2FsZVxuICovXG5UcmVlLnByb3RvdHlwZS5kcmF3UHJvY2VkdXJlID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlKSB7XG4gICAgdmFyIGxpbmVDb2xvciA9IFBoYXNlci5Db2xvci5oZXhUb1JHQih0aGlzLmxpbmVDb2xvcik7XG4gICAgdGhpcy5ncmFwaGljcy5saW5lU3R5bGUoMSwgbGluZUNvbG9yLCAxKTtcbiAgICB0aGlzLl9kcmF3QnJhbmNoKHRoaXMuZ3JhcGgsIHRoaXMuZ2FtZS5waHlzaWNzLnAyLm1weGkodGhpcy52ZWN0b3JTY2FsZSkqcmVuZGVyU2NhbGUsIHRoaXMuZGVwdGgpO1xufTtcblxuVHJlZS5wcm90b3R5cGUuX2RyYXdCcmFuY2ggPSBmdW5jdGlvbiAoZ3JhcGgsIHNjLCBkZXB0aCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gZ3JhcGguYy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkID0gZ3JhcGguY1tpXTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8oZ3JhcGgueCAqIHNjLCBncmFwaC55ICogc2MpO1xuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyhjaGlsZC54ICogc2MsIGNoaWxkLnkgKiBzYyk7XG4gICAgICAgIGlmIChkZXB0aCA+IHRoaXMuc3RlcCkge1xuICAgICAgICAgICAgdGhpcy5fZHJhd0JyYW5jaChjaGlsZCwgc2MsIGRlcHRoIC0gMSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVHJlZS5wcm90b3R5cGUsICdzdGVwJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RlcDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9zdGVwID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHJlZTsiLCIvKipcbiAqIFNwcml0ZSB3aXRoIGF0dGFjaGVkIEdyYXBoaWNzIG9iamVjdCBmb3IgdmVjdG9yLWxpa2UgZ3JhcGhpY3NcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL3ZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi8uLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG5cbnZhciBmcmFtZVRleHR1cmVQb29sID0ge307XG52YXIgbWFwVGV4dHVyZVBvb2wgPSB7fTtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBWZWN0b3ItYmFzZWQgc3ByaXRlc1xuICpcbiAqIEBwYXJhbSBnYW1lIHtQaGFzZXIuR2FtZX0gLSBQaGFzZXIgZ2FtZSBvYmplY3RcbiAqIEBwYXJhbSBjb25maWcge29iamVjdH0gLSBQT0pPIHdpdGggY29uZmlnIGRldGFpbHNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgVmVjdG9yU3ByaXRlID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIC8vdGhpcy5ncmFwaGljcyA9IGdhbWUubWFrZS5ncmFwaGljcygpO1xuICAgIHRoaXMuZ3JhcGhpY3MgPSB0aGlzLmdhbWUuc2hhcmVkR3JhcGhpY3M7XG4gICAgLy90aGlzLnRleHR1cmUgPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICAvL3RoaXMubWluaXRleHR1cmUgPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcblxuICAgIGlmICghY29uZmlnLm5vcGh5c2ljcykge1xuICAgICAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHRoaXMsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG4gICAgICAgIHRoaXMudXBkYXRlQm9keSgpO1xuICAgICAgICB0aGlzLmJvZHkubWFzcyA9IDA7XG4gICAgfVxuICAgIHRoaXMuY29uZmlnKGNvbmZpZy5wcm9wZXJ0aWVzKTtcblxuICAgIGlmICh0aGlzLnZpc2libGVPbk1hcCkge1xuICAgICAgICB0aGlzLm1pbmlzcHJpdGUgPSB0aGlzLmdhbWUubWluaW1hcC5jcmVhdGUoKTtcbiAgICAgICAgdGhpcy5taW5pc3ByaXRlLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2hhcmVkVGV4dHVyZUtleSkge1xuICAgICAgICB0aGlzLmZyYW1lcyA9IHRoaXMuZ2V0RnJhbWVQb29sKHRoaXMuc2hhcmVkVGV4dHVyZUtleSk7XG4gICAgICAgIGlmICh0aGlzLm1pbmlzcHJpdGUpIHtcbiAgICAgICAgICAgIHRoaXMubWluaXRleHR1cmUgPSB0aGlzLmdldE1hcFBvb2wodGhpcy5zaGFyZWRUZXh0dXJlS2V5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5mcmFtZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRleHR1cmVzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFRleHR1cmUodGhpcy5mcmFtZXNbdGhpcy52RnJhbWVdKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1pbmlzcHJpdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1pbmlzcHJpdGUuc2V0VGV4dHVyZSh0aGlzLm1pbml0ZXh0dXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZnJhbWVzID0gW107XG4gICAgICAgIGlmICh0aGlzLm1pbmlzcHJpdGUpIHtcbiAgICAgICAgICAgIHRoaXMubWluaXRleHR1cmUgPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZVRleHR1cmVzKCk7XG4gICAgfVxuXG4gICAgLy90aGlzLnVwZGF0ZVRleHR1cmVzKCk7XG4gICAgaWYgKHRoaXMuZnBzKSB7XG4gICAgICAgIHRoaXMuX21zUGVyRnJhbWUgPSAxMDAwIC8gdGhpcy5mcHM7XG4gICAgICAgIHRoaXMuX2xhc3RWRnJhbWUgPSB0aGlzLmdhbWUudGltZS5ub3c7XG4gICAgfVxufTtcblxuLyoqXG4gKiBDcmVhdGUgVmVjdG9yU3ByaXRlIGFuZCBhZGQgdG8gZ2FtZSB3b3JsZFxuICpcbiAqIEBwYXJhbSBnYW1lIHtQaGFzZXIuR2FtZX1cbiAqIEBwYXJhbSB4IHtudW1iZXJ9IC0geCBjb29yZFxuICogQHBhcmFtIHkge251bWJlcn0gLSB5IGNvb3JkXG4gKiBAcmV0dXJucyB7VmVjdG9yU3ByaXRlfVxuICovXG5WZWN0b3JTcHJpdGUuYWRkID0gZnVuY3Rpb24gKGdhbWUsIHgsIHkpIHtcbiAgICB2YXIgdiA9IG5ldyBWZWN0b3JTcHJpdGUoZ2FtZSwgeCwgeSk7XG4gICAgZ2FtZS5hZGQuZXhpc3Rpbmcodik7XG4gICAgcmV0dXJuIHY7XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVmVjdG9yU3ByaXRlO1xuXG4vLyBEZWZhdWx0IG9jdGFnb25cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX3NoYXBlID0gW1xuICAgIFsyLDFdLFxuICAgIFsxLDJdLFxuICAgIFstMSwyXSxcbiAgICBbLTIsMV0sXG4gICAgWy0yLC0xXSxcbiAgICBbLTEsLTJdLFxuICAgIFsxLC0yXSxcbiAgICBbMiwtMV1cbl07XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnI2ZmZmZmZic7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fZmlsbENvbG9yID0gbnVsbDtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMjU7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl92ZWN0b3JTY2FsZSA9IDE7XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUucGh5c2ljc0JvZHlUeXBlID0gJ2NpcmNsZSc7XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUubnVtRnJhbWVzID0gMTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUubWFwRnJhbWUgPSAwO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS52RnJhbWUgPSAwO1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnZpc2libGVPbk1hcCA9IHRydWU7XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuZ2V0RnJhbWVQb29sID0gZnVuY3Rpb24gKGtleSkge1xuICAgIGlmICghZnJhbWVUZXh0dXJlUG9vbFtrZXldKSB7XG4gICAgICAgIHJldHVybiBmcmFtZVRleHR1cmVQb29sW2tleV0gPSBbXTtcbiAgICB9XG4gICAgcmV0dXJuIGZyYW1lVGV4dHVyZVBvb2xba2V5XTtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuZ2V0TWFwUG9vbCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoIW1hcFRleHR1cmVQb29sW2tleV0pIHtcbiAgICAgICAgbWFwVGV4dHVyZVBvb2xba2V5XSA9IHRoaXMuZ2FtZS5hZGQucmVuZGVyVGV4dHVyZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbWFwVGV4dHVyZVBvb2xba2V5XTtcbn1cblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5zZXRTaGFwZSA9IGZ1bmN0aW9uIChzaGFwZSkge1xuICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcbiAgICB0aGlzLnVwZGF0ZVRleHR1cmVzKCk7XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnNldExpbmVTdHlsZSA9IGZ1bmN0aW9uIChjb2xvciwgbGluZVdpZHRoKSB7XG4gICAgaWYgKCFsaW5lV2lkdGggfHwgbGluZVdpZHRoIDwgMSkge1xuICAgICAgICBsaW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aCB8fCAxO1xuICAgIH1cbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgdGhpcy5saW5lV2lkdGggPSBsaW5lV2lkdGg7XG4gICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgY2FjaGVkIGJpdG1hcHMgZm9yIG9iamVjdCBhZnRlciB2ZWN0b3IgcHJvcGVydGllcyBjaGFuZ2VcbiAqL1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGVUZXh0dXJlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBEcmF3IGZ1bGwgc2l6ZWRcbiAgICBpZiAodGhpcy5udW1GcmFtZXMgPT09IDEpIHtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5jbGVhcigpO1xuICAgICAgICB0aGlzLmdyYXBoaWNzLl9jdXJyZW50Qm91bmRzID0gbnVsbDtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmRyYXdQcm9jZWR1cmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdQcm9jZWR1cmUoMSwgMCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaGFwZSkge1xuICAgICAgICAgICAgdGhpcy5kcmF3KDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5mcmFtZXNbMF0pIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzWzBdID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvdW5kcyA9IHRoaXMuZ3JhcGhpY3MuZ2V0TG9jYWxCb3VuZHMoKTtcbiAgICAgICAgdGhpcy5mcmFtZXNbMF0ucmVzaXplKGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZnJhbWVzWzBdLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIC1ib3VuZHMueCwgLWJvdW5kcy55LCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubnVtRnJhbWVzOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuX2N1cnJlbnRCb3VuZHMgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5kcmF3UHJvY2VkdXJlKDEsIGkpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmZyYW1lc1tpXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVzW2ldID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib3VuZHMgPSB0aGlzLmdyYXBoaWNzLmdldExvY2FsQm91bmRzKCk7XG4gICAgICAgICAgICB0aGlzLmZyYW1lc1tpXS5yZXNpemUoYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0LCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzW2ldLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIC1ib3VuZHMueCwgLWJvdW5kcy55LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldFRleHR1cmUodGhpcy5mcmFtZXNbdGhpcy52RnJhbWVdKTtcbiAgICAvLyBEcmF3IHNtYWxsIGZvciBtaW5pbWFwXG4gICAgaWYgKHRoaXMubWluaXNwcml0ZSkge1xuICAgICAgICB2YXIgbWFwU2NhbGUgPSB0aGlzLmdhbWUubWluaW1hcC5tYXBTY2FsZTtcbiAgICAgICAgdmFyIG1hcEZhY3RvciA9IHRoaXMubWFwRmFjdG9yIHx8IDE7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5fY3VycmVudEJvdW5kcyA9IG51bGw7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5kcmF3UHJvY2VkdXJlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpcy5kcmF3UHJvY2VkdXJlKG1hcFNjYWxlICogbWFwRmFjdG9yLCB0aGlzLm1hcEZyYW1lKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNoYXBlKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXcobWFwU2NhbGUgKiBtYXBGYWN0b3IpO1xuICAgICAgICB9XG4gICAgICAgIGJvdW5kcyA9IHRoaXMuZ3JhcGhpY3MuZ2V0TG9jYWxCb3VuZHMoKTtcbiAgICAgICAgdGhpcy5taW5pdGV4dHVyZS5yZXNpemUoYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0LCB0cnVlKTtcbiAgICAgICAgdGhpcy5taW5pdGV4dHVyZS5yZW5kZXJYWSh0aGlzLmdyYXBoaWNzLCAtYm91bmRzLngsIC1ib3VuZHMueSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMubWluaXNwcml0ZS5zZXRUZXh0dXJlKHRoaXMubWluaXRleHR1cmUpO1xuICAgIH1cbiAgICB0aGlzLl9kaXJ0eSA9IGZhbHNlO1xufTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGVCb2R5ID0gZnVuY3Rpb24gKCkge1xuICAgIHN3aXRjaCAodGhpcy5waHlzaWNzQm9keVR5cGUpIHtcbiAgICAgICAgY2FzZSBcImNpcmNsZVwiOlxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNpcmNsZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgciA9IHRoaXMuZ3JhcGhpY3MuZ2V0Qm91bmRzKCk7XG4gICAgICAgICAgICAgICAgdmFyIHJhZGl1cyA9IE1hdGgucm91bmQoTWF0aC5zcXJ0KHIud2lkdGgqIHIuaGVpZ2h0KS8yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmFkaXVzID0gdGhpcy5yYWRpdXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJvZHkuc2V0Q2lyY2xlKHJhZGl1cyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gVE9ETzogTW9yZSBzaGFwZXNcbiAgICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB2ZWN0b3IgdG8gYml0bWFwIG9mIGdyYXBoaWNzIG9iamVjdCBhdCBnaXZlbiBzY2FsZVxuICpcbiAqIEBwYXJhbSByZW5kZXJTY2FsZSB7bnVtYmVyfSAtIHNjYWxlIGZhY3RvciBmb3IgcmVuZGVyXG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChyZW5kZXJTY2FsZSkge1xuICAgIHJlbmRlclNjYWxlID0gcmVuZGVyU2NhbGUgfHwgMTtcbiAgICAvLyBEcmF3IHNpbXBsZSBzaGFwZSwgaWYgZ2l2ZW5cbiAgICBpZiAodGhpcy5zaGFwZSkge1xuICAgICAgICB2YXIgbGluZUNvbG9yID0gUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMubGluZUNvbG9yKTtcbiAgICAgICAgaWYgKHJlbmRlclNjYWxlID09PSAxKSB7XG4gICAgICAgICAgICB2YXIgbGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaW5lV2lkdGggPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICgocmVuZGVyU2NhbGUgPT09IDEpICYmIHRoaXMuZmlsbENvbG9yKSB7ICAgICAgICAvLyBPbmx5IGZpbGwgZnVsbCBzaXplZFxuICAgICAgICAgICAgdmFyIGZpbGxDb2xvciA9IFBoYXNlci5Db2xvci5oZXhUb1JHQih0aGlzLmZpbGxDb2xvcik7XG4gICAgICAgICAgICB2YXIgZmlsbEFscGhhID0gdGhpcy5maWxsQWxwaGEgfHwgMTtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuYmVnaW5GaWxsKGZpbGxDb2xvciwgZmlsbEFscGhhKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVTdHlsZShsaW5lV2lkdGgsIGxpbmVDb2xvciwgMSk7XG4gICAgICAgIHRoaXMuX2RyYXdQb2x5Z29uKHRoaXMuc2hhcGUsIHRoaXMuc2hhcGVDbG9zZWQsIHJlbmRlclNjYWxlKTtcbiAgICAgICAgaWYgKChyZW5kZXJTY2FsZSA9PT0gMSkgJiYgdGhpcy5maWxsQ29sb3IpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuZW5kRmlsbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIERyYXcgZ2VvbWV0cnkgc3BlYywgaWYgZ2l2ZW4sIGJ1dCBvbmx5IGZvciB0aGUgZnVsbCBzaXplZCBzcHJpdGVcbiAgICBpZiAoKHJlbmRlclNjYWxlID09PSAxKSAmJiB0aGlzLmdlb21ldHJ5KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5nZW9tZXRyeS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBnID0gdGhpcy5nZW9tZXRyeVtpXTtcbiAgICAgICAgICAgIHN3aXRjaCAoZy50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcInBvbHlcIjpcbiAgICAgICAgICAgICAgICAgICAgLy8gRklYTUU6IGRlZmF1bHRzIGFuZCBzdHVmZlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmF3UG9seWdvbihnLnBvaW50cywgZy5jbG9zZWQsIHJlbmRlclNjYWxlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIERyYXcgb3BlbiBvciBjbG9zZWQgcG9seWdvbiBhcyBzZXF1ZW5jZSBvZiBsaW5lVG8gY2FsbHNcbiAqXG4gKiBAcGFyYW0gcG9pbnRzIHtBcnJheX0gLSBwb2ludHMgYXMgYXJyYXkgb2YgW3gseV0gcGFpcnNcbiAqIEBwYXJhbSBjbG9zZWQge2Jvb2xlYW59IC0gaXMgcG9seWdvbiBjbG9zZWQ/XG4gKiBAcGFyYW0gcmVuZGVyU2NhbGUge251bWJlcn0gLSBzY2FsZSBmYWN0b3IgZm9yIHJlbmRlclxuICogQHByaXZhdGVcbiAqL1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fZHJhd1BvbHlnb24gPSBmdW5jdGlvbiAocG9pbnRzLCBjbG9zZWQsIHJlbmRlclNjYWxlKSB7XG4gICAgdmFyIHNjID0gdGhpcy5nYW1lLnBoeXNpY3MucDIubXB4aSh0aGlzLnZlY3RvclNjYWxlKSpyZW5kZXJTY2FsZTtcbiAgICBwb2ludHMgPSBwb2ludHMuc2xpY2UoKTtcbiAgICBpZiAoY2xvc2VkKSB7XG4gICAgICAgIHBvaW50cy5wdXNoKHBvaW50c1swXSk7XG4gICAgfVxuICAgIHRoaXMuZ3JhcGhpY3MubW92ZVRvKHBvaW50c1swXVswXSAqIHNjLCBwb2ludHNbMF1bMV0gKiBzYyk7XG4gICAgZm9yICh2YXIgaSA9IDEsIGwgPSBwb2ludHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubGluZVRvKHBvaW50c1tpXVswXSAqIHNjLCBwb2ludHNbaV1bMV0gKiBzYyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBJbnZhbGlkYXRlIGNhY2hlIGFuZCByZWRyYXcgaWYgc3ByaXRlIGlzIG1hcmtlZCBkaXJ0eVxuICovXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fZGlydHkpIHtcbiAgICAgICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbXNQZXJGcmFtZSAmJiAodGhpcy5nYW1lLnRpbWUubm93ID49IHRoaXMuX2xhc3RWRnJhbWUgKyB0aGlzLl9tc1BlckZyYW1lKSkge1xuICAgICAgICB0aGlzLnZGcmFtZSA9ICh0aGlzLnZGcmFtZSArIDEpICUgdGhpcy5udW1GcmFtZXM7XG4gICAgICAgIHRoaXMuc2V0VGV4dHVyZSh0aGlzLmZyYW1lc1t0aGlzLnZGcmFtZV0pO1xuICAgICAgICB0aGlzLl9sYXN0VkZyYW1lID0gdGhpcy5nYW1lLnRpbWUubm93O1xuICAgIH1cbn07XG5cbi8vIFZlY3RvciBwcm9wZXJ0aWVzIGRlZmluZWQgdG8gaGFuZGxlIG1hcmtpbmcgc3ByaXRlIGRpcnR5IHdoZW4gbmVjZXNzYXJ5XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnbGluZUNvbG9yJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGluZUNvbG9yO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7dGhpcy5fbGluZUNvbG9yID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZmlsbENvbG9yJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlsbENvbG9yO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2ZpbGxDb2xvciA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2xpbmVXaWR0aCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpbmVXaWR0aDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9saW5lV2lkdGggPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdmaWxsQWxwaGEnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9maWxsQWxwaGE7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fZmlsbEFscGhhID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnc2hhcGVDbG9zZWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFwZUNsb3NlZDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9zaGFwZUNsb3NlZCA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3ZlY3RvclNjYWxlJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmVjdG9yU2NhbGU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fdmVjdG9yU2NhbGUgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdzaGFwZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NoYXBlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX3NoYXBlID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZ2VvbWV0cnknLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZW9tZXRyeTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9nZW9tZXRyeSA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2RlYWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWFkO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2RlYWQgPSB2YWw7XG4gICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICAgIHRoaXMua2lsbCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXZpdmUoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVmVjdG9yU3ByaXRlO1xuLy9TdGFyY29kZXIuVmVjdG9yU3ByaXRlID0gVmVjdG9yU3ByaXRlOyIsIi8qKlxuICogQ29udHJvbHMuanNcbiAqXG4gKiBWaXJ0dWFsaXplIGFuZCBpbXBsZW1lbnQgcXVldWUgZm9yIGdhbWUgY29udHJvbHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG52YXIgQ29udHJvbHMgPSBmdW5jdGlvbiAoZ2FtZSwgcGFyZW50KSB7XG4gICAgUGhhc2VyLlBsdWdpbi5jYWxsKHRoaXMsIGdhbWUsIHBhcmVudCk7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5QbHVnaW4ucHJvdG90eXBlKTtcbkNvbnRyb2xzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbnRyb2xzO1xuXG5Db250cm9scy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChxdWV1ZSkge1xuICAgIHRoaXMucXVldWUgPSBxdWV1ZTtcbiAgICB0aGlzLmNvbnRyb2xzID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcbiAgICB0aGlzLmNvbnRyb2xzLmZpcmUgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5CKTtcbiAgICB0aGlzLmNvbnRyb2xzLnRyYWN0b3IgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5UKTtcbiAgICB0aGlzLmpveXN0aWNrU3RhdGUgPSB7XG4gICAgICAgIHVwOiBmYWxzZSxcbiAgICAgICAgZG93bjogZmFsc2UsXG4gICAgICAgIGxlZnQ6IGZhbHNlLFxuICAgICAgICByaWdodDogZmFsc2UsXG4gICAgICAgIGZpcmU6IGZhbHNlXG4gICAgfTtcblxuICAgIC8vIEFkZCB2aXJ0dWFsIGpveXN0aWNrIGlmIHBsdWdpbiBpcyBhdmFpbGFibGVcbiAgICBpZiAoUGhhc2VyLlZpcnR1YWxKb3lzdGljaykge1xuICAgICAgICB0aGlzLmpveXN0aWNrID0gdGhpcy5nYW1lLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oUGhhc2VyLlZpcnR1YWxKb3lzdGljayk7XG4gICAgfVxufTtcblxudmFyIHNlcSA9IDA7XG52YXIgdXAgPSBmYWxzZSwgZG93biA9IGZhbHNlLCBsZWZ0ID0gZmFsc2UsIHJpZ2h0ID0gZmFsc2UsIGZpcmUgPSBmYWxzZSwgdHJhY3RvciA9IGZhbHNlO1xuXG5Db250cm9scy5wcm90b3R5cGUuYWRkVmlydHVhbENvbnRyb2xzID0gZnVuY3Rpb24gKHRleHR1cmUpIHtcbiAgICB0ZXh0dXJlID0gdGV4dHVyZSB8fCAnam95c3RpY2snO1xuICAgIHZhciBzY2FsZSA9IDE7ICAgICAgICAgICAgLy8gRklYTUVcbiAgICB0aGlzLnN0aWNrID0gdGhpcy5qb3lzdGljay5hZGRTdGljaygwLCAwLCAxMDAsdGV4dHVyZSk7XG4gICAgLy90aGlzLnN0aWNrLm1vdGlvbkxvY2sgPSBQaGFzZXIuVmlydHVhbEpveXN0aWNrLkhPUklaT05UQUw7XG4gICAgdGhpcy5zdGljay5zY2FsZSA9IHNjYWxlO1xuICAgIC8vdGhpcy5nb2J1dHRvbiA9IHRoaXMuam95c3RpY2suYWRkQnV0dG9uKHggKyAyMDAqc2NhbGUsIHksIHRleHR1cmUsICdidXR0b24xLXVwJywgJ2J1dHRvbjEtZG93bicpO1xuICAgIHRoaXMuZmlyZWJ1dHRvbiA9IHRoaXMuam95c3RpY2suYWRkQnV0dG9uKDAsIDAsIHRleHR1cmUsICdidXR0b24xLXVwJywgJ2J1dHRvbjEtZG93bicpO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbiA9IHRoaXMuam95c3RpY2suYWRkQnV0dG9uKDAsIDAsIHRleHR1cmUsICdidXR0b24yLXVwJywgJ2J1dHRvbjItZG93bicpO1xuICAgIHRoaXMuZmlyZWJ1dHRvbi5zY2FsZSA9IHNjYWxlO1xuICAgIC8vdGhpcy5nb2J1dHRvbi5zY2FsZSA9IHNjYWxlO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5zY2FsZSA9IHNjYWxlO1xuICAgIHRoaXMubGF5b3V0VmlydHVhbENvbnRyb2xzKHNjYWxlKTtcbiAgICB0aGlzLnN0aWNrLm9uTW92ZS5hZGQoZnVuY3Rpb24gKHN0aWNrLCBmLCBmWCwgZlkpIHtcbiAgICAgICAgaWYgKGZYID49IDAuMzUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5yaWdodCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUubGVmdCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGZYIDw9IC0wLjM1KSB7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUucmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5sZWZ0ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5yaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmxlZnQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZlkgPj0gMC4zNSkge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmRvd24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoZlkgPD0gLTAuMzUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudXAgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmRvd24gPSBmYWxzZTs7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudXAgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMuc3RpY2sub25VcC5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUucmlnaHQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gZmFsc2U7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5sZWZ0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gZmFsc2U7XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5maXJlYnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUuZmlyZSA9IHRydWU7XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5maXJlYnV0dG9uLm9uVXAuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmZpcmUgPSBmYWxzZTtcbiAgICB9LCB0aGlzKTtcbiAgICAvL3RoaXMuZ29idXR0b24ub25Eb3duLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gdHJ1ZTtcbiAgICAvL30sIHRoaXMpO1xuICAgIC8vdGhpcy5nb2J1dHRvbi5vblVwLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gZmFsc2U7XG4gICAgLy99LCB0aGlzKTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24ub25Eb3duLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS50cmFjdG9yID0gdHJ1ZTtcbiAgICB9LCB0aGlzKTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24ub25VcC5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudHJhY3RvciA9IGZhbHNlO1xuICAgIH0sIHRoaXMpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLmxheW91dFZpcnR1YWxDb250cm9scyA9IGZ1bmN0aW9uIChzY2FsZSkge1xuICAgIHZhciB5ID0gdGhpcy5nYW1lLmhlaWdodCAtIDEyNSAqIHNjYWxlO1xuICAgIHZhciB3ID0gdGhpcy5nYW1lLndpZHRoO1xuICAgIHRoaXMuc3RpY2sucG9zWCA9IDE1MCAqIHNjYWxlO1xuICAgIHRoaXMuc3RpY2sucG9zWSA9IHk7XG4gICAgdGhpcy5maXJlYnV0dG9uLnBvc1ggPSB3IC0gMjUwICogc2NhbGU7XG4gICAgdGhpcy5maXJlYnV0dG9uLnBvc1kgPSB5O1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5wb3NYID0gdyAtIDEyNSAqIHNjYWxlO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5wb3NZID0geTtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB1cCA9IGRvd24gPSBsZWZ0ID0gcmlnaHQgPSBmYWxzZTtcbiAgICB0aGlzLnF1ZXVlLmxlbmd0aCA9IDA7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUucHJlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFRPRE86IFN1cHBvcnQgb3RoZXIgaW50ZXJhY3Rpb25zL21ldGhvZHNcbiAgICB2YXIgY29udHJvbHMgPSB0aGlzLmNvbnRyb2xzO1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuam95c3RpY2tTdGF0ZTtcbiAgICBpZiAoKHN0YXRlLnVwIHx8IGNvbnRyb2xzLnVwLmlzRG93bikgJiYgIXVwKSB7XG4gICAgICAgIHVwID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndXBfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLnVwICYmICFjb250cm9scy51cC5pc0Rvd24gJiYgdXApIHtcbiAgICAgICAgdXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndXBfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKChzdGF0ZS5kb3duIHx8IGNvbnRyb2xzLmRvd24uaXNEb3duKSAmJiAhZG93bikge1xuICAgICAgICBkb3duID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZG93bl9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghc3RhdGUuZG93biAmJiAhY29udHJvbHMuZG93bi5pc0Rvd24gJiYgZG93bikge1xuICAgICAgICBkb3duID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2Rvd25fcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKChzdGF0ZS5yaWdodCB8fCBjb250cm9scy5yaWdodC5pc0Rvd24pICYmICFyaWdodCkge1xuICAgICAgICByaWdodCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3JpZ2h0X3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS5yaWdodCAmJiAhY29udHJvbHMucmlnaHQuaXNEb3duICYmIHJpZ2h0KSB7XG4gICAgICAgIHJpZ2h0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3JpZ2h0X3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUubGVmdCB8fCBjb250cm9scy5sZWZ0LmlzRG93bikgJiYgIWxlZnQpIHtcbiAgICAgICAgbGVmdCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2xlZnRfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLmxlZnQgJiYgIWNvbnRyb2xzLmxlZnQuaXNEb3duICYmIGxlZnQpIHtcbiAgICAgICAgbGVmdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdsZWZ0X3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUuZmlyZSB8fCBjb250cm9scy5maXJlLmlzRG93bikgJiYgIWZpcmUpIHtcbiAgICAgICAgZmlyZSA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2ZpcmVfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLmZpcmUgJiYgIWNvbnRyb2xzLmZpcmUuaXNEb3duICYmIGZpcmUpIHtcbiAgICAgICAgZmlyZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdmaXJlX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUudHJhY3RvciB8fCBjb250cm9scy50cmFjdG9yLmlzRG93bikgJiYgIXRyYWN0b3IpIHtcbiAgICAgICAgdHJhY3RvciA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3RyYWN0b3JfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKCFzdGF0ZS50cmFjdG9yICYmICFjb250cm9scy50cmFjdG9yLmlzRG93bikgJiYgdHJhY3Rvcikge1xuICAgICAgICB0cmFjdG9yID0gZmFsc2U7Ly9cbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndHJhY3Rvcl9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbn07XG5cbnZhciBhY3Rpb247ICAgICAgICAgICAgIC8vIE1vZHVsZSBzY29wZSB0byBhdm9pZCBhbGxvY2F0aW9uc1xuXG5Db250cm9scy5wcm90b3R5cGUucHJvY2Vzc1F1ZXVlID0gZnVuY3Rpb24gKGNiLCBjbGVhcikge1xuICAgIHZhciBxdWV1ZSA9IHRoaXMucXVldWU7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBxdWV1ZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgYWN0aW9uID0gcXVldWVbaV07XG4gICAgICAgIGlmIChhY3Rpb24uZXhlY3V0ZWQpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNiKGFjdGlvbik7XG4gICAgICAgIGFjdGlvbi5ldGltZSA9IHRoaXMuZ2FtZS50aW1lLm5vdztcbiAgICAgICAgYWN0aW9uLmV4ZWN1dGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGNsZWFyKSB7XG4gICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgfVxufTtcblxuU3RhcmNvZGVyLkNvbnRyb2xzID0gQ29udHJvbHM7XG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xzOyIsIi8qKlxuICogU3luY0NsaWVudC5qc1xuICpcbiAqIFN5bmMgcGh5c2ljcyBvYmplY3RzIHdpdGggc2VydmVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcbnZhciBVUERBVEVfUVVFVUVfTElNSVQgPSA4O1xuXG52YXIgU3luY0NsaWVudCA9IGZ1bmN0aW9uIChnYW1lLCBwYXJlbnQpIHtcbiAgICBQaGFzZXIuUGx1Z2luLmNhbGwodGhpcywgZ2FtZSwgcGFyZW50KTtcbn07XG5cblN5bmNDbGllbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuUGx1Z2luLnByb3RvdHlwZSk7XG5TeW5jQ2xpZW50LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN5bmNDbGllbnQ7XG5cblxuLyoqXG4gKiBJbml0aWFsaXplIHBsdWdpblxuICpcbiAqIEBwYXJhbSBzb2NrZXQge1NvY2tldH0gLSBzb2NrZXQuaW8gc29ja2V0IGZvciBzeW5jIGNvbm5lY3Rpb25cbiAqIEBwYXJhbSBxdWV1ZSB7QXJyYXl9IC0gY29tbWFuZCBxdWV1ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHNvY2tldCwgcXVldWUpIHtcbiAgICAvLyBUT0RPOiBDb3B5IHNvbWUgY29uZmlnIG9wdGlvbnNcbiAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcbiAgICB0aGlzLmNtZFF1ZXVlID0gcXVldWU7XG4gICAgdGhpcy5leHRhbnQgPSB7fTtcbn07XG5cbi8qKlxuICogU3RhcnQgcGx1Z2luXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgc3RhcmNvZGVyID0gdGhpcy5nYW1lLnN0YXJjb2RlcjtcbiAgICB0aGlzLl91cGRhdGVDb21wbGV0ZSA9IGZhbHNlO1xuICAgIC8vIEZJWE1FOiBOZWVkIG1vcmUgcm9idXN0IGhhbmRsaW5nIG9mIERDL1JDXG4gICAgdGhpcy5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5wYXVzZWQgPSB0cnVlO1xuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdyZWNvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5wYXVzZWQgPSBmYWxzZTtcbiAgICB9KTtcbiAgICAvLyBNZWFzdXJlIGNsaWVudC1zZXJ2ZXIgdGltZSBkZWx0YVxuICAgIHRoaXMuc29ja2V0Lm9uKCd0aW1lc3luYycsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHNlbGYuX2xhdGVuY3kgPSBkYXRhIC0gc2VsZi5nYW1lLnRpbWUubm93O1xuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICB2YXIgcmVhbFRpbWUgPSBkYXRhLnI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gZGF0YS5iLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdmFyIHVwZGF0ZSA9IGRhdGEuYltpXTtcbiAgICAgICAgICAgIHZhciBpZCA9IHVwZGF0ZS5pZDtcbiAgICAgICAgICAgIHZhciBzcHJpdGU7XG4gICAgICAgICAgICB1cGRhdGUudGltZXN0YW1wID0gcmVhbFRpbWU7XG4gICAgICAgICAgICBpZiAoc3ByaXRlID0gc2VsZi5leHRhbnRbaWRdKSB7XG4gICAgICAgICAgICAgICAgLy8gRXhpc3Rpbmcgc3ByaXRlIC0gcHJvY2VzcyB1cGRhdGVcbiAgICAgICAgICAgICAgICBzcHJpdGUudXBkYXRlUXVldWUucHVzaCh1cGRhdGUpO1xuICAgICAgICAgICAgICAgIGlmICh1cGRhdGUucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuY29uZmlnKHVwZGF0ZS5wcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNwcml0ZS51cGRhdGVRdWV1ZS5sZW5ndGggPiBVUERBVEVfUVVFVUVfTElNSVQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBOZXcgc3ByaXRlIC0gY3JlYXRlIGFuZCBjb25maWd1cmVcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdOZXcnLCBpZCwgdXBkYXRlLnQpO1xuICAgICAgICAgICAgICAgIHNwcml0ZSA9IHN0YXJjb2Rlci5hZGRCb2R5KHVwZGF0ZS50LCB1cGRhdGUpO1xuICAgICAgICAgICAgICAgIGlmIChzcHJpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNlcnZlcklkID0gaWQ7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZXh0YW50W2lkXSA9IHNwcml0ZTtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlID0gW3VwZGF0ZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDAsIGwgPSBkYXRhLnJtLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaWQgPSBkYXRhLnJtW2ldO1xuICAgICAgICAgICAgaWYgKHNlbGYuZXh0YW50W2lkXSkge1xuICAgICAgICAgICAgICAgIHN0YXJjb2Rlci5yZW1vdmVCb2R5KHNlbGYuZXh0YW50W2lkXSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHNlbGYuZXh0YW50W2lkXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLyoqXG4gKiBTZW5kIHF1ZXVlZCBjb21tYW5kcyB0byBzZXJ2ZXIgYW5kIGludGVycG9sYXRlIG9iamVjdHMgYmFzZWQgb24gdXBkYXRlcyBmcm9tIHNlcnZlclxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl91cGRhdGVDb21wbGV0ZSkge1xuICAgICAgICB0aGlzLl9zZW5kQ29tbWFuZHMoKTtcbiAgICAgICAgdGhpcy5fcHJvY2Vzc1BoeXNpY3NVcGRhdGVzKCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvbXBsZXRlID0gdHJ1ZTtcbiAgICB9XG4gfTtcblxuU3luY0NsaWVudC5wcm90b3R5cGUucG9zdFJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl91cGRhdGVDb21wbGV0ZSA9IGZhbHNlO1xufTtcblxuXG52YXIgYWN0aW9ucyA9IFtdOyAgICAgICAgICAgICAgIC8vIE1vZHVsZSBzY29wZSB0byBhdm9pZCBhbGxvY2F0aW9uc1xudmFyIGFjdGlvbjtcbi8qKlxuICogU2VuZCBxdWV1ZWQgY29tbWFuZHMgdGhhdCBoYXZlIGJlZW4gZXhlY3V0ZWQgdG8gdGhlIHNlcnZlclxuICpcbiAqIEBwcml2YXRlXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLl9zZW5kQ29tbWFuZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgYWN0aW9ucy5sZW5ndGggPSAwO1xuICAgIGZvciAodmFyIGkgPSB0aGlzLmNtZFF1ZXVlLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xuICAgICAgICBhY3Rpb24gPSB0aGlzLmNtZFF1ZXVlW2ldO1xuICAgICAgICBpZiAoYWN0aW9uLmV4ZWN1dGVkKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnVuc2hpZnQoYWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuY21kUXVldWUuc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdkbycsIGFjdGlvbnMpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdzZW5kaW5nIGFjdGlvbnMnLCBhY3Rpb25zKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgaW50ZXJwb2xhdGlvbiAvIHByZWRpY3Rpb24gcmVzb2x1dGlvbiBmb3IgcGh5c2ljcyBib2RpZXNcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5fcHJvY2Vzc1BoeXNpY3NVcGRhdGVzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpbnRlcnBUaW1lID0gdGhpcy5nYW1lLnRpbWUubm93ICsgdGhpcy5fbGF0ZW5jeSAtIHRoaXMuZ2FtZS5zdGFyY29kZXIuY29uZmlnLnJlbmRlckxhdGVuY3k7XG4gICAgdmFyIG9pZHMgPSBPYmplY3Qua2V5cyh0aGlzLmV4dGFudCk7XG4gICAgZm9yICh2YXIgaSA9IG9pZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIHNwcml0ZSA9IHRoaXMuZXh0YW50W29pZHNbaV1dO1xuICAgICAgICB2YXIgcXVldWUgPSBzcHJpdGUudXBkYXRlUXVldWU7XG4gICAgICAgIHZhciBiZWZvcmUgPSBudWxsLCBhZnRlciA9IG51bGw7XG5cbiAgICAgICAgLy8gRmluZCB1cGRhdGVzIGJlZm9yZSBhbmQgYWZ0ZXIgaW50ZXJwVGltZVxuICAgICAgICB2YXIgaiA9IDE7XG4gICAgICAgIHdoaWxlIChxdWV1ZVtqXSkge1xuICAgICAgICAgICAgaWYgKHF1ZXVlW2pdLnRpbWVzdGFtcCA+IGludGVycFRpbWUpIHtcbiAgICAgICAgICAgICAgICBhZnRlciA9IHF1ZXVlW2pdO1xuICAgICAgICAgICAgICAgIGJlZm9yZSA9IHF1ZXVlW2otMV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb25lIC0gd2UncmUgYmVoaW5kLlxuICAgICAgICBpZiAoIWJlZm9yZSAmJiAhYWZ0ZXIpIHtcbiAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPj0gMikgeyAgICAvLyBUd28gbW9zdCByZWNlbnQgdXBkYXRlcyBhdmFpbGFibGU/IFVzZSB0aGVtLlxuICAgICAgICAgICAgICAgIGJlZm9yZSA9IHF1ZXVlW3F1ZXVlLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgICAgIGFmdGVyID0gcXVldWVbcXVldWUubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnTGFnZ2luZycsIG9pZHNbaV0pO1xuICAgICAgICAgICAgfSBlbHNlIHsgICAgICAgICAgICAgICAgICAgIC8vIE5vPyBKdXN0IGJhaWxcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdCYWlsaW5nJywgb2lkc1tpXSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdPaycsIGludGVycFRpbWUsIHF1ZXVlLmxlbmd0aCk7XG4gICAgICAgICAgICBxdWV1ZS5zcGxpY2UoMCwgaiAtIDEpOyAgICAgLy8gVGhyb3cgb3V0IG9sZGVyIHVwZGF0ZXNcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzcGFuID0gYWZ0ZXIudGltZXN0YW1wIC0gYmVmb3JlLnRpbWVzdGFtcDtcbiAgICAgICAgdmFyIHQgPSAoaW50ZXJwVGltZSAtIGJlZm9yZS50aW1lc3RhbXApIC8gc3BhbjtcbiAgICAgICAgLy9pZiAodCA8IDAgfHwgdCA+IDEpIHtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coJ3dlaXJkIHRpbWUnLCB0KTtcbiAgICAgICAgLy99XG4gICAgICAgIHQgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCB0KSk7ICAgICAgICAvLyBGSVhNRTogU3RvcGdhcCBmaXggLSBTaG91bGRuJ3QgbmVlZCB0aGlzXG4gICAgICAgIHNwcml0ZS5zZXRQb3NBbmdsZShsaW5lYXIoYmVmb3JlLngsIGFmdGVyLngsIHQpLCBsaW5lYXIoYmVmb3JlLnksIGFmdGVyLnksIHQpLCBsaW5lYXIoYmVmb3JlLmEsIGFmdGVyLmEsIHQpKTtcbiAgICB9XG59O1xuXG4vLyBIZWxwZXJzXG5cbi8qKlxuICogSW50ZXJwb2xhdGUgYmV0d2VlbiB0d28gcG9pbnRzIHdpdGggaGVybWl0ZSBzcGxpbmVcbiAqIE5CIC0gY3VycmVudGx5IHVudXNlZCBhbmQgcHJvYmFibHkgYnJva2VuXG4gKlxuICogQHBhcmFtIHAwIHtudW1iZXJ9IC0gaW5pdGlhbCB2YWx1ZVxuICogQHBhcmFtIHAxIHtudW1iZXJ9IC0gZmluYWwgdmFsdWVcbiAqIEBwYXJhbSB2MCB7bnVtYmVyfSAtIGluaXRpYWwgc2xvcGVcbiAqIEBwYXJhbSB2MSB7bnVtYmVyfSAtIGZpbmFsIHNsb3BlXG4gKiBAcGFyYW0gdCB7bnVtYmVyfSAtIHBvaW50IG9mIGludGVycG9sYXRpb24gKGJldHdlZW4gMCBhbmQgMSlcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gaW50ZXJwb2xhdGVkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGhlcm1pdGUgKHAwLCBwMSwgdjAsIHYxLCB0KSB7XG4gICAgdmFyIHQyID0gdCp0O1xuICAgIHZhciB0MyA9IHQqdDI7XG4gICAgcmV0dXJuICgyKnQzIC0gMyp0MiArIDEpKnAwICsgKHQzIC0gMip0MiArIHQpKnYwICsgKC0yKnQzICsgMyp0MikqcDEgKyAodDMgLSB0MikqdjE7XG59XG5cbi8qKlxuICogSW50ZXJwb2xhdGUgYmV0d2VlbiB0d28gcG9pbnRzIHdpdGggbGluZWFyIHNwbGluZVxuICpcbiAqIEBwYXJhbSBwMCB7bnVtYmVyfSAtIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSBwMSB7bnVtYmVyfSAtIGZpbmFsIHZhbHVlXG4gKiBAcGFyYW0gdCB7bnVtYmVyfSAtIHBvaW50IG9mIGludGVycG9sYXRpb24gKGJldHdlZW4gMCBhbmQgMSlcbiAqIEBwYXJhbSBzY2FsZSB7bnVtYmVyfSAtIHNjYWxlIGZhY3RvciB0byBub3JtYWxpemUgdW5pdHNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gaW50ZXJwb2xhdGVkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGxpbmVhciAocDAsIHAxLCB0LCBzY2FsZSkge1xuICAgIHNjYWxlID0gc2NhbGUgfHwgMTtcbiAgICByZXR1cm4gcDAgKyAocDEgLSBwMCkqdCpzY2FsZTtcbn1cblxuU3RhcmNvZGVyLlNlcnZlclN5bmMgPSBTeW5jQ2xpZW50O1xubW9kdWxlLmV4cG9ydHMgPSBTeW5jQ2xpZW50OyIsIi8qKlxuICogQm9vdC5qc1xuICpcbiAqIEJvb3Qgc3RhdGUgZm9yIFN0YXJjb2RlclxuICogTG9hZCBhc3NldHMgZm9yIHByZWxvYWQgc2NyZWVuIGFuZCBjb25uZWN0IHRvIHNlcnZlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb250cm9scyA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvQ29udHJvbHMuanMnKTtcbnZhciBTeW5jQ2xpZW50ID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9TeW5jQ2xpZW50LmpzJyk7XG5cbnZhciBCb290ID0gZnVuY3Rpb24gKCkge307XG5cbkJvb3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbkJvb3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQm9vdDtcblxuLy92YXIgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuXG4vKipcbiAqIFNldCBwcm9wZXJ0aWVzIHRoYXQgcmVxdWlyZSBib290ZWQgZ2FtZSBzdGF0ZSwgYXR0YWNoIHBsdWdpbnMsIGNvbm5lY3QgdG8gZ2FtZSBzZXJ2ZXJcbiAqL1xuQm9vdC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdJbml0IEJvb3QnLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQpO1xuICAgIC8vY29uc29sZS5sb2coJ2l3IEJvb3QnLCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0LCBzY3JlZW4ud2lkdGgsIHNjcmVlbi5oZWlnaHQsIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTtcbiAgICAvL3RoaXMuZ2FtZS5zdGFnZS5kaXNhYmxlVmlzaWJpbGl0eUNoYW5nZSA9IHRydWU7XG4gICAgdGhpcy5nYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuUkVTSVpFO1xuICAgIHRoaXMuZ2FtZS5zY2FsZS5vblNpemVDaGFuZ2UuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ21hc3RlciByZXNpemUgQ0InKTtcbiAgICB9KTtcbiAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWU7XG4gICAgdGhpcy5nYW1lLnNoYXJlZEdyYXBoaWNzID0gdGhpcy5nYW1lLm1ha2UuZ3JhcGhpY3MoKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHBTY2FsZSA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5waHlzaWNzU2NhbGU7XG4gICAgdmFyIGlwU2NhbGUgPSAxL3BTY2FsZTtcbiAgICB2YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmNvbmZpZyA9IHtcbiAgICAgICAgcHhtOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGlwU2NhbGUqYTtcbiAgICAgICAgfSxcbiAgICAgICAgbXB4OiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGZsb29yKHBTY2FsZSphKTtcbiAgICAgICAgfSxcbiAgICAgICAgcHhtaTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiAtaXBTY2FsZSphO1xuICAgICAgICB9LFxuICAgICAgICBtcHhpOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGZsb29yKC1wU2NhbGUqYSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuc3RhcmNvZGVyLnNlcnZlckNvbm5lY3QoKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLmNvbnRyb2xzID0gdGhpcy5nYW1lLnBsdWdpbnMuYWRkKENvbnRyb2xzLFxuICAgIC8vICAgIHRoaXMuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICAvL3RoaXMuZ2FtZS5qb3lzdGljayA9IHRoaXMuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihQaGFzZXIuVmlydHVhbEpveXN0aWNrKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLmNvbnRyb2xzID0gdGhpcy5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKENvbnRyb2xzLCB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy8gU2V0IHVwIHNvY2tldC5pbyBjb25uZWN0aW9uXG4gICAgLy90aGlzLnN0YXJjb2Rlci5zb2NrZXQgPSB0aGlzLnN0YXJjb2Rlci5pbyh0aGlzLnN0YXJjb2Rlci5jb25maWcuc2VydmVyVXJpLFxuICAgIC8vICAgIHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5pb0NsaWVudE9wdGlvbnMpO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuc29ja2V0Lm9uKCdzZXJ2ZXIgcmVhZHknLCBmdW5jdGlvbiAocGxheWVyTXNnKSB7XG4gICAgLy8gICAgLy8gRklYTUU6IEhhcyB0byBpbnRlcmFjdCB3aXRoIHNlc3Npb24gZm9yIGF1dGhlbnRpY2F0aW9uIGV0Yy5cbiAgICAvLyAgICBzZWxmLnN0YXJjb2Rlci5wbGF5ZXIgPSBwbGF5ZXJNc2c7XG4gICAgLy8gICAgLy9zZWxmLnN0YXJjb2Rlci5zeW5jY2xpZW50ID0gc2VsZi5nYW1lLnBsdWdpbnMuYWRkKFN5bmNDbGllbnQsXG4gICAgLy8gICAgLy8gICAgc2VsZi5zdGFyY29kZXIuc29ja2V0LCBzZWxmLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy8gICAgc2VsZi5zdGFyY29kZXIuc3luY2NsaWVudCA9IHNlbGYuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihTeW5jQ2xpZW50LFxuICAgIC8vICAgICAgICBzZWxmLnN0YXJjb2Rlci5zb2NrZXQsIHNlbGYuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICAvLyAgICBfY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAvL30pO1xufTtcblxuLyoqXG4gKiBQcmVsb2FkIG1pbmltYWwgYXNzZXRzIGZvciBwcm9ncmVzcyBzY3JlZW5cbiAqL1xuQm9vdC5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnYmFyX2xlZnQnLCAnYXNzZXRzL2ltYWdlcy9ncmVlbkJhckxlZnQucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2Jhcl9taWQnLCAnYXNzZXRzL2ltYWdlcy9ncmVlbkJhck1pZC5wbmcnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnYmFyX3JpZ2h0JywgJ2Fzc2V0cy9pbWFnZXMvZ3JlZW5CYXJSaWdodC5wbmcnKTtcbn07XG5cbi8qKlxuICogS2ljayBpbnRvIG5leHQgc3RhdGUgb25jZSBpbml0aWFsaXphdGlvbiBhbmQgcHJlbG9hZGluZyBhcmUgZG9uZVxuICovXG5Cb290LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdsb2FkZXInKTtcbn07XG5cbi8qKlxuICogQWR2YW5jZSBnYW1lIHN0YXRlIG9uY2UgbmV0d29yayBjb25uZWN0aW9uIGlzIGVzdGFibGlzaGVkXG4gKi9cbi8vQm9vdC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuLy8gICAgLy8gRklYTUU6IGRvbid0IHdhaXQgaGVyZSAtIHNob3VsZCBiZSBpbiBjcmVhdGVcbi8vICAgIGlmICh0aGlzLnN0YXJjb2Rlci5jb25uZWN0ZWQpIHtcbi8vICAgICAgICAvL3RoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnc3BhY2UnKTtcbi8vICAgICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ2xvZ2luJyk7XG4vLyAgICB9XG4vL307XG5cbm1vZHVsZS5leHBvcnRzID0gQm9vdDsiLCIvKipcbiAqIExvYWRlci5qc1xuICpcbiAqIFBoYXNlciBzdGF0ZSB0byBwcmVsb2FkIGFzc2V0cyBhbmQgZGlzcGxheSBwcm9ncmVzc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBMb2FkZXIgPSBmdW5jdGlvbiAoKSB7fTtcblxuTG9hZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG5Mb2FkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTG9hZGVyO1xuXG5Mb2FkZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gSW5pdCBhbmQgZHJhdyBzdGFyZmllbGRcbiAgICB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwLCAnc3RhcmZpZWxkJywgdHJ1ZSk7XG4gICAgdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZCh0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLmdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0LCB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQpO1xuXG4gICAgLy8gUG9zaXRpb24gcHJvZ3Jlc3MgYmFyXG4gICAgdmFyIGJhcldpZHRoID0gTWF0aC5mbG9vcigwLjQgKiB0aGlzLmdhbWUud2lkdGgpO1xuICAgIHZhciBvcmlnaW5YID0gKHRoaXMuZ2FtZS53aWR0aCAtIGJhcldpZHRoKS8yO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5nYW1lLmFkZC5pbWFnZShvcmlnaW5YLCB0aGlzLmdhbWUud29ybGQuY2VudGVyWSwgJ2Jhcl9sZWZ0Jyk7XG4gICAgbGVmdC5hbmNob3Iuc2V0VG8oMCwgMC41KTtcbiAgICB2YXIgbWlkID0gdGhpcy5nYW1lLmFkZC5pbWFnZShvcmlnaW5YICsgbGVmdC53aWR0aCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclksICdiYXJfbWlkJyk7XG4gICAgbWlkLmFuY2hvci5zZXRUbygwLCAwLjUpO1xuICAgIHZhciByaWdodCA9IHRoaXMuZ2FtZS5hZGQuaW1hZ2Uob3JpZ2luWCArIGxlZnQud2lkdGgsIHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJZLCAnYmFyX3JpZ2h0Jyk7XG4gICAgcmlnaHQuYW5jaG9yLnNldFRvKDAsIDAuNSk7XG4gICAgdmFyIG1pZFdpZHRoID0gYmFyV2lkdGggLSAyICogbGVmdC53aWR0aDtcbiAgICBtaWQud2lkdGggPSAwO1xuICAgIHZhciBsb2FkaW5nVGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dCh0aGlzLmdhbWUud29ybGQuY2VudGVyWCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclkgLSAzNiwgJ0xvYWRpbmcuLi4nLFxuICAgICAgICB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2ZmZmZmZicsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIGxvYWRpbmdUZXh0LmFuY2hvci5zZXRUbygwLjUpO1xuICAgIHZhciBwcm9nVGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dChvcmlnaW5YICsgbGVmdC53aWR0aCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclksICcwJScsXG4gICAgICAgIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmZmZmZmJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgcHJvZ1RleHQuYW5jaG9yLnNldFRvKDAuNSk7XG5cbiAgICB0aGlzLmdhbWUubG9hZC5vbkZpbGVDb21wbGV0ZS5hZGQoZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgIHZhciB3ID0gTWF0aC5mbG9vcihtaWRXaWR0aCAqIHByb2dyZXNzIC8gMTAwKTtcbiAgICAgICAgbWlkLndpZHRoID0gdztcbiAgICAgICAgcmlnaHQueCA9IG1pZC54ICsgdztcbiAgICAgICAgcHJvZ1RleHQuc2V0VGV4dChwcm9ncmVzcyArICclJyk7XG4gICAgICAgIHByb2dUZXh0LnggPSBtaWQueCArIHcvMjtcbiAgICB9LCB0aGlzKTtcbn07XG5cbkxvYWRlci5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPOiBIRCBhbmQgU0QgdmVyc2lvbnNcbiAgICAvLyBGb250c1xuICAgIHRoaXMuZ2FtZS5sb2FkLmJpdG1hcEZvbnQoJ3RpdGxlLWZvbnQnLFxuICAgICAgICAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC5wbmcnLCAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC54bWwnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KCdyZWFkb3V0LXllbGxvdycsXG4gICAgICAgICdhc3NldHMvYml0bWFwZm9udHMvaGVhdnkteWVsbG93MjQucG5nJywgJ2Fzc2V0cy9iaXRtYXBmb250cy9oZWF2eS15ZWxsb3cyNC54bWwnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygncGxheWVydGhydXN0JywgJ2Fzc2V0cy9zb3VuZHMvdGhydXN0TG9vcC5vZ2cnKTtcbiAgICAvLyBTb3VuZHNcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnY2hpbWUnLCAnYXNzZXRzL3NvdW5kcy9jaGltZS5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnbGV2ZWx1cCcsICdhc3NldHMvc291bmRzL2xldmVsdXAub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ3BsYW50dHJlZScsICdhc3NldHMvc291bmRzL3BsYW50dHJlZS5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnYmlncG9wJywgJ2Fzc2V0cy9zb3VuZHMvYmlncG9wLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdsaXR0bGVwb3AnLCAnYXNzZXRzL3NvdW5kcy9saXR0bGVwb3Aub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ3RhZ2dlZCcsICdhc3NldHMvc291bmRzL3RhZ2dlZC5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnbGFzZXInLCAnYXNzZXRzL3NvdW5kcy9sYXNlci5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnbXVzaWMnLCAnYXNzZXRzL3NvdW5kcy9pZ25vcmUub2dnJyk7XG4gICAgLy8gU3ByaXRlc2hlZXRzXG4gICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoJ2pveXN0aWNrJywgJ2Fzc2V0cy9qb3lzdGljay9nZW5lcmljLWpveXN0aWNrLnBuZycsICdhc3NldHMvam95c3RpY2svZ2VuZXJpYy1qb3lzdGljay5qc29uJyk7XG4gICAgLy8gSW1hZ2VzXG5cbn07XG5cbkxvYWRlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXJjb2Rlci5jb25uZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdzcGFjZScpO1xuICAgICAgICAvL3RoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnbG9naW4nKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRlcjsiLCIvKipcbiAqIExvZ2luLmpzXG4gKlxuICogU3RhdGUgZm9yIGRpc3BsYXlpbmcgbG9naW4gc2NyZWVuLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBMb2dpbiA9IGZ1bmN0aW9uICgpIHt9O1xuXG5Mb2dpbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuTG9naW4ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTG9naW47XG5cbkxvZ2luLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLnN0YXJjb2Rlci5zaG93TG9naW4oKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zb2NrZXQub24oJ2xvZ2dlZCBpbicsIGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgc2VsZi5zdGFyY29kZXIuaGlkZUxvZ2luKCk7XG4gICAgICAgIHNlbGYuc3RhcmNvZGVyLnBsYXllciA9IHBsYXllcjtcbiAgICAgICAgc2VsZi5nYW1lLnN0YXRlLnN0YXJ0KCdzcGFjZScpO1xuICAgIH0pO1xuICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldC5vbignbG9naW4gZmFpbHVyZScsIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICBzZWxmLnN0YXJjb2Rlci5zZXRMb2dpbkVycm9yKGVycm9yKTtcbiAgICB9KTtcbn07XG5cbi8vTG9naW4ucHJvdG90eXBlLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KCd0aXRsZS1mb250Jyxcbi8vICAgICAgICAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC5wbmcnLCAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC54bWwnKTtcbi8vfTtcblxuLy9Mb2dpbi5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gKHcsIGgpIHtcbi8vICAgIGNvbnNvbGUubG9nKCdycyBMb2dpbicsIHcsIGgpO1xuLy99O1xuXG5Mb2dpbi5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vdmFyIHN0YXJmaWVsZCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEoNjAwLCA2MDApO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZCh0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwLCAnc3RhcmZpZWxkJywgdHJ1ZSk7XG4gICAgdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZCh0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLmdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0LCB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQpO1xuICAgIHZhciB0aXRsZSA9IHRoaXMuZ2FtZS5hZGQuYml0bWFwVGV4dCh0aGlzLmdhbWUud29ybGQuY2VudGVyWCwgMTI4LCAndGl0bGUtZm9udCcsICdTVEFSQ09ERVInKTtcbiAgICB0aXRsZS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2dpbjtcbiIsIi8qKlxuICogU3BhY2UuanNcbiAqXG4gKiBNYWluIGdhbWUgc3RhdGUgZm9yIFN0YXJjb2RlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9TaW1wbGVQYXJ0aWNsZS5qcycpO1xudmFyIFRocnVzdEdlbmVyYXRvciA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9UaHJ1c3RHZW5lcmF0b3IuanMnKTtcbnZhciBNaW5pTWFwID0gcmVxdWlyZSgnLi4vcGhhc2VydWkvTWluaU1hcC5qcycpO1xudmFyIExlYWRlckJvYXJkID0gcmVxdWlyZSgnLi4vcGhhc2VydWkvTGVhZGVyQm9hcmQuanMnKTtcbnZhciBUb2FzdCA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9Ub2FzdC5qcycpO1xudmFyIEhVRCA9IHJlcXVpcmUoJy4uL3BoYXNlcnVpL0hVRC5qcycpO1xuXG52YXIgQ29udHJvbHMgPSByZXF1aXJlKCcuLi9waGFzZXJwbHVnaW5zL0NvbnRyb2xzLmpzJyk7XG52YXIgU3luY0NsaWVudCA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvU3luY0NsaWVudC5qcycpO1xuXG52YXIgU3BhY2UgPSBmdW5jdGlvbiAoKSB7fTtcblxuU3BhY2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcblNwYWNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNwYWNlO1xuXG5TcGFjZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnN0YXJjb2Rlci5jb250cm9scyA9IHRoaXMuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihDb250cm9scywgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIHRoaXMuc3RhcmNvZGVyLnN5bmNjbGllbnQgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oU3luY0NsaWVudCxcbiAgICAgICAgdGhpcy5zdGFyY29kZXIuc29ja2V0LCB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgdGhpcy5zdGFnZS5kaXNhYmxlVmlzaWJpbGl0eUNoYW5nZSA9IHRydWU7XG59O1xuXG5TcGFjZS5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUodGhpcy5nYW1lLCBUaHJ1c3RHZW5lcmF0b3IudGV4dHVyZUtleSwgJyNmZjY2MDAnLCA4KTtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUodGhpcy5nYW1lLCAnYnVsbGV0JywgJyM5OTk5OTknLCA0KTtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUodGhpcy5nYW1lLCAndHJhY3RvcicsICcjZWVlZWVlJywgOCwgdHJ1ZSk7XG4gICAgLy90aGlzLmdhbWUubG9hZC5hdWRpbygncGxheWVydGhydXN0JywgJ2Fzc2V0cy9zb3VuZHMvdGhydXN0TG9vcC5vZ2cnKTtcbiAgICAvL3RoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdjaGltZScsICdhc3NldHMvc291bmRzL2NoaW1lLm1wMycpO1xuICAgIC8vdGhpcy5nYW1lLmxvYWQuYXRsYXMoJ2pveXN0aWNrJywgJ2Fzc2V0cy9qb3lzdGljay9nZW5lcmljLWpveXN0aWNrLnBuZycsICdhc3NldHMvam95c3RpY2svZ2VuZXJpYy1qb3lzdGljay5qc29uJyk7XG4gICAgLy90aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KCdyZWFkb3V0LXllbGxvdycsXG4gICAgLy8gICAgJ2Fzc2V0cy9iaXRtYXBmb250cy9oZWF2eS15ZWxsb3cyNC5wbmcnLCAnYXNzZXRzL2JpdG1hcGZvbnRzL2hlYXZ5LXllbGxvdzI0LnhtbCcpO1xufTtcblxuU3BhY2UucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnU3BhY2Ugc2l6ZScsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIDEpO1xuICAgIC8vY29uc29sZS5sb2coJ2NyZWF0ZScpO1xuICAgIC8vdmFyIHJuZyA9IHRoaXMuZ2FtZS5ybmQ7XG4gICAgdmFyIHdiID0gdGhpcy5zdGFyY29kZXIuY29uZmlnLndvcmxkQm91bmRzO1xuICAgIHZhciBwcyA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5waHlzaWNzU2NhbGU7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuUDJKUyk7XG4gICAgdGhpcy53b3JsZC5zZXRCb3VuZHMuY2FsbCh0aGlzLndvcmxkLCB3YlswXSpwcywgd2JbMV0qcHMsICh3YlsyXS13YlswXSkqcHMsICh3YlszXS13YlsxXSkqcHMpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLnAyLnNldEJvdW5kc1RvV29ybGQodHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgLy8gRGVidWdnaW5nXG4gICAgLy90aGlzLmdhbWUudGltZS5hZHZhbmNlZFRpbWluZyA9IHRydWU7XG5cbiAgICAvLyBTZXQgdXAgRE9NXG4gICAgLy90aGlzLnN0YXJjb2Rlci5sYXlvdXRET01TcGFjZVN0YXRlKCk7XG5cbiAgICB0aGlzLnN0YXJjb2Rlci5jb250cm9scy5yZXNldCgpO1xuXG4gICAgLy8gVmlydHVhbCBqb3lzdGlja1xuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzLmFkZFZpcnR1YWxDb250cm9scygnam95c3RpY2snKTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMgPSB7fTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuc3RpY2sgPSB0aGlzLmdhbWUuam95c3RpY2suYWRkU3RpY2soXG4gICAgLy8gICAgdGhpcy5nYW1lLndpZHRoIC0gMTUwLCB0aGlzLmdhbWUuaGVpZ2h0IC0gNzUsIDEwMCwgJ2pveXN0aWNrJyk7XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzLnN0aWNrLnNjYWxlID0gMC41O1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5maXJlYnV0dG9uID0gdGhpcy5nYW1lLmpveXN0aWNrLmFkZEJ1dHRvbih0aGlzLmdhbWUud2lkdGggLSA1MCwgdGhpcy5nYW1lLmhlaWdodCAtIDc1LFxuICAgIC8vICAgICdqb3lzdGljaycsICdidXR0b24xLXVwJywgJ2J1dHRvbjEtZG93bicpO1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5maXJlYnV0dG9uLnNjYWxlID0gMC41O1xuXG4gICAgLy8gU291bmRzXG4gICAgdGhpcy5nYW1lLnNvdW5kcyA9IHt9O1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0ID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgncGxheWVydGhydXN0JywgMSwgdHJ1ZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5jaGltZSA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ2NoaW1lJywgMSwgZmFsc2UpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxhbnR0cmVlID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgncGxhbnR0cmVlJywgMSwgZmFsc2UpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMuYmlncG9wID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgnYmlncG9wJywgMSwgZmFsc2UpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMubGl0dGxlcG9wID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgnbGl0dGxlcG9wJywgMSwgZmFsc2UpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMudGFnZ2VkID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgndGFnZ2VkJywgMSwgZmFsc2UpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMubGFzZXIgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdsYXNlcicsIDEsIGZhbHNlKTtcblxuICAgIHRoaXMuZ2FtZS5zb3VuZHMubXVzaWMgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdtdXNpYycsIDEsIHRydWUpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMubXVzaWMucGxheSgpO1xuXG4gICAgLy8gQmFja2dyb3VuZFxuICAgIC8vdmFyIHN0YXJmaWVsZCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEoNjAwLCA2MDApO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZChzdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwLCAnc3RhcmZpZWxkJywgdHJ1ZSk7XG4gICAgdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZCh0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLmdhbWUuYWRkLnRpbGVTcHJpdGUod2JbMF0qcHMsIHdiWzFdKnBzLCAod2JbMl0td2JbMF0pKnBzLCAod2JbM10td2JbMV0pKnBzLCB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQpO1xuXG4gICAgdGhpcy5zdGFyY29kZXIuc3luY2NsaWVudC5zdGFydCgpO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuc29ja2V0LmVtaXQoJ2NsaWVudCByZWFkeScpO1xuICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldC5lbWl0KCdyZWFkeScpO1xuICAgIHRoaXMuX3NldHVwTWVzc2FnZUhhbmRsZXJzKHRoaXMuc3RhcmNvZGVyLnNvY2tldCk7XG5cbiAgICAvLyBHcm91cHMgZm9yIHBhcnRpY2xlIGVmZmVjdHNcbiAgICB0aGlzLmdhbWUudGhydXN0Z2VuZXJhdG9yID0gbmV3IFRocnVzdEdlbmVyYXRvcih0aGlzLmdhbWUpO1xuXG4gICAgLy8gR3JvdXAgZm9yIGdhbWUgb2JqZWN0c1xuICAgIHRoaXMuZ2FtZS5wbGF5ZmllbGQgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAvLyBVSVxuICAgIHRoaXMuZ2FtZS51aSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLmdhbWUudWkuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG5cbiAgICAvLyBJbnZlbnRvcnkgLSB0aW5rZXIgd2l0aCBwb3NpdGlvblxuICAgIC8vdmFyIGxhYmVsID0gdGhpcy5nYW1lLm1ha2UudGV4dCh0aGlzLmdhbWUud2lkdGggLyAyLCAyNSwgJ0lOVkVOVE9SWScsXG4gICAgLy8gICAge2ZvbnQ6ICcyNHB4IEFyaWFsJywgZmlsbDogJyNmZjk5MDAnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICAvL2xhYmVsLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgLy90aGlzLmdhbWUudWkuYWRkKGxhYmVsKTtcbiAgICAvL3RoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0ID0gdGhpcy5nYW1lLm1ha2UudGV4dCh0aGlzLmdhbWUud2lkdGggLSAxMDAsIDUwLCAnMCBjcnlzdGFscycsXG4gICAgLy8gICAge2ZvbnQ6ICcyNHB4IEFyaWFsJywgZmlsbDogJyNjY2MwMDAnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICAvL3RoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0ID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwVGV4dCgyMDAwLCA1MCwgJ3JlYWRvdXQteWVsbG93JywgJzAnKTtcbiAgICAvL3RoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0LmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgLy90aGlzLmdhbWUudWkuYWRkKHRoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0KTtcbiAgICB0aGlzLmdhbWUuaHVkID0gbmV3IEhVRCh0aGlzLmdhbWUsICh0aGlzLmdhbWUud2lkdGggLSAxODApLyAyLCAyLCAxODAsIDEyMCk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZCh0aGlzLmdhbWUuaHVkKTtcbiAgICAvL3RoaXMuZ2FtZS5odWQuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG5cbiAgICAvLyBNaW5pTWFwXG4gICAgdGhpcy5nYW1lLm1pbmltYXAgPSBuZXcgTWluaU1hcCh0aGlzLmdhbWUsIDMwMCwgMzAwKTtcbiAgICB0aGlzLmdhbWUudWkuYWRkKHRoaXMuZ2FtZS5taW5pbWFwKTtcbiAgICB0aGlzLmdhbWUubWluaW1hcC54ID0gMTA7XG4gICAgdGhpcy5nYW1lLm1pbmltYXAueSA9IDEwO1xuXG4gICAgLy8gTGVhZGVyYm9hcmRcbiAgICB0aGlzLmdhbWUubGVhZGVyYm9hcmQgPSBuZXcgTGVhZGVyQm9hcmQodGhpcy5nYW1lLCB0aGlzLnN0YXJjb2Rlci5wbGF5ZXJNYXAsIDIwMCwgMzAwKTtcbiAgICB0aGlzLmdhbWUudWkuYWRkKHRoaXMuZ2FtZS5sZWFkZXJib2FyZCk7XG4gICAgdGhpcy5nYW1lLmxlYWRlcmJvYXJkLnggPSB0aGlzLmdhbWUud2lkdGggLSAyMDA7XG4gICAgdGhpcy5nYW1lLmxlYWRlcmJvYXJkLnkgPSAwO1xuICAgIHRoaXMuZ2FtZS5sZWFkZXJib2FyZC52aXNpYmxlID0gZmFsc2U7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG59O1xuXG5TcGFjZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEZJWE1FOiBqdXN0IGEgbWVzcyBmb3IgdGVzdGluZ1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLnN0YXJjb2Rlci5jb250cm9scy5wcm9jZXNzUXVldWUoZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgaWYgKGEudHlwZSA9PT0gJ3VwX3ByZXNzZWQnKSB7XG4gICAgICAgICAgICBzZWxmLmdhbWUucGxheWVyU2hpcC5sb2NhbFN0YXRlLnRocnVzdCA9ICdzdGFydGluZyc7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnBsYXkoKTtcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnRocnVzdGdlbmVyYXRvci5zdGFydE9uKHNlbGYuZ2FtZS5wbGF5ZXJTaGlwKTtcbiAgICAgICAgfSBlbHNlIGlmIChhLnR5cGUgPT09ICd1cF9yZWxlYXNlZCcpIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLmxvY2FsU3RhdGUudGhydXN0ID0gJ3NodXRkb3duJztcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3Quc3RvcCgpO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUudGhydXN0Z2VuZXJhdG9yLnN0b3BPbihzZWxmLmdhbWUucGxheWVyU2hpcCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cblNwYWNlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy9jb25zb2xlLmxvZygnK3JlbmRlcisnKTtcbiAgICAvL2lmICh0aGlzLnN0YXJjb2Rlci50ZW1wc3ByaXRlKSB7XG4gICAgLy8gICAgdmFyIGQgPSB0aGlzLnN0YXJjb2Rlci50ZW1wc3ByaXRlLnBvc2l0aW9uLnggLSB0aGlzLnN0YXJjb2Rlci50ZW1wc3ByaXRlLnByZXZpb3VzUG9zaXRpb24ueDtcbiAgICAvLyAgICBjb25zb2xlLmxvZygnRGVsdGEnLCBkLCB0aGlzLmdhbWUudGltZS5lbGFwc2VkLCBkIC8gdGhpcy5nYW1lLnRpbWUuZWxhcHNlZCk7XG4gICAgLy99XG4gICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcbiAgICAvL3RoaXMuZ2FtZS5kZWJ1Zy50ZXh0KCdGcHM6ICcgKyB0aGlzLmdhbWUudGltZS5mcHMsIDUsIDIwKTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuc3RpY2suZGVidWcodHJ1ZSwgdHJ1ZSk7XG4gICAgLy90aGlzLmdhbWUuZGVidWcuY2FtZXJhSW5mbyh0aGlzLmdhbWUuY2FtZXJhLCAxMDAsIDIwKTtcbiAgICAvL2lmICh0aGlzLnNoaXApIHtcbiAgICAvLyAgICB0aGlzLmdhbWUuZGVidWcuc3ByaXRlSW5mbyh0aGlzLnNoaXAsIDQyMCwgMjApO1xuICAgIC8vfVxufTtcblxuU3BhY2UucHJvdG90eXBlLl9zZXR1cE1lc3NhZ2VIYW5kbGVycyA9IGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc29ja2V0Lm9uKCdtc2cgY3J5c3RhbCBwaWNrdXAnLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMuY2hpbWUucGxheSgpO1xuICAgICAgICBUb2FzdC5zcGluVXAoc2VsZi5nYW1lLCBzZWxmLmdhbWUucGxheWVyU2hpcC54LCBzZWxmLmdhbWUucGxheWVyU2hpcC55LCAnKycgKyB2YWwgKyAnIGNyeXN0YWxzIScpO1xuICAgIH0pO1xuICAgIHNvY2tldC5vbignbXNnIHBsYW50IHRyZWUnLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMucGxhbnR0cmVlLnBsYXkoKTtcbiAgICB9KTtcbiAgICBzb2NrZXQub24oJ21zZyBhc3Rlcm9pZCBwb3AnLCBmdW5jdGlvbiAoc2l6ZSkge1xuICAgICAgICBpZiAoc2l6ZSA+IDEpIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMuYmlncG9wLnBsYXkoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMubGl0dGxlcG9wLnBsYXkoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHNvY2tldC5vbignbXNnIHRhZ2dlZCcsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy50YWdnZWQucGxheSgpO1xuICAgIH0pO1xuICAgIHNvY2tldC5vbignbXNnIGxhc2VyJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBzZWxmLmdhbWUuc291bmRzLmxhc2VyLnBsYXkoKTtcbiAgICB9KTtcbiAgICBzb2NrZXQub24oJ211c2ljJywgZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gJ29uJykge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5tdXNpYy5yZXN1bWUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMubXVzaWMucGF1c2UoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGFjZTtcbiIsIi8qKlxuICogSFVELmpzXG4gKlxuICogRGlzcGxheSBmb3IgaW52ZW50b3J5IGFuZCBzdGF0dXNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcbnZhciBCdWxsZXQgPSByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvQnVsbGV0LmpzJyk7XG5cbnZhciBIVUQgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgIFBoYXNlci5HcmFwaGljcy5jYWxsKHRoaXMsIGdhbWUsIHgsIHkpO1xuICAgIHRoaXMubGF5b3V0KHdpZHRoLCBoZWlnaHQpO1xufTtcblxuSFVELnByb3RvdHlwZSA9IFBoYXNlci5HcmFwaGljcy5wcm90b3R5cGU7XG5IVUQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSFVEO1xuXG5IVUQucHJvdG90eXBlLmxheW91dCA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIHh1bml0ID0gTWF0aC5mbG9vcih3aWR0aCAvIDE4KTtcbiAgICB2YXIgeXVuaXQgPSBNYXRoLmZsb29yKGhlaWdodCAvIDgpO1xuICAgIC8vIE91dGxpbmVcbiAgICB0aGlzLmxpbmVTdHlsZSgyLCAweGNjY2NjYywgMS4wKTtcbiAgICAvLyBDcm9zc2xpbmVcbiAgICB0aGlzLm1vdmVUbygwLCA0ICogeXVuaXQpO1xuICAgIHRoaXMubGluZVRvKHdpZHRoLCA0ICogeXVuaXQpO1xuICAgIHRoaXMuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgLy8gQ29kZSBBcmVhXG4gICAgdGhpcy5jb2RldGV4dCA9IHRoaXMuZ2FtZS5zdGFyY29kZXIubWFrZUZsZXhUZXh0KHh1bml0ICogOSwgeXVuaXQgKiAyLCAnQ09ERScsXG4gICAgICAgIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmY5OTAwJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgdGhpcy5jb2RldGV4dC5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuY29kZXRleHQuaW5wdXRFbmFibGVkID0gdHJ1ZTtcbiAgICB0aGlzLmNvZGV0ZXh0LmV2ZW50cy5vbklucHV0RG93bi5hZGQodGhpcy5nYW1lLnN0YXJjb2Rlci50b2dnbGVDb2RlV2luZG93LCB0aGlzLmdhbWUuc3RhcmNvZGVyKTtcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMuY29kZXRleHQpO1xuICAgIC8vIEludmVudG9yeSBhcmVhXG4gICAgLy8gQ3J5c3RhbCBpY29uXG4gICAgdGhpcy5saW5lU3R5bGUoMSwgMHgwMGZmZmYsIDEuMCk7XG4gICAgdGhpcy5kcmF3UG9seWdvbihQYXRocy5ub3JtYWxpemUoUGF0aHMub2N0YWdvbiwgNSwgeHVuaXQgKiAyLCB5dW5pdCAqIDUsIHRydWUpKTtcbiAgICB0aGlzLmRyYXdQb2x5Z29uKFBhdGhzLm5vcm1hbGl6ZShQYXRocy5kMmNyb3NzLCA1LCB4dW5pdCAqIDIsIHl1bml0ICogNSwgdHJ1ZSkpO1xuICAgIC8vIEFtb3VudFxuICAgIC8vdGhpcy5jcnlzdGFsdGV4dCA9IHRoaXMuZ2FtZS5tYWtlLnRleHQoeHVuaXQgKiA2LCB5dW5pdCAqIDUuMjUsICcwJyxcbiAgICAvLyAgICB7Zm9udDogJzI2cHggQXJpYWwnLCBmaWxsOiAnIzAwZmZmZicsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIHRoaXMuY3J5c3RhbHRleHQgPSB0aGlzLmdhbWUuc3RhcmNvZGVyLm1ha2VGbGV4VGV4dCh4dW5pdCAqIDYsIHl1bml0ICogNS4yNSwgJzAnLFxuICAgICAgICB0aGlzLmdhbWUuc3RhcmNvZGVyLmNvbmZpZy5mb250cy5odWRDb2RlKTtcbiAgICB0aGlzLmNyeXN0YWx0ZXh0LmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLmNyeXN0YWx0ZXh0KTtcbiAgICAvLyBUcmVlIGljb25cbiAgICB0aGlzLmxpbmVTdHlsZSgxLCAweDAwZmYwMCwgMS4wKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRyZWVJY29uUGF0aHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZHJhd1BvbHlnb24oUGF0aHMubm9ybWFsaXplKHRyZWVJY29uUGF0aHNbaV0sIDUsIHh1bml0ICogMTEsIHl1bml0ICogNSwgZmFsc2UpKTtcbiAgICB9XG4gICAgLy8gQW1vdW50XG4gICAgdGhpcy50cmVldGV4dCA9IHRoaXMuZ2FtZS5tYWtlLnRleHQoeHVuaXQgKiAxNSwgeXVuaXQgKiA1LjI1LCAnMCcsXG4gICAgICAgIHtmb250OiAnMjZweCBBcmlhbCcsIGZpbGw6ICcjMDBmZjAwJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgdGhpcy50cmVldGV4dC5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy50cmVldGV4dCk7XG4gICAgdGhpcy5sYXNlcnMgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgIHZhciBsYXNlciA9IG5ldyBCdWxsZXQodGhpcy5nYW1lLCB7bm9waHlzaWNzOiB0cnVlLCBwcm9wZXJ0aWVzOiB7bGluZUNvbG9yOiAnI2ZmMDAwMCd9fSk7XG4gICAgICAgIGxhc2VyLnggPSB4dW5pdCAqIDIgKyBpICogMjQ7XG4gICAgICAgIGxhc2VyLnkgPSB5dW5pdCAqIDc7XG4gICAgICAgIGxhc2VyLmFuY2hvci5zZXRUbygwLjUpO1xuICAgICAgICBsYXNlci5hbmdsZSA9IDkwO1xuICAgICAgICB0aGlzLmFkZENoaWxkKGxhc2VyKTtcbiAgICAgICAgdGhpcy5sYXNlcnMucHVzaChsYXNlcik7XG4gICAgfVxuXG59O1xuXG5IVUQucHJvdG90eXBlLnNldExhc2VyQ29sb3IgPSBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICB0aGlzLmxhc2Vyc1swXS5jb25maWcoe2xpbmVDb2xvcjogY29sb3J9KTtcbiAgICB0aGlzLmxhc2Vyc1swXS51cGRhdGVUZXh0dXJlcygpO1xufTtcblxuSFVELnByb3RvdHlwZS5zZXRDcnlzdGFscyA9IGZ1bmN0aW9uICh4KSB7XG4gICAgdGhpcy5jcnlzdGFsdGV4dC5zZXRUZXh0KHgudG9TdHJpbmcoKSk7XG59O1xuXG5cbkhVRC5wcm90b3R5cGUuc2V0VHJlZXMgPSBmdW5jdGlvbiAoeCkge1xuICAgIHRoaXMudHJlZXRleHQuc2V0VGV4dCh4LnRvU3RyaW5nKCkpO1xufTtcblxuSFVELnByb3RvdHlwZS5zZXRDaGFyZ2UgPSBmdW5jdGlvbiAoeCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sYXNlcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmICh4ID4gaSkge1xuICAgICAgICAgICAgdGhpcy5sYXNlcnNbaV0udmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxhc2Vyc1tpXS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG52YXIgdHJlZUljb25QYXRocyA9IFtcbiAgICBbWzAsMl0sWzAsLTJdXSxcbiAgICBbWy0yLC0yXSxbMCwxXSxbMiwtMl1dLFxuICAgIFtbLTEsLTJdLFswLC0xXSxbMSwtMl1dLFxuICAgIFtbLTIsLTFdLFstMSwtMC41XSxbLTIsMF1dLFxuICAgIFtbMiwtMV0sWzEsLTAuNV0sWzIsMF1dXG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhVRDtcbiIsIi8qKlxuICogTGVhZGVyQm9hcmQuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTGVhZGVyQm9hcmQgPSBmdW5jdGlvbiAoZ2FtZSwgcGxheWVybWFwLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSk7XG4gICAgdGhpcy5wbGF5ZXJNYXAgPSBwbGF5ZXJtYXA7XG4gICAgdGhpcy5vcGVuID0gdHJ1ZTtcbiAgICB0aGlzLm1haW5XaWR0aCA9IHdpZHRoO1xuICAgIHRoaXMubWFpbkhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmljb25TaXplID0gMjQ7ICAgICAgICAgLy8gTWFrZSByZXNwb25zaXZlP1xuICAgIHRoaXMuZm9udFNpemUgPSAxODtcbiAgICB0aGlzLm51bUxpbmVzID0gTWF0aC5mbG9vcigoaGVpZ2h0IC0gdGhpcy5pY29uU2l6ZSAtIDIpIC8gKHRoaXMuZm9udFNpemUgKyAyKSk7XG5cbiAgICB0aGlzLm1haW4gPSBnYW1lLm1ha2UuZ3JvdXAoKTtcbiAgICB0aGlzLm1haW4ucGl2b3Quc2V0VG8od2lkdGgsIDApO1xuICAgIHRoaXMubWFpbi54ID0gd2lkdGg7XG4gICAgdGhpcy5hZGQodGhpcy5tYWluKTtcblxuICAgIC8vIEJhY2tncm91bmRcbiAgICB2YXIgYml0bWFwID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSh3aWR0aCwgaGVpZ2h0KTtcbiAgICBiaXRtYXAuY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDEyOCwgMTI4LCAxMjgsIDAuMjUpJztcbiAgICAvL2JpdG1hcC5jdHguZmlsbFN0eWxlID0gJyM5OTk5OTknO1xuICAgIC8vYml0bWFwLmN0eC5nbG9iYWxBbHBoYSA9IDAuNTtcbiAgICBiaXRtYXAuY3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIC8vdGhpcy5ib2FyZCA9IG5ldyBQaGFzZXIuU3ByaXRlKGdhbWUsIHdpZHRoLCAwLCB0aGlzLmJpdG1hcCk7XG4gICAgLy90aGlzLmJvYXJkLnBpdm90LnNldFRvKHdpZHRoLCAwKTtcbiAgICB0aGlzLm1haW4uYWRkKG5ldyBQaGFzZXIuU3ByaXRlKGdhbWUsIDAsIDAsIGJpdG1hcCkpO1xuXG4gICAgLy8gVGl0bGVcbiAgICB0aGlzLnRpdGxlID0gZ2FtZS5zdGFyY29kZXIuYWRkRmxleFRleHQoKHdpZHRoIC0gdGhpcy5pY29uU2l6ZSkgLyAyLCA0LCAnVGFncycsXG4gICAgICAgIHRoaXMuZ2FtZS5zdGFyY29kZXIuY29uZmlnLmZvbnRzLmxlYWRlckJvYXJkVGl0bGUsIHRoaXMubWFpbik7XG4gICAgdGhpcy50aXRsZS5hbmNob3Iuc2V0VG8oMC41LCAwKTtcblxuICAgIC8vIERpc3BsYXkgbGluZXNcbiAgICB0aGlzLmxpbmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm51bUxpbmVzOyBpKyspIHtcbiAgICAgICAgdmFyIGxpbmUgPSBnYW1lLnN0YXJjb2Rlci5hZGRGbGV4VGV4dCg0LCB0aGlzLmljb25TaXplICsgMiArIGkgKiAodGhpcy5mb250U2l6ZSArIDIpLFxuICAgICAgICAgICAgJy0nLCB0aGlzLmdhbWUuc3RhcmNvZGVyLmNvbmZpZy5mb250cy5sZWFkZXJCb2FyZCwgdGhpcy5tYWluKTtcbiAgICAgICAgbGluZS5raWxsKCk7XG4gICAgICAgIHRoaXMubGluZXMucHVzaChsaW5lKTtcbiAgICB9XG5cbiAgICAvLyBUb2dnbGUgYnV0dG9uXG4gICAgdmFyIGJ1dHRvbiA9IHRoaXMubWFrZUJ1dHRvbigpOyAgICAgICAvLyBHb29kIGRpbWVuc2lvbnMgVEJELiBNYWtlIHJlc3BvbnNpdmU/XG4gICAgYnV0dG9uLmFuY2hvci5zZXRUbygxLCAwKTsgICAgICAvLyB1cHBlciByaWdodDtcbiAgICBidXR0b24ueCA9IHdpZHRoO1xuICAgIC8vYnV0dG9uLnkgPSAwO1xuICAgIGJ1dHRvbi5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgIGJ1dHRvbi5ldmVudHMub25JbnB1dERvd24uYWRkKHRoaXMudG9nZ2xlRGlzcGxheSwgdGhpcyk7XG4gICAgdGhpcy5hZGQoYnV0dG9uKTtcblxuICAgIC8vLy8gTGlzdFxuICAgIC8vdGhpcy5saXN0ID0gZ2FtZS5tYWtlLmdyb3VwKCk7XG4gICAgLy90aGlzLmxpc3QueCA9IHdpZHRoO1xuICAgIC8vdGhpcy5saXN0LnkgPSAwO1xuICAgIC8vdGhpcy5saXN0LnBpdm90LnNldFRvKHdpZHRoLCAwKTtcbiAgICAvL3RoaXMudHdlZW4gPSBnYW1lLnR3ZWVucy5jcmVhdGUodGhpcy5ib2FyZC5zY2FsZSk7XG4gICAgLy9cbiAgICAvL3RoaXMuYWRkKHRoaXMubGlzdCk7XG4gICAgLy8vLyB0ZXN0aW5nXG4gICAgLy92YXIgdCA9IFsndGlnZXIgcHJpbmNlc3MnLCAnbmluamEgbGFzZXInLCAncm9ib3QgZmlzaCcsICdwb3RhdG8gcHVwcHknLCAndmFtcGlyZSBxdWljaGUnLCAnd2l6YXJkIHBhc3RhJ107XG4gICAgLy9mb3IgKHZhciBpID0gMDsgaSA8IHQubGVuZ3RoOyBpKyspIHtcbiAgICAvLyAgICB2YXIgdGV4dCA9IGdhbWUubWFrZS50ZXh0KDIsIGkqMTYsIHRbaV0sIHtmb250OiAnMTRweCBBcmlhbCcsIGZpbGw6ICcjMDAwMGZmJ30pO1xuICAgIC8vICAgIHRoaXMubGlzdC5hZGQodGV4dCk7XG4gICAgLy99XG59O1xuXG5MZWFkZXJCb2FyZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuTGVhZGVyQm9hcmQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGVhZGVyQm9hcmQ7XG5cbkxlYWRlckJvYXJkLnByb3RvdHlwZS5tYWtlQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB1bml0ID0gdGhpcy5pY29uU2l6ZSAvIDU7XG4gICAgdmFyIHRleHR1cmUgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKHRoaXMuaWNvblNpemUsIHRoaXMuaWNvblNpemUpO1xuICAgIHZhciBjdHggPSB0ZXh0dXJlLmN0eDtcbiAgICAvLyBEcmF3IHF1YXJ0ZXIgY2lyY2xlXG4gICAgY3R4LmZpbGxTdHlsZSA9ICcjZmZmZmZmJztcbiAgICAvL2N0eC5nbG9iYWxBbHBoYSA9IDAuNTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbyh0aGlzLmljb25TaXplLCAwKTtcbiAgICBjdHgubGluZVRvKDAsIDApO1xuICAgIGN0eC5hcmModGhpcy5pY29uU2l6ZSwgMCwgdGhpcy5pY29uU2l6ZSwgTWF0aC5QSSwgMyAqIE1hdGguUEkgLyAyLCB0cnVlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIC8vIERyYXcgc3RlcHNcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzAwMDAwMCc7XG4gICAgLy9jdHguZ2xvYmFsQWxwaGEgPSAxO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHgubW92ZVRvKDEuNSp1bml0LCAzKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oMS41KnVuaXQsIDIqdW5pdCk7XG4gICAgY3R4LmxpbmVUbygyLjUqdW5pdCwgMip1bml0KTtcbiAgICBjdHgubGluZVRvKDIuNSp1bml0LCB1bml0KTtcbiAgICBjdHgubGluZVRvKDMuNSp1bml0LCB1bml0KTtcbiAgICBjdHgubGluZVRvKDMuNSp1bml0LCAyKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oNC41KnVuaXQsIDIqdW5pdCk7XG4gICAgY3R4LmxpbmVUbyg0LjUqdW5pdCwgMyp1bml0KTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIHJldHVybiBuZXcgUGhhc2VyLlNwcml0ZSh0aGlzLmdhbWUsIDAsIDAsIHRleHR1cmUpO1xufTtcblxuTGVhZGVyQm9hcmQucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbiAodGl0bGUsIGxpc3QsIHBsYXllcmlkKSB7XG4gICAgdGhpcy50aXRsZS5zZXRUZXh0KHRpdGxlKTtcbiAgICB2YXIgcGxheWVyVmlzaWJsZSA9IGZhbHNlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5udW1MaW5lczsgaSsrKSB7XG4gICAgICAgIHZhciBwaWQgPSBsaXN0W2ldICYmIGxpc3RbaV0uaWQ7XG4gICAgICAgIGlmIChwaWQgJiYgdGhpcy5wbGF5ZXJNYXBbcGlkXSkge1xuICAgICAgICAgICAgdmFyIHRhZyA9IHRoaXMucGxheWVyTWFwW3BpZF0udGFnO1xuICAgICAgICAgICAgdmFyIGxpbmUgPSB0aGlzLmxpbmVzW2ldO1xuICAgICAgICAgICAgbGluZS5zZXRUZXh0KChpICsgMSkgKyAnLiAnICsgdGFnICsgJyAoJyArIGxpc3RbaV0udmFsICsgJyknKTtcbiAgICAgICAgICAgIGlmIChwaWQgPT09IHBsYXllcmlkKSB7XG4gICAgICAgICAgICAgICAgbGluZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xuICAgICAgICAgICAgICAgIHBsYXllclZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaW5lLmZvbnRXZWlnaHQgPSAnbm9ybWFsJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpbmUucmV2aXZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxpbmVzW2ldLmtpbGwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBQbGF5ZXIgbm90IGluIHRvcCBOXG4gICAgaWYgKCFwbGF5ZXJWaXNpYmxlKSB7XG4gICAgICAgIGZvciAoaSA9IHRoaXMubnVtTGluZXM7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAobGlzdFtpXS5pZCA9PT0gcGxheWVyaWQpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBGb3VuZCAtIGRpc3BsYXkgYXQgZW5kXG4gICAgICAgIGlmIChpIDwgbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxpbmVbdGhpcy5udW1MaW5lcyAtIDFdLnNldFRleHQoKGkgKyAxKSArICcuICcgKyB0aGlzLnBsYXllck1hcFtwbGF5ZXJpZF0gKyAnICgnICsgbGlzdFtpXS52YWwgKyAnKScpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuTGVhZGVyQm9hcmQucHJvdG90eXBlLnRvZ2dsZURpc3BsYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmdhbWUudHdlZW5zLmlzVHdlZW5pbmcodGhpcy5tYWluLnNjYWxlKSkge1xuICAgICAgICBpZiAodGhpcy5vcGVuKSB7XG4gICAgICAgICAgICB0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMubWFpbi5zY2FsZSkudG8oe3g6IDAsIHk6IDB9LCA1MDAsIFBoYXNlci5FYXNpbmcuUXVhZHJhdGljLk91dCwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5hZGQudHdlZW4odGhpcy5tYWluLnNjYWxlKS50byh7eDogMSwgeTogMX0sIDUwMCwgUGhhc2VyLkVhc2luZy5RdWFkcmF0aWMuT3V0LCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMub3BlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExlYWRlckJvYXJkOyIsIi8qKlxuICogTWluaU1hcC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBNaW5pTWFwID0gZnVuY3Rpb24gKGdhbWUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIHZhciB4ciA9IHdpZHRoIC8gdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJXaWR0aDtcbiAgICB2YXIgeXIgPSBoZWlnaHQgLyB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckhlaWdodDtcbiAgICBpZiAoeHIgPD0geXIpIHtcbiAgICAgICAgdGhpcy5tYXBTY2FsZSA9IHhyO1xuICAgICAgICB0aGlzLnhPZmZzZXQgPSAteHIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckxlZnQ7XG4gICAgICAgIHRoaXMueU9mZnNldCA9IC14ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyVG9wICsgKGhlaWdodCAtIHhyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJIZWlnaHQpIC8gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1hcFNjYWxlID0geXI7XG4gICAgICAgIHRoaXMueU9mZnNldCA9IC15ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyVG9wO1xuICAgICAgICB0aGlzLnhPZmZzZXQgPSAteXIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckxlZnQgKyAod2lkdGggLSB5ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyV2lkdGgpIC8gMjtcbiAgICB9XG5cbiAgICB0aGlzLmdyYXBoaWNzID0gZ2FtZS5tYWtlLmdyYXBoaWNzKDAsIDApO1xuICAgIHRoaXMuZ3JhcGhpY3MuYmVnaW5GaWxsKDB4ZmZmZjAwLCAwLjIpO1xuICAgIHRoaXMuZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgdGhpcy5ncmFwaGljcy5lbmRGaWxsKCk7XG4gICAgdGhpcy5ncmFwaGljcy5jYWNoZUFzQml0bWFwID0gdHJ1ZTtcbiAgICB0aGlzLmFkZCh0aGlzLmdyYXBoaWNzKTtcbn07XG5cbk1pbmlNYXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbk1pbmlNYXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWluaU1hcDtcblxuTWluaU1hcC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vdGhpcy50ZXh0dXJlLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIDAsIDAsIHRydWUpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5nYW1lLnBsYXlmaWVsZC5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGJvZHkgPSB0aGlzLmdhbWUucGxheWZpZWxkLmNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoIWJvZHkubWluaXNwcml0ZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgYm9keS5taW5pc3ByaXRlLnggPSB0aGlzLndvcmxkVG9NbVgoYm9keS54KTtcbiAgICAgICAgYm9keS5taW5pc3ByaXRlLnkgPSB0aGlzLndvcmxkVG9NbVkoYm9keS55KTtcbiAgICAgICAgYm9keS5taW5pc3ByaXRlLmFuZ2xlID0gYm9keS5hbmdsZTtcbiAgICAvLyAgICB2YXIgeCA9IDEwMCArIGJvZHkueCAvIDQwO1xuICAgIC8vICAgIHZhciB5ID0gMTAwICsgYm9keS55IC8gNDA7XG4gICAgLy8gICAgdGhpcy50ZXh0dXJlLnJlbmRlclhZKGJvZHkuZ3JhcGhpY3MsIHgsIHksIGZhbHNlKTtcbiAgICB9XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZS53b3JsZFRvTW1YID0gZnVuY3Rpb24gKHgpIHtcbiAgICByZXR1cm4geCAqIHRoaXMubWFwU2NhbGUgKyB0aGlzLnhPZmZzZXQ7XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZS53b3JsZFRvTW1ZID0gZnVuY3Rpb24gKHkpIHtcbiAgICByZXR1cm4geSAqIHRoaXMubWFwU2NhbGUgKyB0aGlzLnlPZmZzZXQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1pbmlNYXA7IiwiLyoqIGNsaWVudC5qc1xuICpcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIFN0YXJjb2RlciBnYW1lIGNsaWVudFxuICpcbiAqIEB0eXBlIHtTdGFyY29kZXJ8ZXhwb3J0c31cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL3JlcXVpcmUoJy4vQmxvY2tseUN1c3RvbS5qcycpO1xuXG52YXIgY29tbW9uQ29uZmlnID0gcmVxdWlyZSgnLi9jb21tb24vY29uZmlnLmpzJyk7XG52YXIgY2xpZW50Q29uZmlnID0gcmVxdWlyZSgnLi9jbGllbnQvY29uZmlnLmpzJyk7XG52YXIgYnVpbGRDb25maWcgPSBidWlsZENvbmZpZyB8fCB7fTtcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG4vLyBAQlVJTERDT05GSUdAXG5cbi8vIEBCVUlMRFRJTUVAXG5cbi8vbG9jYWxTdG9yYWdlLmRlYnVnID0gJyc7ICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXNlZCB0byB0b2dnbGUgc29ja2V0LmlvIGRlYnVnZ2luZyBvdXRwdXRcblxuLy9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuLy8gICAgdmFyIHN0YXJjb2RlciA9IG5ldyBTdGFyY29kZXIoKTtcbi8vICAgIHN0YXJjb2Rlci5zdGFydCgpO1xuLy99KTtcblxuLy8gdGVzdFxuXG4kKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3RhcmNvZGVyID0gbmV3IFN0YXJjb2RlcihbY29tbW9uQ29uZmlnLCBjbGllbnRDb25maWcsIGJ1aWxkQ29uZmlnXSk7XG4gICAgc3RhcmNvZGVyLnN0YXJ0KCk7XG59KTtcbiJdfQ==
