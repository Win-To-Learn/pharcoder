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

},{"./Starcoder.js":2,"./client-components/CodeEndpointClient.js":3,"./client-components/DOMInterface.js":4,"./client-components/LeaderBoardClient.js":5,"./client-components/Starfield.js":6,"./client-components/WorldApi.js":7,"./phaserstates/Boot.js":26,"./phaserstates/Loader.js":27,"./phaserstates/Login.js":28,"./phaserstates/Space.js":29}],2:[function(require,module,exports){
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
    serverUri: 'http://pharcoder-single-1.elasticbeanstalk.com:8080',
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


},{"../phaserbodies/Asteroid.js":10,"../phaserbodies/Bullet.js":11,"../phaserbodies/Crystal.js":12,"../phaserbodies/GenericOrb.js":13,"../phaserbodies/Planetoid.js":14,"../phaserbodies/Ship.js":15,"../phaserbodies/StarTarget.js":17,"../phaserbodies/TractorBeam.js":21,"../phaserbodies/Tree.js":22}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":8,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":18,"./VectorSprite.js":23}],11:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":18,"./VectorSprite.js":23}],12:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":8,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":18,"./VectorSprite.js":23}],13:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":8,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":18,"./VectorSprite.js":23}],14:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":8,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":18,"./VectorSprite.js":23}],15:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":18,"./VectorSprite.js":23}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/Paths.js":8,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":18,"./VectorSprite.js":23}],18:[function(require,module,exports){
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
},{"./SimpleParticle.js":16}],20:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/UpdateProperties.js":9,"./SimpleParticle.js":16,"./SyncBodyInterface.js":18}],22:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":18,"./VectorSprite.js":23}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
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
},{"../Starcoder-client.js":1}],25:[function(require,module,exports){
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
},{"../Starcoder-client.js":1}],26:[function(require,module,exports){
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
},{"../phaserplugins/Controls.js":24,"../phaserplugins/SyncClient.js":25}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
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

},{"../phaserbodies/SimpleParticle.js":16,"../phaserbodies/ThrustGenerator.js":19,"../phaserbodies/Toast.js":20,"../phaserplugins/Controls.js":24,"../phaserplugins/SyncClient.js":25,"../phaserui/LeaderBoard.js":30,"../phaserui/MiniMap.js":31}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
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
},{}],32:[function(require,module,exports){
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

},{"./Starcoder-client.js":1}]},{},[32])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvU3RhcmNvZGVyLWNsaWVudC5qcyIsInNyYy9TdGFyY29kZXIuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvQ29kZUVuZHBvaW50Q2xpZW50LmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL0RPTUludGVyZmFjZS5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9MZWFkZXJCb2FyZENsaWVudC5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9TdGFyZmllbGQuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvV29ybGRBcGkuanMiLCJzcmMvY29tbW9uL1BhdGhzLmpzIiwic3JjL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzIiwic3JjL3BoYXNlcmJvZGllcy9Bc3Rlcm9pZC5qcyIsInNyYy9waGFzZXJib2RpZXMvQnVsbGV0LmpzIiwic3JjL3BoYXNlcmJvZGllcy9DcnlzdGFsLmpzIiwic3JjL3BoYXNlcmJvZGllcy9HZW5lcmljT3JiLmpzIiwic3JjL3BoYXNlcmJvZGllcy9QbGFuZXRvaWQuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1NoaXAuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1NpbXBsZVBhcnRpY2xlLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TdGFyVGFyZ2V0LmpzIiwic3JjL3BoYXNlcmJvZGllcy9TeW5jQm9keUludGVyZmFjZS5qcyIsInNyYy9waGFzZXJib2RpZXMvVGhydXN0R2VuZXJhdG9yLmpzIiwic3JjL3BoYXNlcmJvZGllcy9Ub2FzdC5qcyIsInNyYy9waGFzZXJib2RpZXMvVHJhY3RvckJlYW0uanMiLCJzcmMvcGhhc2VyYm9kaWVzL1RyZWUuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1ZlY3RvclNwcml0ZS5qcyIsInNyYy9waGFzZXJwbHVnaW5zL0NvbnRyb2xzLmpzIiwic3JjL3BoYXNlcnBsdWdpbnMvU3luY0NsaWVudC5qcyIsInNyYy9waGFzZXJzdGF0ZXMvQm9vdC5qcyIsInNyYy9waGFzZXJzdGF0ZXMvTG9hZGVyLmpzIiwic3JjL3BoYXNlcnN0YXRlcy9Mb2dpbi5qcyIsInNyYy9waGFzZXJzdGF0ZXMvU3BhY2UuanMiLCJzcmMvcGhhc2VydWkvTGVhZGVyQm9hcmQuanMiLCJzcmMvcGhhc2VydWkvTWluaU1hcC5qcyIsInNyYy9jbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIFN0YXJjb2Rlci1jbGllbnQuanNcbiAqXG4gKiBTdGFyY29kZXIgbWFzdGVyIG9iamVjdCBleHRlbmRlZCB3aXRoIGNsaWVudCBvbmx5IHByb3BlcnRpZXMgYW5kIG1ldGhvZHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFdvcmxkQXBpID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9Xb3JsZEFwaS5qcycpO1xudmFyIERPTUludGVyZmFjZSA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvRE9NSW50ZXJmYWNlLmpzJyk7XG52YXIgQ29kZUVuZHBvaW50Q2xpZW50ID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9Db2RlRW5kcG9pbnRDbGllbnQuanMnKTtcbnZhciBTdGFyZmllbGQgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL1N0YXJmaWVsZC5qcycpO1xudmFyIExlYWRlckJvYXJkQ2xpZW50ID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9MZWFkZXJCb2FyZENsaWVudC5qcycpO1xuXG52YXIgc3RhdGVzID0ge1xuICAgIGJvb3Q6IHJlcXVpcmUoJy4vcGhhc2Vyc3RhdGVzL0Jvb3QuanMnKSxcbiAgICBzcGFjZTogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvU3BhY2UuanMnKSxcbiAgICBsb2dpbjogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvTG9naW4uanMnKSxcbiAgICBsb2FkZXI6IHJlcXVpcmUoJy4vcGhhc2Vyc3RhdGVzL0xvYWRlci5qcycpXG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbyA9IGlvO1xuICAgIHRoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSgnMTAwJScsICcxMDAlJywgUGhhc2VyLkFVVE8sICdtYWluJyk7XG4gICAgLy90aGlzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoMTgwMCwgOTUwLCBQaGFzZXIuQ0FOVkFTLCAnbWFpbicpO1xuICAgIHRoaXMuZ2FtZS5mb3JjZVNpbmdsZVVwZGF0ZSA9IHRydWU7XG4gICAgdGhpcy5nYW1lLnN0YXJjb2RlciA9IHRoaXM7XG4gICAgZm9yICh2YXIgayBpbiBzdGF0ZXMpIHtcbiAgICAgICAgdmFyIHN0YXRlID0gbmV3IHN0YXRlc1trXSgpO1xuICAgICAgICBzdGF0ZS5zdGFyY29kZXIgPSB0aGlzO1xuICAgICAgICB0aGlzLmdhbWUuc3RhdGUuYWRkKGssIHN0YXRlKTtcbiAgICB9XG4gICAgdGhpcy5vbkNvbm5lY3RDQiA9IFtdO1xuICAgIHRoaXMucGxheWVyTWFwID0ge307XG4gICAgdGhpcy5jbWRRdWV1ZSA9IFtdO1xuICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5sYXN0TmV0RXJyb3IgPSBudWxsO1xuICAgIHRoaXMuaW1wbGVtZW50RmVhdHVyZShXb3JsZEFwaSk7XG4gICAgdGhpcy5pbXBsZW1lbnRGZWF0dXJlKENvZGVFbmRwb2ludENsaWVudCk7XG4gICAgdGhpcy5pbXBsZW1lbnRGZWF0dXJlKFN0YXJmaWVsZCk7XG4gICAgdGhpcy5pbXBsZW1lbnRGZWF0dXJlKExlYWRlckJvYXJkQ2xpZW50KTtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoRE9NSW50ZXJmYWNlKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuc2VydmVyQ29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCF0aGlzLnNvY2tldCkge1xuICAgICAgICBkZWxldGUgdGhpcy5zb2NrZXQ7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGFzdE5ldEVycm9yID0gbnVsbDtcbiAgICB9XG4gICAgdmFyIHNlcnZlclVyaSA9IHRoaXMuY29uZmlnLnNlcnZlclVyaTtcbiAgICBpZiAoIXNlcnZlclVyaSkge1xuICAgICAgICB2YXIgcHJvdG9jb2wgPSB0aGlzLmNvbmZpZy5zZXJ2ZXJQcm90b2wgfHwgd2luZG93LmxvY2F0aW9uLnByb3RvY29sO1xuICAgICAgICB2YXIgcG9ydCA9IHRoaXMuY29uZmlnLnNlcnZlclBvcnQgfHwgJzgwODAnO1xuICAgICAgICBzZXJ2ZXJVcmkgPSBwcm90b2NvbCArICcvLycgKyB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgKyAnOicgKyBwb3J0O1xuICAgIH1cbiAgICB0aGlzLnNvY2tldCA9IHRoaXMuaW8oc2VydmVyVXJpLCB0aGlzLmNvbmZpZy5pb0NsaWVudE9wdGlvbnMpO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coJ3NvY2tldCBjb25uZWN0ZWQnKTtcbiAgICAgICAgc2VsZi5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICBzZWxmLmxhc3ROZXRFcnJvciA9IG51bGw7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gc2VsZi5vbkNvbm5lY3RDQi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHNlbGYub25Db25uZWN0Q0JbaV0uYmluZChzZWxmLCBzZWxmLnNvY2tldCkoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvcicsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBjb25zb2xlLmxvZygnc29ja2V0IGVycm9yJyk7XG4gICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgdGhpcy5sYXN0TmV0RXJyb3IgPSBkYXRhO1xuICAgIH0pO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5zZXJ2ZXJMb2dpbiA9IGZ1bmN0aW9uICh1c2VybmFtZSwgcGFzc3dvcmQpIHtcbiAgICB2YXIgbG9naW4gPSB7fTtcbiAgICBpZiAoIXBhc3N3b3JkKSB7XG4gICAgICAgIC8vIEd1ZXN0IGxvZ2luXG4gICAgICAgIGxvZ2luLmdhbWVydGFnID0gdXNlcm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbG9naW4udXNlcm5hbWUgPSB1c2VybmFtZTtcbiAgICAgICAgbG9naW4ucGFzc3dvcmQgPSBwYXNzd29yZDtcbiAgICB9XG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnbG9naW4nLCBsb2dpbik7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnYm9vdCcpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5hdHRhY2hQbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBsdWdpbiA9IHRoaXMuZ2FtZS5wbHVnaW5zLmFkZC5hcHBseSh0aGlzLmdhbWUucGx1Z2lucywgYXJndW1lbnRzKTtcbiAgICBwbHVnaW4uc3RhcmNvZGVyID0gdGhpcztcbiAgICBwbHVnaW4ubG9nID0gdGhpcy5sb2c7XG4gICAgcmV0dXJuIHBsdWdpbjtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUucm9sZSA9ICdDbGllbnQnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJjb2RlcjtcbiIsIi8qKlxuICogU3RhcmNvZGVyLmpzXG4gKlxuICogU2V0IHVwIGdsb2JhbCBTdGFyY29kZXIgbmFtZXNwYWNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0ge1xuLy8gICAgY29uZmlnOiB7XG4vLyAgICAgICAgd29ybGRCb3VuZHM6IFstNDIwMCwgLTQyMDAsIDg0MDAsIDg0MDBdXG4vL1xuLy8gICAgfSxcbi8vICAgIFN0YXRlczoge31cbi8vfTtcblxudmFyIGNvbmZpZyA9IHtcbiAgICB2ZXJzaW9uOiAnMC4xJyxcbiAgICBzZXJ2ZXJVcmk6ICdodHRwOi8vcGhhcmNvZGVyLXNpbmdsZS0xLmVsYXN0aWNiZWFuc3RhbGsuY29tOjgwODAnLFxuICAgIC8vc2VydmVyVXJpOiAnaHR0cDovL2xvY2FsaG9zdDo4MDgxJyxcbiAgICAvL3NlcnZlckFkZHJlc3M6ICcxLjIuMy40JyxcbiAgICAvL3dvcmxkQm91bmRzOiBbLTQyMDAsIC00MjAwLCA4NDAwLCA4NDAwXSxcbiAgICB3b3JsZEJvdW5kczogWy0yMDAsIC0yMDAsIDIwMCwgMjAwXSxcbiAgICBpb0NsaWVudE9wdGlvbnM6IHtcbiAgICAgICAgLy9mb3JjZU5ldzogdHJ1ZVxuICAgICAgICByZWNvbm5lY3Rpb246IGZhbHNlXG4gICAgfSxcbiAgICB1cGRhdGVJbnRlcnZhbDogNTAsXG4gICAgcmVuZGVyTGF0ZW5jeTogMTAwLFxuICAgIHBoeXNpY3NTY2FsZTogMjAsXG4gICAgZnJhbWVSYXRlOiAoMSAvIDYwKSxcbiAgICB0aW1lU3luY0ZyZXE6IDEwLFxuICAgIHBoeXNpY3NQcm9wZXJ0aWVzOiB7XG4gICAgICAgIFNoaXA6IHtcbiAgICAgICAgICAgIG1hc3M6IDEwXG4gICAgICAgIH0sXG4gICAgICAgIEFzdGVyb2lkOiB7XG4gICAgICAgICAgICBtYXNzOiAyMFxuICAgICAgICB9XG4gICAgfSxcbiAgICBnYW1lclRhZ3M6IHtcbiAgICAgICAgMTogW1xuICAgICAgICAgICAgJ3N1cGVyJyxcbiAgICAgICAgICAgICdhd2Vzb21lJyxcbiAgICAgICAgICAgICdyYWluYm93JyxcbiAgICAgICAgICAgICdkb3VibGUnLFxuICAgICAgICAgICAgJ3RyaXBsZScsXG4gICAgICAgICAgICAndmFtcGlyZScsXG4gICAgICAgICAgICAncHJpbmNlc3MnLFxuICAgICAgICAgICAgJ2ljZScsXG4gICAgICAgICAgICAnZmlyZScsXG4gICAgICAgICAgICAncm9ib3QnLFxuICAgICAgICAgICAgJ3dlcmV3b2xmJyxcbiAgICAgICAgICAgICdzcGFya2xlJyxcbiAgICAgICAgICAgICdpbmZpbml0ZScsXG4gICAgICAgICAgICAnY29vbCcsXG4gICAgICAgICAgICAneW9sbycsXG4gICAgICAgICAgICAnc3dhZ2d5JyxcbiAgICAgICAgICAgICd6b21iaWUnLFxuICAgICAgICAgICAgJ3NhbXVyYWknLFxuICAgICAgICAgICAgJ2RhbmNpbmcnLFxuICAgICAgICAgICAgJ3Bvd2VyJyxcbiAgICAgICAgICAgICdnb2xkJyxcbiAgICAgICAgICAgICdzaWx2ZXInLFxuICAgICAgICAgICAgJ3JhZGlvYWN0aXZlJyxcbiAgICAgICAgICAgICdxdWFudHVtJyxcbiAgICAgICAgICAgICdicmlsbGlhbnQnLFxuICAgICAgICAgICAgJ21pZ2h0eScsXG4gICAgICAgICAgICAncmFuZG9tJ1xuICAgICAgICBdLFxuICAgICAgICAyOiBbXG4gICAgICAgICAgICAndGlnZXInLFxuICAgICAgICAgICAgJ25pbmphJyxcbiAgICAgICAgICAgICdwcmluY2VzcycsXG4gICAgICAgICAgICAncm9ib3QnLFxuICAgICAgICAgICAgJ3BvbnknLFxuICAgICAgICAgICAgJ2RhbmNlcicsXG4gICAgICAgICAgICAncm9ja2VyJyxcbiAgICAgICAgICAgICdtYXN0ZXInLFxuICAgICAgICAgICAgJ2hhY2tlcicsXG4gICAgICAgICAgICAncmFpbmJvdycsXG4gICAgICAgICAgICAna2l0dGVuJyxcbiAgICAgICAgICAgICdwdXBweScsXG4gICAgICAgICAgICAnYm9zcycsXG4gICAgICAgICAgICAnd2l6YXJkJyxcbiAgICAgICAgICAgICdoZXJvJyxcbiAgICAgICAgICAgICdkcmFnb24nLFxuICAgICAgICAgICAgJ3RyaWJ1dGUnLFxuICAgICAgICAgICAgJ2dlbml1cycsXG4gICAgICAgICAgICAnYmxhc3RlcicsXG4gICAgICAgICAgICAnc3BpZGVyJ1xuICAgICAgICBdXG4gICAgfSxcbiAgICBpbml0aWFsQm9kaWVzOiBbXG4gICAgICAgIHt0eXBlOiAnQXN0ZXJvaWQnLCBudW1iZXI6IDI1LCBjb25maWc6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnfSxcbiAgICAgICAgICAgIHZlbG9jaXR5OiB7cmFuZG9tOiAndmVjdG9yJywgbG86IC0xNSwgaGk6IDE1fSxcbiAgICAgICAgICAgIGFuZ3VsYXJWZWxvY2l0eToge3JhbmRvbTogJ2Zsb2F0JywgbG86IC01LCBoaTogNX0sXG4gICAgICAgICAgICB2ZWN0b3JTY2FsZToge3JhbmRvbTogJ2Zsb2F0JywgbG86IDAuNiwgaGk6IDEuNH0sXG4gICAgICAgICAgICBtYXNzOiAxMFxuICAgICAgICB9fSxcbiAgICAgICAgLy97dHlwZTogJ0NyeXN0YWwnLCBudW1iZXI6IDEwLCBjb25maWc6IHtcbiAgICAgICAgLy8gICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCd9LFxuICAgICAgICAvLyAgICB2ZWxvY2l0eToge3JhbmRvbTogJ3ZlY3RvcicsIGxvOiAtNCwgaGk6IDQsIG5vcm1hbDogdHJ1ZX0sXG4gICAgICAgIC8vICAgIHZlY3RvclNjYWxlOiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogMC40LCBoaTogMC44fSxcbiAgICAgICAgLy8gICAgbWFzczogNVxuICAgICAgICAvL319XG4gICAgICAgIHt0eXBlOiAnSHlkcmEnLCBudW1iZXI6IDEsIGNvbmZpZzoge1xuICAgICAgICAgICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCcsIHBhZDogNTB9XG4gICAgICAgIH19LFxuICAgICAgICB7dHlwZTogJ1BsYW5ldG9pZCcsIG51bWJlcjogNiwgY29uZmlnOiB7XG4gICAgICAgICAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJywgcGFkOiAzMH0sXG4gICAgICAgICAgICBhbmd1bGFyVmVsb2NpdHk6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAtMiwgaGk6IDJ9LFxuICAgICAgICAgICAgdmVjdG9yU2NhbGU6IDIuNSxcbiAgICAgICAgICAgIG1hc3M6IDEwMFxuICAgICAgICB9fSxcbiAgICAgICAgLy97dHlwZTogJ1N0YXJUYXJnZXQnLCBudW1iZXI6IDEwLCBjb25maWc6IHtcbiAgICAgICAgLy8gICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCcsIHBhZDogMzB9LFxuICAgICAgICAvLyAgICB2ZWN0b3JTY2FsZTogMC41LFxuICAgICAgICAvLyAgICBzdGFyczogW1swLCAwXSwgWzEsMV0sIFstMSwxXSwgWzEsLTFdXVxuICAgICAgICAvL319XG4gICAgICAgIC8vIEZJWE1FOiBUcmVlcyBqdXN0IGZvciB0ZXN0aW5nXG4gICAgICAgIC8ve3R5cGU6ICdUcmVlJywgbnVtYmVyOiAxMCwgY29uZmlnOiB7XG4gICAgICAgIC8vICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDMwfSxcbiAgICAgICAgLy8gICAgdmVjdG9yU2NhbGU6IDEsXG4gICAgICAgIC8vICAgIG1hc3M6IDVcbiAgICAgICAgLy99fVxuICAgIF1cbn07XG5cbnZhciBTdGFyY29kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gSW5pdGlhbGl6ZXJzIHZpcnR1YWxpemVkIGFjY29yZGluZyB0byByb2xlXG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5iYW5uZXIoKTtcbiAgICB0aGlzLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAvL3RoaXMuaW5pdE5ldC5jYWxsKHRoaXMpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5leHRlbmRDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgZm9yICh2YXIgayBpbiBjb25maWcpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWdba10gPSBjb25maWdba107XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vLyBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgY29tbW9uIGNvbmZpZyBvcHRpb25zXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAnd29ybGRXaWR0aCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzJdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyV2lkdGgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiAodGhpcy5jb25maWcud29ybGRCb3VuZHNbMl0gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1swXSk7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAnd29ybGRIZWlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlckhlaWdodCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqICh0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdKTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJMZWZ0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyVG9wJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMV07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyUmlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1syXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJCb3R0b20nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXTtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBBZGQgbWl4aW4gcHJvcGVydGllcyB0byB0YXJnZXQuIEFkYXB0ZWQgKHNsaWdodGx5KSBmcm9tIFBoYXNlclxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXRcbiAqIEBwYXJhbSB7b2JqZWN0fSBtaXhpblxuICovXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUgPSBmdW5jdGlvbiAodGFyZ2V0LCBtaXhpbikge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobWl4aW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgdmFyIHZhbCA9IG1peGluW2tleV07XG4gICAgICAgIGlmICh2YWwgJiZcbiAgICAgICAgICAgICh0eXBlb2YgdmFsLmdldCA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgdmFsLnNldCA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgdmFsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gdmFsO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBMaWdodHdlaWdodCBjb21wb25lbnQgaW1wbGVtZW50YXRpb24sIG1vcmUgZm9yIGxvZ2ljYWwgdGhhbiBmdW5jdGlvbmFsIG1vZHVsYXJpdHlcbiAqXG4gKiBAcGFyYW0gbWl4aW4ge29iamVjdH0gLSBQT0pPIHdpdGggbWV0aG9kcyAvIHByb3BlcnRpZXMgdG8gYmUgYWRkZWQgdG8gcHJvdG90eXBlLCB3aXRoIG9wdGlvbmFsIGluaXQgbWV0aG9kXG4gKi9cblN0YXJjb2Rlci5wcm90b3R5cGUuaW1wbGVtZW50RmVhdHVyZSA9IGZ1bmN0aW9uIChtaXhpbikge1xuICAgIGZvciAodmFyIHByb3AgaW4gbWl4aW4pIHtcbiAgICAgICAgc3dpdGNoIChwcm9wKSB7XG4gICAgICAgICAgICBjYXNlICdvbkNvbm5lY3RDQic6XG4gICAgICAgICAgICBjYXNlICdvblJlYWR5Q0InOlxuICAgICAgICAgICAgY2FzZSAnb25Mb2dpbkNCJzpcbiAgICAgICAgICAgIGNhc2UgJ29uRGlzY29ubmVjdENCJzpcbiAgICAgICAgICAgICAgICB0aGlzW3Byb3BdLnB1c2gobWl4aW5bcHJvcF0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaW5pdCc6XG4gICAgICAgICAgICAgICAgYnJlYWs7ICAgICAgLy8gTm9PcFxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBTdGFyY29kZXIucHJvdG90eXBlW3Byb3BdID0gbWl4aW5bcHJvcF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1peGluLmluaXQpIHtcbiAgICAgICAgbWl4aW4uaW5pdC5jYWxsKHRoaXMpO1xuICAgIH1cbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuYmFubmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubG9nKCdTdGFyY29kZXInLCB0aGlzLnJvbGUsICd2JyArIHRoaXMuY29uZmlnLnZlcnNpb24sICdzdGFydGVkIGF0JywgRGF0ZSgpKTtcbn07XG5cbi8qKlxuICogQ3VzdG9tIGxvZ2dpbmcgZnVuY3Rpb24gdG8gYmUgZmVhdHVyZWZpZWQgYXMgbmVjZXNzYXJ5XG4gKi9cblN0YXJjb2Rlci5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFyY29kZXI7XG4iLCIvKipcbiAqIENvZGVFbmRwb2ludENsaWVudC5qc1xuICpcbiAqIE1ldGhvZHMgZm9yIHNlbmRpbmcgY29kZSB0byBzZXJ2ZXIgYW5kIGRlYWxpbmcgd2l0aCBjb2RlIHJlbGF0ZWQgcmVzcG9uc2VzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2VuZENvZGU6IGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2NvZGUnLCBjb2RlKTtcbiAgICB9XG59OyIsIi8qKlxuICogRE9NSW50ZXJmYWNlLmpzXG4gKlxuICogSGFuZGxlIERPTSBjb25maWd1cmF0aW9uL2ludGVyYWN0aW9uLCBpLmUuIG5vbi1QaGFzZXIgc3R1ZmZcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5kb20gPSB7fTsgICAgICAgICAgICAgIC8vIG5hbWVzcGFjZVxuICAgICAgICB0aGlzLmRvbS5jb2RlQnV0dG9uID0gJCgnI2NvZGUtYnRuJyk7XG4gICAgICAgIHRoaXMuZG9tLmNvZGVQb3B1cCA9ICQoJyNjb2RlLXBvcHVwJyk7XG4gICAgICAgIHRoaXMuZG9tLmxvZ2luUG9wdXA9ICQoJyNsb2dpbicpO1xuICAgICAgICB0aGlzLmRvbS5sb2dpbkJ1dHRvbiA9ICQoJyNzdWJtaXQnKTtcblxuICAgICAgICB0aGlzLmRvbS5jb2RlQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZG9tLmNvZGVQb3B1cC50b2dnbGUoJ3Nsb3cnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudC5zb3VyY2UgPT09IHNlbGYuZG9tLmNvZGVQb3B1cFswXS5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZW5kQ29kZShldmVudC5vcmlnaW5hbEV2ZW50LmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL3RoaXMuZG9tLmNvZGVQb3B1cC5oaWRlKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IDI7IGkrKykge1xuICAgICAgICAgICAgdmFyIHRhZ3MgPSB0aGlzLmNvbmZpZy5nYW1lclRhZ3NbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMCwgbCA9IHRhZ3MubGVuZ3RoOyBqIDwgbDsgaisrKSB7XG4gICAgICAgICAgICAgICAgJCgnI2d0JyArIGkpLmFwcGVuZCgnPG9wdGlvbj4nICsgdGFnc1tqXSArICc8L29wdGlvbj4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAkKCcuc2VsZWN0Jykuc2VsZWN0bWVudSgpO1xuICAgICAgICAkKCcubG9naW5idXR0b24nKS5idXR0b24oe2ljb25zOiB7cHJpbWFyeTogJ3VpLWljb24tdHJpYW5nbGUtMS1lJ319KTtcblxuICAgICAgICAkKCcuYWNjb3JkaW9uJykuYWNjb3JkaW9uKHtoZWlnaHRTdHlsZTogJ2NvbnRlbnQnfSk7XG4gICAgICAgICQoJy5oaWRkZW4nKS5oaWRlKCk7XG5cbiAgICB9LFxuXG4gICAgbGF5b3V0RE9NU3BhY2VTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCcjY29kZS1idG4nKS5zaG93KCkucG9zaXRpb24oe215OiAnbGVmdCBib3R0b20nLCBhdDogJ2xlZnQgYm90dG9tJywgb2Y6ICcjbWFpbid9KTtcbiAgICAgICAgJCgnI2NvZGUtcG9wdXAnKS5wb3NpdGlvbih7bXk6ICdjZW50ZXInLCBhdDogJ2NlbnRlcicsIG9mOiB3aW5kb3d9KTtcbiAgICB9LFxuXG4gICAgc2hvd0xvZ2luOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgJCgnI2xvZ2luLXdpbmRvdyAubWVzc2FnZScpLmhpZGUoKTtcbiAgICAgICAgJCgnI2xvZ2luLXdpbmRvdycpLnNob3coKS5wb3NpdGlvbih7bXk6ICdjZW50ZXInLCBhdDogJ2NlbnRlcicsIG9mOiB3aW5kb3d9KTtcbiAgICAgICAgJCgnI3VzZXJsb2dpbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuc2VydmVyTG9naW4oJCgnI3VzZXJuYW1lJykudmFsKCksICQoJyNwYXNzd29yZCcpLnZhbCgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJyNndWVzdGxvZ2luJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5zZXJ2ZXJMb2dpbigkKCcjZ3QxJykudmFsKCkgKyAnICcgKyAkKCcjZ3QyJykudmFsKCkpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgc2V0TG9naW5FcnJvcjogZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIHZhciBtc2cgPSAkKCcjbG9naW4td2luZG93IC5tZXNzYWdlJyk7XG4gICAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgICAgIG1zZy5oaWRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtc2cuaHRtbChlcnJvcik7XG4gICAgICAgICAgICBtc2cuc2hvdygpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGhpZGVMb2dpbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCcjbG9naW4td2luZG93JykuaGlkZSgpO1xuICAgIH1cbn07IiwiLyoqXG4gKiBMZWFkZXJCb2FyZENsaWVudC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxlYWRlckJvYXJkID0ge307XG4gICAgICAgIHRoaXMubGVhZGVyQm9hcmRDYXRzID0gW107XG4gICAgICAgIHRoaXMubGVhZGVyQm9hcmRTdGF0ZSA9IG51bGw7XG4gICAgfSxcblxuICAgIG9uQ29ubmVjdENCOiBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc29ja2V0Lm9uKCdsZWFkZXJib2FyZCcsIGZ1bmN0aW9uIChsYikge1xuICAgICAgICAgICAgZm9yICh2YXIgY2F0IGluIGxiKSB7XG4gICAgICAgICAgICAgICAgLy8gUmVjb3JkIG5ldyBjYXRlZ29yeVxuICAgICAgICAgICAgICAgIGlmICghKGNhdCBpbiBzZWxmLmxlYWRlckJvYXJkKSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmxlYWRlckJvYXJkQ2F0cy5wdXNoKGNhdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IGN5Y2xpbmcgaWYgdGhpcyBpcyBmaXJzdCBjYXRlZ29yeVxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmxlYWRlckJvYXJkU3RhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sZWFkZXJCb2FyZFN0YXRlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nYW1lLmxlYWRlcmJvYXJkLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBzZXRJbnRlcnZhbChzZWxmLmN5Y2xlTGVhZGVyQm9hcmQuYmluZChzZWxmKSwgc2VsZi5jb25maWcubGVhZGVyQm9hcmRDbGllbnRDeWNsZSB8fCA1MDAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRGlzcGxheSBpZiB1cGRhdGVkIGJvYXJkIGlzIHNob3dpbmdcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5sZWFkZXJCb2FyZENhdHNbc2VsZi5sZWFkZXJCb2FyZFN0YXRlXSA9PT0gY2F0KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2FtZS5sZWFkZXJib2FyZC5zZXRDb250ZW50KGNhdCwgbGJbY2F0XSwgc2VsZi5wbGF5ZXIuaWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNlbGYubGVhZGVyQm9hcmRbY2F0XSA9IGxiW2NhdF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIGN5Y2xlTGVhZGVyQm9hcmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sZWFkZXJCb2FyZFN0YXRlID0gKHRoaXMubGVhZGVyQm9hcmRTdGF0ZSArIDEpICUgdGhpcy5sZWFkZXJCb2FyZENhdHMubGVuZ3RoO1xuICAgICAgICB2YXIgY2F0ID0gdGhpcy5sZWFkZXJCb2FyZENhdHNbdGhpcy5sZWFkZXJCb2FyZFN0YXRlXTtcbiAgICAgICAgdGhpcy5nYW1lLmxlYWRlcmJvYXJkLnNldENvbnRlbnQoY2F0LCB0aGlzLmxlYWRlckJvYXJkW2NhdF0sIHRoaXMucGxheWVyLmlkKTtcbiAgICB9XG59OyIsIi8qKlxuICogTWV0aG9kIGZvciBkcmF3aW5nIHN0YXJmaWVsZHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByYW5kb21Ob3JtYWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHQgPSAwO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8NjsgaSsrKSB7XG4gICAgICAgICAgICB0ICs9IHRoaXMuZ2FtZS5ybmQubm9ybWFsKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQvNjtcbiAgICB9LFxuXG4gICAgZHJhd1N0YXI6IGZ1bmN0aW9uIChjdHgsIHgsIHksIGQsIGNvbG9yKSB7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oeC1kKzEsIHktZCsxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4K2QtMSwgeStkLTEpO1xuICAgICAgICBjdHgubW92ZVRvKHgtZCsxLCB5K2QtMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeCtkLTEsIHktZCsxKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LCB5LWQpO1xuICAgICAgICBjdHgubGluZVRvKHgsIHkrZCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oeC1kLCB5KTtcbiAgICAgICAgY3R4LmxpbmVUbyh4K2QsIHkpO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfSxcblxuICAgIGRyYXdTdGFyRmllbGQ6IGZ1bmN0aW9uIChjdHgsIHNpemUsIG4pIHtcbiAgICAgICAgdmFyIHhtID0gTWF0aC5yb3VuZChzaXplLzIgKyB0aGlzLnJhbmRvbU5vcm1hbCgpKnNpemUvNCk7XG4gICAgICAgIHZhciB5bSA9IE1hdGgucm91bmQoc2l6ZS8yICsgdGhpcy5yYW5kb21Ob3JtYWwoKSpzaXplLzQpO1xuICAgICAgICB2YXIgcXVhZHMgPSBbWzAsMCx4bS0xLHltLTFdLCBbeG0sMCxzaXplLTEseW0tMV0sXG4gICAgICAgICAgICBbMCx5bSx4bS0xLHNpemUtMV0sIFt4bSx5bSxzaXplLTEsc2l6ZS0xXV07XG4gICAgICAgIHZhciBjb2xvcjtcbiAgICAgICAgdmFyIGksIGosIGwsIHE7XG5cbiAgICAgICAgbiA9IE1hdGgucm91bmQobi80KTtcbiAgICAgICAgZm9yIChpPTAsIGw9cXVhZHMubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgICAgICAgICAgcSA9IHF1YWRzW2ldO1xuICAgICAgICAgICAgZm9yIChqPTA7IGo8bjsgaisrKSB7XG4gICAgICAgICAgICAgICAgY29sb3IgPSAnaHNsKDYwLDEwMCUsJyArIHRoaXMuZ2FtZS5ybmQuYmV0d2Vlbig5MCw5OSkgKyAnJSknO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1N0YXIoY3R4LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWUucm5kLmJldHdlZW4ocVswXSs3LCBxWzJdLTcpLCB0aGlzLmdhbWUucm5kLmJldHdlZW4ocVsxXSs3LCBxWzNdLTcpLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWUucm5kLmJldHdlZW4oMiw0KSwgY29sb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTsiLCIvKipcbiAqIFdvcmxkQXBpLmpzXG4gKlxuICogQWRkL3JlbW92ZS9tYW5pcHVsYXRlIGJvZGllcyBpbiBjbGllbnQncyBwaHlzaWNzIHdvcmxkXG4gKi9cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogQWRkIGJvZHkgdG8gd29ybGQgb24gY2xpZW50IHNpZGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0eXBlIHtzdHJpbmd9IC0gdHlwZSBuYW1lIG9mIG9iamVjdCB0byBhZGRcbiAgICAgKiBAcGFyYW0gY29uZmlnIHtvYmplY3R9IC0gcHJvcGVydGllcyBmb3IgbmV3IG9iamVjdFxuICAgICAqIEByZXR1cm5zIHtQaGFzZXIuU3ByaXRlfSAtIG5ld2x5IGFkZGVkIG9iamVjdFxuICAgICAqL1xuICAgIGFkZEJvZHk6IGZ1bmN0aW9uICh0eXBlLCBjb25maWcpIHtcbiAgICAgICAgdmFyIGN0b3IgPSBib2R5VHlwZXNbdHlwZV07XG4gICAgICAgIHZhciBwbGF5ZXJTaGlwID0gZmFsc2U7XG4gICAgICAgIGlmICghY3Rvcikge1xuICAgICAgICAgICAgdGhpcy5sb2coJ1Vua25vd24gYm9keSB0eXBlOicsIHR5cGUpO1xuICAgICAgICAgICAgdGhpcy5sb2coY29uZmlnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gJ1NoaXAnICYmIGNvbmZpZy5wcm9wZXJ0aWVzLnBsYXllcmlkID09PSB0aGlzLnBsYXllci5pZCkge1xuICAgICAgICAgICAgLy9jb25maWcudGFnID0gdGhpcy5wbGF5ZXIudXNlcm5hbWU7XG4gICAgICAgICAgICAvL2lmIChjb25maWcucHJvcGVydGllcy5wbGF5ZXJpZCA9PT0gdGhpcy5wbGF5ZXIuaWQpIHtcbiAgICAgICAgICAgIC8vIE9ubHkgdGhlIHBsYXllcidzIG93biBzaGlwIGlzIHRyZWF0ZWQgYXMgZHluYW1pYyBpbiB0aGUgbG9jYWwgcGh5c2ljcyBzaW1cbiAgICAgICAgICAgIGNvbmZpZy5tYXNzID0gdGhpcy5jb25maWcucGh5c2ljc1Byb3BlcnRpZXMuU2hpcC5tYXNzO1xuICAgICAgICAgICAgcGxheWVyU2hpcCA9IHRydWU7XG4gICAgICAgICAgICAvL31cbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9IG5ldyBjdG9yKHRoaXMuZ2FtZSwgY29uZmlnKTtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdTaGlwJykge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXJNYXBbY29uZmlnLnByb3BlcnRpZXMucGxheWVyaWRdID0gYm9keTtcbiAgICAgICAgfVxuICAgICAgICAvL3RoaXMuZ2FtZS5hZGQuZXhpc3RpbmcoYm9keSk7XG4gICAgICAgIHRoaXMuZ2FtZS5wbGF5ZmllbGQuYWRkKGJvZHkpO1xuICAgICAgICBpZiAocGxheWVyU2hpcCkge1xuICAgICAgICAgICAgdGhpcy5nYW1lLmNhbWVyYS5mb2xsb3coYm9keSk7XG4gICAgICAgICAgICB0aGlzLmdhbWUucGxheWVyU2hpcCA9IGJvZHk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJvZHk7XG4gICAgfSxcblxuICAgIHJlbW92ZUJvZHk6IGZ1bmN0aW9uIChzcHJpdGUpIHtcbiAgICAgICAgLy9zcHJpdGUua2lsbCgpO1xuICAgICAgICBzcHJpdGUuZGVzdHJveSgpO1xuICAgICAgICAvLyBSZW1vdmUgbWluaXNwcml0ZVxuICAgICAgICBpZiAoc3ByaXRlLm1pbmlzcHJpdGUpIHtcbiAgICAgICAgICAgIC8vc3ByaXRlLm1pbmlzcHJpdGUua2lsbCgpO1xuICAgICAgICAgICAgc3ByaXRlLm1pbmlzcHJpdGUuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIC8vdGhpcy5nYW1lLnBoeXNpY3MucDIucmVtb3ZlQm9keShzcHJpdGUuYm9keSk7XG4gICAgfVxufTtcblxudmFyIGJvZHlUeXBlcyA9IHtcbiAgICBTaGlwOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvU2hpcC5qcycpLFxuICAgIEFzdGVyb2lkOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvQXN0ZXJvaWQuanMnKSxcbiAgICBDcnlzdGFsOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvQ3J5c3RhbC5qcycpLFxuICAgIEJ1bGxldDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0J1bGxldC5qcycpLFxuICAgIEdlbmVyaWNPcmI6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9HZW5lcmljT3JiLmpzJyksXG4gICAgUGxhbmV0b2lkOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvUGxhbmV0b2lkLmpzJyksXG4gICAgVHJlZTogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1RyZWUuanMnKSxcbiAgICBUcmFjdG9yQmVhbTogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1RyYWN0b3JCZWFtLmpzJyksXG4gICAgU3RhclRhcmdldDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1N0YXJUYXJnZXQuanMnKVxufTtcblxuIiwiLyoqXG4gKiBQYXRoLmpzXG4gKlxuICogVmVjdG9yIHBhdGhzIHNoYXJlZCBieSBtdWx0aXBsZSBlbGVtZW50c1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBQSSA9IE1hdGguUEk7XG52YXIgVEFVID0gMipQSTtcbnZhciBzaW4gPSBNYXRoLnNpbjtcbnZhciBjb3MgPSBNYXRoLmNvcztcblxuZXhwb3J0cy5vY3RhZ29uID0gW1xuICAgIFsyLDFdLFxuICAgIFsxLDJdLFxuICAgIFstMSwyXSxcbiAgICBbLTIsMV0sXG4gICAgWy0yLC0xXSxcbiAgICBbLTEsLTJdLFxuICAgIFsxLC0yXSxcbiAgICBbMiwtMV1cbl07XG5cbmV4cG9ydHMuZDJjcm9zcyA9IFtcbiAgICBbLTEsLTJdLFxuICAgIFstMSwyXSxcbiAgICBbMiwtMV0sXG4gICAgWy0yLC0xXSxcbiAgICBbMSwyXSxcbiAgICBbMSwtMl0sXG4gICAgWy0yLDFdLFxuICAgIFsyLDFdXG5dO1xuXG5leHBvcnRzLnNxdWFyZTAgPSBbXG4gICAgWy0xLC0yXSxcbiAgICBbMiwtMV0sXG4gICAgWzEsMl0sXG4gICAgWy0yLDFdXG5dO1xuXG5leHBvcnRzLnNxdWFyZTEgPSBbXG4gICAgWzEsLTJdLFxuICAgIFsyLDFdLFxuICAgIFstMSwyXSxcbiAgICBbLTIsLTFdXG5dO1xuXG5leHBvcnRzLnN0YXIgPSBbXG4gICAgW3NpbigwKSwgY29zKDApXSxcbiAgICBbc2luKDIqVEFVLzUpLCBjb3MoMipUQVUvNSldLFxuICAgIFtzaW4oNCpUQVUvNSksIGNvcyg0KlRBVS81KV0sXG4gICAgW3NpbihUQVUvNSksIGNvcyhUQVUvNSldLFxuICAgIFtzaW4oMypUQVUvNSksIGNvcygzKlRBVS81KV1cbl07XG5cbmV4cG9ydHMuT0NUUkFESVVTID0gTWF0aC5zcXJ0KDUpOyIsIi8qKlxuICogVXBkYXRlUHJvcGVydGllcy5qc1xuICpcbiAqIENsaWVudC9zZXJ2ZXIgc3luY2FibGUgcHJvcGVydGllcyBmb3IgZ2FtZSBvYmplY3RzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNoaXAgPSBmdW5jdGlvbiAoKSB7fTtcblNoaXAucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVXaWR0aCcsICdsaW5lQ29sb3InLCAnZmlsbENvbG9yJywgJ2ZpbGxBbHBoYScsXG4gICAgJ3ZlY3RvclNjYWxlJywgJ3NoYXBlJywgJ3NoYXBlQ2xvc2VkJywgJ3BsYXllcmlkJywgJ2NyeXN0YWxzJywgJ2RlYWQnLCAndGFnJ107XG5cbnZhciBBc3Rlcm9pZCA9IGZ1bmN0aW9uICgpIHt9O1xuQXN0ZXJvaWQucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3ZlY3RvclNjYWxlJ107XG5cbnZhciBDcnlzdGFsID0gZnVuY3Rpb24gKCkge307XG5DcnlzdGFsLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWyd2ZWN0b3JTY2FsZSddO1xuXG52YXIgR2VuZXJpY09yYiA9IGZ1bmN0aW9uICgpIHt9O1xuR2VuZXJpY09yYi5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsnbGluZUNvbG9yJywgJ3ZlY3RvclNjYWxlJ107XG5cbnZhciBQbGFuZXRvaWQgPSBmdW5jdGlvbiAoKSB7fTtcblBsYW5ldG9pZC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsnbGluZUNvbG9yJywgJ2ZpbGxDb2xvcicsICdsaW5lV2lkdGgnLCAnZmlsbEFscGhhJywgJ3ZlY3RvclNjYWxlJywgJ293bmVyJ107XG5cbnZhciBUcmVlID0gZnVuY3Rpb24gKCkge307XG5UcmVlLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWyd2ZWN0b3JTY2FsZScsICdsaW5lQ29sb3InLCAnZ3JhcGgnLCAnc3RlcCcsICdkZXB0aCddO1xuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKCkge307XG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVDb2xvciddO1xuXG52YXIgVHJhY3RvckJlYW0gPSBmdW5jdGlvbiAoKSB7fTtcblRyYWN0b3JCZWFtLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gW107XG5cbnZhciBTdGFyVGFyZ2V0ID0gZnVuY3Rpb24gKCkge307XG5TdGFyVGFyZ2V0LnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydzdGFycycsICdsaW5lQ29sb3InLCAndmVjdG9yU2NhbGUnXTtcblxuXG5leHBvcnRzLlNoaXAgPSBTaGlwO1xuZXhwb3J0cy5Bc3Rlcm9pZCA9IEFzdGVyb2lkO1xuZXhwb3J0cy5DcnlzdGFsID0gQ3J5c3RhbDtcbmV4cG9ydHMuR2VuZXJpY09yYiA9IEdlbmVyaWNPcmI7XG5leHBvcnRzLkJ1bGxldCA9IEJ1bGxldDtcbmV4cG9ydHMuUGxhbmV0b2lkID0gUGxhbmV0b2lkO1xuZXhwb3J0cy5UcmVlID0gVHJlZTtcbmV4cG9ydHMuVHJhY3RvckJlYW0gPSBUcmFjdG9yQmVhbTtcbmV4cG9ydHMuU3RhclRhcmdldCA9IFN0YXJUYXJnZXQ7XG4iLCIvKipcbiAqIEFzdGVyb2lkLmpzXG4gKlxuICogQ2xpZW50IHNpZGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkFzdGVyb2lkO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBBc3Rlcm9pZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbiAgICAvL3RoaXMuYm9keS5kYW1waW5nID0gMDtcbn07XG5cbkFzdGVyb2lkLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIGEgPSBuZXcgQXN0ZXJvaWQoZ2FtZSwgb3B0aW9ucyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5Bc3Rlcm9pZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuQXN0ZXJvaWQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQXN0ZXJvaWQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShBc3Rlcm9pZC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQXN0ZXJvaWQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkFzdGVyb2lkLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZjAwZmYnO1xuQXN0ZXJvaWQucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnI2ZmMDAwMCc7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4yNTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFzdGVyb2lkO1xuLy9TdGFyY29kZXIuQXN0ZXJvaWQgPSBBc3Rlcm9pZDtcbiIsIi8qKlxuICogQnVsbGV0LmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb24gb2Ygc2ltcGxlIHByb2plY3RpbGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbi8vdmFyIFNpbXBsZVBhcnRpY2xlID0gcmVxdWlyZSgnLi9TaW1wbGVQYXJ0aWNsZS5qcycpO1xudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuQnVsbGV0O1xuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkJ1bGxldC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuQnVsbGV0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJ1bGxldDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEJ1bGxldC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQnVsbGV0LnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5CdWxsZXQucHJvdG90eXBlLnZpc2libGVPbk1hcCA9IGZhbHNlO1xuQnVsbGV0LnByb3RvdHlwZS5zaGFyZWRUZXh0dXJlS2V5ID0gJ2xhc2VyJztcblxuQnVsbGV0LnByb3RvdHlwZS5kcmF3UHJvY2VkdXJlID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlLCBmcmFtZSkge1xuICAgIHZhciBzY2FsZSA9IHRoaXMuZ2FtZS5waHlzaWNzLnAyLm1weGkodGhpcy52ZWN0b3JTY2FsZSkgKiByZW5kZXJTY2FsZTtcbiAgICB0aGlzLmdyYXBoaWNzLmxpbmVTdHlsZSg0LCBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpLCAxKTtcbiAgICB0aGlzLmdyYXBoaWNzLm1vdmVUbygwLCAwKTtcbiAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbygwLCAxICogc2NhbGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdWxsZXQ7IiwiLyoqXG4gKiBDcnlzdGFsLmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5DcnlzdGFsO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBDcnlzdGFsID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuQ3J5c3RhbC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgdmFyIGEgPSBuZXcgQ3J5c3RhbChnYW1lLCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBhO1xufTtcblxuQ3J5c3RhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuQ3J5c3RhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDcnlzdGFsO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQ3J5c3RhbC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQ3J5c3RhbC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuQ3J5c3RhbC5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjMDBmZmZmJztcbkNyeXN0YWwucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwMDAwMCc7XG5DcnlzdGFsLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuQ3J5c3RhbC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5DcnlzdGFsLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4wO1xuQ3J5c3RhbC5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcbkNyeXN0YWwucHJvdG90eXBlLl9nZW9tZXRyeSA9IFtcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuZDJjcm9zc31cbl07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDcnlzdGFsO1xuIiwiLyoqXG4gKiBHZW5lcmljT3JiLmpzXG4gKlxuICogQnVpbGRpbmcgYmxvY2tcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkdlbmVyaWNPcmI7XG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcblxudmFyIEdlbmVyaWNPcmIgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG59O1xuXG5HZW5lcmljT3JiLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICB2YXIgYSA9IG5ldyBHZW5lcmljT3JiKGdhbWUsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5HZW5lcmljT3JiLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyaWNPcmI7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShHZW5lcmljT3JiLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShHZW5lcmljT3JiLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5HZW5lcmljT3JiLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZjAwMDAnO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX2ZpbGxDb2xvciA9ICcjMDAwMDAwJztcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9maWxsQWxwaGEgPSAwLjA7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuXG5HZW5lcmljT3JiLnByb3RvdHlwZS5fZ2VvbWV0cnkgPSBbXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLmQyY3Jvc3N9XG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdlbmVyaWNPcmI7XG4iLCIvKipcbiAqIFBsYW5ldG9pZC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuUGxhbmV0b2lkO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBQbGFuZXRvaWQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbn07XG5cblBsYW5ldG9pZC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgb3B0aW9ucykge1xuICAgIHZhciBwbGFuZXRvaWQgPSBuZXcgUGxhbmV0b2lkKGdhbWUsIG9wdGlvbnMpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBwbGFuZXRvaWQ7XG59O1xuXG5QbGFuZXRvaWQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcblBsYW5ldG9pZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQbGFuZXRvaWQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShQbGFuZXRvaWQucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFBsYW5ldG9pZC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuLy9QbGFuZXRvaWQucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnI2ZmMDBmZic7XG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2ZpbGxDb2xvciA9ICcjMDBmZjAwJztcbi8vUGxhbmV0b2lkLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcbi8vUGxhbmV0b2lkLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4yNTtcblBsYW5ldG9pZC5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcblBsYW5ldG9pZC5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcblBsYW5ldG9pZC5wcm90b3R5cGUuX2dlb21ldHJ5ID0gW1xuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5kMmNyb3NzfSxcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuc3F1YXJlMH0sXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLnNxdWFyZTF9XG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYW5ldG9pZDtcbiIsIi8qKlxuICogU2hpcC5qc1xuICpcbiAqIENsaWVudCBzaWRlIGltcGxlbWVudGF0aW9uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5TaGlwO1xuLy92YXIgRW5naW5lID0gcmVxdWlyZSgnLi9FbmdpbmUuanMnKTtcbi8vdmFyIFdlYXBvbnMgPSByZXF1aXJlKCcuL1dlYXBvbnMuanMnKTtcblxudmFyIFNoaXAgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG5cbiAgICBpZiAoY29uZmlnLm1hc3MpIHtcbiAgICAgICAgdGhpcy5ib2R5Lm1hc3MgPSBjb25maWcubWFzcztcbiAgICB9XG4gICAgLy90aGlzLmVuZ2luZSA9IEVuZ2luZS5hZGQoZ2FtZSwgJ3RocnVzdCcsIDUwMCk7XG4gICAgLy90aGlzLmFkZENoaWxkKHRoaXMuZW5naW5lKTtcbiAgICAvL3RoaXMud2VhcG9ucyA9IFdlYXBvbnMuYWRkKGdhbWUsICdidWxsZXQnLCAxMik7XG4gICAgLy90aGlzLndlYXBvbnMuc2hpcCA9IHRoaXM7XG4gICAgLy90aGlzLmFkZENoaWxkKHRoaXMud2VhcG9ucyk7XG4gICAgdGhpcy50YWdUZXh0ID0gZ2FtZS5hZGQudGV4dCgwLCB0aGlzLnRleHR1cmUuaGVpZ2h0LzIgKyAxLFxuICAgICAgICB0aGlzLnRhZywge2ZvbnQ6ICdib2xkIDE4cHggQXJpYWwnLCBmaWxsOiB0aGlzLmxpbmVDb2xvciB8fCAnI2ZmZmZmZicsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIHRoaXMudGFnVGV4dC5hbmNob3Iuc2V0VG8oMC41LCAwKTtcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMudGFnVGV4dCk7XG4gICAgdGhpcy5sb2NhbFN0YXRlID0ge1xuICAgICAgICB0aHJ1c3Q6ICdvZmYnXG4gICAgfVxufTtcblxuU2hpcC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgb3B0aW9ucykge1xuICAgIHZhciBzID0gbmV3IFNoaXAoZ2FtZSwgb3B0aW9ucyk7XG4gICAgZ2FtZS5hZGQuZXhpc3Rpbmcocyk7XG4gICAgcmV0dXJuIHM7XG59O1xuXG5TaGlwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5TaGlwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNoaXA7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTaGlwLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTaGlwLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5TaGlwLnByb3RvdHlwZS5tYXBGYWN0b3IgPSAzO1xuXG4vL1NoaXAucHJvdG90eXBlLnNldExpbmVTdHlsZSA9IGZ1bmN0aW9uIChjb2xvciwgbGluZVdpZHRoKSB7XG4vLyAgICBTdGFyY29kZXIuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5zZXRMaW5lU3R5bGUuY2FsbCh0aGlzLCBjb2xvciwgbGluZVdpZHRoKTtcbi8vICAgIHRoaXMudGFnVGV4dC5zZXRTdHlsZSh7ZmlsbDogY29sb3J9KTtcbi8vfTtcblxuLy9TaGlwLnByb3RvdHlwZS5zaGFwZSA9IFtcbi8vICAgIFstMSwtMV0sXG4vLyAgICBbLTAuNSwwXSxcbi8vICAgIFstMSwxXSxcbi8vICAgIFswLDAuNV0sXG4vLyAgICBbMSwxXSxcbi8vICAgIFswLjUsMF0sXG4vLyAgICBbMSwtMV0sXG4vLyAgICBbMCwtMC41XSxcbi8vICAgIFstMSwtMV1cbi8vXTtcbi8vU2hpcC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDY7XG5cblNoaXAucHJvdG90eXBlLnVwZGF0ZVRleHR1cmVzID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEZJWE1FOiBQcm9iYWJseSBuZWVkIHRvIHJlZmFjdG9yIGNvbnN0cnVjdG9yIGEgYml0IHRvIG1ha2UgdGhpcyBjbGVhbmVyXG4gICAgVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGVUZXh0dXJlcy5jYWxsKHRoaXMpO1xuICAgIGlmICh0aGlzLnRhZ1RleHQpIHtcbiAgICAgICAgLy90aGlzLnRhZ1RleHQuc2V0U3R5bGUoe2ZpbGw6IHRoaXMubGluZUNvbG9yfSk7XG4gICAgICAgIHRoaXMudGFnVGV4dC5maWxsID0gdGhpcy5saW5lQ29sb3I7XG4gICAgICAgIHRoaXMudGFnVGV4dC55ID0gdGhpcy50ZXh0dXJlLmhlaWdodC8yICsgMTtcbiAgICB9XG59O1xuXG5TaGlwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzKTtcbiAgICAvLyBGSVhNRTogTmVlZCB0byBkZWFsIHdpdGggcGxheWVyIHZlcnN1cyBmb3JlaWduIHNoaXBzXG4gICAgc3dpdGNoICh0aGlzLmxvY2FsU3RhdGUudGhydXN0KSB7XG4gICAgICAgIGNhc2UgJ3N0YXJ0aW5nJzpcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnBsYXkoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RhcnRPbih0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdGF0ZS50aHJ1c3QgPSAnb24nO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NodXRkb3duJzpcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RvcE9uKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0YXRlLnRocnVzdCA9ICdvZmYnO1xuICAgIH1cbiAgICAvLyBQbGF5ZXIgc2hpcCBvbmx5XG4gICAgaWYgKHRoaXMuZ2FtZS5wbGF5ZXJTaGlwID09PSB0aGlzKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0LnNldFRleHQodGhpcy5jcnlzdGFscy50b1N0cmluZygpKTtcbiAgICB9XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3RhZycsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RhZztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl90YWcgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaGlwO1xuLy9TdGFyY29kZXIuU2hpcCA9IFNoaXA7XG4iLCIvKipcbiAqIFNpbXBsZVBhcnRpY2xlLmpzXG4gKlxuICogQmFzaWMgYml0bWFwIHBhcnRpY2xlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSBmdW5jdGlvbiAoZ2FtZSwga2V5KSB7XG4gICAgdmFyIHRleHR1cmUgPSBTaW1wbGVQYXJ0aWNsZS5fdGV4dHVyZUNhY2hlW2tleV07XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIDAsIDAsIHRleHR1cmUpO1xuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUodGhpcywgZmFsc2UsIGZhbHNlKTtcbiAgICB0aGlzLmJvZHkuY2xlYXJTaGFwZXMoKTtcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmJvZHkuYWRkUGFydGljbGUoKTtcbiAgICBzaGFwZS5zZW5zb3IgPSB0cnVlO1xuICAgIC8vdGhpcy5raWxsKCk7XG59O1xuXG5TaW1wbGVQYXJ0aWNsZS5fdGV4dHVyZUNhY2hlID0ge307XG5cblNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSA9IGZ1bmN0aW9uIChnYW1lLCBrZXksIGNvbG9yLCBzaXplLCBjaXJjbGUpIHtcbiAgICB2YXIgdGV4dHVyZSA9IGdhbWUubWFrZS5iaXRtYXBEYXRhKHNpemUsIHNpemUpO1xuICAgIHRleHR1cmUuY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIGlmIChjaXJjbGUpIHtcbiAgICAgICAgdGV4dHVyZS5jdHguYXJjKHNpemUvMiwgc2l6ZS8yLCBzaXplLzIsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XG4gICAgICAgIHRleHR1cmUuY3R4LmZpbGwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0dXJlLmN0eC5maWxsUmVjdCgwLCAwLCBzaXplLCBzaXplKTtcbiAgICB9XG4gICAgU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZVtrZXldID0gdGV4dHVyZTtcbn07XG5cblNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuU2ltcGxlUGFydGljbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2ltcGxlUGFydGljbGU7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVQYXJ0aWNsZTtcbi8vU3RhcmNvZGVyLlNpbXBsZVBhcnRpY2xlID0gU2ltcGxlUGFydGljbGU7IiwiLyoqXG4gKiBTdGFyVGFyZ2V0LmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb25cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlN0YXJUYXJnZXQ7XG5cbnZhciBzdGFyID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJykuc3RhcjtcblxudmFyIFN0YXJUYXJnZXQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbn07XG5cblN0YXJUYXJnZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcblN0YXJUYXJnZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RhclRhcmdldDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJUYXJnZXQucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJUYXJnZXQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cblN0YXJUYXJnZXQucHJvdG90eXBlLmRyYXdQcm9jZWR1cmUgPSBmdW5jdGlvbiAocmVuZGVyU2NhbGUpIHtcbiAgICB2YXIgcHNjID0gdGhpcy5nYW1lLnBoeXNpY3MucDIubXB4aShyZW5kZXJTY2FsZSk7XG4gICAgdmFyIGdzYyA9IHBzYyp0aGlzLnZlY3RvclNjYWxlO1xuICAgIHZhciBsaW5lQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpO1xuICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKDEsIGxpbmVDb2xvciwgMSk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnN0YXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gMCwgayA9IHN0YXIubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHBzYyAqIHRoaXMuc3RhcnNbaV1bMF0gKyBnc2MgKiBzdGFyW2pdWzBdO1xuICAgICAgICAgICAgdmFyIHkgPSBwc2MgKiB0aGlzLnN0YXJzW2ldWzFdICsgZ3NjICogc3RhcltqXVsxXTtcbiAgICAgICAgICAgIGlmIChqID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8oeCwgeSk7XG4gICAgICAgICAgICAgICAgdmFyIHgwID0geDtcbiAgICAgICAgICAgICAgICB2YXIgeTAgPSB5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyh4LCB5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyh4MCwgeTApO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhclRhcmdldDsiLCIvKipcbiAqIFN5bmNCb2R5SW50ZXJmYWNlLmpzXG4gKlxuICogU2hhcmVkIG1ldGhvZHMgZm9yIFZlY3RvclNwcml0ZXMsIFBhcnRpY2xlcywgZXRjLlxuICovXG5cbnZhciBTeW5jQm9keUludGVyZmFjZSA9IGZ1bmN0aW9uICgpIHt9O1xuXG4vKipcbiAqIFNldCBsb2NhdGlvbiBhbmQgYW5nbGUgb2YgYSBwaHlzaWNzIG9iamVjdC4gVmFsdWUgYXJlIGdpdmVuIGluIHdvcmxkIGNvb3JkaW5hdGVzLCBub3QgcGl4ZWxzXG4gKlxuICogQHBhcmFtIHgge251bWJlcn1cbiAqIEBwYXJhbSB5IHtudW1iZXJ9XG4gKiBAcGFyYW0gYSB7bnVtYmVyfVxuICovXG5TeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUuc2V0UG9zQW5nbGUgPSBmdW5jdGlvbiAoeCwgeSwgYSkge1xuICAgIHRoaXMuYm9keS5kYXRhLnBvc2l0aW9uWzBdID0gLSh4IHx8IDApO1xuICAgIHRoaXMuYm9keS5kYXRhLnBvc2l0aW9uWzFdID0gLSh5IHx8IDApO1xuICAgIHRoaXMuYm9keS5kYXRhLmFuZ2xlID0gYSB8fCAwO1xufTtcblxuU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlLmNvbmZpZyA9IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnVwZGF0ZVByb3BlcnRpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBrID0gdGhpcy51cGRhdGVQcm9wZXJ0aWVzW2ldO1xuICAgICAgICBpZiAodHlwZW9mIHByb3BlcnRpZXNba10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzW2tdID0gcHJvcGVydGllc1trXTsgICAgICAgIC8vIEZJWE1FPyBWaXJ0dWFsaXplIHNvbWVob3dcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3luY0JvZHlJbnRlcmZhY2U7IiwiLyoqXG4gKiBUaHJ1c3RHZW5lcmF0b3IuanNcbiAqXG4gKiBHcm91cCBwcm92aWRpbmcgQVBJLCBsYXllcmluZywgYW5kIHBvb2xpbmcgZm9yIHRocnVzdCBwYXJ0aWNsZSBlZmZlY3RzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gcmVxdWlyZSgnLi9TaW1wbGVQYXJ0aWNsZS5qcycpO1xuXG52YXIgX3RleHR1cmVLZXkgPSAndGhydXN0JztcblxuLy8gUG9vbGluZyBwYXJhbWV0ZXJzXG52YXIgX21pblBvb2xTaXplID0gMzAwO1xudmFyIF9taW5GcmVlUGFydGljbGVzID0gMjA7XG52YXIgX3NvZnRQb29sTGltaXQgPSAyMDA7XG52YXIgX2hhcmRQb29sTGltaXQgPSA1MDA7XG5cbi8vIEJlaGF2aW9yIG9mIGVtaXR0ZXJcbnZhciBfcGFydGljbGVzUGVyQnVyc3QgPSA1O1xudmFyIF9wYXJ0aWNsZVRUTCA9IDE1MDtcbnZhciBfcGFydGljbGVCYXNlU3BlZWQgPSA1O1xudmFyIF9jb25lTGVuZ3RoID0gMTtcbnZhciBfY29uZVdpZHRoUmF0aW8gPSAwLjI7XG52YXIgX2VuZ2luZU9mZnNldCA9IC0yMDtcblxudmFyIFRocnVzdEdlbmVyYXRvciA9IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICB0aGlzLnRocnVzdGluZ1NoaXBzID0ge307XG5cbiAgICAvLyBQcmVnZW5lcmF0ZSBhIGJhdGNoIG9mIHBhcnRpY2xlc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX21pblBvb2xTaXplOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnRpY2xlID0gdGhpcy5hZGQobmV3IFNpbXBsZVBhcnRpY2xlKGdhbWUsIF90ZXh0dXJlS2V5KSk7XG4gICAgICAgIHBhcnRpY2xlLmFscGhhID0gMC41O1xuICAgICAgICBwYXJ0aWNsZS5yb3RhdGlvbiA9IE1hdGguUEkvNDtcbiAgICAgICAgcGFydGljbGUua2lsbCgpO1xuICAgIH1cbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRocnVzdEdlbmVyYXRvcjtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS5zdGFydE9uID0gZnVuY3Rpb24gKHNoaXApIHtcbiAgICB0aGlzLnRocnVzdGluZ1NoaXBzW3NoaXAuaWRdID0gc2hpcDtcbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUuc3RvcE9uID0gZnVuY3Rpb24gKHNoaXApIHtcbiAgICBkZWxldGUgdGhpcy50aHJ1c3RpbmdTaGlwc1tzaGlwLmlkXTtcbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy50aHJ1c3RpbmdTaGlwcyk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBrZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgc2hpcCA9IHRoaXMudGhydXN0aW5nU2hpcHNba2V5c1tpXV07XG4gICAgICAgIHZhciB3ID0gc2hpcC53aWR0aDtcbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKHNoaXAucm90YXRpb24pO1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3Moc2hpcC5yb3RhdGlvbik7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX3BhcnRpY2xlc1BlckJ1cnN0OyBqKyspIHtcbiAgICAgICAgICAgIHZhciBwYXJ0aWNsZSA9IHRoaXMuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICAgICAgICBpZiAoIXBhcnRpY2xlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vdCBlbm91Z2ggdGhydXN0IHBhcnRpY2xlcyBpbiBwb29sJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZCA9IHRoaXMuZ2FtZS5ybmQucmVhbEluUmFuZ2UoLV9jb25lV2lkdGhSYXRpbyp3LCBfY29uZVdpZHRoUmF0aW8qdyk7XG4gICAgICAgICAgICB2YXIgeCA9IHNoaXAueCArIGQqY29zICsgX2VuZ2luZU9mZnNldCpzaW47XG4gICAgICAgICAgICB2YXIgeSA9IHNoaXAueSArIGQqc2luIC0gX2VuZ2luZU9mZnNldCpjb3M7XG4gICAgICAgICAgICBwYXJ0aWNsZS5saWZlc3BhbiA9IF9wYXJ0aWNsZVRUTDtcbiAgICAgICAgICAgIHBhcnRpY2xlLnJlc2V0KHgsIHkpO1xuICAgICAgICAgICAgcGFydGljbGUuYm9keS52ZWxvY2l0eS54ID0gX3BhcnRpY2xlQmFzZVNwZWVkKihfY29uZUxlbmd0aCpzaW4gLSBkKmNvcyk7XG4gICAgICAgICAgICBwYXJ0aWNsZS5ib2R5LnZlbG9jaXR5LnkgPSBfcGFydGljbGVCYXNlU3BlZWQqKC1fY29uZUxlbmd0aCpjb3MgLSBkKnNpbik7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IudGV4dHVyZUtleSA9IF90ZXh0dXJlS2V5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRocnVzdEdlbmVyYXRvcjsiLCIvKipcbiAqIFRvYXN0LmpzXG4gKlxuICogQ2xhc3MgZm9yIHZhcmlvdXMga2luZHMgb2YgcG9wIHVwIG1lc3NhZ2VzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFRvYXN0ID0gZnVuY3Rpb24gKGdhbWUsIHgsIHksIHRleHQsIGNvbmZpZykge1xuICAgIC8vIFRPRE86IGJldHRlciBkZWZhdWx0cywgbWF5YmVcbiAgICBQaGFzZXIuVGV4dC5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIHRleHQsIHtcbiAgICAgICAgZm9udDogJzE0cHQgQXJpYWwnLFxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXG4gICAgICAgIGZpbGw6ICcjZmZhNTAwJ1xuICAgIH0pO1xuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICAvLyBTZXQgdXAgc3R5bGVzIGFuZCB0d2VlbnNcbiAgICB2YXIgc3BlYyA9IHt9O1xuICAgIGlmIChjb25maWcudXApIHtcbiAgICAgICAgc3BlYy55ID0gJy0nICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmRvd24pIHtcbiAgICAgICAgc3BlYy55ID0gJysnICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmxlZnQpIHtcbiAgICAgICAgc3BlYy54ID0gJy0nICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLnJpZ2h0KSB7XG4gICAgICAgIHNwZWMueCA9ICcrJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgc3dpdGNoIChjb25maWcudHlwZSkge1xuICAgICAgICBjYXNlICdzcGlubmVyJzpcbiAgICAgICAgICAgIHRoaXMuZm9udFNpemUgPSAnMjBwdCc7XG4gICAgICAgICAgICBzcGVjLnJvdGF0aW9uID0gY29uZmlnLnJldm9sdXRpb25zID8gY29uZmlnLnJldm9sdXRpb25zICogMiAqIE1hdGguUEkgOiAyICogTWF0aC5QSTtcbiAgICAgICAgICAgIHZhciB0d2VlbiA9IGdhbWUuYWRkLnR3ZWVuKHRoaXMpLnRvKHNwZWMsIGNvbmZpZy5kdXJhdGlvbiwgY29uZmlnLmVhc2luZywgdHJ1ZSk7XG4gICAgICAgICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZChmdW5jdGlvbiAodG9hc3QpIHtcbiAgICAgICAgICAgICAgICB0b2FzdC5raWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gVE9ETzogTW9yZSBraW5kc1xuICAgIH1cbn07XG5cbi8qKlxuICogQ3JlYXRlIG5ldyBUb2FzdCBhbmQgYWRkIHRvIGdhbWVcbiAqXG4gKiBAcGFyYW0gZ2FtZVxuICogQHBhcmFtIHhcbiAqIEBwYXJhbSB5XG4gKiBAcGFyYW0gdGV4dFxuICogQHBhcmFtIGNvbmZpZ1xuICovXG5Ub2FzdC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSwgdGV4dCwgY29uZmlnKSB7XG4gICAgdmFyIHRvYXN0ID0gbmV3IFRvYXN0KGdhbWUsIHgsIHksIHRleHQsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodG9hc3QpO1xufTtcblxuLy8gQ292ZW5pZW5jZSBtZXRob2RzIGZvciBjb21tb24gY2FzZXNcblxuVG9hc3Quc3BpblVwID0gZnVuY3Rpb24gKGdhbWUsIHgsIHksIHRleHQpIHtcbiAgICB2YXIgdG9hc3QgPSBuZXcgVG9hc3QgKGdhbWUsIHgsIHksIHRleHQsIHtcbiAgICAgICAgdHlwZTogJ3NwaW5uZXInLFxuICAgICAgICByZXZvbHV0aW9uczogMSxcbiAgICAgICAgZHVyYXRpb246IDUwMCxcbiAgICAgICAgZWFzaW5nOiBQaGFzZXIuRWFzaW5nLkVsYXN0aWMuT3V0LFxuICAgICAgICB1cDogMTAwXG4gICAgfSk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodG9hc3QpO1xufTtcblxuVG9hc3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuVGV4dC5wcm90b3R5cGUpO1xuVG9hc3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVG9hc3Q7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9hc3Q7XG4iLCIvKipcbiAqIFRyYWN0b3JCZWFtLmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb24gb2YgYSBzaW5nbGUgdHJhY3RvciBiZWFtIHNlZ21lbnRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL0ZJWE1FOiBOaWNlciBpbXBsZW1lbnRhdGlvblxuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5UcmFjdG9yQmVhbTtcblxudmFyIFRyYWN0b3JCZWFtID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhbGwodGhpcywgZ2FtZSwgJ3RyYWN0b3InKTtcbiAgICB0aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuVHJhY3RvckJlYW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTaW1wbGVQYXJ0aWNsZS5wcm90b3R5cGUpO1xuVHJhY3RvckJlYW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVHJhY3RvckJlYW07XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShUcmFjdG9yQmVhbS5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJhY3RvckJlYW0ucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhY3RvckJlYW07IiwiLyoqXG4gKiBUcmVlLmpzXG4gKlxuICogQ2xpZW50IHNpZGVcbiAqL1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlRyZWU7XG5cbnZhciBUcmVlID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAxKTtcbn07XG5cblRyZWUuYWRkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIHZhciB0cmVlID0gbmV3IFRyZWUgKGdhbWUsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodHJlZSk7XG4gICAgcmV0dXJuIHRyZWU7XG59O1xuXG5UcmVlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5UcmVlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRyZWU7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShUcmVlLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShUcmVlLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG4vKipcbiAqIERyYXcgdHJlZSwgb3ZlcnJpZGluZyBzdGFuZGFyZCBzaGFwZSBhbmQgZ2VvbWV0cnkgbWV0aG9kIHRvIHVzZSBncmFwaFxuICpcbiAqIEBwYXJhbSByZW5kZXJTY2FsZVxuICovXG5UcmVlLnByb3RvdHlwZS5kcmF3UHJvY2VkdXJlID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlKSB7XG4gICAgdmFyIGxpbmVDb2xvciA9IFBoYXNlci5Db2xvci5oZXhUb1JHQih0aGlzLmxpbmVDb2xvcik7XG4gICAgdGhpcy5ncmFwaGljcy5saW5lU3R5bGUoMSwgbGluZUNvbG9yLCAxKTtcbiAgICB0aGlzLl9kcmF3QnJhbmNoKHRoaXMuZ3JhcGgsIHRoaXMuZ2FtZS5waHlzaWNzLnAyLm1weGkodGhpcy52ZWN0b3JTY2FsZSkqcmVuZGVyU2NhbGUsIHRoaXMuZGVwdGgpO1xufTtcblxuVHJlZS5wcm90b3R5cGUuX2RyYXdCcmFuY2ggPSBmdW5jdGlvbiAoZ3JhcGgsIHNjLCBkZXB0aCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gZ3JhcGguYy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkID0gZ3JhcGguY1tpXTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8oZ3JhcGgueCAqIHNjLCBncmFwaC55ICogc2MpO1xuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyhjaGlsZC54ICogc2MsIGNoaWxkLnkgKiBzYyk7XG4gICAgICAgIGlmIChkZXB0aCA+IHRoaXMuc3RlcCkge1xuICAgICAgICAgICAgdGhpcy5fZHJhd0JyYW5jaChjaGlsZCwgc2MsIGRlcHRoIC0gMSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVHJlZS5wcm90b3R5cGUsICdzdGVwJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RlcDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9zdGVwID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHJlZTsiLCIvKipcbiAqIFNwcml0ZSB3aXRoIGF0dGFjaGVkIEdyYXBoaWNzIG9iamVjdCBmb3IgdmVjdG9yLWxpa2UgZ3JhcGhpY3NcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL3ZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi8uLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG5cbnZhciBmcmFtZVRleHR1cmVQb29sID0ge307XG52YXIgbWFwVGV4dHVyZVBvb2wgPSB7fTtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBWZWN0b3ItYmFzZWQgc3ByaXRlc1xuICpcbiAqIEBwYXJhbSBnYW1lIHtQaGFzZXIuR2FtZX0gLSBQaGFzZXIgZ2FtZSBvYmplY3RcbiAqIEBwYXJhbSBjb25maWcge29iamVjdH0gLSBQT0pPIHdpdGggY29uZmlnIGRldGFpbHNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgVmVjdG9yU3ByaXRlID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIC8vdGhpcy5ncmFwaGljcyA9IGdhbWUubWFrZS5ncmFwaGljcygpO1xuICAgIHRoaXMuZ3JhcGhpY3MgPSB0aGlzLmdhbWUuc2hhcmVkR3JhcGhpY3M7XG4gICAgLy90aGlzLnRleHR1cmUgPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICAvL3RoaXMubWluaXRleHR1cmUgPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcblxuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUodGhpcywgZmFsc2UsIGZhbHNlKTtcbiAgICB0aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xuICAgIHRoaXMuY29uZmlnKGNvbmZpZy5wcm9wZXJ0aWVzKTtcblxuICAgIGlmICh0aGlzLnZpc2libGVPbk1hcCkge1xuICAgICAgICB0aGlzLm1pbmlzcHJpdGUgPSB0aGlzLmdhbWUubWluaW1hcC5jcmVhdGUoKTtcbiAgICAgICAgdGhpcy5taW5pc3ByaXRlLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2hhcmVkVGV4dHVyZUtleSkge1xuICAgICAgICB0aGlzLmZyYW1lcyA9IHRoaXMuZ2V0RnJhbWVQb29sKHRoaXMuc2hhcmVkVGV4dHVyZUtleSk7XG4gICAgICAgIGlmICh0aGlzLm1pbmlzcHJpdGUpIHtcbiAgICAgICAgICAgIHRoaXMubWluaXRleHR1cmUgPSB0aGlzLmdldE1hcFBvb2wodGhpcy5zaGFyZWRUZXh0dXJlS2V5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5mcmFtZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRleHR1cmVzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFRleHR1cmUodGhpcy5mcmFtZXNbdGhpcy52RnJhbWVdKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1pbmlzcHJpdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1pbmlzcHJpdGUuc2V0VGV4dHVyZSh0aGlzLm1pbml0ZXh0dXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZnJhbWVzID0gW107XG4gICAgICAgIGlmICh0aGlzLm1pbmlzcHJpdGUpIHtcbiAgICAgICAgICAgIHRoaXMubWluaXRleHR1cmUgPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZVRleHR1cmVzKCk7XG4gICAgfVxuXG4gICAgLy90aGlzLnVwZGF0ZVRleHR1cmVzKCk7XG4gICAgaWYgKHRoaXMuZnBzKSB7XG4gICAgICAgIHRoaXMuX21zUGVyRnJhbWUgPSAxMDAwIC8gdGhpcy5mcHM7XG4gICAgICAgIHRoaXMuX2xhc3RWRnJhbWUgPSB0aGlzLmdhbWUudGltZS5ub3c7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQm9keSgpO1xuICAgIHRoaXMuYm9keS5tYXNzID0gMDtcbn07XG5cbi8qKlxuICogQ3JlYXRlIFZlY3RvclNwcml0ZSBhbmQgYWRkIHRvIGdhbWUgd29ybGRcbiAqXG4gKiBAcGFyYW0gZ2FtZSB7UGhhc2VyLkdhbWV9XG4gKiBAcGFyYW0geCB7bnVtYmVyfSAtIHggY29vcmRcbiAqIEBwYXJhbSB5IHtudW1iZXJ9IC0geSBjb29yZFxuICogQHJldHVybnMge1ZlY3RvclNwcml0ZX1cbiAqL1xuVmVjdG9yU3ByaXRlLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCB4LCB5KSB7XG4gICAgdmFyIHYgPSBuZXcgVmVjdG9yU3ByaXRlKGdhbWUsIHgsIHkpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHYpO1xuICAgIHJldHVybiB2O1xufTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFZlY3RvclNwcml0ZTtcblxuLy8gRGVmYXVsdCBvY3RhZ29uXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9zaGFwZSA9IFtcbiAgICBbMiwxXSxcbiAgICBbMSwyXSxcbiAgICBbLTEsMl0sXG4gICAgWy0yLDFdLFxuICAgIFstMiwtMV0sXG4gICAgWy0xLC0yXSxcbiAgICBbMSwtMl0sXG4gICAgWzIsLTFdXG5dO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZmZmZmYnO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2ZpbGxDb2xvciA9IG51bGw7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9maWxsQWxwaGEgPSAwLjI1O1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fdmVjdG9yU2NhbGUgPSAxO1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnBoeXNpY3NCb2R5VHlwZSA9ICdjaXJjbGUnO1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLm51bUZyYW1lcyA9IDE7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLm1hcEZyYW1lID0gMDtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUudkZyYW1lID0gMDtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS52aXNpYmxlT25NYXAgPSB0cnVlO1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmdldEZyYW1lUG9vbCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoIWZyYW1lVGV4dHVyZVBvb2xba2V5XSkge1xuICAgICAgICByZXR1cm4gZnJhbWVUZXh0dXJlUG9vbFtrZXldID0gW107XG4gICAgfVxuICAgIHJldHVybiBmcmFtZVRleHR1cmVQb29sW2tleV07XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmdldE1hcFBvb2wgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKCFtYXBUZXh0dXJlUG9vbFtrZXldKSB7XG4gICAgICAgIG1hcFRleHR1cmVQb29sW2tleV0gPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcFRleHR1cmVQb29sW2tleV07XG59XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0U2hhcGUgPSBmdW5jdGlvbiAoc2hhcGUpIHtcbiAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xufTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5zZXRMaW5lU3R5bGUgPSBmdW5jdGlvbiAoY29sb3IsIGxpbmVXaWR0aCkge1xuICAgIGlmICghbGluZVdpZHRoIHx8IGxpbmVXaWR0aCA8IDEpIHtcbiAgICAgICAgbGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGggfHwgMTtcbiAgICB9XG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgIHRoaXMubGluZVdpZHRoID0gbGluZVdpZHRoO1xuICAgIHRoaXMudXBkYXRlVGV4dHVyZXMoKTtcbn07XG5cbi8qKlxuICogVXBkYXRlIGNhY2hlZCBiaXRtYXBzIGZvciBvYmplY3QgYWZ0ZXIgdmVjdG9yIHByb3BlcnRpZXMgY2hhbmdlXG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlVGV4dHVyZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gRHJhdyBmdWxsIHNpemVkXG4gICAgaWYgKHRoaXMubnVtRnJhbWVzID09PSAxKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5fY3VycmVudEJvdW5kcyA9IG51bGw7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5kcmF3UHJvY2VkdXJlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpcy5kcmF3UHJvY2VkdXJlKDEsIDApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhdygxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuZnJhbWVzWzBdKSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lc1swXSA9IHRoaXMuZ2FtZS5hZGQucmVuZGVyVGV4dHVyZSgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBib3VuZHMgPSB0aGlzLmdyYXBoaWNzLmdldExvY2FsQm91bmRzKCk7XG4gICAgICAgIHRoaXMuZnJhbWVzWzBdLnJlc2l6ZShib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIHRydWUpO1xuICAgICAgICB0aGlzLmZyYW1lc1swXS5yZW5kZXJYWSh0aGlzLmdyYXBoaWNzLCAtYm91bmRzLngsIC1ib3VuZHMueSwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm51bUZyYW1lczsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLl9jdXJyZW50Qm91bmRzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuZHJhd1Byb2NlZHVyZSgxLCBpKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5mcmFtZXNbaV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lc1tpXSA9IHRoaXMuZ2FtZS5hZGQucmVuZGVyVGV4dHVyZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm91bmRzID0gdGhpcy5ncmFwaGljcy5nZXRMb2NhbEJvdW5kcygpO1xuICAgICAgICAgICAgdGhpcy5mcmFtZXNbaV0ucmVzaXplKGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmZyYW1lc1tpXS5yZW5kZXJYWSh0aGlzLmdyYXBoaWNzLCAtYm91bmRzLngsIC1ib3VuZHMueSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRUZXh0dXJlKHRoaXMuZnJhbWVzW3RoaXMudkZyYW1lXSk7XG4gICAgLy8gRHJhdyBzbWFsbCBmb3IgbWluaW1hcFxuICAgIGlmICh0aGlzLm1pbmlzcHJpdGUpIHtcbiAgICAgICAgdmFyIG1hcFNjYWxlID0gdGhpcy5nYW1lLm1pbmltYXAubWFwU2NhbGU7XG4gICAgICAgIHZhciBtYXBGYWN0b3IgPSB0aGlzLm1hcEZhY3RvciB8fCAxO1xuICAgICAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MuX2N1cnJlbnRCb3VuZHMgPSBudWxsO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuZHJhd1Byb2NlZHVyZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd1Byb2NlZHVyZShtYXBTY2FsZSAqIG1hcEZhY3RvciwgdGhpcy5tYXBGcmFtZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaGFwZSkge1xuICAgICAgICAgICAgdGhpcy5kcmF3KG1hcFNjYWxlICogbWFwRmFjdG9yKTtcbiAgICAgICAgfVxuICAgICAgICBib3VuZHMgPSB0aGlzLmdyYXBoaWNzLmdldExvY2FsQm91bmRzKCk7XG4gICAgICAgIHRoaXMubWluaXRleHR1cmUucmVzaXplKGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMubWluaXRleHR1cmUucmVuZGVyWFkodGhpcy5ncmFwaGljcywgLWJvdW5kcy54LCAtYm91bmRzLnksIHRydWUpO1xuICAgICAgICB0aGlzLm1pbmlzcHJpdGUuc2V0VGV4dHVyZSh0aGlzLm1pbml0ZXh0dXJlKTtcbiAgICB9XG4gICAgdGhpcy5fZGlydHkgPSBmYWxzZTtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlQm9keSA9IGZ1bmN0aW9uICgpIHtcbiAgICBzd2l0Y2ggKHRoaXMucGh5c2ljc0JvZHlUeXBlKSB7XG4gICAgICAgIGNhc2UgXCJjaXJjbGVcIjpcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5jaXJjbGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHIgPSB0aGlzLmdyYXBoaWNzLmdldEJvdW5kcygpO1xuICAgICAgICAgICAgICAgIHZhciByYWRpdXMgPSBNYXRoLnJvdW5kKE1hdGguc3FydChyLndpZHRoKiByLmhlaWdodCkvMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJhZGl1cyA9IHRoaXMucmFkaXVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ib2R5LnNldENpcmNsZShyYWRpdXMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIFRPRE86IE1vcmUgc2hhcGVzXG4gICAgfVxufTtcblxuLyoqXG4gKiBSZW5kZXIgdmVjdG9yIHRvIGJpdG1hcCBvZiBncmFwaGljcyBvYmplY3QgYXQgZ2l2ZW4gc2NhbGVcbiAqXG4gKiBAcGFyYW0gcmVuZGVyU2NhbGUge251bWJlcn0gLSBzY2FsZSBmYWN0b3IgZm9yIHJlbmRlclxuICovXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAocmVuZGVyU2NhbGUpIHtcbiAgICByZW5kZXJTY2FsZSA9IHJlbmRlclNjYWxlIHx8IDE7XG4gICAgLy8gRHJhdyBzaW1wbGUgc2hhcGUsIGlmIGdpdmVuXG4gICAgaWYgKHRoaXMuc2hhcGUpIHtcbiAgICAgICAgdmFyIGxpbmVDb2xvciA9IFBoYXNlci5Db2xvci5oZXhUb1JHQih0aGlzLmxpbmVDb2xvcik7XG4gICAgICAgIGlmIChyZW5kZXJTY2FsZSA9PT0gMSkge1xuICAgICAgICAgICAgdmFyIGxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGluZVdpZHRoID0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHJlbmRlclNjYWxlID09PSAxKSAmJiB0aGlzLmZpbGxDb2xvcikgeyAgICAgICAgLy8gT25seSBmaWxsIGZ1bGwgc2l6ZWRcbiAgICAgICAgICAgIHZhciBmaWxsQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5maWxsQ29sb3IpO1xuICAgICAgICAgICAgdmFyIGZpbGxBbHBoYSA9IHRoaXMuZmlsbEFscGhhIHx8IDE7XG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmJlZ2luRmlsbChmaWxsQ29sb3IsIGZpbGxBbHBoYSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lU3R5bGUobGluZVdpZHRoLCBsaW5lQ29sb3IsIDEpO1xuICAgICAgICB0aGlzLl9kcmF3UG9seWdvbih0aGlzLnNoYXBlLCB0aGlzLnNoYXBlQ2xvc2VkLCByZW5kZXJTY2FsZSk7XG4gICAgICAgIGlmICgocmVuZGVyU2NhbGUgPT09IDEpICYmIHRoaXMuZmlsbENvbG9yKSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmVuZEZpbGwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBEcmF3IGdlb21ldHJ5IHNwZWMsIGlmIGdpdmVuLCBidXQgb25seSBmb3IgdGhlIGZ1bGwgc2l6ZWQgc3ByaXRlXG4gICAgaWYgKChyZW5kZXJTY2FsZSA9PT0gMSkgJiYgdGhpcy5nZW9tZXRyeSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuZ2VvbWV0cnkubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZyA9IHRoaXMuZ2VvbWV0cnlbaV07XG4gICAgICAgICAgICBzd2l0Y2ggKGcudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJwb2x5XCI6XG4gICAgICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBkZWZhdWx0cyBhbmQgc3R1ZmZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhd1BvbHlnb24oZy5wb2ludHMsIGcuY2xvc2VkLCByZW5kZXJTY2FsZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBEcmF3IG9wZW4gb3IgY2xvc2VkIHBvbHlnb24gYXMgc2VxdWVuY2Ugb2YgbGluZVRvIGNhbGxzXG4gKlxuICogQHBhcmFtIHBvaW50cyB7QXJyYXl9IC0gcG9pbnRzIGFzIGFycmF5IG9mIFt4LHldIHBhaXJzXG4gKiBAcGFyYW0gY2xvc2VkIHtib29sZWFufSAtIGlzIHBvbHlnb24gY2xvc2VkP1xuICogQHBhcmFtIHJlbmRlclNjYWxlIHtudW1iZXJ9IC0gc2NhbGUgZmFjdG9yIGZvciByZW5kZXJcbiAqIEBwcml2YXRlXG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2RyYXdQb2x5Z29uID0gZnVuY3Rpb24gKHBvaW50cywgY2xvc2VkLCByZW5kZXJTY2FsZSkge1xuICAgIHZhciBzYyA9IHRoaXMuZ2FtZS5waHlzaWNzLnAyLm1weGkodGhpcy52ZWN0b3JTY2FsZSkqcmVuZGVyU2NhbGU7XG4gICAgcG9pbnRzID0gcG9pbnRzLnNsaWNlKCk7XG4gICAgaWYgKGNsb3NlZCkge1xuICAgICAgICBwb2ludHMucHVzaChwb2ludHNbMF0pO1xuICAgIH1cbiAgICB0aGlzLmdyYXBoaWNzLm1vdmVUbyhwb2ludHNbMF1bMF0gKiBzYywgcG9pbnRzWzBdWzFdICogc2MpO1xuICAgIGZvciAodmFyIGkgPSAxLCBsID0gcG9pbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyhwb2ludHNbaV1bMF0gKiBzYywgcG9pbnRzW2ldWzFdICogc2MpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSW52YWxpZGF0ZSBjYWNoZSBhbmQgcmVkcmF3IGlmIHNwcml0ZSBpcyBtYXJrZWQgZGlydHlcbiAqL1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX2RpcnR5KSB7XG4gICAgICAgIHRoaXMudXBkYXRlVGV4dHVyZXMoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX21zUGVyRnJhbWUgJiYgKHRoaXMuZ2FtZS50aW1lLm5vdyA+PSB0aGlzLl9sYXN0VkZyYW1lICsgdGhpcy5fbXNQZXJGcmFtZSkpIHtcbiAgICAgICAgdGhpcy52RnJhbWUgPSAodGhpcy52RnJhbWUgKyAxKSAlIHRoaXMubnVtRnJhbWVzO1xuICAgICAgICB0aGlzLnNldFRleHR1cmUodGhpcy5mcmFtZXNbdGhpcy52RnJhbWVdKTtcbiAgICAgICAgdGhpcy5fbGFzdFZGcmFtZSA9IHRoaXMuZ2FtZS50aW1lLm5vdztcbiAgICB9XG59O1xuXG4vLyBWZWN0b3IgcHJvcGVydGllcyBkZWZpbmVkIHRvIGhhbmRsZSBtYXJraW5nIHNwcml0ZSBkaXJ0eSB3aGVuIG5lY2Vzc2FyeVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2xpbmVDb2xvcicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpbmVDb2xvcjtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9saW5lQ29sb3IgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdmaWxsQ29sb3InLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9maWxsQ29sb3I7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fZmlsbENvbG9yID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnbGluZVdpZHRoJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGluZVdpZHRoO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2xpbmVXaWR0aCA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2ZpbGxBbHBoYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGxBbHBoYTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9maWxsQWxwaGEgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdzaGFwZUNsb3NlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NoYXBlQ2xvc2VkO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX3NoYXBlQ2xvc2VkID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAndmVjdG9yU2NhbGUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92ZWN0b3JTY2FsZTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl92ZWN0b3JTY2FsZSA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3NoYXBlJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2hhcGU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fc2hhcGUgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdnZW9tZXRyeScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dlb21ldHJ5O1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2dlb21ldHJ5ID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZGVhZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlYWQ7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fZGVhZCA9IHZhbDtcbiAgICAgICAgaWYgKHZhbCkge1xuICAgICAgICAgICAgdGhpcy5raWxsKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJldml2ZSgpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBWZWN0b3JTcHJpdGU7XG4vL1N0YXJjb2Rlci5WZWN0b3JTcHJpdGUgPSBWZWN0b3JTcHJpdGU7IiwiLyoqXG4gKiBDb250cm9scy5qc1xuICpcbiAqIFZpcnR1YWxpemUgYW5kIGltcGxlbWVudCBxdWV1ZSBmb3IgZ2FtZSBjb250cm9sc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG5cbnZhciBDb250cm9scyA9IGZ1bmN0aW9uIChnYW1lLCBwYXJlbnQpIHtcbiAgICBQaGFzZXIuUGx1Z2luLmNhbGwodGhpcywgZ2FtZSwgcGFyZW50KTtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlBsdWdpbi5wcm90b3R5cGUpO1xuQ29udHJvbHMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29udHJvbHM7XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHF1ZXVlKSB7XG4gICAgdGhpcy5xdWV1ZSA9IHF1ZXVlO1xuICAgIHRoaXMuY29udHJvbHMgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xuICAgIHRoaXMuY29udHJvbHMuZmlyZSA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkIpO1xuICAgIHRoaXMuY29udHJvbHMudHJhY3RvciA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlQpO1xuICAgIHRoaXMuam95c3RpY2tTdGF0ZSA9IHtcbiAgICAgICAgdXA6IGZhbHNlLFxuICAgICAgICBkb3duOiBmYWxzZSxcbiAgICAgICAgbGVmdDogZmFsc2UsXG4gICAgICAgIHJpZ2h0OiBmYWxzZSxcbiAgICAgICAgZmlyZTogZmFsc2VcbiAgICB9O1xuXG4gICAgLy8gQWRkIHZpcnR1YWwgam95c3RpY2sgaWYgcGx1Z2luIGlzIGF2YWlsYWJsZVxuICAgIGlmIChQaGFzZXIuVmlydHVhbEpveXN0aWNrKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2sgPSB0aGlzLmdhbWUuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihQaGFzZXIuVmlydHVhbEpveXN0aWNrKTtcbiAgICB9XG59O1xuXG52YXIgc2VxID0gMDtcbnZhciB1cCA9IGZhbHNlLCBkb3duID0gZmFsc2UsIGxlZnQgPSBmYWxzZSwgcmlnaHQgPSBmYWxzZSwgZmlyZSA9IGZhbHNlLCB0cmFjdG9yID0gZmFsc2U7XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5hZGRWaXJ0dWFsQ29udHJvbHMgPSBmdW5jdGlvbiAodGV4dHVyZSkge1xuICAgIHRleHR1cmUgPSB0ZXh0dXJlIHx8ICdqb3lzdGljayc7XG4gICAgdmFyIHNjYWxlID0gMTsgICAgICAgICAgICAvLyBGSVhNRVxuICAgIHRoaXMuc3RpY2sgPSB0aGlzLmpveXN0aWNrLmFkZFN0aWNrKDAsIDAsIDEwMCx0ZXh0dXJlKTtcbiAgICAvL3RoaXMuc3RpY2subW90aW9uTG9jayA9IFBoYXNlci5WaXJ0dWFsSm95c3RpY2suSE9SSVpPTlRBTDtcbiAgICB0aGlzLnN0aWNrLnNjYWxlID0gc2NhbGU7XG4gICAgLy90aGlzLmdvYnV0dG9uID0gdGhpcy5qb3lzdGljay5hZGRCdXR0b24oeCArIDIwMCpzY2FsZSwgeSwgdGV4dHVyZSwgJ2J1dHRvbjEtdXAnLCAnYnV0dG9uMS1kb3duJyk7XG4gICAgdGhpcy5maXJlYnV0dG9uID0gdGhpcy5qb3lzdGljay5hZGRCdXR0b24oMCwgMCwgdGV4dHVyZSwgJ2J1dHRvbjEtdXAnLCAnYnV0dG9uMS1kb3duJyk7XG4gICAgdGhpcy50cmFjdG9yYnV0dG9uID0gdGhpcy5qb3lzdGljay5hZGRCdXR0b24oMCwgMCwgdGV4dHVyZSwgJ2J1dHRvbjItdXAnLCAnYnV0dG9uMi1kb3duJyk7XG4gICAgdGhpcy5maXJlYnV0dG9uLnNjYWxlID0gc2NhbGU7XG4gICAgLy90aGlzLmdvYnV0dG9uLnNjYWxlID0gc2NhbGU7XG4gICAgdGhpcy50cmFjdG9yYnV0dG9uLnNjYWxlID0gc2NhbGU7XG4gICAgdGhpcy5sYXlvdXRWaXJ0dWFsQ29udHJvbHMoc2NhbGUpO1xuICAgIHRoaXMuc3RpY2sub25Nb3ZlLmFkZChmdW5jdGlvbiAoc3RpY2ssIGYsIGZYLCBmWSkge1xuICAgICAgICBpZiAoZlggPj0gMC4zNSkge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5sZWZ0ID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoZlggPD0gLTAuMzUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5yaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmxlZnQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUubGVmdCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmWSA+PSAwLjM1KSB7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUuZG93biA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudXAgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChmWSA8PSAtMC4zNSkge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmRvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUuZG93biA9IGZhbHNlOztcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5zdGljay5vblVwLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5yaWdodCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmxlZnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmRvd24gPSBmYWxzZTtcbiAgICB9LCB0aGlzKTtcbiAgICB0aGlzLmZpcmVidXR0b24ub25Eb3duLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5maXJlID0gdHJ1ZTtcbiAgICB9LCB0aGlzKTtcbiAgICB0aGlzLmZpcmVidXR0b24ub25VcC5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUuZmlyZSA9IGZhbHNlO1xuICAgIH0sIHRoaXMpO1xuICAgIC8vdGhpcy5nb2J1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgICB0aGlzLmpveXN0aWNrU3RhdGUudXAgPSB0cnVlO1xuICAgIC8vfSwgdGhpcyk7XG4gICAgLy90aGlzLmdvYnV0dG9uLm9uVXAuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgICB0aGlzLmpveXN0aWNrU3RhdGUudXAgPSBmYWxzZTtcbiAgICAvL30sIHRoaXMpO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnRyYWN0b3IgPSB0cnVlO1xuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5vblVwLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS50cmFjdG9yID0gZmFsc2U7XG4gICAgfSwgdGhpcyk7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUubGF5b3V0VmlydHVhbENvbnRyb2xzID0gZnVuY3Rpb24gKHNjYWxlKSB7XG4gICAgdmFyIHkgPSB0aGlzLmdhbWUuaGVpZ2h0IC0gMTI1ICogc2NhbGU7XG4gICAgdmFyIHcgPSB0aGlzLmdhbWUud2lkdGg7XG4gICAgdGhpcy5zdGljay5wb3NYID0gMTUwICogc2NhbGU7XG4gICAgdGhpcy5zdGljay5wb3NZID0geTtcbiAgICB0aGlzLmZpcmVidXR0b24ucG9zWCA9IHcgLSAyNTAgKiBzY2FsZTtcbiAgICB0aGlzLmZpcmVidXR0b24ucG9zWSA9IHk7XG4gICAgdGhpcy50cmFjdG9yYnV0dG9uLnBvc1ggPSB3IC0gMTI1ICogc2NhbGU7XG4gICAgdGhpcy50cmFjdG9yYnV0dG9uLnBvc1kgPSB5O1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHVwID0gZG93biA9IGxlZnQgPSByaWdodCA9IGZhbHNlO1xuICAgIHRoaXMucXVldWUubGVuZ3RoID0gMDtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5wcmVVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gVE9ETzogU3VwcG9ydCBvdGhlciBpbnRlcmFjdGlvbnMvbWV0aG9kc1xuICAgIHZhciBjb250cm9scyA9IHRoaXMuY29udHJvbHM7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5qb3lzdGlja1N0YXRlO1xuICAgIGlmICgoc3RhdGUudXAgfHwgY29udHJvbHMudXAuaXNEb3duKSAmJiAhdXApIHtcbiAgICAgICAgdXAgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICd1cF9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghc3RhdGUudXAgJiYgIWNvbnRyb2xzLnVwLmlzRG93biAmJiB1cCkge1xuICAgICAgICB1cCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICd1cF9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKHN0YXRlLmRvd24gfHwgY29udHJvbHMuZG93bi5pc0Rvd24pICYmICFkb3duKSB7XG4gICAgICAgIGRvd24gPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdkb3duX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS5kb3duICYmICFjb250cm9scy5kb3duLmlzRG93biAmJiBkb3duKSB7XG4gICAgICAgIGRvd24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZG93bl9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKHN0YXRlLnJpZ2h0IHx8IGNvbnRyb2xzLnJpZ2h0LmlzRG93bikgJiYgIXJpZ2h0KSB7XG4gICAgICAgIHJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAncmlnaHRfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLnJpZ2h0ICYmICFjb250cm9scy5yaWdodC5pc0Rvd24gJiYgcmlnaHQpIHtcbiAgICAgICAgcmlnaHQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAncmlnaHRfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKChzdGF0ZS5sZWZ0IHx8IGNvbnRyb2xzLmxlZnQuaXNEb3duKSAmJiAhbGVmdCkge1xuICAgICAgICBsZWZ0ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnbGVmdF9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghc3RhdGUubGVmdCAmJiAhY29udHJvbHMubGVmdC5pc0Rvd24gJiYgbGVmdCkge1xuICAgICAgICBsZWZ0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2xlZnRfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKChzdGF0ZS5maXJlIHx8IGNvbnRyb2xzLmZpcmUuaXNEb3duKSAmJiAhZmlyZSkge1xuICAgICAgICBmaXJlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZmlyZV9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghc3RhdGUuZmlyZSAmJiAhY29udHJvbHMuZmlyZS5pc0Rvd24gJiYgZmlyZSkge1xuICAgICAgICBmaXJlID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2ZpcmVfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKChzdGF0ZS50cmFjdG9yIHx8IGNvbnRyb2xzLnRyYWN0b3IuaXNEb3duKSAmJiAhdHJhY3Rvcikge1xuICAgICAgICB0cmFjdG9yID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndHJhY3Rvcl9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoIXN0YXRlLnRyYWN0b3IgJiYgIWNvbnRyb2xzLnRyYWN0b3IuaXNEb3duKSAmJiB0cmFjdG9yKSB7XG4gICAgICAgIHRyYWN0b3IgPSBmYWxzZTsvL1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICd0cmFjdG9yX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxufTtcblxudmFyIGFjdGlvbjsgICAgICAgICAgICAgLy8gTW9kdWxlIHNjb3BlIHRvIGF2b2lkIGFsbG9jYXRpb25zXG5cbkNvbnRyb2xzLnByb3RvdHlwZS5wcm9jZXNzUXVldWUgPSBmdW5jdGlvbiAoY2IsIGNsZWFyKSB7XG4gICAgdmFyIHF1ZXVlID0gdGhpcy5xdWV1ZTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHF1ZXVlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBhY3Rpb24gPSBxdWV1ZVtpXTtcbiAgICAgICAgaWYgKGFjdGlvbi5leGVjdXRlZCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2IoYWN0aW9uKTtcbiAgICAgICAgYWN0aW9uLmV0aW1lID0gdGhpcy5nYW1lLnRpbWUubm93O1xuICAgICAgICBhY3Rpb24uZXhlY3V0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoY2xlYXIpIHtcbiAgICAgICAgcXVldWUubGVuZ3RoID0gMDtcbiAgICB9XG59O1xuXG5TdGFyY29kZXIuQ29udHJvbHMgPSBDb250cm9scztcbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbHM7IiwiLyoqXG4gKiBTeW5jQ2xpZW50LmpzXG4gKlxuICogU3luYyBwaHlzaWNzIG9iamVjdHMgd2l0aCBzZXJ2ZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xudmFyIFVQREFURV9RVUVVRV9MSU1JVCA9IDg7XG5cbnZhciBTeW5jQ2xpZW50ID0gZnVuY3Rpb24gKGdhbWUsIHBhcmVudCkge1xuICAgIFBoYXNlci5QbHVnaW4uY2FsbCh0aGlzLCBnYW1lLCBwYXJlbnQpO1xufTtcblxuU3luY0NsaWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5QbHVnaW4ucHJvdG90eXBlKTtcblN5bmNDbGllbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3luY0NsaWVudDtcblxuXG4vKipcbiAqIEluaXRpYWxpemUgcGx1Z2luXG4gKlxuICogQHBhcmFtIHNvY2tldCB7U29ja2V0fSAtIHNvY2tldC5pbyBzb2NrZXQgZm9yIHN5bmMgY29ubmVjdGlvblxuICogQHBhcmFtIHF1ZXVlIHtBcnJheX0gLSBjb21tYW5kIHF1ZXVlXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoc29ja2V0LCBxdWV1ZSkge1xuICAgIC8vIFRPRE86IENvcHkgc29tZSBjb25maWcgb3B0aW9uc1xuICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xuICAgIHRoaXMuY21kUXVldWUgPSBxdWV1ZTtcbiAgICB0aGlzLmV4dGFudCA9IHt9O1xufTtcblxuLyoqXG4gKiBTdGFydCBwbHVnaW5cbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBzdGFyY29kZXIgPSB0aGlzLmdhbWUuc3RhcmNvZGVyO1xuICAgIHRoaXMuX3VwZGF0ZUNvbXBsZXRlID0gZmFsc2U7XG4gICAgLy8gRklYTUU6IE5lZWQgbW9yZSByb2J1c3QgaGFuZGxpbmcgb2YgREMvUkNcbiAgICB0aGlzLnNvY2tldC5vbignZGlzY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5nYW1lLnBhdXNlZCA9IHRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ3JlY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5nYW1lLnBhdXNlZCA9IGZhbHNlO1xuICAgIH0pO1xuICAgIC8vIE1lYXN1cmUgY2xpZW50LXNlcnZlciB0aW1lIGRlbHRhXG4gICAgdGhpcy5zb2NrZXQub24oJ3RpbWVzeW5jJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgc2VsZi5fbGF0ZW5jeSA9IGRhdGEgLSBzZWxmLmdhbWUudGltZS5ub3c7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciByZWFsVGltZSA9IGRhdGEucjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBkYXRhLmIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdXBkYXRlID0gZGF0YS5iW2ldO1xuICAgICAgICAgICAgdmFyIGlkID0gdXBkYXRlLmlkO1xuICAgICAgICAgICAgdmFyIHNwcml0ZTtcbiAgICAgICAgICAgIHVwZGF0ZS50aW1lc3RhbXAgPSByZWFsVGltZTtcbiAgICAgICAgICAgIGlmIChzcHJpdGUgPSBzZWxmLmV4dGFudFtpZF0pIHtcbiAgICAgICAgICAgICAgICAvLyBFeGlzdGluZyBzcHJpdGUgLSBwcm9jZXNzIHVwZGF0ZVxuICAgICAgICAgICAgICAgIHNwcml0ZS51cGRhdGVRdWV1ZS5wdXNoKHVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZS5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS5jb25maWcodXBkYXRlLnByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3ByaXRlLnVwZGF0ZVF1ZXVlLmxlbmd0aCA+IFVQREFURV9RVUVVRV9MSU1JVCkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUudXBkYXRlUXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIE5ldyBzcHJpdGUgLSBjcmVhdGUgYW5kIGNvbmZpZ3VyZVxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ05ldycsIGlkLCB1cGRhdGUudCk7XG4gICAgICAgICAgICAgICAgc3ByaXRlID0gc3RhcmNvZGVyLmFkZEJvZHkodXBkYXRlLnQsIHVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHNwcml0ZSkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc2VydmVySWQgPSBpZDtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5leHRhbnRbaWRdID0gc3ByaXRlO1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUudXBkYXRlUXVldWUgPSBbdXBkYXRlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMCwgbCA9IGRhdGEucm0ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBpZCA9IGRhdGEucm1baV07XG4gICAgICAgICAgICBpZiAoc2VsZi5leHRhbnRbaWRdKSB7XG4gICAgICAgICAgICAgICAgc3RhcmNvZGVyLnJlbW92ZUJvZHkoc2VsZi5leHRhbnRbaWRdKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgc2VsZi5leHRhbnRbaWRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFNlbmQgcXVldWVkIGNvbW1hbmRzIHRvIHNlcnZlciBhbmQgaW50ZXJwb2xhdGUgb2JqZWN0cyBiYXNlZCBvbiB1cGRhdGVzIGZyb20gc2VydmVyXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX3VwZGF0ZUNvbXBsZXRlKSB7XG4gICAgICAgIHRoaXMuX3NlbmRDb21tYW5kcygpO1xuICAgICAgICB0aGlzLl9wcm9jZXNzUGh5c2ljc1VwZGF0ZXMoKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ29tcGxldGUgPSB0cnVlO1xuICAgIH1cbiB9O1xuXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5wb3N0UmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX3VwZGF0ZUNvbXBsZXRlID0gZmFsc2U7XG59O1xuXG5cbnZhciBhY3Rpb25zID0gW107ICAgICAgICAgICAgICAgLy8gTW9kdWxlIHNjb3BlIHRvIGF2b2lkIGFsbG9jYXRpb25zXG52YXIgYWN0aW9uO1xuLyoqXG4gKiBTZW5kIHF1ZXVlZCBjb21tYW5kcyB0aGF0IGhhdmUgYmVlbiBleGVjdXRlZCB0byB0aGUgc2VydmVyXG4gKlxuICogQHByaXZhdGVcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUuX3NlbmRDb21tYW5kcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBhY3Rpb25zLmxlbmd0aCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IHRoaXMuY21kUXVldWUubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGFjdGlvbiA9IHRoaXMuY21kUXVldWVbaV07XG4gICAgICAgIGlmIChhY3Rpb24uZXhlY3V0ZWQpIHtcbiAgICAgICAgICAgIGFjdGlvbnMudW5zaGlmdChhY3Rpb24pO1xuICAgICAgICAgICAgdGhpcy5jbWRRdWV1ZS5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFjdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2RvJywgYWN0aW9ucyk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ3NlbmRpbmcgYWN0aW9ucycsIGFjdGlvbnMpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSGFuZGxlcyBpbnRlcnBvbGF0aW9uIC8gcHJlZGljdGlvbiByZXNvbHV0aW9uIGZvciBwaHlzaWNzIGJvZGllc1xuICpcbiAqIEBwcml2YXRlXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLl9wcm9jZXNzUGh5c2ljc1VwZGF0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGludGVycFRpbWUgPSB0aGlzLmdhbWUudGltZS5ub3cgKyB0aGlzLl9sYXRlbmN5IC0gdGhpcy5nYW1lLnN0YXJjb2Rlci5jb25maWcucmVuZGVyTGF0ZW5jeTtcbiAgICB2YXIgb2lkcyA9IE9iamVjdC5rZXlzKHRoaXMuZXh0YW50KTtcbiAgICBmb3IgKHZhciBpID0gb2lkcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgc3ByaXRlID0gdGhpcy5leHRhbnRbb2lkc1tpXV07XG4gICAgICAgIHZhciBxdWV1ZSA9IHNwcml0ZS51cGRhdGVRdWV1ZTtcbiAgICAgICAgdmFyIGJlZm9yZSA9IG51bGwsIGFmdGVyID0gbnVsbDtcblxuICAgICAgICAvLyBGaW5kIHVwZGF0ZXMgYmVmb3JlIGFuZCBhZnRlciBpbnRlcnBUaW1lXG4gICAgICAgIHZhciBqID0gMTtcbiAgICAgICAgd2hpbGUgKHF1ZXVlW2pdKSB7XG4gICAgICAgICAgICBpZiAocXVldWVbal0udGltZXN0YW1wID4gaW50ZXJwVGltZSkge1xuICAgICAgICAgICAgICAgIGFmdGVyID0gcXVldWVbal07XG4gICAgICAgICAgICAgICAgYmVmb3JlID0gcXVldWVbai0xXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGorKztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vbmUgLSB3ZSdyZSBiZWhpbmQuXG4gICAgICAgIGlmICghYmVmb3JlICYmICFhZnRlcikge1xuICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+PSAyKSB7ICAgIC8vIFR3byBtb3N0IHJlY2VudCB1cGRhdGVzIGF2YWlsYWJsZT8gVXNlIHRoZW0uXG4gICAgICAgICAgICAgICAgYmVmb3JlID0gcXVldWVbcXVldWUubGVuZ3RoIC0gMl07XG4gICAgICAgICAgICAgICAgYWZ0ZXIgPSBxdWV1ZVtxdWV1ZS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdMYWdnaW5nJywgb2lkc1tpXSk7XG4gICAgICAgICAgICB9IGVsc2UgeyAgICAgICAgICAgICAgICAgICAgLy8gTm8/IEp1c3QgYmFpbFxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ0JhaWxpbmcnLCBvaWRzW2ldKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ09rJywgaW50ZXJwVGltZSwgcXVldWUubGVuZ3RoKTtcbiAgICAgICAgICAgIHF1ZXVlLnNwbGljZSgwLCBqIC0gMSk7ICAgICAvLyBUaHJvdyBvdXQgb2xkZXIgdXBkYXRlc1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNwYW4gPSBhZnRlci50aW1lc3RhbXAgLSBiZWZvcmUudGltZXN0YW1wO1xuICAgICAgICB2YXIgdCA9IChpbnRlcnBUaW1lIC0gYmVmb3JlLnRpbWVzdGFtcCkgLyBzcGFuO1xuICAgICAgICAvL2lmICh0IDwgMCB8fCB0ID4gMSkge1xuICAgICAgICAvLyAgICBjb25zb2xlLmxvZygnd2VpcmQgdGltZScsIHQpO1xuICAgICAgICAvL31cbiAgICAgICAgdCA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIHQpKTsgICAgICAgIC8vIEZJWE1FOiBTdG9wZ2FwIGZpeCAtIFNob3VsZG4ndCBuZWVkIHRoaXNcbiAgICAgICAgc3ByaXRlLnNldFBvc0FuZ2xlKGxpbmVhcihiZWZvcmUueCwgYWZ0ZXIueCwgdCksIGxpbmVhcihiZWZvcmUueSwgYWZ0ZXIueSwgdCksIGxpbmVhcihiZWZvcmUuYSwgYWZ0ZXIuYSwgdCkpO1xuICAgIH1cbn07XG5cbi8vIEhlbHBlcnNcblxuLyoqXG4gKiBJbnRlcnBvbGF0ZSBiZXR3ZWVuIHR3byBwb2ludHMgd2l0aCBoZXJtaXRlIHNwbGluZVxuICogTkIgLSBjdXJyZW50bHkgdW51c2VkIGFuZCBwcm9iYWJseSBicm9rZW5cbiAqXG4gKiBAcGFyYW0gcDAge251bWJlcn0gLSBpbml0aWFsIHZhbHVlXG4gKiBAcGFyYW0gcDEge251bWJlcn0gLSBmaW5hbCB2YWx1ZVxuICogQHBhcmFtIHYwIHtudW1iZXJ9IC0gaW5pdGlhbCBzbG9wZVxuICogQHBhcmFtIHYxIHtudW1iZXJ9IC0gZmluYWwgc2xvcGVcbiAqIEBwYXJhbSB0IHtudW1iZXJ9IC0gcG9pbnQgb2YgaW50ZXJwb2xhdGlvbiAoYmV0d2VlbiAwIGFuZCAxKVxuICogQHJldHVybnMge251bWJlcn0gLSBpbnRlcnBvbGF0ZWQgdmFsdWVcbiAqL1xuZnVuY3Rpb24gaGVybWl0ZSAocDAsIHAxLCB2MCwgdjEsIHQpIHtcbiAgICB2YXIgdDIgPSB0KnQ7XG4gICAgdmFyIHQzID0gdCp0MjtcbiAgICByZXR1cm4gKDIqdDMgLSAzKnQyICsgMSkqcDAgKyAodDMgLSAyKnQyICsgdCkqdjAgKyAoLTIqdDMgKyAzKnQyKSpwMSArICh0MyAtIHQyKSp2MTtcbn1cblxuLyoqXG4gKiBJbnRlcnBvbGF0ZSBiZXR3ZWVuIHR3byBwb2ludHMgd2l0aCBsaW5lYXIgc3BsaW5lXG4gKlxuICogQHBhcmFtIHAwIHtudW1iZXJ9IC0gaW5pdGlhbCB2YWx1ZVxuICogQHBhcmFtIHAxIHtudW1iZXJ9IC0gZmluYWwgdmFsdWVcbiAqIEBwYXJhbSB0IHtudW1iZXJ9IC0gcG9pbnQgb2YgaW50ZXJwb2xhdGlvbiAoYmV0d2VlbiAwIGFuZCAxKVxuICogQHBhcmFtIHNjYWxlIHtudW1iZXJ9IC0gc2NhbGUgZmFjdG9yIHRvIG5vcm1hbGl6ZSB1bml0c1xuICogQHJldHVybnMge251bWJlcn0gLSBpbnRlcnBvbGF0ZWQgdmFsdWVcbiAqL1xuZnVuY3Rpb24gbGluZWFyIChwMCwgcDEsIHQsIHNjYWxlKSB7XG4gICAgc2NhbGUgPSBzY2FsZSB8fCAxO1xuICAgIHJldHVybiBwMCArIChwMSAtIHAwKSp0KnNjYWxlO1xufVxuXG5TdGFyY29kZXIuU2VydmVyU3luYyA9IFN5bmNDbGllbnQ7XG5tb2R1bGUuZXhwb3J0cyA9IFN5bmNDbGllbnQ7IiwiLyoqXG4gKiBCb290LmpzXG4gKlxuICogQm9vdCBzdGF0ZSBmb3IgU3RhcmNvZGVyXG4gKiBMb2FkIGFzc2V0cyBmb3IgcHJlbG9hZCBzY3JlZW4gYW5kIGNvbm5lY3QgdG8gc2VydmVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbnRyb2xzID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9Db250cm9scy5qcycpO1xudmFyIFN5bmNDbGllbnQgPSByZXF1aXJlKCcuLi9waGFzZXJwbHVnaW5zL1N5bmNDbGllbnQuanMnKTtcblxudmFyIEJvb3QgPSBmdW5jdGlvbiAoKSB7fTtcblxuQm9vdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuQm9vdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCb290O1xuXG4vL3ZhciBfY29ubmVjdGVkID0gZmFsc2U7XG5cbi8qKlxuICogU2V0IHByb3BlcnRpZXMgdGhhdCByZXF1aXJlIGJvb3RlZCBnYW1lIHN0YXRlLCBhdHRhY2ggcGx1Z2lucywgY29ubmVjdCB0byBnYW1lIHNlcnZlclxuICovXG5Cb290LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdjdXN0b20gemlwIHRlc3QgdjIuMCcpO1xuICAgIC8vY29uc29sZS5sb2coJ0luaXQgQm9vdCcsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG4gICAgLy9jb25zb2xlLmxvZygnaXcgQm9vdCcsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQsIHNjcmVlbi53aWR0aCwgc2NyZWVuLmhlaWdodCwgd2luZG93LmRldmljZVBpeGVsUmF0aW8pO1xuICAgIC8vdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkU7XG4gICAgdGhpcy5nYW1lLnNjYWxlLm9uU2l6ZUNoYW5nZS5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnbWFzdGVyIHJlc2l6ZSBDQicpO1xuICAgIH0pO1xuICAgIHRoaXMuZ2FtZS5yZW5kZXJlci5yZW5kZXJTZXNzaW9uLnJvdW5kUGl4ZWxzID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUuc2hhcmVkR3JhcGhpY3MgPSB0aGlzLmdhbWUubWFrZS5ncmFwaGljcygpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcFNjYWxlID0gdGhpcy5zdGFyY29kZXIuY29uZmlnLnBoeXNpY3NTY2FsZTtcbiAgICB2YXIgaXBTY2FsZSA9IDEvcFNjYWxlO1xuICAgIHZhciBmbG9vciA9IE1hdGguZmxvb3I7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuY29uZmlnID0ge1xuICAgICAgICBweG06IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gaXBTY2FsZSphO1xuICAgICAgICB9LFxuICAgICAgICBtcHg6IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gZmxvb3IocFNjYWxlKmEpO1xuICAgICAgICB9LFxuICAgICAgICBweG1pOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIC1pcFNjYWxlKmE7XG4gICAgICAgIH0sXG4gICAgICAgIG1weGk6IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gZmxvb3IoLXBTY2FsZSphKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5zdGFyY29kZXIuc2VydmVyQ29ubmVjdCgpO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuY29udHJvbHMgPSB0aGlzLmdhbWUucGx1Z2lucy5hZGQoQ29udHJvbHMsXG4gICAgLy8gICAgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIC8vdGhpcy5nYW1lLmpveXN0aWNrID0gdGhpcy5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKFBoYXNlci5WaXJ0dWFsSm95c3RpY2spO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuY29udHJvbHMgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oQ29udHJvbHMsIHRoaXMuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICAvLyBTZXQgdXAgc29ja2V0LmlvIGNvbm5lY3Rpb25cbiAgICAvL3RoaXMuc3RhcmNvZGVyLnNvY2tldCA9IHRoaXMuc3RhcmNvZGVyLmlvKHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5zZXJ2ZXJVcmksXG4gICAgLy8gICAgdGhpcy5zdGFyY29kZXIuY29uZmlnLmlvQ2xpZW50T3B0aW9ucyk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5zb2NrZXQub24oJ3NlcnZlciByZWFkeScsIGZ1bmN0aW9uIChwbGF5ZXJNc2cpIHtcbiAgICAvLyAgICAvLyBGSVhNRTogSGFzIHRvIGludGVyYWN0IHdpdGggc2Vzc2lvbiBmb3IgYXV0aGVudGljYXRpb24gZXRjLlxuICAgIC8vICAgIHNlbGYuc3RhcmNvZGVyLnBsYXllciA9IHBsYXllck1zZztcbiAgICAvLyAgICAvL3NlbGYuc3RhcmNvZGVyLnN5bmNjbGllbnQgPSBzZWxmLmdhbWUucGx1Z2lucy5hZGQoU3luY0NsaWVudCxcbiAgICAvLyAgICAvLyAgICBzZWxmLnN0YXJjb2Rlci5zb2NrZXQsIHNlbGYuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICAvLyAgICBzZWxmLnN0YXJjb2Rlci5zeW5jY2xpZW50ID0gc2VsZi5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKFN5bmNDbGllbnQsXG4gICAgLy8gICAgICAgIHNlbGYuc3RhcmNvZGVyLnNvY2tldCwgc2VsZi5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIC8vICAgIF9jb25uZWN0ZWQgPSB0cnVlO1xuICAgIC8vfSk7XG59O1xuXG4vKipcbiAqIFByZWxvYWQgbWluaW1hbCBhc3NldHMgZm9yIHByb2dyZXNzIHNjcmVlblxuICovXG5Cb290LnByb3RvdHlwZS5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCdiYXJfbGVmdCcsICdhc3NldHMvaW1hZ2VzL2dyZWVuQmFyTGVmdC5wbmcnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnYmFyX21pZCcsICdhc3NldHMvaW1hZ2VzL2dyZWVuQmFyTWlkLnBuZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCdiYXJfcmlnaHQnLCAnYXNzZXRzL2ltYWdlcy9ncmVlbkJhclJpZ2h0LnBuZycpO1xufTtcblxuLyoqXG4gKiBLaWNrIGludG8gbmV4dCBzdGF0ZSBvbmNlIGluaXRpYWxpemF0aW9uIGFuZCBwcmVsb2FkaW5nIGFyZSBkb25lXG4gKi9cbkJvb3QucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ2xvYWRlcicpO1xufTtcblxuLyoqXG4gKiBBZHZhbmNlIGdhbWUgc3RhdGUgb25jZSBuZXR3b3JrIGNvbm5lY3Rpb24gaXMgZXN0YWJsaXNoZWRcbiAqL1xuLy9Cb290LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICAvLyBGSVhNRTogZG9uJ3Qgd2FpdCBoZXJlIC0gc2hvdWxkIGJlIGluIGNyZWF0ZVxuLy8gICAgaWYgKHRoaXMuc3RhcmNvZGVyLmNvbm5lY3RlZCkge1xuLy8gICAgICAgIC8vdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdzcGFjZScpO1xuLy8gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnbG9naW4nKTtcbi8vICAgIH1cbi8vfTtcblxubW9kdWxlLmV4cG9ydHMgPSBCb290OyIsIi8qKlxuICogTG9hZGVyLmpzXG4gKlxuICogUGhhc2VyIHN0YXRlIHRvIHByZWxvYWQgYXNzZXRzIGFuZCBkaXNwbGF5IHByb2dyZXNzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIExvYWRlciA9IGZ1bmN0aW9uICgpIHt9O1xuXG5Mb2FkZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbkxvYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMb2FkZXI7XG5cbkxvYWRlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBJbml0IGFuZCBkcmF3IHN0YXJmaWVsZFxuICAgIHRoaXMuc3RhcmNvZGVyLnN0YXJmaWVsZCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEoNjAwLCA2MDAsICdzdGFyZmllbGQnLCB0cnVlKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5kcmF3U3RhckZpZWxkKHRoaXMuc3RhcmNvZGVyLnN0YXJmaWVsZC5jdHgsIDYwMCwgMTYpO1xuICAgIHRoaXMuZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQsIHRoaXMuc3RhcmNvZGVyLnN0YXJmaWVsZCk7XG5cbiAgICAvLyBQb3NpdGlvbiBwcm9ncmVzcyBiYXJcbiAgICB2YXIgYmFyV2lkdGggPSBNYXRoLmZsb29yKDAuNCAqIHRoaXMuZ2FtZS53aWR0aCk7XG4gICAgdmFyIG9yaWdpblggPSAodGhpcy5nYW1lLndpZHRoIC0gYmFyV2lkdGgpLzI7XG4gICAgdmFyIGxlZnQgPSB0aGlzLmdhbWUuYWRkLmltYWdlKG9yaWdpblgsIHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJZLCAnYmFyX2xlZnQnKTtcbiAgICBsZWZ0LmFuY2hvci5zZXRUbygwLCAwLjUpO1xuICAgIHZhciBtaWQgPSB0aGlzLmdhbWUuYWRkLmltYWdlKG9yaWdpblggKyBsZWZ0LndpZHRoLCB0aGlzLmdhbWUud29ybGQuY2VudGVyWSwgJ2Jhcl9taWQnKTtcbiAgICBtaWQuYW5jaG9yLnNldFRvKDAsIDAuNSk7XG4gICAgdmFyIHJpZ2h0ID0gdGhpcy5nYW1lLmFkZC5pbWFnZShvcmlnaW5YICsgbGVmdC53aWR0aCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclksICdiYXJfcmlnaHQnKTtcbiAgICByaWdodC5hbmNob3Iuc2V0VG8oMCwgMC41KTtcbiAgICB2YXIgbWlkV2lkdGggPSBiYXJXaWR0aCAtIDIgKiBsZWZ0LndpZHRoO1xuICAgIG1pZC53aWR0aCA9IDA7XG4gICAgdmFyIGxvYWRpbmdUZXh0ID0gdGhpcy5nYW1lLmFkZC50ZXh0KHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJYLCB0aGlzLmdhbWUud29ybGQuY2VudGVyWSAtIDM2LCAnTG9hZGluZy4uLicsXG4gICAgICAgIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmZmZmZmJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgbG9hZGluZ1RleHQuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdmFyIHByb2dUZXh0ID0gdGhpcy5nYW1lLmFkZC50ZXh0KG9yaWdpblggKyBsZWZ0LndpZHRoLCB0aGlzLmdhbWUud29ybGQuY2VudGVyWSwgJzAlJyxcbiAgICAgICAge2ZvbnQ6ICcyNHB4IEFyaWFsJywgZmlsbDogJyNmZmZmZmYnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICBwcm9nVGV4dC5hbmNob3Iuc2V0VG8oMC41KTtcblxuICAgIHRoaXMuZ2FtZS5sb2FkLm9uRmlsZUNvbXBsZXRlLmFkZChmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcbiAgICAgICAgdmFyIHcgPSBNYXRoLmZsb29yKG1pZFdpZHRoICogcHJvZ3Jlc3MgLyAxMDApO1xuICAgICAgICBtaWQud2lkdGggPSB3O1xuICAgICAgICByaWdodC54ID0gbWlkLnggKyB3O1xuICAgICAgICBwcm9nVGV4dC5zZXRUZXh0KHByb2dyZXNzICsgJyUnKTtcbiAgICAgICAgcHJvZ1RleHQueCA9IG1pZC54ICsgdy8yO1xuICAgIH0sIHRoaXMpO1xufTtcblxuTG9hZGVyLnByb3RvdHlwZS5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFRPRE86IEhEIGFuZCBTRCB2ZXJzaW9uc1xuICAgIC8vIEZvbnRzXG4gICAgdGhpcy5nYW1lLmxvYWQuYml0bWFwRm9udCgndGl0bGUtZm9udCcsXG4gICAgICAgICdhc3NldHMvYml0bWFwZm9udHMva2Fybml2b3JlMTI4LnBuZycsICdhc3NldHMvYml0bWFwZm9udHMva2Fybml2b3JlMTI4LnhtbCcpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmJpdG1hcEZvbnQoJ3JlYWRvdXQteWVsbG93JyxcbiAgICAgICAgJ2Fzc2V0cy9iaXRtYXBmb250cy9oZWF2eS15ZWxsb3cyNC5wbmcnLCAnYXNzZXRzL2JpdG1hcGZvbnRzL2hlYXZ5LXllbGxvdzI0LnhtbCcpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdwbGF5ZXJ0aHJ1c3QnLCAnYXNzZXRzL3NvdW5kcy90aHJ1c3RMb29wLm9nZycpO1xuICAgIC8vIFNvdW5kc1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdjaGltZScsICdhc3NldHMvc291bmRzL2NoaW1lLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdsZXZlbHVwJywgJ2Fzc2V0cy9zb3VuZHMvbGV2ZWx1cC5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygncGxhbnR0cmVlJywgJ2Fzc2V0cy9zb3VuZHMvcGxhbnR0cmVlLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdiaWdwb3AnLCAnYXNzZXRzL3NvdW5kcy9iaWdwb3Aub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ2xpdHRsZXBvcCcsICdhc3NldHMvc291bmRzL2xpdHRsZXBvcC5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygndGFnZ2VkJywgJ2Fzc2V0cy9zb3VuZHMvdGFnZ2VkLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdsYXNlcicsICdhc3NldHMvc291bmRzL2xhc2VyLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdtdXNpYycsICdhc3NldHMvc291bmRzL2lnbm9yZS5vZ2cnKTtcbiAgICAvLyBTcHJpdGVzaGVldHNcbiAgICB0aGlzLmdhbWUubG9hZC5hdGxhcygnam95c3RpY2snLCAnYXNzZXRzL2pveXN0aWNrL2dlbmVyaWMtam95c3RpY2sucG5nJywgJ2Fzc2V0cy9qb3lzdGljay9nZW5lcmljLWpveXN0aWNrLmpzb24nKTtcbiAgICAvLyBJbWFnZXNcblxufTtcblxuTG9hZGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhcmNvZGVyLmNvbm5lY3RlZCkge1xuICAgICAgICAvL3RoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnc3BhY2UnKTtcbiAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdsb2dpbicpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGVyOyIsIi8qKlxuICogTG9naW4uanNcbiAqXG4gKiBTdGF0ZSBmb3IgZGlzcGxheWluZyBsb2dpbiBzY3JlZW4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIExvZ2luID0gZnVuY3Rpb24gKCkge307XG5cbkxvZ2luLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG5Mb2dpbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMb2dpbjtcblxuTG9naW4ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ2xvZ2luJyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuc3RhcmNvZGVyLnNob3dMb2dpbigpO1xuICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldC5vbignbG9nZ2VkIGluJywgZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICBzZWxmLnN0YXJjb2Rlci5oaWRlTG9naW4oKTtcbiAgICAgICAgc2VsZi5zdGFyY29kZXIucGxheWVyID0gcGxheWVyO1xuICAgICAgICBzZWxmLmdhbWUuc3RhdGUuc3RhcnQoJ3NwYWNlJyk7XG4gICAgfSk7XG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0Lm9uKCdsb2dpbiBmYWlsdXJlJywgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIHNlbGYuc3RhcmNvZGVyLnNldExvZ2luRXJyb3IoZXJyb3IpO1xuICAgIH0pO1xufTtcblxuLy9Mb2dpbi5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbi8vICAgIHRoaXMuZ2FtZS5sb2FkLmJpdG1hcEZvbnQoJ3RpdGxlLWZvbnQnLFxuLy8gICAgICAgICdhc3NldHMvYml0bWFwZm9udHMva2Fybml2b3JlMTI4LnBuZycsICdhc3NldHMvYml0bWFwZm9udHMva2Fybml2b3JlMTI4LnhtbCcpO1xuLy99O1xuXG5Mb2dpbi5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gKHcsIGgpIHtcbiAgICBjb25zb2xlLmxvZygncnMgTG9naW4nLCB3LCBoKTtcbn07XG5cbkxvZ2luLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy92YXIgc3RhcmZpZWxkID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSg2MDAsIDYwMCk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5kcmF3U3RhckZpZWxkKHRoaXMuc3RhcmNvZGVyLnN0YXJmaWVsZC5jdHgsIDYwMCwgMTYpO1xuICAgIHRoaXMuc3RhcmNvZGVyLnN0YXJmaWVsZCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEoNjAwLCA2MDAsICdzdGFyZmllbGQnLCB0cnVlKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5kcmF3U3RhckZpZWxkKHRoaXMuc3RhcmNvZGVyLnN0YXJmaWVsZC5jdHgsIDYwMCwgMTYpO1xuICAgIHRoaXMuZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQsIHRoaXMuc3RhcmNvZGVyLnN0YXJmaWVsZCk7XG4gICAgdmFyIHRpdGxlID0gdGhpcy5nYW1lLmFkZC5iaXRtYXBUZXh0KHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJYLCAxMjgsICd0aXRsZS1mb250JywgJ1NUQVJDT0RFUicpO1xuICAgIHRpdGxlLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2luO1xuIiwiLyoqXG4gKiBTcGFjZS5qc1xuICpcbiAqIE1haW4gZ2FtZSBzdGF0ZSBmb3IgU3RhcmNvZGVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1NpbXBsZVBhcnRpY2xlLmpzJyk7XG52YXIgVGhydXN0R2VuZXJhdG9yID0gcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1RocnVzdEdlbmVyYXRvci5qcycpO1xudmFyIE1pbmlNYXAgPSByZXF1aXJlKCcuLi9waGFzZXJ1aS9NaW5pTWFwLmpzJyk7XG52YXIgTGVhZGVyQm9hcmQgPSByZXF1aXJlKCcuLi9waGFzZXJ1aS9MZWFkZXJCb2FyZC5qcycpO1xudmFyIFRvYXN0ID0gcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1RvYXN0LmpzJyk7XG5cbnZhciBDb250cm9scyA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvQ29udHJvbHMuanMnKTtcbnZhciBTeW5jQ2xpZW50ID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9TeW5jQ2xpZW50LmpzJyk7XG5cbnZhciBTcGFjZSA9IGZ1bmN0aW9uICgpIHt9O1xuXG5TcGFjZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuU3BhY2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3BhY2U7XG5cblNwYWNlLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzID0gdGhpcy5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKENvbnRyb2xzLCB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgdGhpcy5zdGFyY29kZXIuc3luY2NsaWVudCA9IHRoaXMuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihTeW5jQ2xpZW50LFxuICAgICAgICB0aGlzLnN0YXJjb2Rlci5zb2NrZXQsIHRoaXMuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICB0aGlzLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZTtcbn07XG5cblNwYWNlLnByb3RvdHlwZS5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSh0aGlzLmdhbWUsIFRocnVzdEdlbmVyYXRvci50ZXh0dXJlS2V5LCAnI2ZmNjYwMCcsIDgpO1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSh0aGlzLmdhbWUsICdidWxsZXQnLCAnIzk5OTk5OScsIDQpO1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSh0aGlzLmdhbWUsICd0cmFjdG9yJywgJyNlZWVlZWUnLCA4LCB0cnVlKTtcbiAgICAvL3RoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdwbGF5ZXJ0aHJ1c3QnLCAnYXNzZXRzL3NvdW5kcy90aHJ1c3RMb29wLm9nZycpO1xuICAgIC8vdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ2NoaW1lJywgJ2Fzc2V0cy9zb3VuZHMvY2hpbWUubXAzJyk7XG4gICAgLy90aGlzLmdhbWUubG9hZC5hdGxhcygnam95c3RpY2snLCAnYXNzZXRzL2pveXN0aWNrL2dlbmVyaWMtam95c3RpY2sucG5nJywgJ2Fzc2V0cy9qb3lzdGljay9nZW5lcmljLWpveXN0aWNrLmpzb24nKTtcbiAgICAvL3RoaXMuZ2FtZS5sb2FkLmJpdG1hcEZvbnQoJ3JlYWRvdXQteWVsbG93JyxcbiAgICAvLyAgICAnYXNzZXRzL2JpdG1hcGZvbnRzL2hlYXZ5LXllbGxvdzI0LnBuZycsICdhc3NldHMvYml0bWFwZm9udHMvaGVhdnkteWVsbG93MjQueG1sJyk7XG59O1xuXG5TcGFjZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdTcGFjZSBzaXplJywgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0LCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMSk7XG4gICAgLy9jb25zb2xlLmxvZygnY3JlYXRlJyk7XG4gICAgLy92YXIgcm5nID0gdGhpcy5nYW1lLnJuZDtcbiAgICB2YXIgd2IgPSB0aGlzLnN0YXJjb2Rlci5jb25maWcud29ybGRCb3VuZHM7XG4gICAgdmFyIHBzID0gdGhpcy5zdGFyY29kZXIuY29uZmlnLnBoeXNpY3NTY2FsZTtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5QMkpTKTtcbiAgICB0aGlzLndvcmxkLnNldEJvdW5kcy5jYWxsKHRoaXMud29ybGQsIHdiWzBdKnBzLCB3YlsxXSpwcywgKHdiWzJdLXdiWzBdKSpwcywgKHdiWzNdLXdiWzFdKSpwcyk7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MucDIuc2V0Qm91bmRzVG9Xb3JsZCh0cnVlLCB0cnVlLCB0cnVlLCB0cnVlLCBmYWxzZSk7XG5cbiAgICAvLyBEZWJ1Z2dpbmdcbiAgICAvL3RoaXMuZ2FtZS50aW1lLmFkdmFuY2VkVGltaW5nID0gdHJ1ZTtcblxuICAgIC8vIFNldCB1cCBET01cbiAgICB0aGlzLnN0YXJjb2Rlci5sYXlvdXRET01TcGFjZVN0YXRlKCk7XG5cbiAgICB0aGlzLnN0YXJjb2Rlci5jb250cm9scy5yZXNldCgpO1xuXG4gICAgLy8gVmlydHVhbCBqb3lzdGlja1xuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzLmFkZFZpcnR1YWxDb250cm9scygnam95c3RpY2snKTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMgPSB7fTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuc3RpY2sgPSB0aGlzLmdhbWUuam95c3RpY2suYWRkU3RpY2soXG4gICAgLy8gICAgdGhpcy5nYW1lLndpZHRoIC0gMTUwLCB0aGlzLmdhbWUuaGVpZ2h0IC0gNzUsIDEwMCwgJ2pveXN0aWNrJyk7XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzLnN0aWNrLnNjYWxlID0gMC41O1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5maXJlYnV0dG9uID0gdGhpcy5nYW1lLmpveXN0aWNrLmFkZEJ1dHRvbih0aGlzLmdhbWUud2lkdGggLSA1MCwgdGhpcy5nYW1lLmhlaWdodCAtIDc1LFxuICAgIC8vICAgICdqb3lzdGljaycsICdidXR0b24xLXVwJywgJ2J1dHRvbjEtZG93bicpO1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5maXJlYnV0dG9uLnNjYWxlID0gMC41O1xuXG4gICAgLy8gU291bmRzXG4gICAgdGhpcy5nYW1lLnNvdW5kcyA9IHt9O1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0ID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgncGxheWVydGhydXN0JywgMSwgdHJ1ZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5jaGltZSA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ2NoaW1lJywgMSwgZmFsc2UpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxhbnR0cmVlID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgncGxhbnR0cmVlJywgMSwgZmFsc2UpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMuYmlncG9wID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgnYmlncG9wJywgMSwgZmFsc2UpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMubGl0dGxlcG9wID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgnbGl0dGxlcG9wJywgMSwgZmFsc2UpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMudGFnZ2VkID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgndGFnZ2VkJywgMSwgZmFsc2UpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMubGFzZXIgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdsYXNlcicsIDEsIGZhbHNlKTtcblxuICAgIHRoaXMuZ2FtZS5zb3VuZHMubXVzaWMgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdtdXNpYycsIDEsIHRydWUpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMubXVzaWMucGxheSgpO1xuXG4gICAgLy8gQmFja2dyb3VuZFxuICAgIC8vdmFyIHN0YXJmaWVsZCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEoNjAwLCA2MDApO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZChzdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwLCAnc3RhcmZpZWxkJywgdHJ1ZSk7XG4gICAgdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZCh0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLmdhbWUuYWRkLnRpbGVTcHJpdGUod2JbMF0qcHMsIHdiWzFdKnBzLCAod2JbMl0td2JbMF0pKnBzLCAod2JbM10td2JbMV0pKnBzLCB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQpO1xuXG4gICAgdGhpcy5zdGFyY29kZXIuc3luY2NsaWVudC5zdGFydCgpO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuc29ja2V0LmVtaXQoJ2NsaWVudCByZWFkeScpO1xuICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldC5lbWl0KCdyZWFkeScpO1xuICAgIHRoaXMuX3NldHVwTWVzc2FnZUhhbmRsZXJzKHRoaXMuc3RhcmNvZGVyLnNvY2tldCk7XG5cbiAgICAvLyBHcm91cHMgZm9yIHBhcnRpY2xlIGVmZmVjdHNcbiAgICB0aGlzLmdhbWUudGhydXN0Z2VuZXJhdG9yID0gbmV3IFRocnVzdEdlbmVyYXRvcih0aGlzLmdhbWUpO1xuXG4gICAgLy8gR3JvdXAgZm9yIGdhbWUgb2JqZWN0c1xuICAgIHRoaXMuZ2FtZS5wbGF5ZmllbGQgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAvLyBVSVxuICAgIHRoaXMuZ2FtZS51aSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLmdhbWUudWkuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG5cbiAgICAvLyBJbnZlbnRvcnkgLSB0aW5rZXIgd2l0aCBwb3NpdGlvblxuICAgIHZhciBsYWJlbCA9IHRoaXMuZ2FtZS5tYWtlLnRleHQodGhpcy5nYW1lLndpZHRoIC8gMiwgMjUsICdJTlZFTlRPUlknLFxuICAgICAgICB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2ZmOTkwMCcsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIGxhYmVsLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZChsYWJlbCk7XG4gICAgLy90aGlzLmdhbWUuaW52ZW50b3J5dGV4dCA9IHRoaXMuZ2FtZS5tYWtlLnRleHQodGhpcy5nYW1lLndpZHRoIC0gMTAwLCA1MCwgJzAgY3J5c3RhbHMnLFxuICAgIC8vICAgIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjY2NjMDAwJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgdGhpcy5nYW1lLmludmVudG9yeXRleHQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBUZXh0KHRoaXMuZ2FtZS53aWR0aCAvIDIsIDUwLCAncmVhZG91dC15ZWxsb3cnLCAnMCcpO1xuICAgIHRoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0LmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZCh0aGlzLmdhbWUuaW52ZW50b3J5dGV4dCk7XG5cbiAgICAvLyBNaW5pTWFwXG4gICAgdGhpcy5nYW1lLm1pbmltYXAgPSBuZXcgTWluaU1hcCh0aGlzLmdhbWUsIDMwMCwgMzAwKTtcbiAgICB0aGlzLmdhbWUudWkuYWRkKHRoaXMuZ2FtZS5taW5pbWFwKTtcbiAgICB0aGlzLmdhbWUubWluaW1hcC54ID0gMTA7XG4gICAgdGhpcy5nYW1lLm1pbmltYXAueSA9IDEwO1xuXG4gICAgLy8gTGVhZGVyYm9hcmRcbiAgICB0aGlzLmdhbWUubGVhZGVyYm9hcmQgPSBuZXcgTGVhZGVyQm9hcmQodGhpcy5nYW1lLCB0aGlzLnN0YXJjb2Rlci5wbGF5ZXJNYXAsIDIwMCwgMzAwKTtcbiAgICB0aGlzLmdhbWUudWkuYWRkKHRoaXMuZ2FtZS5sZWFkZXJib2FyZCk7XG4gICAgdGhpcy5nYW1lLmxlYWRlcmJvYXJkLnggPSB0aGlzLmdhbWUud2lkdGggLSAyMDA7XG4gICAgdGhpcy5nYW1lLmxlYWRlcmJvYXJkLnkgPSAwO1xuICAgIHRoaXMuZ2FtZS5sZWFkZXJib2FyZC52aXNpYmxlID0gZmFsc2U7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG59O1xuXG5TcGFjZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEZJWE1FOiBqdXN0IGEgbWVzcyBmb3IgdGVzdGluZ1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLnN0YXJjb2Rlci5jb250cm9scy5wcm9jZXNzUXVldWUoZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgaWYgKGEudHlwZSA9PT0gJ3VwX3ByZXNzZWQnKSB7XG4gICAgICAgICAgICBzZWxmLmdhbWUucGxheWVyU2hpcC5sb2NhbFN0YXRlLnRocnVzdCA9ICdzdGFydGluZyc7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnBsYXkoKTtcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnRocnVzdGdlbmVyYXRvci5zdGFydE9uKHNlbGYuZ2FtZS5wbGF5ZXJTaGlwKTtcbiAgICAgICAgfSBlbHNlIGlmIChhLnR5cGUgPT09ICd1cF9yZWxlYXNlZCcpIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLmxvY2FsU3RhdGUudGhydXN0ID0gJ3NodXRkb3duJztcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3Quc3RvcCgpO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUudGhydXN0Z2VuZXJhdG9yLnN0b3BPbihzZWxmLmdhbWUucGxheWVyU2hpcCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cblNwYWNlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy9jb25zb2xlLmxvZygnK3JlbmRlcisnKTtcbiAgICAvL2lmICh0aGlzLnN0YXJjb2Rlci50ZW1wc3ByaXRlKSB7XG4gICAgLy8gICAgdmFyIGQgPSB0aGlzLnN0YXJjb2Rlci50ZW1wc3ByaXRlLnBvc2l0aW9uLnggLSB0aGlzLnN0YXJjb2Rlci50ZW1wc3ByaXRlLnByZXZpb3VzUG9zaXRpb24ueDtcbiAgICAvLyAgICBjb25zb2xlLmxvZygnRGVsdGEnLCBkLCB0aGlzLmdhbWUudGltZS5lbGFwc2VkLCBkIC8gdGhpcy5nYW1lLnRpbWUuZWxhcHNlZCk7XG4gICAgLy99XG4gICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcbiAgICAvL3RoaXMuZ2FtZS5kZWJ1Zy50ZXh0KCdGcHM6ICcgKyB0aGlzLmdhbWUudGltZS5mcHMsIDUsIDIwKTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuc3RpY2suZGVidWcodHJ1ZSwgdHJ1ZSk7XG4gICAgLy90aGlzLmdhbWUuZGVidWcuY2FtZXJhSW5mbyh0aGlzLmdhbWUuY2FtZXJhLCAxMDAsIDIwKTtcbiAgICAvL2lmICh0aGlzLnNoaXApIHtcbiAgICAvLyAgICB0aGlzLmdhbWUuZGVidWcuc3ByaXRlSW5mbyh0aGlzLnNoaXAsIDQyMCwgMjApO1xuICAgIC8vfVxufTtcblxuU3BhY2UucHJvdG90eXBlLl9zZXR1cE1lc3NhZ2VIYW5kbGVycyA9IGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc29ja2V0Lm9uKCdtc2cgY3J5c3RhbCBwaWNrdXAnLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMuY2hpbWUucGxheSgpO1xuICAgICAgICBUb2FzdC5zcGluVXAoc2VsZi5nYW1lLCBzZWxmLmdhbWUucGxheWVyU2hpcC54LCBzZWxmLmdhbWUucGxheWVyU2hpcC55LCAnKycgKyB2YWwgKyAnIGNyeXN0YWxzIScpO1xuICAgIH0pO1xuICAgIHNvY2tldC5vbignbXNnIHBsYW50IHRyZWUnLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMucGxhbnR0cmVlLnBsYXkoKTtcbiAgICB9KTtcbiAgICBzb2NrZXQub24oJ21zZyBhc3Rlcm9pZCBwb3AnLCBmdW5jdGlvbiAoc2l6ZSkge1xuICAgICAgICBpZiAoc2l6ZSA+IDEpIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMuYmlncG9wLnBsYXkoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMubGl0dGxlcG9wLnBsYXkoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHNvY2tldC5vbignbXNnIHRhZ2dlZCcsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy50YWdnZWQucGxheSgpO1xuICAgIH0pO1xuICAgIHNvY2tldC5vbignbXNnIGxhc2VyJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBzZWxmLmdhbWUuc291bmRzLmxhc2VyLnBsYXkoKTtcbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3BhY2U7XG4iLCIvKipcbiAqIExlYWRlckJvYXJkLmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIExlYWRlckJvYXJkID0gZnVuY3Rpb24gKGdhbWUsIHBsYXllcm1hcCwgd2lkdGgsIGhlaWdodCkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUpO1xuICAgIHRoaXMucGxheWVyTWFwID0gcGxheWVybWFwO1xuICAgIHRoaXMub3BlbiA9IHRydWU7XG4gICAgdGhpcy5tYWluV2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLm1haW5IZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5pY29uU2l6ZSA9IDI0OyAgICAgICAgIC8vIE1ha2UgcmVzcG9uc2l2ZT9cbiAgICB0aGlzLmZvbnRTaXplID0gMTg7XG4gICAgdGhpcy5udW1MaW5lcyA9IE1hdGguZmxvb3IoKGhlaWdodCAtIHRoaXMuaWNvblNpemUgLSAyKSAvICh0aGlzLmZvbnRTaXplICsgMikpO1xuXG4gICAgdGhpcy5tYWluID0gZ2FtZS5tYWtlLmdyb3VwKCk7XG4gICAgdGhpcy5tYWluLnBpdm90LnNldFRvKHdpZHRoLCAwKTtcbiAgICB0aGlzLm1haW4ueCA9IHdpZHRoO1xuICAgIHRoaXMuYWRkKHRoaXMubWFpbik7XG5cbiAgICAvLyBCYWNrZ3JvdW5kXG4gICAgdmFyIGJpdG1hcCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgYml0bWFwLmN0eC5maWxsU3R5bGUgPSAncmdiYSgxMjgsIDEyOCwgMTI4LCAwLjI1KSc7XG4gICAgLy9iaXRtYXAuY3R4LmZpbGxTdHlsZSA9ICcjOTk5OTk5JztcbiAgICAvL2JpdG1hcC5jdHguZ2xvYmFsQWxwaGEgPSAwLjU7XG4gICAgYml0bWFwLmN0eC5maWxsUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAvL3RoaXMuYm9hcmQgPSBuZXcgUGhhc2VyLlNwcml0ZShnYW1lLCB3aWR0aCwgMCwgdGhpcy5iaXRtYXApO1xuICAgIC8vdGhpcy5ib2FyZC5waXZvdC5zZXRUbyh3aWR0aCwgMCk7XG4gICAgdGhpcy5tYWluLmFkZChuZXcgUGhhc2VyLlNwcml0ZShnYW1lLCAwLCAwLCBiaXRtYXApKTtcblxuICAgIC8vIFRpdGxlXG4gICAgdGhpcy50aXRsZSA9IGdhbWUubWFrZS50ZXh0KCh3aWR0aCAtIHRoaXMuaWNvblNpemUpIC8gMiwgNCwgJ1RhZ3MnLFxuICAgICAgICB7Zm9udDogJzIwcHggQXJpYWwgYm9sZCcsIGFsaWduOiAnY2VudGVyJywgZmlsbDogJyNmZjAwMDAnfSk7XG4gICAgdGhpcy50aXRsZS5hbmNob3Iuc2V0VG8oMC41LCAwKTtcbiAgICB0aGlzLm1haW4uYWRkKHRoaXMudGl0bGUpO1xuXG4gICAgLy8gRGlzcGxheSBsaW5lc1xuICAgIHRoaXMubGluZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubnVtTGluZXM7IGkrKykge1xuICAgICAgICB2YXIgbGluZSA9IGdhbWUubWFrZS50ZXh0KDQsIHRoaXMuaWNvblNpemUgKyAyICsgaSAqICh0aGlzLmZvbnRTaXplICsgMiksXG4gICAgICAgICAgICAnLScsIHtmb250OiAnMThweCBBcmlhbCcsIGZpbGw6ICcjMDAwMGZmJ30pO1xuICAgICAgICBsaW5lLmtpbGwoKTtcbiAgICAgICAgdGhpcy5saW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB0aGlzLm1haW4uYWRkKGxpbmUpO1xuICAgIH1cblxuICAgIC8vIFRvZ2dsZSBidXR0b25cbiAgICB2YXIgYnV0dG9uID0gdGhpcy5tYWtlQnV0dG9uKCk7ICAgICAgIC8vIEdvb2QgZGltZW5zaW9ucyBUQkQuIE1ha2UgcmVzcG9uc2l2ZT9cbiAgICBidXR0b24uYW5jaG9yLnNldFRvKDEsIDApOyAgICAgIC8vIHVwcGVyIHJpZ2h0O1xuICAgIGJ1dHRvbi54ID0gd2lkdGg7XG4gICAgLy9idXR0b24ueSA9IDA7XG4gICAgYnV0dG9uLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgYnV0dG9uLmV2ZW50cy5vbklucHV0RG93bi5hZGQodGhpcy50b2dnbGVEaXNwbGF5LCB0aGlzKTtcbiAgICB0aGlzLmFkZChidXR0b24pO1xuXG4gICAgLy8vLyBMaXN0XG4gICAgLy90aGlzLmxpc3QgPSBnYW1lLm1ha2UuZ3JvdXAoKTtcbiAgICAvL3RoaXMubGlzdC54ID0gd2lkdGg7XG4gICAgLy90aGlzLmxpc3QueSA9IDA7XG4gICAgLy90aGlzLmxpc3QucGl2b3Quc2V0VG8od2lkdGgsIDApO1xuICAgIC8vdGhpcy50d2VlbiA9IGdhbWUudHdlZW5zLmNyZWF0ZSh0aGlzLmJvYXJkLnNjYWxlKTtcbiAgICAvL1xuICAgIC8vdGhpcy5hZGQodGhpcy5saXN0KTtcbiAgICAvLy8vIHRlc3RpbmdcbiAgICAvL3ZhciB0ID0gWyd0aWdlciBwcmluY2VzcycsICduaW5qYSBsYXNlcicsICdyb2JvdCBmaXNoJywgJ3BvdGF0byBwdXBweScsICd2YW1waXJlIHF1aWNoZScsICd3aXphcmQgcGFzdGEnXTtcbiAgICAvL2ZvciAodmFyIGkgPSAwOyBpIDwgdC5sZW5ndGg7IGkrKykge1xuICAgIC8vICAgIHZhciB0ZXh0ID0gZ2FtZS5tYWtlLnRleHQoMiwgaSoxNiwgdFtpXSwge2ZvbnQ6ICcxNHB4IEFyaWFsJywgZmlsbDogJyMwMDAwZmYnfSk7XG4gICAgLy8gICAgdGhpcy5saXN0LmFkZCh0ZXh0KTtcbiAgICAvL31cbn07XG5cbkxlYWRlckJvYXJkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5MZWFkZXJCb2FyZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMZWFkZXJCb2FyZDtcblxuTGVhZGVyQm9hcmQucHJvdG90eXBlLm1ha2VCdXR0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHVuaXQgPSB0aGlzLmljb25TaXplIC8gNTtcbiAgICB2YXIgdGV4dHVyZSA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEodGhpcy5pY29uU2l6ZSwgdGhpcy5pY29uU2l6ZSk7XG4gICAgdmFyIGN0eCA9IHRleHR1cmUuY3R4O1xuICAgIC8vIERyYXcgcXVhcnRlciBjaXJjbGVcbiAgICBjdHguZmlsbFN0eWxlID0gJyNmZmZmZmYnO1xuICAgIC8vY3R4Lmdsb2JhbEFscGhhID0gMC41O1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHgubW92ZVRvKHRoaXMuaWNvblNpemUsIDApO1xuICAgIGN0eC5saW5lVG8oMCwgMCk7XG4gICAgY3R4LmFyYyh0aGlzLmljb25TaXplLCAwLCB0aGlzLmljb25TaXplLCBNYXRoLlBJLCAzICogTWF0aC5QSSAvIDIsIHRydWUpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgLy8gRHJhdyBzdGVwc1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjMDAwMDAwJztcbiAgICAvL2N0eC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8oMS41KnVuaXQsIDMqdW5pdCk7XG4gICAgY3R4LmxpbmVUbygxLjUqdW5pdCwgMip1bml0KTtcbiAgICBjdHgubGluZVRvKDIuNSp1bml0LCAyKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oMi41KnVuaXQsIDEqdW5pdCk7XG4gICAgY3R4LmxpbmVUbygzLjUqdW5pdCwgMSp1bml0KTtcbiAgICBjdHgubGluZVRvKDMuNSp1bml0LCAyKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oNC41KnVuaXQsIDIqdW5pdCk7XG4gICAgY3R4LmxpbmVUbyg0LjUqdW5pdCwgMyp1bml0KTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIHJldHVybiBuZXcgUGhhc2VyLlNwcml0ZSh0aGlzLmdhbWUsIDAsIDAsIHRleHR1cmUpO1xufTtcblxuTGVhZGVyQm9hcmQucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbiAodGl0bGUsIGxpc3QsIHBsYXllcmlkKSB7XG4gICAgdGhpcy50aXRsZS5zZXRUZXh0KHRpdGxlKTtcbiAgICB2YXIgcGxheWVyVmlzaWJsZSA9IGZhbHNlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5udW1MaW5lczsgaSsrKSB7XG4gICAgICAgIHZhciBwaWQgPSBsaXN0W2ldICYmIGxpc3RbaV0uaWQ7XG4gICAgICAgIGlmIChwaWQgJiYgdGhpcy5wbGF5ZXJNYXBbcGlkXSkge1xuICAgICAgICAgICAgdmFyIHRhZyA9IHRoaXMucGxheWVyTWFwW3BpZF0udGFnO1xuICAgICAgICAgICAgdmFyIGxpbmUgPSB0aGlzLmxpbmVzW2ldO1xuICAgICAgICAgICAgbGluZS5zZXRUZXh0KChpICsgMSkgKyAnLiAnICsgdGFnICsgJyAoJyArIGxpc3RbaV0udmFsICsgJyknKTtcbiAgICAgICAgICAgIGlmIChwaWQgPT09IHBsYXllcmlkKSB7XG4gICAgICAgICAgICAgICAgbGluZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xuICAgICAgICAgICAgICAgIHBsYXllclZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaW5lLmZvbnRXZWlnaHQgPSAnbm9ybWFsJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpbmUucmV2aXZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxpbmVzW2ldLmtpbGwoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBQbGF5ZXIgbm90IGluIHRvcCBOXG4gICAgaWYgKCFwbGF5ZXJWaXNpYmxlKSB7XG4gICAgICAgIGZvciAoaSA9IHRoaXMubnVtTGluZXM7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAobGlzdFtpXS5pZCA9PT0gcGxheWVyaWQpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBGb3VuZCAtIGRpc3BsYXkgYXQgZW5kXG4gICAgICAgIGlmIChpIDwgbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxpbmVbdGhpcy5udW1MaW5lcyAtIDFdLnNldFRleHQoKGkgKyAxKSArICcuICcgKyB0aGlzLnBsYXllck1hcFtwbGF5ZXJpZF0gKyAnICgnICsgbGlzdFtpXS52YWwgKyAnKScpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuTGVhZGVyQm9hcmQucHJvdG90eXBlLnRvZ2dsZURpc3BsYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmdhbWUudHdlZW5zLmlzVHdlZW5pbmcodGhpcy5tYWluLnNjYWxlKSkge1xuICAgICAgICBpZiAodGhpcy5vcGVuKSB7XG4gICAgICAgICAgICB0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMubWFpbi5zY2FsZSkudG8oe3g6IDAsIHk6IDB9LCA1MDAsIFBoYXNlci5FYXNpbmcuUXVhZHJhdGljLk91dCwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5hZGQudHdlZW4odGhpcy5tYWluLnNjYWxlKS50byh7eDogMSwgeTogMX0sIDUwMCwgUGhhc2VyLkVhc2luZy5RdWFkcmF0aWMuT3V0LCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMub3BlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExlYWRlckJvYXJkOyIsIi8qKlxuICogTWluaU1hcC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBNaW5pTWFwID0gZnVuY3Rpb24gKGdhbWUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIHZhciB4ciA9IHdpZHRoIC8gdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJXaWR0aDtcbiAgICB2YXIgeXIgPSBoZWlnaHQgLyB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckhlaWdodDtcbiAgICBpZiAoeHIgPD0geXIpIHtcbiAgICAgICAgdGhpcy5tYXBTY2FsZSA9IHhyO1xuICAgICAgICB0aGlzLnhPZmZzZXQgPSAteHIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckxlZnQ7XG4gICAgICAgIHRoaXMueU9mZnNldCA9IC14ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyVG9wICsgKGhlaWdodCAtIHhyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJIZWlnaHQpIC8gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1hcFNjYWxlID0geXI7XG4gICAgICAgIHRoaXMueU9mZnNldCA9IC15ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyVG9wO1xuICAgICAgICB0aGlzLnhPZmZzZXQgPSAteXIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckxlZnQgKyAod2lkdGggLSB5ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyV2lkdGgpIC8gMjtcbiAgICB9XG5cbiAgICB0aGlzLmdyYXBoaWNzID0gZ2FtZS5tYWtlLmdyYXBoaWNzKDAsIDApO1xuICAgIHRoaXMuZ3JhcGhpY3MuYmVnaW5GaWxsKDB4ZmZmZjAwLCAwLjIpO1xuICAgIHRoaXMuZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgdGhpcy5ncmFwaGljcy5lbmRGaWxsKCk7XG4gICAgdGhpcy5ncmFwaGljcy5jYWNoZUFzQml0bWFwID0gdHJ1ZTtcbiAgICB0aGlzLmFkZCh0aGlzLmdyYXBoaWNzKTtcbn07XG5cbk1pbmlNYXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbk1pbmlNYXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWluaU1hcDtcblxuTWluaU1hcC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vdGhpcy50ZXh0dXJlLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIDAsIDAsIHRydWUpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5nYW1lLnBsYXlmaWVsZC5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGJvZHkgPSB0aGlzLmdhbWUucGxheWZpZWxkLmNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoIWJvZHkubWluaXNwcml0ZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgYm9keS5taW5pc3ByaXRlLnggPSB0aGlzLndvcmxkVG9NbVgoYm9keS54KTtcbiAgICAgICAgYm9keS5taW5pc3ByaXRlLnkgPSB0aGlzLndvcmxkVG9NbVkoYm9keS55KTtcbiAgICAgICAgYm9keS5taW5pc3ByaXRlLmFuZ2xlID0gYm9keS5hbmdsZTtcbiAgICAvLyAgICB2YXIgeCA9IDEwMCArIGJvZHkueCAvIDQwO1xuICAgIC8vICAgIHZhciB5ID0gMTAwICsgYm9keS55IC8gNDA7XG4gICAgLy8gICAgdGhpcy50ZXh0dXJlLnJlbmRlclhZKGJvZHkuZ3JhcGhpY3MsIHgsIHksIGZhbHNlKTtcbiAgICB9XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZS53b3JsZFRvTW1YID0gZnVuY3Rpb24gKHgpIHtcbiAgICByZXR1cm4geCAqIHRoaXMubWFwU2NhbGUgKyB0aGlzLnhPZmZzZXQ7XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZS53b3JsZFRvTW1ZID0gZnVuY3Rpb24gKHkpIHtcbiAgICByZXR1cm4geSAqIHRoaXMubWFwU2NhbGUgKyB0aGlzLnlPZmZzZXQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1pbmlNYXA7IiwiLyoqIGNsaWVudC5qc1xuICpcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIFN0YXJjb2RlciBnYW1lIGNsaWVudFxuICpcbiAqIEB0eXBlIHtTdGFyY29kZXJ8ZXhwb3J0c31cbiAqL1xuXG4vL3JlcXVpcmUoJy4vQmxvY2tseUN1c3RvbS5qcycpO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG5cblxuLy9sb2NhbFN0b3JhZ2UuZGVidWcgPSAnJzsgICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2VkIHRvIHRvZ2dsZSBzb2NrZXQuaW8gZGVidWdnaW5nXG5cbi8vZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbi8vICAgIHZhciBzdGFyY29kZXIgPSBuZXcgU3RhcmNvZGVyKCk7XG4vLyAgICBzdGFyY29kZXIuc3RhcnQoKTtcbi8vfSk7XG5cbi8vIHRlc3RcblxuJChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHN0YXJjb2RlciA9IG5ldyBTdGFyY29kZXIoKTtcbiAgICBzdGFyY29kZXIuc3RhcnQoKTtcbn0pO1xuIl19
