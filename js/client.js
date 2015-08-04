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
            sprite.destroy();
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

    game.physics.p2.enable(this, false, false);
    this.setPosAngle(config.x, config.y, config.a);
    this.config(config.properties);
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

    //this.game.sounds.music = this.game.sound.add('music', 1, true);
    //this.game.sounds.music.play();

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvU3RhcmNvZGVyLWNsaWVudC5qcyIsInNyYy9TdGFyY29kZXIuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvQ29kZUVuZHBvaW50Q2xpZW50LmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL0RPTUludGVyZmFjZS5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9MZWFkZXJCb2FyZENsaWVudC5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9TdGFyZmllbGQuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvV29ybGRBcGkuanMiLCJzcmMvY29tbW9uL1BhdGhzLmpzIiwic3JjL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzIiwic3JjL3BoYXNlcmJvZGllcy9Bc3Rlcm9pZC5qcyIsInNyYy9waGFzZXJib2RpZXMvQnVsbGV0LmpzIiwic3JjL3BoYXNlcmJvZGllcy9DcnlzdGFsLmpzIiwic3JjL3BoYXNlcmJvZGllcy9HZW5lcmljT3JiLmpzIiwic3JjL3BoYXNlcmJvZGllcy9QbGFuZXRvaWQuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1NoaXAuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1NpbXBsZVBhcnRpY2xlLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TdGFyVGFyZ2V0LmpzIiwic3JjL3BoYXNlcmJvZGllcy9TeW5jQm9keUludGVyZmFjZS5qcyIsInNyYy9waGFzZXJib2RpZXMvVGhydXN0R2VuZXJhdG9yLmpzIiwic3JjL3BoYXNlcmJvZGllcy9Ub2FzdC5qcyIsInNyYy9waGFzZXJib2RpZXMvVHJhY3RvckJlYW0uanMiLCJzcmMvcGhhc2VyYm9kaWVzL1RyZWUuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1ZlY3RvclNwcml0ZS5qcyIsInNyYy9waGFzZXJwbHVnaW5zL0NvbnRyb2xzLmpzIiwic3JjL3BoYXNlcnBsdWdpbnMvU3luY0NsaWVudC5qcyIsInNyYy9waGFzZXJzdGF0ZXMvQm9vdC5qcyIsInNyYy9waGFzZXJzdGF0ZXMvTG9hZGVyLmpzIiwic3JjL3BoYXNlcnN0YXRlcy9Mb2dpbi5qcyIsInNyYy9waGFzZXJzdGF0ZXMvU3BhY2UuanMiLCJzcmMvcGhhc2VydWkvTGVhZGVyQm9hcmQuanMiLCJzcmMvcGhhc2VydWkvTWluaU1hcC5qcyIsInNyYy9jbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogU3RhcmNvZGVyLWNsaWVudC5qc1xuICpcbiAqIFN0YXJjb2RlciBtYXN0ZXIgb2JqZWN0IGV4dGVuZGVkIHdpdGggY2xpZW50IG9ubHkgcHJvcGVydGllcyBhbmQgbWV0aG9kc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgV29ybGRBcGkgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL1dvcmxkQXBpLmpzJyk7XG52YXIgRE9NSW50ZXJmYWNlID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9ET01JbnRlcmZhY2UuanMnKTtcbnZhciBDb2RlRW5kcG9pbnRDbGllbnQgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL0NvZGVFbmRwb2ludENsaWVudC5qcycpO1xudmFyIFN0YXJmaWVsZCA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvU3RhcmZpZWxkLmpzJyk7XG52YXIgTGVhZGVyQm9hcmRDbGllbnQgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL0xlYWRlckJvYXJkQ2xpZW50LmpzJyk7XG5cbnZhciBzdGF0ZXMgPSB7XG4gICAgYm9vdDogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvQm9vdC5qcycpLFxuICAgIHNwYWNlOiByZXF1aXJlKCcuL3BoYXNlcnN0YXRlcy9TcGFjZS5qcycpLFxuICAgIGxvZ2luOiByZXF1aXJlKCcuL3BoYXNlcnN0YXRlcy9Mb2dpbi5qcycpLFxuICAgIGxvYWRlcjogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvTG9hZGVyLmpzJylcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlvID0gaW87XG4gICAgdGhpcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKCcxMDAlJywgJzEwMCUnLCBQaGFzZXIuQVVUTywgJ21haW4nKTtcbiAgICAvL3RoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSgxODAwLCA5NTAsIFBoYXNlci5DQU5WQVMsICdtYWluJyk7XG4gICAgdGhpcy5nYW1lLmZvcmNlU2luZ2xlVXBkYXRlID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUuc3RhcmNvZGVyID0gdGhpcztcbiAgICBmb3IgKHZhciBrIGluIHN0YXRlcykge1xuICAgICAgICB2YXIgc3RhdGUgPSBuZXcgc3RhdGVzW2tdKCk7XG4gICAgICAgIHN0YXRlLnN0YXJjb2RlciA9IHRoaXM7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoaywgc3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLm9uQ29ubmVjdENCID0gW107XG4gICAgdGhpcy5wbGF5ZXJNYXAgPSB7fTtcbiAgICB0aGlzLmNtZFF1ZXVlID0gW107XG4gICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmxhc3ROZXRFcnJvciA9IG51bGw7XG4gICAgdGhpcy5pbXBsZW1lbnRGZWF0dXJlKFdvcmxkQXBpKTtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoQ29kZUVuZHBvaW50Q2xpZW50KTtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoU3RhcmZpZWxkKTtcbiAgICB0aGlzLmltcGxlbWVudEZlYXR1cmUoTGVhZGVyQm9hcmRDbGllbnQpO1xuICAgIHRoaXMuaW1wbGVtZW50RmVhdHVyZShET01JbnRlcmZhY2UpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5zZXJ2ZXJDb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoIXRoaXMuc29ja2V0KSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNvY2tldDtcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sYXN0TmV0RXJyb3IgPSBudWxsO1xuICAgIH1cbiAgICB2YXIgc2VydmVyVXJpID0gdGhpcy5jb25maWcuc2VydmVyVXJpO1xuICAgIGlmICghc2VydmVyVXJpKSB7XG4gICAgICAgIHZhciBwcm90b2NvbCA9IHRoaXMuY29uZmlnLnNlcnZlclByb3RvbCB8fCB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2w7XG4gICAgICAgIHZhciBwb3J0ID0gdGhpcy5jb25maWcuc2VydmVyUG9ydCB8fCAnODA4MCc7XG4gICAgICAgIHNlcnZlclVyaSA9IHByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArICc6JyArIHBvcnQ7XG4gICAgfVxuICAgIHRoaXMuc29ja2V0ID0gdGhpcy5pbyhzZXJ2ZXJVcmksIHRoaXMuY29uZmlnLmlvQ2xpZW50T3B0aW9ucyk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygnc29ja2V0IGNvbm5lY3RlZCcpO1xuICAgICAgICBzZWxmLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHNlbGYubGFzdE5ldEVycm9yID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzZWxmLm9uQ29ubmVjdENCLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgc2VsZi5vbkNvbm5lY3RDQltpXS5iaW5kKHNlbGYsIHNlbGYuc29ja2V0KSgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Vycm9yJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdzb2NrZXQgZXJyb3InKTtcbiAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICB0aGlzLmxhc3ROZXRFcnJvciA9IGRhdGE7XG4gICAgfSk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLnNlcnZlckxvZ2luID0gZnVuY3Rpb24gKHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgIHZhciBsb2dpbiA9IHt9O1xuICAgIGlmICghcGFzc3dvcmQpIHtcbiAgICAgICAgLy8gR3Vlc3QgbG9naW5cbiAgICAgICAgbG9naW4uZ2FtZXJ0YWcgPSB1c2VybmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2dpbi51c2VybmFtZSA9IHVzZXJuYW1lO1xuICAgICAgICBsb2dpbi5wYXNzd29yZCA9IHBhc3N3b3JkO1xuICAgIH1cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdsb2dpbicsIGxvZ2luKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdib290Jyk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLmF0dGFjaFBsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcGx1Z2luID0gdGhpcy5nYW1lLnBsdWdpbnMuYWRkLmFwcGx5KHRoaXMuZ2FtZS5wbHVnaW5zLCBhcmd1bWVudHMpO1xuICAgIHBsdWdpbi5zdGFyY29kZXIgPSB0aGlzO1xuICAgIHBsdWdpbi5sb2cgPSB0aGlzLmxvZztcbiAgICByZXR1cm4gcGx1Z2luO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5yb2xlID0gJ0NsaWVudCc7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcmNvZGVyO1xuIiwiLyoqXG4gKiBTdGFyY29kZXIuanNcbiAqXG4gKiBTZXQgdXAgZ2xvYmFsIFN0YXJjb2RlciBuYW1lc3BhY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL3ZhciBTdGFyY29kZXIgPSB7XG4vLyAgICBjb25maWc6IHtcbi8vICAgICAgICB3b3JsZEJvdW5kczogWy00MjAwLCAtNDIwMCwgODQwMCwgODQwMF1cbi8vXG4vLyAgICB9LFxuLy8gICAgU3RhdGVzOiB7fVxuLy99O1xuXG52YXIgY29uZmlnID0ge1xuICAgIHZlcnNpb246ICcwLjEnLFxuICAgIC8vc2VydmVyVXJpOiAnaHR0cDovL3BoYXJjb2Rlci1zaW5nbGUtMS5lbGFzdGljYmVhbnN0YWxrLmNvbTo4MDgwJyxcbiAgICAvL3NlcnZlclVyaTogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MScsXG4gICAgLy9zZXJ2ZXJBZGRyZXNzOiAnMS4yLjMuNCcsXG4gICAgLy93b3JsZEJvdW5kczogWy00MjAwLCAtNDIwMCwgODQwMCwgODQwMF0sXG4gICAgd29ybGRCb3VuZHM6IFstMjAwLCAtMjAwLCAyMDAsIDIwMF0sXG4gICAgaW9DbGllbnRPcHRpb25zOiB7XG4gICAgICAgIC8vZm9yY2VOZXc6IHRydWVcbiAgICAgICAgcmVjb25uZWN0aW9uOiBmYWxzZVxuICAgIH0sXG4gICAgdXBkYXRlSW50ZXJ2YWw6IDUwLFxuICAgIHJlbmRlckxhdGVuY3k6IDEwMCxcbiAgICBwaHlzaWNzU2NhbGU6IDIwLFxuICAgIGZyYW1lUmF0ZTogKDEgLyA2MCksXG4gICAgdGltZVN5bmNGcmVxOiAxMCxcbiAgICBwaHlzaWNzUHJvcGVydGllczoge1xuICAgICAgICBTaGlwOiB7XG4gICAgICAgICAgICBtYXNzOiAxMFxuICAgICAgICB9LFxuICAgICAgICBBc3Rlcm9pZDoge1xuICAgICAgICAgICAgbWFzczogMjBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2FtZXJUYWdzOiB7XG4gICAgICAgIDE6IFtcbiAgICAgICAgICAgICdzdXBlcicsXG4gICAgICAgICAgICAnYXdlc29tZScsXG4gICAgICAgICAgICAncmFpbmJvdycsXG4gICAgICAgICAgICAnZG91YmxlJyxcbiAgICAgICAgICAgICd0cmlwbGUnLFxuICAgICAgICAgICAgJ3ZhbXBpcmUnLFxuICAgICAgICAgICAgJ3ByaW5jZXNzJyxcbiAgICAgICAgICAgICdpY2UnLFxuICAgICAgICAgICAgJ2ZpcmUnLFxuICAgICAgICAgICAgJ3JvYm90JyxcbiAgICAgICAgICAgICd3ZXJld29sZicsXG4gICAgICAgICAgICAnc3BhcmtsZScsXG4gICAgICAgICAgICAnaW5maW5pdGUnLFxuICAgICAgICAgICAgJ2Nvb2wnLFxuICAgICAgICAgICAgJ3lvbG8nLFxuICAgICAgICAgICAgJ3N3YWdneSdcbiAgICAgICAgXSxcbiAgICAgICAgMjogW1xuICAgICAgICAgICAgJ3RpZ2VyJyxcbiAgICAgICAgICAgICduaW5qYScsXG4gICAgICAgICAgICAncHJpbmNlc3MnLFxuICAgICAgICAgICAgJ3JvYm90JyxcbiAgICAgICAgICAgICdwb255JyxcbiAgICAgICAgICAgICdkYW5jZXInLFxuICAgICAgICAgICAgJ3JvY2tlcicsXG4gICAgICAgICAgICAnbWFzdGVyJyxcbiAgICAgICAgICAgICdoYWNrZXInLFxuICAgICAgICAgICAgJ3JhaW5ib3cnLFxuICAgICAgICAgICAgJ2tpdHRlbicsXG4gICAgICAgICAgICAncHVwcHknLFxuICAgICAgICAgICAgJ2Jvc3MnXG4gICAgICAgIF1cbiAgICB9LFxuICAgIGluaXRpYWxCb2RpZXM6IFtcbiAgICAgICAge3R5cGU6ICdBc3Rlcm9pZCcsIG51bWJlcjogMjUsIGNvbmZpZzoge1xuICAgICAgICAgICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCd9LFxuICAgICAgICAgICAgdmVsb2NpdHk6IHtyYW5kb206ICd2ZWN0b3InLCBsbzogLTE1LCBoaTogMTV9LFxuICAgICAgICAgICAgYW5ndWxhclZlbG9jaXR5OiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogLTUsIGhpOiA1fSxcbiAgICAgICAgICAgIHZlY3RvclNjYWxlOiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogMC42LCBoaTogMS40fSxcbiAgICAgICAgICAgIG1hc3M6IDEwXG4gICAgICAgIH19LFxuICAgICAgICAvL3t0eXBlOiAnQ3J5c3RhbCcsIG51bWJlcjogMTAsIGNvbmZpZzoge1xuICAgICAgICAvLyAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJ30sXG4gICAgICAgIC8vICAgIHZlbG9jaXR5OiB7cmFuZG9tOiAndmVjdG9yJywgbG86IC00LCBoaTogNCwgbm9ybWFsOiB0cnVlfSxcbiAgICAgICAgLy8gICAgdmVjdG9yU2NhbGU6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAwLjQsIGhpOiAwLjh9LFxuICAgICAgICAvLyAgICBtYXNzOiA1XG4gICAgICAgIC8vfX1cbiAgICAgICAgLy97dHlwZTogJ0h5ZHJhJywgbnVtYmVyOiAxLCBjb25maWc6IHtcbiAgICAgICAgLy8gICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCcsIHBhZDogNTB9XG4gICAgICAgIC8vfX0sXG4gICAgICAgIHt0eXBlOiAnUGxhbmV0b2lkJywgbnVtYmVyOiA2LCBjb25maWc6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDMwfSxcbiAgICAgICAgICAgIGFuZ3VsYXJWZWxvY2l0eToge3JhbmRvbTogJ2Zsb2F0JywgbG86IC0yLCBoaTogMn0sXG4gICAgICAgICAgICB2ZWN0b3JTY2FsZTogMi41LFxuICAgICAgICAgICAgbWFzczogMTAwXG4gICAgICAgIH19LFxuICAgICAgICAvL3t0eXBlOiAnU3RhclRhcmdldCcsIG51bWJlcjogMTAsIGNvbmZpZzoge1xuICAgICAgICAvLyAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJywgcGFkOiAzMH0sXG4gICAgICAgIC8vICAgIHZlY3RvclNjYWxlOiAwLjUsXG4gICAgICAgIC8vICAgIHN0YXJzOiBbWzAsIDBdLCBbMSwxXSwgWy0xLDFdLCBbMSwtMV1dXG4gICAgICAgIC8vfX1cbiAgICAgICAgLy8gRklYTUU6IFRyZWVzIGp1c3QgZm9yIHRlc3RpbmdcbiAgICAgICAgLy97dHlwZTogJ1RyZWUnLCBudW1iZXI6IDEwLCBjb25maWc6IHtcbiAgICAgICAgLy8gICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCcsIHBhZDogMzB9LFxuICAgICAgICAvLyAgICB2ZWN0b3JTY2FsZTogMSxcbiAgICAgICAgLy8gICAgbWFzczogNVxuICAgICAgICAvL319XG4gICAgXVxufTtcblxudmFyIFN0YXJjb2RlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBJbml0aWFsaXplcnMgdmlydHVhbGl6ZWQgYWNjb3JkaW5nIHRvIHJvbGVcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLmJhbm5lcigpO1xuICAgIHRoaXMuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIC8vdGhpcy5pbml0TmV0LmNhbGwodGhpcyk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLmV4dGVuZENvbmZpZyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBmb3IgKHZhciBrIGluIGNvbmZpZykge1xuICAgICAgICBpZiAoY29uZmlnLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ1trXSA9IGNvbmZpZ1trXTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8vIENvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciBjb21tb24gY29uZmlnIG9wdGlvbnNcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICd3b3JsZFdpZHRoJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMl0gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1swXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJXaWR0aCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqICh0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1syXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzBdKTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICd3b3JsZEhlaWdodCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzNdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMV07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VySGVpZ2h0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogKHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzNdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMV0pO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlckxlZnQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1swXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJUb3AnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1sxXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJSaWdodCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzJdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlckJvdHRvbScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzNdO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIEFkZCBtaXhpbiBwcm9wZXJ0aWVzIHRvIHRhcmdldC4gQWRhcHRlZCAoc2xpZ2h0bHkpIGZyb20gUGhhc2VyXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldFxuICogQHBhcmFtIHtvYmplY3R9IG1peGluXG4gKi9cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZSA9IGZ1bmN0aW9uICh0YXJnZXQsIG1peGluKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhtaXhpbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgICB2YXIgdmFsID0gbWl4aW5ba2V5XTtcbiAgICAgICAgaWYgKHZhbCAmJlxuICAgICAgICAgICAgKHR5cGVvZiB2YWwuZ2V0ID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB2YWwuc2V0ID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCB2YWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSB2YWw7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIExpZ2h0d2VpZ2h0IGNvbXBvbmVudCBpbXBsZW1lbnRhdGlvbiwgbW9yZSBmb3IgbG9naWNhbCB0aGFuIGZ1bmN0aW9uYWwgbW9kdWxhcml0eVxuICpcbiAqIEBwYXJhbSBtaXhpbiB7b2JqZWN0fSAtIFBPSk8gd2l0aCBtZXRob2RzIC8gcHJvcGVydGllcyB0byBiZSBhZGRlZCB0byBwcm90b3R5cGUsIHdpdGggb3B0aW9uYWwgaW5pdCBtZXRob2RcbiAqL1xuU3RhcmNvZGVyLnByb3RvdHlwZS5pbXBsZW1lbnRGZWF0dXJlID0gZnVuY3Rpb24gKG1peGluKSB7XG4gICAgZm9yICh2YXIgcHJvcCBpbiBtaXhpbikge1xuICAgICAgICBzd2l0Y2ggKHByb3ApIHtcbiAgICAgICAgICAgIGNhc2UgJ29uQ29ubmVjdENCJzpcbiAgICAgICAgICAgIGNhc2UgJ29uUmVhZHlDQic6XG4gICAgICAgICAgICBjYXNlICdvbkxvZ2luQ0InOlxuICAgICAgICAgICAgY2FzZSAnb25EaXNjb25uZWN0Q0InOlxuICAgICAgICAgICAgICAgIHRoaXNbcHJvcF0ucHVzaChtaXhpbltwcm9wXSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpbml0JzpcbiAgICAgICAgICAgICAgICBicmVhazsgICAgICAvLyBOb09wXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIFN0YXJjb2Rlci5wcm90b3R5cGVbcHJvcF0gPSBtaXhpbltwcm9wXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobWl4aW4uaW5pdCkge1xuICAgICAgICBtaXhpbi5pbml0LmNhbGwodGhpcyk7XG4gICAgfVxufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5iYW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5sb2coJ1N0YXJjb2RlcicsIHRoaXMucm9sZSwgJ3YnICsgdGhpcy5jb25maWcudmVyc2lvbiwgJ3N0YXJ0ZWQgYXQnLCBEYXRlKCkpO1xufTtcblxuLyoqXG4gKiBDdXN0b20gbG9nZ2luZyBmdW5jdGlvbiB0byBiZSBmZWF0dXJlZmllZCBhcyBuZWNlc3NhcnlcbiAqL1xuU3RhcmNvZGVyLnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJjb2RlcjtcbiIsIi8qKlxuICogQ29kZUVuZHBvaW50Q2xpZW50LmpzXG4gKlxuICogTWV0aG9kcyBmb3Igc2VuZGluZyBjb2RlIHRvIHNlcnZlciBhbmQgZGVhbGluZyB3aXRoIGNvZGUgcmVsYXRlZCByZXNwb25zZXNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzZW5kQ29kZTogZnVuY3Rpb24gKGNvZGUpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnY29kZScsIGNvZGUpO1xuICAgIH1cbn07IiwiLyoqXG4gKiBET01JbnRlcmZhY2UuanNcbiAqXG4gKiBIYW5kbGUgRE9NIGNvbmZpZ3VyYXRpb24vaW50ZXJhY3Rpb24sIGkuZS4gbm9uLVBoYXNlciBzdHVmZlxuICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmRvbSA9IHt9OyAgICAgICAgICAgICAgLy8gbmFtZXNwYWNlXG4gICAgICAgIHRoaXMuZG9tLmNvZGVCdXR0b24gPSAkKCcjY29kZS1idG4nKTtcbiAgICAgICAgdGhpcy5kb20uY29kZVBvcHVwID0gJCgnI2NvZGUtcG9wdXAnKTtcbiAgICAgICAgdGhpcy5kb20ubG9naW5Qb3B1cD0gJCgnI2xvZ2luJyk7XG4gICAgICAgIHRoaXMuZG9tLmxvZ2luQnV0dG9uID0gJCgnI3N1Ym1pdCcpO1xuXG4gICAgICAgIHRoaXMuZG9tLmNvZGVCdXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kb20uY29kZVBvcHVwLnRvZ2dsZSgnc2xvdycpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50LnNvdXJjZSA9PT0gc2VsZi5kb20uY29kZVBvcHVwWzBdLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNlbmRDb2RlKGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vdGhpcy5kb20uY29kZVBvcHVwLmhpZGUoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gMjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdGFncyA9IHRoaXMuY29uZmlnLmdhbWVyVGFnc1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwLCBsID0gdGFncy5sZW5ndGg7IGogPCBsOyBqKyspIHtcbiAgICAgICAgICAgICAgICAkKCcjZ3QnICsgaSkuYXBwZW5kKCc8b3B0aW9uPicgKyB0YWdzW2pdICsgJzwvb3B0aW9uPicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICQoJy5zZWxlY3QnKS5zZWxlY3RtZW51KCk7XG4gICAgICAgICQoJy5sb2dpbmJ1dHRvbicpLmJ1dHRvbih7aWNvbnM6IHtwcmltYXJ5OiAndWktaWNvbi10cmlhbmdsZS0xLWUnfX0pO1xuXG4gICAgICAgICQoJy5hY2NvcmRpb24nKS5hY2NvcmRpb24oe2hlaWdodFN0eWxlOiAnY29udGVudCd9KTtcbiAgICAgICAgJCgnLmhpZGRlbicpLmhpZGUoKTtcblxuICAgIH0sXG5cbiAgICBsYXlvdXRET01TcGFjZVN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJyNjb2RlLWJ0bicpLnNob3coKS5wb3NpdGlvbih7bXk6ICdsZWZ0IGJvdHRvbScsIGF0OiAnbGVmdCBib3R0b20nLCBvZjogJyNtYWluJ30pO1xuICAgICAgICAkKCcjY29kZS1wb3B1cCcpLnBvc2l0aW9uKHtteTogJ2NlbnRlcicsIGF0OiAnY2VudGVyJywgb2Y6IHdpbmRvd30pO1xuICAgIH0sXG5cbiAgICBzaG93TG9naW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAkKCcjbG9naW4td2luZG93IC5tZXNzYWdlJykuaGlkZSgpO1xuICAgICAgICAkKCcjbG9naW4td2luZG93Jykuc2hvdygpLnBvc2l0aW9uKHtteTogJ2NlbnRlcicsIGF0OiAnY2VudGVyJywgb2Y6IHdpbmRvd30pO1xuICAgICAgICAkKCcjdXNlcmxvZ2luJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5zZXJ2ZXJMb2dpbigkKCcjdXNlcm5hbWUnKS52YWwoKSwgJCgnI3Bhc3N3b3JkJykudmFsKCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCgnI2d1ZXN0bG9naW4nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLnNlcnZlckxvZ2luKCQoJyNndDEnKS52YWwoKSArICcgJyArICQoJyNndDInKS52YWwoKSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzZXRMb2dpbkVycm9yOiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgdmFyIG1zZyA9ICQoJyNsb2dpbi13aW5kb3cgLm1lc3NhZ2UnKTtcbiAgICAgICAgaWYgKCFlcnJvcikge1xuICAgICAgICAgICAgbXNnLmhpZGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1zZy5odG1sKGVycm9yKTtcbiAgICAgICAgICAgIG1zZy5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgaGlkZUxvZ2luOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJyNsb2dpbi13aW5kb3cnKS5oaWRlKCk7XG4gICAgfVxufTsiLCIvKipcbiAqIExlYWRlckJvYXJkQ2xpZW50LmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubGVhZGVyQm9hcmQgPSB7fTtcbiAgICAgICAgdGhpcy5sZWFkZXJCb2FyZENhdHMgPSBbXTtcbiAgICAgICAgdGhpcy5sZWFkZXJCb2FyZFN0YXRlID0gbnVsbDtcbiAgICB9LFxuXG4gICAgb25Db25uZWN0Q0I6IGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzb2NrZXQub24oJ2xlYWRlcmJvYXJkJywgZnVuY3Rpb24gKGxiKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBjYXQgaW4gbGIpIHtcbiAgICAgICAgICAgICAgICAvLyBSZWNvcmQgbmV3IGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgaWYgKCEoY2F0IGluIHNlbGYubGVhZGVyQm9hcmQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubGVhZGVyQm9hcmRDYXRzLnB1c2goY2F0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU3RhcnQgY3ljbGluZyBpZiB0aGlzIGlzIGZpcnN0IGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYubGVhZGVyQm9hcmRTdGF0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmxlYWRlckJvYXJkU3RhdGUgPSAwO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmdhbWUubGVhZGVyYm9hcmQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNldEludGVydmFsKHNlbGYuY3ljbGVMZWFkZXJCb2FyZC5iaW5kKHNlbGYpLCBzZWxmLmNvbmZpZy5sZWFkZXJCb2FyZENsaWVudEN5Y2xlIHx8IDUwMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBEaXNwbGF5IGlmIHVwZGF0ZWQgYm9hcmQgaXMgc2hvd2luZ1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmxlYWRlckJvYXJkQ2F0c1tzZWxmLmxlYWRlckJvYXJkU3RhdGVdID09PSBjYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nYW1lLmxlYWRlcmJvYXJkLnNldENvbnRlbnQoY2F0LCBsYltjYXRdLCBzZWxmLnBsYXllci5pZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5sZWFkZXJCb2FyZFtjYXRdID0gbGJbY2F0XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgY3ljbGVMZWFkZXJCb2FyZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxlYWRlckJvYXJkU3RhdGUgPSAodGhpcy5sZWFkZXJCb2FyZFN0YXRlICsgMSkgJSB0aGlzLmxlYWRlckJvYXJkQ2F0cy5sZW5ndGg7XG4gICAgICAgIHZhciBjYXQgPSB0aGlzLmxlYWRlckJvYXJkQ2F0c1t0aGlzLmxlYWRlckJvYXJkU3RhdGVdO1xuICAgICAgICB0aGlzLmdhbWUubGVhZGVyYm9hcmQuc2V0Q29udGVudChjYXQsIHRoaXMubGVhZGVyQm9hcmRbY2F0XSwgdGhpcy5wbGF5ZXIuaWQpO1xuICAgIH1cbn07IiwiLyoqXG4gKiBNZXRob2QgZm9yIGRyYXdpbmcgc3RhcmZpZWxkc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHJhbmRvbU5vcm1hbDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdCA9IDA7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTw2OyBpKyspIHtcbiAgICAgICAgICAgIHQgKz0gdGhpcy5nYW1lLnJuZC5ub3JtYWwoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdC82O1xuICAgIH0sXG5cbiAgICBkcmF3U3RhcjogZnVuY3Rpb24gKGN0eCwgeCwgeSwgZCwgY29sb3IpIHtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LWQrMSwgeS1kKzEpO1xuICAgICAgICBjdHgubGluZVRvKHgrZC0xLCB5K2QtMSk7XG4gICAgICAgIGN0eC5tb3ZlVG8oeC1kKzEsIHkrZC0xKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4K2QtMSwgeS1kKzEpO1xuICAgICAgICBjdHgubW92ZVRvKHgsIHktZCk7XG4gICAgICAgIGN0eC5saW5lVG8oeCwgeStkKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4LWQsIHkpO1xuICAgICAgICBjdHgubGluZVRvKHgrZCwgeSk7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9LFxuXG4gICAgZHJhd1N0YXJGaWVsZDogZnVuY3Rpb24gKGN0eCwgc2l6ZSwgbikge1xuICAgICAgICB2YXIgeG0gPSBNYXRoLnJvdW5kKHNpemUvMiArIHRoaXMucmFuZG9tTm9ybWFsKCkqc2l6ZS80KTtcbiAgICAgICAgdmFyIHltID0gTWF0aC5yb3VuZChzaXplLzIgKyB0aGlzLnJhbmRvbU5vcm1hbCgpKnNpemUvNCk7XG4gICAgICAgIHZhciBxdWFkcyA9IFtbMCwwLHhtLTEseW0tMV0sIFt4bSwwLHNpemUtMSx5bS0xXSxcbiAgICAgICAgICAgIFswLHltLHhtLTEsc2l6ZS0xXSwgW3htLHltLHNpemUtMSxzaXplLTFdXTtcbiAgICAgICAgdmFyIGNvbG9yO1xuICAgICAgICB2YXIgaSwgaiwgbCwgcTtcblxuICAgICAgICBuID0gTWF0aC5yb3VuZChuLzQpO1xuICAgICAgICBmb3IgKGk9MCwgbD1xdWFkcy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgICAgICAgICBxID0gcXVhZHNbaV07XG4gICAgICAgICAgICBmb3IgKGo9MDsgajxuOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjb2xvciA9ICdoc2woNjAsMTAwJSwnICsgdGhpcy5nYW1lLnJuZC5iZXR3ZWVuKDkwLDk5KSArICclKSc7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3U3RhcihjdHgsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5ybmQuYmV0d2VlbihxWzBdKzcsIHFbMl0tNyksIHRoaXMuZ2FtZS5ybmQuYmV0d2VlbihxWzFdKzcsIHFbM10tNyksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5ybmQuYmV0d2VlbigyLDQpLCBjb2xvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59OyIsIi8qKlxuICogV29ybGRBcGkuanNcbiAqXG4gKiBBZGQvcmVtb3ZlL21hbmlwdWxhdGUgYm9kaWVzIGluIGNsaWVudCdzIHBoeXNpY3Mgd29ybGRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBBZGQgYm9keSB0byB3b3JsZCBvbiBjbGllbnQgc2lkZVxuICAgICAqXG4gICAgICogQHBhcmFtIHR5cGUge3N0cmluZ30gLSB0eXBlIG5hbWUgb2Ygb2JqZWN0IHRvIGFkZFxuICAgICAqIEBwYXJhbSBjb25maWcge29iamVjdH0gLSBwcm9wZXJ0aWVzIGZvciBuZXcgb2JqZWN0XG4gICAgICogQHJldHVybnMge1BoYXNlci5TcHJpdGV9IC0gbmV3bHkgYWRkZWQgb2JqZWN0XG4gICAgICovXG4gICAgYWRkQm9keTogZnVuY3Rpb24gKHR5cGUsIGNvbmZpZykge1xuICAgICAgICB2YXIgY3RvciA9IGJvZHlUeXBlc1t0eXBlXTtcbiAgICAgICAgdmFyIHBsYXllclNoaXAgPSBmYWxzZTtcbiAgICAgICAgaWYgKCFjdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmxvZygnVW5rbm93biBib2R5IHR5cGU6JywgdHlwZSk7XG4gICAgICAgICAgICB0aGlzLmxvZyhjb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlID09PSAnU2hpcCcgJiYgY29uZmlnLnByb3BlcnRpZXMucGxheWVyaWQgPT09IHRoaXMucGxheWVyLmlkKSB7XG4gICAgICAgICAgICAvL2NvbmZpZy50YWcgPSB0aGlzLnBsYXllci51c2VybmFtZTtcbiAgICAgICAgICAgIC8vaWYgKGNvbmZpZy5wcm9wZXJ0aWVzLnBsYXllcmlkID09PSB0aGlzLnBsYXllci5pZCkge1xuICAgICAgICAgICAgLy8gT25seSB0aGUgcGxheWVyJ3Mgb3duIHNoaXAgaXMgdHJlYXRlZCBhcyBkeW5hbWljIGluIHRoZSBsb2NhbCBwaHlzaWNzIHNpbVxuICAgICAgICAgICAgY29uZmlnLm1hc3MgPSB0aGlzLmNvbmZpZy5waHlzaWNzUHJvcGVydGllcy5TaGlwLm1hc3M7XG4gICAgICAgICAgICBwbGF5ZXJTaGlwID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vfVxuICAgICAgICB9XG4gICAgICAgIHZhciBib2R5ID0gbmV3IGN0b3IodGhpcy5nYW1lLCBjb25maWcpO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ1NoaXAnKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXllck1hcFtjb25maWcucHJvcGVydGllcy5wbGF5ZXJpZF0gPSBib2R5O1xuICAgICAgICB9XG4gICAgICAgIC8vdGhpcy5nYW1lLmFkZC5leGlzdGluZyhib2R5KTtcbiAgICAgICAgdGhpcy5nYW1lLnBsYXlmaWVsZC5hZGQoYm9keSk7XG4gICAgICAgIGlmIChwbGF5ZXJTaGlwKSB7XG4gICAgICAgICAgICB0aGlzLmdhbWUuY2FtZXJhLmZvbGxvdyhib2R5KTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5wbGF5ZXJTaGlwID0gYm9keTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYm9keTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlQm9keTogZnVuY3Rpb24gKHNwcml0ZSkge1xuICAgICAgICAvL3Nwcml0ZS5raWxsKCk7XG4gICAgICAgIHNwcml0ZS5kZXN0cm95KCk7XG4gICAgICAgIC8vIFJlbW92ZSBtaW5pc3ByaXRlXG4gICAgICAgIGlmIChzcHJpdGUubWluaXNwcml0ZSkge1xuICAgICAgICAgICAgLy9zcHJpdGUubWluaXNwcml0ZS5raWxsKCk7XG4gICAgICAgICAgICBzcHJpdGUuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIC8vdGhpcy5nYW1lLnBoeXNpY3MucDIucmVtb3ZlQm9keShzcHJpdGUuYm9keSk7XG4gICAgfVxufTtcblxudmFyIGJvZHlUeXBlcyA9IHtcbiAgICBTaGlwOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvU2hpcC5qcycpLFxuICAgIEFzdGVyb2lkOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvQXN0ZXJvaWQuanMnKSxcbiAgICBDcnlzdGFsOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvQ3J5c3RhbC5qcycpLFxuICAgIEJ1bGxldDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0J1bGxldC5qcycpLFxuICAgIEdlbmVyaWNPcmI6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9HZW5lcmljT3JiLmpzJyksXG4gICAgUGxhbmV0b2lkOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvUGxhbmV0b2lkLmpzJyksXG4gICAgVHJlZTogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1RyZWUuanMnKSxcbiAgICBUcmFjdG9yQmVhbTogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1RyYWN0b3JCZWFtLmpzJyksXG4gICAgU3RhclRhcmdldDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1N0YXJUYXJnZXQuanMnKVxufTtcblxuIiwiLyoqXG4gKiBQYXRoLmpzXG4gKlxuICogVmVjdG9yIHBhdGhzIHNoYXJlZCBieSBtdWx0aXBsZSBlbGVtZW50c1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBQSSA9IE1hdGguUEk7XG52YXIgVEFVID0gMipQSTtcbnZhciBzaW4gPSBNYXRoLnNpbjtcbnZhciBjb3MgPSBNYXRoLmNvcztcblxuZXhwb3J0cy5vY3RhZ29uID0gW1xuICAgIFsyLDFdLFxuICAgIFsxLDJdLFxuICAgIFstMSwyXSxcbiAgICBbLTIsMV0sXG4gICAgWy0yLC0xXSxcbiAgICBbLTEsLTJdLFxuICAgIFsxLC0yXSxcbiAgICBbMiwtMV1cbl07XG5cbmV4cG9ydHMuZDJjcm9zcyA9IFtcbiAgICBbLTEsLTJdLFxuICAgIFstMSwyXSxcbiAgICBbMiwtMV0sXG4gICAgWy0yLC0xXSxcbiAgICBbMSwyXSxcbiAgICBbMSwtMl0sXG4gICAgWy0yLDFdLFxuICAgIFsyLDFdXG5dO1xuXG5leHBvcnRzLnNxdWFyZTAgPSBbXG4gICAgWy0xLC0yXSxcbiAgICBbMiwtMV0sXG4gICAgWzEsMl0sXG4gICAgWy0yLDFdXG5dO1xuXG5leHBvcnRzLnNxdWFyZTEgPSBbXG4gICAgWzEsLTJdLFxuICAgIFsyLDFdLFxuICAgIFstMSwyXSxcbiAgICBbLTIsLTFdXG5dO1xuXG5leHBvcnRzLnN0YXIgPSBbXG4gICAgW3NpbigwKSwgY29zKDApXSxcbiAgICBbc2luKDIqVEFVLzUpLCBjb3MoMipUQVUvNSldLFxuICAgIFtzaW4oNCpUQVUvNSksIGNvcyg0KlRBVS81KV0sXG4gICAgW3NpbihUQVUvNSksIGNvcyhUQVUvNSldLFxuICAgIFtzaW4oMypUQVUvNSksIGNvcygzKlRBVS81KV1cbl07XG5cbmV4cG9ydHMuT0NUUkFESVVTID0gTWF0aC5zcXJ0KDUpOyIsIi8qKlxuICogVXBkYXRlUHJvcGVydGllcy5qc1xuICpcbiAqIENsaWVudC9zZXJ2ZXIgc3luY2FibGUgcHJvcGVydGllcyBmb3IgZ2FtZSBvYmplY3RzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNoaXAgPSBmdW5jdGlvbiAoKSB7fTtcblNoaXAucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVXaWR0aCcsICdsaW5lQ29sb3InLCAnZmlsbENvbG9yJywgJ2ZpbGxBbHBoYScsXG4gICAgJ3ZlY3RvclNjYWxlJywgJ3NoYXBlJywgJ3NoYXBlQ2xvc2VkJywgJ3BsYXllcmlkJywgJ2NyeXN0YWxzJywgJ2RlYWQnLCAndGFnJ107XG5cbnZhciBBc3Rlcm9pZCA9IGZ1bmN0aW9uICgpIHt9O1xuQXN0ZXJvaWQucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3ZlY3RvclNjYWxlJ107XG5cbnZhciBDcnlzdGFsID0gZnVuY3Rpb24gKCkge307XG5DcnlzdGFsLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWyd2ZWN0b3JTY2FsZSddO1xuXG52YXIgR2VuZXJpY09yYiA9IGZ1bmN0aW9uICgpIHt9O1xuR2VuZXJpY09yYi5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsnbGluZUNvbG9yJywgJ3ZlY3RvclNjYWxlJ107XG5cbnZhciBQbGFuZXRvaWQgPSBmdW5jdGlvbiAoKSB7fTtcblBsYW5ldG9pZC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsnbGluZUNvbG9yJywgJ2ZpbGxDb2xvcicsICdsaW5lV2lkdGgnLCAnZmlsbEFscGhhJywgJ3ZlY3RvclNjYWxlJywgJ293bmVyJ107XG5cbnZhciBUcmVlID0gZnVuY3Rpb24gKCkge307XG5UcmVlLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWyd2ZWN0b3JTY2FsZScsICdsaW5lQ29sb3InLCAnZ3JhcGgnLCAnc3RlcCcsICdkZXB0aCddO1xuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKCkge307XG5CdWxsZXQucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVDb2xvciddO1xuXG52YXIgVHJhY3RvckJlYW0gPSBmdW5jdGlvbiAoKSB7fTtcblRyYWN0b3JCZWFtLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gW107XG5cbnZhciBTdGFyVGFyZ2V0ID0gZnVuY3Rpb24gKCkge307XG5TdGFyVGFyZ2V0LnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydzdGFycycsICdsaW5lQ29sb3InLCAndmVjdG9yU2NhbGUnXTtcblxuXG5leHBvcnRzLlNoaXAgPSBTaGlwO1xuZXhwb3J0cy5Bc3Rlcm9pZCA9IEFzdGVyb2lkO1xuZXhwb3J0cy5DcnlzdGFsID0gQ3J5c3RhbDtcbmV4cG9ydHMuR2VuZXJpY09yYiA9IEdlbmVyaWNPcmI7XG5leHBvcnRzLkJ1bGxldCA9IEJ1bGxldDtcbmV4cG9ydHMuUGxhbmV0b2lkID0gUGxhbmV0b2lkO1xuZXhwb3J0cy5UcmVlID0gVHJlZTtcbmV4cG9ydHMuVHJhY3RvckJlYW0gPSBUcmFjdG9yQmVhbTtcbmV4cG9ydHMuU3RhclRhcmdldCA9IFN0YXJUYXJnZXQ7XG4iLCIvKipcbiAqIEFzdGVyb2lkLmpzXG4gKlxuICogQ2xpZW50IHNpZGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkFzdGVyb2lkO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBBc3Rlcm9pZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbiAgICAvL3RoaXMuYm9keS5kYW1waW5nID0gMDtcbn07XG5cbkFzdGVyb2lkLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIGEgPSBuZXcgQXN0ZXJvaWQoZ2FtZSwgb3B0aW9ucyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5Bc3Rlcm9pZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuQXN0ZXJvaWQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQXN0ZXJvaWQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShBc3Rlcm9pZC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQXN0ZXJvaWQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkFzdGVyb2lkLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZjAwZmYnO1xuQXN0ZXJvaWQucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnI2ZmMDAwMCc7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4yNTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFzdGVyb2lkO1xuLy9TdGFyY29kZXIuQXN0ZXJvaWQgPSBBc3Rlcm9pZDtcbiIsIi8qKlxuICogQnVsbGV0LmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb24gb2Ygc2ltcGxlIHByb2plY3RpbGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbi8vdmFyIFNpbXBsZVBhcnRpY2xlID0gcmVxdWlyZSgnLi9TaW1wbGVQYXJ0aWNsZS5qcycpO1xudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuQnVsbGV0O1xuXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkJ1bGxldC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuQnVsbGV0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJ1bGxldDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKEJ1bGxldC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQnVsbGV0LnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5CdWxsZXQucHJvdG90eXBlLnZpc2libGVPbk1hcCA9IGZhbHNlO1xuQnVsbGV0LnByb3RvdHlwZS5zaGFyZWRUZXh0dXJlS2V5ID0gJ2xhc2VyJztcblxuQnVsbGV0LnByb3RvdHlwZS5kcmF3UHJvY2VkdXJlID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlLCBmcmFtZSkge1xuICAgIHZhciBzY2FsZSA9IHRoaXMuZ2FtZS5waHlzaWNzLnAyLm1weGkodGhpcy52ZWN0b3JTY2FsZSkgKiByZW5kZXJTY2FsZTtcbiAgICB0aGlzLmdyYXBoaWNzLmxpbmVTdHlsZSg0LCBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpLCAxKTtcbiAgICB0aGlzLmdyYXBoaWNzLm1vdmVUbygwLCAwKTtcbiAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbygwLCAxICogc2NhbGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdWxsZXQ7IiwiLyoqXG4gKiBDcnlzdGFsLmpzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5DcnlzdGFsO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBDcnlzdGFsID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuQ3J5c3RhbC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgdmFyIGEgPSBuZXcgQ3J5c3RhbChnYW1lLCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBhO1xufTtcblxuQ3J5c3RhbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuQ3J5c3RhbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDcnlzdGFsO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQ3J5c3RhbC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQ3J5c3RhbC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuQ3J5c3RhbC5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjMDBmZmZmJztcbkNyeXN0YWwucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwMDAwMCc7XG5DcnlzdGFsLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuQ3J5c3RhbC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5DcnlzdGFsLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4wO1xuQ3J5c3RhbC5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcbkNyeXN0YWwucHJvdG90eXBlLl9nZW9tZXRyeSA9IFtcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuZDJjcm9zc31cbl07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDcnlzdGFsO1xuIiwiLyoqXG4gKiBHZW5lcmljT3JiLmpzXG4gKlxuICogQnVpbGRpbmcgYmxvY2tcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkdlbmVyaWNPcmI7XG52YXIgUGF0aHMgPSByZXF1aXJlKCcuLi9jb21tb24vUGF0aHMuanMnKTtcblxudmFyIEdlbmVyaWNPcmIgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG59O1xuXG5HZW5lcmljT3JiLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICB2YXIgYSA9IG5ldyBHZW5lcmljT3JiKGdhbWUsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5HZW5lcmljT3JiLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyaWNPcmI7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShHZW5lcmljT3JiLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShHZW5lcmljT3JiLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5HZW5lcmljT3JiLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZjAwMDAnO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX2ZpbGxDb2xvciA9ICcjMDAwMDAwJztcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9maWxsQWxwaGEgPSAwLjA7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuXG5HZW5lcmljT3JiLnByb3RvdHlwZS5fZ2VvbWV0cnkgPSBbXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLmQyY3Jvc3N9XG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdlbmVyaWNPcmI7XG4iLCIvKipcbiAqIFBsYW5ldG9pZC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuUGxhbmV0b2lkO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBQbGFuZXRvaWQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbn07XG5cblBsYW5ldG9pZC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgb3B0aW9ucykge1xuICAgIHZhciBwbGFuZXRvaWQgPSBuZXcgUGxhbmV0b2lkKGdhbWUsIG9wdGlvbnMpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBwbGFuZXRvaWQ7XG59O1xuXG5QbGFuZXRvaWQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcblBsYW5ldG9pZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQbGFuZXRvaWQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShQbGFuZXRvaWQucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFBsYW5ldG9pZC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuLy9QbGFuZXRvaWQucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnI2ZmMDBmZic7XG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2ZpbGxDb2xvciA9ICcjMDBmZjAwJztcbi8vUGxhbmV0b2lkLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcbi8vUGxhbmV0b2lkLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4yNTtcblBsYW5ldG9pZC5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcblBsYW5ldG9pZC5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcblBsYW5ldG9pZC5wcm90b3R5cGUuX2dlb21ldHJ5ID0gW1xuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5kMmNyb3NzfSxcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuc3F1YXJlMH0sXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLnNxdWFyZTF9XG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYW5ldG9pZDtcbiIsIi8qKlxuICogU2hpcC5qc1xuICpcbiAqIENsaWVudCBzaWRlIGltcGxlbWVudGF0aW9uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5TaGlwO1xuLy92YXIgRW5naW5lID0gcmVxdWlyZSgnLi9FbmdpbmUuanMnKTtcbi8vdmFyIFdlYXBvbnMgPSByZXF1aXJlKCcuL1dlYXBvbnMuanMnKTtcblxudmFyIFNoaXAgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG5cbiAgICBpZiAoY29uZmlnLm1hc3MpIHtcbiAgICAgICAgdGhpcy5ib2R5Lm1hc3MgPSBjb25maWcubWFzcztcbiAgICB9XG4gICAgLy90aGlzLmVuZ2luZSA9IEVuZ2luZS5hZGQoZ2FtZSwgJ3RocnVzdCcsIDUwMCk7XG4gICAgLy90aGlzLmFkZENoaWxkKHRoaXMuZW5naW5lKTtcbiAgICAvL3RoaXMud2VhcG9ucyA9IFdlYXBvbnMuYWRkKGdhbWUsICdidWxsZXQnLCAxMik7XG4gICAgLy90aGlzLndlYXBvbnMuc2hpcCA9IHRoaXM7XG4gICAgLy90aGlzLmFkZENoaWxkKHRoaXMud2VhcG9ucyk7XG4gICAgdGhpcy50YWdUZXh0ID0gZ2FtZS5hZGQudGV4dCgwLCB0aGlzLnRleHR1cmUuaGVpZ2h0LzIgKyAxLFxuICAgICAgICB0aGlzLnRhZywge2ZvbnQ6ICdib2xkIDE4cHggQXJpYWwnLCBmaWxsOiB0aGlzLmxpbmVDb2xvciB8fCAnI2ZmZmZmZicsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIHRoaXMudGFnVGV4dC5hbmNob3Iuc2V0VG8oMC41LCAwKTtcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMudGFnVGV4dCk7XG4gICAgdGhpcy5sb2NhbFN0YXRlID0ge1xuICAgICAgICB0aHJ1c3Q6ICdvZmYnXG4gICAgfVxufTtcblxuU2hpcC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgb3B0aW9ucykge1xuICAgIHZhciBzID0gbmV3IFNoaXAoZ2FtZSwgb3B0aW9ucyk7XG4gICAgZ2FtZS5hZGQuZXhpc3Rpbmcocyk7XG4gICAgcmV0dXJuIHM7XG59O1xuXG5TaGlwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5TaGlwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNoaXA7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTaGlwLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTaGlwLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG5TaGlwLnByb3RvdHlwZS5tYXBGYWN0b3IgPSAzO1xuXG4vL1NoaXAucHJvdG90eXBlLnNldExpbmVTdHlsZSA9IGZ1bmN0aW9uIChjb2xvciwgbGluZVdpZHRoKSB7XG4vLyAgICBTdGFyY29kZXIuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5zZXRMaW5lU3R5bGUuY2FsbCh0aGlzLCBjb2xvciwgbGluZVdpZHRoKTtcbi8vICAgIHRoaXMudGFnVGV4dC5zZXRTdHlsZSh7ZmlsbDogY29sb3J9KTtcbi8vfTtcblxuLy9TaGlwLnByb3RvdHlwZS5zaGFwZSA9IFtcbi8vICAgIFstMSwtMV0sXG4vLyAgICBbLTAuNSwwXSxcbi8vICAgIFstMSwxXSxcbi8vICAgIFswLDAuNV0sXG4vLyAgICBbMSwxXSxcbi8vICAgIFswLjUsMF0sXG4vLyAgICBbMSwtMV0sXG4vLyAgICBbMCwtMC41XSxcbi8vICAgIFstMSwtMV1cbi8vXTtcbi8vU2hpcC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDY7XG5cblNoaXAucHJvdG90eXBlLnVwZGF0ZVRleHR1cmVzID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEZJWE1FOiBQcm9iYWJseSBuZWVkIHRvIHJlZmFjdG9yIGNvbnN0cnVjdG9yIGEgYml0IHRvIG1ha2UgdGhpcyBjbGVhbmVyXG4gICAgVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGVUZXh0dXJlcy5jYWxsKHRoaXMpO1xuICAgIGlmICh0aGlzLnRhZ1RleHQpIHtcbiAgICAgICAgLy90aGlzLnRhZ1RleHQuc2V0U3R5bGUoe2ZpbGw6IHRoaXMubGluZUNvbG9yfSk7XG4gICAgICAgIHRoaXMudGFnVGV4dC5maWxsID0gdGhpcy5saW5lQ29sb3I7XG4gICAgICAgIHRoaXMudGFnVGV4dC55ID0gdGhpcy50ZXh0dXJlLmhlaWdodC8yICsgMTtcbiAgICB9XG59O1xuXG5TaGlwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzKTtcbiAgICAvLyBGSVhNRTogTmVlZCB0byBkZWFsIHdpdGggcGxheWVyIHZlcnN1cyBmb3JlaWduIHNoaXBzXG4gICAgc3dpdGNoICh0aGlzLmxvY2FsU3RhdGUudGhydXN0KSB7XG4gICAgICAgIGNhc2UgJ3N0YXJ0aW5nJzpcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnBsYXkoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RhcnRPbih0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdGF0ZS50aHJ1c3QgPSAnb24nO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NodXRkb3duJzpcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RvcE9uKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0YXRlLnRocnVzdCA9ICdvZmYnO1xuICAgIH1cbiAgICAvLyBQbGF5ZXIgc2hpcCBvbmx5XG4gICAgaWYgKHRoaXMuZ2FtZS5wbGF5ZXJTaGlwID09PSB0aGlzKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0LnNldFRleHQodGhpcy5jcnlzdGFscy50b1N0cmluZygpKTtcbiAgICB9XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3RhZycsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RhZztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl90YWcgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaGlwO1xuLy9TdGFyY29kZXIuU2hpcCA9IFNoaXA7XG4iLCIvKipcbiAqIFNpbXBsZVBhcnRpY2xlLmpzXG4gKlxuICogQmFzaWMgYml0bWFwIHBhcnRpY2xlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSBmdW5jdGlvbiAoZ2FtZSwga2V5KSB7XG4gICAgdmFyIHRleHR1cmUgPSBTaW1wbGVQYXJ0aWNsZS5fdGV4dHVyZUNhY2hlW2tleV07XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIDAsIDAsIHRleHR1cmUpO1xuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUodGhpcywgZmFsc2UsIGZhbHNlKTtcbiAgICB0aGlzLmJvZHkuY2xlYXJTaGFwZXMoKTtcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmJvZHkuYWRkUGFydGljbGUoKTtcbiAgICBzaGFwZS5zZW5zb3IgPSB0cnVlO1xuICAgIC8vdGhpcy5raWxsKCk7XG59O1xuXG5TaW1wbGVQYXJ0aWNsZS5fdGV4dHVyZUNhY2hlID0ge307XG5cblNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSA9IGZ1bmN0aW9uIChnYW1lLCBrZXksIGNvbG9yLCBzaXplLCBjaXJjbGUpIHtcbiAgICB2YXIgdGV4dHVyZSA9IGdhbWUubWFrZS5iaXRtYXBEYXRhKHNpemUsIHNpemUpO1xuICAgIHRleHR1cmUuY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIGlmIChjaXJjbGUpIHtcbiAgICAgICAgdGV4dHVyZS5jdHguYXJjKHNpemUvMiwgc2l6ZS8yLCBzaXplLzIsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XG4gICAgICAgIHRleHR1cmUuY3R4LmZpbGwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0dXJlLmN0eC5maWxsUmVjdCgwLCAwLCBzaXplLCBzaXplKTtcbiAgICB9XG4gICAgU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZVtrZXldID0gdGV4dHVyZTtcbn07XG5cblNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuU2ltcGxlUGFydGljbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2ltcGxlUGFydGljbGU7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVQYXJ0aWNsZTtcbi8vU3RhcmNvZGVyLlNpbXBsZVBhcnRpY2xlID0gU2ltcGxlUGFydGljbGU7IiwiLyoqXG4gKiBTdGFyVGFyZ2V0LmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb25cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlN0YXJUYXJnZXQ7XG5cbnZhciBzdGFyID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJykuc3RhcjtcblxudmFyIFN0YXJUYXJnZXQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbn07XG5cblN0YXJUYXJnZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcblN0YXJUYXJnZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RhclRhcmdldDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJUYXJnZXQucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJUYXJnZXQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cblN0YXJUYXJnZXQucHJvdG90eXBlLmRyYXdQcm9jZWR1cmUgPSBmdW5jdGlvbiAocmVuZGVyU2NhbGUpIHtcbiAgICB2YXIgcHNjID0gdGhpcy5nYW1lLnBoeXNpY3MucDIubXB4aShyZW5kZXJTY2FsZSk7XG4gICAgdmFyIGdzYyA9IHBzYyp0aGlzLnZlY3RvclNjYWxlO1xuICAgIHZhciBsaW5lQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpO1xuICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKDEsIGxpbmVDb2xvciwgMSk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnN0YXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gMCwgayA9IHN0YXIubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHBzYyAqIHRoaXMuc3RhcnNbaV1bMF0gKyBnc2MgKiBzdGFyW2pdWzBdO1xuICAgICAgICAgICAgdmFyIHkgPSBwc2MgKiB0aGlzLnN0YXJzW2ldWzFdICsgZ3NjICogc3RhcltqXVsxXTtcbiAgICAgICAgICAgIGlmIChqID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8oeCwgeSk7XG4gICAgICAgICAgICAgICAgdmFyIHgwID0geDtcbiAgICAgICAgICAgICAgICB2YXIgeTAgPSB5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyh4LCB5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyh4MCwgeTApO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhclRhcmdldDsiLCIvKipcbiAqIFN5bmNCb2R5SW50ZXJmYWNlLmpzXG4gKlxuICogU2hhcmVkIG1ldGhvZHMgZm9yIFZlY3RvclNwcml0ZXMsIFBhcnRpY2xlcywgZXRjLlxuICovXG5cbnZhciBTeW5jQm9keUludGVyZmFjZSA9IGZ1bmN0aW9uICgpIHt9O1xuXG4vKipcbiAqIFNldCBsb2NhdGlvbiBhbmQgYW5nbGUgb2YgYSBwaHlzaWNzIG9iamVjdC4gVmFsdWUgYXJlIGdpdmVuIGluIHdvcmxkIGNvb3JkaW5hdGVzLCBub3QgcGl4ZWxzXG4gKlxuICogQHBhcmFtIHgge251bWJlcn1cbiAqIEBwYXJhbSB5IHtudW1iZXJ9XG4gKiBAcGFyYW0gYSB7bnVtYmVyfVxuICovXG5TeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUuc2V0UG9zQW5nbGUgPSBmdW5jdGlvbiAoeCwgeSwgYSkge1xuICAgIHRoaXMuYm9keS5kYXRhLnBvc2l0aW9uWzBdID0gLSh4IHx8IDApO1xuICAgIHRoaXMuYm9keS5kYXRhLnBvc2l0aW9uWzFdID0gLSh5IHx8IDApO1xuICAgIHRoaXMuYm9keS5kYXRhLmFuZ2xlID0gYSB8fCAwO1xufTtcblxuU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlLmNvbmZpZyA9IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnVwZGF0ZVByb3BlcnRpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBrID0gdGhpcy51cGRhdGVQcm9wZXJ0aWVzW2ldO1xuICAgICAgICBpZiAodHlwZW9mIHByb3BlcnRpZXNba10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzW2tdID0gcHJvcGVydGllc1trXTsgICAgICAgIC8vIEZJWE1FPyBWaXJ0dWFsaXplIHNvbWVob3dcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3luY0JvZHlJbnRlcmZhY2U7IiwiLyoqXG4gKiBUaHJ1c3RHZW5lcmF0b3IuanNcbiAqXG4gKiBHcm91cCBwcm92aWRpbmcgQVBJLCBsYXllcmluZywgYW5kIHBvb2xpbmcgZm9yIHRocnVzdCBwYXJ0aWNsZSBlZmZlY3RzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gcmVxdWlyZSgnLi9TaW1wbGVQYXJ0aWNsZS5qcycpO1xuXG52YXIgX3RleHR1cmVLZXkgPSAndGhydXN0JztcblxuLy8gUG9vbGluZyBwYXJhbWV0ZXJzXG52YXIgX21pblBvb2xTaXplID0gMzAwO1xudmFyIF9taW5GcmVlUGFydGljbGVzID0gMjA7XG52YXIgX3NvZnRQb29sTGltaXQgPSAyMDA7XG52YXIgX2hhcmRQb29sTGltaXQgPSA1MDA7XG5cbi8vIEJlaGF2aW9yIG9mIGVtaXR0ZXJcbnZhciBfcGFydGljbGVzUGVyQnVyc3QgPSA1O1xudmFyIF9wYXJ0aWNsZVRUTCA9IDE1MDtcbnZhciBfcGFydGljbGVCYXNlU3BlZWQgPSA1O1xudmFyIF9jb25lTGVuZ3RoID0gMTtcbnZhciBfY29uZVdpZHRoUmF0aW8gPSAwLjI7XG52YXIgX2VuZ2luZU9mZnNldCA9IC0yMDtcblxudmFyIFRocnVzdEdlbmVyYXRvciA9IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICB0aGlzLnRocnVzdGluZ1NoaXBzID0ge307XG5cbiAgICAvLyBQcmVnZW5lcmF0ZSBhIGJhdGNoIG9mIHBhcnRpY2xlc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX21pblBvb2xTaXplOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnRpY2xlID0gdGhpcy5hZGQobmV3IFNpbXBsZVBhcnRpY2xlKGdhbWUsIF90ZXh0dXJlS2V5KSk7XG4gICAgICAgIHBhcnRpY2xlLmFscGhhID0gMC41O1xuICAgICAgICBwYXJ0aWNsZS5yb3RhdGlvbiA9IE1hdGguUEkvNDtcbiAgICAgICAgcGFydGljbGUua2lsbCgpO1xuICAgIH1cbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRocnVzdEdlbmVyYXRvcjtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS5zdGFydE9uID0gZnVuY3Rpb24gKHNoaXApIHtcbiAgICB0aGlzLnRocnVzdGluZ1NoaXBzW3NoaXAuaWRdID0gc2hpcDtcbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUuc3RvcE9uID0gZnVuY3Rpb24gKHNoaXApIHtcbiAgICBkZWxldGUgdGhpcy50aHJ1c3RpbmdTaGlwc1tzaGlwLmlkXTtcbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy50aHJ1c3RpbmdTaGlwcyk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBrZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgc2hpcCA9IHRoaXMudGhydXN0aW5nU2hpcHNba2V5c1tpXV07XG4gICAgICAgIHZhciB3ID0gc2hpcC53aWR0aDtcbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKHNoaXAucm90YXRpb24pO1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3Moc2hpcC5yb3RhdGlvbik7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX3BhcnRpY2xlc1BlckJ1cnN0OyBqKyspIHtcbiAgICAgICAgICAgIHZhciBwYXJ0aWNsZSA9IHRoaXMuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICAgICAgICBpZiAoIXBhcnRpY2xlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vdCBlbm91Z2ggdGhydXN0IHBhcnRpY2xlcyBpbiBwb29sJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZCA9IHRoaXMuZ2FtZS5ybmQucmVhbEluUmFuZ2UoLV9jb25lV2lkdGhSYXRpbyp3LCBfY29uZVdpZHRoUmF0aW8qdyk7XG4gICAgICAgICAgICB2YXIgeCA9IHNoaXAueCArIGQqY29zICsgX2VuZ2luZU9mZnNldCpzaW47XG4gICAgICAgICAgICB2YXIgeSA9IHNoaXAueSArIGQqc2luIC0gX2VuZ2luZU9mZnNldCpjb3M7XG4gICAgICAgICAgICBwYXJ0aWNsZS5saWZlc3BhbiA9IF9wYXJ0aWNsZVRUTDtcbiAgICAgICAgICAgIHBhcnRpY2xlLnJlc2V0KHgsIHkpO1xuICAgICAgICAgICAgcGFydGljbGUuYm9keS52ZWxvY2l0eS54ID0gX3BhcnRpY2xlQmFzZVNwZWVkKihfY29uZUxlbmd0aCpzaW4gLSBkKmNvcyk7XG4gICAgICAgICAgICBwYXJ0aWNsZS5ib2R5LnZlbG9jaXR5LnkgPSBfcGFydGljbGVCYXNlU3BlZWQqKC1fY29uZUxlbmd0aCpjb3MgLSBkKnNpbik7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IudGV4dHVyZUtleSA9IF90ZXh0dXJlS2V5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRocnVzdEdlbmVyYXRvcjsiLCIvKipcbiAqIFRvYXN0LmpzXG4gKlxuICogQ2xhc3MgZm9yIHZhcmlvdXMga2luZHMgb2YgcG9wIHVwIG1lc3NhZ2VzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFRvYXN0ID0gZnVuY3Rpb24gKGdhbWUsIHgsIHksIHRleHQsIGNvbmZpZykge1xuICAgIC8vIFRPRE86IGJldHRlciBkZWZhdWx0cywgbWF5YmVcbiAgICBQaGFzZXIuVGV4dC5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIHRleHQsIHtcbiAgICAgICAgZm9udDogJzE0cHQgQXJpYWwnLFxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXG4gICAgICAgIGZpbGw6ICcjZmZhNTAwJ1xuICAgIH0pO1xuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICAvLyBTZXQgdXAgc3R5bGVzIGFuZCB0d2VlbnNcbiAgICB2YXIgc3BlYyA9IHt9O1xuICAgIGlmIChjb25maWcudXApIHtcbiAgICAgICAgc3BlYy55ID0gJy0nICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmRvd24pIHtcbiAgICAgICAgc3BlYy55ID0gJysnICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmxlZnQpIHtcbiAgICAgICAgc3BlYy54ID0gJy0nICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLnJpZ2h0KSB7XG4gICAgICAgIHNwZWMueCA9ICcrJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgc3dpdGNoIChjb25maWcudHlwZSkge1xuICAgICAgICBjYXNlICdzcGlubmVyJzpcbiAgICAgICAgICAgIHRoaXMuZm9udFNpemUgPSAnMjBwdCc7XG4gICAgICAgICAgICBzcGVjLnJvdGF0aW9uID0gY29uZmlnLnJldm9sdXRpb25zID8gY29uZmlnLnJldm9sdXRpb25zICogMiAqIE1hdGguUEkgOiAyICogTWF0aC5QSTtcbiAgICAgICAgICAgIHZhciB0d2VlbiA9IGdhbWUuYWRkLnR3ZWVuKHRoaXMpLnRvKHNwZWMsIGNvbmZpZy5kdXJhdGlvbiwgY29uZmlnLmVhc2luZywgdHJ1ZSk7XG4gICAgICAgICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZChmdW5jdGlvbiAodG9hc3QpIHtcbiAgICAgICAgICAgICAgICB0b2FzdC5raWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gVE9ETzogTW9yZSBraW5kc1xuICAgIH1cbn07XG5cbi8qKlxuICogQ3JlYXRlIG5ldyBUb2FzdCBhbmQgYWRkIHRvIGdhbWVcbiAqXG4gKiBAcGFyYW0gZ2FtZVxuICogQHBhcmFtIHhcbiAqIEBwYXJhbSB5XG4gKiBAcGFyYW0gdGV4dFxuICogQHBhcmFtIGNvbmZpZ1xuICovXG5Ub2FzdC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSwgdGV4dCwgY29uZmlnKSB7XG4gICAgdmFyIHRvYXN0ID0gbmV3IFRvYXN0KGdhbWUsIHgsIHksIHRleHQsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodG9hc3QpO1xufTtcblxuLy8gQ292ZW5pZW5jZSBtZXRob2RzIGZvciBjb21tb24gY2FzZXNcblxuVG9hc3Quc3BpblVwID0gZnVuY3Rpb24gKGdhbWUsIHgsIHksIHRleHQpIHtcbiAgICB2YXIgdG9hc3QgPSBuZXcgVG9hc3QgKGdhbWUsIHgsIHksIHRleHQsIHtcbiAgICAgICAgdHlwZTogJ3NwaW5uZXInLFxuICAgICAgICByZXZvbHV0aW9uczogMSxcbiAgICAgICAgZHVyYXRpb246IDUwMCxcbiAgICAgICAgZWFzaW5nOiBQaGFzZXIuRWFzaW5nLkVsYXN0aWMuT3V0LFxuICAgICAgICB1cDogMTAwXG4gICAgfSk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodG9hc3QpO1xufTtcblxuVG9hc3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuVGV4dC5wcm90b3R5cGUpO1xuVG9hc3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVG9hc3Q7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9hc3Q7XG4iLCIvKipcbiAqIFRyYWN0b3JCZWFtLmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb24gb2YgYSBzaW5nbGUgdHJhY3RvciBiZWFtIHNlZ21lbnRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL0ZJWE1FOiBOaWNlciBpbXBsZW1lbnRhdGlvblxuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5UcmFjdG9yQmVhbTtcblxudmFyIFRyYWN0b3JCZWFtID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhbGwodGhpcywgZ2FtZSwgJ3RyYWN0b3InKTtcbiAgICB0aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuVHJhY3RvckJlYW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTaW1wbGVQYXJ0aWNsZS5wcm90b3R5cGUpO1xuVHJhY3RvckJlYW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVHJhY3RvckJlYW07XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShUcmFjdG9yQmVhbS5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJhY3RvckJlYW0ucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhY3RvckJlYW07IiwiLyoqXG4gKiBUcmVlLmpzXG4gKlxuICogQ2xpZW50IHNpZGVcbiAqL1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlRyZWU7XG5cbnZhciBUcmVlID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAxKTtcbn07XG5cblRyZWUuYWRkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIHZhciB0cmVlID0gbmV3IFRyZWUgKGdhbWUsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodHJlZSk7XG4gICAgcmV0dXJuIHRyZWU7XG59O1xuXG5UcmVlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5UcmVlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRyZWU7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShUcmVlLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShUcmVlLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG4vKipcbiAqIERyYXcgdHJlZSwgb3ZlcnJpZGluZyBzdGFuZGFyZCBzaGFwZSBhbmQgZ2VvbWV0cnkgbWV0aG9kIHRvIHVzZSBncmFwaFxuICpcbiAqIEBwYXJhbSByZW5kZXJTY2FsZVxuICovXG5UcmVlLnByb3RvdHlwZS5kcmF3UHJvY2VkdXJlID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlKSB7XG4gICAgdmFyIGxpbmVDb2xvciA9IFBoYXNlci5Db2xvci5oZXhUb1JHQih0aGlzLmxpbmVDb2xvcik7XG4gICAgdGhpcy5ncmFwaGljcy5saW5lU3R5bGUoMSwgbGluZUNvbG9yLCAxKTtcbiAgICB0aGlzLl9kcmF3QnJhbmNoKHRoaXMuZ3JhcGgsIHRoaXMuZ2FtZS5waHlzaWNzLnAyLm1weGkodGhpcy52ZWN0b3JTY2FsZSkqcmVuZGVyU2NhbGUsIHRoaXMuZGVwdGgpO1xufTtcblxuVHJlZS5wcm90b3R5cGUuX2RyYXdCcmFuY2ggPSBmdW5jdGlvbiAoZ3JhcGgsIHNjLCBkZXB0aCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gZ3JhcGguYy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkID0gZ3JhcGguY1tpXTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8oZ3JhcGgueCAqIHNjLCBncmFwaC55ICogc2MpO1xuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyhjaGlsZC54ICogc2MsIGNoaWxkLnkgKiBzYyk7XG4gICAgICAgIGlmIChkZXB0aCA+IHRoaXMuc3RlcCkge1xuICAgICAgICAgICAgdGhpcy5fZHJhd0JyYW5jaChjaGlsZCwgc2MsIGRlcHRoIC0gMSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVHJlZS5wcm90b3R5cGUsICdzdGVwJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RlcDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9zdGVwID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHJlZTsiLCIvKipcbiAqIFNwcml0ZSB3aXRoIGF0dGFjaGVkIEdyYXBoaWNzIG9iamVjdCBmb3IgdmVjdG9yLWxpa2UgZ3JhcGhpY3NcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL3ZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi8uLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG5cbnZhciBmcmFtZVRleHR1cmVQb29sID0ge307XG52YXIgbWFwVGV4dHVyZVBvb2wgPSB7fTtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBWZWN0b3ItYmFzZWQgc3ByaXRlc1xuICpcbiAqIEBwYXJhbSBnYW1lIHtQaGFzZXIuR2FtZX0gLSBQaGFzZXIgZ2FtZSBvYmplY3RcbiAqIEBwYXJhbSBjb25maWcge29iamVjdH0gLSBQT0pPIHdpdGggY29uZmlnIGRldGFpbHNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgVmVjdG9yU3ByaXRlID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIC8vdGhpcy5ncmFwaGljcyA9IGdhbWUubWFrZS5ncmFwaGljcygpO1xuICAgIHRoaXMuZ3JhcGhpY3MgPSB0aGlzLmdhbWUuc2hhcmVkR3JhcGhpY3M7XG4gICAgLy90aGlzLnRleHR1cmUgPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICAvL3RoaXMubWluaXRleHR1cmUgPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICBpZiAodGhpcy52aXNpYmxlT25NYXApIHtcbiAgICAgICAgdGhpcy5taW5pc3ByaXRlID0gdGhpcy5nYW1lLm1pbmltYXAuY3JlYXRlKCk7XG4gICAgICAgIHRoaXMubWluaXNwcml0ZS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNoYXJlZFRleHR1cmVLZXkpIHtcbiAgICAgICAgdGhpcy5mcmFtZXMgPSB0aGlzLmdldEZyYW1lUG9vbCh0aGlzLnNoYXJlZFRleHR1cmVLZXkpO1xuICAgICAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICB0aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nZXRNYXBQb29sKHRoaXMuc2hhcmVkVGV4dHVyZUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZnJhbWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRUZXh0dXJlKHRoaXMuZnJhbWVzW3RoaXMudkZyYW1lXSk7XG4gICAgICAgICAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taW5pc3ByaXRlLnNldFRleHR1cmUodGhpcy5taW5pdGV4dHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZyYW1lcyA9IFtdO1xuICAgICAgICBpZiAodGhpcy5taW5pc3ByaXRlKSB7XG4gICAgICAgICAgICB0aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xuICAgIH1cblxuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUodGhpcywgZmFsc2UsIGZhbHNlKTtcbiAgICB0aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xuICAgIHRoaXMuY29uZmlnKGNvbmZpZy5wcm9wZXJ0aWVzKTtcbiAgICAvL3RoaXMudXBkYXRlVGV4dHVyZXMoKTtcbiAgICBpZiAodGhpcy5mcHMpIHtcbiAgICAgICAgdGhpcy5fbXNQZXJGcmFtZSA9IDEwMDAgLyB0aGlzLmZwcztcbiAgICAgICAgdGhpcy5fbGFzdFZGcmFtZSA9IHRoaXMuZ2FtZS50aW1lLm5vdztcbiAgICB9XG4gICAgdGhpcy51cGRhdGVCb2R5KCk7XG4gICAgdGhpcy5ib2R5Lm1hc3MgPSAwO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgVmVjdG9yU3ByaXRlIGFuZCBhZGQgdG8gZ2FtZSB3b3JsZFxuICpcbiAqIEBwYXJhbSBnYW1lIHtQaGFzZXIuR2FtZX1cbiAqIEBwYXJhbSB4IHtudW1iZXJ9IC0geCBjb29yZFxuICogQHBhcmFtIHkge251bWJlcn0gLSB5IGNvb3JkXG4gKiBAcmV0dXJucyB7VmVjdG9yU3ByaXRlfVxuICovXG5WZWN0b3JTcHJpdGUuYWRkID0gZnVuY3Rpb24gKGdhbWUsIHgsIHkpIHtcbiAgICB2YXIgdiA9IG5ldyBWZWN0b3JTcHJpdGUoZ2FtZSwgeCwgeSk7XG4gICAgZ2FtZS5hZGQuZXhpc3Rpbmcodik7XG4gICAgcmV0dXJuIHY7XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVmVjdG9yU3ByaXRlO1xuXG4vLyBEZWZhdWx0IG9jdGFnb25cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX3NoYXBlID0gW1xuICAgIFsyLDFdLFxuICAgIFsxLDJdLFxuICAgIFstMSwyXSxcbiAgICBbLTIsMV0sXG4gICAgWy0yLC0xXSxcbiAgICBbLTEsLTJdLFxuICAgIFsxLC0yXSxcbiAgICBbMiwtMV1cbl07XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnI2ZmZmZmZic7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fZmlsbENvbG9yID0gbnVsbDtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMjU7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl92ZWN0b3JTY2FsZSA9IDE7XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUucGh5c2ljc0JvZHlUeXBlID0gJ2NpcmNsZSc7XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUubnVtRnJhbWVzID0gMTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUubWFwRnJhbWUgPSAwO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS52RnJhbWUgPSAwO1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnZpc2libGVPbk1hcCA9IHRydWU7XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuZ2V0RnJhbWVQb29sID0gZnVuY3Rpb24gKGtleSkge1xuICAgIGlmICghZnJhbWVUZXh0dXJlUG9vbFtrZXldKSB7XG4gICAgICAgIHJldHVybiBmcmFtZVRleHR1cmVQb29sW2tleV0gPSBbXTtcbiAgICB9XG4gICAgcmV0dXJuIGZyYW1lVGV4dHVyZVBvb2xba2V5XTtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuZ2V0TWFwUG9vbCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoIW1hcFRleHR1cmVQb29sW2tleV0pIHtcbiAgICAgICAgbWFwVGV4dHVyZVBvb2xba2V5XSA9IHRoaXMuZ2FtZS5hZGQucmVuZGVyVGV4dHVyZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbWFwVGV4dHVyZVBvb2xba2V5XTtcbn1cblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5zZXRTaGFwZSA9IGZ1bmN0aW9uIChzaGFwZSkge1xuICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcbiAgICB0aGlzLnVwZGF0ZVRleHR1cmVzKCk7XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnNldExpbmVTdHlsZSA9IGZ1bmN0aW9uIChjb2xvciwgbGluZVdpZHRoKSB7XG4gICAgaWYgKCFsaW5lV2lkdGggfHwgbGluZVdpZHRoIDwgMSkge1xuICAgICAgICBsaW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aCB8fCAxO1xuICAgIH1cbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgdGhpcy5saW5lV2lkdGggPSBsaW5lV2lkdGg7XG4gICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgY2FjaGVkIGJpdG1hcHMgZm9yIG9iamVjdCBhZnRlciB2ZWN0b3IgcHJvcGVydGllcyBjaGFuZ2VcbiAqL1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGVUZXh0dXJlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBEcmF3IGZ1bGwgc2l6ZWRcbiAgICBpZiAodGhpcy5udW1GcmFtZXMgPT09IDEpIHtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5jbGVhcigpO1xuICAgICAgICB0aGlzLmdyYXBoaWNzLl9jdXJyZW50Qm91bmRzID0gbnVsbDtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmRyYXdQcm9jZWR1cmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdQcm9jZWR1cmUoMSwgMCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaGFwZSkge1xuICAgICAgICAgICAgdGhpcy5kcmF3KDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5mcmFtZXNbMF0pIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzWzBdID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvdW5kcyA9IHRoaXMuZ3JhcGhpY3MuZ2V0TG9jYWxCb3VuZHMoKTtcbiAgICAgICAgdGhpcy5mcmFtZXNbMF0ucmVzaXplKGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZnJhbWVzWzBdLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIC1ib3VuZHMueCwgLWJvdW5kcy55LCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubnVtRnJhbWVzOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuX2N1cnJlbnRCb3VuZHMgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5kcmF3UHJvY2VkdXJlKDEsIGkpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmZyYW1lc1tpXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVzW2ldID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib3VuZHMgPSB0aGlzLmdyYXBoaWNzLmdldExvY2FsQm91bmRzKCk7XG4gICAgICAgICAgICB0aGlzLmZyYW1lc1tpXS5yZXNpemUoYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0LCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzW2ldLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIC1ib3VuZHMueCwgLWJvdW5kcy55LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldFRleHR1cmUodGhpcy5mcmFtZXNbdGhpcy52RnJhbWVdKTtcbiAgICAvLyBEcmF3IHNtYWxsIGZvciBtaW5pbWFwXG4gICAgaWYgKHRoaXMubWluaXNwcml0ZSkge1xuICAgICAgICB2YXIgbWFwU2NhbGUgPSB0aGlzLmdhbWUubWluaW1hcC5tYXBTY2FsZTtcbiAgICAgICAgdmFyIG1hcEZhY3RvciA9IHRoaXMubWFwRmFjdG9yIHx8IDE7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5fY3VycmVudEJvdW5kcyA9IG51bGw7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5kcmF3UHJvY2VkdXJlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpcy5kcmF3UHJvY2VkdXJlKG1hcFNjYWxlICogbWFwRmFjdG9yLCB0aGlzLm1hcEZyYW1lKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNoYXBlKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXcobWFwU2NhbGUgKiBtYXBGYWN0b3IpO1xuICAgICAgICB9XG4gICAgICAgIGJvdW5kcyA9IHRoaXMuZ3JhcGhpY3MuZ2V0TG9jYWxCb3VuZHMoKTtcbiAgICAgICAgdGhpcy5taW5pdGV4dHVyZS5yZXNpemUoYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0LCB0cnVlKTtcbiAgICAgICAgdGhpcy5taW5pdGV4dHVyZS5yZW5kZXJYWSh0aGlzLmdyYXBoaWNzLCAtYm91bmRzLngsIC1ib3VuZHMueSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMubWluaXNwcml0ZS5zZXRUZXh0dXJlKHRoaXMubWluaXRleHR1cmUpO1xuICAgIH1cbiAgICB0aGlzLl9kaXJ0eSA9IGZhbHNlO1xufTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGVCb2R5ID0gZnVuY3Rpb24gKCkge1xuICAgIHN3aXRjaCAodGhpcy5waHlzaWNzQm9keVR5cGUpIHtcbiAgICAgICAgY2FzZSBcImNpcmNsZVwiOlxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNpcmNsZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgciA9IHRoaXMuZ3JhcGhpY3MuZ2V0Qm91bmRzKCk7XG4gICAgICAgICAgICAgICAgdmFyIHJhZGl1cyA9IE1hdGgucm91bmQoTWF0aC5zcXJ0KHIud2lkdGgqIHIuaGVpZ2h0KS8yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmFkaXVzID0gdGhpcy5yYWRpdXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJvZHkuc2V0Q2lyY2xlKHJhZGl1cyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gVE9ETzogTW9yZSBzaGFwZXNcbiAgICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB2ZWN0b3IgdG8gYml0bWFwIG9mIGdyYXBoaWNzIG9iamVjdCBhdCBnaXZlbiBzY2FsZVxuICpcbiAqIEBwYXJhbSByZW5kZXJTY2FsZSB7bnVtYmVyfSAtIHNjYWxlIGZhY3RvciBmb3IgcmVuZGVyXG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChyZW5kZXJTY2FsZSkge1xuICAgIHJlbmRlclNjYWxlID0gcmVuZGVyU2NhbGUgfHwgMTtcbiAgICAvLyBEcmF3IHNpbXBsZSBzaGFwZSwgaWYgZ2l2ZW5cbiAgICBpZiAodGhpcy5zaGFwZSkge1xuICAgICAgICB2YXIgbGluZUNvbG9yID0gUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMubGluZUNvbG9yKTtcbiAgICAgICAgaWYgKHJlbmRlclNjYWxlID09PSAxKSB7XG4gICAgICAgICAgICB2YXIgbGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaW5lV2lkdGggPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICgocmVuZGVyU2NhbGUgPT09IDEpICYmIHRoaXMuZmlsbENvbG9yKSB7ICAgICAgICAvLyBPbmx5IGZpbGwgZnVsbCBzaXplZFxuICAgICAgICAgICAgdmFyIGZpbGxDb2xvciA9IFBoYXNlci5Db2xvci5oZXhUb1JHQih0aGlzLmZpbGxDb2xvcik7XG4gICAgICAgICAgICB2YXIgZmlsbEFscGhhID0gdGhpcy5maWxsQWxwaGEgfHwgMTtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuYmVnaW5GaWxsKGZpbGxDb2xvciwgZmlsbEFscGhhKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVTdHlsZShsaW5lV2lkdGgsIGxpbmVDb2xvciwgMSk7XG4gICAgICAgIHRoaXMuX2RyYXdQb2x5Z29uKHRoaXMuc2hhcGUsIHRoaXMuc2hhcGVDbG9zZWQsIHJlbmRlclNjYWxlKTtcbiAgICAgICAgaWYgKChyZW5kZXJTY2FsZSA9PT0gMSkgJiYgdGhpcy5maWxsQ29sb3IpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuZW5kRmlsbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIERyYXcgZ2VvbWV0cnkgc3BlYywgaWYgZ2l2ZW4sIGJ1dCBvbmx5IGZvciB0aGUgZnVsbCBzaXplZCBzcHJpdGVcbiAgICBpZiAoKHJlbmRlclNjYWxlID09PSAxKSAmJiB0aGlzLmdlb21ldHJ5KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5nZW9tZXRyeS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBnID0gdGhpcy5nZW9tZXRyeVtpXTtcbiAgICAgICAgICAgIHN3aXRjaCAoZy50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcInBvbHlcIjpcbiAgICAgICAgICAgICAgICAgICAgLy8gRklYTUU6IGRlZmF1bHRzIGFuZCBzdHVmZlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmF3UG9seWdvbihnLnBvaW50cywgZy5jbG9zZWQsIHJlbmRlclNjYWxlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIERyYXcgb3BlbiBvciBjbG9zZWQgcG9seWdvbiBhcyBzZXF1ZW5jZSBvZiBsaW5lVG8gY2FsbHNcbiAqXG4gKiBAcGFyYW0gcG9pbnRzIHtBcnJheX0gLSBwb2ludHMgYXMgYXJyYXkgb2YgW3gseV0gcGFpcnNcbiAqIEBwYXJhbSBjbG9zZWQge2Jvb2xlYW59IC0gaXMgcG9seWdvbiBjbG9zZWQ/XG4gKiBAcGFyYW0gcmVuZGVyU2NhbGUge251bWJlcn0gLSBzY2FsZSBmYWN0b3IgZm9yIHJlbmRlclxuICogQHByaXZhdGVcbiAqL1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fZHJhd1BvbHlnb24gPSBmdW5jdGlvbiAocG9pbnRzLCBjbG9zZWQsIHJlbmRlclNjYWxlKSB7XG4gICAgdmFyIHNjID0gdGhpcy5nYW1lLnBoeXNpY3MucDIubXB4aSh0aGlzLnZlY3RvclNjYWxlKSpyZW5kZXJTY2FsZTtcbiAgICBwb2ludHMgPSBwb2ludHMuc2xpY2UoKTtcbiAgICBpZiAoY2xvc2VkKSB7XG4gICAgICAgIHBvaW50cy5wdXNoKHBvaW50c1swXSk7XG4gICAgfVxuICAgIHRoaXMuZ3JhcGhpY3MubW92ZVRvKHBvaW50c1swXVswXSAqIHNjLCBwb2ludHNbMF1bMV0gKiBzYyk7XG4gICAgZm9yICh2YXIgaSA9IDEsIGwgPSBwb2ludHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubGluZVRvKHBvaW50c1tpXVswXSAqIHNjLCBwb2ludHNbaV1bMV0gKiBzYyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBJbnZhbGlkYXRlIGNhY2hlIGFuZCByZWRyYXcgaWYgc3ByaXRlIGlzIG1hcmtlZCBkaXJ0eVxuICovXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fZGlydHkpIHtcbiAgICAgICAgdGhpcy51cGRhdGVUZXh0dXJlcygpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbXNQZXJGcmFtZSAmJiAodGhpcy5nYW1lLnRpbWUubm93ID49IHRoaXMuX2xhc3RWRnJhbWUgKyB0aGlzLl9tc1BlckZyYW1lKSkge1xuICAgICAgICB0aGlzLnZGcmFtZSA9ICh0aGlzLnZGcmFtZSArIDEpICUgdGhpcy5udW1GcmFtZXM7XG4gICAgICAgIHRoaXMuc2V0VGV4dHVyZSh0aGlzLmZyYW1lc1t0aGlzLnZGcmFtZV0pO1xuICAgICAgICB0aGlzLl9sYXN0VkZyYW1lID0gdGhpcy5nYW1lLnRpbWUubm93O1xuICAgIH1cbn07XG5cbi8vIFZlY3RvciBwcm9wZXJ0aWVzIGRlZmluZWQgdG8gaGFuZGxlIG1hcmtpbmcgc3ByaXRlIGRpcnR5IHdoZW4gbmVjZXNzYXJ5XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnbGluZUNvbG9yJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGluZUNvbG9yO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2xpbmVDb2xvciA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2ZpbGxDb2xvcicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGxDb2xvcjtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9maWxsQ29sb3IgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdsaW5lV2lkdGgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9saW5lV2lkdGg7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fbGluZVdpZHRoID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZmlsbEFscGhhJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlsbEFscGhhO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2ZpbGxBbHBoYSA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3NoYXBlQ2xvc2VkJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2hhcGVDbG9zZWQ7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fc2hhcGVDbG9zZWQgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICd2ZWN0b3JTY2FsZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZlY3RvclNjYWxlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX3ZlY3RvclNjYWxlID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnc2hhcGUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFwZTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9zaGFwZSA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2dlb21ldHJ5Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2VvbWV0cnk7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fZ2VvbWV0cnkgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdkZWFkJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVhZDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9kZWFkID0gdmFsO1xuICAgICAgICBpZiAodmFsKSB7XG4gICAgICAgICAgICB0aGlzLmtpbGwoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmV2aXZlKCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZlY3RvclNwcml0ZTtcbi8vU3RhcmNvZGVyLlZlY3RvclNwcml0ZSA9IFZlY3RvclNwcml0ZTsiLCIvKipcbiAqIENvbnRyb2xzLmpzXG4gKlxuICogVmlydHVhbGl6ZSBhbmQgaW1wbGVtZW50IHF1ZXVlIGZvciBnYW1lIGNvbnRyb2xzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxudmFyIENvbnRyb2xzID0gZnVuY3Rpb24gKGdhbWUsIHBhcmVudCkge1xuICAgIFBoYXNlci5QbHVnaW4uY2FsbCh0aGlzLCBnYW1lLCBwYXJlbnQpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuUGx1Z2luLnByb3RvdHlwZSk7XG5Db250cm9scy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb250cm9scztcblxuQ29udHJvbHMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAocXVldWUpIHtcbiAgICB0aGlzLnF1ZXVlID0gcXVldWU7XG4gICAgdGhpcy5jb250cm9scyA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG4gICAgdGhpcy5jb250cm9scy5maXJlID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuQik7XG4gICAgdGhpcy5jb250cm9scy50cmFjdG9yID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVCk7XG4gICAgdGhpcy5qb3lzdGlja1N0YXRlID0ge1xuICAgICAgICB1cDogZmFsc2UsXG4gICAgICAgIGRvd246IGZhbHNlLFxuICAgICAgICBsZWZ0OiBmYWxzZSxcbiAgICAgICAgcmlnaHQ6IGZhbHNlLFxuICAgICAgICBmaXJlOiBmYWxzZVxuICAgIH07XG5cbiAgICAvLyBBZGQgdmlydHVhbCBqb3lzdGljayBpZiBwbHVnaW4gaXMgYXZhaWxhYmxlXG4gICAgaWYgKFBoYXNlci5WaXJ0dWFsSm95c3RpY2spIHtcbiAgICAgICAgdGhpcy5qb3lzdGljayA9IHRoaXMuZ2FtZS5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKFBoYXNlci5WaXJ0dWFsSm95c3RpY2spO1xuICAgIH1cbn07XG5cbnZhciBzZXEgPSAwO1xudmFyIHVwID0gZmFsc2UsIGRvd24gPSBmYWxzZSwgbGVmdCA9IGZhbHNlLCByaWdodCA9IGZhbHNlLCBmaXJlID0gZmFsc2UsIHRyYWN0b3IgPSBmYWxzZTtcblxuQ29udHJvbHMucHJvdG90eXBlLmFkZFZpcnR1YWxDb250cm9scyA9IGZ1bmN0aW9uICh0ZXh0dXJlKSB7XG4gICAgdGV4dHVyZSA9IHRleHR1cmUgfHwgJ2pveXN0aWNrJztcbiAgICB2YXIgc2NhbGUgPSAxOyAgICAgICAgICAgIC8vIEZJWE1FXG4gICAgdGhpcy5zdGljayA9IHRoaXMuam95c3RpY2suYWRkU3RpY2soMCwgMCwgMTAwLHRleHR1cmUpO1xuICAgIC8vdGhpcy5zdGljay5tb3Rpb25Mb2NrID0gUGhhc2VyLlZpcnR1YWxKb3lzdGljay5IT1JJWk9OVEFMO1xuICAgIHRoaXMuc3RpY2suc2NhbGUgPSBzY2FsZTtcbiAgICAvL3RoaXMuZ29idXR0b24gPSB0aGlzLmpveXN0aWNrLmFkZEJ1dHRvbih4ICsgMjAwKnNjYWxlLCB5LCB0ZXh0dXJlLCAnYnV0dG9uMS11cCcsICdidXR0b24xLWRvd24nKTtcbiAgICB0aGlzLmZpcmVidXR0b24gPSB0aGlzLmpveXN0aWNrLmFkZEJ1dHRvbigwLCAwLCB0ZXh0dXJlLCAnYnV0dG9uMS11cCcsICdidXR0b24xLWRvd24nKTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24gPSB0aGlzLmpveXN0aWNrLmFkZEJ1dHRvbigwLCAwLCB0ZXh0dXJlLCAnYnV0dG9uMi11cCcsICdidXR0b24yLWRvd24nKTtcbiAgICB0aGlzLmZpcmVidXR0b24uc2NhbGUgPSBzY2FsZTtcbiAgICAvL3RoaXMuZ29idXR0b24uc2NhbGUgPSBzY2FsZTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24uc2NhbGUgPSBzY2FsZTtcbiAgICB0aGlzLmxheW91dFZpcnR1YWxDb250cm9scyhzY2FsZSk7XG4gICAgdGhpcy5zdGljay5vbk1vdmUuYWRkKGZ1bmN0aW9uIChzdGljaywgZiwgZlgsIGZZKSB7XG4gICAgICAgIGlmIChmWCA+PSAwLjM1KSB7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUucmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmxlZnQgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChmWCA8PSAtMC4zNSkge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUubGVmdCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUucmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5sZWZ0ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZZID49IDAuMzUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGZZIDw9IC0wLjM1KSB7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUuZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gZmFsc2U7O1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LCB0aGlzKTtcbiAgICB0aGlzLnN0aWNrLm9uVXAuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUubGVmdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUuZG93biA9IGZhbHNlO1xuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMuZmlyZWJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmZpcmUgPSB0cnVlO1xuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMuZmlyZWJ1dHRvbi5vblVwLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5maXJlID0gZmFsc2U7XG4gICAgfSwgdGhpcyk7XG4gICAgLy90aGlzLmdvYnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24gKCkge1xuICAgIC8vICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IHRydWU7XG4gICAgLy99LCB0aGlzKTtcbiAgICAvL3RoaXMuZ29idXR0b24ub25VcC5hZGQoZnVuY3Rpb24gKCkge1xuICAgIC8vICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IGZhbHNlO1xuICAgIC8vfSwgdGhpcyk7XG4gICAgdGhpcy50cmFjdG9yYnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudHJhY3RvciA9IHRydWU7XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy50cmFjdG9yYnV0dG9uLm9uVXAuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnRyYWN0b3IgPSBmYWxzZTtcbiAgICB9LCB0aGlzKTtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5sYXlvdXRWaXJ0dWFsQ29udHJvbHMgPSBmdW5jdGlvbiAoc2NhbGUpIHtcbiAgICB2YXIgeSA9IHRoaXMuZ2FtZS5oZWlnaHQgLSAxMjUgKiBzY2FsZTtcbiAgICB2YXIgdyA9IHRoaXMuZ2FtZS53aWR0aDtcbiAgICB0aGlzLnN0aWNrLnBvc1ggPSAxNTAgKiBzY2FsZTtcbiAgICB0aGlzLnN0aWNrLnBvc1kgPSB5O1xuICAgIHRoaXMuZmlyZWJ1dHRvbi5wb3NYID0gdyAtIDI1MCAqIHNjYWxlO1xuICAgIHRoaXMuZmlyZWJ1dHRvbi5wb3NZID0geTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24ucG9zWCA9IHcgLSAxMjUgKiBzY2FsZTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24ucG9zWSA9IHk7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdXAgPSBkb3duID0gbGVmdCA9IHJpZ2h0ID0gZmFsc2U7XG4gICAgdGhpcy5xdWV1ZS5sZW5ndGggPSAwO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLnByZVVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPOiBTdXBwb3J0IG90aGVyIGludGVyYWN0aW9ucy9tZXRob2RzXG4gICAgdmFyIGNvbnRyb2xzID0gdGhpcy5jb250cm9scztcbiAgICB2YXIgc3RhdGUgPSB0aGlzLmpveXN0aWNrU3RhdGU7XG4gICAgaWYgKChzdGF0ZS51cCB8fCBjb250cm9scy51cC5pc0Rvd24pICYmICF1cCkge1xuICAgICAgICB1cCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3VwX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS51cCAmJiAhY29udHJvbHMudXAuaXNEb3duICYmIHVwKSB7XG4gICAgICAgIHVwID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3VwX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUuZG93biB8fCBjb250cm9scy5kb3duLmlzRG93bikgJiYgIWRvd24pIHtcbiAgICAgICAgZG93biA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2Rvd25fcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLmRvd24gJiYgIWNvbnRyb2xzLmRvd24uaXNEb3duICYmIGRvd24pIHtcbiAgICAgICAgZG93biA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdkb3duX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUucmlnaHQgfHwgY29udHJvbHMucmlnaHQuaXNEb3duKSAmJiAhcmlnaHQpIHtcbiAgICAgICAgcmlnaHQgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdyaWdodF9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghc3RhdGUucmlnaHQgJiYgIWNvbnRyb2xzLnJpZ2h0LmlzRG93biAmJiByaWdodCkge1xuICAgICAgICByaWdodCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdyaWdodF9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKHN0YXRlLmxlZnQgfHwgY29udHJvbHMubGVmdC5pc0Rvd24pICYmICFsZWZ0KSB7XG4gICAgICAgIGxlZnQgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdsZWZ0X3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS5sZWZ0ICYmICFjb250cm9scy5sZWZ0LmlzRG93biAmJiBsZWZ0KSB7XG4gICAgICAgIGxlZnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnbGVmdF9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKHN0YXRlLmZpcmUgfHwgY29udHJvbHMuZmlyZS5pc0Rvd24pICYmICFmaXJlKSB7XG4gICAgICAgIGZpcmUgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdmaXJlX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS5maXJlICYmICFjb250cm9scy5maXJlLmlzRG93biAmJiBmaXJlKSB7XG4gICAgICAgIGZpcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZmlyZV9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKHN0YXRlLnRyYWN0b3IgfHwgY29udHJvbHMudHJhY3Rvci5pc0Rvd24pICYmICF0cmFjdG9yKSB7XG4gICAgICAgIHRyYWN0b3IgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICd0cmFjdG9yX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCghc3RhdGUudHJhY3RvciAmJiAhY29udHJvbHMudHJhY3Rvci5pc0Rvd24pICYmIHRyYWN0b3IpIHtcbiAgICAgICAgdHJhY3RvciA9IGZhbHNlOy8vXG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3RyYWN0b3JfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG59O1xuXG52YXIgYWN0aW9uOyAgICAgICAgICAgICAvLyBNb2R1bGUgc2NvcGUgdG8gYXZvaWQgYWxsb2NhdGlvbnNcblxuQ29udHJvbHMucHJvdG90eXBlLnByb2Nlc3NRdWV1ZSA9IGZ1bmN0aW9uIChjYiwgY2xlYXIpIHtcbiAgICB2YXIgcXVldWUgPSB0aGlzLnF1ZXVlO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcXVldWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGFjdGlvbiA9IHF1ZXVlW2ldO1xuICAgICAgICBpZiAoYWN0aW9uLmV4ZWN1dGVkKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYihhY3Rpb24pO1xuICAgICAgICBhY3Rpb24uZXRpbWUgPSB0aGlzLmdhbWUudGltZS5ub3c7XG4gICAgICAgIGFjdGlvbi5leGVjdXRlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChjbGVhcikge1xuICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgIH1cbn07XG5cblN0YXJjb2Rlci5Db250cm9scyA9IENvbnRyb2xzO1xubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sczsiLCIvKipcbiAqIFN5bmNDbGllbnQuanNcbiAqXG4gKiBTeW5jIHBoeXNpY3Mgb2JqZWN0cyB3aXRoIHNlcnZlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG52YXIgVVBEQVRFX1FVRVVFX0xJTUlUID0gODtcblxudmFyIFN5bmNDbGllbnQgPSBmdW5jdGlvbiAoZ2FtZSwgcGFyZW50KSB7XG4gICAgUGhhc2VyLlBsdWdpbi5jYWxsKHRoaXMsIGdhbWUsIHBhcmVudCk7XG59O1xuXG5TeW5jQ2xpZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlBsdWdpbi5wcm90b3R5cGUpO1xuU3luY0NsaWVudC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTeW5jQ2xpZW50O1xuXG5cbi8qKlxuICogSW5pdGlhbGl6ZSBwbHVnaW5cbiAqXG4gKiBAcGFyYW0gc29ja2V0IHtTb2NrZXR9IC0gc29ja2V0LmlvIHNvY2tldCBmb3Igc3luYyBjb25uZWN0aW9uXG4gKiBAcGFyYW0gcXVldWUge0FycmF5fSAtIGNvbW1hbmQgcXVldWVcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChzb2NrZXQsIHF1ZXVlKSB7XG4gICAgLy8gVE9ETzogQ29weSBzb21lIGNvbmZpZyBvcHRpb25zXG4gICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XG4gICAgdGhpcy5jbWRRdWV1ZSA9IHF1ZXVlO1xuICAgIHRoaXMuZXh0YW50ID0ge307XG59O1xuXG4vKipcbiAqIFN0YXJ0IHBsdWdpblxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHN0YXJjb2RlciA9IHRoaXMuZ2FtZS5zdGFyY29kZXI7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGxldGUgPSBmYWxzZTtcbiAgICAvLyBGSVhNRTogTmVlZCBtb3JlIHJvYnVzdCBoYW5kbGluZyBvZiBEQy9SQ1xuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmdhbWUucGF1c2VkID0gdHJ1ZTtcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbigncmVjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmdhbWUucGF1c2VkID0gZmFsc2U7XG4gICAgfSk7XG4gICAgLy8gTWVhc3VyZSBjbGllbnQtc2VydmVyIHRpbWUgZGVsdGFcbiAgICB0aGlzLnNvY2tldC5vbigndGltZXN5bmMnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBzZWxmLl9sYXRlbmN5ID0gZGF0YSAtIHNlbGYuZ2FtZS50aW1lLm5vdztcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlYWxUaW1lID0gZGF0YS5yO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGRhdGEuYi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB1cGRhdGUgPSBkYXRhLmJbaV07XG4gICAgICAgICAgICB2YXIgaWQgPSB1cGRhdGUuaWQ7XG4gICAgICAgICAgICB2YXIgc3ByaXRlO1xuICAgICAgICAgICAgdXBkYXRlLnRpbWVzdGFtcCA9IHJlYWxUaW1lO1xuICAgICAgICAgICAgaWYgKHNwcml0ZSA9IHNlbGYuZXh0YW50W2lkXSkge1xuICAgICAgICAgICAgICAgIC8vIEV4aXN0aW5nIHNwcml0ZSAtIHByb2Nlc3MgdXBkYXRlXG4gICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlLnB1c2godXBkYXRlKTtcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLmNvbmZpZyh1cGRhdGUucHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzcHJpdGUudXBkYXRlUXVldWUubGVuZ3RoID4gVVBEQVRFX1FVRVVFX0xJTUlUKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS51cGRhdGVRdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gTmV3IHNwcml0ZSAtIGNyZWF0ZSBhbmQgY29uZmlndXJlXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnTmV3JywgaWQsIHVwZGF0ZS50KTtcbiAgICAgICAgICAgICAgICBzcHJpdGUgPSBzdGFyY29kZXIuYWRkQm9keSh1cGRhdGUudCwgdXBkYXRlKTtcbiAgICAgICAgICAgICAgICBpZiAoc3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS5zZXJ2ZXJJZCA9IGlkO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmV4dGFudFtpZF0gPSBzcHJpdGU7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS51cGRhdGVRdWV1ZSA9IFt1cGRhdGVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwLCBsID0gZGF0YS5ybS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGlkID0gZGF0YS5ybVtpXTtcbiAgICAgICAgICAgIGlmIChzZWxmLmV4dGFudFtpZF0pIHtcbiAgICAgICAgICAgICAgICBzdGFyY29kZXIucmVtb3ZlQm9keShzZWxmLmV4dGFudFtpZF0pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBzZWxmLmV4dGFudFtpZF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogU2VuZCBxdWV1ZWQgY29tbWFuZHMgdG8gc2VydmVyIGFuZCBpbnRlcnBvbGF0ZSBvYmplY3RzIGJhc2VkIG9uIHVwZGF0ZXMgZnJvbSBzZXJ2ZXJcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fdXBkYXRlQ29tcGxldGUpIHtcbiAgICAgICAgdGhpcy5fc2VuZENvbW1hbmRzKCk7XG4gICAgICAgIHRoaXMuX3Byb2Nlc3NQaHlzaWNzVXBkYXRlcygpO1xuICAgICAgICB0aGlzLl91cGRhdGVDb21wbGV0ZSA9IHRydWU7XG4gICAgfVxuIH07XG5cblN5bmNDbGllbnQucHJvdG90eXBlLnBvc3RSZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGxldGUgPSBmYWxzZTtcbn07XG5cblxudmFyIGFjdGlvbnMgPSBbXTsgICAgICAgICAgICAgICAvLyBNb2R1bGUgc2NvcGUgdG8gYXZvaWQgYWxsb2NhdGlvbnNcbnZhciBhY3Rpb247XG4vKipcbiAqIFNlbmQgcXVldWVkIGNvbW1hbmRzIHRoYXQgaGF2ZSBiZWVuIGV4ZWN1dGVkIHRvIHRoZSBzZXJ2ZXJcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5fc2VuZENvbW1hbmRzID0gZnVuY3Rpb24gKCkge1xuICAgIGFjdGlvbnMubGVuZ3RoID0gMDtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5jbWRRdWV1ZS5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgYWN0aW9uID0gdGhpcy5jbWRRdWV1ZVtpXTtcbiAgICAgICAgaWYgKGFjdGlvbi5leGVjdXRlZCkge1xuICAgICAgICAgICAgYWN0aW9ucy51bnNoaWZ0KGFjdGlvbik7XG4gICAgICAgICAgICB0aGlzLmNtZFF1ZXVlLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnZG8nLCBhY3Rpb25zKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnc2VuZGluZyBhY3Rpb25zJywgYWN0aW9ucyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVzIGludGVycG9sYXRpb24gLyBwcmVkaWN0aW9uIHJlc29sdXRpb24gZm9yIHBoeXNpY3MgYm9kaWVzXG4gKlxuICogQHByaXZhdGVcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUuX3Byb2Nlc3NQaHlzaWNzVXBkYXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaW50ZXJwVGltZSA9IHRoaXMuZ2FtZS50aW1lLm5vdyArIHRoaXMuX2xhdGVuY3kgLSB0aGlzLmdhbWUuc3RhcmNvZGVyLmNvbmZpZy5yZW5kZXJMYXRlbmN5O1xuICAgIHZhciBvaWRzID0gT2JqZWN0LmtleXModGhpcy5leHRhbnQpO1xuICAgIGZvciAodmFyIGkgPSBvaWRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBzcHJpdGUgPSB0aGlzLmV4dGFudFtvaWRzW2ldXTtcbiAgICAgICAgdmFyIHF1ZXVlID0gc3ByaXRlLnVwZGF0ZVF1ZXVlO1xuICAgICAgICB2YXIgYmVmb3JlID0gbnVsbCwgYWZ0ZXIgPSBudWxsO1xuXG4gICAgICAgIC8vIEZpbmQgdXBkYXRlcyBiZWZvcmUgYW5kIGFmdGVyIGludGVycFRpbWVcbiAgICAgICAgdmFyIGogPSAxO1xuICAgICAgICB3aGlsZSAocXVldWVbal0pIHtcbiAgICAgICAgICAgIGlmIChxdWV1ZVtqXS50aW1lc3RhbXAgPiBpbnRlcnBUaW1lKSB7XG4gICAgICAgICAgICAgICAgYWZ0ZXIgPSBxdWV1ZVtqXTtcbiAgICAgICAgICAgICAgICBiZWZvcmUgPSBxdWV1ZVtqLTFdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaisrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm9uZSAtIHdlJ3JlIGJlaGluZC5cbiAgICAgICAgaWYgKCFiZWZvcmUgJiYgIWFmdGVyKSB7XG4gICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID49IDIpIHsgICAgLy8gVHdvIG1vc3QgcmVjZW50IHVwZGF0ZXMgYXZhaWxhYmxlPyBVc2UgdGhlbS5cbiAgICAgICAgICAgICAgICBiZWZvcmUgPSBxdWV1ZVtxdWV1ZS5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICBhZnRlciA9IHF1ZXVlW3F1ZXVlLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ0xhZ2dpbmcnLCBvaWRzW2ldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7ICAgICAgICAgICAgICAgICAgICAvLyBObz8gSnVzdCBiYWlsXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnQmFpbGluZycsIG9pZHNbaV0pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnT2snLCBpbnRlcnBUaW1lLCBxdWV1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgcXVldWUuc3BsaWNlKDAsIGogLSAxKTsgICAgIC8vIFRocm93IG91dCBvbGRlciB1cGRhdGVzXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3BhbiA9IGFmdGVyLnRpbWVzdGFtcCAtIGJlZm9yZS50aW1lc3RhbXA7XG4gICAgICAgIHZhciB0ID0gKGludGVycFRpbWUgLSBiZWZvcmUudGltZXN0YW1wKSAvIHNwYW47XG4gICAgICAgIC8vaWYgKHQgPCAwIHx8IHQgPiAxKSB7XG4gICAgICAgIC8vICAgIGNvbnNvbGUubG9nKCd3ZWlyZCB0aW1lJywgdCk7XG4gICAgICAgIC8vfVxuICAgICAgICB0ID0gTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgdCkpOyAgICAgICAgLy8gRklYTUU6IFN0b3BnYXAgZml4IC0gU2hvdWxkbid0IG5lZWQgdGhpc1xuICAgICAgICBzcHJpdGUuc2V0UG9zQW5nbGUobGluZWFyKGJlZm9yZS54LCBhZnRlci54LCB0KSwgbGluZWFyKGJlZm9yZS55LCBhZnRlci55LCB0KSwgbGluZWFyKGJlZm9yZS5hLCBhZnRlci5hLCB0KSk7XG4gICAgfVxufTtcblxuLy8gSGVscGVyc1xuXG4vKipcbiAqIEludGVycG9sYXRlIGJldHdlZW4gdHdvIHBvaW50cyB3aXRoIGhlcm1pdGUgc3BsaW5lXG4gKiBOQiAtIGN1cnJlbnRseSB1bnVzZWQgYW5kIHByb2JhYmx5IGJyb2tlblxuICpcbiAqIEBwYXJhbSBwMCB7bnVtYmVyfSAtIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSBwMSB7bnVtYmVyfSAtIGZpbmFsIHZhbHVlXG4gKiBAcGFyYW0gdjAge251bWJlcn0gLSBpbml0aWFsIHNsb3BlXG4gKiBAcGFyYW0gdjEge251bWJlcn0gLSBmaW5hbCBzbG9wZVxuICogQHBhcmFtIHQge251bWJlcn0gLSBwb2ludCBvZiBpbnRlcnBvbGF0aW9uIChiZXR3ZWVuIDAgYW5kIDEpXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIGludGVycG9sYXRlZCB2YWx1ZVxuICovXG5mdW5jdGlvbiBoZXJtaXRlIChwMCwgcDEsIHYwLCB2MSwgdCkge1xuICAgIHZhciB0MiA9IHQqdDtcbiAgICB2YXIgdDMgPSB0KnQyO1xuICAgIHJldHVybiAoMip0MyAtIDMqdDIgKyAxKSpwMCArICh0MyAtIDIqdDIgKyB0KSp2MCArICgtMip0MyArIDMqdDIpKnAxICsgKHQzIC0gdDIpKnYxO1xufVxuXG4vKipcbiAqIEludGVycG9sYXRlIGJldHdlZW4gdHdvIHBvaW50cyB3aXRoIGxpbmVhciBzcGxpbmVcbiAqXG4gKiBAcGFyYW0gcDAge251bWJlcn0gLSBpbml0aWFsIHZhbHVlXG4gKiBAcGFyYW0gcDEge251bWJlcn0gLSBmaW5hbCB2YWx1ZVxuICogQHBhcmFtIHQge251bWJlcn0gLSBwb2ludCBvZiBpbnRlcnBvbGF0aW9uIChiZXR3ZWVuIDAgYW5kIDEpXG4gKiBAcGFyYW0gc2NhbGUge251bWJlcn0gLSBzY2FsZSBmYWN0b3IgdG8gbm9ybWFsaXplIHVuaXRzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIGludGVycG9sYXRlZCB2YWx1ZVxuICovXG5mdW5jdGlvbiBsaW5lYXIgKHAwLCBwMSwgdCwgc2NhbGUpIHtcbiAgICBzY2FsZSA9IHNjYWxlIHx8IDE7XG4gICAgcmV0dXJuIHAwICsgKHAxIC0gcDApKnQqc2NhbGU7XG59XG5cblN0YXJjb2Rlci5TZXJ2ZXJTeW5jID0gU3luY0NsaWVudDtcbm1vZHVsZS5leHBvcnRzID0gU3luY0NsaWVudDsiLCIvKipcbiAqIEJvb3QuanNcbiAqXG4gKiBCb290IHN0YXRlIGZvciBTdGFyY29kZXJcbiAqIExvYWQgYXNzZXRzIGZvciBwcmVsb2FkIHNjcmVlbiBhbmQgY29ubmVjdCB0byBzZXJ2ZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29udHJvbHMgPSByZXF1aXJlKCcuLi9waGFzZXJwbHVnaW5zL0NvbnRyb2xzLmpzJyk7XG52YXIgU3luY0NsaWVudCA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvU3luY0NsaWVudC5qcycpO1xuXG52YXIgQm9vdCA9IGZ1bmN0aW9uICgpIHt9O1xuXG5Cb290LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG5Cb290LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEJvb3Q7XG5cbi8vdmFyIF9jb25uZWN0ZWQgPSBmYWxzZTtcblxuLyoqXG4gKiBTZXQgcHJvcGVydGllcyB0aGF0IHJlcXVpcmUgYm9vdGVkIGdhbWUgc3RhdGUsIGF0dGFjaCBwbHVnaW5zLCBjb25uZWN0IHRvIGdhbWUgc2VydmVyXG4gKi9cbkJvb3QucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ0luaXQgQm9vdCcsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG4gICAgY29uc29sZS5sb2coJ2l3IEJvb3QnLCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0LCBzY3JlZW4ud2lkdGgsIHNjcmVlbi5oZWlnaHQsIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTtcbiAgICAvL3RoaXMuZ2FtZS5zdGFnZS5kaXNhYmxlVmlzaWJpbGl0eUNoYW5nZSA9IHRydWU7XG4gICAgdGhpcy5nYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuUkVTSVpFO1xuICAgIHRoaXMuZ2FtZS5yZW5kZXJlci5yZW5kZXJTZXNzaW9uLnJvdW5kUGl4ZWxzID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUuc2hhcmVkR3JhcGhpY3MgPSB0aGlzLmdhbWUubWFrZS5ncmFwaGljcygpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcFNjYWxlID0gdGhpcy5zdGFyY29kZXIuY29uZmlnLnBoeXNpY3NTY2FsZTtcbiAgICB2YXIgaXBTY2FsZSA9IDEvcFNjYWxlO1xuICAgIHZhciBmbG9vciA9IE1hdGguZmxvb3I7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MuY29uZmlnID0ge1xuICAgICAgICBweG06IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gaXBTY2FsZSphO1xuICAgICAgICB9LFxuICAgICAgICBtcHg6IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gZmxvb3IocFNjYWxlKmEpO1xuICAgICAgICB9LFxuICAgICAgICBweG1pOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIC1pcFNjYWxlKmE7XG4gICAgICAgIH0sXG4gICAgICAgIG1weGk6IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gZmxvb3IoLXBTY2FsZSphKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5zdGFyY29kZXIuc2VydmVyQ29ubmVjdCgpO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuY29udHJvbHMgPSB0aGlzLmdhbWUucGx1Z2lucy5hZGQoQ29udHJvbHMsXG4gICAgLy8gICAgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIC8vdGhpcy5nYW1lLmpveXN0aWNrID0gdGhpcy5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKFBoYXNlci5WaXJ0dWFsSm95c3RpY2spO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuY29udHJvbHMgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oQ29udHJvbHMsIHRoaXMuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICAvLyBTZXQgdXAgc29ja2V0LmlvIGNvbm5lY3Rpb25cbiAgICAvL3RoaXMuc3RhcmNvZGVyLnNvY2tldCA9IHRoaXMuc3RhcmNvZGVyLmlvKHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5zZXJ2ZXJVcmksXG4gICAgLy8gICAgdGhpcy5zdGFyY29kZXIuY29uZmlnLmlvQ2xpZW50T3B0aW9ucyk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5zb2NrZXQub24oJ3NlcnZlciByZWFkeScsIGZ1bmN0aW9uIChwbGF5ZXJNc2cpIHtcbiAgICAvLyAgICAvLyBGSVhNRTogSGFzIHRvIGludGVyYWN0IHdpdGggc2Vzc2lvbiBmb3IgYXV0aGVudGljYXRpb24gZXRjLlxuICAgIC8vICAgIHNlbGYuc3RhcmNvZGVyLnBsYXllciA9IHBsYXllck1zZztcbiAgICAvLyAgICAvL3NlbGYuc3RhcmNvZGVyLnN5bmNjbGllbnQgPSBzZWxmLmdhbWUucGx1Z2lucy5hZGQoU3luY0NsaWVudCxcbiAgICAvLyAgICAvLyAgICBzZWxmLnN0YXJjb2Rlci5zb2NrZXQsIHNlbGYuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICAvLyAgICBzZWxmLnN0YXJjb2Rlci5zeW5jY2xpZW50ID0gc2VsZi5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKFN5bmNDbGllbnQsXG4gICAgLy8gICAgICAgIHNlbGYuc3RhcmNvZGVyLnNvY2tldCwgc2VsZi5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIC8vICAgIF9jb25uZWN0ZWQgPSB0cnVlO1xuICAgIC8vfSk7XG59O1xuXG4vKipcbiAqIFByZWxvYWQgbWluaW1hbCBhc3NldHMgZm9yIHByb2dyZXNzIHNjcmVlblxuICovXG5Cb290LnByb3RvdHlwZS5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCdiYXJfbGVmdCcsICdhc3NldHMvaW1hZ2VzL2dyZWVuQmFyTGVmdC5wbmcnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5pbWFnZSgnYmFyX21pZCcsICdhc3NldHMvaW1hZ2VzL2dyZWVuQmFyTWlkLnBuZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCdiYXJfcmlnaHQnLCAnYXNzZXRzL2ltYWdlcy9ncmVlbkJhclJpZ2h0LnBuZycpO1xufTtcblxuLyoqXG4gKiBLaWNrIGludG8gbmV4dCBzdGF0ZSBvbmNlIGluaXRpYWxpemF0aW9uIGFuZCBwcmVsb2FkaW5nIGFyZSBkb25lXG4gKi9cbkJvb3QucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ2xvYWRlcicpO1xufTtcblxuQm9vdC5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gKHcsIGgpIHtcbiAgICBjb25zb2xlLmxvZygncnMgQm9vdCcsIHcsIGgpO1xufTtcblxuLyoqXG4gKiBBZHZhbmNlIGdhbWUgc3RhdGUgb25jZSBuZXR3b3JrIGNvbm5lY3Rpb24gaXMgZXN0YWJsaXNoZWRcbiAqL1xuLy9Cb290LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICAvLyBGSVhNRTogZG9uJ3Qgd2FpdCBoZXJlIC0gc2hvdWxkIGJlIGluIGNyZWF0ZVxuLy8gICAgaWYgKHRoaXMuc3RhcmNvZGVyLmNvbm5lY3RlZCkge1xuLy8gICAgICAgIC8vdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdzcGFjZScpO1xuLy8gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnbG9naW4nKTtcbi8vICAgIH1cbi8vfTtcblxubW9kdWxlLmV4cG9ydHMgPSBCb290OyIsIi8qKlxuICogTG9hZGVyLmpzXG4gKlxuICogUGhhc2VyIHN0YXRlIHRvIHByZWxvYWQgYXNzZXRzIGFuZCBkaXNwbGF5IHByb2dyZXNzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIExvYWRlciA9IGZ1bmN0aW9uICgpIHt9O1xuXG5Mb2FkZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbkxvYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMb2FkZXI7XG5cbkxvYWRlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBJbml0IGFuZCBkcmF3IHN0YXJmaWVsZFxuICAgIHRoaXMuc3RhcmNvZGVyLnN0YXJmaWVsZCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEoNjAwLCA2MDApO1xuICAgIHRoaXMuc3RhcmNvZGVyLmRyYXdTdGFyRmllbGQodGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkLmN0eCwgNjAwLCAxNik7XG4gICAgdGhpcy5nYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCwgdGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkKTtcblxuICAgIC8vIFBvc2l0aW9uIHByb2dyZXNzIGJhclxuICAgIHZhciBiYXJXaWR0aCA9IE1hdGguZmxvb3IoMC40ICogdGhpcy5nYW1lLndpZHRoKTtcbiAgICB2YXIgb3JpZ2luWCA9ICh0aGlzLmdhbWUud2lkdGggLSBiYXJXaWR0aCkvMjtcbiAgICB2YXIgbGVmdCA9IHRoaXMuZ2FtZS5hZGQuaW1hZ2Uob3JpZ2luWCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclksICdiYXJfbGVmdCcpO1xuICAgIGxlZnQuYW5jaG9yLnNldFRvKDAsIDAuNSk7XG4gICAgdmFyIG1pZCA9IHRoaXMuZ2FtZS5hZGQuaW1hZ2Uob3JpZ2luWCArIGxlZnQud2lkdGgsIHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJZLCAnYmFyX21pZCcpO1xuICAgIG1pZC5hbmNob3Iuc2V0VG8oMCwgMC41KTtcbiAgICB2YXIgcmlnaHQgPSB0aGlzLmdhbWUuYWRkLmltYWdlKG9yaWdpblggKyBsZWZ0LndpZHRoLCB0aGlzLmdhbWUud29ybGQuY2VudGVyWSwgJ2Jhcl9yaWdodCcpO1xuICAgIHJpZ2h0LmFuY2hvci5zZXRUbygwLCAwLjUpO1xuICAgIHZhciBtaWRXaWR0aCA9IGJhcldpZHRoIC0gMiAqIGxlZnQud2lkdGg7XG4gICAgbWlkLndpZHRoID0gMDtcbiAgICB2YXIgbG9hZGluZ1RleHQgPSB0aGlzLmdhbWUuYWRkLnRleHQodGhpcy5nYW1lLndvcmxkLmNlbnRlclgsIHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJZIC0gMzYsICdMb2FkaW5nLi4uJyxcbiAgICAgICAge2ZvbnQ6ICcyNHB4IEFyaWFsJywgZmlsbDogJyNmZmZmZmYnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICBsb2FkaW5nVGV4dC5hbmNob3Iuc2V0VG8oMC41KTtcbiAgICB2YXIgcHJvZ1RleHQgPSB0aGlzLmdhbWUuYWRkLnRleHQob3JpZ2luWCArIGxlZnQud2lkdGgsIHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJZLCAnMCUnLFxuICAgICAgICB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2ZmZmZmZicsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIHByb2dUZXh0LmFuY2hvci5zZXRUbygwLjUpO1xuXG4gICAgdGhpcy5nYW1lLmxvYWQub25GaWxlQ29tcGxldGUuYWRkKGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICB2YXIgdyA9IE1hdGguZmxvb3IobWlkV2lkdGggKiBwcm9ncmVzcyAvIDEwMCk7XG4gICAgICAgIG1pZC53aWR0aCA9IHc7XG4gICAgICAgIHJpZ2h0LnggPSBtaWQueCArIHc7XG4gICAgICAgIHByb2dUZXh0LnNldFRleHQocHJvZ3Jlc3MgKyAnJScpO1xuICAgICAgICBwcm9nVGV4dC54ID0gbWlkLnggKyB3LzI7XG4gICAgfSwgdGhpcyk7XG59O1xuXG5Mb2FkZXIucHJvdG90eXBlLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gVE9ETzogSEQgYW5kIFNEIHZlcnNpb25zXG4gICAgLy8gRm9udHNcbiAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KCd0aXRsZS1mb250JyxcbiAgICAgICAgJ2Fzc2V0cy9iaXRtYXBmb250cy9rYXJuaXZvcmUxMjgucG5nJywgJ2Fzc2V0cy9iaXRtYXBmb250cy9rYXJuaXZvcmUxMjgueG1sJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYml0bWFwRm9udCgncmVhZG91dC15ZWxsb3cnLFxuICAgICAgICAnYXNzZXRzL2JpdG1hcGZvbnRzL2hlYXZ5LXllbGxvdzI0LnBuZycsICdhc3NldHMvYml0bWFwZm9udHMvaGVhdnkteWVsbG93MjQueG1sJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ3BsYXllcnRocnVzdCcsICdhc3NldHMvc291bmRzL3RocnVzdExvb3Aub2dnJyk7XG4gICAgLy8gU291bmRzXG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ2NoaW1lJywgJ2Fzc2V0cy9zb3VuZHMvY2hpbWUub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ2xldmVsdXAnLCAnYXNzZXRzL3NvdW5kcy9sZXZlbHVwLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdwbGFudHRyZWUnLCAnYXNzZXRzL3NvdW5kcy9wbGFudHRyZWUub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ2JpZ3BvcCcsICdhc3NldHMvc291bmRzL2JpZ3BvcC5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnbGl0dGxlcG9wJywgJ2Fzc2V0cy9zb3VuZHMvbGl0dGxlcG9wLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCd0YWdnZWQnLCAnYXNzZXRzL3NvdW5kcy90YWdnZWQub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ2xhc2VyJywgJ2Fzc2V0cy9zb3VuZHMvbGFzZXIub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ211c2ljJywgJ2Fzc2V0cy9zb3VuZHMvaWdub3JlLm9nZycpO1xuICAgIC8vIFNwcml0ZXNoZWV0c1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKCdqb3lzdGljaycsICdhc3NldHMvam95c3RpY2svZ2VuZXJpYy1qb3lzdGljay5wbmcnLCAnYXNzZXRzL2pveXN0aWNrL2dlbmVyaWMtam95c3RpY2suanNvbicpO1xuICAgIC8vIEltYWdlc1xuXG59O1xuXG5Mb2FkZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGFyY29kZXIuY29ubmVjdGVkKSB7XG4gICAgICAgIC8vdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdzcGFjZScpO1xuICAgICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ2xvZ2luJyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkZXI7IiwiLyoqXG4gKiBMb2dpbi5qc1xuICpcbiAqIFN0YXRlIGZvciBkaXNwbGF5aW5nIGxvZ2luIHNjcmVlbi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTG9naW4gPSBmdW5jdGlvbiAoKSB7fTtcblxuTG9naW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbkxvZ2luLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvZ2luO1xuXG5Mb2dpbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5zdGFyY29kZXIuc2hvd0xvZ2luKCk7XG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0Lm9uKCdsb2dnZWQgaW4nLCBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgIHNlbGYuc3RhcmNvZGVyLmhpZGVMb2dpbigpO1xuICAgICAgICBzZWxmLnN0YXJjb2Rlci5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICAgIHNlbGYuZ2FtZS5zdGF0ZS5zdGFydCgnc3BhY2UnKTtcbiAgICB9KTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zb2NrZXQub24oJ2xvZ2luIGZhaWx1cmUnLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgc2VsZi5zdGFyY29kZXIuc2V0TG9naW5FcnJvcihlcnJvcik7XG4gICAgfSk7XG59O1xuXG4vL0xvZ2luLnByb3RvdHlwZS5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuLy8gICAgdGhpcy5nYW1lLmxvYWQuYml0bWFwRm9udCgndGl0bGUtZm9udCcsXG4vLyAgICAgICAgJ2Fzc2V0cy9iaXRtYXBmb250cy9rYXJuaXZvcmUxMjgucG5nJywgJ2Fzc2V0cy9iaXRtYXBmb250cy9rYXJuaXZvcmUxMjgueG1sJyk7XG4vL307XG5cbkxvZ2luLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiAodywgaCkge1xuICAgIGNvbnNvbGUubG9nKCdycyBMb2dpbicsIHcsIGgpO1xufTtcblxuTG9naW4ucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL3ZhciBzdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLmRyYXdTdGFyRmllbGQodGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkLmN0eCwgNjAwLCAxNik7XG4gICAgdGhpcy5nYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCwgdGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkKTtcbiAgICB2YXIgdGl0bGUgPSB0aGlzLmdhbWUuYWRkLmJpdG1hcFRleHQodGhpcy5nYW1lLndvcmxkLmNlbnRlclgsIDEyOCwgJ3RpdGxlLWZvbnQnLCAnU1RBUkNPREVSJyk7XG4gICAgdGl0bGUuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9naW47XG4iLCIvKipcbiAqIFNwYWNlLmpzXG4gKlxuICogTWFpbiBnYW1lIHN0YXRlIGZvciBTdGFyY29kZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBUaHJ1c3RHZW5lcmF0b3IgPSByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVGhydXN0R2VuZXJhdG9yLmpzJyk7XG52YXIgTWluaU1hcCA9IHJlcXVpcmUoJy4uL3BoYXNlcnVpL01pbmlNYXAuanMnKTtcbnZhciBMZWFkZXJCb2FyZCA9IHJlcXVpcmUoJy4uL3BoYXNlcnVpL0xlYWRlckJvYXJkLmpzJyk7XG52YXIgVG9hc3QgPSByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVG9hc3QuanMnKTtcblxudmFyIENvbnRyb2xzID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9Db250cm9scy5qcycpO1xudmFyIFN5bmNDbGllbnQgPSByZXF1aXJlKCcuLi9waGFzZXJwbHVnaW5zL1N5bmNDbGllbnQuanMnKTtcblxudmFyIFNwYWNlID0gZnVuY3Rpb24gKCkge307XG5cblNwYWNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG5TcGFjZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTcGFjZTtcblxuU3BhY2UucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oQ29udHJvbHMsIHRoaXMuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zeW5jY2xpZW50ID0gdGhpcy5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKFN5bmNDbGllbnQsXG4gICAgICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldCwgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIHRoaXMuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlO1xufTtcblxuU3BhY2UucHJvdG90eXBlLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgU2ltcGxlUGFydGljbGUuY2FjaGVUZXh0dXJlKHRoaXMuZ2FtZSwgVGhydXN0R2VuZXJhdG9yLnRleHR1cmVLZXksICcjZmY2NjAwJywgOCk7XG4gICAgU2ltcGxlUGFydGljbGUuY2FjaGVUZXh0dXJlKHRoaXMuZ2FtZSwgJ2J1bGxldCcsICcjOTk5OTk5JywgNCk7XG4gICAgU2ltcGxlUGFydGljbGUuY2FjaGVUZXh0dXJlKHRoaXMuZ2FtZSwgJ3RyYWN0b3InLCAnI2VlZWVlZScsIDgsIHRydWUpO1xuICAgIC8vdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ3BsYXllcnRocnVzdCcsICdhc3NldHMvc291bmRzL3RocnVzdExvb3Aub2dnJyk7XG4gICAgLy90aGlzLmdhbWUubG9hZC5hdWRpbygnY2hpbWUnLCAnYXNzZXRzL3NvdW5kcy9jaGltZS5tcDMnKTtcbiAgICAvL3RoaXMuZ2FtZS5sb2FkLmF0bGFzKCdqb3lzdGljaycsICdhc3NldHMvam95c3RpY2svZ2VuZXJpYy1qb3lzdGljay5wbmcnLCAnYXNzZXRzL2pveXN0aWNrL2dlbmVyaWMtam95c3RpY2suanNvbicpO1xuICAgIC8vdGhpcy5nYW1lLmxvYWQuYml0bWFwRm9udCgncmVhZG91dC15ZWxsb3cnLFxuICAgIC8vICAgICdhc3NldHMvYml0bWFwZm9udHMvaGVhdnkteWVsbG93MjQucG5nJywgJ2Fzc2V0cy9iaXRtYXBmb250cy9oZWF2eS15ZWxsb3cyNC54bWwnKTtcbn07XG5cblNwYWNlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ1NwYWNlIHNpemUnLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIHdpbmRvdy5zY3JvbGxUbygwLCAxKTtcbiAgICAvL2NvbnNvbGUubG9nKCdjcmVhdGUnKTtcbiAgICAvL3ZhciBybmcgPSB0aGlzLmdhbWUucm5kO1xuICAgIHZhciB3YiA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy53b3JsZEJvdW5kcztcbiAgICB2YXIgcHMgPSB0aGlzLnN0YXJjb2Rlci5jb25maWcucGh5c2ljc1NjYWxlO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLlAySlMpO1xuICAgIHRoaXMud29ybGQuc2V0Qm91bmRzLmNhbGwodGhpcy53b3JsZCwgd2JbMF0qcHMsIHdiWzFdKnBzLCAod2JbMl0td2JbMF0pKnBzLCAod2JbM10td2JbMV0pKnBzKTtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5wMi5zZXRCb3VuZHNUb1dvcmxkKHRydWUsIHRydWUsIHRydWUsIHRydWUsIGZhbHNlKTtcblxuICAgIC8vIERlYnVnZ2luZ1xuICAgIC8vdGhpcy5nYW1lLnRpbWUuYWR2YW5jZWRUaW1pbmcgPSB0cnVlO1xuXG4gICAgLy8gU2V0IHVwIERPTVxuICAgIHRoaXMuc3RhcmNvZGVyLmxheW91dERPTVNwYWNlU3RhdGUoKTtcblxuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzLnJlc2V0KCk7XG5cbiAgICAvLyBWaXJ0dWFsIGpveXN0aWNrXG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMuYWRkVmlydHVhbENvbnRyb2xzKCdqb3lzdGljaycpO1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scyA9IHt9O1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5zdGljayA9IHRoaXMuZ2FtZS5qb3lzdGljay5hZGRTdGljayhcbiAgICAvLyAgICB0aGlzLmdhbWUud2lkdGggLSAxNTAsIHRoaXMuZ2FtZS5oZWlnaHQgLSA3NSwgMTAwLCAnam95c3RpY2snKTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuc3RpY2suc2NhbGUgPSAwLjU7XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzLmZpcmVidXR0b24gPSB0aGlzLmdhbWUuam95c3RpY2suYWRkQnV0dG9uKHRoaXMuZ2FtZS53aWR0aCAtIDUwLCB0aGlzLmdhbWUuaGVpZ2h0IC0gNzUsXG4gICAgLy8gICAgJ2pveXN0aWNrJywgJ2J1dHRvbjEtdXAnLCAnYnV0dG9uMS1kb3duJyk7XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzLmZpcmVidXR0b24uc2NhbGUgPSAwLjU7XG5cbiAgICAvLyBTb3VuZHNcbiAgICB0aGlzLmdhbWUuc291bmRzID0ge307XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdwbGF5ZXJ0aHJ1c3QnLCAxLCB0cnVlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLmNoaW1lID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgnY2hpbWUnLCAxLCBmYWxzZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5wbGFudHRyZWUgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdwbGFudHRyZWUnLCAxLCBmYWxzZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5iaWdwb3AgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdiaWdwb3AnLCAxLCBmYWxzZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5saXR0bGVwb3AgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdsaXR0bGVwb3AnLCAxLCBmYWxzZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy50YWdnZWQgPSB0aGlzLmdhbWUuc291bmQuYWRkKCd0YWdnZWQnLCAxLCBmYWxzZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5sYXNlciA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ2xhc2VyJywgMSwgZmFsc2UpO1xuXG4gICAgLy90aGlzLmdhbWUuc291bmRzLm11c2ljID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgnbXVzaWMnLCAxLCB0cnVlKTtcbiAgICAvL3RoaXMuZ2FtZS5zb3VuZHMubXVzaWMucGxheSgpO1xuXG4gICAgLy8gQmFja2dyb3VuZFxuICAgIC8vdmFyIHN0YXJmaWVsZCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEoNjAwLCA2MDApO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZChzdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLmdhbWUuYWRkLnRpbGVTcHJpdGUod2JbMF0qcHMsIHdiWzFdKnBzLCAod2JbMl0td2JbMF0pKnBzLCAod2JbM10td2JbMV0pKnBzLCB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQpO1xuXG4gICAgdGhpcy5zdGFyY29kZXIuc3luY2NsaWVudC5zdGFydCgpO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuc29ja2V0LmVtaXQoJ2NsaWVudCByZWFkeScpO1xuICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldC5lbWl0KCdyZWFkeScpO1xuICAgIHRoaXMuX3NldHVwTWVzc2FnZUhhbmRsZXJzKHRoaXMuc3RhcmNvZGVyLnNvY2tldCk7XG5cbiAgICAvLyBHcm91cHMgZm9yIHBhcnRpY2xlIGVmZmVjdHNcbiAgICB0aGlzLmdhbWUudGhydXN0Z2VuZXJhdG9yID0gbmV3IFRocnVzdEdlbmVyYXRvcih0aGlzLmdhbWUpO1xuXG4gICAgLy8gR3JvdXAgZm9yIGdhbWUgb2JqZWN0c1xuICAgIHRoaXMuZ2FtZS5wbGF5ZmllbGQgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICAvLyBVSVxuICAgIHRoaXMuZ2FtZS51aSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLmdhbWUudWkuZml4ZWRUb0NhbWVyYSA9IHRydWU7XG5cbiAgICAvLyBJbnZlbnRvcnkgLSB0aW5rZXIgd2l0aCBwb3NpdGlvblxuICAgIHZhciBsYWJlbCA9IHRoaXMuZ2FtZS5tYWtlLnRleHQodGhpcy5nYW1lLndpZHRoIC8gMiwgMjUsICdJTlZFTlRPUlknLFxuICAgICAgICB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2ZmOTkwMCcsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIGxhYmVsLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZChsYWJlbCk7XG4gICAgLy90aGlzLmdhbWUuaW52ZW50b3J5dGV4dCA9IHRoaXMuZ2FtZS5tYWtlLnRleHQodGhpcy5nYW1lLndpZHRoIC0gMTAwLCA1MCwgJzAgY3J5c3RhbHMnLFxuICAgIC8vICAgIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjY2NjMDAwJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgdGhpcy5nYW1lLmludmVudG9yeXRleHQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBUZXh0KHRoaXMuZ2FtZS53aWR0aCAvIDIsIDUwLCAncmVhZG91dC15ZWxsb3cnLCAnMCcpO1xuICAgIHRoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0LmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZCh0aGlzLmdhbWUuaW52ZW50b3J5dGV4dCk7XG5cbiAgICAvLyBNaW5pTWFwXG4gICAgdGhpcy5nYW1lLm1pbmltYXAgPSBuZXcgTWluaU1hcCh0aGlzLmdhbWUsIDMwMCwgMzAwKTtcbiAgICB0aGlzLmdhbWUudWkuYWRkKHRoaXMuZ2FtZS5taW5pbWFwKTtcbiAgICB0aGlzLmdhbWUubWluaW1hcC54ID0gMTA7XG4gICAgdGhpcy5nYW1lLm1pbmltYXAueSA9IDEwO1xuXG4gICAgLy8gTGVhZGVyYm9hcmRcbiAgICB0aGlzLmdhbWUubGVhZGVyYm9hcmQgPSBuZXcgTGVhZGVyQm9hcmQodGhpcy5nYW1lLCB0aGlzLnN0YXJjb2Rlci5wbGF5ZXJNYXAsIDIwMCwgMzAwKTtcbiAgICB0aGlzLmdhbWUudWkuYWRkKHRoaXMuZ2FtZS5sZWFkZXJib2FyZCk7XG4gICAgdGhpcy5nYW1lLmxlYWRlcmJvYXJkLnggPSB0aGlzLmdhbWUud2lkdGggLSAyMDA7XG4gICAgdGhpcy5nYW1lLmxlYWRlcmJvYXJkLnkgPSAwO1xuICAgIHRoaXMuZ2FtZS5sZWFkZXJib2FyZC52aXNpYmxlID0gZmFsc2U7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gSGVscGVyc1xuICAgIC8vZnVuY3Rpb24gcmFuZG9tTm9ybWFsICgpIHtcbiAgICAvLyAgICB2YXIgdCA9IDA7XG4gICAgLy8gICAgZm9yICh2YXIgaT0wOyBpPDY7IGkrKykge1xuICAgIC8vICAgICAgICB0ICs9IHJuZy5ub3JtYWwoKTtcbiAgICAvLyAgICB9XG4gICAgLy8gICAgcmV0dXJuIHQvNjtcbiAgICAvL31cbiAgICAvL1xuICAgIC8vZnVuY3Rpb24gZHJhd1N0YXIgKGN0eCwgeCwgeSwgZCwgY29sb3IpIHtcbiAgICAvLyAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICAvLyAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgLy8gICAgY3R4Lm1vdmVUbyh4LWQrMSwgeS1kKzEpO1xuICAgIC8vICAgIGN0eC5saW5lVG8oeCtkLTEsIHkrZC0xKTtcbiAgICAvLyAgICBjdHgubW92ZVRvKHgtZCsxLCB5K2QtMSk7XG4gICAgLy8gICAgY3R4LmxpbmVUbyh4K2QtMSwgeS1kKzEpO1xuICAgIC8vICAgIGN0eC5tb3ZlVG8oeCwgeS1kKTtcbiAgICAvLyAgICBjdHgubGluZVRvKHgsIHkrZCk7XG4gICAgLy8gICAgY3R4Lm1vdmVUbyh4LWQsIHkpO1xuICAgIC8vICAgIGN0eC5saW5lVG8oeCtkLCB5KTtcbiAgICAvLyAgICBjdHguc3Ryb2tlKCk7XG4gICAgLy99XG4gICAgLy9cbiAgICAvL2Z1bmN0aW9uIGRyYXdTdGFyRmllbGQgKGN0eCwgc2l6ZSwgbikge1xuICAgIC8vICAgIHZhciB4bSA9IE1hdGgucm91bmQoc2l6ZS8yICsgcmFuZG9tTm9ybWFsKCkqc2l6ZS80KTtcbiAgICAvLyAgICB2YXIgeW0gPSBNYXRoLnJvdW5kKHNpemUvMiArIHJhbmRvbU5vcm1hbCgpKnNpemUvNCk7XG4gICAgLy8gICAgdmFyIHF1YWRzID0gW1swLDAseG0tMSx5bS0xXSwgW3htLDAsc2l6ZS0xLHltLTFdLFxuICAgIC8vICAgICAgICBbMCx5bSx4bS0xLHNpemUtMV0sIFt4bSx5bSxzaXplLTEsc2l6ZS0xXV07XG4gICAgLy8gICAgdmFyIGNvbG9yO1xuICAgIC8vICAgIHZhciBpLCBqLCBsLCBxO1xuICAgIC8vXG4gICAgLy8gICAgbiA9IE1hdGgucm91bmQobi80KTtcbiAgICAvLyAgICBmb3IgKGk9MCwgbD1xdWFkcy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgLy8gICAgICAgIHEgPSBxdWFkc1tpXTtcbiAgICAvLyAgICAgICAgZm9yIChqPTA7IGo8bjsgaisrKSB7XG4gICAgLy8gICAgICAgICAgICBjb2xvciA9ICdoc2woNjAsMTAwJSwnICsgcm5nLmJldHdlZW4oOTAsOTkpICsgJyUpJztcbiAgICAvLyAgICAgICAgICAgIGRyYXdTdGFyKGN0eCxcbiAgICAvLyAgICAgICAgICAgICAgICBybmcuYmV0d2VlbihxWzBdKzcsIHFbMl0tNyksIHJuZy5iZXR3ZWVuKHFbMV0rNywgcVszXS03KSxcbiAgICAvLyAgICAgICAgICAgICAgICBybmcuYmV0d2VlbigyLDQpLCBjb2xvcik7XG4gICAgLy8gICAgICAgIH1cbiAgICAvLyAgICB9XG4gICAgLy99XG5cbn07XG5cblNwYWNlLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiAodywgaCkge1xuICAgIGNvbnNvbGUubG9nKCdycyBTcGFjZScsIHcsIGgpO1xufTtcblxuU3BhY2UucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBGSVhNRToganVzdCBhIG1lc3MgZm9yIHRlc3RpbmdcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMucHJvY2Vzc1F1ZXVlKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgIGlmIChhLnR5cGUgPT09ICd1cF9wcmVzc2VkJykge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnBsYXllclNoaXAubG9jYWxTdGF0ZS50aHJ1c3QgPSAnc3RhcnRpbmcnO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUuc291bmRzLnBsYXllcnRocnVzdC5wbGF5KCk7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RhcnRPbihzZWxmLmdhbWUucGxheWVyU2hpcCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYS50eXBlID09PSAndXBfcmVsZWFzZWQnKSB7XG4gICAgICAgICAgICBzZWxmLmdhbWUucGxheWVyU2hpcC5sb2NhbFN0YXRlLnRocnVzdCA9ICdzaHV0ZG93bic7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0LnN0b3AoKTtcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnRocnVzdGdlbmVyYXRvci5zdG9wT24oc2VsZi5nYW1lLnBsYXllclNoaXApO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5TcGFjZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIC8vY29uc29sZS5sb2coJytyZW5kZXIrJyk7XG4gICAgLy9pZiAodGhpcy5zdGFyY29kZXIudGVtcHNwcml0ZSkge1xuICAgIC8vICAgIHZhciBkID0gdGhpcy5zdGFyY29kZXIudGVtcHNwcml0ZS5wb3NpdGlvbi54IC0gdGhpcy5zdGFyY29kZXIudGVtcHNwcml0ZS5wcmV2aW91c1Bvc2l0aW9uLng7XG4gICAgLy8gICAgY29uc29sZS5sb2coJ0RlbHRhJywgZCwgdGhpcy5nYW1lLnRpbWUuZWxhcHNlZCwgZCAvIHRoaXMuZ2FtZS50aW1lLmVsYXBzZWQpO1xuICAgIC8vfVxuICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyk7XG4gICAgLy90aGlzLmdhbWUuZGVidWcudGV4dCgnRnBzOiAnICsgdGhpcy5nYW1lLnRpbWUuZnBzLCA1LCAyMCk7XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzLnN0aWNrLmRlYnVnKHRydWUsIHRydWUpO1xuICAgIC8vdGhpcy5nYW1lLmRlYnVnLmNhbWVyYUluZm8odGhpcy5nYW1lLmNhbWVyYSwgMTAwLCAyMCk7XG4gICAgLy9pZiAodGhpcy5zaGlwKSB7XG4gICAgLy8gICAgdGhpcy5nYW1lLmRlYnVnLnNwcml0ZUluZm8odGhpcy5zaGlwLCA0MjAsIDIwKTtcbiAgICAvL31cbn07XG5cblNwYWNlLnByb3RvdHlwZS5fc2V0dXBNZXNzYWdlSGFuZGxlcnMgPSBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNvY2tldC5vbignbXNnIGNyeXN0YWwgcGlja3VwJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBzZWxmLmdhbWUuc291bmRzLmNoaW1lLnBsYXkoKTtcbiAgICAgICAgVG9hc3Quc3BpblVwKHNlbGYuZ2FtZSwgc2VsZi5nYW1lLnBsYXllclNoaXAueCwgc2VsZi5nYW1lLnBsYXllclNoaXAueSwgJysnICsgdmFsICsgJyBjcnlzdGFscyEnKTtcbiAgICB9KTtcbiAgICBzb2NrZXQub24oJ21zZyBwbGFudCB0cmVlJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBzZWxmLmdhbWUuc291bmRzLnBsYW50dHJlZS5wbGF5KCk7XG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCdtc2cgYXN0ZXJvaWQgcG9wJywgZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgICAgaWYgKHNpemUgPiAxKSB7XG4gICAgICAgICAgICBzZWxmLmdhbWUuc291bmRzLmJpZ3BvcC5wbGF5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLmdhbWUuc291bmRzLmxpdHRsZXBvcC5wbGF5KCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBzb2NrZXQub24oJ21zZyB0YWdnZWQnLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMudGFnZ2VkLnBsYXkoKTtcbiAgICB9KTtcbiAgICBzb2NrZXQub24oJ21zZyBsYXNlcicsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5sYXNlci5wbGF5KCk7XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwYWNlO1xuIiwiLyoqXG4gKiBMZWFkZXJCb2FyZC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBMZWFkZXJCb2FyZCA9IGZ1bmN0aW9uIChnYW1lLCBwbGF5ZXJtYXAsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lKTtcbiAgICB0aGlzLnBsYXllck1hcCA9IHBsYXllcm1hcDtcbiAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgIHRoaXMubWFpbldpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5tYWluSGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuaWNvblNpemUgPSAyNDsgICAgICAgICAvLyBNYWtlIHJlc3BvbnNpdmU/XG4gICAgdGhpcy5mb250U2l6ZSA9IDE4O1xuICAgIHRoaXMubnVtTGluZXMgPSBNYXRoLmZsb29yKChoZWlnaHQgLSB0aGlzLmljb25TaXplIC0gMikgLyAodGhpcy5mb250U2l6ZSArIDIpKTtcblxuICAgIHRoaXMubWFpbiA9IGdhbWUubWFrZS5ncm91cCgpO1xuICAgIHRoaXMubWFpbi5waXZvdC5zZXRUbyh3aWR0aCwgMCk7XG4gICAgdGhpcy5tYWluLnggPSB3aWR0aDtcbiAgICB0aGlzLmFkZCh0aGlzLm1haW4pO1xuXG4gICAgLy8gQmFja2dyb3VuZFxuICAgIHZhciBiaXRtYXAgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICAgIGJpdG1hcC5jdHguZmlsbFN0eWxlID0gJ3JnYmEoMTI4LCAxMjgsIDEyOCwgMC4yNSknO1xuICAgIC8vYml0bWFwLmN0eC5maWxsU3R5bGUgPSAnIzk5OTk5OSc7XG4gICAgLy9iaXRtYXAuY3R4Lmdsb2JhbEFscGhhID0gMC41O1xuICAgIGJpdG1hcC5jdHguZmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgLy90aGlzLmJvYXJkID0gbmV3IFBoYXNlci5TcHJpdGUoZ2FtZSwgd2lkdGgsIDAsIHRoaXMuYml0bWFwKTtcbiAgICAvL3RoaXMuYm9hcmQucGl2b3Quc2V0VG8od2lkdGgsIDApO1xuICAgIHRoaXMubWFpbi5hZGQobmV3IFBoYXNlci5TcHJpdGUoZ2FtZSwgMCwgMCwgYml0bWFwKSk7XG5cbiAgICAvLyBUaXRsZVxuICAgIHRoaXMudGl0bGUgPSBnYW1lLm1ha2UudGV4dCgod2lkdGggLSB0aGlzLmljb25TaXplKSAvIDIsIDQsICdUYWdzJyxcbiAgICAgICAge2ZvbnQ6ICcyMHB4IEFyaWFsIGJvbGQnLCBhbGlnbjogJ2NlbnRlcicsIGZpbGw6ICcjZmYwMDAwJ30pO1xuICAgIHRoaXMudGl0bGUuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgdGhpcy5tYWluLmFkZCh0aGlzLnRpdGxlKTtcblxuICAgIC8vIERpc3BsYXkgbGluZXNcbiAgICB0aGlzLmxpbmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm51bUxpbmVzOyBpKyspIHtcbiAgICAgICAgdmFyIGxpbmUgPSBnYW1lLm1ha2UudGV4dCg0LCB0aGlzLmljb25TaXplICsgMiArIGkgKiAodGhpcy5mb250U2l6ZSArIDIpLFxuICAgICAgICAgICAgJy0nLCB7Zm9udDogJzE4cHggQXJpYWwnLCBmaWxsOiAnIzAwMDBmZid9KTtcbiAgICAgICAgbGluZS5raWxsKCk7XG4gICAgICAgIHRoaXMubGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgdGhpcy5tYWluLmFkZChsaW5lKTtcbiAgICB9XG5cbiAgICAvLyBUb2dnbGUgYnV0dG9uXG4gICAgdmFyIGJ1dHRvbiA9IHRoaXMubWFrZUJ1dHRvbigpOyAgICAgICAvLyBHb29kIGRpbWVuc2lvbnMgVEJELiBNYWtlIHJlc3BvbnNpdmU/XG4gICAgYnV0dG9uLmFuY2hvci5zZXRUbygxLCAwKTsgICAgICAvLyB1cHBlciByaWdodDtcbiAgICBidXR0b24ueCA9IHdpZHRoO1xuICAgIC8vYnV0dG9uLnkgPSAwO1xuICAgIGJ1dHRvbi5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgIGJ1dHRvbi5ldmVudHMub25JbnB1dERvd24uYWRkKHRoaXMudG9nZ2xlRGlzcGxheSwgdGhpcyk7XG4gICAgdGhpcy5hZGQoYnV0dG9uKTtcblxuICAgIC8vLy8gTGlzdFxuICAgIC8vdGhpcy5saXN0ID0gZ2FtZS5tYWtlLmdyb3VwKCk7XG4gICAgLy90aGlzLmxpc3QueCA9IHdpZHRoO1xuICAgIC8vdGhpcy5saXN0LnkgPSAwO1xuICAgIC8vdGhpcy5saXN0LnBpdm90LnNldFRvKHdpZHRoLCAwKTtcbiAgICAvL3RoaXMudHdlZW4gPSBnYW1lLnR3ZWVucy5jcmVhdGUodGhpcy5ib2FyZC5zY2FsZSk7XG4gICAgLy9cbiAgICAvL3RoaXMuYWRkKHRoaXMubGlzdCk7XG4gICAgLy8vLyB0ZXN0aW5nXG4gICAgLy92YXIgdCA9IFsndGlnZXIgcHJpbmNlc3MnLCAnbmluamEgbGFzZXInLCAncm9ib3QgZmlzaCcsICdwb3RhdG8gcHVwcHknLCAndmFtcGlyZSBxdWljaGUnLCAnd2l6YXJkIHBhc3RhJ107XG4gICAgLy9mb3IgKHZhciBpID0gMDsgaSA8IHQubGVuZ3RoOyBpKyspIHtcbiAgICAvLyAgICB2YXIgdGV4dCA9IGdhbWUubWFrZS50ZXh0KDIsIGkqMTYsIHRbaV0sIHtmb250OiAnMTRweCBBcmlhbCcsIGZpbGw6ICcjMDAwMGZmJ30pO1xuICAgIC8vICAgIHRoaXMubGlzdC5hZGQodGV4dCk7XG4gICAgLy99XG59O1xuXG5MZWFkZXJCb2FyZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuTGVhZGVyQm9hcmQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGVhZGVyQm9hcmQ7XG5cbkxlYWRlckJvYXJkLnByb3RvdHlwZS5tYWtlQnV0dG9uID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB1bml0ID0gdGhpcy5pY29uU2l6ZSAvIDU7XG4gICAgdmFyIHRleHR1cmUgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKHRoaXMuaWNvblNpemUsIHRoaXMuaWNvblNpemUpO1xuICAgIHZhciBjdHggPSB0ZXh0dXJlLmN0eDtcbiAgICAvLyBEcmF3IHF1YXJ0ZXIgY2lyY2xlXG4gICAgY3R4LmZpbGxTdHlsZSA9ICcjZmZmZmZmJztcbiAgICAvL2N0eC5nbG9iYWxBbHBoYSA9IDAuNTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbyh0aGlzLmljb25TaXplLCAwKTtcbiAgICBjdHgubGluZVRvKDAsIDApO1xuICAgIGN0eC5hcmModGhpcy5pY29uU2l6ZSwgMCwgdGhpcy5pY29uU2l6ZSwgTWF0aC5QSSwgMyAqIE1hdGguUEkgLyAyLCB0cnVlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIC8vIERyYXcgc3RlcHNcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzAwMDAwMCc7XG4gICAgLy9jdHguZ2xvYmFsQWxwaGEgPSAxO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHgubW92ZVRvKDEuNSp1bml0LCAzKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oMS41KnVuaXQsIDIqdW5pdCk7XG4gICAgY3R4LmxpbmVUbygyLjUqdW5pdCwgMip1bml0KTtcbiAgICBjdHgubGluZVRvKDIuNSp1bml0LCAxKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oMy41KnVuaXQsIDEqdW5pdCk7XG4gICAgY3R4LmxpbmVUbygzLjUqdW5pdCwgMip1bml0KTtcbiAgICBjdHgubGluZVRvKDQuNSp1bml0LCAyKnVuaXQpO1xuICAgIGN0eC5saW5lVG8oNC41KnVuaXQsIDMqdW5pdCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICByZXR1cm4gbmV3IFBoYXNlci5TcHJpdGUodGhpcy5nYW1lLCAwLCAwLCB0ZXh0dXJlKTtcbn07XG5cbkxlYWRlckJvYXJkLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gKHRpdGxlLCBsaXN0LCBwbGF5ZXJpZCkge1xuICAgIHRoaXMudGl0bGUuc2V0VGV4dCh0aXRsZSk7XG4gICAgdmFyIHBsYXllclZpc2libGUgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubnVtTGluZXM7IGkrKykge1xuICAgICAgICB2YXIgcGlkID0gbGlzdFtpXSAmJiBsaXN0W2ldLmlkO1xuICAgICAgICBpZiAocGlkICYmIHRoaXMucGxheWVyTWFwW3BpZF0pIHtcbiAgICAgICAgICAgIHZhciB0YWcgPSB0aGlzLnBsYXllck1hcFtwaWRdLnRhZztcbiAgICAgICAgICAgIHZhciBsaW5lID0gdGhpcy5saW5lc1tpXTtcbiAgICAgICAgICAgIGxpbmUuc2V0VGV4dCgoaSArIDEpICsgJy4gJyArIHRhZyArICcgKCcgKyBsaXN0W2ldLnZhbCArICcpJyk7XG4gICAgICAgICAgICBpZiAocGlkID09PSBwbGF5ZXJpZCkge1xuICAgICAgICAgICAgICAgIGxpbmUuZm9udFdlaWdodCA9ICdib2xkJztcbiAgICAgICAgICAgICAgICBwbGF5ZXJWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGluZS5mb250V2VpZ2h0ID0gJ25vcm1hbCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5lLnJldml2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5saW5lc1tpXS5raWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gUGxheWVyIG5vdCBpbiB0b3AgTlxuICAgIGlmICghcGxheWVyVmlzaWJsZSkge1xuICAgICAgICBmb3IgKGkgPSB0aGlzLm51bUxpbmVzOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGxpc3RbaV0uaWQgPT09IHBsYXllcmlkKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRm91bmQgLSBkaXNwbGF5IGF0IGVuZFxuICAgICAgICBpZiAoaSA8IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICBsaW5lW3RoaXMubnVtTGluZXMgLSAxXS5zZXRUZXh0KChpICsgMSkgKyAnLiAnICsgdGhpcy5wbGF5ZXJNYXBbcGxheWVyaWRdICsgJyAoJyArIGxpc3RbaV0udmFsICsgJyknKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkxlYWRlckJvYXJkLnByb3RvdHlwZS50b2dnbGVEaXNwbGF5ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5nYW1lLnR3ZWVucy5pc1R3ZWVuaW5nKHRoaXMubWFpbi5zY2FsZSkpIHtcbiAgICAgICAgaWYgKHRoaXMub3Blbikge1xuICAgICAgICAgICAgdGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzLm1haW4uc2NhbGUpLnRvKHt4OiAwLCB5OiAwfSwgNTAwLCBQaGFzZXIuRWFzaW5nLlF1YWRyYXRpYy5PdXQsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMubWFpbi5zY2FsZSkudG8oe3g6IDEsIHk6IDF9LCA1MDAsIFBoYXNlci5FYXNpbmcuUXVhZHJhdGljLk91dCwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMZWFkZXJCb2FyZDsiLCIvKipcbiAqIE1pbmlNYXAuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTWluaU1hcCA9IGZ1bmN0aW9uIChnYW1lLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICB2YXIgeHIgPSB3aWR0aCAvIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyV2lkdGg7XG4gICAgdmFyIHlyID0gaGVpZ2h0IC8gdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJIZWlnaHQ7XG4gICAgaWYgKHhyIDw9IHlyKSB7XG4gICAgICAgIHRoaXMubWFwU2NhbGUgPSB4cjtcbiAgICAgICAgdGhpcy54T2Zmc2V0ID0gLXhyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJMZWZ0O1xuICAgICAgICB0aGlzLnlPZmZzZXQgPSAteHIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlclRvcCArIChoZWlnaHQgLSB4ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VySGVpZ2h0KSAvIDI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tYXBTY2FsZSA9IHlyO1xuICAgICAgICB0aGlzLnlPZmZzZXQgPSAteXIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlclRvcDtcbiAgICAgICAgdGhpcy54T2Zmc2V0ID0gLXlyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJMZWZ0ICsgKHdpZHRoIC0geXIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlcldpZHRoKSAvIDI7XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaGljcyA9IGdhbWUubWFrZS5ncmFwaGljcygwLCAwKTtcbiAgICB0aGlzLmdyYXBoaWNzLmJlZ2luRmlsbCgweGZmZmYwMCwgMC4yKTtcbiAgICB0aGlzLmdyYXBoaWNzLmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIHRoaXMuZ3JhcGhpY3MuZW5kRmlsbCgpO1xuICAgIHRoaXMuZ3JhcGhpY3MuY2FjaGVBc0JpdG1hcCA9IHRydWU7XG4gICAgdGhpcy5hZGQodGhpcy5ncmFwaGljcyk7XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5NaW5pTWFwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1pbmlNYXA7XG5cbk1pbmlNYXAucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL3RoaXMudGV4dHVyZS5yZW5kZXJYWSh0aGlzLmdyYXBoaWNzLCAwLCAwLCB0cnVlKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuZ2FtZS5wbGF5ZmllbGQuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBib2R5ID0gdGhpcy5nYW1lLnBsYXlmaWVsZC5jaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKCFib2R5Lm1pbmlzcHJpdGUpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGJvZHkubWluaXNwcml0ZS54ID0gdGhpcy53b3JsZFRvTW1YKGJvZHkueCk7XG4gICAgICAgIGJvZHkubWluaXNwcml0ZS55ID0gdGhpcy53b3JsZFRvTW1ZKGJvZHkueSk7XG4gICAgICAgIGJvZHkubWluaXNwcml0ZS5hbmdsZSA9IGJvZHkuYW5nbGU7XG4gICAgLy8gICAgdmFyIHggPSAxMDAgKyBib2R5LnggLyA0MDtcbiAgICAvLyAgICB2YXIgeSA9IDEwMCArIGJvZHkueSAvIDQwO1xuICAgIC8vICAgIHRoaXMudGV4dHVyZS5yZW5kZXJYWShib2R5LmdyYXBoaWNzLCB4LCB5LCBmYWxzZSk7XG4gICAgfVxufTtcblxuTWluaU1hcC5wcm90b3R5cGUud29ybGRUb01tWCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIHggKiB0aGlzLm1hcFNjYWxlICsgdGhpcy54T2Zmc2V0O1xufTtcblxuTWluaU1hcC5wcm90b3R5cGUud29ybGRUb01tWSA9IGZ1bmN0aW9uICh5KSB7XG4gICAgcmV0dXJuIHkgKiB0aGlzLm1hcFNjYWxlICsgdGhpcy55T2Zmc2V0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNaW5pTWFwOyIsIi8qKiBjbGllbnQuanNcbiAqXG4gKiBNYWluIGVudHJ5IHBvaW50IGZvciBTdGFyY29kZXIgZ2FtZSBjbGllbnRcbiAqXG4gKiBAdHlwZSB7U3RhcmNvZGVyfGV4cG9ydHN9XG4gKi9cblxuLy9yZXF1aXJlKCcuL0Jsb2NrbHlDdXN0b20uanMnKTtcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG5cbi8vbG9jYWxTdG9yYWdlLmRlYnVnID0gJyc7ICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXNlZCB0byB0b2dnbGUgc29ja2V0LmlvIGRlYnVnZ2luZ1xuXG4vL2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4vLyAgICB2YXIgc3RhcmNvZGVyID0gbmV3IFN0YXJjb2RlcigpO1xuLy8gICAgc3RhcmNvZGVyLnN0YXJ0KCk7XG4vL30pO1xuXG4vLyB0ZXN0XG5cbiQoZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdGFyY29kZXIgPSBuZXcgU3RhcmNvZGVyKCk7XG4gICAgc3RhcmNvZGVyLnN0YXJ0KCk7XG59KTtcbiJdfQ==
