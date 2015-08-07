(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

Starcoder.prototype.role = 'Client';

module.exports = Starcoder;

},{"./Starcoder.js":2,"./client-components/CodeEndpointClient.js":3,"./client-components/DOMInterface.js":4,"./client-components/LeaderBoardClient.js":5,"./client-components/Starfield.js":6,"./client-components/WorldApi.js":7,"./phaserstates/Boot.js":27,"./phaserstates/Loader.js":28,"./phaserstates/Login.js":29,"./phaserstates/Space.js":30}],2:[function(require,module,exports){
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
    serverUri: 'http://pharcoder-env-west2.elasticbeanstalk.com:8080',
    //serverUri: 'http://localhost:8081',
    //serverAddress: '1.2.3.4',
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
    this.config = config;
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

Starcoder.prototype.banner = function () {
    this.log('Starcoder', this.role, 'v' + this.config.version, 'started at', Date());
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
    sendCode: function (code) {
        this.socket.emit('code', code);
    }
};
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
            config.mass = this.config.physicsProperties.Ship.mass;
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


},{"../phaserbodies/Asteroid.js":11,"../phaserbodies/Bullet.js":12,"../phaserbodies/Crystal.js":13,"../phaserbodies/GenericOrb.js":14,"../phaserbodies/Planetoid.js":15,"../phaserbodies/Ship.js":16,"../phaserbodies/StarTarget.js":18,"../phaserbodies/TractorBeam.js":22,"../phaserbodies/Tree.js":23}],8:[function(require,module,exports){
/** client.js
 *
 * Main entry point for Starcoder game client
 *
 * @type {Starcoder|exports}
 */

//require('./BlocklyCustom.js');

var Starcoder = require('./Starcoder-client.js');


//localStorage.debug = '';                        // used to toggle socket.io debugging

//document.addEventListener('DOMContentLoaded', function () {
//    var starcoder = new Starcoder();
//    starcoder.start();
//});

// test

$(function () {
    var starcoder = new Starcoder();
    starcoder.start();
});

},{"./Starcoder-client.js":1}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
/**
 * UpdateProperties.js
 *
 * Client/server syncable properties for game objects
 */
'use strict';

var Ship = function () {};
Ship.prototype.updateProperties = ['lineWidth', 'lineColor', 'fillColor', 'fillAlpha',
    'vectorScale', 'shape', 'shapeClosed', 'playerid', 'crystals', 'dead', 'tag'];

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
Asteroid.prototype._fillColor = '#ff0000';
Asteroid.prototype._shapeClosed = true;
Asteroid.prototype._lineWidth = 1;
Asteroid.prototype._fillAlpha = 0.25;
Asteroid.prototype._shape = Paths.octagon;

module.exports = Asteroid;
//Starcoder.Asteroid = Asteroid;

},{"../Starcoder.js":2,"../common/Paths.js":9,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":19,"./VectorSprite.js":24}],12:[function(require,module,exports){
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
    this.setPosAngle(config.x, config.y, config.a);
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
};

