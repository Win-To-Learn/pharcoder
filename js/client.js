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
    //serverUri: 'http://pharcoder-single-1.elasticbeanstalk.com:8080',
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
            'swaggy'
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
            'boss'
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
        //{type: 'Hydra', number: 1, config: {
        //    position: {random: 'world', pad: 50}
        //}},
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
    console.log('configging', properties);
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
    console.log('Init Boot', this.game.width, this.game.height);
    console.log('iw Boot', window.innerWidth, window.innerHeight, screen.width, screen.height, window.devicePixelRatio);
    //this.game.stage.disableVisibilityChange = true;
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
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

Boot.prototype.resize = function (w, h) {
    console.log('rs Boot', w, h);
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
    this.starcoder.starfield = this.game.make.bitmapData(600, 600);
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

    // Helpers
    //function randomNormal () {
    //    var t = 0;
    //    for (var i=0; i<6; i++) {
    //        t += rng.normal();
    //    }
    //    return t/6;
    //}
    //
    //function drawStar (ctx, x, y, d, color) {
    //    ctx.strokeStyle = color;
    //    ctx.beginPath();
    //    ctx.moveTo(x-d+1, y-d+1);
    //    ctx.lineTo(x+d-1, y+d-1);
    //    ctx.moveTo(x-d+1, y+d-1);
    //    ctx.lineTo(x+d-1, y-d+1);
    //    ctx.moveTo(x, y-d);
    //    ctx.lineTo(x, y+d);
    //    ctx.moveTo(x-d, y);
    //    ctx.lineTo(x+d, y);
    //    ctx.stroke();
    //}
    //
    //function drawStarField (ctx, size, n) {
    //    var xm = Math.round(size/2 + randomNormal()*size/4);
    //    var ym = Math.round(size/2 + randomNormal()*size/4);
    //    var quads = [[0,0,xm-1,ym-1], [xm,0,size-1,ym-1],
    //        [0,ym,xm-1,size-1], [xm,ym,size-1,size-1]];
    //    var color;
    //    var i, j, l, q;
    //
    //    n = Math.round(n/4);
    //    for (i=0, l=quads.length; i<l; i++) {
    //        q = quads[i];
    //        for (j=0; j<n; j++) {
    //            color = 'hsl(60,100%,' + rng.between(90,99) + '%)';
    //            drawStar(ctx,
    //                rng.between(q[0]+7, q[2]-7), rng.between(q[1]+7, q[3]-7),
    //                rng.between(2,4), color);
    //        }
    //    }
    //}

};