module.exports = Bullet;
},{"../Starcoder.js":2,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":19,"./VectorSprite.js":24}],13:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":9,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":19,"./VectorSprite.js":24}],14:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":9,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":19,"./VectorSprite.js":24}],15:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":9,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":19,"./VectorSprite.js":24}],16:[function(require,module,exports){
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
        this.game.inventorytext.setText(this.crystals.toString());
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

},{"../Starcoder.js":2,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":19,"./VectorSprite.js":24}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/Paths.js":9,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":19,"./VectorSprite.js":24}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
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
},{"./SimpleParticle.js":17}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/UpdateProperties.js":10,"./SimpleParticle.js":17,"./SyncBodyInterface.js":19}],23:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/UpdateProperties.js":10,"./SyncBodyInterface.js":19,"./VectorSprite.js":24}],24:[function(require,module,exports){
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

    game.physics.p2.enable(this, false, false);
    this.setPosAngle(config.x, config.y, config.a);
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
},{}],25:[function(require,module,exports){
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
},{"../Starcoder-client.js":1}],26:[function(require,module,exports){
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
},{"../Starcoder-client.js":1}],27:[function(require,module,exports){
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
    console.log('custom zip test v2.0');
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
},{"../phaserplugins/Controls.js":25,"../phaserplugins/SyncClient.js":26}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
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

Login.prototype.resize = function (w, h) {
    console.log('rs Login', w, h);
};

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

},{}],30:[function(require,module,exports){
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
    var label = this.game.make.text(this.game.width / 2, 25, 'INVENTORY',
        {font: '24px Arial', fill: '#ff9900', align: 'center'});
    label.anchor.setTo(0.5, 0.5);
    this.game.ui.add(label);
    //this.game.inventorytext = this.game.make.text(this.game.width - 100, 50, '0 crystals',
    //    {font: '24px Arial', fill: '#ccc000', align: 'center'});
    this.game.inventorytext = this.game.make.bitmapText(this.game.width / 2, 50, 'readout-yellow', '0');
    this.game.inventorytext.anchor.setTo(0.5, 0.5);
    this.game.ui.add(this.game.inventorytext);

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

},{"../phaserbodies/SimpleParticle.js":17,"../phaserbodies/ThrustGenerator.js":20,"../phaserbodies/Toast.js":21,"../phaserplugins/Controls.js":25,"../phaserplugins/SyncClient.js":26,"../phaserui/LeaderBoard.js":31,"../phaserui/MiniMap.js":32}],31:[function(require,module,exports){
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
    this.title = game.make.text((width - this.iconSize) / 2, 4, 'Tags',
        {font: '20px Arial bold', align: 'center', fill: '#ff0000'});
    this.title.anchor.setTo(0.5, 0);
    this.main.add(this.title);

    // Display lines
    this.lines = [];
    for (var i = 0; i < this.numLines; i++) {
        var line = game.make.text(4, this.iconSize + 2 + i * (this.fontSize + 2),
            '-', {font: '18px Arial', fill: '#0000ff'});
        line.kill();
        this.lines.push(line);
        this.main.add(line);
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
    ctx.lineTo(2.5*unit, 1*unit);
    ctx.lineTo(3.5*unit, 1*unit);
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
},{}],32:[function(require,module,exports){
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
},{}]},{},[8])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvU3RhcmNvZGVyLWNsaWVudC5qcyIsInNyYy9TdGFyY29kZXIuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvQ29kZUVuZHBvaW50Q2xpZW50LmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL0RPTUludGVyZmFjZS5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9MZWFkZXJCb2FyZENsaWVudC5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9TdGFyZmllbGQuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvV29ybGRBcGkuanMiLCJzcmMvY2xpZW50LmpzIiwic3JjL2NvbW1vbi9QYXRocy5qcyIsInNyYy9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcyIsInNyYy9waGFzZXJib2RpZXMvQXN0ZXJvaWQuanMiLCJzcmMvcGhhc2VyYm9kaWVzL0J1bGxldC5qcyIsInNyYy9waGFzZXJib2RpZXMvQ3J5c3RhbC5qcyIsInNyYy9waGFzZXJib2RpZXMvR2VuZXJpY09yYi5qcyIsInNyYy9waGFzZXJib2RpZXMvUGxhbmV0b2lkLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TaGlwLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TaW1wbGVQYXJ0aWNsZS5qcyIsInNyYy9waGFzZXJib2RpZXMvU3RhclRhcmdldC5qcyIsInNyYy9waGFzZXJib2RpZXMvU3luY0JvZHlJbnRlcmZhY2UuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1RocnVzdEdlbmVyYXRvci5qcyIsInNyYy9waGFzZXJib2RpZXMvVG9hc3QuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1RyYWN0b3JCZWFtLmpzIiwic3JjL3BoYXNlcmJvZGllcy9UcmVlLmpzIiwic3JjL3BoYXNlcmJvZGllcy9WZWN0b3JTcHJpdGUuanMiLCJzcmMvcGhhc2VycGx1Z2lucy9Db250cm9scy5qcyIsInNyYy9waGFzZXJwbHVnaW5zL1N5bmNDbGllbnQuanMiLCJzcmMvcGhhc2Vyc3RhdGVzL0Jvb3QuanMiLCJzcmMvcGhhc2Vyc3RhdGVzL0xvYWRlci5qcyIsInNyYy9waGFzZXJzdGF0ZXMvTG9naW4uanMiLCJzcmMvcGhhc2Vyc3RhdGVzL1NwYWNlLmpzIiwic3JjL3BoYXNlcnVpL0xlYWRlckJvYXJkLmpzIiwic3JjL3BoYXNlcnVpL01pbmlNYXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIFN0YXJjb2Rlci1jbGllbnQuanNcbiAqXG4gKiBTdGFyY29kZXIgbWFzdGVyIG9iamVjdCBleHRlbmRlZCB3aXRoIGNsaWVudCBvbmx5IHByb3BlcnRpZXMgYW5kIG1ldGhvZHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFdvcmxkQXBpID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9Xb3JsZEFwaS5qcycpO1xudmFyIERPTUludGVyZmFjZSA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvRE9NSW50ZXJmYWNlLmpzJyk7XG52YXIgQ29kZUVuZHBvaW50Q2xpZW50ID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9Db2RlRW5kcG9pbnRDbGllbnQuanMnKTtcbnZhciBTdGFyZmllbGQgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL1N0YXJmaWVsZC5qcycpO1xudmFyIExlYWRlckJvYXJkQ2xpZW50ID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9MZWFkZXJCb2FyZENsaWVudC5qcycpO1xuXG52YXIgc3RhdGVzID0ge1xuICAgIGJvb3Q6IHJlcXVpcmUoJy4vcGhhc2Vyc3RhdGVzL0Jvb3QuanMnKSxcbiAgICBzcGFjZTogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvU3BhY2UuanMnKSxcbiAgICBsb2dpbjogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvTG9naW4uanMnKSxcbiAgICBsb2FkZXI6IHJlcXVpcmUoJy4vcGhhc2Vyc3RhdGVzL0xvYWRlci5qcycpXG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbyA9IGlvO1xuICAgIHRoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSgnMTAwJScsICcxMDAlJywgUGhhc2VyLkFVVE8sICdtYWluJyk7XG4gICAgLy90aGlzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoMTgwMCwgOTUwLCBQaGFzZXIuQ0FOVkFTLCAnbWFpbicpO1xuICAgIHRoaXMuZ2FtZS5mb3JjZVNpbmdsZVVwZGF0ZSA9IHRydWU7XG4gICAgdGhpcy5nYW1lLnN0YXJjb2RlciA9IHRoaXM7XG4gICAgZm9yICh2YXIgayBpbiBzdGF0ZXMpIHtcbiAgICAgICAgdmFyIHN0YXRlID0gbmV3IHN0YXRlc1trXSgpO1xuICAgICAgICBzdGF0ZS5zdGFyY29kZXIgPSB0aGlzO1xuICAgICAgICB0aGlzLmdhbWUuc3RhdGUuYWRkKGssIHN0YXRlKTtcbiAgICB9XG4gICAgdGhpcy5vbkNvbm5lY3RDQiA9IFtdO1xuICAgIHRoaXMucGxheWVyTWFwID0ge307XG4gICAgdGhpcy5jbWRRdWV1ZSA9IFtdO1xuICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5sYXN0TmV0RXJyb3IgPSBudWxsO1xuICAgIHRoaXMuaW1wbGVtZW50RmVhdHVyZShXb3JsZEFwaSk7XG4gICAgdGhpcy5pbXBsZW1lbnRGZWF0dXJlKENvZGVFbmRwb2ludENsaWVudCk7XG4gICAgdGhpcy5pbXBsZW1lbnRGZWF0dXJlKFN0YXJmaWVsZCk7XG4gICAgdGhpcy5pbXBsZW1lbnRGZWF0dXJlKExlYWRlckJvYXJkQ2xpZW50KTtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoRE9NSW50ZXJmYWNlKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuc2VydmVyQ29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCF0aGlzLnNvY2tldCkge1xuICAgICAgICBkZWxldGUgdGhpcy5zb2NrZXQ7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGFzdE5ldEVycm9yID0gbnVsbDtcbiAgICB9XG4gICAgdmFyIHNlcnZlclVyaSA9IHRoaXMuY29uZmlnLnNlcnZlclVyaTtcbiAgICBpZiAoIXNlcnZlclVyaSkge1xuICAgICAgICB2YXIgcHJvdG9jb2wgPSB0aGlzLmNvbmZpZy5zZXJ2ZXJQcm90b2wgfHwgd2luZG93LmxvY2F0aW9uLnByb3RvY29sO1xuICAgICAgICB2YXIgcG9ydCA9IHRoaXMuY29uZmlnLnNlcnZlclBvcnQgfHwgJzgwODAnO1xuICAgICAgICBzZXJ2ZXJVcmkgPSBwcm90b2NvbCArICcvLycgKyB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgKyAnOicgKyBwb3J0O1xuICAgIH1cbiAgICB0aGlzLnNvY2tldCA9IHRoaXMuaW8oc2VydmVyVXJpLCB0aGlzLmNvbmZpZy5pb0NsaWVudE9wdGlvbnMpO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coJ3NvY2tldCBjb25uZWN0ZWQnKTtcbiAgICAgICAgc2VsZi5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICBzZWxmLmxhc3ROZXRFcnJvciA9IG51bGw7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gc2VsZi5vbkNvbm5lY3RDQi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHNlbGYub25Db25uZWN0Q0JbaV0uYmluZChzZWxmLCBzZWxmLnNvY2tldCkoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvcicsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBjb25zb2xlLmxvZygnc29ja2V0IGVycm9yJyk7XG4gICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgdGhpcy5sYXN0TmV0RXJyb3IgPSBkYXRhO1xuICAgIH0pO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5zZXJ2ZXJMb2dpbiA9IGZ1bmN0aW9uICh1c2VybmFtZSwgcGFzc3dvcmQpIHtcbiAgICB2YXIgbG9naW4gPSB7fTtcbiAgICBpZiAoIXBhc3N3b3JkKSB7XG4gICAgICAgIC8vIEd1ZXN0IGxvZ2luXG4gICAgICAgIGxvZ2luLmdhbWVydGFnID0gdXNlcm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbG9naW4udXNlcm5hbWUgPSB1c2VybmFtZTtcbiAgICAgICAgbG9naW4ucGFzc3dvcmQgPSBwYXNzd29yZDtcbiAgICB9XG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnbG9naW4nLCBsb2dpbik7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnYm9vdCcpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5hdHRhY2hQbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBsdWdpbiA9IHRoaXMuZ2FtZS5wbHVnaW5zLmFkZC5hcHBseSh0aGlzLmdhbWUucGx1Z2lucywgYXJndW1lbnRzKTtcbiAgICBwbHVnaW4uc3RhcmNvZGVyID0gdGhpcztcbiAgICBwbHVnaW4ubG9nID0gdGhpcy5sb2c7XG4gICAgcmV0dXJuIHBsdWdpbjtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUucm9sZSA9ICdDbGllbnQnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJjb2RlcjtcbiIsIi8qKlxuICogU3RhcmNvZGVyLmpzXG4gKlxuICogU2V0IHVwIGdsb2JhbCBTdGFyY29kZXIgbmFtZXNwYWNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0ge1xuLy8gICAgY29uZmlnOiB7XG4vLyAgICAgICAgd29ybGRCb3VuZHM6IFstNDIwMCwgLTQyMDAsIDg0MDAsIDg0MDBdXG4vL1xuLy8gICAgfSxcbi8vICAgIFN0YXRlczoge31cbi8vfTtcblxudmFyIGNvbmZpZyA9IHtcbiAgICB2ZXJzaW9uOiAnMC4xJyxcbiAgICBzZXJ2ZXJVcmk6ICdodHRwOi8vcGhhcmNvZGVyLWVudi13ZXN0Mi5lbGFzdGljYmVhbnN0YWxrLmNvbTo4MDgwJyxcbiAgICAvL3NlcnZlclVyaTogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MScsXG4gICAgLy9zZXJ2ZXJBZGRyZXNzOiAnMS4yLjMuNCcsXG4gICAgLy93b3JsZEJvdW5kczogWy00MjAwLCAtNDIwMCwgODQwMCwgODQwMF0sXG4gICAgd29ybGRCb3VuZHM6IFstMjAwLCAtMjAwLCAyMDAsIDIwMF0sXG4gICAgaW9DbGllbnRPcHRpb25zOiB7XG4gICAgICAgIC8vZm9yY2VOZXc6IHRydWVcbiAgICAgICAgcmVjb25uZWN0aW9uOiBmYWxzZVxuICAgIH0sXG4gICAgdXBkYXRlSW50ZXJ2YWw6IDUwLFxuICAgIHJlbmRlckxhdGVuY3k6IDEwMCxcbiAgICBwaHlzaWNzU2NhbGU6IDIwLFxuICAgIGZyYW1lUmF0ZTogKDEgLyA2MCksXG4gICAgdGltZVN5bmNGcmVxOiAxMCxcbiAgICBwaHlzaWNzUHJvcGVydGllczoge1xuICAgICAgICBTaGlwOiB7XG4gICAgICAgICAgICBtYXNzOiAxMFxuICAgICAgICB9LFxuICAgICAgICBBc3Rlcm9pZDoge1xuICAgICAgICAgICAgbWFzczogMjBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2FtZXJUYWdzOiB7XG4gICAgICAgIDE6IFtcbiAgICAgICAgICAgICdzdXBlcicsXG4gICAgICAgICAgICAnYXdlc29tZScsXG4gICAgICAgICAgICAncmFpbmJvdycsXG4gICAgICAgICAgICAnZG91YmxlJyxcbiAgICAgICAgICAgICd0cmlwbGUnLFxuICAgICAgICAgICAgJ3ZhbXBpcmUnLFxuICAgICAgICAgICAgJ3ByaW5jZXNzJyxcbiAgICAgICAgICAgICdpY2UnLFxuICAgICAgICAgICAgJ2ZpcmUnLFxuICAgICAgICAgICAgJ3JvYm90JyxcbiAgICAgICAgICAgICd3ZXJld29sZicsXG4gICAgICAgICAgICAnc3BhcmtsZScsXG4gICAgICAgICAgICAnaW5maW5pdGUnLFxuICAgICAgICAgICAgJ2Nvb2wnLFxuICAgICAgICAgICAgJ3lvbG8nLFxuICAgICAgICAgICAgJ3N3YWdneScsXG4gICAgICAgICAgICAnem9tYmllJyxcbiAgICAgICAgICAgICdzYW11cmFpJyxcbiAgICAgICAgICAgICdkYW5jaW5nJyxcbiAgICAgICAgICAgICdwb3dlcicsXG4gICAgICAgICAgICAnZ29sZCcsXG4gICAgICAgICAgICAnc2lsdmVyJyxcbiAgICAgICAgICAgICdyYWRpb2FjdGl2ZScsXG4gICAgICAgICAgICAncXVhbnR1bScsXG4gICAgICAgICAgICAnYnJpbGxpYW50JyxcbiAgICAgICAgICAgICdtaWdodHknLFxuICAgICAgICAgICAgJ3JhbmRvbSdcbiAgICAgICAgXSxcbiAgICAgICAgMjogW1xuICAgICAgICAgICAgJ3RpZ2VyJyxcbiAgICAgICAgICAgICduaW5qYScsXG4gICAgICAgICAgICAncHJpbmNlc3MnLFxuICAgICAgICAgICAgJ3JvYm90JyxcbiAgICAgICAgICAgICdwb255JyxcbiAgICAgICAgICAgICdkYW5jZXInLFxuICAgICAgICAgICAgJ3JvY2tlcicsXG4gICAgICAgICAgICAnbWFzdGVyJyxcbiAgICAgICAgICAgICdoYWNrZXInLFxuICAgICAgICAgICAgJ3JhaW5ib3cnLFxuICAgICAgICAgICAgJ2tpdHRlbicsXG4gICAgICAgICAgICAncHVwcHknLFxuICAgICAgICAgICAgJ2Jvc3MnLFxuICAgICAgICAgICAgJ3dpemFyZCcsXG4gICAgICAgICAgICAnaGVybycsXG4gICAgICAgICAgICAnZHJhZ29uJyxcbiAgICAgICAgICAgICd0cmlidXRlJyxcbiAgICAgICAgICAgICdnZW5pdXMnLFxuICAgICAgICAgICAgJ2JsYXN0ZXInLFxuICAgICAgICAgICAgJ3NwaWRlcidcbiAgICAgICAgXVxuICAgIH0sXG4gICAgaW5pdGlhbEJvZGllczogW1xuICAgICAgICB7dHlwZTogJ0FzdGVyb2lkJywgbnVtYmVyOiAyNSwgY29uZmlnOiB7XG4gICAgICAgICAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJ30sXG4gICAgICAgICAgICB2ZWxvY2l0eToge3JhbmRvbTogJ3ZlY3RvcicsIGxvOiAtMTUsIGhpOiAxNX0sXG4gICAgICAgICAgICBhbmd1bGFyVmVsb2NpdHk6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAtNSwgaGk6IDV9LFxuICAgICAgICAgICAgdmVjdG9yU2NhbGU6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAwLjYsIGhpOiAxLjR9LFxuICAgICAgICAgICAgbWFzczogMTBcbiAgICAgICAgfX0sXG4gICAgICAgIC8ve3R5cGU6ICdDcnlzdGFsJywgbnVtYmVyOiAxMCwgY29uZmlnOiB7XG4gICAgICAgIC8vICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnfSxcbiAgICAgICAgLy8gICAgdmVsb2NpdHk6IHtyYW5kb206ICd2ZWN0b3InLCBsbzogLTQsIGhpOiA0LCBub3JtYWw6IHRydWV9LFxuICAgICAgICAvLyAgICB2ZWN0b3JTY2FsZToge3JhbmRvbTogJ2Zsb2F0JywgbG86IDAuNCwgaGk6IDAuOH0sXG4gICAgICAgIC8vICAgIG1hc3M6IDVcbiAgICAgICAgLy99fVxuICAgICAgICB7dHlwZTogJ0h5ZHJhJywgbnVtYmVyOiAxLCBjb25maWc6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDUwfVxuICAgICAgICB9fSxcbiAgICAgICAge3R5cGU6ICdQbGFuZXRvaWQnLCBudW1iZXI6IDYsIGNvbmZpZzoge1xuICAgICAgICAgICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCcsIHBhZDogMzB9LFxuICAgICAgICAgICAgYW5ndWxhclZlbG9jaXR5OiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogLTIsIGhpOiAyfSxcbiAgICAgICAgICAgIHZlY3RvclNjYWxlOiAyLjUsXG4gICAgICAgICAgICBtYXNzOiAxMDBcbiAgICAgICAgfX0sXG4gICAgICAgIC8ve3R5cGU6ICdTdGFyVGFyZ2V0JywgbnVtYmVyOiAxMCwgY29uZmlnOiB7XG4gICAgICAgIC8vICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDMwfSxcbiAgICAgICAgLy8gICAgdmVjdG9yU2NhbGU6IDAuNSxcbiAgICAgICAgLy8gICAgc3RhcnM6IFtbMCwgMF0sIFsxLDFdLCBbLTEsMV0sIFsxLC0xXV1cbiAgICAgICAgLy99fVxuICAgICAgICAvLyBGSVhNRTogVHJlZXMganVzdCBmb3IgdGVzdGluZ1xuICAgICAgICAvL3t0eXBlOiAnVHJlZScsIG51bWJlcjogMTAsIGNvbmZpZzoge1xuICAgICAgICAvLyAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJywgcGFkOiAzMH0sXG4gICAgICAgIC8vICAgIHZlY3RvclNjYWxlOiAxLFxuICAgICAgICAvLyAgICBtYXNzOiA1XG4gICAgICAgIC8vfX1cbiAgICBdXG59O1xuXG52YXIgU3RhcmNvZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEluaXRpYWxpemVycyB2aXJ0dWFsaXplZCBhY2NvcmRpbmcgdG8gcm9sZVxuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuYmFubmVyKCk7XG4gICAgdGhpcy5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgLy90aGlzLmluaXROZXQuY2FsbCh0aGlzKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuZXh0ZW5kQ29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIGZvciAodmFyIGsgaW4gY29uZmlnKSB7XG4gICAgICAgIGlmIChjb25maWcuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnW2tdID0gY29uZmlnW2tdO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGNvbW1vbiBjb25maWcgb3B0aW9uc1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3dvcmxkV2lkdGgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1syXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzBdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlcldpZHRoJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogKHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzJdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF0pO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3dvcmxkSGVpZ2h0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcud29ybGRCb3VuZHNbM10gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1sxXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJIZWlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiAodGhpcy5jb25maWcud29ybGRCb3VuZHNbM10gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1sxXSk7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyTGVmdCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzBdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlclRvcCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlclJpZ2h0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMl07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyQm90dG9tJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbM107XG4gICAgfVxufSk7XG5cbi8qKlxuICogQWRkIG1peGluIHByb3BlcnRpZXMgdG8gdGFyZ2V0LiBBZGFwdGVkIChzbGlnaHRseSkgZnJvbSBQaGFzZXJcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0XG4gKiBAcGFyYW0ge29iamVjdH0gbWl4aW5cbiAqL1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlID0gZnVuY3Rpb24gKHRhcmdldCwgbWl4aW4pIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG1peGluKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgIHZhciB2YWwgPSBtaXhpbltrZXldO1xuICAgICAgICBpZiAodmFsICYmXG4gICAgICAgICAgICAodHlwZW9mIHZhbC5nZXQgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHZhbC5zZXQgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHZhbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHZhbDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogTGlnaHR3ZWlnaHQgY29tcG9uZW50IGltcGxlbWVudGF0aW9uLCBtb3JlIGZvciBsb2dpY2FsIHRoYW4gZnVuY3Rpb25hbCBtb2R1bGFyaXR5XG4gKlxuICogQHBhcmFtIG1peGluIHtvYmplY3R9IC0gUE9KTyB3aXRoIG1ldGhvZHMgLyBwcm9wZXJ0aWVzIHRvIGJlIGFkZGVkIHRvIHByb3RvdHlwZSwgd2l0aCBvcHRpb25hbCBpbml0IG1ldGhvZFxuICovXG5TdGFyY29kZXIucHJvdG90eXBlLmltcGxlbWVudEZlYXR1cmUgPSBmdW5jdGlvbiAobWl4aW4pIHtcbiAgICBmb3IgKHZhciBwcm9wIGluIG1peGluKSB7XG4gICAgICAgIHN3aXRjaCAocHJvcCkge1xuICAgICAgICAgICAgY2FzZSAnb25Db25uZWN0Q0InOlxuICAgICAgICAgICAgY2FzZSAnb25SZWFkeUNCJzpcbiAgICAgICAgICAgIGNhc2UgJ29uTG9naW5DQic6XG4gICAgICAgICAgICBjYXNlICdvbkRpc2Nvbm5lY3RDQic6XG4gICAgICAgICAgICAgICAgdGhpc1twcm9wXS5wdXNoKG1peGluW3Byb3BdKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2luaXQnOlxuICAgICAgICAgICAgICAgIGJyZWFrOyAgICAgIC8vIE5vT3BcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgU3RhcmNvZGVyLnByb3RvdHlwZVtwcm9wXSA9IG1peGluW3Byb3BdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChtaXhpbi5pbml0KSB7XG4gICAgICAgIG1peGluLmluaXQuY2FsbCh0aGlzKTtcbiAgICB9XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLmJhbm5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmxvZygnU3RhcmNvZGVyJywgdGhpcy5yb2xlLCAndicgKyB0aGlzLmNvbmZpZy52ZXJzaW9uLCAnc3RhcnRlZCBhdCcsIERhdGUoKSk7XG59O1xuXG4vKipcbiAqIEN1c3RvbSBsb2dnaW5nIGZ1bmN0aW9uIHRvIGJlIGZlYXR1cmVmaWVkIGFzIG5lY2Vzc2FyeVxuICovXG5TdGFyY29kZXIucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcmNvZGVyO1xuIiwiLyoqXG4gKiBDb2RlRW5kcG9pbnRDbGllbnQuanNcbiAqXG4gKiBNZXRob2RzIGZvciBzZW5kaW5nIGNvZGUgdG8gc2VydmVyIGFuZCBkZWFsaW5nIHdpdGggY29kZSByZWxhdGVkIHJlc3BvbnNlc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNlbmRDb2RlOiBmdW5jdGlvbiAoY29kZSkge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdjb2RlJywgY29kZSk7XG4gICAgfVxufTsiLCIvKipcbiAqIERPTUludGVyZmFjZS5qc1xuICpcbiAqIEhhbmRsZSBET00gY29uZmlndXJhdGlvbi9pbnRlcmFjdGlvbiwgaS5lLiBub24tUGhhc2VyIHN0dWZmXG4gKi9cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuZG9tID0ge307ICAgICAgICAgICAgICAvLyBuYW1lc3BhY2VcbiAgICAgICAgdGhpcy5kb20uY29kZUJ1dHRvbiA9ICQoJyNjb2RlLWJ0bicpO1xuICAgICAgICB0aGlzLmRvbS5jb2RlUG9wdXAgPSAkKCcjY29kZS1wb3B1cCcpO1xuICAgICAgICB0aGlzLmRvbS5sb2dpblBvcHVwPSAkKCcjbG9naW4nKTtcbiAgICAgICAgdGhpcy5kb20ubG9naW5CdXR0b24gPSAkKCcjc3VibWl0Jyk7XG5cbiAgICAgICAgdGhpcy5kb20uY29kZUJ1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRvbS5jb2RlUG9wdXAudG9nZ2xlKCdzbG93Jyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQod2luZG93KS5vbignbWVzc2FnZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQuc291cmNlID09PSBzZWxmLmRvbS5jb2RlUG9wdXBbMF0uY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgICAgIHNlbGYuc2VuZENvZGUoZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy90aGlzLmRvbS5jb2RlUG9wdXAuaGlkZSgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSAyOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB0YWdzID0gdGhpcy5jb25maWcuZ2FtZXJUYWdzW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGwgPSB0YWdzLmxlbmd0aDsgaiA8IGw7IGorKykge1xuICAgICAgICAgICAgICAgICQoJyNndCcgKyBpKS5hcHBlbmQoJzxvcHRpb24+JyArIHRhZ3Nbal0gKyAnPC9vcHRpb24+Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgJCgnLnNlbGVjdCcpLnNlbGVjdG1lbnUoKTtcbiAgICAgICAgJCgnLmxvZ2luYnV0dG9uJykuYnV0dG9uKHtpY29uczoge3ByaW1hcnk6ICd1aS1pY29uLXRyaWFuZ2xlLTEtZSd9fSk7XG5cbiAgICAgICAgJCgnLmFjY29yZGlvbicpLmFjY29yZGlvbih7aGVpZ2h0U3R5bGU6ICdjb250ZW50J30pO1xuICAgICAgICAkKCcuaGlkZGVuJykuaGlkZSgpO1xuXG4gICAgfSxcblxuICAgIGxheW91dERPTVNwYWNlU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnI2NvZGUtYnRuJykuc2hvdygpLnBvc2l0aW9uKHtteTogJ2xlZnQgYm90dG9tJywgYXQ6ICdsZWZ0IGJvdHRvbScsIG9mOiAnI21haW4nfSk7XG4gICAgICAgICQoJyNjb2RlLXBvcHVwJykucG9zaXRpb24oe215OiAnY2VudGVyJywgYXQ6ICdjZW50ZXInLCBvZjogd2luZG93fSk7XG4gICAgfSxcblxuICAgIHNob3dMb2dpbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICQoJyNsb2dpbi13aW5kb3cgLm1lc3NhZ2UnKS5oaWRlKCk7XG4gICAgICAgICQoJyNsb2dpbi13aW5kb3cnKS5zaG93KCkucG9zaXRpb24oe215OiAnY2VudGVyJywgYXQ6ICdjZW50ZXInLCBvZjogd2luZG93fSk7XG4gICAgICAgICQoJyN1c2VybG9naW4nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLnNlcnZlckxvZ2luKCQoJyN1c2VybmFtZScpLnZhbCgpLCAkKCcjcGFzc3dvcmQnKS52YWwoKSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCcjZ3Vlc3Rsb2dpbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuc2VydmVyTG9naW4oJCgnI2d0MScpLnZhbCgpICsgJyAnICsgJCgnI2d0MicpLnZhbCgpKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHNldExvZ2luRXJyb3I6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICB2YXIgbXNnID0gJCgnI2xvZ2luLXdpbmRvdyAubWVzc2FnZScpO1xuICAgICAgICBpZiAoIWVycm9yKSB7XG4gICAgICAgICAgICBtc2cuaGlkZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbXNnLmh0bWwoZXJyb3IpO1xuICAgICAgICAgICAgbXNnLnNob3coKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBoaWRlTG9naW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnI2xvZ2luLXdpbmRvdycpLmhpZGUoKTtcbiAgICB9XG59OyIsIi8qKlxuICogTGVhZGVyQm9hcmRDbGllbnQuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sZWFkZXJCb2FyZCA9IHt9O1xuICAgICAgICB0aGlzLmxlYWRlckJvYXJkQ2F0cyA9IFtdO1xuICAgICAgICB0aGlzLmxlYWRlckJvYXJkU3RhdGUgPSBudWxsO1xuICAgIH0sXG5cbiAgICBvbkNvbm5lY3RDQjogZnVuY3Rpb24gKHNvY2tldCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNvY2tldC5vbignbGVhZGVyYm9hcmQnLCBmdW5jdGlvbiAobGIpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGNhdCBpbiBsYikge1xuICAgICAgICAgICAgICAgIC8vIFJlY29yZCBuZXcgY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICBpZiAoIShjYXQgaW4gc2VsZi5sZWFkZXJCb2FyZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sZWFkZXJCb2FyZENhdHMucHVzaChjYXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBTdGFydCBjeWNsaW5nIGlmIHRoaXMgaXMgZmlyc3QgY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5sZWFkZXJCb2FyZFN0YXRlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubGVhZGVyQm9hcmRTdGF0ZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2FtZS5sZWFkZXJib2FyZC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgc2V0SW50ZXJ2YWwoc2VsZi5jeWNsZUxlYWRlckJvYXJkLmJpbmQoc2VsZiksIHNlbGYuY29uZmlnLmxlYWRlckJvYXJkQ2xpZW50Q3ljbGUgfHwgNTAwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIERpc3BsYXkgaWYgdXBkYXRlZCBib2FyZCBpcyBzaG93aW5nXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYubGVhZGVyQm9hcmRDYXRzW3NlbGYubGVhZGVyQm9hcmRTdGF0ZV0gPT09IGNhdCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmdhbWUubGVhZGVyYm9hcmQuc2V0Q29udGVudChjYXQsIGxiW2NhdF0sIHNlbGYucGxheWVyLmlkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWxmLmxlYWRlckJvYXJkW2NhdF0gPSBsYltjYXRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICBjeWNsZUxlYWRlckJvYXJkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubGVhZGVyQm9hcmRTdGF0ZSA9ICh0aGlzLmxlYWRlckJvYXJkU3RhdGUgKyAxKSAlIHRoaXMubGVhZGVyQm9hcmRDYXRzLmxlbmd0aDtcbiAgICAgICAgdmFyIGNhdCA9IHRoaXMubGVhZGVyQm9hcmRDYXRzW3RoaXMubGVhZGVyQm9hcmRTdGF0ZV07XG4gICAgICAgIHRoaXMuZ2FtZS5sZWFkZXJib2FyZC5zZXRDb250ZW50KGNhdCwgdGhpcy5sZWFkZXJCb2FyZFtjYXRdLCB0aGlzLnBsYXllci5pZCk7XG4gICAgfVxufTsiLCIvKipcbiAqIE1ldGhvZCBmb3IgZHJhd2luZyBzdGFyZmllbGRzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmFuZG9tTm9ybWFsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0ID0gMDtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPDY7IGkrKykge1xuICAgICAgICAgICAgdCArPSB0aGlzLmdhbWUucm5kLm5vcm1hbCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0LzY7XG4gICAgfSxcblxuICAgIGRyYXdTdGFyOiBmdW5jdGlvbiAoY3R4LCB4LCB5LCBkLCBjb2xvcikge1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgubW92ZVRvKHgtZCsxLCB5LWQrMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeCtkLTEsIHkrZC0xKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LWQrMSwgeStkLTEpO1xuICAgICAgICBjdHgubGluZVRvKHgrZC0xLCB5LWQrMSk7XG4gICAgICAgIGN0eC5tb3ZlVG8oeCwgeS1kKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4LCB5K2QpO1xuICAgICAgICBjdHgubW92ZVRvKHgtZCwgeSk7XG4gICAgICAgIGN0eC5saW5lVG8oeCtkLCB5KTtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH0sXG5cbiAgICBkcmF3U3RhckZpZWxkOiBmdW5jdGlvbiAoY3R4LCBzaXplLCBuKSB7XG4gICAgICAgIHZhciB4bSA9IE1hdGgucm91bmQoc2l6ZS8yICsgdGhpcy5yYW5kb21Ob3JtYWwoKSpzaXplLzQpO1xuICAgICAgICB2YXIgeW0gPSBNYXRoLnJvdW5kKHNpemUvMiArIHRoaXMucmFuZG9tTm9ybWFsKCkqc2l6ZS80KTtcbiAgICAgICAgdmFyIHF1YWRzID0gW1swLDAseG0tMSx5bS0xXSwgW3htLDAsc2l6ZS0xLHltLTFdLFxuICAgICAgICAgICAgWzAseW0seG0tMSxzaXplLTFdLCBbeG0seW0sc2l6ZS0xLHNpemUtMV1dO1xuICAgICAgICB2YXIgY29sb3I7XG4gICAgICAgIHZhciBpLCBqLCBsLCBxO1xuXG4gICAgICAgIG4gPSBNYXRoLnJvdW5kKG4vNCk7XG4gICAgICAgIGZvciAoaT0wLCBsPXF1YWRzLmxlbmd0aDsgaTxsOyBpKyspIHtcbiAgICAgICAgICAgIHEgPSBxdWFkc1tpXTtcbiAgICAgICAgICAgIGZvciAoaj0wOyBqPG47IGorKykge1xuICAgICAgICAgICAgICAgIGNvbG9yID0gJ2hzbCg2MCwxMDAlLCcgKyB0aGlzLmdhbWUucm5kLmJldHdlZW4oOTAsOTkpICsgJyUpJztcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdTdGFyKGN0eCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lLnJuZC5iZXR3ZWVuKHFbMF0rNywgcVsyXS03KSwgdGhpcy5nYW1lLnJuZC5iZXR3ZWVuKHFbMV0rNywgcVszXS03KSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lLnJuZC5iZXR3ZWVuKDIsNCksIGNvbG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07IiwiLyoqXG4gKiBXb3JsZEFwaS5qc1xuICpcbiAqIEFkZC9yZW1vdmUvbWFuaXB1bGF0ZSBib2RpZXMgaW4gY2xpZW50J3MgcGh5c2ljcyB3b3JsZFxuICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIEFkZCBib2R5IHRvIHdvcmxkIG9uIGNsaWVudCBzaWRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdHlwZSB7c3RyaW5nfSAtIHR5cGUgbmFtZSBvZiBvYmplY3QgdG8gYWRkXG4gICAgICogQHBhcmFtIGNvbmZpZyB7b2JqZWN0fSAtIHByb3BlcnRpZXMgZm9yIG5ldyBvYmplY3RcbiAgICAgKiBAcmV0dXJucyB7UGhhc2VyLlNwcml0ZX0gLSBuZXdseSBhZGRlZCBvYmplY3RcbiAgICAgKi9cbiAgICBhZGRCb2R5OiBmdW5jdGlvbiAodHlwZSwgY29uZmlnKSB7XG4gICAgICAgIHZhciBjdG9yID0gYm9keVR5cGVzW3R5cGVdO1xuICAgICAgICB2YXIgcGxheWVyU2hpcCA9IGZhbHNlO1xuICAgICAgICBpZiAoIWN0b3IpIHtcbiAgICAgICAgICAgIHRoaXMubG9nKCdVbmtub3duIGJvZHkgdHlwZTonLCB0eXBlKTtcbiAgICAgICAgICAgIHRoaXMubG9nKGNvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09ICdTaGlwJyAmJiBjb25maWcucHJvcGVydGllcy5wbGF5ZXJpZCA9PT0gdGhpcy5wbGF5ZXIuaWQpIHtcbiAgICAgICAgICAgIC8vY29uZmlnLnRhZyA9IHRoaXMucGxheWVyLnVzZXJuYW1lO1xuICAgICAgICAgICAgLy9pZiAoY29uZmlnLnByb3BlcnRpZXMucGxheWVyaWQgPT09IHRoaXMucGxheWVyLmlkKSB7XG4gICAgICAgICAgICAvLyBPbmx5IHRoZSBwbGF5ZXIncyBvd24gc2hpcCBpcyB0cmVhdGVkIGFzIGR5bmFtaWMgaW4gdGhlIGxvY2FsIHBoeXNpY3Mgc2ltXG4gICAgICAgICAgICBjb25maWcubWFzcyA9IHRoaXMuY29uZmlnLnBoeXNpY3NQcm9wZXJ0aWVzLlNoaXAubWFzcztcbiAgICAgICAgICAgIHBsYXllclNoaXAgPSB0cnVlO1xuICAgICAgICAgICAgLy99XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvZHkgPSBuZXcgY3Rvcih0aGlzLmdhbWUsIGNvbmZpZyk7XG4gICAgICAgIGlmICh0eXBlID09PSAnU2hpcCcpIHtcbiAgICAgICAgICAgIHRoaXMucGxheWVyTWFwW2NvbmZpZy5wcm9wZXJ0aWVzLnBsYXllcmlkXSA9IGJvZHk7XG4gICAgICAgIH1cbiAgICAgICAgLy90aGlzLmdhbWUuYWRkLmV4aXN0aW5nKGJvZHkpO1xuICAgICAgICB0aGlzLmdhbWUucGxheWZpZWxkLmFkZChib2R5KTtcbiAgICAgICAgaWYgKHBsYXllclNoaXApIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5jYW1lcmEuZm9sbG93KGJvZHkpO1xuICAgICAgICAgICAgdGhpcy5nYW1lLnBsYXllclNoaXAgPSBib2R5O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib2R5O1xuICAgIH0sXG5cbiAgICByZW1vdmVCb2R5OiBmdW5jdGlvbiAoc3ByaXRlKSB7XG4gICAgICAgIC8vc3ByaXRlLmtpbGwoKTtcbiAgICAgICAgc3ByaXRlLmRlc3Ryb3koKTtcbiAgICAgICAgLy8gUmVtb3ZlIG1pbmlzcHJpdGVcbiAgICAgICAgaWYgKHNwcml0ZS5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICAvL3Nwcml0ZS5taW5pc3ByaXRlLmtpbGwoKTtcbiAgICAgICAgICAgIHNwcml0ZS5taW5pc3ByaXRlLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICAvL3RoaXMuZ2FtZS5waHlzaWNzLnAyLnJlbW92ZUJvZHkoc3ByaXRlLmJvZHkpO1xuICAgIH1cbn07XG5cbnZhciBib2R5VHlwZXMgPSB7XG4gICAgU2hpcDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1NoaXAuanMnKSxcbiAgICBBc3Rlcm9pZDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0FzdGVyb2lkLmpzJyksXG4gICAgQ3J5c3RhbDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0NyeXN0YWwuanMnKSxcbiAgICBCdWxsZXQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9CdWxsZXQuanMnKSxcbiAgICBHZW5lcmljT3JiOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvR2VuZXJpY09yYi5qcycpLFxuICAgIFBsYW5ldG9pZDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1BsYW5ldG9pZC5qcycpLFxuICAgIFRyZWU6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9UcmVlLmpzJyksXG4gICAgVHJhY3RvckJlYW06IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9UcmFjdG9yQmVhbS5qcycpLFxuICAgIFN0YXJUYXJnZXQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9TdGFyVGFyZ2V0LmpzJylcbn07XG5cbiIsIi8qKiBjbGllbnQuanNcbiAqXG4gKiBNYWluIGVudHJ5IHBvaW50IGZvciBTdGFyY29kZXIgZ2FtZSBjbGllbnRcbiAqXG4gKiBAdHlwZSB7U3RhcmNvZGVyfGV4cG9ydHN9XG4gKi9cblxuLy9yZXF1aXJlKCcuL0Jsb2NrbHlDdXN0b20uanMnKTtcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG5cbi8vbG9jYWxTdG9yYWdlLmRlYnVnID0gJyc7ICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXNlZCB0byB0b2dnbGUgc29ja2V0LmlvIGRlYnVnZ2luZ1xuXG4vL2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4vLyAgICB2YXIgc3RhcmNvZGVyID0gbmV3IFN0YXJjb2RlcigpO1xuLy8gICAgc3RhcmNvZGVyLnN0YXJ0KCk7XG4vL30pO1xuXG4vLyB0ZXN0XG5cbiQoZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdGFyY29kZXIgPSBuZXcgU3RhcmNvZGVyKCk7XG4gICAgc3RhcmNvZGVyLnN0YXJ0KCk7XG59KTtcbiIsIi8qKlxuICogUGF0aC5qc1xuICpcbiAqIFZlY3RvciBwYXRocyBzaGFyZWQgYnkgbXVsdGlwbGUgZWxlbWVudHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUEkgPSBNYXRoLlBJO1xudmFyIFRBVSA9IDIqUEk7XG52YXIgc2luID0gTWF0aC5zaW47XG52YXIgY29zID0gTWF0aC5jb3M7XG5cbmV4cG9ydHMub2N0YWdvbiA9IFtcbiAgICBbMiwxXSxcbiAgICBbMSwyXSxcbiAgICBbLTEsMl0sXG4gICAgWy0yLDFdLFxuICAgIFstMiwtMV0sXG4gICAgWy0xLC0yXSxcbiAgICBbMSwtMl0sXG4gICAgWzIsLTFdXG5dO1xuXG5leHBvcnRzLmQyY3Jvc3MgPSBbXG4gICAgWy0xLC0yXSxcbiAgICBbLTEsMl0sXG4gICAgWzIsLTFdLFxuICAgIFstMiwtMV0sXG4gICAgWzEsMl0sXG4gICAgWzEsLTJdLFxuICAgIFstMiwxXSxcbiAgICBbMiwxXVxuXTtcblxuZXhwb3J0cy5zcXVhcmUwID0gW1xuICAgIFstMSwtMl0sXG4gICAgWzIsLTFdLFxuICAgIFsxLDJdLFxuICAgIFstMiwxXVxuXTtcblxuZXhwb3J0cy5zcXVhcmUxID0gW1xuICAgIFsxLC0yXSxcbiAgICBbMiwxXSxcbiAgICBbLTEsMl0sXG4gICAgWy0yLC0xXVxuXTtcblxuZXhwb3J0cy5zdGFyID0gW1xuICAgIFtzaW4oMCksIGNvcygwKV0sXG4gICAgW3NpbigyKlRBVS81KSwgY29zKDIqVEFVLzUpXSxcbiAgICBbc2luKDQqVEFVLzUpLCBjb3MoNCpUQVUvNSldLFxuICAgIFtzaW4oVEFVLzUpLCBjb3MoVEFVLzUpXSxcbiAgICBbc2luKDMqVEFVLzUpLCBjb3MoMypUQVUvNSldXG5dO1xuXG5leHBvcnRzLk9DVFJBRElVUyA9IE1hdGguc3FydCg1KTsiLCIvKipcbiAqIFVwZGF0ZVByb3BlcnRpZXMuanNcbiAqXG4gKiBDbGllbnQvc2VydmVyIHN5bmNhYmxlIHByb3BlcnRpZXMgZm9yIGdhbWUgb2JqZWN0c1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaGlwID0gZnVuY3Rpb24gKCkge307XG5TaGlwLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lV2lkdGgnLCAnbGluZUNvbG9yJywgJ2ZpbGxDb2xvcicsICdmaWxsQWxwaGEnLFxuICAgICd2ZWN0b3JTY2FsZScsICdzaGFwZScsICdzaGFwZUNsb3NlZCcsICdwbGF5ZXJpZCcsICdjcnlzdGFscycsICdkZWFkJywgJ3RhZyddO1xuXG52YXIgQXN0ZXJvaWQgPSBmdW5jdGlvbiAoKSB7fTtcbkFzdGVyb2lkLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWyd2ZWN0b3JTY2FsZSddO1xuXG52YXIgQ3J5c3RhbCA9IGZ1bmN0aW9uICgpIHt9O1xuQ3J5c3RhbC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsndmVjdG9yU2NhbGUnXTtcblxudmFyIEdlbmVyaWNPcmIgPSBmdW5jdGlvbiAoKSB7fTtcbkdlbmVyaWNPcmIucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVDb2xvcicsICd2ZWN0b3JTY2FsZSddO1xuXG52YXIgUGxhbmV0b2lkID0gZnVuY3Rpb24gKCkge307XG5QbGFuZXRvaWQucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVDb2xvcicsICdmaWxsQ29sb3InLCAnbGluZVdpZHRoJywgJ2ZpbGxBbHBoYScsICd2ZWN0b3JTY2FsZScsICdvd25lciddO1xuXG52YXIgVHJlZSA9IGZ1bmN0aW9uICgpIHt9O1xuVHJlZS5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsndmVjdG9yU2NhbGUnLCAnbGluZUNvbG9yJywgJ2dyYXBoJywgJ3N0ZXAnLCAnZGVwdGgnXTtcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uICgpIHt9O1xuQnVsbGV0LnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lQ29sb3InXTtcblxudmFyIFRyYWN0b3JCZWFtID0gZnVuY3Rpb24gKCkge307XG5UcmFjdG9yQmVhbS5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFtdO1xuXG52YXIgU3RhclRhcmdldCA9IGZ1bmN0aW9uICgpIHt9O1xuU3RhclRhcmdldC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsnc3RhcnMnLCAnbGluZUNvbG9yJywgJ3ZlY3RvclNjYWxlJ107XG5cblxuZXhwb3J0cy5TaGlwID0gU2hpcDtcbmV4cG9ydHMuQXN0ZXJvaWQgPSBBc3Rlcm9pZDtcbmV4cG9ydHMuQ3J5c3RhbCA9IENyeXN0YWw7XG5leHBvcnRzLkdlbmVyaWNPcmIgPSBHZW5lcmljT3JiO1xuZXhwb3J0cy5CdWxsZXQgPSBCdWxsZXQ7XG5leHBvcnRzLlBsYW5ldG9pZCA9IFBsYW5ldG9pZDtcbmV4cG9ydHMuVHJlZSA9IFRyZWU7XG5leHBvcnRzLlRyYWN0b3JCZWFtID0gVHJhY3RvckJlYW07XG5leHBvcnRzLlN0YXJUYXJnZXQgPSBTdGFyVGFyZ2V0O1xuIiwiLyoqXG4gKiBBc3Rlcm9pZC5qc1xuICpcbiAqIENsaWVudCBzaWRlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5Bc3Rlcm9pZDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgQXN0ZXJvaWQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG4gICAgLy90aGlzLmJvZHkuZGFtcGluZyA9IDA7XG59O1xuXG5Bc3Rlcm9pZC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgb3B0aW9ucykge1xuICAgIHZhciBhID0gbmV3IEFzdGVyb2lkKGdhbWUsIG9wdGlvbnMpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBhO1xufTtcblxuQXN0ZXJvaWQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcbkFzdGVyb2lkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFzdGVyb2lkO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQXN0ZXJvaWQucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEFzdGVyb2lkLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5Bc3Rlcm9pZC5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmYwMGZmJztcbkFzdGVyb2lkLnByb3RvdHlwZS5fZmlsbENvbG9yID0gJyNmZjAwMDAnO1xuQXN0ZXJvaWQucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMjU7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBBc3Rlcm9pZDtcbi8vU3RhcmNvZGVyLkFzdGVyb2lkID0gQXN0ZXJvaWQ7XG4iLCIvKipcbiAqIEJ1bGxldC5qc1xuICpcbiAqIENsaWVudCBzaWRlIGltcGxlbWVudGF0aW9uIG9mIHNpbXBsZSBwcm9qZWN0aWxlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG4vL3ZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkJ1bGxldDtcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIHRoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG59O1xuXG5CdWxsZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcbkJ1bGxldC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCdWxsZXQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShCdWxsZXQucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEJ1bGxldC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuQnVsbGV0LnByb3RvdHlwZS52aXNpYmxlT25NYXAgPSBmYWxzZTtcbkJ1bGxldC5wcm90b3R5cGUuc2hhcmVkVGV4dHVyZUtleSA9ICdsYXNlcic7XG5cbkJ1bGxldC5wcm90b3R5cGUuZHJhd1Byb2NlZHVyZSA9IGZ1bmN0aW9uIChyZW5kZXJTY2FsZSwgZnJhbWUpIHtcbiAgICB2YXIgc2NhbGUgPSB0aGlzLmdhbWUucGh5c2ljcy5wMi5tcHhpKHRoaXMudmVjdG9yU2NhbGUpICogcmVuZGVyU2NhbGU7XG4gICAgdGhpcy5ncmFwaGljcy5saW5lU3R5bGUoNCwgUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMubGluZUNvbG9yKSwgMSk7XG4gICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8oMCwgMCk7XG4gICAgdGhpcy5ncmFwaGljcy5saW5lVG8oMCwgMSAqIHNjYWxlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0OyIsIi8qKlxuICogQ3J5c3RhbC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuQ3J5c3RhbDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgQ3J5c3RhbCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkNyeXN0YWwuYWRkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIHZhciBhID0gbmV3IENyeXN0YWwoZ2FtZSwgY29uZmlnKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gYTtcbn07XG5cbkNyeXN0YWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcbkNyeXN0YWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ3J5c3RhbDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKENyeXN0YWwucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKENyeXN0YWwucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkNyeXN0YWwucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnIzAwZmZmZic7XG5DcnlzdGFsLnByb3RvdHlwZS5fZmlsbENvbG9yID0gJyMwMDAwMDAnO1xuQ3J5c3RhbC5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcbkNyeXN0YWwucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuQ3J5c3RhbC5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMDtcbkNyeXN0YWwucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5DcnlzdGFsLnByb3RvdHlwZS5fZ2VvbWV0cnkgPSBbXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLmQyY3Jvc3N9XG5dO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3J5c3RhbDtcbiIsIi8qKlxuICogR2VuZXJpY09yYi5qc1xuICpcbiAqIEJ1aWxkaW5nIGJsb2NrXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5HZW5lcmljT3JiO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBHZW5lcmljT3JiID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuR2VuZXJpY09yYi5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgdmFyIGEgPSBuZXcgR2VuZXJpY09yYihnYW1lLCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBhO1xufTtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmljT3JiO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoR2VuZXJpY09yYi5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoR2VuZXJpY09yYi5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmYwMDAwJztcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwMDAwMCc7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4wO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUuX2dlb21ldHJ5ID0gW1xuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5kMmNyb3NzfVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmljT3JiO1xuIiwiLyoqXG4gKiBQbGFuZXRvaWQuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlBsYW5ldG9pZDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgUGxhbmV0b2lkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG59O1xuXG5QbGFuZXRvaWQuYWRkID0gZnVuY3Rpb24gKGdhbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgcGxhbmV0b2lkID0gbmV3IFBsYW5ldG9pZChnYW1lLCBvcHRpb25zKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gcGxhbmV0b2lkO1xufTtcblxuUGxhbmV0b2lkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5QbGFuZXRvaWQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGxhbmV0b2lkO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoUGxhbmV0b2lkLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShQbGFuZXRvaWQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbi8vUGxhbmV0b2lkLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZjAwZmYnO1xuLy9QbGFuZXRvaWQucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwZmYwMCc7XG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMjU7XG5QbGFuZXRvaWQucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5QbGFuZXRvaWQucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5QbGFuZXRvaWQucHJvdG90eXBlLl9nZW9tZXRyeSA9IFtcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuZDJjcm9zc30sXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLnNxdWFyZTB9LFxuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5zcXVhcmUxfVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGFuZXRvaWQ7XG4iLCIvKipcbiAqIFNoaXAuanNcbiAqXG4gKiBDbGllbnQgc2lkZSBpbXBsZW1lbnRhdGlvblxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuU2hpcDtcbi8vdmFyIEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lLmpzJyk7XG4vL3ZhciBXZWFwb25zID0gcmVxdWlyZSgnLi9XZWFwb25zLmpzJyk7XG5cbnZhciBTaGlwID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xuXG4gICAgaWYgKGNvbmZpZy5tYXNzKSB7XG4gICAgICAgIHRoaXMuYm9keS5tYXNzID0gY29uZmlnLm1hc3M7XG4gICAgfVxuICAgIC8vdGhpcy5lbmdpbmUgPSBFbmdpbmUuYWRkKGdhbWUsICd0aHJ1c3QnLCA1MDApO1xuICAgIC8vdGhpcy5hZGRDaGlsZCh0aGlzLmVuZ2luZSk7XG4gICAgLy90aGlzLndlYXBvbnMgPSBXZWFwb25zLmFkZChnYW1lLCAnYnVsbGV0JywgMTIpO1xuICAgIC8vdGhpcy53ZWFwb25zLnNoaXAgPSB0aGlzO1xuICAgIC8vdGhpcy5hZGRDaGlsZCh0aGlzLndlYXBvbnMpO1xuICAgIHRoaXMudGFnVGV4dCA9IGdhbWUuYWRkLnRleHQoMCwgdGhpcy50ZXh0dXJlLmhlaWdodC8yICsgMSxcbiAgICAgICAgdGhpcy50YWcsIHtmb250OiAnYm9sZCAxOHB4IEFyaWFsJywgZmlsbDogdGhpcy5saW5lQ29sb3IgfHwgJyNmZmZmZmYnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICB0aGlzLnRhZ1RleHQuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLnRhZ1RleHQpO1xuICAgIHRoaXMubG9jYWxTdGF0ZSA9IHtcbiAgICAgICAgdGhydXN0OiAnb2ZmJ1xuICAgIH1cbn07XG5cblNoaXAuYWRkID0gZnVuY3Rpb24gKGdhbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgcyA9IG5ldyBTaGlwKGdhbWUsIG9wdGlvbnMpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHMpO1xuICAgIHJldHVybiBzO1xufTtcblxuU2hpcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuU2hpcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTaGlwO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoU2hpcC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoU2hpcC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuU2hpcC5wcm90b3R5cGUubWFwRmFjdG9yID0gMztcblxuLy9TaGlwLnByb3RvdHlwZS5zZXRMaW5lU3R5bGUgPSBmdW5jdGlvbiAoY29sb3IsIGxpbmVXaWR0aCkge1xuLy8gICAgU3RhcmNvZGVyLlZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0TGluZVN0eWxlLmNhbGwodGhpcywgY29sb3IsIGxpbmVXaWR0aCk7XG4vLyAgICB0aGlzLnRhZ1RleHQuc2V0U3R5bGUoe2ZpbGw6IGNvbG9yfSk7XG4vL307XG5cbi8vU2hpcC5wcm90b3R5cGUuc2hhcGUgPSBbXG4vLyAgICBbLTEsLTFdLFxuLy8gICAgWy0wLjUsMF0sXG4vLyAgICBbLTEsMV0sXG4vLyAgICBbMCwwLjVdLFxuLy8gICAgWzEsMV0sXG4vLyAgICBbMC41LDBdLFxuLy8gICAgWzEsLTFdLFxuLy8gICAgWzAsLTAuNV0sXG4vLyAgICBbLTEsLTFdXG4vL107XG4vL1NoaXAucHJvdG90eXBlLl9saW5lV2lkdGggPSA2O1xuXG5TaGlwLnByb3RvdHlwZS51cGRhdGVUZXh0dXJlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBGSVhNRTogUHJvYmFibHkgbmVlZCB0byByZWZhY3RvciBjb25zdHJ1Y3RvciBhIGJpdCB0byBtYWtlIHRoaXMgY2xlYW5lclxuICAgIFZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlVGV4dHVyZXMuY2FsbCh0aGlzKTtcbiAgICBpZiAodGhpcy50YWdUZXh0KSB7XG4gICAgICAgIC8vdGhpcy50YWdUZXh0LnNldFN0eWxlKHtmaWxsOiB0aGlzLmxpbmVDb2xvcn0pO1xuICAgICAgICB0aGlzLnRhZ1RleHQuZmlsbCA9IHRoaXMubGluZUNvbG9yO1xuICAgICAgICB0aGlzLnRhZ1RleHQueSA9IHRoaXMudGV4dHVyZS5oZWlnaHQvMiArIDE7XG4gICAgfVxufTtcblxuU2hpcC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIFZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcyk7XG4gICAgLy8gRklYTUU6IE5lZWQgdG8gZGVhbCB3aXRoIHBsYXllciB2ZXJzdXMgZm9yZWlnbiBzaGlwc1xuICAgIHN3aXRjaCAodGhpcy5sb2NhbFN0YXRlLnRocnVzdCkge1xuICAgICAgICBjYXNlICdzdGFydGluZyc6XG4gICAgICAgICAgICB0aGlzLmdhbWUuc291bmRzLnBsYXllcnRocnVzdC5wbGF5KCk7XG4gICAgICAgICAgICB0aGlzLmdhbWUudGhydXN0Z2VuZXJhdG9yLnN0YXJ0T24odGhpcyk7XG4gICAgICAgICAgICB0aGlzLmxvY2FsU3RhdGUudGhydXN0ID0gJ29uJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzaHV0ZG93bic6XG4gICAgICAgICAgICB0aGlzLmdhbWUuc291bmRzLnBsYXllcnRocnVzdC5zdG9wKCk7XG4gICAgICAgICAgICB0aGlzLmdhbWUudGhydXN0Z2VuZXJhdG9yLnN0b3BPbih0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdGF0ZS50aHJ1c3QgPSAnb2ZmJztcbiAgICB9XG4gICAgLy8gUGxheWVyIHNoaXAgb25seVxuICAgIGlmICh0aGlzLmdhbWUucGxheWVyU2hpcCA9PT0gdGhpcykge1xuICAgICAgICB0aGlzLmdhbWUuaW52ZW50b3J5dGV4dC5zZXRUZXh0KHRoaXMuY3J5c3RhbHMudG9TdHJpbmcoKSk7XG4gICAgfVxufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICd0YWcnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90YWc7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fdGFnID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcDtcbi8vU3RhcmNvZGVyLlNoaXAgPSBTaGlwO1xuIiwiLyoqXG4gKiBTaW1wbGVQYXJ0aWNsZS5qc1xuICpcbiAqIEJhc2ljIGJpdG1hcCBwYXJ0aWNsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8vdmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uLy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gZnVuY3Rpb24gKGdhbWUsIGtleSkge1xuICAgIHZhciB0ZXh0dXJlID0gU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZVtrZXldO1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCAwLCAwLCB0ZXh0dXJlKTtcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHRoaXMsIGZhbHNlLCBmYWxzZSk7XG4gICAgdGhpcy5ib2R5LmNsZWFyU2hhcGVzKCk7XG4gICAgdmFyIHNoYXBlID0gdGhpcy5ib2R5LmFkZFBhcnRpY2xlKCk7XG4gICAgc2hhcGUuc2Vuc29yID0gdHJ1ZTtcbiAgICAvL3RoaXMua2lsbCgpO1xufTtcblxuU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZSA9IHt9O1xuXG5TaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUgPSBmdW5jdGlvbiAoZ2FtZSwga2V5LCBjb2xvciwgc2l6ZSwgY2lyY2xlKSB7XG4gICAgdmFyIHRleHR1cmUgPSBnYW1lLm1ha2UuYml0bWFwRGF0YShzaXplLCBzaXplKTtcbiAgICB0ZXh0dXJlLmN0eC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICBpZiAoY2lyY2xlKSB7XG4gICAgICAgIHRleHR1cmUuY3R4LmFyYyhzaXplLzIsIHNpemUvMiwgc2l6ZS8yLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xuICAgICAgICB0ZXh0dXJlLmN0eC5maWxsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dHVyZS5jdHguZmlsbFJlY3QoMCwgMCwgc2l6ZSwgc2l6ZSk7XG4gICAgfVxuICAgIFNpbXBsZVBhcnRpY2xlLl90ZXh0dXJlQ2FjaGVba2V5XSA9IHRleHR1cmU7XG59O1xuXG5TaW1wbGVQYXJ0aWNsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcblNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNpbXBsZVBhcnRpY2xlO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlUGFydGljbGU7XG4vL1N0YXJjb2Rlci5TaW1wbGVQYXJ0aWNsZSA9IFNpbXBsZVBhcnRpY2xlOyIsIi8qKlxuICogU3RhclRhcmdldC5qc1xuICpcbiAqIENsaWVudCBzaWRlIGltcGxlbWVudGF0aW9uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5TdGFyVGFyZ2V0O1xuXG52YXIgc3RhciA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpLnN0YXI7XG5cbnZhciBTdGFyVGFyZ2V0ID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG59O1xuXG5TdGFyVGFyZ2V0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5TdGFyVGFyZ2V0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0YXJUYXJnZXQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTdGFyVGFyZ2V0LnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTdGFyVGFyZ2V0LnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5TdGFyVGFyZ2V0LnByb3RvdHlwZS5kcmF3UHJvY2VkdXJlID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlKSB7XG4gICAgdmFyIHBzYyA9IHRoaXMuZ2FtZS5waHlzaWNzLnAyLm1weGkocmVuZGVyU2NhbGUpO1xuICAgIHZhciBnc2MgPSBwc2MqdGhpcy52ZWN0b3JTY2FsZTtcbiAgICB2YXIgbGluZUNvbG9yID0gUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMubGluZUNvbG9yKTtcbiAgICB0aGlzLmdyYXBoaWNzLmxpbmVTdHlsZSgxLCBsaW5lQ29sb3IsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5zdGFycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDAsIGsgPSBzdGFyLmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgdmFyIHggPSBwc2MgKiB0aGlzLnN0YXJzW2ldWzBdICsgZ3NjICogc3RhcltqXVswXTtcbiAgICAgICAgICAgIHZhciB5ID0gcHNjICogdGhpcy5zdGFyc1tpXVsxXSArIGdzYyAqIHN0YXJbal1bMV07XG4gICAgICAgICAgICBpZiAoaiA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MubW92ZVRvKHgsIHkpO1xuICAgICAgICAgICAgICAgIHZhciB4MCA9IHg7XG4gICAgICAgICAgICAgICAgdmFyIHkwID0geTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lVG8oeCwgeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lVG8oeDAsIHkwKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJUYXJnZXQ7IiwiLyoqXG4gKiBTeW5jQm9keUludGVyZmFjZS5qc1xuICpcbiAqIFNoYXJlZCBtZXRob2RzIGZvciBWZWN0b3JTcHJpdGVzLCBQYXJ0aWNsZXMsIGV0Yy5cbiAqL1xuXG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSBmdW5jdGlvbiAoKSB7fTtcblxuLyoqXG4gKiBTZXQgbG9jYXRpb24gYW5kIGFuZ2xlIG9mIGEgcGh5c2ljcyBvYmplY3QuIFZhbHVlIGFyZSBnaXZlbiBpbiB3b3JsZCBjb29yZGluYXRlcywgbm90IHBpeGVsc1xuICpcbiAqIEBwYXJhbSB4IHtudW1iZXJ9XG4gKiBAcGFyYW0geSB7bnVtYmVyfVxuICogQHBhcmFtIGEge251bWJlcn1cbiAqL1xuU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlLnNldFBvc0FuZ2xlID0gZnVuY3Rpb24gKHgsIHksIGEpIHtcbiAgICB0aGlzLmJvZHkuZGF0YS5wb3NpdGlvblswXSA9IC0oeCB8fCAwKTtcbiAgICB0aGlzLmJvZHkuZGF0YS5wb3NpdGlvblsxXSA9IC0oeSB8fCAwKTtcbiAgICB0aGlzLmJvZHkuZGF0YS5hbmdsZSA9IGEgfHwgMDtcbn07XG5cblN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZS5jb25maWcgPSBmdW5jdGlvbiAocHJvcGVydGllcykge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy51cGRhdGVQcm9wZXJ0aWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgayA9IHRoaXMudXBkYXRlUHJvcGVydGllc1tpXTtcbiAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzW2tdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpc1trXSA9IHByb3BlcnRpZXNba107ICAgICAgICAvLyBGSVhNRT8gVmlydHVhbGl6ZSBzb21laG93XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bmNCb2R5SW50ZXJmYWNlOyIsIi8qKlxuICogVGhydXN0R2VuZXJhdG9yLmpzXG4gKlxuICogR3JvdXAgcHJvdmlkaW5nIEFQSSwgbGF5ZXJpbmcsIGFuZCBwb29saW5nIGZvciB0aHJ1c3QgcGFydGljbGUgZWZmZWN0c1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcblxudmFyIF90ZXh0dXJlS2V5ID0gJ3RocnVzdCc7XG5cbi8vIFBvb2xpbmcgcGFyYW1ldGVyc1xudmFyIF9taW5Qb29sU2l6ZSA9IDMwMDtcbnZhciBfbWluRnJlZVBhcnRpY2xlcyA9IDIwO1xudmFyIF9zb2Z0UG9vbExpbWl0ID0gMjAwO1xudmFyIF9oYXJkUG9vbExpbWl0ID0gNTAwO1xuXG4vLyBCZWhhdmlvciBvZiBlbWl0dGVyXG52YXIgX3BhcnRpY2xlc1BlckJ1cnN0ID0gNTtcbnZhciBfcGFydGljbGVUVEwgPSAxNTA7XG52YXIgX3BhcnRpY2xlQmFzZVNwZWVkID0gNTtcbnZhciBfY29uZUxlbmd0aCA9IDE7XG52YXIgX2NvbmVXaWR0aFJhdGlvID0gMC4yO1xudmFyIF9lbmdpbmVPZmZzZXQgPSAtMjA7XG5cbnZhciBUaHJ1c3RHZW5lcmF0b3IgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUpO1xuXG4gICAgdGhpcy50aHJ1c3RpbmdTaGlwcyA9IHt9O1xuXG4gICAgLy8gUHJlZ2VuZXJhdGUgYSBiYXRjaCBvZiBwYXJ0aWNsZXNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9taW5Qb29sU2l6ZTsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0aWNsZSA9IHRoaXMuYWRkKG5ldyBTaW1wbGVQYXJ0aWNsZShnYW1lLCBfdGV4dHVyZUtleSkpO1xuICAgICAgICBwYXJ0aWNsZS5hbHBoYSA9IDAuNTtcbiAgICAgICAgcGFydGljbGUucm90YXRpb24gPSBNYXRoLlBJLzQ7XG4gICAgICAgIHBhcnRpY2xlLmtpbGwoKTtcbiAgICB9XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUaHJ1c3RHZW5lcmF0b3I7XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUuc3RhcnRPbiA9IGZ1bmN0aW9uIChzaGlwKSB7XG4gICAgdGhpcy50aHJ1c3RpbmdTaGlwc1tzaGlwLmlkXSA9IHNoaXA7XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLnN0b3BPbiA9IGZ1bmN0aW9uIChzaGlwKSB7XG4gICAgZGVsZXRlIHRoaXMudGhydXN0aW5nU2hpcHNbc2hpcC5pZF07XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMudGhydXN0aW5nU2hpcHMpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHNoaXAgPSB0aGlzLnRocnVzdGluZ1NoaXBzW2tleXNbaV1dO1xuICAgICAgICB2YXIgdyA9IHNoaXAud2lkdGg7XG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihzaGlwLnJvdGF0aW9uKTtcbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKHNoaXAucm90YXRpb24pO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IF9wYXJ0aWNsZXNQZXJCdXJzdDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgcGFydGljbGUgPSB0aGlzLmdldEZpcnN0RGVhZCgpO1xuICAgICAgICAgICAgaWYgKCFwYXJ0aWNsZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3QgZW5vdWdoIHRocnVzdCBwYXJ0aWNsZXMgaW4gcG9vbCcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGQgPSB0aGlzLmdhbWUucm5kLnJlYWxJblJhbmdlKC1fY29uZVdpZHRoUmF0aW8qdywgX2NvbmVXaWR0aFJhdGlvKncpO1xuICAgICAgICAgICAgdmFyIHggPSBzaGlwLnggKyBkKmNvcyArIF9lbmdpbmVPZmZzZXQqc2luO1xuICAgICAgICAgICAgdmFyIHkgPSBzaGlwLnkgKyBkKnNpbiAtIF9lbmdpbmVPZmZzZXQqY29zO1xuICAgICAgICAgICAgcGFydGljbGUubGlmZXNwYW4gPSBfcGFydGljbGVUVEw7XG4gICAgICAgICAgICBwYXJ0aWNsZS5yZXNldCh4LCB5KTtcbiAgICAgICAgICAgIHBhcnRpY2xlLmJvZHkudmVsb2NpdHkueCA9IF9wYXJ0aWNsZUJhc2VTcGVlZCooX2NvbmVMZW5ndGgqc2luIC0gZCpjb3MpO1xuICAgICAgICAgICAgcGFydGljbGUuYm9keS52ZWxvY2l0eS55ID0gX3BhcnRpY2xlQmFzZVNwZWVkKigtX2NvbmVMZW5ndGgqY29zIC0gZCpzaW4pO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuVGhydXN0R2VuZXJhdG9yLnRleHR1cmVLZXkgPSBfdGV4dHVyZUtleTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaHJ1c3RHZW5lcmF0b3I7IiwiLyoqXG4gKiBUb2FzdC5qc1xuICpcbiAqIENsYXNzIGZvciB2YXJpb3VzIGtpbmRzIG9mIHBvcCB1cCBtZXNzYWdlc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBUb2FzdCA9IGZ1bmN0aW9uIChnYW1lLCB4LCB5LCB0ZXh0LCBjb25maWcpIHtcbiAgICAvLyBUT0RPOiBiZXR0ZXIgZGVmYXVsdHMsIG1heWJlXG4gICAgUGhhc2VyLlRleHQuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCB0ZXh0LCB7XG4gICAgICAgIGZvbnQ6ICcxNHB0IEFyaWFsJyxcbiAgICAgICAgYWxpZ246ICdjZW50ZXInLFxuICAgICAgICBmaWxsOiAnI2ZmYTUwMCdcbiAgICB9KTtcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgLy8gU2V0IHVwIHN0eWxlcyBhbmQgdHdlZW5zXG4gICAgdmFyIHNwZWMgPSB7fTtcbiAgICBpZiAoY29uZmlnLnVwKSB7XG4gICAgICAgIHNwZWMueSA9ICctJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5kb3duKSB7XG4gICAgICAgIHNwZWMueSA9ICcrJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5sZWZ0KSB7XG4gICAgICAgIHNwZWMueCA9ICctJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5yaWdodCkge1xuICAgICAgICBzcGVjLnggPSAnKycgKyBjb25maWcudXA7XG4gICAgfVxuICAgIHN3aXRjaCAoY29uZmlnLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnc3Bpbm5lcic6XG4gICAgICAgICAgICB0aGlzLmZvbnRTaXplID0gJzIwcHQnO1xuICAgICAgICAgICAgc3BlYy5yb3RhdGlvbiA9IGNvbmZpZy5yZXZvbHV0aW9ucyA/IGNvbmZpZy5yZXZvbHV0aW9ucyAqIDIgKiBNYXRoLlBJIDogMiAqIE1hdGguUEk7XG4gICAgICAgICAgICB2YXIgdHdlZW4gPSBnYW1lLmFkZC50d2Vlbih0aGlzKS50byhzcGVjLCBjb25maWcuZHVyYXRpb24sIGNvbmZpZy5lYXNpbmcsIHRydWUpO1xuICAgICAgICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoZnVuY3Rpb24gKHRvYXN0KSB7XG4gICAgICAgICAgICAgICAgdG9hc3Qua2lsbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIFRPRE86IE1vcmUga2luZHNcbiAgICB9XG59O1xuXG4vKipcbiAqIENyZWF0ZSBuZXcgVG9hc3QgYW5kIGFkZCB0byBnYW1lXG4gKlxuICogQHBhcmFtIGdhbWVcbiAqIEBwYXJhbSB4XG4gKiBAcGFyYW0geVxuICogQHBhcmFtIHRleHRcbiAqIEBwYXJhbSBjb25maWdcbiAqL1xuVG9hc3QuYWRkID0gZnVuY3Rpb24gKGdhbWUsIHgsIHksIHRleHQsIGNvbmZpZykge1xuICAgIHZhciB0b2FzdCA9IG5ldyBUb2FzdChnYW1lLCB4LCB5LCB0ZXh0LCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRvYXN0KTtcbn07XG5cbi8vIENvdmVuaWVuY2UgbWV0aG9kcyBmb3IgY29tbW9uIGNhc2VzXG5cblRvYXN0LnNwaW5VcCA9IGZ1bmN0aW9uIChnYW1lLCB4LCB5LCB0ZXh0KSB7XG4gICAgdmFyIHRvYXN0ID0gbmV3IFRvYXN0IChnYW1lLCB4LCB5LCB0ZXh0LCB7XG4gICAgICAgIHR5cGU6ICdzcGlubmVyJyxcbiAgICAgICAgcmV2b2x1dGlvbnM6IDEsXG4gICAgICAgIGR1cmF0aW9uOiA1MDAsXG4gICAgICAgIGVhc2luZzogUGhhc2VyLkVhc2luZy5FbGFzdGljLk91dCxcbiAgICAgICAgdXA6IDEwMFxuICAgIH0pO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRvYXN0KTtcbn07XG5cblRvYXN0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlRleHQucHJvdG90eXBlKTtcblRvYXN0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRvYXN0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvYXN0O1xuIiwiLyoqXG4gKiBUcmFjdG9yQmVhbS5qc1xuICpcbiAqIENsaWVudCBzaWRlIGltcGxlbWVudGF0aW9uIG9mIGEgc2luZ2xlIHRyYWN0b3IgYmVhbSBzZWdtZW50XG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy9GSVhNRTogTmljZXIgaW1wbGVtZW50YXRpb25cblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSByZXF1aXJlKCcuL1NpbXBsZVBhcnRpY2xlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuVHJhY3RvckJlYW07XG5cbnZhciBUcmFjdG9yQmVhbSA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWxsKHRoaXMsIGdhbWUsICd0cmFjdG9yJyk7XG4gICAgdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cblRyYWN0b3JCZWFtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU2ltcGxlUGFydGljbGUucHJvdG90eXBlKTtcblRyYWN0b3JCZWFtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRyYWN0b3JCZWFtO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJhY3RvckJlYW0ucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFRyYWN0b3JCZWFtLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWN0b3JCZWFtOyIsIi8qKlxuICogVHJlZS5qc1xuICpcbiAqIENsaWVudCBzaWRlXG4gKi9cblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5UcmVlO1xuXG52YXIgVHJlZSA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMSk7XG59O1xuXG5UcmVlLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICB2YXIgdHJlZSA9IG5ldyBUcmVlIChnYW1lLCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRyZWUpO1xuICAgIHJldHVybiB0cmVlO1xufTtcblxuVHJlZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuVHJlZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUcmVlO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJlZS5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJlZS5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuLyoqXG4gKiBEcmF3IHRyZWUsIG92ZXJyaWRpbmcgc3RhbmRhcmQgc2hhcGUgYW5kIGdlb21ldHJ5IG1ldGhvZCB0byB1c2UgZ3JhcGhcbiAqXG4gKiBAcGFyYW0gcmVuZGVyU2NhbGVcbiAqL1xuVHJlZS5wcm90b3R5cGUuZHJhd1Byb2NlZHVyZSA9IGZ1bmN0aW9uIChyZW5kZXJTY2FsZSkge1xuICAgIHZhciBsaW5lQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpO1xuICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKDEsIGxpbmVDb2xvciwgMSk7XG4gICAgdGhpcy5fZHJhd0JyYW5jaCh0aGlzLmdyYXBoLCB0aGlzLmdhbWUucGh5c2ljcy5wMi5tcHhpKHRoaXMudmVjdG9yU2NhbGUpKnJlbmRlclNjYWxlLCB0aGlzLmRlcHRoKTtcbn07XG5cblRyZWUucHJvdG90eXBlLl9kcmF3QnJhbmNoID0gZnVuY3Rpb24gKGdyYXBoLCBzYywgZGVwdGgpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGdyYXBoLmMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGdyYXBoLmNbaV07XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubW92ZVRvKGdyYXBoLnggKiBzYywgZ3JhcGgueSAqIHNjKTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lVG8oY2hpbGQueCAqIHNjLCBjaGlsZC55ICogc2MpO1xuICAgICAgICBpZiAoZGVwdGggPiB0aGlzLnN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMuX2RyYXdCcmFuY2goY2hpbGQsIHNjLCBkZXB0aCAtIDEpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFRyZWUucHJvdG90eXBlLCAnc3RlcCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0ZXA7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fc3RlcCA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyZWU7IiwiLyoqXG4gKiBTcHJpdGUgd2l0aCBhdHRhY2hlZCBHcmFwaGljcyBvYmplY3QgZm9yIHZlY3Rvci1saWtlIGdyYXBoaWNzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG52YXIgZnJhbWVUZXh0dXJlUG9vbCA9IHt9O1xudmFyIG1hcFRleHR1cmVQb29sID0ge307XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgVmVjdG9yLWJhc2VkIHNwcml0ZXNcbiAqXG4gKiBAcGFyYW0gZ2FtZSB7UGhhc2VyLkdhbWV9IC0gUGhhc2VyIGdhbWUgb2JqZWN0XG4gKiBAcGFyYW0gY29uZmlnIHtvYmplY3R9IC0gUE9KTyB3aXRoIGNvbmZpZyBkZXRhaWxzXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIFZlY3RvclNwcml0ZSA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICAvL3RoaXMuZ3JhcGhpY3MgPSBnYW1lLm1ha2UuZ3JhcGhpY3MoKTtcbiAgICB0aGlzLmdyYXBoaWNzID0gdGhpcy5nYW1lLnNoYXJlZEdyYXBoaWNzO1xuICAgIC8vdGhpcy50ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgLy90aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG5cbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHRoaXMsIGZhbHNlLCBmYWxzZSk7XG4gICAgdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbiAgICB0aGlzLmNvbmZpZyhjb25maWcucHJvcGVydGllcyk7XG5cbiAgICBpZiAodGhpcy52aXNpYmxlT25NYXApIHtcbiAgICAgICAgdGhpcy5taW5pc3ByaXRlID0gdGhpcy5nYW1lLm1pbmltYXAuY3JlYXRlKCk7XG4gICAgICAgIHRoaXMubWluaXNwcml0ZS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNoYXJlZFRleHR1cmVLZXkpIHtcbiAgICAgICAgdGhpcy5mcmFtZXMgPSB0aGlzLmdldEZyYW1lUG9vbCh0aGlzLnNoYXJlZFRleHR1cmVLZXkpO1xuICAgICAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICB0aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nZXRNYXBQb29sKHRoaXMuc2hhcmVkVGV4dHVyZUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZnJhbWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRUZXh0dXJlKHRoaXMuZnJhbWVzW3RoaXMudkZyYW1lXSk7XG4gICAgICAgICAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taW5pc3ByaXRlLnNldFRleHR1cmUodGhpcy5taW5pdGV4dHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZyYW1lcyA9IFtdO1xuICAgICAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICB0aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xuICAgIH1cblxuICAgIC8vdGhpcy51cGRhdGVUZXh0dXJlcygpO1xuICAgIGlmICh0aGlzLmZwcykge1xuICAgICAgICB0aGlzLl9tc1BlckZyYW1lID0gMTAwMCAvIHRoaXMuZnBzO1xuICAgICAgICB0aGlzLl9sYXN0VkZyYW1lID0gdGhpcy5nYW1lLnRpbWUubm93O1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUJvZHkoKTtcbiAgICB0aGlzLmJvZHkubWFzcyA9IDA7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBWZWN0b3JTcHJpdGUgYW5kIGFkZCB0byBnYW1lIHdvcmxkXG4gKlxuICogQHBhcmFtIGdhbWUge1BoYXNlci5HYW1lfVxuICogQHBhcmFtIHgge251bWJlcn0gLSB4IGNvb3JkXG4gKiBAcGFyYW0geSB7bnVtYmVyfSAtIHkgY29vcmRcbiAqIEByZXR1cm5zIHtWZWN0b3JTcHJpdGV9XG4gKi9cblZlY3RvclNwcml0ZS5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSkge1xuICAgIHZhciB2ID0gbmV3IFZlY3RvclNwcml0ZShnYW1lLCB4LCB5KTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyh2KTtcbiAgICByZXR1cm4gdjtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBWZWN0b3JTcHJpdGU7XG5cbi8vIERlZmF1bHQgb2N0YWdvblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fc2hhcGUgPSBbXG4gICAgWzIsMV0sXG4gICAgWzEsMl0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwxXSxcbiAgICBbLTIsLTFdLFxuICAgIFstMSwtMl0sXG4gICAgWzEsLTJdLFxuICAgIFsyLC0xXVxuXTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmZmZmZmJztcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9maWxsQ29sb3IgPSBudWxsO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4yNTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX3ZlY3RvclNjYWxlID0gMTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5waHlzaWNzQm9keVR5cGUgPSAnY2lyY2xlJztcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5udW1GcmFtZXMgPSAxO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5tYXBGcmFtZSA9IDA7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnZGcmFtZSA9IDA7XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudmlzaWJsZU9uTWFwID0gdHJ1ZTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5nZXRGcmFtZVBvb2wgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKCFmcmFtZVRleHR1cmVQb29sW2tleV0pIHtcbiAgICAgICAgcmV0dXJuIGZyYW1lVGV4dHVyZVBvb2xba2V5XSA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gZnJhbWVUZXh0dXJlUG9vbFtrZXldO1xufTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5nZXRNYXBQb29sID0gZnVuY3Rpb24gKGtleSkge1xuICAgIGlmICghbWFwVGV4dHVyZVBvb2xba2V5XSkge1xuICAgICAgICBtYXBUZXh0dXJlUG9vbFtrZXldID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgfVxuICAgIHJldHVybiBtYXBUZXh0dXJlUG9vbFtrZXldO1xufVxuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnNldFNoYXBlID0gZnVuY3Rpb24gKHNoYXBlKSB7XG4gICAgdGhpcy5zaGFwZSA9IHNoYXBlO1xuICAgIHRoaXMudXBkYXRlVGV4dHVyZXMoKTtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0TGluZVN0eWxlID0gZnVuY3Rpb24gKGNvbG9yLCBsaW5lV2lkdGgpIHtcbiAgICBpZiAoIWxpbmVXaWR0aCB8fCBsaW5lV2lkdGggPCAxKSB7XG4gICAgICAgIGxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoIHx8IDE7XG4gICAgfVxuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICB0aGlzLmxpbmVXaWR0aCA9IGxpbmVXaWR0aDtcbiAgICB0aGlzLnVwZGF0ZVRleHR1cmVzKCk7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSBjYWNoZWQgYml0bWFwcyBmb3Igb2JqZWN0IGFmdGVyIHZlY3RvciBwcm9wZXJ0aWVzIGNoYW5nZVxuICovXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZVRleHR1cmVzID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIERyYXcgZnVsbCBzaXplZFxuICAgIGlmICh0aGlzLm51bUZyYW1lcyA9PT0gMSkge1xuICAgICAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MuX2N1cnJlbnRCb3VuZHMgPSBudWxsO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuZHJhd1Byb2NlZHVyZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd1Byb2NlZHVyZSgxLCAwKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNoYXBlKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXcoMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmZyYW1lc1swXSkge1xuICAgICAgICAgICAgdGhpcy5mcmFtZXNbMF0gPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm91bmRzID0gdGhpcy5ncmFwaGljcy5nZXRMb2NhbEJvdW5kcygpO1xuICAgICAgICB0aGlzLmZyYW1lc1swXS5yZXNpemUoYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0LCB0cnVlKTtcbiAgICAgICAgdGhpcy5mcmFtZXNbMF0ucmVuZGVyWFkodGhpcy5ncmFwaGljcywgLWJvdW5kcy54LCAtYm91bmRzLnksIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5udW1GcmFtZXM7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5fY3VycmVudEJvdW5kcyA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmRyYXdQcm9jZWR1cmUoMSwgaSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZnJhbWVzW2ldKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZXNbaV0gPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJvdW5kcyA9IHRoaXMuZ3JhcGhpY3MuZ2V0TG9jYWxCb3VuZHMoKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzW2ldLnJlc2l6ZShib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5mcmFtZXNbaV0ucmVuZGVyWFkodGhpcy5ncmFwaGljcywgLWJvdW5kcy54LCAtYm91bmRzLnksIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0VGV4dHVyZSh0aGlzLmZyYW1lc1t0aGlzLnZGcmFtZV0pO1xuICAgIC8vIERyYXcgc21hbGwgZm9yIG1pbmltYXBcbiAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgIHZhciBtYXBTY2FsZSA9IHRoaXMuZ2FtZS5taW5pbWFwLm1hcFNjYWxlO1xuICAgICAgICB2YXIgbWFwRmFjdG9yID0gdGhpcy5tYXBGYWN0b3IgfHwgMTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5jbGVhcigpO1xuICAgICAgICB0aGlzLmdyYXBoaWNzLl9jdXJyZW50Qm91bmRzID0gbnVsbDtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmRyYXdQcm9jZWR1cmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdQcm9jZWR1cmUobWFwU2NhbGUgKiBtYXBGYWN0b3IsIHRoaXMubWFwRnJhbWUpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhdyhtYXBTY2FsZSAqIG1hcEZhY3Rvcik7XG4gICAgICAgIH1cbiAgICAgICAgYm91bmRzID0gdGhpcy5ncmFwaGljcy5nZXRMb2NhbEJvdW5kcygpO1xuICAgICAgICB0aGlzLm1pbml0ZXh0dXJlLnJlc2l6ZShib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIHRydWUpO1xuICAgICAgICB0aGlzLm1pbml0ZXh0dXJlLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIC1ib3VuZHMueCwgLWJvdW5kcy55LCB0cnVlKTtcbiAgICAgICAgdGhpcy5taW5pc3ByaXRlLnNldFRleHR1cmUodGhpcy5taW5pdGV4dHVyZSk7XG4gICAgfVxuICAgIHRoaXMuX2RpcnR5ID0gZmFsc2U7XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZUJvZHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgc3dpdGNoICh0aGlzLnBoeXNpY3NCb2R5VHlwZSkge1xuICAgICAgICBjYXNlIFwiY2lyY2xlXCI6XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuY2lyY2xlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHZhciByID0gdGhpcy5ncmFwaGljcy5nZXRCb3VuZHMoKTtcbiAgICAgICAgICAgICAgICB2YXIgcmFkaXVzID0gTWF0aC5yb3VuZChNYXRoLnNxcnQoci53aWR0aCogci5oZWlnaHQpLzIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByYWRpdXMgPSB0aGlzLnJhZGl1cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRDaXJjbGUocmFkaXVzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBUT0RPOiBNb3JlIHNoYXBlc1xuICAgIH1cbn07XG5cbi8qKlxuICogUmVuZGVyIHZlY3RvciB0byBiaXRtYXAgb2YgZ3JhcGhpY3Mgb2JqZWN0IGF0IGdpdmVuIHNjYWxlXG4gKlxuICogQHBhcmFtIHJlbmRlclNjYWxlIHtudW1iZXJ9IC0gc2NhbGUgZmFjdG9yIGZvciByZW5kZXJcbiAqL1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlKSB7XG4gICAgcmVuZGVyU2NhbGUgPSByZW5kZXJTY2FsZSB8fCAxO1xuICAgIC8vIERyYXcgc2ltcGxlIHNoYXBlLCBpZiBnaXZlblxuICAgIGlmICh0aGlzLnNoYXBlKSB7XG4gICAgICAgIHZhciBsaW5lQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpO1xuICAgICAgICBpZiAocmVuZGVyU2NhbGUgPT09IDEpIHtcbiAgICAgICAgICAgIHZhciBsaW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpbmVXaWR0aCA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZW5kZXJTY2FsZSA9PT0gMSkgJiYgdGhpcy5maWxsQ29sb3IpIHsgICAgICAgIC8vIE9ubHkgZmlsbCBmdWxsIHNpemVkXG4gICAgICAgICAgICB2YXIgZmlsbENvbG9yID0gUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMuZmlsbENvbG9yKTtcbiAgICAgICAgICAgIHZhciBmaWxsQWxwaGEgPSB0aGlzLmZpbGxBbHBoYSB8fCAxO1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5iZWdpbkZpbGwoZmlsbENvbG9yLCBmaWxsQWxwaGEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKGxpbmVXaWR0aCwgbGluZUNvbG9yLCAxKTtcbiAgICAgICAgdGhpcy5fZHJhd1BvbHlnb24odGhpcy5zaGFwZSwgdGhpcy5zaGFwZUNsb3NlZCwgcmVuZGVyU2NhbGUpO1xuICAgICAgICBpZiAoKHJlbmRlclNjYWxlID09PSAxKSAmJiB0aGlzLmZpbGxDb2xvcikge1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5lbmRGaWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRHJhdyBnZW9tZXRyeSBzcGVjLCBpZiBnaXZlbiwgYnV0IG9ubHkgZm9yIHRoZSBmdWxsIHNpemVkIHNwcml0ZVxuICAgIGlmICgocmVuZGVyU2NhbGUgPT09IDEpICYmIHRoaXMuZ2VvbWV0cnkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmdlb21ldHJ5Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdmFyIGcgPSB0aGlzLmdlb21ldHJ5W2ldO1xuICAgICAgICAgICAgc3dpdGNoIChnLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwicG9seVwiOlxuICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRTogZGVmYXVsdHMgYW5kIHN0dWZmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYXdQb2x5Z29uKGcucG9pbnRzLCBnLmNsb3NlZCwgcmVuZGVyU2NhbGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRHJhdyBvcGVuIG9yIGNsb3NlZCBwb2x5Z29uIGFzIHNlcXVlbmNlIG9mIGxpbmVUbyBjYWxsc1xuICpcbiAqIEBwYXJhbSBwb2ludHMge0FycmF5fSAtIHBvaW50cyBhcyBhcnJheSBvZiBbeCx5XSBwYWlyc1xuICogQHBhcmFtIGNsb3NlZCB7Ym9vbGVhbn0gLSBpcyBwb2x5Z29uIGNsb3NlZD9cbiAqIEBwYXJhbSByZW5kZXJTY2FsZSB7bnVtYmVyfSAtIHNjYWxlIGZhY3RvciBmb3IgcmVuZGVyXG4gKiBAcHJpdmF0ZVxuICovXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9kcmF3UG9seWdvbiA9IGZ1bmN0aW9uIChwb2ludHMsIGNsb3NlZCwgcmVuZGVyU2NhbGUpIHtcbiAgICB2YXIgc2MgPSB0aGlzLmdhbWUucGh5c2ljcy5wMi5tcHhpKHRoaXMudmVjdG9yU2NhbGUpKnJlbmRlclNjYWxlO1xuICAgIHBvaW50cyA9IHBvaW50cy5zbGljZSgpO1xuICAgIGlmIChjbG9zZWQpIHtcbiAgICAgICAgcG9pbnRzLnB1c2gocG9pbnRzWzBdKTtcbiAgICB9XG4gICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8ocG9pbnRzWzBdWzBdICogc2MsIHBvaW50c1swXVsxXSAqIHNjKTtcbiAgICBmb3IgKHZhciBpID0gMSwgbCA9IHBvaW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lVG8ocG9pbnRzW2ldWzBdICogc2MsIHBvaW50c1tpXVsxXSAqIHNjKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEludmFsaWRhdGUgY2FjaGUgYW5kIHJlZHJhdyBpZiBzcHJpdGUgaXMgbWFya2VkIGRpcnR5XG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9kaXJ0eSkge1xuICAgICAgICB0aGlzLnVwZGF0ZVRleHR1cmVzKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9tc1BlckZyYW1lICYmICh0aGlzLmdhbWUudGltZS5ub3cgPj0gdGhpcy5fbGFzdFZGcmFtZSArIHRoaXMuX21zUGVyRnJhbWUpKSB7XG4gICAgICAgIHRoaXMudkZyYW1lID0gKHRoaXMudkZyYW1lICsgMSkgJSB0aGlzLm51bUZyYW1lcztcbiAgICAgICAgdGhpcy5zZXRUZXh0dXJlKHRoaXMuZnJhbWVzW3RoaXMudkZyYW1lXSk7XG4gICAgICAgIHRoaXMuX2xhc3RWRnJhbWUgPSB0aGlzLmdhbWUudGltZS5ub3c7XG4gICAgfVxufTtcblxuLy8gVmVjdG9yIHByb3BlcnRpZXMgZGVmaW5lZCB0byBoYW5kbGUgbWFya2luZyBzcHJpdGUgZGlydHkgd2hlbiBuZWNlc3NhcnlcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdsaW5lQ29sb3InLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9saW5lQ29sb3I7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fbGluZUNvbG9yID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZmlsbENvbG9yJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlsbENvbG9yO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2ZpbGxDb2xvciA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2xpbmVXaWR0aCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpbmVXaWR0aDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9saW5lV2lkdGggPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdmaWxsQWxwaGEnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9maWxsQWxwaGE7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fZmlsbEFscGhhID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnc2hhcGVDbG9zZWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFwZUNsb3NlZDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9zaGFwZUNsb3NlZCA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3ZlY3RvclNjYWxlJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmVjdG9yU2NhbGU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fdmVjdG9yU2NhbGUgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdzaGFwZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NoYXBlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX3NoYXBlID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZ2VvbWV0cnknLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZW9tZXRyeTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9nZW9tZXRyeSA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2RlYWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWFkO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2RlYWQgPSB2YWw7XG4gICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICAgIHRoaXMua2lsbCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXZpdmUoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVmVjdG9yU3ByaXRlO1xuLy9TdGFyY29kZXIuVmVjdG9yU3ByaXRlID0gVmVjdG9yU3ByaXRlOyIsIi8qKlxuICogQ29udHJvbHMuanNcbiAqXG4gKiBWaXJ0dWFsaXplIGFuZCBpbXBsZW1lbnQgcXVldWUgZm9yIGdhbWUgY29udHJvbHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG52YXIgQ29udHJvbHMgPSBmdW5jdGlvbiAoZ2FtZSwgcGFyZW50KSB7XG4gICAgUGhhc2VyLlBsdWdpbi5jYWxsKHRoaXMsIGdhbWUsIHBhcmVudCk7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5QbHVnaW4ucHJvdG90eXBlKTtcbkNvbnRyb2xzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbnRyb2xzO1xuXG5Db250cm9scy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChxdWV1ZSkge1xuICAgIHRoaXMucXVldWUgPSBxdWV1ZTtcbiAgICB0aGlzLmNvbnRyb2xzID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcbiAgICB0aGlzLmNvbnRyb2xzLmZpcmUgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5CKTtcbiAgICB0aGlzLmNvbnRyb2xzLnRyYWN0b3IgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5UKTtcbiAgICB0aGlzLmpveXN0aWNrU3RhdGUgPSB7XG4gICAgICAgIHVwOiBmYWxzZSxcbiAgICAgICAgZG93bjogZmFsc2UsXG4gICAgICAgIGxlZnQ6IGZhbHNlLFxuICAgICAgICByaWdodDogZmFsc2UsXG4gICAgICAgIGZpcmU6IGZhbHNlXG4gICAgfTtcblxuICAgIC8vIEFkZCB2aXJ0dWFsIGpveXN0aWNrIGlmIHBsdWdpbiBpcyBhdmFpbGFibGVcbiAgICBpZiAoUGhhc2VyLlZpcnR1YWxKb3lzdGljaykge1xuICAgICAgICB0aGlzLmpveXN0aWNrID0gdGhpcy5nYW1lLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oUGhhc2VyLlZpcnR1YWxKb3lzdGljayk7XG4gICAgfVxufTtcblxudmFyIHNlcSA9IDA7XG52YXIgdXAgPSBmYWxzZSwgZG93biA9IGZhbHNlLCBsZWZ0ID0gZmFsc2UsIHJpZ2h0ID0gZmFsc2UsIGZpcmUgPSBmYWxzZSwgdHJhY3RvciA9IGZhbHNlO1xuXG5Db250cm9scy5wcm90b3R5cGUuYWRkVmlydHVhbENvbnRyb2xzID0gZnVuY3Rpb24gKHRleHR1cmUpIHtcbiAgICB0ZXh0dXJlID0gdGV4dHVyZSB8fCAnam95c3RpY2snO1xuICAgIHZhciBzY2FsZSA9IDE7ICAgICAgICAgICAgLy8gRklYTUVcbiAgICB0aGlzLnN0aWNrID0gdGhpcy5qb3lzdGljay5hZGRTdGljaygwLCAwLCAxMDAsdGV4dHVyZSk7XG4gICAgLy90aGlzLnN0aWNrLm1vdGlvbkxvY2sgPSBQaGFzZXIuVmlydHVhbEpveXN0aWNrLkhPUklaT05UQUw7XG4gICAgdGhpcy5zdGljay5zY2FsZSA9IHNjYWxlO1xuICAgIC8vdGhpcy5nb2J1dHRvbiA9IHRoaXMuam95c3RpY2suYWRkQnV0dG9uKHggKyAyMDAqc2NhbGUsIHksIHRleHR1cmUsICdidXR0b24xLXVwJywgJ2J1dHRvbjEtZG93bicpO1xuICAgIHRoaXMuZmlyZWJ1dHRvbiA9IHRoaXMuam95c3RpY2suYWRkQnV0dG9uKDAsIDAsIHRleHR1cmUsICdidXR0b24xLXVwJywgJ2J1dHRvbjEtZG93bicpO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbiA9IHRoaXMuam95c3RpY2suYWRkQnV0dG9uKDAsIDAsIHRleHR1cmUsICdidXR0b24yLXVwJywgJ2J1dHRvbjItZG93bicpO1xuICAgIHRoaXMuZmlyZWJ1dHRvbi5zY2FsZSA9IHNjYWxlO1xuICAgIC8vdGhpcy5nb2J1dHRvbi5zY2FsZSA9IHNjYWxlO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5zY2FsZSA9IHNjYWxlO1xuICAgIHRoaXMubGF5b3V0VmlydHVhbENvbnRyb2xzKHNjYWxlKTtcbiAgICB0aGlzLnN0aWNrLm9uTW92ZS5hZGQoZnVuY3Rpb24gKHN0aWNrLCBmLCBmWCwgZlkpIHtcbiAgICAgICAgaWYgKGZYID49IDAuMzUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5yaWdodCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUubGVmdCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGZYIDw9IC0wLjM1KSB7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUucmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5sZWZ0ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5yaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmxlZnQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZlkgPj0gMC4zNSkge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmRvd24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoZlkgPD0gLTAuMzUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudXAgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmRvd24gPSBmYWxzZTs7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudXAgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMuc3RpY2sub25VcC5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUucmlnaHQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gZmFsc2U7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5sZWZ0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gZmFsc2U7XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5maXJlYnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUuZmlyZSA9IHRydWU7XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5maXJlYnV0dG9uLm9uVXAuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmZpcmUgPSBmYWxzZTtcbiAgICB9LCB0aGlzKTtcbiAgICAvL3RoaXMuZ29idXR0b24ub25Eb3duLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gdHJ1ZTtcbiAgICAvL30sIHRoaXMpO1xuICAgIC8vdGhpcy5nb2J1dHRvbi5vblVwLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gZmFsc2U7XG4gICAgLy99LCB0aGlzKTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24ub25Eb3duLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS50cmFjdG9yID0gdHJ1ZTtcbiAgICB9LCB0aGlzKTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24ub25VcC5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudHJhY3RvciA9IGZhbHNlO1xuICAgIH0sIHRoaXMpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLmxheW91dFZpcnR1YWxDb250cm9scyA9IGZ1bmN0aW9uIChzY2FsZSkge1xuICAgIHZhciB5ID0gdGhpcy5nYW1lLmhlaWdodCAtIDEyNSAqIHNjYWxlO1xuICAgIHZhciB3ID0gdGhpcy5nYW1lLndpZHRoO1xuICAgIHRoaXMuc3RpY2sucG9zWCA9IDE1MCAqIHNjYWxlO1xuICAgIHRoaXMuc3RpY2sucG9zWSA9IHk7XG4gICAgdGhpcy5maXJlYnV0dG9uLnBvc1ggPSB3IC0gMjUwICogc2NhbGU7XG4gICAgdGhpcy5maXJlYnV0dG9uLnBvc1kgPSB5O1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5wb3NYID0gdyAtIDEyNSAqIHNjYWxlO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5wb3NZID0geTtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB1cCA9IGRvd24gPSBsZWZ0ID0gcmlnaHQgPSBmYWxzZTtcbiAgICB0aGlzLnF1ZXVlLmxlbmd0aCA9IDA7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUucHJlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFRPRE86IFN1cHBvcnQgb3RoZXIgaW50ZXJhY3Rpb25zL21ldGhvZHNcbiAgICB2YXIgY29udHJvbHMgPSB0aGlzLmNvbnRyb2xzO1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuam95c3RpY2tTdGF0ZTtcbiAgICBpZiAoKHN0YXRlLnVwIHx8IGNvbnRyb2xzLnVwLmlzRG93bikgJiYgIXVwKSB7XG4gICAgICAgIHVwID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndXBfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLnVwICYmICFjb250cm9scy51cC5pc0Rvd24gJiYgdXApIHtcbiAgICAgICAgdXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndXBfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKChzdGF0ZS5kb3duIHx8IGNvbnRyb2xzLmRvd24uaXNEb3duKSAmJiAhZG93bikge1xuICAgICAgICBkb3duID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZG93bl9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghc3RhdGUuZG93biAmJiAhY29udHJvbHMuZG93bi5pc0Rvd24gJiYgZG93bikge1xuICAgICAgICBkb3duID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2Rvd25fcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKChzdGF0ZS5yaWdodCB8fCBjb250cm9scy5yaWdodC5pc0Rvd24pICYmICFyaWdodCkge1xuICAgICAgICByaWdodCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3JpZ2h0X3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS5yaWdodCAmJiAhY29udHJvbHMucmlnaHQuaXNEb3duICYmIHJpZ2h0KSB7XG4gICAgICAgIHJpZ2h0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3JpZ2h0X3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUubGVmdCB8fCBjb250cm9scy5sZWZ0LmlzRG93bikgJiYgIWxlZnQpIHtcbiAgICAgICAgbGVmdCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2xlZnRfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLmxlZnQgJiYgIWNvbnRyb2xzLmxlZnQuaXNEb3duICYmIGxlZnQpIHtcbiAgICAgICAgbGVmdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdsZWZ0X3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUuZmlyZSB8fCBjb250cm9scy5maXJlLmlzRG93bikgJiYgIWZpcmUpIHtcbiAgICAgICAgZmlyZSA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2ZpcmVfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLmZpcmUgJiYgIWNvbnRyb2xzLmZpcmUuaXNEb3duICYmIGZpcmUpIHtcbiAgICAgICAgZmlyZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdmaXJlX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUudHJhY3RvciB8fCBjb250cm9scy50cmFjdG9yLmlzRG93bikgJiYgIXRyYWN0b3IpIHtcbiAgICAgICAgdHJhY3RvciA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3RyYWN0b3JfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKCFzdGF0ZS50cmFjdG9yICYmICFjb250cm9scy50cmFjdG9yLmlzRG93bikgJiYgdHJhY3Rvcikge1xuICAgICAgICB0cmFjdG9yID0gZmFsc2U7Ly9cbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndHJhY3Rvcl9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbn07XG5cbnZhciBhY3Rpb247ICAgICAgICAgICAgIC8vIE1vZHVsZSBzY29wZSB0byBhdm9pZCBhbGxvY2F0aW9uc1xuXG5Db250cm9scy5wcm90b3R5cGUucHJvY2Vzc1F1ZXVlID0gZnVuY3Rpb24gKGNiLCBjbGVhcikge1xuICAgIHZhciBxdWV1ZSA9IHRoaXMucXVldWU7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBxdWV1ZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgYWN0aW9uID0gcXVldWVbaV07XG4gICAgICAgIGlmIChhY3Rpb24uZXhlY3V0ZWQpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNiKGFjdGlvbik7XG4gICAgICAgIGFjdGlvbi5ldGltZSA9IHRoaXMuZ2FtZS50aW1lLm5vdztcbiAgICAgICAgYWN0aW9uLmV4ZWN1dGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGNsZWFyKSB7XG4gICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgfVxufTtcblxuU3RhcmNvZGVyLkNvbnRyb2xzID0gQ29udHJvbHM7XG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xzOyIsIi8qKlxuICogU3luY0NsaWVudC5qc1xuICpcbiAqIFN5bmMgcGh5c2ljcyBvYmplY3RzIHdpdGggc2VydmVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcbnZhciBVUERBVEVfUVVFVUVfTElNSVQgPSA4O1xuXG52YXIgU3luY0NsaWVudCA9IGZ1bmN0aW9uIChnYW1lLCBwYXJlbnQpIHtcbiAgICBQaGFzZXIuUGx1Z2luLmNhbGwodGhpcywgZ2FtZSwgcGFyZW50KTtcbn07XG5cblN5bmNDbGllbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuUGx1Z2luLnByb3RvdHlwZSk7XG5TeW5jQ2xpZW50LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN5bmNDbGllbnQ7XG5cblxuLyoqXG4gKiBJbml0aWFsaXplIHBsdWdpblxuICpcbiAqIEBwYXJhbSBzb2NrZXQge1NvY2tldH0gLSBzb2NrZXQuaW8gc29ja2V0IGZvciBzeW5jIGNvbm5lY3Rpb25cbiAqIEBwYXJhbSBxdWV1ZSB7QXJyYXl9IC0gY29tbWFuZCBxdWV1ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHNvY2tldCwgcXVldWUpIHtcbiAgICAvLyBUT0RPOiBDb3B5IHNvbWUgY29uZmlnIG9wdGlvbnNcbiAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcbiAgICB0aGlzLmNtZFF1ZXVlID0gcXVldWU7XG4gICAgdGhpcy5leHRhbnQgPSB7fTtcbn07XG5cbi8qKlxuICogU3RhcnQgcGx1Z2luXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgc3RhcmNvZGVyID0gdGhpcy5nYW1lLnN0YXJjb2RlcjtcbiAgICB0aGlzLl91cGRhdGVDb21wbGV0ZSA9IGZhbHNlO1xuICAgIC8vIEZJWE1FOiBOZWVkIG1vcmUgcm9idXN0IGhhbmRsaW5nIG9mIERDL1JDXG4gICAgdGhpcy5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5wYXVzZWQgPSB0cnVlO1xuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdyZWNvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5wYXVzZWQgPSBmYWxzZTtcbiAgICB9KTtcbiAgICAvLyBNZWFzdXJlIGNsaWVudC1zZXJ2ZXIgdGltZSBkZWx0YVxuICAgIHRoaXMuc29ja2V0Lm9uKCd0aW1lc3luYycsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHNlbGYuX2xhdGVuY3kgPSBkYXRhIC0gc2VsZi5nYW1lLnRpbWUubm93O1xuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICB2YXIgcmVhbFRpbWUgPSBkYXRhLnI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gZGF0YS5iLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdmFyIHVwZGF0ZSA9IGRhdGEuYltpXTtcbiAgICAgICAgICAgIHZhciBpZCA9IHVwZGF0ZS5pZDtcbiAgICAgICAgICAgIHZhciBzcHJpdGU7XG4gICAgICAgICAgICB1cGRhdGUudGltZXN0YW1wID0gcmVhbFRpbWU7XG4gICAgICAgICAgICBpZiAoc3ByaXRlID0gc2VsZi5leHRhbnRbaWRdKSB7XG4gICAgICAgICAgICAgICAgLy8gRXhpc3Rpbmcgc3ByaXRlIC0gcHJvY2VzcyB1cGRhdGVcbiAgICAgICAgICAgICAgICBzcHJpdGUudXBkYXRlUXVldWUucHVzaCh1cGRhdGUpO1xuICAgICAgICAgICAgICAgIGlmICh1cGRhdGUucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuY29uZmlnKHVwZGF0ZS5wcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNwcml0ZS51cGRhdGVRdWV1ZS5sZW5ndGggPiBVUERBVEVfUVVFVUVfTElNSVQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBOZXcgc3ByaXRlIC0gY3JlYXRlIGFuZCBjb25maWd1cmVcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdOZXcnLCBpZCwgdXBkYXRlLnQpO1xuICAgICAgICAgICAgICAgIHNwcml0ZSA9IHN0YXJjb2Rlci5hZGRCb2R5KHVwZGF0ZS50LCB1cGRhdGUpO1xuICAgICAgICAgICAgICAgIGlmIChzcHJpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNlcnZlcklkID0gaWQ7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZXh0YW50W2lkXSA9IHNwcml0ZTtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlID0gW3VwZGF0ZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDAsIGwgPSBkYXRhLnJtLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaWQgPSBkYXRhLnJtW2ldO1xuICAgICAgICAgICAgaWYgKHNlbGYuZXh0YW50W2lkXSkge1xuICAgICAgICAgICAgICAgIHN0YXJjb2Rlci5yZW1vdmVCb2R5KHNlbGYuZXh0YW50W2lkXSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHNlbGYuZXh0YW50W2lkXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLyoqXG4gKiBTZW5kIHF1ZXVlZCBjb21tYW5kcyB0byBzZXJ2ZXIgYW5kIGludGVycG9sYXRlIG9iamVjdHMgYmFzZWQgb24gdXBkYXRlcyBmcm9tIHNlcnZlclxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl91cGRhdGVDb21wbGV0ZSkge1xuICAgICAgICB0aGlzLl9zZW5kQ29tbWFuZHMoKTtcbiAgICAgICAgdGhpcy5fcHJvY2Vzc1BoeXNpY3NVcGRhdGVzKCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvbXBsZXRlID0gdHJ1ZTtcbiAgICB9XG4gfTtcblxuU3luY0NsaWVudC5wcm90b3R5cGUucG9zdFJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl91cGRhdGVDb21wbGV0ZSA9IGZhbHNlO1xufTtcblxuXG52YXIgYWN0aW9ucyA9IFtdOyAgICAgICAgICAgICAgIC8vIE1vZHVsZSBzY29wZSB0byBhdm9pZCBhbGxvY2F0aW9uc1xudmFyIGFjdGlvbjtcbi8qKlxuICogU2VuZCBxdWV1ZWQgY29tbWFuZHMgdGhhdCBoYXZlIGJlZW4gZXhlY3V0ZWQgdG8gdGhlIHNlcnZlclxuICpcbiAqIEBwcml2YXRlXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLl9zZW5kQ29tbWFuZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgYWN0aW9ucy5sZW5ndGggPSAwO1xuICAgIGZvciAodmFyIGkgPSB0aGlzLmNtZFF1ZXVlLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xuICAgICAgICBhY3Rpb24gPSB0aGlzLmNtZFF1ZXVlW2ldO1xuICAgICAgICBpZiAoYWN0aW9uLmV4ZWN1dGVkKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnVuc2hpZnQoYWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuY21kUXVldWUuc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdkbycsIGFjdGlvbnMpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdzZW5kaW5nIGFjdGlvbnMnLCBhY3Rpb25zKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgaW50ZXJwb2xhdGlvbiAvIHByZWRpY3Rpb24gcmVzb2x1dGlvbiBmb3IgcGh5c2ljcyBib2RpZXNcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5fcHJvY2Vzc1BoeXNpY3NVcGRhdGVzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpbnRlcnBUaW1lID0gdGhpcy5nYW1lLnRpbWUubm93ICsgdGhpcy5fbGF0ZW5jeSAtIHRoaXMuZ2FtZS5zdGFyY29kZXIuY29uZmlnLnJlbmRlckxhdGVuY3k7XG4gICAgdmFyIG9pZHMgPSBPYmplY3Qua2V5cyh0aGlzLmV4dGFudCk7XG4gICAgZm9yICh2YXIgaSA9IG9pZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIHNwcml0ZSA9IHRoaXMuZXh0YW50W29pZHNbaV1dO1xuICAgICAgICB2YXIgcXVldWUgPSBzcHJpdGUudXBkYXRlUXVldWU7XG4gICAgICAgIHZhciBiZWZvcmUgPSBudWxsLCBhZnRlciA9IG51bGw7XG5cbiAgICAgICAgLy8gRmluZCB1cGRhdGVzIGJlZm9yZSBhbmQgYWZ0ZXIgaW50ZXJwVGltZVxuICAgICAgICB2YXIgaiA9IDE7XG4gICAgICAgIHdoaWxlIChxdWV1ZVtqXSkge1xuICAgICAgICAgICAgaWYgKHF1ZXVlW2pdLnRpbWVzdGFtcCA+IGludGVycFRpbWUpIHtcbiAgICAgICAgICAgICAgICBhZnRlciA9IHF1ZXVlW2pdO1xuICAgICAgICAgICAgICAgIGJlZm9yZSA9IHF1ZXVlW2otMV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb25lIC0gd2UncmUgYmVoaW5kLlxuICAgICAgICBpZiAoIWJlZm9yZSAmJiAhYWZ0ZXIpIHtcbiAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPj0gMikgeyAgICAvLyBUd28gbW9zdCByZWNlbnQgdXBkYXRlcyBhdmFpbGFibGU/IFVzZSB0aGVtLlxuICAgICAgICAgICAgICAgIGJlZm9yZSA9IHF1ZXVlW3F1ZXVlLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgICAgIGFmdGVyID0gcXVldWVbcXVldWUubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnTGFnZ2luZycsIG9pZHNbaV0pO1xuICAgICAgICAgICAgfSBlbHNlIHsgICAgICAgICAgICAgICAgICAgIC8vIE5vPyBKdXN0IGJhaWxcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdCYWlsaW5nJywgb2lkc1tpXSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdPaycsIGludGVycFRpbWUsIHF1ZXVlLmxlbmd0aCk7XG4gICAgICAgICAgICBxdWV1ZS5zcGxpY2UoMCwgaiAtIDEpOyAgICAgLy8gVGhyb3cgb3V0IG9sZGVyIHVwZGF0ZXNcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzcGFuID0gYWZ0ZXIudGltZXN0YW1wIC0gYmVmb3JlLnRpbWVzdGFtcDtcbiAgICAgICAgdmFyIHQgPSAoaW50ZXJwVGltZSAtIGJlZm9yZS50aW1lc3RhbXApIC8gc3BhbjtcbiAgICAgICAgLy9pZiAodCA8IDAgfHwgdCA+IDEpIHtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coJ3dlaXJkIHRpbWUnLCB0KTtcbiAgICAgICAgLy99XG4gICAgICAgIHQgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCB0KSk7ICAgICAgICAvLyBGSVhNRTogU3RvcGdhcCBmaXggLSBTaG91bGRuJ3QgbmVlZCB0aGlzXG4gICAgICAgIHNwcml0ZS5zZXRQb3NBbmdsZShsaW5lYXIoYmVmb3JlLngsIGFmdGVyLngsIHQpLCBsaW5lYXIoYmVmb3JlLnksIGFmdGVyLnksIHQpLCBsaW5lYXIoYmVmb3JlLmEsIGFmdGVyLmEsIHQpKTtcbiAgICB9XG59O1xuXG4vLyBIZWxwZXJzXG5cbi8qKlxuICogSW50ZXJwb2xhdGUgYmV0d2VlbiB0d28gcG9pbnRzIHdpdGggaGVybWl0ZSBzcGxpbmVcbiAqIE5CIC0gY3VycmVudGx5IHVudXNlZCBhbmQgcHJvYmFibHkgYnJva2VuXG4gKlxuICogQHBhcmFtIHAwIHtudW1iZXJ9IC0gaW5pdGlhbCB2YWx1ZVxuICogQHBhcmFtIHAxIHtudW1iZXJ9IC0gZmluYWwgdmFsdWVcbiAqIEBwYXJhbSB2MCB7bnVtYmVyfSAtIGluaXRpYWwgc2xvcGVcbiAqIEBwYXJhbSB2MSB7bnVtYmVyfSAtIGZpbmFsIHNsb3BlXG4gKiBAcGFyYW0gdCB7bnVtYmVyfSAtIHBvaW50IG9mIGludGVycG9sYXRpb24gKGJldHdlZW4gMCBhbmQgMSlcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gaW50ZXJwb2xhdGVkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGhlcm1pdGUgKHAwLCBwMSwgdjAsIHYxLCB0KSB7XG4gICAgdmFyIHQyID0gdCp0O1xuICAgIHZhciB0MyA9IHQqdDI7XG4gICAgcmV0dXJuICgyKnQzIC0gMyp0MiArIDEpKnAwICsgKHQzIC0gMip0MiArIHQpKnYwICsgKC0yKnQzICsgMyp0MikqcDEgKyAodDMgLSB0MikqdjE7XG59XG5cbi8qKlxuICogSW50ZXJwb2xhdGUgYmV0d2VlbiB0d28gcG9pbnRzIHdpdGggbGluZWFyIHNwbGluZVxuICpcbiAqIEBwYXJhbSBwMCB7bnVtYmVyfSAtIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSBwMSB7bnVtYmVyfSAtIGZpbmFsIHZhbHVlXG4gKiBAcGFyYW0gdCB7bnVtYmVyfSAtIHBvaW50IG9mIGludGVycG9sYXRpb24gKGJldHdlZW4gMCBhbmQgMSlcbiAqIEBwYXJhbSBzY2FsZSB7bnVtYmVyfSAtIHNjYWxlIGZhY3RvciB0byBub3JtYWxpemUgdW5pdHNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gaW50ZXJwb2xhdGVkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGxpbmVhciAocDAsIHAxLCB0LCBzY2FsZSkge1xuICAgIHNjYWxlID0gc2NhbGUgfHwgMTtcbiAgICByZXR1cm4gcDAgKyAocDEgLSBwMCkqdCpzY2FsZTtcbn1cblxuU3RhcmNvZGVyLlNlcnZlclN5bmMgPSBTeW5jQ2xpZW50O1xubW9kdWxlLmV4cG9ydHMgPSBTeW5jQ2xpZW50OyIsIi8qKlxuICogQm9vdC5qc1xuICpcbiAqIEJvb3Qgc3RhdGUgZm9yIFN0YXJjb2RlclxuICogTG9hZCBhc3NldHMgZm9yIHByZWxvYWQgc2NyZWVuIGFuZCBjb25uZWN0IHRvIHNlcnZlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb250cm9scyA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvQ29udHJvbHMuanMnKTtcbnZhciBTeW5jQ2xpZW50ID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9TeW5jQ2xpZW50LmpzJyk7XG5cbnZhciBCb290ID0gZnVuY3Rpb24gKCkge307XG5cbkJvb3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbkJvb3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQm9vdDtcblxuLy92YXIgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuXG4vKipcbiAqIFNldCBwcm9wZXJ0aWVzIHRoYXQgcmVxdWlyZSBib290ZWQgZ2FtZSBzdGF0ZSwgYXR0YWNoIHBsdWdpbnMsIGNvbm5lY3QgdG8gZ2FtZSBzZXJ2ZXJcbiAqL1xuQm9vdC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnY3VzdG9tIHppcCB0ZXN0IHYyLjAnKTtcbiAgICAvL2NvbnNvbGUubG9nKCdJbml0IEJvb3QnLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQpO1xuICAgIC8vY29uc29sZS5sb2coJ2l3IEJvb3QnLCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0LCBzY3JlZW4ud2lkdGgsIHNjcmVlbi5oZWlnaHQsIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTtcbiAgICAvL3RoaXMuZ2FtZS5zdGFnZS5kaXNhYmxlVmlzaWJpbGl0eUNoYW5nZSA9IHRydWU7XG4gICAgdGhpcy5nYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuUkVTSVpFO1xuICAgIHRoaXMuZ2FtZS5zY2FsZS5vblNpemVDaGFuZ2UuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ21hc3RlciByZXNpemUgQ0InKTtcbiAgICB9KTtcbiAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWU7XG4gICAgdGhpcy5nYW1lLnNoYXJlZEdyYXBoaWNzID0gdGhpcy5nYW1lLm1ha2UuZ3JhcGhpY3MoKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHBTY2FsZSA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5waHlzaWNzU2NhbGU7XG4gICAgdmFyIGlwU2NhbGUgPSAxL3BTY2FsZTtcbiAgICB2YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLmNvbmZpZyA9IHtcbiAgICAgICAgcHhtOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGlwU2NhbGUqYTtcbiAgICAgICAgfSxcbiAgICAgICAgbXB4OiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGZsb29yKHBTY2FsZSphKTtcbiAgICAgICAgfSxcbiAgICAgICAgcHhtaTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiAtaXBTY2FsZSphO1xuICAgICAgICB9LFxuICAgICAgICBtcHhpOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGZsb29yKC1wU2NhbGUqYSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuc3RhcmNvZGVyLnNlcnZlckNvbm5lY3QoKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLmNvbnRyb2xzID0gdGhpcy5nYW1lLnBsdWdpbnMuYWRkKENvbnRyb2xzLFxuICAgIC8vICAgIHRoaXMuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICAvL3RoaXMuZ2FtZS5qb3lzdGljayA9IHRoaXMuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihQaGFzZXIuVmlydHVhbEpveXN0aWNrKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLmNvbnRyb2xzID0gdGhpcy5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKENvbnRyb2xzLCB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy8gU2V0IHVwIHNvY2tldC5pbyBjb25uZWN0aW9uXG4gICAgLy90aGlzLnN0YXJjb2Rlci5zb2NrZXQgPSB0aGlzLnN0YXJjb2Rlci5pbyh0aGlzLnN0YXJjb2Rlci5jb25maWcuc2VydmVyVXJpLFxuICAgIC8vICAgIHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5pb0NsaWVudE9wdGlvbnMpO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuc29ja2V0Lm9uKCdzZXJ2ZXIgcmVhZHknLCBmdW5jdGlvbiAocGxheWVyTXNnKSB7XG4gICAgLy8gICAgLy8gRklYTUU6IEhhcyB0byBpbnRlcmFjdCB3aXRoIHNlc3Npb24gZm9yIGF1dGhlbnRpY2F0aW9uIGV0Yy5cbiAgICAvLyAgICBzZWxmLnN0YXJjb2Rlci5wbGF5ZXIgPSBwbGF5ZXJNc2c7XG4gICAgLy8gICAgLy9zZWxmLnN0YXJjb2Rlci5zeW5jY2xpZW50ID0gc2VsZi5nYW1lLnBsdWdpbnMuYWRkKFN5bmNDbGllbnQsXG4gICAgLy8gICAgLy8gICAgc2VsZi5zdGFyY29kZXIuc29ja2V0LCBzZWxmLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy8gICAgc2VsZi5zdGFyY29kZXIuc3luY2NsaWVudCA9IHNlbGYuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihTeW5jQ2xpZW50LFxuICAgIC8vICAgICAgICBzZWxmLnN0YXJjb2Rlci5zb2NrZXQsIHNlbGYuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICAvLyAgICBfY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAvL30pO1xufTtcblxuLyoqXG4gKiBQcmVsb2FkIG1pbmltYWwgYXNzZXRzIGZvciBwcm9ncmVzcyBzY3JlZW5cbiAqL1xuQm9vdC5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnYmFyX2xlZnQnLCAnYXNzZXRzL2ltYWdlcy9ncmVlbkJhckxlZnQucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2Jhcl9taWQnLCAnYXNzZXRzL2ltYWdlcy9ncmVlbkJhck1pZC5wbmcnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnYmFyX3JpZ2h0JywgJ2Fzc2V0cy9pbWFnZXMvZ3JlZW5CYXJSaWdodC5wbmcnKTtcbn07XG5cbi8qKlxuICogS2ljayBpbnRvIG5leHQgc3RhdGUgb25jZSBpbml0aWFsaXphdGlvbiBhbmQgcHJlbG9hZGluZyBhcmUgZG9uZVxuICovXG5Cb290LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdsb2FkZXInKTtcbn07XG5cbi8qKlxuICogQWR2YW5jZSBnYW1lIHN0YXRlIG9uY2UgbmV0d29yayBjb25uZWN0aW9uIGlzIGVzdGFibGlzaGVkXG4gKi9cbi8vQm9vdC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuLy8gICAgLy8gRklYTUU6IGRvbid0IHdhaXQgaGVyZSAtIHNob3VsZCBiZSBpbiBjcmVhdGVcbi8vICAgIGlmICh0aGlzLnN0YXJjb2Rlci5jb25uZWN0ZWQpIHtcbi8vICAgICAgICAvL3RoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnc3BhY2UnKTtcbi8vICAgICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ2xvZ2luJyk7XG4vLyAgICB9XG4vL307XG5cbm1vZHVsZS5leHBvcnRzID0gQm9vdDsiLCIvKipcbiAqIExvYWRlci5qc1xuICpcbiAqIFBoYXNlciBzdGF0ZSB0byBwcmVsb2FkIGFzc2V0cyBhbmQgZGlzcGxheSBwcm9ncmVzc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBMb2FkZXIgPSBmdW5jdGlvbiAoKSB7fTtcblxuTG9hZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG5Mb2FkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTG9hZGVyO1xuXG5Mb2FkZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gSW5pdCBhbmQgZHJhdyBzdGFyZmllbGRcbiAgICB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwLCAnc3RhcmZpZWxkJywgdHJ1ZSk7XG4gICAgdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZCh0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLmdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0LCB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQpO1xuXG4gICAgLy8gUG9zaXRpb24gcHJvZ3Jlc3MgYmFyXG4gICAgdmFyIGJhcldpZHRoID0gTWF0aC5mbG9vcigwLjQgKiB0aGlzLmdhbWUud2lkdGgpO1xuICAgIHZhciBvcmlnaW5YID0gKHRoaXMuZ2FtZS53aWR0aCAtIGJhcldpZHRoKS8yO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5nYW1lLmFkZC5pbWFnZShvcmlnaW5YLCB0aGlzLmdhbWUud29ybGQuY2VudGVyWSwgJ2Jhcl9sZWZ0Jyk7XG4gICAgbGVmdC5hbmNob3Iuc2V0VG8oMCwgMC41KTtcbiAgICB2YXIgbWlkID0gdGhpcy5nYW1lLmFkZC5pbWFnZShvcmlnaW5YICsgbGVmdC53aWR0aCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclksICdiYXJfbWlkJyk7XG4gICAgbWlkLmFuY2hvci5zZXRUbygwLCAwLjUpO1xuICAgIHZhciByaWdodCA9IHRoaXMuZ2FtZS5hZGQuaW1hZ2Uob3JpZ2luWCArIGxlZnQud2lkdGgsIHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJZLCAnYmFyX3JpZ2h0Jyk7XG4gICAgcmlnaHQuYW5jaG9yLnNldFRvKDAsIDAuNSk7XG4gICAgdmFyIG1pZFdpZHRoID0gYmFyV2lkdGggLSAyICogbGVmdC53aWR0aDtcbiAgICBtaWQud2lkdGggPSAwO1xuICAgIHZhciBsb2FkaW5nVGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dCh0aGlzLmdhbWUud29ybGQuY2VudGVyWCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclkgLSAzNiwgJ0xvYWRpbmcuLi4nLFxuICAgICAgICB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2ZmZmZmZicsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIGxvYWRpbmdUZXh0LmFuY2hvci5zZXRUbygwLjUpO1xuICAgIHZhciBwcm9nVGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dChvcmlnaW5YICsgbGVmdC53aWR0aCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclksICcwJScsXG4gICAgICAgIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmZmZmZmJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgcHJvZ1RleHQuYW5jaG9yLnNldFRvKDAuNSk7XG5cbiAgICB0aGlzLmdhbWUubG9hZC5vbkZpbGVDb21wbGV0ZS5hZGQoZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgIHZhciB3ID0gTWF0aC5mbG9vcihtaWRXaWR0aCAqIHByb2dyZXNzIC8gMTAwKTtcbiAgICAgICAgbWlkLndpZHRoID0gdztcbiAgICAgICAgcmlnaHQueCA9IG1pZC54ICsgdztcbiAgICAgICAgcHJvZ1RleHQuc2V0VGV4dChwcm9ncmVzcyArICclJyk7XG4gICAgICAgIHByb2dUZXh0LnggPSBtaWQueCArIHcvMjtcbiAgICB9LCB0aGlzKTtcbn07XG5cbkxvYWRlci5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPOiBIRCBhbmQgU0QgdmVyc2lvbnNcbiAgICAvLyBGb250c1xuICAgIHRoaXMuZ2FtZS5sb2FkLmJpdG1hcEZvbnQoJ3RpdGxlLWZvbnQnLFxuICAgICAgICAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC5wbmcnLCAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC54bWwnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KCdyZWFkb3V0LXllbGxvdycsXG4gICAgICAgICdhc3NldHMvYml0bWFwZm9udHMvaGVhdnkteWVsbG93MjQucG5nJywgJ2Fzc2V0cy9iaXRtYXBmb250cy9oZWF2eS15ZWxsb3cyNC54bWwnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygncGxheWVydGhydXN0JywgJ2Fzc2V0cy9zb3VuZHMvdGhydXN0TG9vcC5vZ2cnKTtcbiAgICAvLyBTb3VuZHNcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnY2hpbWUnLCAnYXNzZXRzL3NvdW5kcy9jaGltZS5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnbGV2ZWx1cCcsICdhc3NldHMvc291bmRzL2xldmVsdXAub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ3BsYW50dHJlZScsICdhc3NldHMvc291bmRzL3BsYW50dHJlZS5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnYmlncG9wJywgJ2Fzc2V0cy9zb3VuZHMvYmlncG9wLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdsaXR0bGVwb3AnLCAnYXNzZXRzL3NvdW5kcy9saXR0bGVwb3Aub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ3RhZ2dlZCcsICdhc3NldHMvc291bmRzL3RhZ2dlZC5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnbGFzZXInLCAnYXNzZXRzL3NvdW5kcy9sYXNlci5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnbXVzaWMnLCAnYXNzZXRzL3NvdW5kcy9pZ25vcmUub2dnJyk7XG4gICAgLy8gU3ByaXRlc2hlZXRzXG4gICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoJ2pveXN0aWNrJywgJ2Fzc2V0cy9qb3lzdGljay9nZW5lcmljLWpveXN0aWNrLnBuZycsICdhc3NldHMvam95c3RpY2svZ2VuZXJpYy1qb3lzdGljay5qc29uJyk7XG4gICAgLy8gSW1hZ2VzXG5cbn07XG5cbkxvYWRlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXJjb2Rlci5jb25uZWN0ZWQpIHtcbiAgICAgICAgLy90aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ3NwYWNlJyk7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnbG9naW4nKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRlcjsiLCIvKipcbiAqIExvZ2luLmpzXG4gKlxuICogU3RhdGUgZm9yIGRpc3BsYXlpbmcgbG9naW4gc2NyZWVuLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBMb2dpbiA9IGZ1bmN0aW9uICgpIHt9O1xuXG5Mb2dpbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuTG9naW4ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTG9naW47XG5cbkxvZ2luLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdsb2dpbicpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLnN0YXJjb2Rlci5zaG93TG9naW4oKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zb2NrZXQub24oJ2xvZ2dlZCBpbicsIGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgc2VsZi5zdGFyY29kZXIuaGlkZUxvZ2luKCk7XG4gICAgICAgIHNlbGYuc3RhcmNvZGVyLnBsYXllciA9IHBsYXllcjtcbiAgICAgICAgc2VsZi5nYW1lLnN0YXRlLnN0YXJ0KCdzcGFjZScpO1xuICAgIH0pO1xuICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldC5vbignbG9naW4gZmFpbHVyZScsIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICBzZWxmLnN0YXJjb2Rlci5zZXRMb2dpbkVycm9yKGVycm9yKTtcbiAgICB9KTtcbn07XG5cbi8vTG9naW4ucHJvdG90eXBlLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KCd0aXRsZS1mb250Jyxcbi8vICAgICAgICAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC5wbmcnLCAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC54bWwnKTtcbi8vfTtcblxuTG9naW4ucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uICh3LCBoKSB7XG4gICAgY29uc29sZS5sb2coJ3JzIExvZ2luJywgdywgaCk7XG59O1xuXG5Mb2dpbi5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vdmFyIHN0YXJmaWVsZCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEoNjAwLCA2MDApO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZCh0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwLCAnc3RhcmZpZWxkJywgdHJ1ZSk7XG4gICAgdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZCh0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLmdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0LCB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQpO1xuICAgIHZhciB0aXRsZSA9IHRoaXMuZ2FtZS5hZGQuYml0bWFwVGV4dCh0aGlzLmdhbWUud29ybGQuY2VudGVyWCwgMTI4LCAndGl0bGUtZm9udCcsICdTVEFSQ09ERVInKTtcbiAgICB0aXRsZS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2dpbjtcbiIsIi8qKlxuICogU3BhY2UuanNcbiAqXG4gKiBNYWluIGdhbWUgc3RhdGUgZm9yIFN0YXJjb2RlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9TaW1wbGVQYXJ0aWNsZS5qcycpO1xudmFyIFRocnVzdEdlbmVyYXRvciA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9UaHJ1c3RHZW5lcmF0b3IuanMnKTtcbnZhciBNaW5pTWFwID0gcmVxdWlyZSgnLi4vcGhhc2VydWkvTWluaU1hcC5qcycpO1xudmFyIExlYWRlckJvYXJkID0gcmVxdWlyZSgnLi4vcGhhc2VydWkvTGVhZGVyQm9hcmQuanMnKTtcbnZhciBUb2FzdCA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9Ub2FzdC5qcycpO1xuXG52YXIgQ29udHJvbHMgPSByZXF1aXJlKCcuLi9waGFzZXJwbHVnaW5zL0NvbnRyb2xzLmpzJyk7XG52YXIgU3luY0NsaWVudCA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvU3luY0NsaWVudC5qcycpO1xuXG52YXIgU3BhY2UgPSBmdW5jdGlvbiAoKSB7fTtcblxuU3BhY2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcblNwYWNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNwYWNlO1xuXG5TcGFjZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnN0YXJjb2Rlci5jb250cm9scyA9IHRoaXMuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihDb250cm9scywgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIHRoaXMuc3RhcmNvZGVyLnN5bmNjbGllbnQgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oU3luY0NsaWVudCxcbiAgICAgICAgdGhpcy5zdGFyY29kZXIuc29ja2V0LCB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgdGhpcy5zdGFnZS5kaXNhYmxlVmlzaWJpbGl0eUNoYW5nZSA9IHRydWU7XG59O1xuXG5TcGFjZS5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUodGhpcy5nYW1lLCBUaHJ1c3RHZW5lcmF0b3IudGV4dHVyZUtleSwgJyNmZjY2MDAnLCA4KTtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUodGhpcy5nYW1lLCAnYnVsbGV0JywgJyM5OTk5OTknLCA0KTtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUodGhpcy5nYW1lLCAndHJhY3RvcicsICcjZWVlZWVlJywgOCwgdHJ1ZSk7XG4gICAgLy90aGlzLmdhbWUubG9hZC5hdWRpbygncGxheWVydGhydXN0JywgJ2Fzc2V0cy9zb3VuZHMvdGhydXN0TG9vcC5vZ2cnKTtcbiAgICAvL3RoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdjaGltZScsICdhc3NldHMvc291bmRzL2NoaW1lLm1wMycpO1xuICAgIC8vdGhpcy5nYW1lLmxvYWQuYXRsYXMoJ2pveXN0aWNrJywgJ2Fzc2V0cy9qb3lzdGljay9nZW5lcmljLWpveXN0aWNrLnBuZycsICdhc3NldHMvam95c3RpY2svZ2VuZXJpYy1qb3lzdGljay5qc29uJyk7XG4gICAgLy90aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KCdyZWFkb3V0LXllbGxvdycsXG4gICAgLy8gICAgJ2Fzc2V0cy9iaXRtYXBmb250cy9oZWF2eS15ZWxsb3cyNC5wbmcnLCAnYXNzZXRzL2JpdG1hcGZvbnRzL2hlYXZ5LXllbGxvdzI0LnhtbCcpO1xufTtcblxuU3BhY2UucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnU3BhY2Ugc2l6ZScsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIDEpO1xuICAgIC8vY29uc29sZS5sb2coJ2NyZWF0ZScpO1xuICAgIC8vdmFyIHJuZyA9IHRoaXMuZ2FtZS5ybmQ7XG4gICAgdmFyIHdiID0gdGhpcy5zdGFyY29kZXIuY29uZmlnLndvcmxkQm91bmRzO1xuICAgIHZhciBwcyA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5waHlzaWNzU2NhbGU7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuUDJKUyk7XG4gICAgdGhpcy53b3JsZC5zZXRCb3VuZHMuY2FsbCh0aGlzLndvcmxkLCB3YlswXSpwcywgd2JbMV0qcHMsICh3YlsyXS13YlswXSkqcHMsICh3YlszXS13YlsxXSkqcHMpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLnAyLnNldEJvdW5kc1RvV29ybGQodHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgLy8gRGVidWdnaW5nXG4gICAgLy90aGlzLmdhbWUudGltZS5hZHZhbmNlZFRpbWluZyA9IHRydWU7XG5cbiAgICAvLyBTZXQgdXAgRE9NXG4gICAgdGhpcy5zdGFyY29kZXIubGF5b3V0RE9NU3BhY2VTdGF0ZSgpO1xuXG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMucmVzZXQoKTtcblxuICAgIC8vIFZpcnR1YWwgam95c3RpY2tcbiAgICB0aGlzLnN0YXJjb2Rlci5jb250cm9scy5hZGRWaXJ0dWFsQ29udHJvbHMoJ2pveXN0aWNrJyk7XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzID0ge307XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzLnN0aWNrID0gdGhpcy5nYW1lLmpveXN0aWNrLmFkZFN0aWNrKFxuICAgIC8vICAgIHRoaXMuZ2FtZS53aWR0aCAtIDE1MCwgdGhpcy5nYW1lLmhlaWdodCAtIDc1LCAxMDAsICdqb3lzdGljaycpO1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5zdGljay5zY2FsZSA9IDAuNTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuZmlyZWJ1dHRvbiA9IHRoaXMuZ2FtZS5qb3lzdGljay5hZGRCdXR0b24odGhpcy5nYW1lLndpZHRoIC0gNTAsIHRoaXMuZ2FtZS5oZWlnaHQgLSA3NSxcbiAgICAvLyAgICAnam95c3RpY2snLCAnYnV0dG9uMS11cCcsICdidXR0b24xLWRvd24nKTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuZmlyZWJ1dHRvbi5zY2FsZSA9IDAuNTtcblxuICAgIC8vIFNvdW5kc1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMgPSB7fTtcbiAgICB0aGlzLmdhbWUuc291bmRzLnBsYXllcnRocnVzdCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ3BsYXllcnRocnVzdCcsIDEsIHRydWUpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMuY2hpbWUgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdjaGltZScsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLnBsYW50dHJlZSA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ3BsYW50dHJlZScsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLmJpZ3BvcCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ2JpZ3BvcCcsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLmxpdHRsZXBvcCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ2xpdHRsZXBvcCcsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLnRhZ2dlZCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ3RhZ2dlZCcsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLmxhc2VyID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgnbGFzZXInLCAxLCBmYWxzZSk7XG5cbiAgICB0aGlzLmdhbWUuc291bmRzLm11c2ljID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgnbXVzaWMnLCAxLCB0cnVlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLm11c2ljLnBsYXkoKTtcblxuICAgIC8vIEJhY2tncm91bmRcbiAgICAvL3ZhciBzdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLmRyYXdTdGFyRmllbGQoc3RhcmZpZWxkLmN0eCwgNjAwLCAxNik7XG4gICAgdGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSg2MDAsIDYwMCwgJ3N0YXJmaWVsZCcsIHRydWUpO1xuICAgIHRoaXMuc3RhcmNvZGVyLmRyYXdTdGFyRmllbGQodGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkLmN0eCwgNjAwLCAxNik7XG4gICAgdGhpcy5nYW1lLmFkZC50aWxlU3ByaXRlKHdiWzBdKnBzLCB3YlsxXSpwcywgKHdiWzJdLXdiWzBdKSpwcywgKHdiWzNdLXdiWzFdKSpwcywgdGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkKTtcblxuICAgIHRoaXMuc3RhcmNvZGVyLnN5bmNjbGllbnQuc3RhcnQoKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLnNvY2tldC5lbWl0KCdjbGllbnQgcmVhZHknKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zb2NrZXQuZW1pdCgncmVhZHknKTtcbiAgICB0aGlzLl9zZXR1cE1lc3NhZ2VIYW5kbGVycyh0aGlzLnN0YXJjb2Rlci5zb2NrZXQpO1xuXG4gICAgLy8gR3JvdXBzIGZvciBwYXJ0aWNsZSBlZmZlY3RzXG4gICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvciA9IG5ldyBUaHJ1c3RHZW5lcmF0b3IodGhpcy5nYW1lKTtcblxuICAgIC8vIEdyb3VwIGZvciBnYW1lIG9iamVjdHNcbiAgICB0aGlzLmdhbWUucGxheWZpZWxkID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgLy8gVUlcbiAgICB0aGlzLmdhbWUudWkgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgdGhpcy5nYW1lLnVpLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuXG4gICAgLy8gSW52ZW50b3J5IC0gdGlua2VyIHdpdGggcG9zaXRpb25cbiAgICB2YXIgbGFiZWwgPSB0aGlzLmdhbWUubWFrZS50ZXh0KHRoaXMuZ2FtZS53aWR0aCAvIDIsIDI1LCAnSU5WRU5UT1JZJyxcbiAgICAgICAge2ZvbnQ6ICcyNHB4IEFyaWFsJywgZmlsbDogJyNmZjk5MDAnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICBsYWJlbC5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuZ2FtZS51aS5hZGQobGFiZWwpO1xuICAgIC8vdGhpcy5nYW1lLmludmVudG9yeXRleHQgPSB0aGlzLmdhbWUubWFrZS50ZXh0KHRoaXMuZ2FtZS53aWR0aCAtIDEwMCwgNTAsICcwIGNyeXN0YWxzJyxcbiAgICAvLyAgICB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2NjYzAwMCcsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIHRoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0ID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwVGV4dCh0aGlzLmdhbWUud2lkdGggLyAyLCA1MCwgJ3JlYWRvdXQteWVsbG93JywgJzAnKTtcbiAgICB0aGlzLmdhbWUuaW52ZW50b3J5dGV4dC5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuZ2FtZS51aS5hZGQodGhpcy5nYW1lLmludmVudG9yeXRleHQpO1xuXG4gICAgLy8gTWluaU1hcFxuICAgIHRoaXMuZ2FtZS5taW5pbWFwID0gbmV3IE1pbmlNYXAodGhpcy5nYW1lLCAzMDAsIDMwMCk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZCh0aGlzLmdhbWUubWluaW1hcCk7XG4gICAgdGhpcy5nYW1lLm1pbmltYXAueCA9IDEwO1xuICAgIHRoaXMuZ2FtZS5taW5pbWFwLnkgPSAxMDtcblxuICAgIC8vIExlYWRlcmJvYXJkXG4gICAgdGhpcy5nYW1lLmxlYWRlcmJvYXJkID0gbmV3IExlYWRlckJvYXJkKHRoaXMuZ2FtZSwgdGhpcy5zdGFyY29kZXIucGxheWVyTWFwLCAyMDAsIDMwMCk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZCh0aGlzLmdhbWUubGVhZGVyYm9hcmQpO1xuICAgIHRoaXMuZ2FtZS5sZWFkZXJib2FyZC54ID0gdGhpcy5nYW1lLndpZHRoIC0gMjAwO1xuICAgIHRoaXMuZ2FtZS5sZWFkZXJib2FyZC55ID0gMDtcbiAgICB0aGlzLmdhbWUubGVhZGVyYm9hcmQudmlzaWJsZSA9IGZhbHNlO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxufTtcblxuU3BhY2UucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBGSVhNRToganVzdCBhIG1lc3MgZm9yIHRlc3RpbmdcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMucHJvY2Vzc1F1ZXVlKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgIGlmIChhLnR5cGUgPT09ICd1cF9wcmVzc2VkJykge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnBsYXllclNoaXAubG9jYWxTdGF0ZS50aHJ1c3QgPSAnc3RhcnRpbmcnO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUuc291bmRzLnBsYXllcnRocnVzdC5wbGF5KCk7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RhcnRPbihzZWxmLmdhbWUucGxheWVyU2hpcCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYS50eXBlID09PSAndXBfcmVsZWFzZWQnKSB7XG4gICAgICAgICAgICBzZWxmLmdhbWUucGxheWVyU2hpcC5sb2NhbFN0YXRlLnRocnVzdCA9ICdzaHV0ZG93bic7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnN0b3AoKTtcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnRocnVzdGdlbmVyYXRvci5zdG9wT24oc2VsZi5nYW1lLnBsYXllclNoaXApO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5TcGFjZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIC8vY29uc29sZS5sb2coJytyZW5kZXIrJyk7XG4gICAgLy9pZiAodGhpcy5zdGFyY29kZXIudGVtcHNwcml0ZSkge1xuICAgIC8vICAgIHZhciBkID0gdGhpcy5zdGFyY29kZXIudGVtcHNwcml0ZS5wb3NpdGlvbi54IC0gdGhpcy5zdGFyY29kZXIudGVtcHNwcml0ZS5wcmV2aW91c1Bvc2l0aW9uLng7XG4gICAgLy8gICAgY29uc29sZS5sb2coJ0RlbHRhJywgZCwgdGhpcy5nYW1lLnRpbWUuZWxhcHNlZCwgZCAvIHRoaXMuZ2FtZS50aW1lLmVsYXBzZWQpO1xuICAgIC8vfVxuICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyk7XG4gICAgLy90aGlzLmdhbWUuZGVidWcudGV4dCgnRnBzOiAnICsgdGhpcy5nYW1lLnRpbWUuZnBzLCA1LCAyMCk7XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzLnN0aWNrLmRlYnVnKHRydWUsIHRydWUpO1xuICAgIC8vdGhpcy5nYW1lLmRlYnVnLmNhbWVyYUluZm8odGhpcy5nYW1lLmNhbWVyYSwgMTAwLCAyMCk7XG4gICAgLy9pZiAodGhpcy5zaGlwKSB7XG4gICAgLy8gICAgdGhpcy5nYW1lLmRlYnVnLnNwcml0ZUluZm8odGhpcy5zaGlwLCA0MjAsIDIwKTtcbiAgICAvL31cbn07XG5cblNwYWNlLnByb3RvdHlwZS5fc2V0dXBNZXNzYWdlSGFuZGxlcnMgPSBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNvY2tldC5vbignbXNnIGNyeXN0YWwgcGlja3VwJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBzZWxmLmdhbWUuc291bmRzLmNoaW1lLnBsYXkoKTtcbiAgICAgICAgVG9hc3Quc3BpblVwKHNlbGYuZ2FtZSwgc2VsZi5nYW1lLnBsYXllclNoaXAueCwgc2VsZi5nYW1lLnBsYXllclNoaXAueSwgJysnICsgdmFsICsgJyBjcnlzdGFscyEnKTtcbiAgICB9KTtcbiAgICBzb2NrZXQub24oJ21zZyBwbGFudCB0cmVlJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBzZWxmLmdhbWUuc291bmRzLnBsYW50dHJlZS5wbGF5KCk7XG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCdtc2cgYXN0ZXJvaWQgcG9wJywgZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgICAgaWYgKHNpemUgPiAxKSB7XG4gICAgICAgICAgICBzZWxmLmdhbWUuc291bmRzLmJpZ3BvcC5wbGF5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLmdhbWUuc291bmRzLmxpdHRsZXBvcC5wbGF5KCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBzb2NrZXQub24oJ21zZyB0YWdnZWQnLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMudGFnZ2VkLnBsYXkoKTtcbiAgICB9KTtcbiAgICBzb2NrZXQub24oJ21zZyBsYXNlcicsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5sYXNlci5wbGF5KCk7XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwYWNlO1xuIiwiLyoqXG4gKiBMZWFkZXJCb2FyZC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBMZWFkZXJCb2FyZCA9IGZ1bmN0aW9uIChnYW1lLCBwbGF5ZXJtYXAsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lKTtcbiAgICB0aGlzLnBsYXllck1hcCA9IHBsYXllcm1hcDtcbiAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgIHRoaXMubWFpbldpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5tYWluSGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuaWNvblNpemUgPSAyNDsgICAgICAgICAvLyBNYWtlIHJlc3BvbnNpdmU/XG4gICAgdGhpcy5mb250U2l6ZSA9IDE4O1xuICAgIHRoaXMubnVtTGluZXMgPSBNYXRoLmZsb29yKChoZWlnaHQgLSB0aGlzLmljb25TaXplIC0gMikgLyAodGhpcy5mb250U2l6ZSArIDIpKTtcblxuICAgIHRoaXMubWFpbiA9IGdhbWUubWFrZS5ncm91cCgpO1xuICAgIHRoaXMubWFpbi5waXZvdC5zZXRUbyh3aWR0aCwgMCk7XG4gICAgdGhpcy5tYWluLnggPSB3aWR0aDtcbiAgICB0aGlzLmFkZCh0aGlzLm1haW4pO1xuXG4gICAgLy8gQmFja2dyb3VuZFxuICAgIHZhciBiaXRtYXAgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICAgIGJpdG1hcC5jdHguZmlsbFN0eWxlID0gJ3JnYmEoMTI4LCAxMjgsIDEyOCwgMC4yNSknO1xuICAgIC8vYml0bWFwLmN0eC5maWxsU3R5bGUgPSAnIzk5OTk5OSc7XG4gICAgLy9iaXRtYXAuY3R4Lmdsb2JhbEFscGhhID0gMC41O1xuICAgIGJpdG1hcC5jdHguZmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgLy90aGlzLmJvYXJkID0gbmV3IFBoYXNlci5TcHJpdGUoZ2FtZSwgd2lkdGgsIDAsIHRoaXMuYml0bWFwKTtcbiAgICAvL3RoaXMuYm9hcmQucGl2b3Quc2V0VG8od2lkdGgsIDApO1xuICAgIHRoaXMubWFpbi5hZGQobmV3IFBoYXNlci5TcHJpdGUoZ2FtZSwgMCwgMCwgYml0bWFwKSk7XG5cbiAgICAvLyBUaXRsZVxuICAgIHRoaXMudGl0bGUgPSBnYW1lLm1ha2UudGV4dCgod2lkdGggLSB0aGlzLmljb25TaXplKSAvIDIsIDQsICdUYWdzJyxcbiAgICAgICAge2ZvbnQ6ICcyMHB4IEFyaWFsIGJvbGQnLCBhbGlnbjogJ2NlbnRlcicsIGZpbGw6ICcjZmYwMDAwJ30pO1xuICAgIHRoaXMudGl0bGUuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgdGhpcy5tYWluLmFkZCh0aGlzLnRpdGxlKTtcblxuICAgIC8vIERpc3BsYXkgbGluZXNcbiAgICB0aGlzLmxpbmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm51bUxpbmVzOyBpKyspIHtcbiAgICAgICAgdmFyIGxpbmUgPSBnYW1lLm1ha2UudGV4dCg0LCB0aGlzLmljb25TaXplICsgMiArIGkgKiAodGhpcy5mb250U2l6ZSArIDIpLFxuICAgICAgICAgICAgJy0nLCB7Zm9udDogJzE4cHggQXJpYWwnLCBmaWxsOiAnIzAwMDBmZid9KTtcbiAgICAgICAgbGluZS5raWxsKCk7XG4gICAgICAgIHRoaXMubGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgdGhpcy5tYWluLmFkZChsaW5lKTtcbiAgICB9XG5cbiAgICAvLyBUb2dnbGUgYnV0dG9uXG4gICAgdmFyIGJ1dHRvbiA9IHRoaXMubWFrZUJ1dHRvbigpOyAgICAgICAvLyBHb29kIGRpbWVuc2lvbnMgVEJELiBNYWtlIHJlc3BvbnNpdmU/XG4gICAgYnV0dG9uLmFuY2hvci5zZXRUbygxLCAwKTsgICAgICAvLyB1cHBlciByaWdodDtcbiAgICBidXR0b24ueCA9IHdpZHRoO1xuICAgIC8vYnV0dG9uLnkgPSAwO1xuICAgIGJ1dHRvbi5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgIGJ1dHRvbi5ldmVudHMub25JbnB1dERvd24uYWRkKHRoaXMudG9nZ2xlRGlzcGxheSwgdGhpcyk7XG4gICAgdGhpcy5hZGQoYnV0dG9uKTtcblxuICAgIC8vLy8gTGlzdFxuICAgIC8vdGhpcy5saXN0ID0gZ2FtZS5tYWtlLmdyb3VwKCk7XG4gICAgLy90aGlzLmxpc3QueCA9IHdpZHRoO1xuICAgIC8vdGhpcy5saXN0LnkgPSAwO1xuICAgIC8vdGhpcy5saXN0LnBpdm90LnNldFRvKHdpZHRoLCAwKTtcbiAgICAvL3RoaXMudHdlZW4gPSBnYW1lLnR3ZWVucy5jcmVhdGUodGhpcy5ib2FyZC5zY2FsZSk7XG4gICAgLy9cbiAgICAvL3RoaXMuYWRkKHRoaXMubGlzdCk7XG4gICAgLy8vLyB0ZXN0aW5nXG4gICAgLy92YXIgdCA9IFsndGlnZXIgcHJpbmNlc3MnLCAnbmluamEgbGFzZXInLCAncm9ib3QgZmlzaCcsICdwb3RhdG8gcHVwcHknLCAndmFtcGlyZSBxdWljaGUnLCAnd2l6YXJkIHBhc3RhJ107XG4gICAgLy9mb3IgKHZhciBpID0gMDsgaSA8IHQubGVuZ3RoOyBpKyspIHtcbiAgICAvLyAgICB2YXIgdGV4dCA9IGdhbWUubWFrZS50ZXh0KDIsIGkqMTYsIHRbaV0sIHtmb250OiAnMTRweCBBcmlhbCcsIGZpbGw6ICcjMDAwMGZmJ30pO1xuICAgIC8vICAgIHRoaXMubGlzdC5hZGQodGV4dCk7XG4gICAgLy99XG59O1xuXG5MZWFkZXJCb2FyZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuTGVhZGVyQm9hcmQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGVhZGVyQm9hcmQ7XG5cbkxlYWRlckJvYXJkLnByb3RvdHlwZS5tYWtlQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB1bml0ID0gdGhpcy5pY29uU2l6ZSAvIDU7XG4gICAgdmFyIHRleHR1cmUgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKHRoaXMuaWNvblNpemUsIHRoaXMuaWNvblNpemUpO1xuICAgIHZhciBjdHggPSB0ZXh0dXJlLmN0eDtcbiAgICAvLyBEcmF3IHF1YXJ0ZXIgY2lyY2xlXG4gICAgY3R4LmZpbGxTdHlsZSA9ICcjZmZmZmZmJztcbiAgICAvL2N0eC5nbG9iYWxBbHBoYSA9IDAuNTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbyh0aGlzLmljb25TaXplLCAwKTtcbiAgICBjdHgubGluZVRvKDAsIDApO1xuICAgIGN0eC5hcmModGhpcy5pY29uU2l6ZSwgMCwgdGhpcy5pY29uU2l6ZSwgTWF0aC5QSSwgMyAqIE1hdGguUEkgLyAyLCB0cnVlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIC8vIERyYXcgc3RlcHNcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzAwMDAwMCc7XG4gICAgLy9jdHguZ2xvYmFsQWxwaGEgPSAxO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHgubW92ZVRvKDEuNSp1bml0LCAzKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oMS41KnVuaXQsIDIqdW5pdCk7XG4gICAgY3R4LmxpbmVUbygyLjUqdW5pdCwgMip1bml0KTtcbiAgICBjdHgubGluZVRvKDIuNSp1bml0LCAxKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oMy41KnVuaXQsIDEqdW5pdCk7XG4gICAgY3R4LmxpbmVUbygzLjUqdW5pdCwgMip1bml0KTtcbiAgICBjdHgubGluZVRvKDQuNSp1bml0LCAyKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oNC41KnVuaXQsIDMqdW5pdCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICByZXR1cm4gbmV3IFBoYXNlci5TcHJpdGUodGhpcy5nYW1lLCAwLCAwLCB0ZXh0dXJlKTtcbn07XG5cbkxlYWRlckJvYXJkLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gKHRpdGxlLCBsaXN0LCBwbGF5ZXJpZCkge1xuICAgIHRoaXMudGl0bGUuc2V0VGV4dCh0aXRsZSk7XG4gICAgdmFyIHBsYXllclZpc2libGUgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubnVtTGluZXM7IGkrKykge1xuICAgICAgICB2YXIgcGlkID0gbGlzdFtpXSAmJiBsaXN0W2ldLmlkO1xuICAgICAgICBpZiAocGlkICYmIHRoaXMucGxheWVyTWFwW3BpZF0pIHtcbiAgICAgICAgICAgIHZhciB0YWcgPSB0aGlzLnBsYXllck1hcFtwaWRdLnRhZztcbiAgICAgICAgICAgIHZhciBsaW5lID0gdGhpcy5saW5lc1tpXTtcbiAgICAgICAgICAgIGxpbmUuc2V0VGV4dCgoaSArIDEpICsgJy4gJyArIHRhZyArICcgKCcgKyBsaXN0W2ldLnZhbCArICcpJyk7XG4gICAgICAgICAgICBpZiAocGlkID09PSBwbGF5ZXJpZCkge1xuICAgICAgICAgICAgICAgIGxpbmUuZm9udFdlaWdodCA9ICdib2xkJztcbiAgICAgICAgICAgICAgICBwbGF5ZXJWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGluZS5mb250V2VpZ2h0ID0gJ25vcm1hbCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5lLnJldml2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5saW5lc1tpXS5raWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gUGxheWVyIG5vdCBpbiB0b3AgTlxuICAgIGlmICghcGxheWVyVmlzaWJsZSkge1xuICAgICAgICBmb3IgKGkgPSB0aGlzLm51bUxpbmVzOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGxpc3RbaV0uaWQgPT09IHBsYXllcmlkKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRm91bmQgLSBkaXNwbGF5IGF0IGVuZFxuICAgICAgICBpZiAoaSA8IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICBsaW5lW3RoaXMubnVtTGluZXMgLSAxXS5zZXRUZXh0KChpICsgMSkgKyAnLiAnICsgdGhpcy5wbGF5ZXJNYXBbcGxheWVyaWRdICsgJyAoJyArIGxpc3RbaV0udmFsICsgJyknKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkxlYWRlckJvYXJkLnByb3RvdHlwZS50b2dnbGVEaXNwbGF5ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5nYW1lLnR3ZWVucy5pc1R3ZWVuaW5nKHRoaXMubWFpbi5zY2FsZSkpIHtcbiAgICAgICAgaWYgKHRoaXMub3Blbikge1xuICAgICAgICAgICAgdGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzLm1haW4uc2NhbGUpLnRvKHt4OiAwLCB5OiAwfSwgNTAwLCBQaGFzZXIuRWFzaW5nLlF1YWRyYXRpYy5PdXQsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMubWFpbi5zY2FsZSkudG8oe3g6IDEsIHk6IDF9LCA1MDAsIFBoYXNlci5FYXNpbmcuUXVhZHJhdGljLk91dCwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMZWFkZXJCb2FyZDsiLCIvKipcbiAqIE1pbmlNYXAuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTWluaU1hcCA9IGZ1bmN0aW9uIChnYW1lLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICB2YXIgeHIgPSB3aWR0aCAvIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyV2lkdGg7XG4gICAgdmFyIHlyID0gaGVpZ2h0IC8gdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJIZWlnaHQ7XG4gICAgaWYgKHhyIDw9IHlyKSB7XG4gICAgICAgIHRoaXMubWFwU2NhbGUgPSB4cjtcbiAgICAgICAgdGhpcy54T2Zmc2V0ID0gLXhyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJMZWZ0O1xuICAgICAgICB0aGlzLnlPZmZzZXQgPSAteHIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlclRvcCArIChoZWlnaHQgLSB4ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VySGVpZ2h0KSAvIDI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tYXBTY2FsZSA9IHlyO1xuICAgICAgICB0aGlzLnlPZmZzZXQgPSAteXIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlclRvcDtcbiAgICAgICAgdGhpcy54T2Zmc2V0ID0gLXlyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJMZWZ0ICsgKHdpZHRoIC0geXIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlcldpZHRoKSAvIDI7XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaGljcyA9IGdhbWUubWFrZS5ncmFwaGljcygwLCAwKTtcbiAgICB0aGlzLmdyYXBoaWNzLmJlZ2luRmlsbCgweGZmZmYwMCwgMC4yKTtcbiAgICB0aGlzLmdyYXBoaWNzLmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIHRoaXMuZ3JhcGhpY3MuZW5kRmlsbCgpO1xuICAgIHRoaXMuZ3JhcGhpY3MuY2FjaGVBc0JpdG1hcCA9IHRydWU7XG4gICAgdGhpcy5hZGQodGhpcy5ncmFwaGljcyk7XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5NaW5pTWFwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1pbmlNYXA7XG5cbk1pbmlNYXAucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL3RoaXMudGV4dHVyZS5yZW5kZXJYWSh0aGlzLmdyYXBoaWNzLCAwLCAwLCB0cnVlKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuZ2FtZS5wbGF5ZmllbGQuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBib2R5ID0gdGhpcy5nYW1lLnBsYXlmaWVsZC5jaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKCFib2R5Lm1pbmlzcHJpdGUpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGJvZHkubWluaXNwcml0ZS54ID0gdGhpcy53b3JsZFRvTW1YKGJvZHkueCk7XG4gICAgICAgIGJvZHkubWluaXNwcml0ZS55ID0gdGhpcy53b3JsZFRvTW1ZKGJvZHkueSk7XG4gICAgICAgIGJvZHkubWluaXNwcml0ZS5hbmdsZSA9IGJvZHkuYW5nbGU7XG4gICAgLy8gICAgdmFyIHggPSAxMDAgKyBib2R5LnggLyA0MDtcbiAgICAvLyAgICB2YXIgeSA9IDEwMCArIGJvZHkueSAvIDQwO1xuICAgIC8vICAgIHRoaXMudGV4dHVyZS5yZW5kZXJYWShib2R5LmdyYXBoaWNzLCB4LCB5LCBmYWxzZSk7XG4gICAgfVxufTtcblxuTWluaU1hcC5wcm90b3R5cGUud29ybGRUb01tWCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIHggKiB0aGlzLm1hcFNjYWxlICsgdGhpcy54T2Zmc2V0O1xufTtcblxuTWluaU1hcC5wcm90b3R5cGUud29ybGRUb01tWSA9IGZ1bmN0aW9uICh5KSB7XG4gICAgcmV0dXJuIHkgKiB0aGlzLm1hcFNjYWxlICsgdGhpcy55T2Zmc2V0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNaW5pTWFwOyJdfQ==