Space.prototype.resize = function (w, h) {
    console.log('rs Space', w, h);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvU3RhcmNvZGVyLWNsaWVudC5qcyIsInNyYy9TdGFyY29kZXIuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvQ29kZUVuZHBvaW50Q2xpZW50LmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL0RPTUludGVyZmFjZS5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9MZWFkZXJCb2FyZENsaWVudC5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9TdGFyZmllbGQuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvV29ybGRBcGkuanMiLCJzcmMvY29tbW9uL1BhdGhzLmpzIiwic3JjL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzIiwic3JjL3BoYXNlcmJvZGllcy9Bc3Rlcm9pZC5qcyIsInNyYy9waGFzZXJib2RpZXMvQnVsbGV0LmpzIiwic3JjL3BoYXNlcmJvZGllcy9DcnlzdGFsLmpzIiwic3JjL3BoYXNlcmJvZGllcy9HZW5lcmljT3JiLmpzIiwic3JjL3BoYXNlcmJvZGllcy9QbGFuZXRvaWQuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1NoaXAuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1NpbXBsZVBhcnRpY2xlLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TdGFyVGFyZ2V0LmpzIiwic3JjL3BoYXNlcmJvZGllcy9TeW5jQm9keUludGVyZmFjZS5qcyIsInNyYy9waGFzZXJib2RpZXMvVGhydXN0R2VuZXJhdG9yLmpzIiwic3JjL3BoYXNlcmJvZGllcy9Ub2FzdC5qcyIsInNyYy9waGFzZXJib2RpZXMvVHJhY3RvckJlYW0uanMiLCJzcmMvcGhhc2VyYm9kaWVzL1RyZWUuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1ZlY3RvclNwcml0ZS5qcyIsInNyYy9waGFzZXJwbHVnaW5zL0NvbnRyb2xzLmpzIiwic3JjL3BoYXNlcnBsdWdpbnMvU3luY0NsaWVudC5qcyIsInNyYy9waGFzZXJzdGF0ZXMvQm9vdC5qcyIsInNyYy9waGFzZXJzdGF0ZXMvTG9hZGVyLmpzIiwic3JjL3BoYXNlcnN0YXRlcy9Mb2dpbi5qcyIsInNyYy9waGFzZXJzdGF0ZXMvU3BhY2UuanMiLCJzcmMvcGhhc2VydWkvTGVhZGVyQm9hcmQuanMiLCJzcmMvcGhhc2VydWkvTWluaU1hcC5qcyIsInNyYy9jbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogU3RhcmNvZGVyLWNsaWVudC5qc1xuICpcbiAqIFN0YXJjb2RlciBtYXN0ZXIgb2JqZWN0IGV4dGVuZGVkIHdpdGggY2xpZW50IG9ubHkgcHJvcGVydGllcyBhbmQgbWV0aG9kc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgV29ybGRBcGkgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL1dvcmxkQXBpLmpzJyk7XG52YXIgRE9NSW50ZXJmYWNlID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9ET01JbnRlcmZhY2UuanMnKTtcbnZhciBDb2RlRW5kcG9pbnRDbGllbnQgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL0NvZGVFbmRwb2ludENsaWVudC5qcycpO1xudmFyIFN0YXJmaWVsZCA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvU3RhcmZpZWxkLmpzJyk7XG52YXIgTGVhZGVyQm9hcmRDbGllbnQgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL0xlYWRlckJvYXJkQ2xpZW50LmpzJyk7XG5cbnZhciBzdGF0ZXMgPSB7XG4gICAgYm9vdDogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvQm9vdC5qcycpLFxuICAgIHNwYWNlOiByZXF1aXJlKCcuL3BoYXNlcnN0YXRlcy9TcGFjZS5qcycpLFxuICAgIGxvZ2luOiByZXF1aXJlKCcuL3BoYXNlcnN0YXRlcy9Mb2dpbi5qcycpLFxuICAgIGxvYWRlcjogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvTG9hZGVyLmpzJylcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlvID0gaW87XG4gICAgdGhpcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKCcxMDAlJywgJzEwMCUnLCBQaGFzZXIuQVVUTywgJ21haW4nKTtcbiAgICAvL3RoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSgxODAwLCA5NTAsIFBoYXNlci5DQU5WQVMsICdtYWluJyk7XG4gICAgdGhpcy5nYW1lLmZvcmNlU2luZ2xlVXBkYXRlID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUuc3RhcmNvZGVyID0gdGhpcztcbiAgICBmb3IgKHZhciBrIGluIHN0YXRlcykge1xuICAgICAgICB2YXIgc3RhdGUgPSBuZXcgc3RhdGVzW2tdKCk7XG4gICAgICAgIHN0YXRlLnN0YXJjb2RlciA9IHRoaXM7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoaywgc3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLm9uQ29ubmVjdENCID0gW107XG4gICAgdGhpcy5wbGF5ZXJNYXAgPSB7fTtcbiAgICB0aGlzLmNtZFF1ZXVlID0gW107XG4gICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmxhc3ROZXRFcnJvciA9IG51bGw7XG4gICAgdGhpcy5pbXBsZW1lbnRGZWF0dXJlKFdvcmxkQXBpKTtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoQ29kZUVuZHBvaW50Q2xpZW50KTtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoU3RhcmZpZWxkKTtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoTGVhZGVyQm9hcmRDbGllbnQpO1xuICAgIHRoaXMuaW1wbGVtZW50RmVhdHVyZShET01JbnRlcmZhY2UpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5zZXJ2ZXJDb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoIXRoaXMuc29ja2V0KSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNvY2tldDtcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sYXN0TmV0RXJyb3IgPSBudWxsO1xuICAgIH1cbiAgICB2YXIgc2VydmVyVXJpID0gdGhpcy5jb25maWcuc2VydmVyVXJpO1xuICAgIGlmICghc2VydmVyVXJpKSB7XG4gICAgICAgIHZhciBwcm90b2NvbCA9IHRoaXMuY29uZmlnLnNlcnZlclByb3RvbCB8fCB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2w7XG4gICAgICAgIHZhciBwb3J0ID0gdGhpcy5jb25maWcuc2VydmVyUG9ydCB8fCAnODA4MCc7XG4gICAgICAgIHNlcnZlclVyaSA9IHByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArICc6JyArIHBvcnQ7XG4gICAgfVxuICAgIHRoaXMuc29ja2V0ID0gdGhpcy5pbyhzZXJ2ZXJVcmksIHRoaXMuY29uZmlnLmlvQ2xpZW50T3B0aW9ucyk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygnc29ja2V0IGNvbm5lY3RlZCcpO1xuICAgICAgICBzZWxmLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHNlbGYubGFzdE5ldEVycm9yID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzZWxmLm9uQ29ubmVjdENCLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgc2VsZi5vbkNvbm5lY3RDQltpXS5iaW5kKHNlbGYsIHNlbGYuc29ja2V0KSgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Vycm9yJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdzb2NrZXQgZXJyb3InKTtcbiAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICB0aGlzLmxhc3ROZXRFcnJvciA9IGRhdGE7XG4gICAgfSk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLnNlcnZlckxvZ2luID0gZnVuY3Rpb24gKHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgIHZhciBsb2dpbiA9IHt9O1xuICAgIGlmICghcGFzc3dvcmQpIHtcbiAgICAgICAgLy8gR3Vlc3QgbG9naW5cbiAgICAgICAgbG9naW4uZ2FtZXJ0YWcgPSB1c2VybmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2dpbi51c2VybmFtZSA9IHVzZXJuYW1lO1xuICAgICAgICBsb2dpbi5wYXNzd29yZCA9IHBhc3N3b3JkO1xuICAgIH1cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdsb2dpbicsIGxvZ2luKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdib290Jyk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLmF0dGFjaFBsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcGx1Z2luID0gdGhpcy5nYW1lLnBsdWdpbnMuYWRkLmFwcGx5KHRoaXMuZ2FtZS5wbHVnaW5zLCBhcmd1bWVudHMpO1xuICAgIHBsdWdpbi5zdGFyY29kZXIgPSB0aGlzO1xuICAgIHBsdWdpbi5sb2cgPSB0aGlzLmxvZztcbiAgICByZXR1cm4gcGx1Z2luO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5yb2xlID0gJ0NsaWVudCc7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcmNvZGVyO1xuIiwiLyoqXG4gKiBTdGFyY29kZXIuanNcbiAqXG4gKiBTZXQgdXAgZ2xvYmFsIFN0YXJjb2RlciBuYW1lc3BhY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL3ZhciBTdGFyY29kZXIgPSB7XG4vLyAgICBjb25maWc6IHtcbi8vICAgICAgICB3b3JsZEJvdW5kczogWy00MjAwLCAtNDIwMCwgODQwMCwgODQwMF1cbi8vXG4vLyAgICB9LFxuLy8gICAgU3RhdGVzOiB7fVxuLy99O1xuXG52YXIgY29uZmlnID0ge1xuICAgIHZlcnNpb246ICcwLjEnLFxuICAgIC8vc2VydmVyVXJpOiAnaHR0cDovL3BoYXJjb2Rlci1zaW5nbGUtMS5lbGFzdGljYmVhbnN0YWxrLmNvbTo4MDgwJyxcbiAgICAvL3NlcnZlclVyaTogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MScsXG4gICAgLy9zZXJ2ZXJBZGRyZXNzOiAnMS4yLjMuNCcsXG4gICAgLy93b3JsZEJvdW5kczogWy00MjAwLCAtNDIwMCwgODQwMCwgODQwMF0sXG4gICAgd29ybGRCb3VuZHM6IFstMjAwLCAtMjAwLCAyMDAsIDIwMF0sXG4gICAgaW9DbGllbnRPcHRpb25zOiB7XG4gICAgICAgIC8vZm9yY2VOZXc6IHRydWVcbiAgICAgICAgcmVjb25uZWN0aW9uOiBmYWxzZVxuICAgIH0sXG4gICAgdXBkYXRlSW50ZXJ2YWw6IDUwLFxuICAgIHJlbmRlckxhdGVuY3k6IDEwMCxcbiAgICBwaHlzaWNzU2NhbGU6IDIwLFxuICAgIGZyYW1lUmF0ZTogKDEgLyA2MCksXG4gICAgdGltZVN5bmNGcmVxOiAxMCxcbiAgICBwaHlzaWNzUHJvcGVydGllczoge1xuICAgICAgICBTaGlwOiB7XG4gICAgICAgICAgICBtYXNzOiAxMFxuICAgICAgICB9LFxuICAgICAgICBBc3Rlcm9pZDoge1xuICAgICAgICAgICAgbWFzczogMjBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2FtZXJUYWdzOiB7XG4gICAgICAgIDE6IFtcbiAgICAgICAgICAgICdzdXBlcicsXG4gICAgICAgICAgICAnYXdlc29tZScsXG4gICAgICAgICAgICAncmFpbmJvdycsXG4gICAgICAgICAgICAnZG91YmxlJyxcbiAgICAgICAgICAgICd0cmlwbGUnLFxuICAgICAgICAgICAgJ3ZhbXBpcmUnLFxuICAgICAgICAgICAgJ3ByaW5jZXNzJyxcbiAgICAgICAgICAgICdpY2UnLFxuICAgICAgICAgICAgJ2ZpcmUnLFxuICAgICAgICAgICAgJ3JvYm90JyxcbiAgICAgICAgICAgICd3ZXJld29sZicsXG4gICAgICAgICAgICAnc3BhcmtsZScsXG4gICAgICAgICAgICAnaW5maW5pdGUnLFxuICAgICAgICAgICAgJ2Nvb2wnLFxuICAgICAgICAgICAgJ3lvbG8nLFxuICAgICAgICAgICAgJ3N3YWdneSdcbiAgICAgICAgXSxcbiAgICAgICAgMjogW1xuICAgICAgICAgICAgJ3RpZ2VyJyxcbiAgICAgICAgICAgICduaW5qYScsXG4gICAgICAgICAgICAncHJpbmNlc3MnLFxuICAgICAgICAgICAgJ3JvYm90JyxcbiAgICAgICAgICAgICdwb255JyxcbiAgICAgICAgICAgICdkYW5jZXInLFxuICAgICAgICAgICAgJ3JvY2tlcicsXG4gICAgICAgICAgICAnbWFzdGVyJyxcbiAgICAgICAgICAgICdoYWNrZXInLFxuICAgICAgICAgICAgJ3JhaW5ib3cnLFxuICAgICAgICAgICAgJ2tpdHRlbicsXG4gICAgICAgICAgICAncHVwcHknLFxuICAgICAgICAgICAgJ2Jvc3MnXG4gICAgICAgIF1cbiAgICB9LFxuICAgIGluaXRpYWxCb2RpZXM6IFtcbiAgICAgICAge3R5cGU6ICdBc3Rlcm9pZCcsIG51bWJlcjogMjUsIGNvbmZpZzoge1xuICAgICAgICAgICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCd9LFxuICAgICAgICAgICAgdmVsb2NpdHk6IHtyYW5kb206ICd2ZWN0b3InLCBsbzogLTE1LCBoaTogMTV9LFxuICAgICAgICAgICAgYW5ndWxhclZlbG9jaXR5OiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogLTUsIGhpOiA1fSxcbiAgICAgICAgICAgIHZlY3RvclNjYWxlOiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogMC42LCBoaTogMS40fSxcbiAgICAgICAgICAgIG1hc3M6IDEwXG4gICAgICAgIH19LFxuICAgICAgICAvL3t0eXBlOiAnQ3J5c3RhbCcsIG51bWJlcjogMTAsIGNvbmZpZzoge1xuICAgICAgICAvLyAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJ30sXG4gICAgICAgIC8vICAgIHZlbG9jaXR5OiB7cmFuZG9tOiAndmVjdG9yJywgbG86IC00LCBoaTogNCwgbm9ybWFsOiB0cnVlfSxcbiAgICAgICAgLy8gICAgdmVjdG9yU2NhbGU6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAwLjQsIGhpOiAwLjh9LFxuICAgICAgICAvLyAgICBtYXNzOiA1XG4gICAgICAgIC8vfX1cbiAgICAgICAgLy97dHlwZTogJ0h5ZHJhJywgbnVtYmVyOiAxLCBjb25maWc6IHtcbiAgICAgICAgLy8gICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCcsIHBhZDogNTB9XG4gICAgICAgIC8vfX0sXG4gICAgICAgIHt0eXBlOiAnUGxhbmV0b2lkJywgbnVtYmVyOiA2LCBjb25maWc6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDMwfSxcbiAgICAgICAgICAgIGFuZ3VsYXJWZWxvY2l0eToge3JhbmRvbTogJ2Zsb2F0JywgbG86IC0yLCBoaTogMn0sXG4gICAgICAgICAgICB2ZWN0b3JTY2FsZTogMi41LFxuICAgICAgICAgICAgbWFzczogMTAwXG4gICAgICAgIH19LFxuICAgICAgICAvL3t0eXBlOiAnU3RhclRhcmdldCcsIG51bWJlcjogMTAsIGNvbmZpZzoge1xuICAgICAgICAvLyAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJywgcGFkOiAzMH0sXG4gICAgICAgIC8vICAgIHZlY3RvclNjYWxlOiAwLjUsXG4gICAgICAgIC8vICAgIHN0YXJzOiBbWzAsIDBdLCBbMSwxXSwgWy0xLDFdLCBbMSwtMV1dXG4gICAgICAgIC8vfX1cbiAgICAgICAgLy8gRklYTUU6IFRyZWVzIGp1c3QgZm9yIHRlc3RpbmdcbiAgICAgICAgLy97dHlwZTogJ1RyZWUnLCBudW1iZXI6IDEwLCBjb25maWc6IHtcbiAgICAgICAgLy8gICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCcsIHBhZDogMzB9LFxuICAgICAgICAvLyAgICB2ZWN0b3JTY2FsZTogMSxcbiAgICAgICAgLy8gICAgbWFzczogNVxuICAgICAgICAvL319XG4gICAgXVxufTtcblxudmFyIFN0YXJjb2RlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBJbml0aWFsaXplcnMgdmlydHVhbGl6ZWQgYWNjb3JkaW5nIHRvIHJvbGVcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLmJhbm5lcigpO1xuICAgIHRoaXMuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIC8vdGhpcy5pbml0TmV0LmNhbGwodGhpcyk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLmV4dGVuZENvbmZpZyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBmb3IgKHZhciBrIGluIGNvbmZpZykge1xuICAgICAgICBpZiAoY29uZmlnLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ1trXSA9IGNvbmZpZ1trXTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8vIENvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciBjb21tb24gY29uZmlnIG9wdGlvbnNcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICd3b3JsZFdpZHRoJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMl0gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1swXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJXaWR0aCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqICh0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1syXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzBdKTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICd3b3JsZEhlaWdodCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzNdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMV07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VySGVpZ2h0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogKHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzNdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMV0pO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlckxlZnQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1swXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJUb3AnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1sxXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJSaWdodCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzJdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlckJvdHRvbScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzNdO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIEFkZCBtaXhpbiBwcm9wZXJ0aWVzIHRvIHRhcmdldC4gQWRhcHRlZCAoc2xpZ2h0bHkpIGZyb20gUGhhc2VyXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldFxuICogQHBhcmFtIHtvYmplY3R9IG1peGluXG4gKi9cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZSA9IGZ1bmN0aW9uICh0YXJnZXQsIG1peGluKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhtaXhpbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgICB2YXIgdmFsID0gbWl4aW5ba2V5XTtcbiAgICAgICAgaWYgKHZhbCAmJlxuICAgICAgICAgICAgKHR5cGVvZiB2YWwuZ2V0ID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB2YWwuc2V0ID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCB2YWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSB2YWw7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIExpZ2h0d2VpZ2h0IGNvbXBvbmVudCBpbXBsZW1lbnRhdGlvbiwgbW9yZSBmb3IgbG9naWNhbCB0aGFuIGZ1bmN0aW9uYWwgbW9kdWxhcml0eVxuICpcbiAqIEBwYXJhbSBtaXhpbiB7b2JqZWN0fSAtIFBPSk8gd2l0aCBtZXRob2RzIC8gcHJvcGVydGllcyB0byBiZSBhZGRlZCB0byBwcm90b3R5cGUsIHdpdGggb3B0aW9uYWwgaW5pdCBtZXRob2RcbiAqL1xuU3RhcmNvZGVyLnByb3RvdHlwZS5pbXBsZW1lbnRGZWF0dXJlID0gZnVuY3Rpb24gKG1peGluKSB7XG4gICAgZm9yICh2YXIgcHJvcCBpbiBtaXhpbikge1xuICAgICAgICBzd2l0Y2ggKHByb3ApIHtcbiAgICAgICAgICAgIGNhc2UgJ29uQ29ubmVjdENCJzpcbiAgICAgICAgICAgIGNhc2UgJ29uUmVhZHlDQic6XG4gICAgICAgICAgICBjYXNlICdvbkxvZ2luQ0InOlxuICAgICAgICAgICAgY2FzZSAnb25EaXNjb25uZWN0Q0InOlxuICAgICAgICAgICAgICAgIHRoaXNbcHJvcF0ucHVzaChtaXhpbltwcm9wXSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpbml0JzpcbiAgICAgICAgICAgICAgICBicmVhazsgICAgICAvLyBOb09wXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIFN0YXJjb2Rlci5wcm90b3R5cGVbcHJvcF0gPSBtaXhpbltwcm9wXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobWl4aW4uaW5pdCkge1xuICAgICAgICBtaXhpbi5pbml0LmNhbGwodGhpcyk7XG4gICAgfVxufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5iYW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5sb2coJ1N0YXJjb2RlcicsIHRoaXMucm9sZSwgJ3YnICsgdGhpcy5jb25maWcudmVyc2lvbiwgJ3N0YXJ0ZWQgYXQnLCBEYXRlKCkpO1xufTtcblxuLyoqXG4gKiBDdXN0b20gbG9nZ2luZyBmdW5jdGlvbiB0byBiZSBmZWF0dXJlZmllZCBhcyBuZWNlc3NhcnlcbiAqL1xuU3RhcmNvZGVyLnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJjb2RlcjtcbiIsIi8qKlxuICogQ29kZUVuZHBvaW50Q2xpZW50LmpzXG4gKlxuICogTWV0aG9kcyBmb3Igc2VuZGluZyBjb2RlIHRvIHNlcnZlciBhbmQgZGVhbGluZyB3aXRoIGNvZGUgcmVsYXRlZCByZXNwb25zZXNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzZW5kQ29kZTogZnVuY3Rpb24gKGNvZGUpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnY29kZScsIGNvZGUpO1xuICAgIH1cbn07IiwiLyoqXG4gKiBET01JbnRlcmZhY2UuanNcbiAqXG4gKiBIYW5kbGUgRE9NIGNvbmZpZ3VyYXRpb24vaW50ZXJhY3Rpb24sIGkuZS4gbm9uLVBoYXNlciBzdHVmZlxuICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmRvbSA9IHt9OyAgICAgICAgICAgICAgLy8gbmFtZXNwYWNlXG4gICAgICAgIHRoaXMuZG9tLmNvZGVCdXR0b24gPSAkKCcjY29kZS1idG4nKTtcbiAgICAgICAgdGhpcy5kb20uY29kZVBvcHVwID0gJCgnI2NvZGUtcG9wdXAnKTtcbiAgICAgICAgdGhpcy5kb20ubG9naW5Qb3B1cD0gJCgnI2xvZ2luJyk7XG4gICAgICAgIHRoaXMuZG9tLmxvZ2luQnV0dG9uID0gJCgnI3N1Ym1pdCcpO1xuXG4gICAgICAgIHRoaXMuZG9tLmNvZGVCdXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kb20uY29kZVBvcHVwLnRvZ2dsZSgnc2xvdycpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50LnNvdXJjZSA9PT0gc2VsZi5kb20uY29kZVBvcHVwWzBdLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNlbmRDb2RlKGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vdGhpcy5kb20uY29kZVBvcHVwLmhpZGUoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gMjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdGFncyA9IHRoaXMuY29uZmlnLmdhbWVyVGFnc1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwLCBsID0gdGFncy5sZW5ndGg7IGogPCBsOyBqKyspIHtcbiAgICAgICAgICAgICAgICAkKCcjZ3QnICsgaSkuYXBwZW5kKCc8b3B0aW9uPicgKyB0YWdzW2pdICsgJzwvb3B0aW9uPicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICQoJy5zZWxlY3QnKS5zZWxlY3RtZW51KCk7XG4gICAgICAgICQoJy5sb2dpbmJ1dHRvbicpLmJ1dHRvbih7aWNvbnM6IHtwcmltYXJ5OiAndWktaWNvbi10cmlhbmdsZS0xLWUnfX0pO1xuXG4gICAgICAgICQoJy5hY2NvcmRpb24nKS5hY2NvcmRpb24oe2hlaWdodFN0eWxlOiAnY29udGVudCd9KTtcbiAgICAgICAgJCgnLmhpZGRlbicpLmhpZGUoKTtcblxuICAgIH0sXG5cbiAgICBsYXlvdXRET01TcGFjZVN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJyNjb2RlLWJ0bicpLnNob3coKS5wb3NpdGlvbih7bXk6ICdsZWZ0IGJvdHRvbScsIGF0OiAnbGVmdCBib3R0b20nLCBvZjogJyNtYWluJ30pO1xuICAgICAgICAkKCcjY29kZS1wb3B1cCcpLnBvc2l0aW9uKHtteTogJ2NlbnRlcicsIGF0OiAnY2VudGVyJywgb2Y6IHdpbmRvd30pO1xuICAgIH0sXG5cbiAgICBzaG93TG9naW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAkKCcjbG9naW4td2luZG93IC5tZXNzYWdlJykuaGlkZSgpO1xuICAgICAgICAkKCcjbG9naW4td2luZG93Jykuc2hvdygpLnBvc2l0aW9uKHtteTogJ2NlbnRlcicsIGF0OiAnY2VudGVyJywgb2Y6IHdpbmRvd30pO1xuICAgICAgICAkKCcjdXNlcmxvZ2luJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5zZXJ2ZXJMb2dpbigkKCcjdXNlcm5hbWUnKS52YWwoKSwgJCgnI3Bhc3N3b3JkJykudmFsKCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCgnI2d1ZXN0bG9naW4nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLnNlcnZlckxvZ2luKCQoJyNndDEnKS52YWwoKSArICcgJyArICQoJyNndDInKS52YWwoKSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzZXRMb2dpbkVycm9yOiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgdmFyIG1zZyA9ICQoJyNsb2dpbi13aW5kb3cgLm1lc3NhZ2UnKTtcbiAgICAgICAgaWYgKCFlcnJvcikge1xuICAgICAgICAgICAgbXNnLmhpZGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1zZy5odG1sKGVycm9yKTtcbiAgICAgICAgICAgIG1zZy5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgaGlkZUxvZ2luOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJyNsb2dpbi13aW5kb3cnKS5oaWRlKCk7XG4gICAgfVxufTsiLCIvKipcbiAqIExlYWRlckJvYXJkQ2xpZW50LmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubGVhZGVyQm9hcmQgPSB7fTtcbiAgICAgICAgdGhpcy5sZWFkZXJCb2FyZENhdHMgPSBbXTtcbiAgICAgICAgdGhpcy5sZWFkZXJCb2FyZFN0YXRlID0gbnVsbDtcbiAgICB9LFxuXG4gICAgb25Db25uZWN0Q0I6IGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzb2NrZXQub24oJ2xlYWRlcmJvYXJkJywgZnVuY3Rpb24gKGxiKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBjYXQgaW4gbGIpIHtcbiAgICAgICAgICAgICAgICAvLyBSZWNvcmQgbmV3IGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgaWYgKCEoY2F0IGluIHNlbGYubGVhZGVyQm9hcmQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubGVhZGVyQm9hcmRDYXRzLnB1c2goY2F0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU3RhcnQgY3ljbGluZyBpZiB0aGlzIGlzIGZpcnN0IGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYubGVhZGVyQm9hcmRTdGF0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmxlYWRlckJvYXJkU3RhdGUgPSAwO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmdhbWUubGVhZGVyYm9hcmQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNldEludGVydmFsKHNlbGYuY3ljbGVMZWFkZXJCb2FyZC5iaW5kKHNlbGYpLCBzZWxmLmNvbmZpZy5sZWFkZXJCb2FyZENsaWVudEN5Y2xlIHx8IDUwMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBEaXNwbGF5IGlmIHVwZGF0ZWQgYm9hcmQgaXMgc2hvd2luZ1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmxlYWRlckJvYXJkQ2F0c1tzZWxmLmxlYWRlckJvYXJkU3RhdGVdID09PSBjYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nYW1lLmxlYWRlcmJvYXJkLnNldENvbnRlbnQoY2F0LCBsYltjYXRdLCBzZWxmLnBsYXllci5pZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5sZWFkZXJCb2FyZFtjYXRdID0gbGJbY2F0XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgY3ljbGVMZWFkZXJCb2FyZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxlYWRlckJvYXJkU3RhdGUgPSAodGhpcy5sZWFkZXJCb2FyZFN0YXRlICsgMSkgJSB0aGlzLmxlYWRlckJvYXJkQ2F0cy5sZW5ndGg7XG4gICAgICAgIHZhciBjYXQgPSB0aGlzLmxlYWRlckJvYXJkQ2F0c1t0aGlzLmxlYWRlckJvYXJkU3RhdGVdO1xuICAgICAgICB0aGlzLmdhbWUubGVhZGVyYm9hcmQuc2V0Q29udGVudChjYXQsIHRoaXMubGVhZGVyQm9hcmRbY2F0XSwgdGhpcy5wbGF5ZXIuaWQpO1xuICAgIH1cbn07IiwiLyoqXG4gKiBNZXRob2QgZm9yIGRyYXdpbmcgc3RhcmZpZWxkc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHJhbmRvbU5vcm1hbDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdCA9IDA7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTw2OyBpKyspIHtcbiAgICAgICAgICAgIHQgKz0gdGhpcy5nYW1lLnJuZC5ub3JtYWwoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdC82O1xuICAgIH0sXG5cbiAgICBkcmF3U3RhcjogZnVuY3Rpb24gKGN0eCwgeCwgeSwgZCwgY29sb3IpIHtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LWQrMSwgeS1kKzEpO1xuICAgICAgICBjdHgubGluZVRvKHgrZC0xLCB5K2QtMSk7XG4gICAgICAgIGN0eC5tb3ZlVG8oeC1kKzEsIHkrZC0xKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4K2QtMSwgeS1kKzEpO1xuICAgICAgICBjdHgubW92ZVRvKHgsIHktZCk7XG4gICAgICAgIGN0eC5saW5lVG8oeCwgeStkKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LWQsIHkpO1xuICAgICAgICBjdHgubGluZVRvKHgrZCwgeSk7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9LFxuXG4gICAgZHJhd1N0YXJGaWVsZDogZnVuY3Rpb24gKGN0eCwgc2l6ZSwgbikge1xuICAgICAgICB2YXIgeG0gPSBNYXRoLnJvdW5kKHNpemUvMiArIHRoaXMucmFuZG9tTm9ybWFsKCkqc2l6ZS80KTtcbiAgICAgICAgdmFyIHltID0gTWF0aC5yb3VuZChzaXplLzIgKyB0aGlzLnJhbmRvbU5vcm1hbCgpKnNpemUvNCk7XG4gICAgICAgIHZhciBxdWFkcyA9IFtbMCwwLHhtLTEseW0tMV0sIFt4bSwwLHNpemUtMSx5bS0xXSxcbiAgICAgICAgICAgIFswLHltLHhtLTEsc2l6ZS0xXSwgW3htLHltLHNpemUtMSxzaXplLTFdXTtcbiAgICAgICAgdmFyIGNvbG9yO1xuICAgICAgICB2YXIgaSwgaiwgbCwgcTtcblxuICAgICAgICBuID0gTWF0aC5yb3VuZChuLzQpO1xuICAgICAgICBmb3IgKGk9MCwgbD1xdWFkcy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgICAgICAgICBxID0gcXVhZHNbaV07XG4gICAgICAgICAgICBmb3IgKGo9MDsgajxuOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjb2xvciA9ICdoc2woNjAsMTAwJSwnICsgdGhpcy5nYW1lLnJuZC5iZXR3ZWVuKDkwLDk5KSArICclKSc7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3U3RhcihjdHgsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5ybmQuYmV0d2VlbihxWzBdKzcsIHFbMl0tNyksIHRoaXMuZ2FtZS5ybmQuYmV0d2VlbihxWzFdKzcsIHFbM10tNyksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5ybmQuYmV0d2VlbigyLDQpLCBjb2xvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59OyIsIi8qKlxuICogV29ybGRBcGkuanNcbiAqXG4gKiBBZGQvcmVtb3ZlL21hbmlwdWxhdGUgYm9kaWVzIGluIGNsaWVudCdzIHBoeXNpY3Mgd29ybGRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBBZGQgYm9keSB0byB3b3JsZCBvbiBjbGllbnQgc2lkZVxuICAgICAqXG4gICAgICogQHBhcmFtIHR5cGUge3N0cmluZ30gLSB0eXBlIG5hbWUgb2Ygb2JqZWN0IHRvIGFkZFxuICAgICAqIEBwYXJhbSBjb25maWcge29iamVjdH0gLSBwcm9wZXJ0aWVzIGZvciBuZXcgb2JqZWN0XG4gICAgICogQHJldHVybnMge1BoYXNlci5TcHJpdGV9IC0gbmV3bHkgYWRkZWQgb2JqZWN0XG4gICAgICovXG4gICAgYWRkQm9keTogZnVuY3Rpb24gKHR5cGUsIGNvbmZpZykge1xuICAgICAgICB2YXIgY3RvciA9IGJvZHlUeXBlc1t0eXBlXTtcbiAgICAgICAgdmFyIHBsYXllclNoaXAgPSBmYWxzZTtcbiAgICAgICAgaWYgKCFjdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmxvZygnVW5rbm93biBib2R5IHR5cGU6JywgdHlwZSk7XG4gICAgICAgICAgICB0aGlzLmxvZyhjb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlID09PSAnU2hpcCcgJiYgY29uZmlnLnByb3BlcnRpZXMucGxheWVyaWQgPT09IHRoaXMucGxheWVyLmlkKSB7XG4gICAgICAgICAgICAvL2NvbmZpZy50YWcgPSB0aGlzLnBsYXllci51c2VybmFtZTtcbiAgICAgICAgICAgIC8vaWYgKGNvbmZpZy5wcm9wZXJ0aWVzLnBsYXllcmlkID09PSB0aGlzLnBsYXllci5pZCkge1xuICAgICAgICAgICAgLy8gT25seSB0aGUgcGxheWVyJ3Mgb3duIHNoaXAgaXMgdHJlYXRlZCBhcyBkeW5hbWljIGluIHRoZSBsb2NhbCBwaHlzaWNzIHNpbVxuICAgICAgICAgICAgY29uZmlnLm1hc3MgPSB0aGlzLmNvbmZpZy5waHlzaWNzUHJvcGVydGllcy5TaGlwLm1hc3M7XG4gICAgICAgICAgICBwbGF5ZXJTaGlwID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vfVxuICAgICAgICB9XG4gICAgICAgIHZhciBib2R5ID0gbmV3IGN0b3IodGhpcy5nYW1lLCBjb25maWcpO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ1NoaXAnKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXllck1hcFtjb25maWcucHJvcGVydGllcy5wbGF5ZXJpZF0gPSBib2R5O1xuICAgICAgICB9XG4gICAgICAgIC8vdGhpcy5nYW1lLmFkZC5leGlzdGluZyhib2R5KTtcbiAgICAgICAgdGhpcy5nYW1lLnBsYXlmaWVsZC5hZGQoYm9keSk7XG4gICAgICAgIGlmIChwbGF5ZXJTaGlwKSB7XG4gICAgICAgICAgICB0aGlzLmdhbWUuY2FtZXJhLmZvbGxvdyhib2R5KTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5wbGF5ZXJTaGlwID0gYm9keTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYm9keTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlQm9keTogZnVuY3Rpb24gKHNwcml0ZSkge1xuICAgICAgICAvL3Nwcml0ZS5raWxsKCk7XG4gICAgICAgIHNwcml0ZS5kZXN0cm95KCk7XG4gICAgICAgIC8vIFJlbW92ZSBtaW5pc3ByaXRlXG4gICAgICAgIGlmIChzcHJpdGUubWluaXNwcml0ZSkge1xuICAgICAgICAgICAgLy9zcHJpdGUubWluaXNwcml0ZS5raWxsKCk7XG4gICAgICAgICAgICBzcHJpdGUubWluaXNwcml0ZS5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgLy90aGlzLmdhbWUucGh5c2ljcy5wMi5yZW1vdmVCb2R5KHNwcml0ZS5ib2R5KTtcbiAgICB9XG59O1xuXG52YXIgYm9keVR5cGVzID0ge1xuICAgIFNoaXA6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9TaGlwLmpzJyksXG4gICAgQXN0ZXJvaWQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9Bc3Rlcm9pZC5qcycpLFxuICAgIENyeXN0YWw6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9DcnlzdGFsLmpzJyksXG4gICAgQnVsbGV0OiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvQnVsbGV0LmpzJyksXG4gICAgR2VuZXJpY09yYjogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0dlbmVyaWNPcmIuanMnKSxcbiAgICBQbGFuZXRvaWQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9QbGFuZXRvaWQuanMnKSxcbiAgICBUcmVlOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVHJlZS5qcycpLFxuICAgIFRyYWN0b3JCZWFtOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVHJhY3RvckJlYW0uanMnKSxcbiAgICBTdGFyVGFyZ2V0OiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvU3RhclRhcmdldC5qcycpXG59O1xuXG4iLCIvKipcbiAqIFBhdGguanNcbiAqXG4gKiBWZWN0b3IgcGF0aHMgc2hhcmVkIGJ5IG11bHRpcGxlIGVsZW1lbnRzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFBJID0gTWF0aC5QSTtcbnZhciBUQVUgPSAyKlBJO1xudmFyIHNpbiA9IE1hdGguc2luO1xudmFyIGNvcyA9IE1hdGguY29zO1xuXG5leHBvcnRzLm9jdGFnb24gPSBbXG4gICAgWzIsMV0sXG4gICAgWzEsMl0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwxXSxcbiAgICBbLTIsLTFdLFxuICAgIFstMSwtMl0sXG4gICAgWzEsLTJdLFxuICAgIFsyLC0xXVxuXTtcblxuZXhwb3J0cy5kMmNyb3NzID0gW1xuICAgIFstMSwtMl0sXG4gICAgWy0xLDJdLFxuICAgIFsyLC0xXSxcbiAgICBbLTIsLTFdLFxuICAgIFsxLDJdLFxuICAgIFsxLC0yXSxcbiAgICBbLTIsMV0sXG4gICAgWzIsMV1cbl07XG5cbmV4cG9ydHMuc3F1YXJlMCA9IFtcbiAgICBbLTEsLTJdLFxuICAgIFsyLC0xXSxcbiAgICBbMSwyXSxcbiAgICBbLTIsMV1cbl07XG5cbmV4cG9ydHMuc3F1YXJlMSA9IFtcbiAgICBbMSwtMl0sXG4gICAgWzIsMV0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwtMV1cbl07XG5cbmV4cG9ydHMuc3RhciA9IFtcbiAgICBbc2luKDApLCBjb3MoMCldLFxuICAgIFtzaW4oMipUQVUvNSksIGNvcygyKlRBVS81KV0sXG4gICAgW3Npbig0KlRBVS81KSwgY29zKDQqVEFVLzUpXSxcbiAgICBbc2luKFRBVS81KSwgY29zKFRBVS81KV0sXG4gICAgW3NpbigzKlRBVS81KSwgY29zKDMqVEFVLzUpXVxuXTtcblxuZXhwb3J0cy5PQ1RSQURJVVMgPSBNYXRoLnNxcnQoNSk7IiwiLyoqXG4gKiBVcGRhdGVQcm9wZXJ0aWVzLmpzXG4gKlxuICogQ2xpZW50L3NlcnZlciBzeW5jYWJsZSBwcm9wZXJ0aWVzIGZvciBnYW1lIG9iamVjdHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2hpcCA9IGZ1bmN0aW9uICgpIHt9O1xuU2hpcC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsnbGluZVdpZHRoJywgJ2xpbmVDb2xvcicsICdmaWxsQ29sb3InLCAnZmlsbEFscGhhJyxcbiAgICAndmVjdG9yU2NhbGUnLCAnc2hhcGUnLCAnc2hhcGVDbG9zZWQnLCAncGxheWVyaWQnLCAnY3J5c3RhbHMnLCAnZGVhZCcsICd0YWcnXTtcblxudmFyIEFzdGVyb2lkID0gZnVuY3Rpb24gKCkge307XG5Bc3Rlcm9pZC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsndmVjdG9yU2NhbGUnXTtcblxudmFyIENyeXN0YWwgPSBmdW5jdGlvbiAoKSB7fTtcbkNyeXN0YWwucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3ZlY3RvclNjYWxlJ107XG5cbnZhciBHZW5lcmljT3JiID0gZnVuY3Rpb24gKCkge307XG5HZW5lcmljT3JiLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lQ29sb3InLCAndmVjdG9yU2NhbGUnXTtcblxudmFyIFBsYW5ldG9pZCA9IGZ1bmN0aW9uICgpIHt9O1xuUGxhbmV0b2lkLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lQ29sb3InLCAnZmlsbENvbG9yJywgJ2xpbmVXaWR0aCcsICdmaWxsQWxwaGEnLCAndmVjdG9yU2NhbGUnLCAnb3duZXInXTtcblxudmFyIFRyZWUgPSBmdW5jdGlvbiAoKSB7fTtcblRyZWUucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3ZlY3RvclNjYWxlJywgJ2xpbmVDb2xvcicsICdncmFwaCcsICdzdGVwJywgJ2RlcHRoJ107XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoKSB7fTtcbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsnbGluZUNvbG9yJ107XG5cbnZhciBUcmFjdG9yQmVhbSA9IGZ1bmN0aW9uICgpIHt9O1xuVHJhY3RvckJlYW0ucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbXTtcblxudmFyIFN0YXJUYXJnZXQgPSBmdW5jdGlvbiAoKSB7fTtcblN0YXJUYXJnZXQucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3N0YXJzJywgJ2xpbmVDb2xvcicsICd2ZWN0b3JTY2FsZSddO1xuXG5cbmV4cG9ydHMuU2hpcCA9IFNoaXA7XG5leHBvcnRzLkFzdGVyb2lkID0gQXN0ZXJvaWQ7XG5leHBvcnRzLkNyeXN0YWwgPSBDcnlzdGFsO1xuZXhwb3J0cy5HZW5lcmljT3JiID0gR2VuZXJpY09yYjtcbmV4cG9ydHMuQnVsbGV0ID0gQnVsbGV0O1xuZXhwb3J0cy5QbGFuZXRvaWQgPSBQbGFuZXRvaWQ7XG5leHBvcnRzLlRyZWUgPSBUcmVlO1xuZXhwb3J0cy5UcmFjdG9yQmVhbSA9IFRyYWN0b3JCZWFtO1xuZXhwb3J0cy5TdGFyVGFyZ2V0ID0gU3RhclRhcmdldDtcbiIsIi8qKlxuICogQXN0ZXJvaWQuanNcbiAqXG4gKiBDbGllbnQgc2lkZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuQXN0ZXJvaWQ7XG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcblxudmFyIEFzdGVyb2lkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xuICAgIC8vdGhpcy5ib2R5LmRhbXBpbmcgPSAwO1xufTtcblxuQXN0ZXJvaWQuYWRkID0gZnVuY3Rpb24gKGdhbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgYSA9IG5ldyBBc3Rlcm9pZChnYW1lLCBvcHRpb25zKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gYTtcbn07XG5cbkFzdGVyb2lkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBc3Rlcm9pZDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEFzdGVyb2lkLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShBc3Rlcm9pZC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuQXN0ZXJvaWQucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnI2ZmMDBmZic7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX2ZpbGxDb2xvciA9ICcjZmYwMDAwJztcbkFzdGVyb2lkLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuQXN0ZXJvaWQucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuQXN0ZXJvaWQucHJvdG90eXBlLl9maWxsQWxwaGEgPSAwLjI1O1xuQXN0ZXJvaWQucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5cbm1vZHVsZS5leHBvcnRzID0gQXN0ZXJvaWQ7XG4vL1N0YXJjb2Rlci5Bc3Rlcm9pZCA9IEFzdGVyb2lkO1xuIiwiLyoqXG4gKiBCdWxsZXQuanNcbiAqXG4gKiBDbGllbnQgc2lkZSBpbXBsZW1lbnRhdGlvbiBvZiBzaW1wbGUgcHJvamVjdGlsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxuLy92YXIgU2ltcGxlUGFydGljbGUgPSByZXF1aXJlKCcuL1NpbXBsZVBhcnRpY2xlLmpzJyk7XG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5CdWxsZXQ7XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICB0aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5CdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVsbGV0O1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQnVsbGV0LnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShCdWxsZXQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkJ1bGxldC5wcm90b3R5cGUudmlzaWJsZU9uTWFwID0gZmFsc2U7XG5CdWxsZXQucHJvdG90eXBlLnNoYXJlZFRleHR1cmVLZXkgPSAnbGFzZXInO1xuXG5CdWxsZXQucHJvdG90eXBlLmRyYXdQcm9jZWR1cmUgPSBmdW5jdGlvbiAocmVuZGVyU2NhbGUsIGZyYW1lKSB7XG4gICAgdmFyIHNjYWxlID0gdGhpcy5nYW1lLnBoeXNpY3MucDIubXB4aSh0aGlzLnZlY3RvclNjYWxlKSAqIHJlbmRlclNjYWxlO1xuICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKDQsIFBoYXNlci5Db2xvci5oZXhUb1JHQih0aGlzLmxpbmVDb2xvciksIDEpO1xuICAgIHRoaXMuZ3JhcGhpY3MubW92ZVRvKDAsIDApO1xuICAgIHRoaXMuZ3JhcGhpY3MubGluZVRvKDAsIDEgKiBzY2FsZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDsiLCIvKipcbiAqIENyeXN0YWwuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkNyeXN0YWw7XG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcblxudmFyIENyeXN0YWwgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG59O1xuXG5DcnlzdGFsLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICB2YXIgYSA9IG5ldyBDcnlzdGFsKGdhbWUsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5DcnlzdGFsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5DcnlzdGFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENyeXN0YWw7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShDcnlzdGFsLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShDcnlzdGFsLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5DcnlzdGFsLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyMwMGZmZmYnO1xuQ3J5c3RhbC5wcm90b3R5cGUuX2ZpbGxDb2xvciA9ICcjMDAwMDAwJztcbkNyeXN0YWwucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5DcnlzdGFsLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcbkNyeXN0YWwucHJvdG90eXBlLl9maWxsQWxwaGEgPSAwLjA7XG5DcnlzdGFsLnByb3RvdHlwZS5fc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuQ3J5c3RhbC5wcm90b3R5cGUuX2dlb21ldHJ5ID0gW1xuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5kMmNyb3NzfVxuXTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IENyeXN0YWw7XG4iLCIvKipcbiAqIEdlbmVyaWNPcmIuanNcbiAqXG4gKiBCdWlsZGluZyBibG9ja1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuR2VuZXJpY09yYjtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgR2VuZXJpY09yYiA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkdlbmVyaWNPcmIuYWRkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIHZhciBhID0gbmV3IEdlbmVyaWNPcmIoZ2FtZSwgY29uZmlnKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gYTtcbn07XG5cbkdlbmVyaWNPcmIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcbkdlbmVyaWNPcmIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJpY09yYjtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEdlbmVyaWNPcmIucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEdlbmVyaWNPcmIucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkdlbmVyaWNPcmIucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnI2ZmMDAwMCc7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fZmlsbENvbG9yID0gJyMwMDAwMDAnO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMDtcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5cbkdlbmVyaWNPcmIucHJvdG90eXBlLl9nZW9tZXRyeSA9IFtcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuZDJjcm9zc31cbl07XG5cbm1vZHVsZS5leHBvcnRzID0gR2VuZXJpY09yYjtcbiIsIi8qKlxuICogUGxhbmV0b2lkLmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5QbGFuZXRvaWQ7XG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcblxudmFyIFBsYW5ldG9pZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xufTtcblxuUGxhbmV0b2lkLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIHBsYW5ldG9pZCA9IG5ldyBQbGFuZXRvaWQoZ2FtZSwgb3B0aW9ucyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIHBsYW5ldG9pZDtcbn07XG5cblBsYW5ldG9pZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuUGxhbmV0b2lkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBsYW5ldG9pZDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFBsYW5ldG9pZC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoUGxhbmV0b2lkLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmYwMGZmJztcbi8vUGxhbmV0b2lkLnByb3RvdHlwZS5fZmlsbENvbG9yID0gJyMwMGZmMDAnO1xuLy9QbGFuZXRvaWQucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuLy9QbGFuZXRvaWQucHJvdG90eXBlLl9maWxsQWxwaGEgPSAwLjI1O1xuUGxhbmV0b2lkLnByb3RvdHlwZS5fc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuUGxhbmV0b2lkLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuUGxhbmV0b2lkLnByb3RvdHlwZS5fZ2VvbWV0cnkgPSBbXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLmQyY3Jvc3N9LFxuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5zcXVhcmUwfSxcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuc3F1YXJlMX1cbl07XG5cbm1vZHVsZS5leHBvcnRzID0gUGxhbmV0b2lkO1xuIiwiLyoqXG4gKiBTaGlwLmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb25cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlNoaXA7XG4vL3ZhciBFbmdpbmUgPSByZXF1aXJlKCcuL0VuZ2luZS5qcycpO1xuLy92YXIgV2VhcG9ucyA9IHJlcXVpcmUoJy4vV2VhcG9ucy5qcycpO1xuXG52YXIgU2hpcCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcblxuICAgIGlmIChjb25maWcubWFzcykge1xuICAgICAgICB0aGlzLmJvZHkubWFzcyA9IGNvbmZpZy5tYXNzO1xuICAgIH1cbiAgICAvL3RoaXMuZW5naW5lID0gRW5naW5lLmFkZChnYW1lLCAndGhydXN0JywgNTAwKTtcbiAgICAvL3RoaXMuYWRkQ2hpbGQodGhpcy5lbmdpbmUpO1xuICAgIC8vdGhpcy53ZWFwb25zID0gV2VhcG9ucy5hZGQoZ2FtZSwgJ2J1bGxldCcsIDEyKTtcbiAgICAvL3RoaXMud2VhcG9ucy5zaGlwID0gdGhpcztcbiAgICAvL3RoaXMuYWRkQ2hpbGQodGhpcy53ZWFwb25zKTtcbiAgICB0aGlzLnRhZ1RleHQgPSBnYW1lLmFkZC50ZXh0KDAsIHRoaXMudGV4dHVyZS5oZWlnaHQvMiArIDEsXG4gICAgICAgIHRoaXMudGFnLCB7Zm9udDogJ2JvbGQgMThweCBBcmlhbCcsIGZpbGw6IHRoaXMubGluZUNvbG9yIHx8ICcjZmZmZmZmJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgdGhpcy50YWdUZXh0LmFuY2hvci5zZXRUbygwLjUsIDApO1xuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy50YWdUZXh0KTtcbiAgICB0aGlzLmxvY2FsU3RhdGUgPSB7XG4gICAgICAgIHRocnVzdDogJ29mZidcbiAgICB9XG59O1xuXG5TaGlwLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIHMgPSBuZXcgU2hpcChnYW1lLCBvcHRpb25zKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhzKTtcbiAgICByZXR1cm4gcztcbn07XG5cblNoaXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcblNoaXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2hpcDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFNoaXAucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFNoaXAucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cblNoaXAucHJvdG90eXBlLm1hcEZhY3RvciA9IDM7XG5cbi8vU2hpcC5wcm90b3R5cGUuc2V0TGluZVN0eWxlID0gZnVuY3Rpb24gKGNvbG9yLCBsaW5lV2lkdGgpIHtcbi8vICAgIFN0YXJjb2Rlci5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnNldExpbmVTdHlsZS5jYWxsKHRoaXMsIGNvbG9yLCBsaW5lV2lkdGgpO1xuLy8gICAgdGhpcy50YWdUZXh0LnNldFN0eWxlKHtmaWxsOiBjb2xvcn0pO1xuLy99O1xuXG4vL1NoaXAucHJvdG90eXBlLnNoYXBlID0gW1xuLy8gICAgWy0xLC0xXSxcbi8vICAgIFstMC41LDBdLFxuLy8gICAgWy0xLDFdLFxuLy8gICAgWzAsMC41XSxcbi8vICAgIFsxLDFdLFxuLy8gICAgWzAuNSwwXSxcbi8vICAgIFsxLC0xXSxcbi8vICAgIFswLC0wLjVdLFxuLy8gICAgWy0xLC0xXVxuLy9dO1xuLy9TaGlwLnByb3RvdHlwZS5fbGluZVdpZHRoID0gNjtcblxuU2hpcC5wcm90b3R5cGUudXBkYXRlVGV4dHVyZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gRklYTUU6IFByb2JhYmx5IG5lZWQgdG8gcmVmYWN0b3IgY29uc3RydWN0b3IgYSBiaXQgdG8gbWFrZSB0aGlzIGNsZWFuZXJcbiAgICBWZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZVRleHR1cmVzLmNhbGwodGhpcyk7XG4gICAgaWYgKHRoaXMudGFnVGV4dCkge1xuICAgICAgICAvL3RoaXMudGFnVGV4dC5zZXRTdHlsZSh7ZmlsbDogdGhpcy5saW5lQ29sb3J9KTtcbiAgICAgICAgdGhpcy50YWdUZXh0LmZpbGwgPSB0aGlzLmxpbmVDb2xvcjtcbiAgICAgICAgdGhpcy50YWdUZXh0LnkgPSB0aGlzLnRleHR1cmUuaGVpZ2h0LzIgKyAxO1xuICAgIH1cbn07XG5cblNoaXAucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBWZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMpO1xuICAgIC8vIEZJWE1FOiBOZWVkIHRvIGRlYWwgd2l0aCBwbGF5ZXIgdmVyc3VzIGZvcmVpZ24gc2hpcHNcbiAgICBzd2l0Y2ggKHRoaXMubG9jYWxTdGF0ZS50aHJ1c3QpIHtcbiAgICAgICAgY2FzZSAnc3RhcnRpbmcnOlxuICAgICAgICAgICAgdGhpcy5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QucGxheSgpO1xuICAgICAgICAgICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvci5zdGFydE9uKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0YXRlLnRocnVzdCA9ICdvbic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2h1dGRvd24nOlxuICAgICAgICAgICAgdGhpcy5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3Quc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvci5zdG9wT24odGhpcyk7XG4gICAgICAgICAgICB0aGlzLmxvY2FsU3RhdGUudGhydXN0ID0gJ29mZic7XG4gICAgfVxuICAgIC8vIFBsYXllciBzaGlwIG9ubHlcbiAgICBpZiAodGhpcy5nYW1lLnBsYXllclNoaXAgPT09IHRoaXMpIHtcbiAgICAgICAgdGhpcy5nYW1lLmludmVudG9yeXRleHQuc2V0VGV4dCh0aGlzLmNyeXN0YWxzLnRvU3RyaW5nKCkpO1xuICAgIH1cbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAndGFnJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGFnO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX3RhZyA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNoaXA7XG4vL1N0YXJjb2Rlci5TaGlwID0gU2hpcDtcbiIsIi8qKlxuICogU2ltcGxlUGFydGljbGUuanNcbiAqXG4gKiBCYXNpYyBiaXRtYXAgcGFydGljbGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL3ZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi8uLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IGZ1bmN0aW9uIChnYW1lLCBrZXkpIHtcbiAgICB2YXIgdGV4dHVyZSA9IFNpbXBsZVBhcnRpY2xlLl90ZXh0dXJlQ2FjaGVba2V5XTtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgMCwgMCwgdGV4dHVyZSk7XG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZSh0aGlzLCBmYWxzZSwgZmFsc2UpO1xuICAgIHRoaXMuYm9keS5jbGVhclNoYXBlcygpO1xuICAgIHZhciBzaGFwZSA9IHRoaXMuYm9keS5hZGRQYXJ0aWNsZSgpO1xuICAgIHNoYXBlLnNlbnNvciA9IHRydWU7XG4gICAgLy90aGlzLmtpbGwoKTtcbn07XG5cblNpbXBsZVBhcnRpY2xlLl90ZXh0dXJlQ2FjaGUgPSB7fTtcblxuU2ltcGxlUGFydGljbGUuY2FjaGVUZXh0dXJlID0gZnVuY3Rpb24gKGdhbWUsIGtleSwgY29sb3IsIHNpemUsIGNpcmNsZSkge1xuICAgIHZhciB0ZXh0dXJlID0gZ2FtZS5tYWtlLmJpdG1hcERhdGEoc2l6ZSwgc2l6ZSk7XG4gICAgdGV4dHVyZS5jdHguZmlsbFN0eWxlID0gY29sb3I7XG4gICAgaWYgKGNpcmNsZSkge1xuICAgICAgICB0ZXh0dXJlLmN0eC5hcmMoc2l6ZS8yLCBzaXplLzIsIHNpemUvMiwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcbiAgICAgICAgdGV4dHVyZS5jdHguZmlsbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHR1cmUuY3R4LmZpbGxSZWN0KDAsIDAsIHNpemUsIHNpemUpO1xuICAgIH1cbiAgICBTaW1wbGVQYXJ0aWNsZS5fdGV4dHVyZUNhY2hlW2tleV0gPSB0ZXh0dXJlO1xufTtcblxuU2ltcGxlUGFydGljbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5TaW1wbGVQYXJ0aWNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTaW1wbGVQYXJ0aWNsZTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZVBhcnRpY2xlO1xuLy9TdGFyY29kZXIuU2ltcGxlUGFydGljbGUgPSBTaW1wbGVQYXJ0aWNsZTsiLCIvKipcbiAqIFN0YXJUYXJnZXQuanNcbiAqXG4gKiBDbGllbnQgc2lkZSBpbXBsZW1lbnRhdGlvblxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuU3RhclRhcmdldDtcblxudmFyIHN0YXIgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKS5zdGFyO1xuXG52YXIgU3RhclRhcmdldCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xufTtcblxuU3RhclRhcmdldC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuU3RhclRhcmdldC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdGFyVGFyZ2V0O1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoU3RhclRhcmdldC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoU3RhclRhcmdldC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuU3RhclRhcmdldC5wcm90b3R5cGUuZHJhd1Byb2NlZHVyZSA9IGZ1bmN0aW9uIChyZW5kZXJTY2FsZSkge1xuICAgIHZhciBwc2MgPSB0aGlzLmdhbWUucGh5c2ljcy5wMi5tcHhpKHJlbmRlclNjYWxlKTtcbiAgICB2YXIgZ3NjID0gcHNjKnRoaXMudmVjdG9yU2NhbGU7XG4gICAgdmFyIGxpbmVDb2xvciA9IFBoYXNlci5Db2xvci5oZXhUb1JHQih0aGlzLmxpbmVDb2xvcik7XG4gICAgdGhpcy5ncmFwaGljcy5saW5lU3R5bGUoMSwgbGluZUNvbG9yLCAxKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuc3RhcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwLCBrID0gc3Rhci5sZW5ndGg7IGogPCBrOyBqKyspIHtcbiAgICAgICAgICAgIHZhciB4ID0gcHNjICogdGhpcy5zdGFyc1tpXVswXSArIGdzYyAqIHN0YXJbal1bMF07XG4gICAgICAgICAgICB2YXIgeSA9IHBzYyAqIHRoaXMuc3RhcnNbaV1bMV0gKyBnc2MgKiBzdGFyW2pdWzFdO1xuICAgICAgICAgICAgaWYgKGogPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyYXBoaWNzLm1vdmVUbyh4LCB5KTtcbiAgICAgICAgICAgICAgICB2YXIgeDAgPSB4O1xuICAgICAgICAgICAgICAgIHZhciB5MCA9IHk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MubGluZVRvKHgsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubGluZVRvKHgwLCB5MCk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFyVGFyZ2V0OyIsIi8qKlxuICogU3luY0JvZHlJbnRlcmZhY2UuanNcbiAqXG4gKiBTaGFyZWQgbWV0aG9kcyBmb3IgVmVjdG9yU3ByaXRlcywgUGFydGljbGVzLCBldGMuXG4gKi9cblxudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gZnVuY3Rpb24gKCkge307XG5cbi8qKlxuICogU2V0IGxvY2F0aW9uIGFuZCBhbmdsZSBvZiBhIHBoeXNpY3Mgb2JqZWN0LiBWYWx1ZSBhcmUgZ2l2ZW4gaW4gd29ybGQgY29vcmRpbmF0ZXMsIG5vdCBwaXhlbHNcbiAqXG4gKiBAcGFyYW0geCB7bnVtYmVyfVxuICogQHBhcmFtIHkge251bWJlcn1cbiAqIEBwYXJhbSBhIHtudW1iZXJ9XG4gKi9cblN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZS5zZXRQb3NBbmdsZSA9IGZ1bmN0aW9uICh4LCB5LCBhKSB7XG4gICAgdGhpcy5ib2R5LmRhdGEucG9zaXRpb25bMF0gPSAtKHggfHwgMCk7XG4gICAgdGhpcy5ib2R5LmRhdGEucG9zaXRpb25bMV0gPSAtKHkgfHwgMCk7XG4gICAgdGhpcy5ib2R5LmRhdGEuYW5nbGUgPSBhIHx8IDA7XG59O1xuXG5TeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUuY29uZmlnID0gZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcbiAgICBjb25zb2xlLmxvZygnY29uZmlnZ2luZycsIHByb3BlcnRpZXMpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy51cGRhdGVQcm9wZXJ0aWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgayA9IHRoaXMudXBkYXRlUHJvcGVydGllc1tpXTtcbiAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzW2tdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpc1trXSA9IHByb3BlcnRpZXNba107ICAgICAgICAvLyBGSVhNRT8gVmlydHVhbGl6ZSBzb21laG93XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bmNCb2R5SW50ZXJmYWNlOyIsIi8qKlxuICogVGhydXN0R2VuZXJhdG9yLmpzXG4gKlxuICogR3JvdXAgcHJvdmlkaW5nIEFQSSwgbGF5ZXJpbmcsIGFuZCBwb29saW5nIGZvciB0aHJ1c3QgcGFydGljbGUgZWZmZWN0c1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcblxudmFyIF90ZXh0dXJlS2V5ID0gJ3RocnVzdCc7XG5cbi8vIFBvb2xpbmcgcGFyYW1ldGVyc1xudmFyIF9taW5Qb29sU2l6ZSA9IDMwMDtcbnZhciBfbWluRnJlZVBhcnRpY2xlcyA9IDIwO1xudmFyIF9zb2Z0UG9vbExpbWl0ID0gMjAwO1xudmFyIF9oYXJkUG9vbExpbWl0ID0gNTAwO1xuXG4vLyBCZWhhdmlvciBvZiBlbWl0dGVyXG52YXIgX3BhcnRpY2xlc1BlckJ1cnN0ID0gNTtcbnZhciBfcGFydGljbGVUVEwgPSAxNTA7XG52YXIgX3BhcnRpY2xlQmFzZVNwZWVkID0gNTtcbnZhciBfY29uZUxlbmd0aCA9IDE7XG52YXIgX2NvbmVXaWR0aFJhdGlvID0gMC4yO1xudmFyIF9lbmdpbmVPZmZzZXQgPSAtMjA7XG5cbnZhciBUaHJ1c3RHZW5lcmF0b3IgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUpO1xuXG4gICAgdGhpcy50aHJ1c3RpbmdTaGlwcyA9IHt9O1xuXG4gICAgLy8gUHJlZ2VuZXJhdGUgYSBiYXRjaCBvZiBwYXJ0aWNsZXNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9taW5Qb29sU2l6ZTsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0aWNsZSA9IHRoaXMuYWRkKG5ldyBTaW1wbGVQYXJ0aWNsZShnYW1lLCBfdGV4dHVyZUtleSkpO1xuICAgICAgICBwYXJ0aWNsZS5hbHBoYSA9IDAuNTtcbiAgICAgICAgcGFydGljbGUucm90YXRpb24gPSBNYXRoLlBJLzQ7XG4gICAgICAgIHBhcnRpY2xlLmtpbGwoKTtcbiAgICB9XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUaHJ1c3RHZW5lcmF0b3I7XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUuc3RhcnRPbiA9IGZ1bmN0aW9uIChzaGlwKSB7XG4gICAgdGhpcy50aHJ1c3RpbmdTaGlwc1tzaGlwLmlkXSA9IHNoaXA7XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLnN0b3BPbiA9IGZ1bmN0aW9uIChzaGlwKSB7XG4gICAgZGVsZXRlIHRoaXMudGhydXN0aW5nU2hpcHNbc2hpcC5pZF07XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMudGhydXN0aW5nU2hpcHMpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHNoaXAgPSB0aGlzLnRocnVzdGluZ1NoaXBzW2tleXNbaV1dO1xuICAgICAgICB2YXIgdyA9IHNoaXAud2lkdGg7XG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihzaGlwLnJvdGF0aW9uKTtcbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKHNoaXAucm90YXRpb24pO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IF9wYXJ0aWNsZXNQZXJCdXJzdDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgcGFydGljbGUgPSB0aGlzLmdldEZpcnN0RGVhZCgpO1xuICAgICAgICAgICAgaWYgKCFwYXJ0aWNsZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3QgZW5vdWdoIHRocnVzdCBwYXJ0aWNsZXMgaW4gcG9vbCcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGQgPSB0aGlzLmdhbWUucm5kLnJlYWxJblJhbmdlKC1fY29uZVdpZHRoUmF0aW8qdywgX2NvbmVXaWR0aFJhdGlvKncpO1xuICAgICAgICAgICAgdmFyIHggPSBzaGlwLnggKyBkKmNvcyArIF9lbmdpbmVPZmZzZXQqc2luO1xuICAgICAgICAgICAgdmFyIHkgPSBzaGlwLnkgKyBkKnNpbiAtIF9lbmdpbmVPZmZzZXQqY29zO1xuICAgICAgICAgICAgcGFydGljbGUubGlmZXNwYW4gPSBfcGFydGljbGVUVEw7XG4gICAgICAgICAgICBwYXJ0aWNsZS5yZXNldCh4LCB5KTtcbiAgICAgICAgICAgIHBhcnRpY2xlLmJvZHkudmVsb2NpdHkueCA9IF9wYXJ0aWNsZUJhc2VTcGVlZCooX2NvbmVMZW5ndGgqc2luIC0gZCpjb3MpO1xuICAgICAgICAgICAgcGFydGljbGUuYm9keS52ZWxvY2l0eS55ID0gX3BhcnRpY2xlQmFzZVNwZWVkKigtX2NvbmVMZW5ndGgqY29zIC0gZCpzaW4pO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuVGhydXN0R2VuZXJhdG9yLnRleHR1cmVLZXkgPSBfdGV4dHVyZUtleTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaHJ1c3RHZW5lcmF0b3I7IiwiLyoqXG4gKiBUb2FzdC5qc1xuICpcbiAqIENsYXNzIGZvciB2YXJpb3VzIGtpbmRzIG9mIHBvcCB1cCBtZXNzYWdlc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBUb2FzdCA9IGZ1bmN0aW9uIChnYW1lLCB4LCB5LCB0ZXh0LCBjb25maWcpIHtcbiAgICAvLyBUT0RPOiBiZXR0ZXIgZGVmYXVsdHMsIG1heWJlXG4gICAgUGhhc2VyLlRleHQuY2FsbCh0aGlzLCBnYW1lLCB4LCB5LCB0ZXh0LCB7XG4gICAgICAgIGZvbnQ6ICcxNHB0IEFyaWFsJyxcbiAgICAgICAgYWxpZ246ICdjZW50ZXInLFxuICAgICAgICBmaWxsOiAnI2ZmYTUwMCdcbiAgICB9KTtcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgLy8gU2V0IHVwIHN0eWxlcyBhbmQgdHdlZW5zXG4gICAgdmFyIHNwZWMgPSB7fTtcbiAgICBpZiAoY29uZmlnLnVwKSB7XG4gICAgICAgIHNwZWMueSA9ICctJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5kb3duKSB7XG4gICAgICAgIHNwZWMueSA9ICcrJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5sZWZ0KSB7XG4gICAgICAgIHNwZWMueCA9ICctJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5yaWdodCkge1xuICAgICAgICBzcGVjLnggPSAnKycgKyBjb25maWcudXA7XG4gICAgfVxuICAgIHN3aXRjaCAoY29uZmlnLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnc3Bpbm5lcic6XG4gICAgICAgICAgICB0aGlzLmZvbnRTaXplID0gJzIwcHQnO1xuICAgICAgICAgICAgc3BlYy5yb3RhdGlvbiA9IGNvbmZpZy5yZXZvbHV0aW9ucyA/IGNvbmZpZy5yZXZvbHV0aW9ucyAqIDIgKiBNYXRoLlBJIDogMiAqIE1hdGguUEk7XG4gICAgICAgICAgICB2YXIgdHdlZW4gPSBnYW1lLmFkZC50d2Vlbih0aGlzKS50byhzcGVjLCBjb25maWcuZHVyYXRpb24sIGNvbmZpZy5lYXNpbmcsIHRydWUpO1xuICAgICAgICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoZnVuY3Rpb24gKHRvYXN0KSB7XG4gICAgICAgICAgICAgICAgdG9hc3Qua2lsbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIFRPRE86IE1vcmUga2luZHNcbiAgICB9XG59O1xuXG4vKipcbiAqIENyZWF0ZSBuZXcgVG9hc3QgYW5kIGFkZCB0byBnYW1lXG4gKlxuICogQHBhcmFtIGdhbWVcbiAqIEBwYXJhbSB4XG4gKiBAcGFyYW0geVxuICogQHBhcmFtIHRleHRcbiAqIEBwYXJhbSBjb25maWdcbiAqL1xuVG9hc3QuYWRkID0gZnVuY3Rpb24gKGdhbWUsIHgsIHksIHRleHQsIGNvbmZpZykge1xuICAgIHZhciB0b2FzdCA9IG5ldyBUb2FzdChnYW1lLCB4LCB5LCB0ZXh0LCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRvYXN0KTtcbn07XG5cbi8vIENvdmVuaWVuY2UgbWV0aG9kcyBmb3IgY29tbW9uIGNhc2VzXG5cblRvYXN0LnNwaW5VcCA9IGZ1bmN0aW9uIChnYW1lLCB4LCB5LCB0ZXh0KSB7XG4gICAgdmFyIHRvYXN0ID0gbmV3IFRvYXN0IChnYW1lLCB4LCB5LCB0ZXh0LCB7XG4gICAgICAgIHR5cGU6ICdzcGlubmVyJyxcbiAgICAgICAgcmV2b2x1dGlvbnM6IDEsXG4gICAgICAgIGR1cmF0aW9uOiA1MDAsXG4gICAgICAgIGVhc2luZzogUGhhc2VyLkVhc2luZy5FbGFzdGljLk91dCxcbiAgICAgICAgdXA6IDEwMFxuICAgIH0pO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRvYXN0KTtcbn07XG5cblRvYXN0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlRleHQucHJvdG90eXBlKTtcblRvYXN0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRvYXN0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvYXN0O1xuIiwiLyoqXG4gKiBUcmFjdG9yQmVhbS5qc1xuICpcbiAqIENsaWVudCBzaWRlIGltcGxlbWVudGF0aW9uIG9mIGEgc2luZ2xlIHRyYWN0b3IgYmVhbSBzZWdtZW50XG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy9GSVhNRTogTmljZXIgaW1wbGVtZW50YXRpb25cblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSByZXF1aXJlKCcuL1NpbXBsZVBhcnRpY2xlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuVHJhY3RvckJlYW07XG5cbnZhciBUcmFjdG9yQmVhbSA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWxsKHRoaXMsIGdhbWUsICd0cmFjdG9yJyk7XG4gICAgdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cblRyYWN0b3JCZWFtLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU2ltcGxlUGFydGljbGUucHJvdG90eXBlKTtcblRyYWN0b3JCZWFtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRyYWN0b3JCZWFtO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJhY3RvckJlYW0ucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFRyYWN0b3JCZWFtLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWN0b3JCZWFtOyIsIi8qKlxuICogVHJlZS5qc1xuICpcbiAqIENsaWVudCBzaWRlXG4gKi9cblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5UcmVlO1xuXG52YXIgVHJlZSA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMSk7XG59O1xuXG5UcmVlLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICB2YXIgdHJlZSA9IG5ldyBUcmVlIChnYW1lLCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRyZWUpO1xuICAgIHJldHVybiB0cmVlO1xufTtcblxuVHJlZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuVHJlZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUcmVlO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJlZS5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJlZS5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuLyoqXG4gKiBEcmF3IHRyZWUsIG92ZXJyaWRpbmcgc3RhbmRhcmQgc2hhcGUgYW5kIGdlb21ldHJ5IG1ldGhvZCB0byB1c2UgZ3JhcGhcbiAqXG4gKiBAcGFyYW0gcmVuZGVyU2NhbGVcbiAqL1xuVHJlZS5wcm90b3R5cGUuZHJhd1Byb2NlZHVyZSA9IGZ1bmN0aW9uIChyZW5kZXJTY2FsZSkge1xuICAgIHZhciBsaW5lQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpO1xuICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKDEsIGxpbmVDb2xvciwgMSk7XG4gICAgdGhpcy5fZHJhd0JyYW5jaCh0aGlzLmdyYXBoLCB0aGlzLmdhbWUucGh5c2ljcy5wMi5tcHhpKHRoaXMudmVjdG9yU2NhbGUpKnJlbmRlclNjYWxlLCB0aGlzLmRlcHRoKTtcbn07XG5cblRyZWUucHJvdG90eXBlLl9kcmF3QnJhbmNoID0gZnVuY3Rpb24gKGdyYXBoLCBzYywgZGVwdGgpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGdyYXBoLmMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGdyYXBoLmNbaV07XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubW92ZVRvKGdyYXBoLnggKiBzYywgZ3JhcGgueSAqIHNjKTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lVG8oY2hpbGQueCAqIHNjLCBjaGlsZC55ICogc2MpO1xuICAgICAgICBpZiAoZGVwdGggPiB0aGlzLnN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMuX2RyYXdCcmFuY2goY2hpbGQsIHNjLCBkZXB0aCAtIDEpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFRyZWUucHJvdG90eXBlLCAnc3RlcCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0ZXA7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fc3RlcCA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyZWU7IiwiLyoqXG4gKiBTcHJpdGUgd2l0aCBhdHRhY2hlZCBHcmFwaGljcyBvYmplY3QgZm9yIHZlY3Rvci1saWtlIGdyYXBoaWNzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG52YXIgZnJhbWVUZXh0dXJlUG9vbCA9IHt9O1xudmFyIG1hcFRleHR1cmVQb29sID0ge307XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgVmVjdG9yLWJhc2VkIHNwcml0ZXNcbiAqXG4gKiBAcGFyYW0gZ2FtZSB7UGhhc2VyLkdhbWV9IC0gUGhhc2VyIGdhbWUgb2JqZWN0XG4gKiBAcGFyYW0gY29uZmlnIHtvYmplY3R9IC0gUE9KTyB3aXRoIGNvbmZpZyBkZXRhaWxzXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIFZlY3RvclNwcml0ZSA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICAvL3RoaXMuZ3JhcGhpY3MgPSBnYW1lLm1ha2UuZ3JhcGhpY3MoKTtcbiAgICB0aGlzLmdyYXBoaWNzID0gdGhpcy5nYW1lLnNoYXJlZEdyYXBoaWNzO1xuICAgIC8vdGhpcy50ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgLy90aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG5cbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHRoaXMsIGZhbHNlLCBmYWxzZSk7XG4gICAgdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbiAgICB0aGlzLmNvbmZpZyhjb25maWcucHJvcGVydGllcyk7XG5cbiAgICBpZiAodGhpcy52aXNpYmxlT25NYXApIHtcbiAgICAgICAgdGhpcy5taW5pc3ByaXRlID0gdGhpcy5nYW1lLm1pbmltYXAuY3JlYXRlKCk7XG4gICAgICAgIHRoaXMubWluaXNwcml0ZS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNoYXJlZFRleHR1cmVLZXkpIHtcbiAgICAgICAgdGhpcy5mcmFtZXMgPSB0aGlzLmdldEZyYW1lUG9vbCh0aGlzLnNoYXJlZFRleHR1cmVLZXkpO1xuICAgICAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICB0aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nZXRNYXBQb29sKHRoaXMuc2hhcmVkVGV4dHVyZUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZnJhbWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRUZXh0dXJlKHRoaXMuZnJhbWVzW3RoaXMudkZyYW1lXSk7XG4gICAgICAgICAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taW5pc3ByaXRlLnNldFRleHR1cmUodGhpcy5taW5pdGV4dHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZyYW1lcyA9IFtdO1xuICAgICAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICB0aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xuICAgIH1cblxuICAgIC8vdGhpcy51cGRhdGVUZXh0dXJlcygpO1xuICAgIGlmICh0aGlzLmZwcykge1xuICAgICAgICB0aGlzLl9tc1BlckZyYW1lID0gMTAwMCAvIHRoaXMuZnBzO1xuICAgICAgICB0aGlzLl9sYXN0VkZyYW1lID0gdGhpcy5nYW1lLnRpbWUubm93O1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUJvZHkoKTtcbiAgICB0aGlzLmJvZHkubWFzcyA9IDA7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBWZWN0b3JTcHJpdGUgYW5kIGFkZCB0byBnYW1lIHdvcmxkXG4gKlxuICogQHBhcmFtIGdhbWUge1BoYXNlci5HYW1lfVxuICogQHBhcmFtIHgge251bWJlcn0gLSB4IGNvb3JkXG4gKiBAcGFyYW0geSB7bnVtYmVyfSAtIHkgY29vcmRcbiAqIEByZXR1cm5zIHtWZWN0b3JTcHJpdGV9XG4gKi9cblZlY3RvclNwcml0ZS5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSkge1xuICAgIHZhciB2ID0gbmV3IFZlY3RvclNwcml0ZShnYW1lLCB4LCB5KTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyh2KTtcbiAgICByZXR1cm4gdjtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBWZWN0b3JTcHJpdGU7XG5cbi8vIERlZmF1bHQgb2N0YWdvblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fc2hhcGUgPSBbXG4gICAgWzIsMV0sXG4gICAgWzEsMl0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwxXSxcbiAgICBbLTIsLTFdLFxuICAgIFstMSwtMl0sXG4gICAgWzEsLTJdLFxuICAgIFsyLC0xXVxuXTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmZmZmZmJztcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9maWxsQ29sb3IgPSBudWxsO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4yNTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX3ZlY3RvclNjYWxlID0gMTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5waHlzaWNzQm9keVR5cGUgPSAnY2lyY2xlJztcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5udW1GcmFtZXMgPSAxO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5tYXBGcmFtZSA9IDA7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnZGcmFtZSA9IDA7XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudmlzaWJsZU9uTWFwID0gdHJ1ZTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5nZXRGcmFtZVBvb2wgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKCFmcmFtZVRleHR1cmVQb29sW2tleV0pIHtcbiAgICAgICAgcmV0dXJuIGZyYW1lVGV4dHVyZVBvb2xba2V5XSA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gZnJhbWVUZXh0dXJlUG9vbFtrZXldO1xufTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5nZXRNYXBQb29sID0gZnVuY3Rpb24gKGtleSkge1xuICAgIGlmICghbWFwVGV4dHVyZVBvb2xba2V5XSkge1xuICAgICAgICBtYXBUZXh0dXJlUG9vbFtrZXldID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgfVxuICAgIHJldHVybiBtYXBUZXh0dXJlUG9vbFtrZXldO1xufVxuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnNldFNoYXBlID0gZnVuY3Rpb24gKHNoYXBlKSB7XG4gICAgdGhpcy5zaGFwZSA9IHNoYXBlO1xuICAgIHRoaXMudXBkYXRlVGV4dHVyZXMoKTtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0TGluZVN0eWxlID0gZnVuY3Rpb24gKGNvbG9yLCBsaW5lV2lkdGgpIHtcbiAgICBpZiAoIWxpbmVXaWR0aCB8fCBsaW5lV2lkdGggPCAxKSB7XG4gICAgICAgIGxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoIHx8IDE7XG4gICAgfVxuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICB0aGlzLmxpbmVXaWR0aCA9IGxpbmVXaWR0aDtcbiAgICB0aGlzLnVwZGF0ZVRleHR1cmVzKCk7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSBjYWNoZWQgYml0bWFwcyBmb3Igb2JqZWN0IGFmdGVyIHZlY3RvciBwcm9wZXJ0aWVzIGNoYW5nZVxuICovXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZVRleHR1cmVzID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIERyYXcgZnVsbCBzaXplZFxuICAgIGlmICh0aGlzLm51bUZyYW1lcyA9PT0gMSkge1xuICAgICAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MuX2N1cnJlbnRCb3VuZHMgPSBudWxsO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuZHJhd1Byb2NlZHVyZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd1Byb2NlZHVyZSgxLCAwKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNoYXBlKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXcoMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmZyYW1lc1swXSkge1xuICAgICAgICAgICAgdGhpcy5mcmFtZXNbMF0gPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm91bmRzID0gdGhpcy5ncmFwaGljcy5nZXRMb2NhbEJvdW5kcygpO1xuICAgICAgICB0aGlzLmZyYW1lc1swXS5yZXNpemUoYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0LCB0cnVlKTtcbiAgICAgICAgdGhpcy5mcmFtZXNbMF0ucmVuZGVyWFkodGhpcy5ncmFwaGljcywgLWJvdW5kcy54LCAtYm91bmRzLnksIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5udW1GcmFtZXM7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5fY3VycmVudEJvdW5kcyA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmRyYXdQcm9jZWR1cmUoMSwgaSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZnJhbWVzW2ldKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZXNbaV0gPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJvdW5kcyA9IHRoaXMuZ3JhcGhpY3MuZ2V0TG9jYWxCb3VuZHMoKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzW2ldLnJlc2l6ZShib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5mcmFtZXNbaV0ucmVuZGVyWFkodGhpcy5ncmFwaGljcywgLWJvdW5kcy54LCAtYm91bmRzLnksIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0VGV4dHVyZSh0aGlzLmZyYW1lc1t0aGlzLnZGcmFtZV0pO1xuICAgIC8vIERyYXcgc21hbGwgZm9yIG1pbmltYXBcbiAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgIHZhciBtYXBTY2FsZSA9IHRoaXMuZ2FtZS5taW5pbWFwLm1hcFNjYWxlO1xuICAgICAgICB2YXIgbWFwRmFjdG9yID0gdGhpcy5tYXBGYWN0b3IgfHwgMTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5jbGVhcigpO1xuICAgICAgICB0aGlzLmdyYXBoaWNzLl9jdXJyZW50Qm91bmRzID0gbnVsbDtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmRyYXdQcm9jZWR1cmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdQcm9jZWR1cmUobWFwU2NhbGUgKiBtYXBGYWN0b3IsIHRoaXMubWFwRnJhbWUpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhdyhtYXBTY2FsZSAqIG1hcEZhY3Rvcik7XG4gICAgICAgIH1cbiAgICAgICAgYm91bmRzID0gdGhpcy5ncmFwaGljcy5nZXRMb2NhbEJvdW5kcygpO1xuICAgICAgICB0aGlzLm1pbml0ZXh0dXJlLnJlc2l6ZShib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIHRydWUpO1xuICAgICAgICB0aGlzLm1pbml0ZXh0dXJlLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIC1ib3VuZHMueCwgLWJvdW5kcy55LCB0cnVlKTtcbiAgICAgICAgdGhpcy5taW5pc3ByaXRlLnNldFRleHR1cmUodGhpcy5taW5pdGV4dHVyZSk7XG4gICAgfVxuICAgIHRoaXMuX2RpcnR5ID0gZmFsc2U7XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZUJvZHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgc3dpdGNoICh0aGlzLnBoeXNpY3NCb2R5VHlwZSkge1xuICAgICAgICBjYXNlIFwiY2lyY2xlXCI6XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuY2lyY2xlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHZhciByID0gdGhpcy5ncmFwaGljcy5nZXRCb3VuZHMoKTtcbiAgICAgICAgICAgICAgICB2YXIgcmFkaXVzID0gTWF0aC5yb3VuZChNYXRoLnNxcnQoci53aWR0aCogci5oZWlnaHQpLzIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByYWRpdXMgPSB0aGlzLnJhZGl1cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRDaXJjbGUocmFkaXVzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBUT0RPOiBNb3JlIHNoYXBlc1xuICAgIH1cbn07XG5cbi8qKlxuICogUmVuZGVyIHZlY3RvciB0byBiaXRtYXAgb2YgZ3JhcGhpY3Mgb2JqZWN0IGF0IGdpdmVuIHNjYWxlXG4gKlxuICogQHBhcmFtIHJlbmRlclNjYWxlIHtudW1iZXJ9IC0gc2NhbGUgZmFjdG9yIGZvciByZW5kZXJcbiAqL1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlKSB7XG4gICAgcmVuZGVyU2NhbGUgPSByZW5kZXJTY2FsZSB8fCAxO1xuICAgIC8vIERyYXcgc2ltcGxlIHNoYXBlLCBpZiBnaXZlblxuICAgIGlmICh0aGlzLnNoYXBlKSB7XG4gICAgICAgIHZhciBsaW5lQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpO1xuICAgICAgICBpZiAocmVuZGVyU2NhbGUgPT09IDEpIHtcbiAgICAgICAgICAgIHZhciBsaW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpbmVXaWR0aCA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZW5kZXJTY2FsZSA9PT0gMSkgJiYgdGhpcy5maWxsQ29sb3IpIHsgICAgICAgIC8vIE9ubHkgZmlsbCBmdWxsIHNpemVkXG4gICAgICAgICAgICB2YXIgZmlsbENvbG9yID0gUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMuZmlsbENvbG9yKTtcbiAgICAgICAgICAgIHZhciBmaWxsQWxwaGEgPSB0aGlzLmZpbGxBbHBoYSB8fCAxO1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5iZWdpbkZpbGwoZmlsbENvbG9yLCBmaWxsQWxwaGEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKGxpbmVXaWR0aCwgbGluZUNvbG9yLCAxKTtcbiAgICAgICAgdGhpcy5fZHJhd1BvbHlnb24odGhpcy5zaGFwZSwgdGhpcy5zaGFwZUNsb3NlZCwgcmVuZGVyU2NhbGUpO1xuICAgICAgICBpZiAoKHJlbmRlclNjYWxlID09PSAxKSAmJiB0aGlzLmZpbGxDb2xvcikge1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5lbmRGaWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRHJhdyBnZW9tZXRyeSBzcGVjLCBpZiBnaXZlbiwgYnV0IG9ubHkgZm9yIHRoZSBmdWxsIHNpemVkIHNwcml0ZVxuICAgIGlmICgocmVuZGVyU2NhbGUgPT09IDEpICYmIHRoaXMuZ2VvbWV0cnkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmdlb21ldHJ5Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdmFyIGcgPSB0aGlzLmdlb21ldHJ5W2ldO1xuICAgICAgICAgICAgc3dpdGNoIChnLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwicG9seVwiOlxuICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRTogZGVmYXVsdHMgYW5kIHN0dWZmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYXdQb2x5Z29uKGcucG9pbnRzLCBnLmNsb3NlZCwgcmVuZGVyU2NhbGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRHJhdyBvcGVuIG9yIGNsb3NlZCBwb2x5Z29uIGFzIHNlcXVlbmNlIG9mIGxpbmVUbyBjYWxsc1xuICpcbiAqIEBwYXJhbSBwb2ludHMge0FycmF5fSAtIHBvaW50cyBhcyBhcnJheSBvZiBbeCx5XSBwYWlyc1xuICogQHBhcmFtIGNsb3NlZCB7Ym9vbGVhbn0gLSBpcyBwb2x5Z29uIGNsb3NlZD9cbiAqIEBwYXJhbSByZW5kZXJTY2FsZSB7bnVtYmVyfSAtIHNjYWxlIGZhY3RvciBmb3IgcmVuZGVyXG4gKiBAcHJpdmF0ZVxuICovXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9kcmF3UG9seWdvbiA9IGZ1bmN0aW9uIChwb2ludHMsIGNsb3NlZCwgcmVuZGVyU2NhbGUpIHtcbiAgICB2YXIgc2MgPSB0aGlzLmdhbWUucGh5c2ljcy5wMi5tcHhpKHRoaXMudmVjdG9yU2NhbGUpKnJlbmRlclNjYWxlO1xuICAgIHBvaW50cyA9IHBvaW50cy5zbGljZSgpO1xuICAgIGlmIChjbG9zZWQpIHtcbiAgICAgICAgcG9pbnRzLnB1c2gocG9pbnRzWzBdKTtcbiAgICB9XG4gICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8ocG9pbnRzWzBdWzBdICogc2MsIHBvaW50c1swXVsxXSAqIHNjKTtcbiAgICBmb3IgKHZhciBpID0gMSwgbCA9IHBvaW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lVG8ocG9pbnRzW2ldWzBdICogc2MsIHBvaW50c1tpXVsxXSAqIHNjKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEludmFsaWRhdGUgY2FjaGUgYW5kIHJlZHJhdyBpZiBzcHJpdGUgaXMgbWFya2VkIGRpcnR5XG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9kaXJ0eSkge1xuICAgICAgICB0aGlzLnVwZGF0ZVRleHR1cmVzKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9tc1BlckZyYW1lICYmICh0aGlzLmdhbWUudGltZS5ub3cgPj0gdGhpcy5fbGFzdFZGcmFtZSArIHRoaXMuX21zUGVyRnJhbWUpKSB7XG4gICAgICAgIHRoaXMudkZyYW1lID0gKHRoaXMudkZyYW1lICsgMSkgJSB0aGlzLm51bUZyYW1lcztcbiAgICAgICAgdGhpcy5zZXRUZXh0dXJlKHRoaXMuZnJhbWVzW3RoaXMudkZyYW1lXSk7XG4gICAgICAgIHRoaXMuX2xhc3RWRnJhbWUgPSB0aGlzLmdhbWUudGltZS5ub3c7XG4gICAgfVxufTtcblxuLy8gVmVjdG9yIHByb3BlcnRpZXMgZGVmaW5lZCB0byBoYW5kbGUgbWFya2luZyBzcHJpdGUgZGlydHkgd2hlbiBuZWNlc3NhcnlcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdsaW5lQ29sb3InLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9saW5lQ29sb3I7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fbGluZUNvbG9yID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZmlsbENvbG9yJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlsbENvbG9yO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2ZpbGxDb2xvciA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2xpbmVXaWR0aCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpbmVXaWR0aDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9saW5lV2lkdGggPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdmaWxsQWxwaGEnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9maWxsQWxwaGE7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fZmlsbEFscGhhID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnc2hhcGVDbG9zZWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFwZUNsb3NlZDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9zaGFwZUNsb3NlZCA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3ZlY3RvclNjYWxlJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmVjdG9yU2NhbGU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fdmVjdG9yU2NhbGUgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdzaGFwZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NoYXBlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX3NoYXBlID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZ2VvbWV0cnknLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZW9tZXRyeTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9nZW9tZXRyeSA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2RlYWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWFkO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2RlYWQgPSB2YWw7XG4gICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICAgIHRoaXMua2lsbCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXZpdmUoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVmVjdG9yU3ByaXRlO1xuLy9TdGFyY29kZXIuVmVjdG9yU3ByaXRlID0gVmVjdG9yU3ByaXRlOyIsIi8qKlxuICogQ29udHJvbHMuanNcbiAqXG4gKiBWaXJ0dWFsaXplIGFuZCBpbXBsZW1lbnQgcXVldWUgZm9yIGdhbWUgY29udHJvbHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG52YXIgQ29udHJvbHMgPSBmdW5jdGlvbiAoZ2FtZSwgcGFyZW50KSB7XG4gICAgUGhhc2VyLlBsdWdpbi5jYWxsKHRoaXMsIGdhbWUsIHBhcmVudCk7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5QbHVnaW4ucHJvdG90eXBlKTtcbkNvbnRyb2xzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbnRyb2xzO1xuXG5Db250cm9scy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChxdWV1ZSkge1xuICAgIHRoaXMucXVldWUgPSBxdWV1ZTtcbiAgICB0aGlzLmNvbnRyb2xzID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcbiAgICB0aGlzLmNvbnRyb2xzLmZpcmUgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5CKTtcbiAgICB0aGlzLmNvbnRyb2xzLnRyYWN0b3IgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5UKTtcbiAgICB0aGlzLmpveXN0aWNrU3RhdGUgPSB7XG4gICAgICAgIHVwOiBmYWxzZSxcbiAgICAgICAgZG93bjogZmFsc2UsXG4gICAgICAgIGxlZnQ6IGZhbHNlLFxuICAgICAgICByaWdodDogZmFsc2UsXG4gICAgICAgIGZpcmU6IGZhbHNlXG4gICAgfTtcblxuICAgIC8vIEFkZCB2aXJ0dWFsIGpveXN0aWNrIGlmIHBsdWdpbiBpcyBhdmFpbGFibGVcbiAgICBpZiAoUGhhc2VyLlZpcnR1YWxKb3lzdGljaykge1xuICAgICAgICB0aGlzLmpveXN0aWNrID0gdGhpcy5nYW1lLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oUGhhc2VyLlZpcnR1YWxKb3lzdGljayk7XG4gICAgfVxufTtcblxudmFyIHNlcSA9IDA7XG52YXIgdXAgPSBmYWxzZSwgZG93biA9IGZhbHNlLCBsZWZ0ID0gZmFsc2UsIHJpZ2h0ID0gZmFsc2UsIGZpcmUgPSBmYWxzZSwgdHJhY3RvciA9IGZhbHNlO1xuXG5Db250cm9scy5wcm90b3R5cGUuYWRkVmlydHVhbENvbnRyb2xzID0gZnVuY3Rpb24gKHRleHR1cmUpIHtcbiAgICB0ZXh0dXJlID0gdGV4dHVyZSB8fCAnam95c3RpY2snO1xuICAgIHZhciBzY2FsZSA9IDE7ICAgICAgICAgICAgLy8gRklYTUVcbiAgICB0aGlzLnN0aWNrID0gdGhpcy5qb3lzdGljay5hZGRTdGljaygwLCAwLCAxMDAsdGV4dHVyZSk7XG4gICAgLy90aGlzLnN0aWNrLm1vdGlvbkxvY2sgPSBQaGFzZXIuVmlydHVhbEpveXN0aWNrLkhPUklaT05UQUw7XG4gICAgdGhpcy5zdGljay5zY2FsZSA9IHNjYWxlO1xuICAgIC8vdGhpcy5nb2J1dHRvbiA9IHRoaXMuam95c3RpY2suYWRkQnV0dG9uKHggKyAyMDAqc2NhbGUsIHksIHRleHR1cmUsICdidXR0b24xLXVwJywgJ2J1dHRvbjEtZG93bicpO1xuICAgIHRoaXMuZmlyZWJ1dHRvbiA9IHRoaXMuam95c3RpY2suYWRkQnV0dG9uKDAsIDAsIHRleHR1cmUsICdidXR0b24xLXVwJywgJ2J1dHRvbjEtZG93bicpO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbiA9IHRoaXMuam95c3RpY2suYWRkQnV0dG9uKDAsIDAsIHRleHR1cmUsICdidXR0b24yLXVwJywgJ2J1dHRvbjItZG93bicpO1xuICAgIHRoaXMuZmlyZWJ1dHRvbi5zY2FsZSA9IHNjYWxlO1xuICAgIC8vdGhpcy5nb2J1dHRvbi5zY2FsZSA9IHNjYWxlO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5zY2FsZSA9IHNjYWxlO1xuICAgIHRoaXMubGF5b3V0VmlydHVhbENvbnRyb2xzKHNjYWxlKTtcbiAgICB0aGlzLnN0aWNrLm9uTW92ZS5hZGQoZnVuY3Rpb24gKHN0aWNrLCBmLCBmWCwgZlkpIHtcbiAgICAgICAgaWYgKGZYID49IDAuMzUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5yaWdodCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUubGVmdCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGZYIDw9IC0wLjM1KSB7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUucmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5sZWZ0ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5yaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmxlZnQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZlkgPj0gMC4zNSkge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmRvd24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoZlkgPD0gLTAuMzUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudXAgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmRvd24gPSBmYWxzZTs7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudXAgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMuc3RpY2sub25VcC5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUucmlnaHQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gZmFsc2U7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5sZWZ0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gZmFsc2U7XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5maXJlYnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUuZmlyZSA9IHRydWU7XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5maXJlYnV0dG9uLm9uVXAuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmZpcmUgPSBmYWxzZTtcbiAgICB9LCB0aGlzKTtcbiAgICAvL3RoaXMuZ29idXR0b24ub25Eb3duLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gdHJ1ZTtcbiAgICAvL30sIHRoaXMpO1xuICAgIC8vdGhpcy5nb2J1dHRvbi5vblVwLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gZmFsc2U7XG4gICAgLy99LCB0aGlzKTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24ub25Eb3duLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS50cmFjdG9yID0gdHJ1ZTtcbiAgICB9LCB0aGlzKTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24ub25VcC5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudHJhY3RvciA9IGZhbHNlO1xuICAgIH0sIHRoaXMpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLmxheW91dFZpcnR1YWxDb250cm9scyA9IGZ1bmN0aW9uIChzY2FsZSkge1xuICAgIHZhciB5ID0gdGhpcy5nYW1lLmhlaWdodCAtIDEyNSAqIHNjYWxlO1xuICAgIHZhciB3ID0gdGhpcy5nYW1lLndpZHRoO1xuICAgIHRoaXMuc3RpY2sucG9zWCA9IDE1MCAqIHNjYWxlO1xuICAgIHRoaXMuc3RpY2sucG9zWSA9IHk7XG4gICAgdGhpcy5maXJlYnV0dG9uLnBvc1ggPSB3IC0gMjUwICogc2NhbGU7XG4gICAgdGhpcy5maXJlYnV0dG9uLnBvc1kgPSB5O1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5wb3NYID0gdyAtIDEyNSAqIHNjYWxlO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5wb3NZID0geTtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB1cCA9IGRvd24gPSBsZWZ0ID0gcmlnaHQgPSBmYWxzZTtcbiAgICB0aGlzLnF1ZXVlLmxlbmd0aCA9IDA7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUucHJlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFRPRE86IFN1cHBvcnQgb3RoZXIgaW50ZXJhY3Rpb25zL21ldGhvZHNcbiAgICB2YXIgY29udHJvbHMgPSB0aGlzLmNvbnRyb2xzO1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuam95c3RpY2tTdGF0ZTtcbiAgICBpZiAoKHN0YXRlLnVwIHx8IGNvbnRyb2xzLnVwLmlzRG93bikgJiYgIXVwKSB7XG4gICAgICAgIHVwID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndXBfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLnVwICYmICFjb250cm9scy51cC5pc0Rvd24gJiYgdXApIHtcbiAgICAgICAgdXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndXBfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKChzdGF0ZS5kb3duIHx8IGNvbnRyb2xzLmRvd24uaXNEb3duKSAmJiAhZG93bikge1xuICAgICAgICBkb3duID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZG93bl9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghc3RhdGUuZG93biAmJiAhY29udHJvbHMuZG93bi5pc0Rvd24gJiYgZG93bikge1xuICAgICAgICBkb3duID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2Rvd25fcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKChzdGF0ZS5yaWdodCB8fCBjb250cm9scy5yaWdodC5pc0Rvd24pICYmICFyaWdodCkge1xuICAgICAgICByaWdodCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3JpZ2h0X3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS5yaWdodCAmJiAhY29udHJvbHMucmlnaHQuaXNEb3duICYmIHJpZ2h0KSB7XG4gICAgICAgIHJpZ2h0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3JpZ2h0X3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUubGVmdCB8fCBjb250cm9scy5sZWZ0LmlzRG93bikgJiYgIWxlZnQpIHtcbiAgICAgICAgbGVmdCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2xlZnRfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLmxlZnQgJiYgIWNvbnRyb2xzLmxlZnQuaXNEb3duICYmIGxlZnQpIHtcbiAgICAgICAgbGVmdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdsZWZ0X3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUuZmlyZSB8fCBjb250cm9scy5maXJlLmlzRG93bikgJiYgIWZpcmUpIHtcbiAgICAgICAgZmlyZSA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2ZpcmVfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLmZpcmUgJiYgIWNvbnRyb2xzLmZpcmUuaXNEb3duICYmIGZpcmUpIHtcbiAgICAgICAgZmlyZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdmaXJlX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUudHJhY3RvciB8fCBjb250cm9scy50cmFjdG9yLmlzRG93bikgJiYgIXRyYWN0b3IpIHtcbiAgICAgICAgdHJhY3RvciA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3RyYWN0b3JfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKCFzdGF0ZS50cmFjdG9yICYmICFjb250cm9scy50cmFjdG9yLmlzRG93bikgJiYgdHJhY3Rvcikge1xuICAgICAgICB0cmFjdG9yID0gZmFsc2U7Ly9cbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndHJhY3Rvcl9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbn07XG5cbnZhciBhY3Rpb247ICAgICAgICAgICAgIC8vIE1vZHVsZSBzY29wZSB0byBhdm9pZCBhbGxvY2F0aW9uc1xuXG5Db250cm9scy5wcm90b3R5cGUucHJvY2Vzc1F1ZXVlID0gZnVuY3Rpb24gKGNiLCBjbGVhcikge1xuICAgIHZhciBxdWV1ZSA9IHRoaXMucXVldWU7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBxdWV1ZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgYWN0aW9uID0gcXVldWVbaV07XG4gICAgICAgIGlmIChhY3Rpb24uZXhlY3V0ZWQpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNiKGFjdGlvbik7XG4gICAgICAgIGFjdGlvbi5ldGltZSA9IHRoaXMuZ2FtZS50aW1lLm5vdztcbiAgICAgICAgYWN0aW9uLmV4ZWN1dGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGNsZWFyKSB7XG4gICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgfVxufTtcblxuU3RhcmNvZGVyLkNvbnRyb2xzID0gQ29udHJvbHM7XG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xzOyIsIi8qKlxuICogU3luY0NsaWVudC5qc1xuICpcbiAqIFN5bmMgcGh5c2ljcyBvYmplY3RzIHdpdGggc2VydmVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcbnZhciBVUERBVEVfUVVFVUVfTElNSVQgPSA4O1xuXG52YXIgU3luY0NsaWVudCA9IGZ1bmN0aW9uIChnYW1lLCBwYXJlbnQpIHtcbiAgICBQaGFzZXIuUGx1Z2luLmNhbGwodGhpcywgZ2FtZSwgcGFyZW50KTtcbn07XG5cblN5bmNDbGllbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuUGx1Z2luLnByb3RvdHlwZSk7XG5TeW5jQ2xpZW50LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN5bmNDbGllbnQ7XG5cblxuLyoqXG4gKiBJbml0aWFsaXplIHBsdWdpblxuICpcbiAqIEBwYXJhbSBzb2NrZXQge1NvY2tldH0gLSBzb2NrZXQuaW8gc29ja2V0IGZvciBzeW5jIGNvbm5lY3Rpb25cbiAqIEBwYXJhbSBxdWV1ZSB7QXJyYXl9IC0gY29tbWFuZCBxdWV1ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHNvY2tldCwgcXVldWUpIHtcbiAgICAvLyBUT0RPOiBDb3B5IHNvbWUgY29uZmlnIG9wdGlvbnNcbiAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcbiAgICB0aGlzLmNtZFF1ZXVlID0gcXVldWU7XG4gICAgdGhpcy5leHRhbnQgPSB7fTtcbn07XG5cbi8qKlxuICogU3RhcnQgcGx1Z2luXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgc3RhcmNvZGVyID0gdGhpcy5nYW1lLnN0YXJjb2RlcjtcbiAgICB0aGlzLl91cGRhdGVDb21wbGV0ZSA9IGZhbHNlO1xuICAgIC8vIEZJWE1FOiBOZWVkIG1vcmUgcm9idXN0IGhhbmRsaW5nIG9mIERDL1JDXG4gICAgdGhpcy5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5wYXVzZWQgPSB0cnVlO1xuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdyZWNvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5wYXVzZWQgPSBmYWxzZTtcbiAgICB9KTtcbiAgICAvLyBNZWFzdXJlIGNsaWVudC1zZXJ2ZXIgdGltZSBkZWx0YVxuICAgIHRoaXMuc29ja2V0Lm9uKCd0aW1lc3luYycsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHNlbGYuX2xhdGVuY3kgPSBkYXRhIC0gc2VsZi5nYW1lLnRpbWUubm93O1xuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICB2YXIgcmVhbFRpbWUgPSBkYXRhLnI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gZGF0YS5iLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdmFyIHVwZGF0ZSA9IGRhdGEuYltpXTtcbiAgICAgICAgICAgIHZhciBpZCA9IHVwZGF0ZS5pZDtcbiAgICAgICAgICAgIHZhciBzcHJpdGU7XG4gICAgICAgICAgICB1cGRhdGUudGltZXN0YW1wID0gcmVhbFRpbWU7XG4gICAgICAgICAgICBpZiAoc3ByaXRlID0gc2VsZi5leHRhbnRbaWRdKSB7XG4gICAgICAgICAgICAgICAgLy8gRXhpc3Rpbmcgc3ByaXRlIC0gcHJvY2VzcyB1cGRhdGVcbiAgICAgICAgICAgICAgICBzcHJpdGUudXBkYXRlUXVldWUucHVzaCh1cGRhdGUpO1xuICAgICAgICAgICAgICAgIGlmICh1cGRhdGUucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuY29uZmlnKHVwZGF0ZS5wcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNwcml0ZS51cGRhdGVRdWV1ZS5sZW5ndGggPiBVUERBVEVfUVVFVUVfTElNSVQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBOZXcgc3ByaXRlIC0gY3JlYXRlIGFuZCBjb25maWd1cmVcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdOZXcnLCBpZCwgdXBkYXRlLnQpO1xuICAgICAgICAgICAgICAgIHNwcml0ZSA9IHN0YXJjb2Rlci5hZGRCb2R5KHVwZGF0ZS50LCB1cGRhdGUpO1xuICAgICAgICAgICAgICAgIGlmIChzcHJpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNlcnZlcklkID0gaWQ7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZXh0YW50W2lkXSA9IHNwcml0ZTtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlID0gW3VwZGF0ZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDAsIGwgPSBkYXRhLnJtLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaWQgPSBkYXRhLnJtW2ldO1xuICAgICAgICAgICAgaWYgKHNlbGYuZXh0YW50W2lkXSkge1xuICAgICAgICAgICAgICAgIHN0YXJjb2Rlci5yZW1vdmVCb2R5KHNlbGYuZXh0YW50W2lkXSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHNlbGYuZXh0YW50W2lkXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLyoqXG4gKiBTZW5kIHF1ZXVlZCBjb21tYW5kcyB0byBzZXJ2ZXIgYW5kIGludGVycG9sYXRlIG9iamVjdHMgYmFzZWQgb24gdXBkYXRlcyBmcm9tIHNlcnZlclxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl91cGRhdGVDb21wbGV0ZSkge1xuICAgICAgICB0aGlzLl9zZW5kQ29tbWFuZHMoKTtcbiAgICAgICAgdGhpcy5fcHJvY2Vzc1BoeXNpY3NVcGRhdGVzKCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvbXBsZXRlID0gdHJ1ZTtcbiAgICB9XG4gfTtcblxuU3luY0NsaWVudC5wcm90b3R5cGUucG9zdFJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl91cGRhdGVDb21wbGV0ZSA9IGZhbHNlO1xufTtcblxuXG52YXIgYWN0aW9ucyA9IFtdOyAgICAgICAgICAgICAgIC8vIE1vZHVsZSBzY29wZSB0byBhdm9pZCBhbGxvY2F0aW9uc1xudmFyIGFjdGlvbjtcbi8qKlxuICogU2VuZCBxdWV1ZWQgY29tbWFuZHMgdGhhdCBoYXZlIGJlZW4gZXhlY3V0ZWQgdG8gdGhlIHNlcnZlclxuICpcbiAqIEBwcml2YXRlXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLl9zZW5kQ29tbWFuZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgYWN0aW9ucy5sZW5ndGggPSAwO1xuICAgIGZvciAodmFyIGkgPSB0aGlzLmNtZFF1ZXVlLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xuICAgICAgICBhY3Rpb24gPSB0aGlzLmNtZFF1ZXVlW2ldO1xuICAgICAgICBpZiAoYWN0aW9uLmV4ZWN1dGVkKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnVuc2hpZnQoYWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuY21kUXVldWUuc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdkbycsIGFjdGlvbnMpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdzZW5kaW5nIGFjdGlvbnMnLCBhY3Rpb25zKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgaW50ZXJwb2xhdGlvbiAvIHByZWRpY3Rpb24gcmVzb2x1dGlvbiBmb3IgcGh5c2ljcyBib2RpZXNcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5fcHJvY2Vzc1BoeXNpY3NVcGRhdGVzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpbnRlcnBUaW1lID0gdGhpcy5nYW1lLnRpbWUubm93ICsgdGhpcy5fbGF0ZW5jeSAtIHRoaXMuZ2FtZS5zdGFyY29kZXIuY29uZmlnLnJlbmRlckxhdGVuY3k7XG4gICAgdmFyIG9pZHMgPSBPYmplY3Qua2V5cyh0aGlzLmV4dGFudCk7XG4gICAgZm9yICh2YXIgaSA9IG9pZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIHNwcml0ZSA9IHRoaXMuZXh0YW50W29pZHNbaV1dO1xuICAgICAgICB2YXIgcXVldWUgPSBzcHJpdGUudXBkYXRlUXVldWU7XG4gICAgICAgIHZhciBiZWZvcmUgPSBudWxsLCBhZnRlciA9IG51bGw7XG5cbiAgICAgICAgLy8gRmluZCB1cGRhdGVzIGJlZm9yZSBhbmQgYWZ0ZXIgaW50ZXJwVGltZVxuICAgICAgICB2YXIgaiA9IDE7XG4gICAgICAgIHdoaWxlIChxdWV1ZVtqXSkge1xuICAgICAgICAgICAgaWYgKHF1ZXVlW2pdLnRpbWVzdGFtcCA+IGludGVycFRpbWUpIHtcbiAgICAgICAgICAgICAgICBhZnRlciA9IHF1ZXVlW2pdO1xuICAgICAgICAgICAgICAgIGJlZm9yZSA9IHF1ZXVlW2otMV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb25lIC0gd2UncmUgYmVoaW5kLlxuICAgICAgICBpZiAoIWJlZm9yZSAmJiAhYWZ0ZXIpIHtcbiAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPj0gMikgeyAgICAvLyBUd28gbW9zdCByZWNlbnQgdXBkYXRlcyBhdmFpbGFibGU/IFVzZSB0aGVtLlxuICAgICAgICAgICAgICAgIGJlZm9yZSA9IHF1ZXVlW3F1ZXVlLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgICAgIGFmdGVyID0gcXVldWVbcXVldWUubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnTGFnZ2luZycsIG9pZHNbaV0pO1xuICAgICAgICAgICAgfSBlbHNlIHsgICAgICAgICAgICAgICAgICAgIC8vIE5vPyBKdXN0IGJhaWxcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdCYWlsaW5nJywgb2lkc1tpXSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdPaycsIGludGVycFRpbWUsIHF1ZXVlLmxlbmd0aCk7XG4gICAgICAgICAgICBxdWV1ZS5zcGxpY2UoMCwgaiAtIDEpOyAgICAgLy8gVGhyb3cgb3V0IG9sZGVyIHVwZGF0ZXNcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzcGFuID0gYWZ0ZXIudGltZXN0YW1wIC0gYmVmb3JlLnRpbWVzdGFtcDtcbiAgICAgICAgdmFyIHQgPSAoaW50ZXJwVGltZSAtIGJlZm9yZS50aW1lc3RhbXApIC8gc3BhbjtcbiAgICAgICAgLy9pZiAodCA8IDAgfHwgdCA+IDEpIHtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coJ3dlaXJkIHRpbWUnLCB0KTtcbiAgICAgICAgLy99XG4gICAgICAgIHQgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCB0KSk7ICAgICAgICAvLyBGSVhNRTogU3RvcGdhcCBmaXggLSBTaG91bGRuJ3QgbmVlZCB0aGlzXG4gICAgICAgIHNwcml0ZS5zZXRQb3NBbmdsZShsaW5lYXIoYmVmb3JlLngsIGFmdGVyLngsIHQpLCBsaW5lYXIoYmVmb3JlLnksIGFmdGVyLnksIHQpLCBsaW5lYXIoYmVmb3JlLmEsIGFmdGVyLmEsIHQpKTtcbiAgICB9XG59O1xuXG4vLyBIZWxwZXJzXG5cbi8qKlxuICogSW50ZXJwb2xhdGUgYmV0d2VlbiB0d28gcG9pbnRzIHdpdGggaGVybWl0ZSBzcGxpbmVcbiAqIE5CIC0gY3VycmVudGx5IHVudXNlZCBhbmQgcHJvYmFibHkgYnJva2VuXG4gKlxuICogQHBhcmFtIHAwIHtudW1iZXJ9IC0gaW5pdGlhbCB2YWx1ZVxuICogQHBhcmFtIHAxIHtudW1iZXJ9IC0gZmluYWwgdmFsdWVcbiAqIEBwYXJhbSB2MCB7bnVtYmVyfSAtIGluaXRpYWwgc2xvcGVcbiAqIEBwYXJhbSB2MSB7bnVtYmVyfSAtIGZpbmFsIHNsb3BlXG4gKiBAcGFyYW0gdCB7bnVtYmVyfSAtIHBvaW50IG9mIGludGVycG9sYXRpb24gKGJldHdlZW4gMCBhbmQgMSlcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gaW50ZXJwb2xhdGVkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGhlcm1pdGUgKHAwLCBwMSwgdjAsIHYxLCB0KSB7XG4gICAgdmFyIHQyID0gdCp0O1xuICAgIHZhciB0MyA9IHQqdDI7XG4gICAgcmV0dXJuICgyKnQzIC0gMyp0MiArIDEpKnAwICsgKHQzIC0gMip0MiArIHQpKnYwICsgKC0yKnQzICsgMyp0MikqcDEgKyAodDMgLSB0MikqdjE7XG59XG5cbi8qKlxuICogSW50ZXJwb2xhdGUgYmV0d2VlbiB0d28gcG9pbnRzIHdpdGggbGluZWFyIHNwbGluZVxuICpcbiAqIEBwYXJhbSBwMCB7bnVtYmVyfSAtIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSBwMSB7bnVtYmVyfSAtIGZpbmFsIHZhbHVlXG4gKiBAcGFyYW0gdCB7bnVtYmVyfSAtIHBvaW50IG9mIGludGVycG9sYXRpb24gKGJldHdlZW4gMCBhbmQgMSlcbiAqIEBwYXJhbSBzY2FsZSB7bnVtYmVyfSAtIHNjYWxlIGZhY3RvciB0byBub3JtYWxpemUgdW5pdHNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gaW50ZXJwb2xhdGVkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGxpbmVhciAocDAsIHAxLCB0LCBzY2FsZSkge1xuICAgIHNjYWxlID0gc2NhbGUgfHwgMTtcbiAgICByZXR1cm4gcDAgKyAocDEgLSBwMCkqdCpzY2FsZTtcbn1cblxuU3RhcmNvZGVyLlNlcnZlclN5bmMgPSBTeW5jQ2xpZW50O1xubW9kdWxlLmV4cG9ydHMgPSBTeW5jQ2xpZW50OyIsIi8qKlxuICogQm9vdC5qc1xuICpcbiAqIEJvb3Qgc3RhdGUgZm9yIFN0YXJjb2RlclxuICogTG9hZCBhc3NldHMgZm9yIHByZWxvYWQgc2NyZWVuIGFuZCBjb25uZWN0IHRvIHNlcnZlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb250cm9scyA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvQ29udHJvbHMuanMnKTtcbnZhciBTeW5jQ2xpZW50ID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9TeW5jQ2xpZW50LmpzJyk7XG5cbnZhciBCb290ID0gZnVuY3Rpb24gKCkge307XG5cbkJvb3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbkJvb3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQm9vdDtcblxuLy92YXIgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuXG4vKipcbiAqIFNldCBwcm9wZXJ0aWVzIHRoYXQgcmVxdWlyZSBib290ZWQgZ2FtZSBzdGF0ZSwgYXR0YWNoIHBsdWdpbnMsIGNvbm5lY3QgdG8gZ2FtZSBzZXJ2ZXJcbiAqL1xuQm9vdC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnSW5pdCBCb290JywgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0KTtcbiAgICBjb25zb2xlLmxvZygnaXcgQm9vdCcsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQsIHNjcmVlbi53aWR0aCwgc2NyZWVuLmhlaWdodCwgd2luZG93LmRldmljZVBpeGVsUmF0aW8pO1xuICAgIC8vdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5SRVNJWkU7XG4gICAgdGhpcy5nYW1lLnJlbmRlcmVyLnJlbmRlclNlc3Npb24ucm91bmRQaXhlbHMgPSB0cnVlO1xuICAgIHRoaXMuZ2FtZS5zaGFyZWRHcmFwaGljcyA9IHRoaXMuZ2FtZS5tYWtlLmdyYXBoaWNzKCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBwU2NhbGUgPSB0aGlzLnN0YXJjb2Rlci5jb25maWcucGh5c2ljc1NjYWxlO1xuICAgIHZhciBpcFNjYWxlID0gMS9wU2NhbGU7XG4gICAgdmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5jb25maWcgPSB7XG4gICAgICAgIHB4bTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBpcFNjYWxlKmE7XG4gICAgICAgIH0sXG4gICAgICAgIG1weDogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBmbG9vcihwU2NhbGUqYSk7XG4gICAgICAgIH0sXG4gICAgICAgIHB4bWk6IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gLWlwU2NhbGUqYTtcbiAgICAgICAgfSxcbiAgICAgICAgbXB4aTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBmbG9vcigtcFNjYWxlKmEpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zZXJ2ZXJDb25uZWN0KCk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5jb250cm9scyA9IHRoaXMuZ2FtZS5wbHVnaW5zLmFkZChDb250cm9scyxcbiAgICAvLyAgICB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy90aGlzLmdhbWUuam95c3RpY2sgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oUGhhc2VyLlZpcnR1YWxKb3lzdGljayk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5jb250cm9scyA9IHRoaXMuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihDb250cm9scywgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIC8vIFNldCB1cCBzb2NrZXQuaW8gY29ubmVjdGlvblxuICAgIC8vdGhpcy5zdGFyY29kZXIuc29ja2V0ID0gdGhpcy5zdGFyY29kZXIuaW8odGhpcy5zdGFyY29kZXIuY29uZmlnLnNlcnZlclVyaSxcbiAgICAvLyAgICB0aGlzLnN0YXJjb2Rlci5jb25maWcuaW9DbGllbnRPcHRpb25zKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLnNvY2tldC5vbignc2VydmVyIHJlYWR5JywgZnVuY3Rpb24gKHBsYXllck1zZykge1xuICAgIC8vICAgIC8vIEZJWE1FOiBIYXMgdG8gaW50ZXJhY3Qgd2l0aCBzZXNzaW9uIGZvciBhdXRoZW50aWNhdGlvbiBldGMuXG4gICAgLy8gICAgc2VsZi5zdGFyY29kZXIucGxheWVyID0gcGxheWVyTXNnO1xuICAgIC8vICAgIC8vc2VsZi5zdGFyY29kZXIuc3luY2NsaWVudCA9IHNlbGYuZ2FtZS5wbHVnaW5zLmFkZChTeW5jQ2xpZW50LFxuICAgIC8vICAgIC8vICAgIHNlbGYuc3RhcmNvZGVyLnNvY2tldCwgc2VsZi5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIC8vICAgIHNlbGYuc3RhcmNvZGVyLnN5bmNjbGllbnQgPSBzZWxmLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oU3luY0NsaWVudCxcbiAgICAvLyAgICAgICAgc2VsZi5zdGFyY29kZXIuc29ja2V0LCBzZWxmLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy8gICAgX2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgLy99KTtcbn07XG5cbi8qKlxuICogUHJlbG9hZCBtaW5pbWFsIGFzc2V0cyBmb3IgcHJvZ3Jlc3Mgc2NyZWVuXG4gKi9cbkJvb3QucHJvdG90eXBlLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2Jhcl9sZWZ0JywgJ2Fzc2V0cy9pbWFnZXMvZ3JlZW5CYXJMZWZ0LnBuZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCdiYXJfbWlkJywgJ2Fzc2V0cy9pbWFnZXMvZ3JlZW5CYXJNaWQucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2Jhcl9yaWdodCcsICdhc3NldHMvaW1hZ2VzL2dyZWVuQmFyUmlnaHQucG5nJyk7XG59O1xuXG4vKipcbiAqIEtpY2sgaW50byBuZXh0IHN0YXRlIG9uY2UgaW5pdGlhbGl6YXRpb24gYW5kIHByZWxvYWRpbmcgYXJlIGRvbmVcbiAqL1xuQm9vdC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnbG9hZGVyJyk7XG59O1xuXG5Cb290LnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiAodywgaCkge1xuICAgIGNvbnNvbGUubG9nKCdycyBCb290JywgdywgaCk7XG59O1xuXG4vKipcbiAqIEFkdmFuY2UgZ2FtZSBzdGF0ZSBvbmNlIG5ldHdvcmsgY29ubmVjdGlvbiBpcyBlc3RhYmxpc2hlZFxuICovXG4vL0Jvb3QucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbi8vICAgIC8vIEZJWE1FOiBkb24ndCB3YWl0IGhlcmUgLSBzaG91bGQgYmUgaW4gY3JlYXRlXG4vLyAgICBpZiAodGhpcy5zdGFyY29kZXIuY29ubmVjdGVkKSB7XG4vLyAgICAgICAgLy90aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ3NwYWNlJyk7XG4vLyAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdsb2dpbicpO1xuLy8gICAgfVxuLy99O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb3Q7IiwiLyoqXG4gKiBMb2FkZXIuanNcbiAqXG4gKiBQaGFzZXIgc3RhdGUgdG8gcHJlbG9hZCBhc3NldHMgYW5kIGRpc3BsYXkgcHJvZ3Jlc3NcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTG9hZGVyID0gZnVuY3Rpb24gKCkge307XG5cbkxvYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuTG9hZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvYWRlcjtcblxuTG9hZGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEluaXQgYW5kIGRyYXcgc3RhcmZpZWxkXG4gICAgdGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSg2MDAsIDYwMCk7XG4gICAgdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZCh0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLmdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0LCB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQpO1xuXG4gICAgLy8gUG9zaXRpb24gcHJvZ3Jlc3MgYmFyXG4gICAgdmFyIGJhcldpZHRoID0gTWF0aC5mbG9vcigwLjQgKiB0aGlzLmdhbWUud2lkdGgpO1xuICAgIHZhciBvcmlnaW5YID0gKHRoaXMuZ2FtZS53aWR0aCAtIGJhcldpZHRoKS8yO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5nYW1lLmFkZC5pbWFnZShvcmlnaW5YLCB0aGlzLmdhbWUud29ybGQuY2VudGVyWSwgJ2Jhcl9sZWZ0Jyk7XG4gICAgbGVmdC5hbmNob3Iuc2V0VG8oMCwgMC41KTtcbiAgICB2YXIgbWlkID0gdGhpcy5nYW1lLmFkZC5pbWFnZShvcmlnaW5YICsgbGVmdC53aWR0aCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclksICdiYXJfbWlkJyk7XG4gICAgbWlkLmFuY2hvci5zZXRUbygwLCAwLjUpO1xuICAgIHZhciByaWdodCA9IHRoaXMuZ2FtZS5hZGQuaW1hZ2Uob3JpZ2luWCArIGxlZnQud2lkdGgsIHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJZLCAnYmFyX3JpZ2h0Jyk7XG4gICAgcmlnaHQuYW5jaG9yLnNldFRvKDAsIDAuNSk7XG4gICAgdmFyIG1pZFdpZHRoID0gYmFyV2lkdGggLSAyICogbGVmdC53aWR0aDtcbiAgICBtaWQud2lkdGggPSAwO1xuICAgIHZhciBsb2FkaW5nVGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dCh0aGlzLmdhbWUud29ybGQuY2VudGVyWCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclkgLSAzNiwgJ0xvYWRpbmcuLi4nLFxuICAgICAgICB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2ZmZmZmZicsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIGxvYWRpbmdUZXh0LmFuY2hvci5zZXRUbygwLjUpO1xuICAgIHZhciBwcm9nVGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dChvcmlnaW5YICsgbGVmdC53aWR0aCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclksICcwJScsXG4gICAgICAgIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmZmZmZmJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgcHJvZ1RleHQuYW5jaG9yLnNldFRvKDAuNSk7XG5cbiAgICB0aGlzLmdhbWUubG9hZC5vbkZpbGVDb21wbGV0ZS5hZGQoZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgIHZhciB3ID0gTWF0aC5mbG9vcihtaWRXaWR0aCAqIHByb2dyZXNzIC8gMTAwKTtcbiAgICAgICAgbWlkLndpZHRoID0gdztcbiAgICAgICAgcmlnaHQueCA9IG1pZC54ICsgdztcbiAgICAgICAgcHJvZ1RleHQuc2V0VGV4dChwcm9ncmVzcyArICclJyk7XG4gICAgICAgIHByb2dUZXh0LnggPSBtaWQueCArIHcvMjtcbiAgICB9LCB0aGlzKTtcbn07XG5cbkxvYWRlci5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPOiBIRCBhbmQgU0QgdmVyc2lvbnNcbiAgICAvLyBGb250c1xuICAgIHRoaXMuZ2FtZS5sb2FkLmJpdG1hcEZvbnQoJ3RpdGxlLWZvbnQnLFxuICAgICAgICAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC5wbmcnLCAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC54bWwnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KCdyZWFkb3V0LXllbGxvdycsXG4gICAgICAgICdhc3NldHMvYml0bWFwZm9udHMvaGVhdnkteWVsbG93MjQucG5nJywgJ2Fzc2V0cy9iaXRtYXBmb250cy9oZWF2eS15ZWxsb3cyNC54bWwnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygncGxheWVydGhydXN0JywgJ2Fzc2V0cy9zb3VuZHMvdGhydXN0TG9vcC5vZ2cnKTtcbiAgICAvLyBTb3VuZHNcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnY2hpbWUnLCAnYXNzZXRzL3NvdW5kcy9jaGltZS5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnbGV2ZWx1cCcsICdhc3NldHMvc291bmRzL2xldmVsdXAub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ3BsYW50dHJlZScsICdhc3NldHMvc291bmRzL3BsYW50dHJlZS5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnYmlncG9wJywgJ2Fzc2V0cy9zb3VuZHMvYmlncG9wLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdsaXR0bGVwb3AnLCAnYXNzZXRzL3NvdW5kcy9saXR0bGVwb3Aub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ3RhZ2dlZCcsICdhc3NldHMvc291bmRzL3RhZ2dlZC5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnbGFzZXInLCAnYXNzZXRzL3NvdW5kcy9sYXNlci5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnbXVzaWMnLCAnYXNzZXRzL3NvdW5kcy9pZ25vcmUub2dnJyk7XG4gICAgLy8gU3ByaXRlc2hlZXRzXG4gICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoJ2pveXN0aWNrJywgJ2Fzc2V0cy9qb3lzdGljay9nZW5lcmljLWpveXN0aWNrLnBuZycsICdhc3NldHMvam95c3RpY2svZ2VuZXJpYy1qb3lzdGljay5qc29uJyk7XG4gICAgLy8gSW1hZ2VzXG5cbn07XG5cbkxvYWRlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXJjb2Rlci5jb25uZWN0ZWQpIHtcbiAgICAgICAgLy90aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ3NwYWNlJyk7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnbG9naW4nKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRlcjsiLCIvKipcbiAqIExvZ2luLmpzXG4gKlxuICogU3RhdGUgZm9yIGRpc3BsYXlpbmcgbG9naW4gc2NyZWVuLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBMb2dpbiA9IGZ1bmN0aW9uICgpIHt9O1xuXG5Mb2dpbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuTG9naW4ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTG9naW47XG5cbkxvZ2luLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLnN0YXJjb2Rlci5zaG93TG9naW4oKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zb2NrZXQub24oJ2xvZ2dlZCBpbicsIGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgc2VsZi5zdGFyY29kZXIuaGlkZUxvZ2luKCk7XG4gICAgICAgIHNlbGYuc3RhcmNvZGVyLnBsYXllciA9IHBsYXllcjtcbiAgICAgICAgc2VsZi5nYW1lLnN0YXRlLnN0YXJ0KCdzcGFjZScpO1xuICAgIH0pO1xuICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldC5vbignbG9naW4gZmFpbHVyZScsIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICBzZWxmLnN0YXJjb2Rlci5zZXRMb2dpbkVycm9yKGVycm9yKTtcbiAgICB9KTtcbn07XG5cbi8vTG9naW4ucHJvdG90eXBlLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KCd0aXRsZS1mb250Jyxcbi8vICAgICAgICAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC5wbmcnLCAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC54bWwnKTtcbi8vfTtcblxuTG9naW4ucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uICh3LCBoKSB7XG4gICAgY29uc29sZS5sb2coJ3JzIExvZ2luJywgdywgaCk7XG59O1xuXG5Mb2dpbi5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vdmFyIHN0YXJmaWVsZCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEoNjAwLCA2MDApO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZCh0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLmdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0LCB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQpO1xuICAgIHZhciB0aXRsZSA9IHRoaXMuZ2FtZS5hZGQuYml0bWFwVGV4dCh0aGlzLmdhbWUud29ybGQuY2VudGVyWCwgMTI4LCAndGl0bGUtZm9udCcsICdTVEFSQ09ERVInKTtcbiAgICB0aXRsZS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2dpbjtcbiIsIi8qKlxuICogU3BhY2UuanNcbiAqXG4gKiBNYWluIGdhbWUgc3RhdGUgZm9yIFN0YXJjb2RlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9TaW1wbGVQYXJ0aWNsZS5qcycpO1xudmFyIFRocnVzdEdlbmVyYXRvciA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9UaHJ1c3RHZW5lcmF0b3IuanMnKTtcbnZhciBNaW5pTWFwID0gcmVxdWlyZSgnLi4vcGhhc2VydWkvTWluaU1hcC5qcycpO1xudmFyIExlYWRlckJvYXJkID0gcmVxdWlyZSgnLi4vcGhhc2VydWkvTGVhZGVyQm9hcmQuanMnKTtcbnZhciBUb2FzdCA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9Ub2FzdC5qcycpO1xuXG52YXIgQ29udHJvbHMgPSByZXF1aXJlKCcuLi9waGFzZXJwbHVnaW5zL0NvbnRyb2xzLmpzJyk7XG52YXIgU3luY0NsaWVudCA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvU3luY0NsaWVudC5qcycpO1xuXG52YXIgU3BhY2UgPSBmdW5jdGlvbiAoKSB7fTtcblxuU3BhY2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcblNwYWNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNwYWNlO1xuXG5TcGFjZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnN0YXJjb2Rlci5jb250cm9scyA9IHRoaXMuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihDb250cm9scywgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIHRoaXMuc3RhcmNvZGVyLnN5bmNjbGllbnQgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oU3luY0NsaWVudCxcbiAgICAgICAgdGhpcy5zdGFyY29kZXIuc29ja2V0LCB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgdGhpcy5zdGFnZS5kaXNhYmxlVmlzaWJpbGl0eUNoYW5nZSA9IHRydWU7XG59O1xuXG5TcGFjZS5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUodGhpcy5nYW1lLCBUaHJ1c3RHZW5lcmF0b3IudGV4dHVyZUtleSwgJyNmZjY2MDAnLCA4KTtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUodGhpcy5nYW1lLCAnYnVsbGV0JywgJyM5OTk5OTknLCA0KTtcbiAgICBTaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUodGhpcy5nYW1lLCAndHJhY3RvcicsICcjZWVlZWVlJywgOCwgdHJ1ZSk7XG4gICAgLy90aGlzLmdhbWUubG9hZC5hdWRpbygncGxheWVydGhydXN0JywgJ2Fzc2V0cy9zb3VuZHMvdGhydXN0TG9vcC5vZ2cnKTtcbiAgICAvL3RoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdjaGltZScsICdhc3NldHMvc291bmRzL2NoaW1lLm1wMycpO1xuICAgIC8vdGhpcy5nYW1lLmxvYWQuYXRsYXMoJ2pveXN0aWNrJywgJ2Fzc2V0cy9qb3lzdGljay9nZW5lcmljLWpveXN0aWNrLnBuZycsICdhc3NldHMvam95c3RpY2svZ2VuZXJpYy1qb3lzdGljay5qc29uJyk7XG4gICAgLy90aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KCdyZWFkb3V0LXllbGxvdycsXG4gICAgLy8gICAgJ2Fzc2V0cy9iaXRtYXBmb250cy9oZWF2eS15ZWxsb3cyNC5wbmcnLCAnYXNzZXRzL2JpdG1hcGZvbnRzL2hlYXZ5LXllbGxvdzI0LnhtbCcpO1xufTtcblxuU3BhY2UucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnU3BhY2Ugc2l6ZScsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIDEpO1xuICAgIC8vY29uc29sZS5sb2coJ2NyZWF0ZScpO1xuICAgIC8vdmFyIHJuZyA9IHRoaXMuZ2FtZS5ybmQ7XG4gICAgdmFyIHdiID0gdGhpcy5zdGFyY29kZXIuY29uZmlnLndvcmxkQm91bmRzO1xuICAgIHZhciBwcyA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5waHlzaWNzU2NhbGU7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuUDJKUyk7XG4gICAgdGhpcy53b3JsZC5zZXRCb3VuZHMuY2FsbCh0aGlzLndvcmxkLCB3YlswXSpwcywgd2JbMV0qcHMsICh3YlsyXS13YlswXSkqcHMsICh3YlszXS13YlsxXSkqcHMpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLnAyLnNldEJvdW5kc1RvV29ybGQodHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgLy8gRGVidWdnaW5nXG4gICAgLy90aGlzLmdhbWUudGltZS5hZHZhbmNlZFRpbWluZyA9IHRydWU7XG5cbiAgICAvLyBTZXQgdXAgRE9NXG4gICAgdGhpcy5zdGFyY29kZXIubGF5b3V0RE9NU3BhY2VTdGF0ZSgpO1xuXG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMucmVzZXQoKTtcblxuICAgIC8vIFZpcnR1YWwgam95c3RpY2tcbiAgICB0aGlzLnN0YXJjb2Rlci5jb250cm9scy5hZGRWaXJ0dWFsQ29udHJvbHMoJ2pveXN0aWNrJyk7XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzID0ge307XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzLnN0aWNrID0gdGhpcy5nYW1lLmpveXN0aWNrLmFkZFN0aWNrKFxuICAgIC8vICAgIHRoaXMuZ2FtZS53aWR0aCAtIDE1MCwgdGhpcy5nYW1lLmhlaWdodCAtIDc1LCAxMDAsICdqb3lzdGljaycpO1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5zdGljay5zY2FsZSA9IDAuNTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuZmlyZWJ1dHRvbiA9IHRoaXMuZ2FtZS5qb3lzdGljay5hZGRCdXR0b24odGhpcy5nYW1lLndpZHRoIC0gNTAsIHRoaXMuZ2FtZS5oZWlnaHQgLSA3NSxcbiAgICAvLyAgICAnam95c3RpY2snLCAnYnV0dG9uMS11cCcsICdidXR0b24xLWRvd24nKTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuZmlyZWJ1dHRvbi5zY2FsZSA9IDAuNTtcblxuICAgIC8vIFNvdW5kc1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMgPSB7fTtcbiAgICB0aGlzLmdhbWUuc291bmRzLnBsYXllcnRocnVzdCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ3BsYXllcnRocnVzdCcsIDEsIHRydWUpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMuY2hpbWUgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdjaGltZScsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLnBsYW50dHJlZSA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ3BsYW50dHJlZScsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLmJpZ3BvcCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ2JpZ3BvcCcsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLmxpdHRsZXBvcCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ2xpdHRsZXBvcCcsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLnRhZ2dlZCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ3RhZ2dlZCcsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLmxhc2VyID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgnbGFzZXInLCAxLCBmYWxzZSk7XG5cbiAgICB0aGlzLmdhbWUuc291bmRzLm11c2ljID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgnbXVzaWMnLCAxLCB0cnVlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLm11c2ljLnBsYXkoKTtcblxuICAgIC8vIEJhY2tncm91bmRcbiAgICAvL3ZhciBzdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLmRyYXdTdGFyRmllbGQoc3RhcmZpZWxkLmN0eCwgNjAwLCAxNik7XG4gICAgdGhpcy5nYW1lLmFkZC50aWxlU3ByaXRlKHdiWzBdKnBzLCB3YlsxXSpwcywgKHdiWzJdLXdiWzBdKSpwcywgKHdiWzNdLXdiWzFdKSpwcywgdGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkKTtcblxuICAgIHRoaXMuc3RhcmNvZGVyLnN5bmNjbGllbnQuc3RhcnQoKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLnNvY2tldC5lbWl0KCdjbGllbnQgcmVhZHknKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zb2NrZXQuZW1pdCgncmVhZHknKTtcbiAgICB0aGlzLl9zZXR1cE1lc3NhZ2VIYW5kbGVycyh0aGlzLnN0YXJjb2Rlci5zb2NrZXQpO1xuXG4gICAgLy8gR3JvdXBzIGZvciBwYXJ0aWNsZSBlZmZlY3RzXG4gICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvciA9IG5ldyBUaHJ1c3RHZW5lcmF0b3IodGhpcy5nYW1lKTtcblxuICAgIC8vIEdyb3VwIGZvciBnYW1lIG9iamVjdHNcbiAgICB0aGlzLmdhbWUucGxheWZpZWxkID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuXG4gICAgLy8gVUlcbiAgICB0aGlzLmdhbWUudWkgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgdGhpcy5nYW1lLnVpLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuXG4gICAgLy8gSW52ZW50b3J5IC0gdGlua2VyIHdpdGggcG9zaXRpb25cbiAgICB2YXIgbGFiZWwgPSB0aGlzLmdhbWUubWFrZS50ZXh0KHRoaXMuZ2FtZS53aWR0aCAvIDIsIDI1LCAnSU5WRU5UT1JZJyxcbiAgICAgICAge2ZvbnQ6ICcyNHB4IEFyaWFsJywgZmlsbDogJyNmZjk5MDAnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICBsYWJlbC5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuZ2FtZS51aS5hZGQobGFiZWwpO1xuICAgIC8vdGhpcy5nYW1lLmludmVudG9yeXRleHQgPSB0aGlzLmdhbWUubWFrZS50ZXh0KHRoaXMuZ2FtZS53aWR0aCAtIDEwMCwgNTAsICcwIGNyeXN0YWxzJyxcbiAgICAvLyAgICB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2NjYzAwMCcsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIHRoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0ID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwVGV4dCh0aGlzLmdhbWUud2lkdGggLyAyLCA1MCwgJ3JlYWRvdXQteWVsbG93JywgJzAnKTtcbiAgICB0aGlzLmdhbWUuaW52ZW50b3J5dGV4dC5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIHRoaXMuZ2FtZS51aS5hZGQodGhpcy5nYW1lLmludmVudG9yeXRleHQpO1xuXG4gICAgLy8gTWluaU1hcFxuICAgIHRoaXMuZ2FtZS5taW5pbWFwID0gbmV3IE1pbmlNYXAodGhpcy5nYW1lLCAzMDAsIDMwMCk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZCh0aGlzLmdhbWUubWluaW1hcCk7XG4gICAgdGhpcy5nYW1lLm1pbmltYXAueCA9IDEwO1xuICAgIHRoaXMuZ2FtZS5taW5pbWFwLnkgPSAxMDtcblxuICAgIC8vIExlYWRlcmJvYXJkXG4gICAgdGhpcy5nYW1lLmxlYWRlcmJvYXJkID0gbmV3IExlYWRlckJvYXJkKHRoaXMuZ2FtZSwgdGhpcy5zdGFyY29kZXIucGxheWVyTWFwLCAyMDAsIDMwMCk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZCh0aGlzLmdhbWUubGVhZGVyYm9hcmQpO1xuICAgIHRoaXMuZ2FtZS5sZWFkZXJib2FyZC54ID0gdGhpcy5nYW1lLndpZHRoIC0gMjAwO1xuICAgIHRoaXMuZ2FtZS5sZWFkZXJib2FyZC55ID0gMDtcbiAgICB0aGlzLmdhbWUubGVhZGVyYm9hcmQudmlzaWJsZSA9IGZhbHNlO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIEhlbHBlcnNcbiAgICAvL2Z1bmN0aW9uIHJhbmRvbU5vcm1hbCAoKSB7XG4gICAgLy8gICAgdmFyIHQgPSAwO1xuICAgIC8vICAgIGZvciAodmFyIGk9MDsgaTw2OyBpKyspIHtcbiAgICAvLyAgICAgICAgdCArPSBybmcubm9ybWFsKCk7XG4gICAgLy8gICAgfVxuICAgIC8vICAgIHJldHVybiB0LzY7XG4gICAgLy99XG4gICAgLy9cbiAgICAvL2Z1bmN0aW9uIGRyYXdTdGFyIChjdHgsIHgsIHksIGQsIGNvbG9yKSB7XG4gICAgLy8gICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgLy8gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIC8vICAgIGN0eC5tb3ZlVG8oeC1kKzEsIHktZCsxKTtcbiAgICAvLyAgICBjdHgubGluZVRvKHgrZC0xLCB5K2QtMSk7XG4gICAgLy8gICAgY3R4Lm1vdmVUbyh4LWQrMSwgeStkLTEpO1xuICAgIC8vICAgIGN0eC5saW5lVG8oeCtkLTEsIHktZCsxKTtcbiAgICAvLyAgICBjdHgubW92ZVRvKHgsIHktZCk7XG4gICAgLy8gICAgY3R4LmxpbmVUbyh4LCB5K2QpO1xuICAgIC8vICAgIGN0eC5tb3ZlVG8oeC1kLCB5KTtcbiAgICAvLyAgICBjdHgubGluZVRvKHgrZCwgeSk7XG4gICAgLy8gICAgY3R4LnN0cm9rZSgpO1xuICAgIC8vfVxuICAgIC8vXG4gICAgLy9mdW5jdGlvbiBkcmF3U3RhckZpZWxkIChjdHgsIHNpemUsIG4pIHtcbiAgICAvLyAgICB2YXIgeG0gPSBNYXRoLnJvdW5kKHNpemUvMiArIHJhbmRvbU5vcm1hbCgpKnNpemUvNCk7XG4gICAgLy8gICAgdmFyIHltID0gTWF0aC5yb3VuZChzaXplLzIgKyByYW5kb21Ob3JtYWwoKSpzaXplLzQpO1xuICAgIC8vICAgIHZhciBxdWFkcyA9IFtbMCwwLHhtLTEseW0tMV0sIFt4bSwwLHNpemUtMSx5bS0xXSxcbiAgICAvLyAgICAgICAgWzAseW0seG0tMSxzaXplLTFdLCBbeG0seW0sc2l6ZS0xLHNpemUtMV1dO1xuICAgIC8vICAgIHZhciBjb2xvcjtcbiAgICAvLyAgICB2YXIgaSwgaiwgbCwgcTtcbiAgICAvL1xuICAgIC8vICAgIG4gPSBNYXRoLnJvdW5kKG4vNCk7XG4gICAgLy8gICAgZm9yIChpPTAsIGw9cXVhZHMubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgIC8vICAgICAgICBxID0gcXVhZHNbaV07XG4gICAgLy8gICAgICAgIGZvciAoaj0wOyBqPG47IGorKykge1xuICAgIC8vICAgICAgICAgICAgY29sb3IgPSAnaHNsKDYwLDEwMCUsJyArIHJuZy5iZXR3ZWVuKDkwLDk5KSArICclKSc7XG4gICAgLy8gICAgICAgICAgICBkcmF3U3RhcihjdHgsXG4gICAgLy8gICAgICAgICAgICAgICAgcm5nLmJldHdlZW4ocVswXSs3LCBxWzJdLTcpLCBybmcuYmV0d2VlbihxWzFdKzcsIHFbM10tNyksXG4gICAgLy8gICAgICAgICAgICAgICAgcm5nLmJldHdlZW4oMiw0KSwgY29sb3IpO1xuICAgIC8vICAgICAgICB9XG4gICAgLy8gICAgfVxuICAgIC8vfVxuXG59O1xuXG5TcGFjZS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gKHcsIGgpIHtcbiAgICBjb25zb2xlLmxvZygncnMgU3BhY2UnLCB3LCBoKTtcbn07XG5cblNwYWNlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gRklYTUU6IGp1c3QgYSBtZXNzIGZvciB0ZXN0aW5nXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzLnByb2Nlc3NRdWV1ZShmdW5jdGlvbiAoYSkge1xuICAgICAgICBpZiAoYS50eXBlID09PSAndXBfcHJlc3NlZCcpIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLmxvY2FsU3RhdGUudGhydXN0ID0gJ3N0YXJ0aW5nJztcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QucGxheSgpO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUudGhydXN0Z2VuZXJhdG9yLnN0YXJ0T24oc2VsZi5nYW1lLnBsYXllclNoaXApO1xuICAgICAgICB9IGVsc2UgaWYgKGEudHlwZSA9PT0gJ3VwX3JlbGVhc2VkJykge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnBsYXllclNoaXAubG9jYWxTdGF0ZS50aHJ1c3QgPSAnc2h1dGRvd24nO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUuc291bmRzLnBsYXllcnRocnVzdC5zdG9wKCk7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RvcE9uKHNlbGYuZ2FtZS5wbGF5ZXJTaGlwKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuU3BhY2UucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2NvbnNvbGUubG9nKCcrcmVuZGVyKycpO1xuICAgIC8vaWYgKHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUpIHtcbiAgICAvLyAgICB2YXIgZCA9IHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUucG9zaXRpb24ueCAtIHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUucHJldmlvdXNQb3NpdGlvbi54O1xuICAgIC8vICAgIGNvbnNvbGUubG9nKCdEZWx0YScsIGQsIHRoaXMuZ2FtZS50aW1lLmVsYXBzZWQsIGQgLyB0aGlzLmdhbWUudGltZS5lbGFwc2VkKTtcbiAgICAvL31cbiAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpO1xuICAgIC8vdGhpcy5nYW1lLmRlYnVnLnRleHQoJ0ZwczogJyArIHRoaXMuZ2FtZS50aW1lLmZwcywgNSwgMjApO1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5zdGljay5kZWJ1Zyh0cnVlLCB0cnVlKTtcbiAgICAvL3RoaXMuZ2FtZS5kZWJ1Zy5jYW1lcmFJbmZvKHRoaXMuZ2FtZS5jYW1lcmEsIDEwMCwgMjApO1xuICAgIC8vaWYgKHRoaXMuc2hpcCkge1xuICAgIC8vICAgIHRoaXMuZ2FtZS5kZWJ1Zy5zcHJpdGVJbmZvKHRoaXMuc2hpcCwgNDIwLCAyMCk7XG4gICAgLy99XG59O1xuXG5TcGFjZS5wcm90b3R5cGUuX3NldHVwTWVzc2FnZUhhbmRsZXJzID0gZnVuY3Rpb24gKHNvY2tldCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzb2NrZXQub24oJ21zZyBjcnlzdGFsIHBpY2t1cCcsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5jaGltZS5wbGF5KCk7XG4gICAgICAgIFRvYXN0LnNwaW5VcChzZWxmLmdhbWUsIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLngsIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLnksICcrJyArIHZhbCArICcgY3J5c3RhbHMhJyk7XG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCdtc2cgcGxhbnQgdHJlZScsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5wbGFudHRyZWUucGxheSgpO1xuICAgIH0pO1xuICAgIHNvY2tldC5vbignbXNnIGFzdGVyb2lkIHBvcCcsIGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICAgIGlmIChzaXplID4gMSkge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5iaWdwb3AucGxheSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5saXR0bGVwb3AucGxheSgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCdtc2cgdGFnZ2VkJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBzZWxmLmdhbWUuc291bmRzLnRhZ2dlZC5wbGF5KCk7XG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCdtc2cgbGFzZXInLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMubGFzZXIucGxheSgpO1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGFjZTtcbiIsIi8qKlxuICogTGVhZGVyQm9hcmQuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTGVhZGVyQm9hcmQgPSBmdW5jdGlvbiAoZ2FtZSwgcGxheWVybWFwLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSk7XG4gICAgdGhpcy5wbGF5ZXJNYXAgPSBwbGF5ZXJtYXA7XG4gICAgdGhpcy5vcGVuID0gdHJ1ZTtcbiAgICB0aGlzLm1haW5XaWR0aCA9IHdpZHRoO1xuICAgIHRoaXMubWFpbkhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmljb25TaXplID0gMjQ7ICAgICAgICAgLy8gTWFrZSByZXNwb25zaXZlP1xuICAgIHRoaXMuZm9udFNpemUgPSAxODtcbiAgICB0aGlzLm51bUxpbmVzID0gTWF0aC5mbG9vcigoaGVpZ2h0IC0gdGhpcy5pY29uU2l6ZSAtIDIpIC8gKHRoaXMuZm9udFNpemUgKyAyKSk7XG5cbiAgICB0aGlzLm1haW4gPSBnYW1lLm1ha2UuZ3JvdXAoKTtcbiAgICB0aGlzLm1haW4ucGl2b3Quc2V0VG8od2lkdGgsIDApO1xuICAgIHRoaXMubWFpbi54ID0gd2lkdGg7XG4gICAgdGhpcy5hZGQodGhpcy5tYWluKTtcblxuICAgIC8vIEJhY2tncm91bmRcbiAgICB2YXIgYml0bWFwID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSh3aWR0aCwgaGVpZ2h0KTtcbiAgICBiaXRtYXAuY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDEyOCwgMTI4LCAxMjgsIDAuMjUpJztcbiAgICAvL2JpdG1hcC5jdHguZmlsbFN0eWxlID0gJyM5OTk5OTknO1xuICAgIC8vYml0bWFwLmN0eC5nbG9iYWxBbHBoYSA9IDAuNTtcbiAgICBiaXRtYXAuY3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIC8vdGhpcy5ib2FyZCA9IG5ldyBQaGFzZXIuU3ByaXRlKGdhbWUsIHdpZHRoLCAwLCB0aGlzLmJpdG1hcCk7XG4gICAgLy90aGlzLmJvYXJkLnBpdm90LnNldFRvKHdpZHRoLCAwKTtcbiAgICB0aGlzLm1haW4uYWRkKG5ldyBQaGFzZXIuU3ByaXRlKGdhbWUsIDAsIDAsIGJpdG1hcCkpO1xuXG4gICAgLy8gVGl0bGVcbiAgICB0aGlzLnRpdGxlID0gZ2FtZS5tYWtlLnRleHQoKHdpZHRoIC0gdGhpcy5pY29uU2l6ZSkgLyAyLCA0LCAnVGFncycsXG4gICAgICAgIHtmb250OiAnMjBweCBBcmlhbCBib2xkJywgYWxpZ246ICdjZW50ZXInLCBmaWxsOiAnI2ZmMDAwMCd9KTtcbiAgICB0aGlzLnRpdGxlLmFuY2hvci5zZXRUbygwLjUsIDApO1xuICAgIHRoaXMubWFpbi5hZGQodGhpcy50aXRsZSk7XG5cbiAgICAvLyBEaXNwbGF5IGxpbmVzXG4gICAgdGhpcy5saW5lcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5udW1MaW5lczsgaSsrKSB7XG4gICAgICAgIHZhciBsaW5lID0gZ2FtZS5tYWtlLnRleHQoNCwgdGhpcy5pY29uU2l6ZSArIDIgKyBpICogKHRoaXMuZm9udFNpemUgKyAyKSxcbiAgICAgICAgICAgICctJywge2ZvbnQ6ICcxOHB4IEFyaWFsJywgZmlsbDogJyMwMDAwZmYnfSk7XG4gICAgICAgIGxpbmUua2lsbCgpO1xuICAgICAgICB0aGlzLmxpbmVzLnB1c2gobGluZSk7XG4gICAgICAgIHRoaXMubWFpbi5hZGQobGluZSk7XG4gICAgfVxuXG4gICAgLy8gVG9nZ2xlIGJ1dHRvblxuICAgIHZhciBidXR0b24gPSB0aGlzLm1ha2VCdXR0b24oKTsgICAgICAgLy8gR29vZCBkaW1lbnNpb25zIFRCRC4gTWFrZSByZXNwb25zaXZlP1xuICAgIGJ1dHRvbi5hbmNob3Iuc2V0VG8oMSwgMCk7ICAgICAgLy8gdXBwZXIgcmlnaHQ7XG4gICAgYnV0dG9uLnggPSB3aWR0aDtcbiAgICAvL2J1dHRvbi55ID0gMDtcbiAgICBidXR0b24uaW5wdXRFbmFibGVkID0gdHJ1ZTtcbiAgICBidXR0b24uZXZlbnRzLm9uSW5wdXREb3duLmFkZCh0aGlzLnRvZ2dsZURpc3BsYXksIHRoaXMpO1xuICAgIHRoaXMuYWRkKGJ1dHRvbik7XG5cbiAgICAvLy8vIExpc3RcbiAgICAvL3RoaXMubGlzdCA9IGdhbWUubWFrZS5ncm91cCgpO1xuICAgIC8vdGhpcy5saXN0LnggPSB3aWR0aDtcbiAgICAvL3RoaXMubGlzdC55ID0gMDtcbiAgICAvL3RoaXMubGlzdC5waXZvdC5zZXRUbyh3aWR0aCwgMCk7XG4gICAgLy90aGlzLnR3ZWVuID0gZ2FtZS50d2VlbnMuY3JlYXRlKHRoaXMuYm9hcmQuc2NhbGUpO1xuICAgIC8vXG4gICAgLy90aGlzLmFkZCh0aGlzLmxpc3QpO1xuICAgIC8vLy8gdGVzdGluZ1xuICAgIC8vdmFyIHQgPSBbJ3RpZ2VyIHByaW5jZXNzJywgJ25pbmphIGxhc2VyJywgJ3JvYm90IGZpc2gnLCAncG90YXRvIHB1cHB5JywgJ3ZhbXBpcmUgcXVpY2hlJywgJ3dpemFyZCBwYXN0YSddO1xuICAgIC8vZm9yICh2YXIgaSA9IDA7IGkgPCB0Lmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gICAgdmFyIHRleHQgPSBnYW1lLm1ha2UudGV4dCgyLCBpKjE2LCB0W2ldLCB7Zm9udDogJzE0cHggQXJpYWwnLCBmaWxsOiAnIzAwMDBmZid9KTtcbiAgICAvLyAgICB0aGlzLmxpc3QuYWRkKHRleHQpO1xuICAgIC8vfVxufTtcblxuTGVhZGVyQm9hcmQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbkxlYWRlckJvYXJkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExlYWRlckJvYXJkO1xuXG5MZWFkZXJCb2FyZC5wcm90b3R5cGUubWFrZUJ1dHRvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdW5pdCA9IHRoaXMuaWNvblNpemUgLyA1O1xuICAgIHZhciB0ZXh0dXJlID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSh0aGlzLmljb25TaXplLCB0aGlzLmljb25TaXplKTtcbiAgICB2YXIgY3R4ID0gdGV4dHVyZS5jdHg7XG4gICAgLy8gRHJhdyBxdWFydGVyIGNpcmNsZVxuICAgIGN0eC5maWxsU3R5bGUgPSAnI2ZmZmZmZic7XG4gICAgLy9jdHguZ2xvYmFsQWxwaGEgPSAwLjU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8odGhpcy5pY29uU2l6ZSwgMCk7XG4gICAgY3R4LmxpbmVUbygwLCAwKTtcbiAgICBjdHguYXJjKHRoaXMuaWNvblNpemUsIDAsIHRoaXMuaWNvblNpemUsIE1hdGguUEksIDMgKiBNYXRoLlBJIC8gMiwgdHJ1ZSk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICAvLyBEcmF3IHN0ZXBzXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJyMwMDAwMDAnO1xuICAgIC8vY3R4Lmdsb2JhbEFscGhhID0gMTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbygxLjUqdW5pdCwgMyp1bml0KTtcbiAgICBjdHgubGluZVRvKDEuNSp1bml0LCAyKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oMi41KnVuaXQsIDIqdW5pdCk7XG4gICAgY3R4LmxpbmVUbygyLjUqdW5pdCwgMSp1bml0KTtcbiAgICBjdHgubGluZVRvKDMuNSp1bml0LCAxKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oMy41KnVuaXQsIDIqdW5pdCk7XG4gICAgY3R4LmxpbmVUbyg0LjUqdW5pdCwgMip1bml0KTtcbiAgICBjdHgubGluZVRvKDQuNSp1bml0LCAzKnVuaXQpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgcmV0dXJuIG5ldyBQaGFzZXIuU3ByaXRlKHRoaXMuZ2FtZSwgMCwgMCwgdGV4dHVyZSk7XG59O1xuXG5MZWFkZXJCb2FyZC5wcm90b3R5cGUuc2V0Q29udGVudCA9IGZ1bmN0aW9uICh0aXRsZSwgbGlzdCwgcGxheWVyaWQpIHtcbiAgICB0aGlzLnRpdGxlLnNldFRleHQodGl0bGUpO1xuICAgIHZhciBwbGF5ZXJWaXNpYmxlID0gZmFsc2U7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm51bUxpbmVzOyBpKyspIHtcbiAgICAgICAgdmFyIHBpZCA9IGxpc3RbaV0gJiYgbGlzdFtpXS5pZDtcbiAgICAgICAgaWYgKHBpZCAmJiB0aGlzLnBsYXllck1hcFtwaWRdKSB7XG4gICAgICAgICAgICB2YXIgdGFnID0gdGhpcy5wbGF5ZXJNYXBbcGlkXS50YWc7XG4gICAgICAgICAgICB2YXIgbGluZSA9IHRoaXMubGluZXNbaV07XG4gICAgICAgICAgICBsaW5lLnNldFRleHQoKGkgKyAxKSArICcuICcgKyB0YWcgKyAnICgnICsgbGlzdFtpXS52YWwgKyAnKScpO1xuICAgICAgICAgICAgaWYgKHBpZCA9PT0gcGxheWVyaWQpIHtcbiAgICAgICAgICAgICAgICBsaW5lLmZvbnRXZWlnaHQgPSAnYm9sZCc7XG4gICAgICAgICAgICAgICAgcGxheWVyVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpbmUuZm9udFdlaWdodCA9ICdub3JtYWwnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGluZS5yZXZpdmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubGluZXNbaV0ua2lsbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFBsYXllciBub3QgaW4gdG9wIE5cbiAgICBpZiAoIXBsYXllclZpc2libGUpIHtcbiAgICAgICAgZm9yIChpID0gdGhpcy5udW1MaW5lczsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChsaXN0W2ldLmlkID09PSBwbGF5ZXJpZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEZvdW5kIC0gZGlzcGxheSBhdCBlbmRcbiAgICAgICAgaWYgKGkgPCBsaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgbGluZVt0aGlzLm51bUxpbmVzIC0gMV0uc2V0VGV4dCgoaSArIDEpICsgJy4gJyArIHRoaXMucGxheWVyTWFwW3BsYXllcmlkXSArICcgKCcgKyBsaXN0W2ldLnZhbCArICcpJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5MZWFkZXJCb2FyZC5wcm90b3R5cGUudG9nZ2xlRGlzcGxheSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuZ2FtZS50d2VlbnMuaXNUd2VlbmluZyh0aGlzLm1haW4uc2NhbGUpKSB7XG4gICAgICAgIGlmICh0aGlzLm9wZW4pIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5hZGQudHdlZW4odGhpcy5tYWluLnNjYWxlKS50byh7eDogMCwgeTogMH0sIDUwMCwgUGhhc2VyLkVhc2luZy5RdWFkcmF0aWMuT3V0LCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzLm1haW4uc2NhbGUpLnRvKHt4OiAxLCB5OiAxfSwgNTAwLCBQaGFzZXIuRWFzaW5nLlF1YWRyYXRpYy5PdXQsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5vcGVuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTGVhZGVyQm9hcmQ7IiwiLyoqXG4gKiBNaW5pTWFwLmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIE1pbmlNYXAgPSBmdW5jdGlvbiAoZ2FtZSwgd2lkdGgsIGhlaWdodCkge1xuICAgIFBoYXNlci5Hcm91cC5jYWxsKHRoaXMsIGdhbWUpO1xuXG4gICAgdmFyIHhyID0gd2lkdGggLyB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlcldpZHRoO1xuICAgIHZhciB5ciA9IGhlaWdodCAvIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VySGVpZ2h0O1xuICAgIGlmICh4ciA8PSB5cikge1xuICAgICAgICB0aGlzLm1hcFNjYWxlID0geHI7XG4gICAgICAgIHRoaXMueE9mZnNldCA9IC14ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyTGVmdDtcbiAgICAgICAgdGhpcy55T2Zmc2V0ID0gLXhyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJUb3AgKyAoaGVpZ2h0IC0geHIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckhlaWdodCkgLyAyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubWFwU2NhbGUgPSB5cjtcbiAgICAgICAgdGhpcy55T2Zmc2V0ID0gLXlyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJUb3A7XG4gICAgICAgIHRoaXMueE9mZnNldCA9IC15ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyTGVmdCArICh3aWR0aCAtIHlyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJXaWR0aCkgLyAyO1xuICAgIH1cblxuICAgIHRoaXMuZ3JhcGhpY3MgPSBnYW1lLm1ha2UuZ3JhcGhpY3MoMCwgMCk7XG4gICAgdGhpcy5ncmFwaGljcy5iZWdpbkZpbGwoMHhmZmZmMDAsIDAuMik7XG4gICAgdGhpcy5ncmFwaGljcy5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB0aGlzLmdyYXBoaWNzLmVuZEZpbGwoKTtcbiAgICB0aGlzLmdyYXBoaWNzLmNhY2hlQXNCaXRtYXAgPSB0cnVlO1xuICAgIHRoaXMuYWRkKHRoaXMuZ3JhcGhpY3MpO1xufTtcblxuTWluaU1hcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuTWluaU1hcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNaW5pTWFwO1xuXG5NaW5pTWFwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy90aGlzLnRleHR1cmUucmVuZGVyWFkodGhpcy5ncmFwaGljcywgMCwgMCwgdHJ1ZSk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmdhbWUucGxheWZpZWxkLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgYm9keSA9IHRoaXMuZ2FtZS5wbGF5ZmllbGQuY2hpbGRyZW5baV07XG4gICAgICAgIGlmICghYm9keS5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBib2R5Lm1pbmlzcHJpdGUueCA9IHRoaXMud29ybGRUb01tWChib2R5LngpO1xuICAgICAgICBib2R5Lm1pbmlzcHJpdGUueSA9IHRoaXMud29ybGRUb01tWShib2R5LnkpO1xuICAgICAgICBib2R5Lm1pbmlzcHJpdGUuYW5nbGUgPSBib2R5LmFuZ2xlO1xuICAgIC8vICAgIHZhciB4ID0gMTAwICsgYm9keS54IC8gNDA7XG4gICAgLy8gICAgdmFyIHkgPSAxMDAgKyBib2R5LnkgLyA0MDtcbiAgICAvLyAgICB0aGlzLnRleHR1cmUucmVuZGVyWFkoYm9keS5ncmFwaGljcywgeCwgeSwgZmFsc2UpO1xuICAgIH1cbn07XG5cbk1pbmlNYXAucHJvdG90eXBlLndvcmxkVG9NbVggPSBmdW5jdGlvbiAoeCkge1xuICAgIHJldHVybiB4ICogdGhpcy5tYXBTY2FsZSArIHRoaXMueE9mZnNldDtcbn07XG5cbk1pbmlNYXAucHJvdG90eXBlLndvcmxkVG9NbVkgPSBmdW5jdGlvbiAoeSkge1xuICAgIHJldHVybiB5ICogdGhpcy5tYXBTY2FsZSArIHRoaXMueU9mZnNldDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWluaU1hcDsiLCIvKiogY2xpZW50LmpzXG4gKlxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgU3RhcmNvZGVyIGdhbWUgY2xpZW50XG4gKlxuICogQHR5cGUge1N0YXJjb2RlcnxleHBvcnRzfVxuICovXG5cbi8vcmVxdWlyZSgnLi9CbG9ja2x5Q3VzdG9tLmpzJyk7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxuXG4vL2xvY2FsU3RvcmFnZS5kZWJ1ZyA9ICcnOyAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVzZWQgdG8gdG9nZ2xlIHNvY2tldC5pbyBkZWJ1Z2dpbmdcblxuLy9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuLy8gICAgdmFyIHN0YXJjb2RlciA9IG5ldyBTdGFyY29kZXIoKTtcbi8vICAgIHN0YXJjb2Rlci5zdGFydCgpO1xuLy99KTtcblxuLy8gdGVzdFxuXG4kKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3RhcmNvZGVyID0gbmV3IFN0YXJjb2RlcigpO1xuICAgIHN0YXJjb2Rlci5zdGFydCgpO1xufSk7XG4iXX0=
