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

Starcoder.mixinPrototype(Starcoder.prototype, WorldApi.prototype);
Starcoder.mixinPrototype(Starcoder.prototype, DOMInterface.prototype);
Starcoder.mixinPrototype(Starcoder.prototype, CodeEndpointClient.prototype);
Starcoder.mixinPrototype(Starcoder.prototype, Starfield.prototype);

var states = {
    boot: require('./phaserstates/Boot.js'),
    space: require('./phaserstates/Space.js'),
    login: require('./phaserstates/Login.js'),
    loader: require('./phaserstates/Loader.js')
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
    this.connected = false;
    this.lastNetError = null;
    this.initDOMInterface();
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

},{"./Starcoder.js":2,"./client-components/CodeEndpointClient.js":3,"./client-components/DOMInterface.js":4,"./client-components/Starfield.js":5,"./client-components/WorldApi.js":6,"./phaserstates/Boot.js":26,"./phaserstates/Loader.js":27,"./phaserstates/Login.js":28,"./phaserstates/Space.js":29}],2:[function(require,module,exports){
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
 * CodeEndpointClient.js
 *
 * Methods for sending code to server and dealing with code related responses
 */

var CodeEndpointClient = function () {};

CodeEndpointClient.prototype.sendCode = function (code) {
    this.socket.emit('code', code);
};

module.exports = CodeEndpointClient;
},{}],4:[function(require,module,exports){
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

};

DOMInterface.prototype.layoutDOMSpaceState = function () {
    $('#code-btn').show().position({my: 'left bottom', at: 'left bottom', of: '#main'});
    $('#code-popup').position({my: 'left bottom', at: 'left top-16', of: '#code-btn'});
};

/**
 * Show login box and wire up handlers
 */
DOMInterface.prototype.showLogin = function () {
    var self = this;
    $('#login-window .message').hide();
    $('#login-window').show().position({my: 'center', at: 'center', of: window});
    $('#userlogin').on('click', function () {
        self.serverLogin($('#username').val(), $('#password').val());
    });
    $('#guestlogin').on('click', function () {
        self.serverLogin($('#gt1').val() + ' ' + $('#gt2').val());
    });
};

DOMInterface.prototype.setLoginError = function (error) {
    var msg = $('#login-window .message');
    if (!error) {
        msg.hide();
    } else {
        msg.html(error);
        msg.show();
    }
};

DOMInterface.prototype.hideLogin = function () {
    $('#login-window').hide();
};

module.exports = DOMInterface;

},{}],5:[function(require,module,exports){
/**
 * Method for drawing starfields
 */

var Starfield = function () {};

Starfield.prototype.randomNormal = function () {
    var t = 0;
    for (var i=0; i<6; i++) {
        t += this.game.rnd.normal();
    }
    return t/6;
};

Starfield.prototype.drawStar = function (ctx, x, y, d, color) {
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
};

Starfield.prototype.drawStarField = function (ctx, size, n) {
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
};

module.exports = Starfield;

},{}],6:[function(require,module,exports){
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
    Tree: require('../phaserbodies/Tree.js'),
    TractorBeam: require('../phaserbodies/TractorBeam.js'),
    StarTarget: require('../phaserbodies/StarTarget.js')
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
        //config.tag = this.player.username;
        //if (config.properties.playerid === this.player.id) {
            // Only the player's own ship is treated as dynamic in the local physics sim
            config.mass = this.config.physicsProperties.Ship.mass;
            playerShip = true;
        //}
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

},{"../phaserbodies/Asteroid.js":10,"../phaserbodies/Bullet.js":11,"../phaserbodies/Crystal.js":12,"../phaserbodies/GenericOrb.js":13,"../phaserbodies/Planetoid.js":14,"../phaserbodies/Ship.js":15,"../phaserbodies/StarTarget.js":17,"../phaserbodies/TractorBeam.js":21,"../phaserbodies/Tree.js":22}],7:[function(require,module,exports){
/** client.js
 *
 * Main entry point for Starcoder game client
 *
 * @type {Starcoder|exports}
 */

//require('./BlocklyCustom.js');

var Starcoder = require('./Starcoder-client.js');


localStorage.debug = '';                        // used to toggle socket.io debugging

//document.addEventListener('DOMContentLoaded', function () {
//    var starcoder = new Starcoder();
//    starcoder.start();
//});

// toots mcgee

$(function () {
    var starcoder = new Starcoder();
    starcoder.start();
});

},{"./Starcoder-client.js":1}],8:[function(require,module,exports){
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
Bullet.prototype.updateProperties = [];

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
Asteroid.prototype._fillColor = '#00ff00';
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
},{"../Starcoder.js":2,"../common/UpdateProperties.js":9,"./SimpleParticle.js":16,"./SyncBodyInterface.js":18}],12:[function(require,module,exports){
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
    if (this.playerShip) {
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
        if (fX >= 0.5) {
            this.joystickState.right = true;
            this.joystickState.left = false;
        } else if (fX <= -0.5) {
            this.joystickState.right = false;
            this.joystickState.left = true;
        } else {
            this.joystickState.right = false;
            this.joystickState.left = false;
        }
        if (fY >= 0.5) {
            this.joystickState.down = true;
            this.joystickState.up = false;
        } else if (fY <= -0.5) {
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

var _connected = false;

/**
 * Set properties that require booted game state, attach plugins, connect to game server
 */
Boot.prototype.init = function () {
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

    // Inventory
    var label = this.game.make.text(this.game.width - 100, 25, 'INVENTORY', {font: '24px Arial', fill: '#ff9900', align: 'center'});
    label.anchor.setTo(0.5);
    this.game.ui.add(label);
    //this.game.inventorytext = this.game.make.text(this.game.width - 100, 50, '0 crystals',
    //    {font: '24px Arial', fill: '#ccc000', align: 'center'});
    this.game.inventorytext = this.game.make.bitmapText(this.game.width - 100, 50, 'readout-yellow', '0');
    this.game.inventorytext.anchor.setTo(0.5);
    this.game.ui.add(this.game.inventorytext);

    //MiniMap
    this.game.minimap = new MiniMap(this.game, 300, 300);
    this.game.ui.add(this.game.minimap);
    this.game.x = 10;
    this.game.y = 10;

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

Space.prototype.resize = function () {
    console.log('resize');
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

},{"../phaserbodies/SimpleParticle.js":16,"../phaserbodies/ThrustGenerator.js":19,"../phaserbodies/Toast.js":20,"../phaserplugins/Controls.js":24,"../phaserplugins/SyncClient.js":25,"../phaserui/MiniMap.js":30}],30:[function(require,module,exports){
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
},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvU3RhcmNvZGVyLWNsaWVudC5qcyIsInNyYy9TdGFyY29kZXIuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvQ29kZUVuZHBvaW50Q2xpZW50LmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL0RPTUludGVyZmFjZS5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9TdGFyZmllbGQuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvV29ybGRBcGkuanMiLCJzcmMvY2xpZW50LmpzIiwic3JjL2NvbW1vbi9QYXRocy5qcyIsInNyYy9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcyIsInNyYy9waGFzZXJib2RpZXMvQXN0ZXJvaWQuanMiLCJzcmMvcGhhc2VyYm9kaWVzL0J1bGxldC5qcyIsInNyYy9waGFzZXJib2RpZXMvQ3J5c3RhbC5qcyIsInNyYy9waGFzZXJib2RpZXMvR2VuZXJpY09yYi5qcyIsInNyYy9waGFzZXJib2RpZXMvUGxhbmV0b2lkLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TaGlwLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TaW1wbGVQYXJ0aWNsZS5qcyIsInNyYy9waGFzZXJib2RpZXMvU3RhclRhcmdldC5qcyIsInNyYy9waGFzZXJib2RpZXMvU3luY0JvZHlJbnRlcmZhY2UuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1RocnVzdEdlbmVyYXRvci5qcyIsInNyYy9waGFzZXJib2RpZXMvVG9hc3QuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1RyYWN0b3JCZWFtLmpzIiwic3JjL3BoYXNlcmJvZGllcy9UcmVlLmpzIiwic3JjL3BoYXNlcmJvZGllcy9WZWN0b3JTcHJpdGUuanMiLCJzcmMvcGhhc2VycGx1Z2lucy9Db250cm9scy5qcyIsInNyYy9waGFzZXJwbHVnaW5zL1N5bmNDbGllbnQuanMiLCJzcmMvcGhhc2Vyc3RhdGVzL0Jvb3QuanMiLCJzcmMvcGhhc2Vyc3RhdGVzL0xvYWRlci5qcyIsInNyYy9waGFzZXJzdGF0ZXMvTG9naW4uanMiLCJzcmMvcGhhc2Vyc3RhdGVzL1NwYWNlLmpzIiwic3JjL3BoYXNlcnVpL01pbmlNYXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogU3RhcmNvZGVyLWNsaWVudC5qc1xuICpcbiAqIFN0YXJjb2RlciBtYXN0ZXIgb2JqZWN0IGV4dGVuZGVkIHdpdGggY2xpZW50IG9ubHkgcHJvcGVydGllcyBhbmQgbWV0aG9kc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgV29ybGRBcGkgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL1dvcmxkQXBpLmpzJyk7XG52YXIgRE9NSW50ZXJmYWNlID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9ET01JbnRlcmZhY2UuanMnKTtcbnZhciBDb2RlRW5kcG9pbnRDbGllbnQgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL0NvZGVFbmRwb2ludENsaWVudC5qcycpO1xudmFyIFN0YXJmaWVsZCA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvU3RhcmZpZWxkLmpzJyk7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTdGFyY29kZXIucHJvdG90eXBlLCBXb3JsZEFwaS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJjb2Rlci5wcm90b3R5cGUsIERPTUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJjb2Rlci5wcm90b3R5cGUsIENvZGVFbmRwb2ludENsaWVudC5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJjb2Rlci5wcm90b3R5cGUsIFN0YXJmaWVsZC5wcm90b3R5cGUpO1xuXG52YXIgc3RhdGVzID0ge1xuICAgIGJvb3Q6IHJlcXVpcmUoJy4vcGhhc2Vyc3RhdGVzL0Jvb3QuanMnKSxcbiAgICBzcGFjZTogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvU3BhY2UuanMnKSxcbiAgICBsb2dpbjogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvTG9naW4uanMnKSxcbiAgICBsb2FkZXI6IHJlcXVpcmUoJy4vcGhhc2Vyc3RhdGVzL0xvYWRlci5qcycpXG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbyA9IGlvO1xuICAgIHRoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSgxODAwLCA5NTAsIFBoYXNlci5BVVRPLCAnbWFpbicpO1xuICAgIC8vdGhpcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKDE4MDAsIDk1MCwgUGhhc2VyLkNBTlZBUywgJ21haW4nKTtcbiAgICB0aGlzLmdhbWUuZm9yY2VTaW5nbGVVcGRhdGUgPSB0cnVlO1xuICAgIHRoaXMuZ2FtZS5zdGFyY29kZXIgPSB0aGlzO1xuICAgIGZvciAodmFyIGsgaW4gc3RhdGVzKSB7XG4gICAgICAgIHZhciBzdGF0ZSA9IG5ldyBzdGF0ZXNba10oKTtcbiAgICAgICAgc3RhdGUuc3RhcmNvZGVyID0gdGhpcztcbiAgICAgICAgdGhpcy5nYW1lLnN0YXRlLmFkZChrLCBzdGF0ZSk7XG4gICAgfVxuICAgIHRoaXMuY21kUXVldWUgPSBbXTtcbiAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMubGFzdE5ldEVycm9yID0gbnVsbDtcbiAgICB0aGlzLmluaXRET01JbnRlcmZhY2UoKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuc2VydmVyQ29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCF0aGlzLnNvY2tldCkge1xuICAgICAgICBkZWxldGUgdGhpcy5zb2NrZXQ7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGFzdE5ldEVycm9yID0gbnVsbDtcbiAgICB9XG4gICAgdmFyIHNlcnZlclVyaSA9IHRoaXMuY29uZmlnLnNlcnZlclVyaTtcbiAgICBpZiAoIXNlcnZlclVyaSkge1xuICAgICAgICB2YXIgcHJvdG9jb2wgPSB0aGlzLmNvbmZpZy5zZXJ2ZXJQcm90b2wgfHwgd2luZG93LmxvY2F0aW9uLnByb3RvY29sO1xuICAgICAgICB2YXIgcG9ydCA9IHRoaXMuY29uZmlnLnNlcnZlclBvcnQgfHwgJzgwODAnO1xuICAgICAgICBzZXJ2ZXJVcmkgPSBwcm90b2NvbCArICcvLycgKyB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgKyAnOicgKyBwb3J0O1xuICAgIH1cbiAgICB0aGlzLnNvY2tldCA9IHRoaXMuaW8oc2VydmVyVXJpLCB0aGlzLmNvbmZpZy5pb0NsaWVudE9wdGlvbnMpO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coJ3NvY2tldCBjb25uZWN0ZWQnKTtcbiAgICAgICAgc2VsZi5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICBzZWxmLmxhc3ROZXRFcnJvciA9IG51bGw7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Vycm9yJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdzb2NrZXQgZXJyb3InKTtcbiAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICB0aGlzLmxhc3ROZXRFcnJvciA9IGRhdGE7XG4gICAgfSk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLnNlcnZlckxvZ2luID0gZnVuY3Rpb24gKHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgIHZhciBsb2dpbiA9IHt9O1xuICAgIGlmICghcGFzc3dvcmQpIHtcbiAgICAgICAgLy8gR3Vlc3QgbG9naW5cbiAgICAgICAgbG9naW4uZ2FtZXJ0YWcgPSB1c2VybmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2dpbi51c2VybmFtZSA9IHVzZXJuYW1lO1xuICAgICAgICBsb2dpbi5wYXNzd29yZCA9IHBhc3N3b3JkO1xuICAgIH1cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdsb2dpbicsIGxvZ2luKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdib290Jyk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLmF0dGFjaFBsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcGx1Z2luID0gdGhpcy5nYW1lLnBsdWdpbnMuYWRkLmFwcGx5KHRoaXMuZ2FtZS5wbHVnaW5zLCBhcmd1bWVudHMpO1xuICAgIHBsdWdpbi5zdGFyY29kZXIgPSB0aGlzO1xuICAgIHBsdWdpbi5sb2cgPSB0aGlzLmxvZztcbiAgICByZXR1cm4gcGx1Z2luO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5yb2xlID0gJ0NsaWVudCc7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcmNvZGVyO1xuIiwiLyoqXG4gKiBTdGFyY29kZXIuanNcbiAqXG4gKiBTZXQgdXAgZ2xvYmFsIFN0YXJjb2RlciBuYW1lc3BhY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL3ZhciBTdGFyY29kZXIgPSB7XG4vLyAgICBjb25maWc6IHtcbi8vICAgICAgICB3b3JsZEJvdW5kczogWy00MjAwLCAtNDIwMCwgODQwMCwgODQwMF1cbi8vXG4vLyAgICB9LFxuLy8gICAgU3RhdGVzOiB7fVxuLy99O1xuXG52YXIgY29uZmlnID0ge1xuICAgIHZlcnNpb246ICcwLjEnLFxuICAgIHNlcnZlclVyaTogJ2h0dHA6Ly9waGFyY29kZXItc2luZ2xlLTEuZWxhc3RpY2JlYW5zdGFsay5jb206ODA4MCcsXG4gICAgLy9zZXJ2ZXJVcmk6ICdodHRwOi8vbG9jYWxob3N0OjgwODEnLFxuICAgIC8vc2VydmVyQWRkcmVzczogJzEuMi4zLjQnLFxuICAgIC8vd29ybGRCb3VuZHM6IFstNDIwMCwgLTQyMDAsIDg0MDAsIDg0MDBdLFxuICAgIHdvcmxkQm91bmRzOiBbLTIwMCwgLTIwMCwgMjAwLCAyMDBdLFxuICAgIGlvQ2xpZW50T3B0aW9uczoge1xuICAgICAgICAvL2ZvcmNlTmV3OiB0cnVlXG4gICAgICAgIHJlY29ubmVjdGlvbjogZmFsc2VcbiAgICB9LFxuICAgIHVwZGF0ZUludGVydmFsOiA1MCxcbiAgICByZW5kZXJMYXRlbmN5OiAxMDAsXG4gICAgcGh5c2ljc1NjYWxlOiAyMCxcbiAgICBmcmFtZVJhdGU6ICgxIC8gNjApLFxuICAgIHRpbWVTeW5jRnJlcTogMTAsXG4gICAgcGh5c2ljc1Byb3BlcnRpZXM6IHtcbiAgICAgICAgU2hpcDoge1xuICAgICAgICAgICAgbWFzczogMTBcbiAgICAgICAgfSxcbiAgICAgICAgQXN0ZXJvaWQ6IHtcbiAgICAgICAgICAgIG1hc3M6IDIwXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdhbWVyVGFnczoge1xuICAgICAgICAxOiBbXG4gICAgICAgICAgICAnc3VwZXInLFxuICAgICAgICAgICAgJ2F3ZXNvbWUnLFxuICAgICAgICAgICAgJ3JhaW5ib3cnLFxuICAgICAgICAgICAgJ2RvdWJsZScsXG4gICAgICAgICAgICAndHJpcGxlJyxcbiAgICAgICAgICAgICd2YW1waXJlJyxcbiAgICAgICAgICAgICdwcmluY2VzcycsXG4gICAgICAgICAgICAnaWNlJyxcbiAgICAgICAgICAgICdmaXJlJyxcbiAgICAgICAgICAgICdyb2JvdCcsXG4gICAgICAgICAgICAnd2VyZXdvbGYnLFxuICAgICAgICAgICAgJ3NwYXJrbGUnLFxuICAgICAgICAgICAgJ2luZmluaXRlJyxcbiAgICAgICAgICAgICdjb29sJyxcbiAgICAgICAgICAgICd5b2xvJyxcbiAgICAgICAgICAgICdzd2FnZ3knXG4gICAgICAgIF0sXG4gICAgICAgIDI6IFtcbiAgICAgICAgICAgICd0aWdlcicsXG4gICAgICAgICAgICAnbmluamEnLFxuICAgICAgICAgICAgJ3ByaW5jZXNzJyxcbiAgICAgICAgICAgICdyb2JvdCcsXG4gICAgICAgICAgICAncG9ueScsXG4gICAgICAgICAgICAnZGFuY2VyJyxcbiAgICAgICAgICAgICdyb2NrZXInLFxuICAgICAgICAgICAgJ21hc3RlcicsXG4gICAgICAgICAgICAnaGFja2VyJyxcbiAgICAgICAgICAgICdyYWluYm93JyxcbiAgICAgICAgICAgICdraXR0ZW4nLFxuICAgICAgICAgICAgJ3B1cHB5JyxcbiAgICAgICAgICAgICdib3NzJ1xuICAgICAgICBdXG4gICAgfSxcbiAgICBpbml0aWFsQm9kaWVzOiBbXG4gICAgICAgIHt0eXBlOiAnQXN0ZXJvaWQnLCBudW1iZXI6IDI1LCBjb25maWc6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnfSxcbiAgICAgICAgICAgIHZlbG9jaXR5OiB7cmFuZG9tOiAndmVjdG9yJywgbG86IC0xNSwgaGk6IDE1fSxcbiAgICAgICAgICAgIGFuZ3VsYXJWZWxvY2l0eToge3JhbmRvbTogJ2Zsb2F0JywgbG86IC01LCBoaTogNX0sXG4gICAgICAgICAgICB2ZWN0b3JTY2FsZToge3JhbmRvbTogJ2Zsb2F0JywgbG86IDAuNiwgaGk6IDEuNH0sXG4gICAgICAgICAgICBtYXNzOiAxMFxuICAgICAgICB9fSxcbiAgICAgICAgLy97dHlwZTogJ0NyeXN0YWwnLCBudW1iZXI6IDEwLCBjb25maWc6IHtcbiAgICAgICAgLy8gICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCd9LFxuICAgICAgICAvLyAgICB2ZWxvY2l0eToge3JhbmRvbTogJ3ZlY3RvcicsIGxvOiAtNCwgaGk6IDQsIG5vcm1hbDogdHJ1ZX0sXG4gICAgICAgIC8vICAgIHZlY3RvclNjYWxlOiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogMC40LCBoaTogMC44fSxcbiAgICAgICAgLy8gICAgbWFzczogNVxuICAgICAgICAvL319XG4gICAgICAgIC8ve3R5cGU6ICdIeWRyYScsIG51bWJlcjogMSwgY29uZmlnOiB7XG4gICAgICAgIC8vICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDUwfVxuICAgICAgICAvL319LFxuICAgICAgICB7dHlwZTogJ1BsYW5ldG9pZCcsIG51bWJlcjogNiwgY29uZmlnOiB7XG4gICAgICAgICAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJywgcGFkOiAzMH0sXG4gICAgICAgICAgICBhbmd1bGFyVmVsb2NpdHk6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAtMiwgaGk6IDJ9LFxuICAgICAgICAgICAgdmVjdG9yU2NhbGU6IDIuNSxcbiAgICAgICAgICAgIG1hc3M6IDEwMFxuICAgICAgICB9fSxcbiAgICAgICAgLy97dHlwZTogJ1N0YXJUYXJnZXQnLCBudW1iZXI6IDEwLCBjb25maWc6IHtcbiAgICAgICAgLy8gICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCcsIHBhZDogMzB9LFxuICAgICAgICAvLyAgICB2ZWN0b3JTY2FsZTogMC41LFxuICAgICAgICAvLyAgICBzdGFyczogW1swLCAwXSwgWzEsMV0sIFstMSwxXSwgWzEsLTFdXVxuICAgICAgICAvL319XG4gICAgICAgIC8vIEZJWE1FOiBUcmVlcyBqdXN0IGZvciB0ZXN0aW5nXG4gICAgICAgIC8ve3R5cGU6ICdUcmVlJywgbnVtYmVyOiAxMCwgY29uZmlnOiB7XG4gICAgICAgIC8vICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDMwfSxcbiAgICAgICAgLy8gICAgdmVjdG9yU2NhbGU6IDEsXG4gICAgICAgIC8vICAgIG1hc3M6IDVcbiAgICAgICAgLy99fVxuICAgIF1cbn07XG5cbnZhciBTdGFyY29kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgLy8gSW5pdGlhbGl6ZXJzIHZpcnR1YWxpemVkIGFjY29yZGluZyB0byByb2xlXG4gICAgdGhpcy5iYW5uZXIoKTtcbiAgICB0aGlzLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAvL3RoaXMuaW5pdE5ldC5jYWxsKHRoaXMpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5leHRlbmRDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgZm9yICh2YXIgayBpbiBjb25maWcpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWdba10gPSBjb25maWdba107XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vLyBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgY29tbW9uIGNvbmZpZyBvcHRpb25zXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAnd29ybGRXaWR0aCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzJdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyV2lkdGgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiAodGhpcy5jb25maWcud29ybGRCb3VuZHNbMl0gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1swXSk7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAnd29ybGRIZWlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlckhlaWdodCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqICh0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdKTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJMZWZ0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyVG9wJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMV07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyUmlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1syXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJCb3R0b20nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXTtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBBZGQgbWl4aW4gcHJvcGVydGllcyB0byB0YXJnZXQuIEFkYXB0ZWQgKHNsaWdodGx5KSBmcm9tIFBoYXNlclxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXRcbiAqIEBwYXJhbSB7b2JqZWN0fSBtaXhpblxuICovXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUgPSBmdW5jdGlvbiAodGFyZ2V0LCBtaXhpbikge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobWl4aW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgdmFyIHZhbCA9IG1peGluW2tleV07XG4gICAgICAgIGlmICh2YWwgJiZcbiAgICAgICAgICAgICh0eXBlb2YgdmFsLmdldCA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgdmFsLnNldCA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgdmFsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gdmFsO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5iYW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5sb2coJ1N0YXJjb2RlcicsIHRoaXMucm9sZSwgJ3YnICsgdGhpcy5jb25maWcudmVyc2lvbiwgJ3N0YXJ0ZWQgYXQnLCBEYXRlKCkpO1xufVxuXG4vKipcbiAqIEN1c3RvbSBsb2dnaW5nIGZ1bmN0aW9uIHRvIGJlIGZlYXR1cmVmaWVkIGFzIG5lY2Vzc2FyeVxuICovXG5TdGFyY29kZXIucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcmNvZGVyO1xuIiwiLyoqXG4gKiBDb2RlRW5kcG9pbnRDbGllbnQuanNcbiAqXG4gKiBNZXRob2RzIGZvciBzZW5kaW5nIGNvZGUgdG8gc2VydmVyIGFuZCBkZWFsaW5nIHdpdGggY29kZSByZWxhdGVkIHJlc3BvbnNlc1xuICovXG5cbnZhciBDb2RlRW5kcG9pbnRDbGllbnQgPSBmdW5jdGlvbiAoKSB7fTtcblxuQ29kZUVuZHBvaW50Q2xpZW50LnByb3RvdHlwZS5zZW5kQ29kZSA9IGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnY29kZScsIGNvZGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2RlRW5kcG9pbnRDbGllbnQ7IiwiLyoqXG4gKiBET01JbnRlcmZhY2UuanNcbiAqXG4gKiBIYW5kbGUgRE9NIGNvbmZpZ3VyYXRpb24vaW50ZXJhY3Rpb24sIGkuZS4gbm9uLVBoYXNlciBzdHVmZlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBET01JbnRlcmZhY2UgPSBmdW5jdGlvbiAoKSB7fTtcblxuRE9NSW50ZXJmYWNlLnByb3RvdHlwZS5pbml0RE9NSW50ZXJmYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLmRvbSA9IHt9OyAgICAgICAgICAgICAgLy8gbmFtZXNwYWNlXG4gICAgdGhpcy5kb20uY29kZUJ1dHRvbiA9ICQoJyNjb2RlLWJ0bicpO1xuICAgIHRoaXMuZG9tLmNvZGVQb3B1cCA9ICQoJyNjb2RlLXBvcHVwJyk7XG4gICAgdGhpcy5kb20ubG9naW5Qb3B1cD0gJCgnI2xvZ2luJyk7XG4gICAgdGhpcy5kb20ubG9naW5CdXR0b24gPSAkKCcjc3VibWl0Jyk7XG5cbiAgICB0aGlzLmRvbS5jb2RlQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5kb20uY29kZVBvcHVwLnRvZ2dsZSgnc2xvdycpO1xuICAgIH0pO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50LnNvdXJjZSA9PT0gc2VsZi5kb20uY29kZVBvcHVwWzBdLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICAgIHNlbGYuc2VuZENvZGUoZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy90aGlzLmRvbS5jb2RlUG9wdXAuaGlkZSgpO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IDI7IGkrKykge1xuICAgICAgICB2YXIgdGFncyA9IHRoaXMuY29uZmlnLmdhbWVyVGFnc1tpXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDAsIGwgPSB0YWdzLmxlbmd0aDsgaiA8IGw7IGorKykge1xuICAgICAgICAgICAgJCgnI2d0JyArIGkpLmFwcGVuZCgnPG9wdGlvbj4nICsgdGFnc1tqXSArICc8L29wdGlvbj4nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAkKCcuc2VsZWN0Jykuc2VsZWN0bWVudSgpO1xuICAgICQoJy5sb2dpbmJ1dHRvbicpLmJ1dHRvbih7aWNvbnM6IHtwcmltYXJ5OiAndWktaWNvbi10cmlhbmdsZS0xLWUnfX0pO1xuXG4gICAgJCgnLmFjY29yZGlvbicpLmFjY29yZGlvbih7aGVpZ2h0U3R5bGU6ICdjb250ZW50J30pO1xuICAgICQoJy5oaWRkZW4nKS5oaWRlKCk7XG5cbn07XG5cbkRPTUludGVyZmFjZS5wcm90b3R5cGUubGF5b3V0RE9NU3BhY2VTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjY29kZS1idG4nKS5zaG93KCkucG9zaXRpb24oe215OiAnbGVmdCBib3R0b20nLCBhdDogJ2xlZnQgYm90dG9tJywgb2Y6ICcjbWFpbid9KTtcbiAgICAkKCcjY29kZS1wb3B1cCcpLnBvc2l0aW9uKHtteTogJ2xlZnQgYm90dG9tJywgYXQ6ICdsZWZ0IHRvcC0xNicsIG9mOiAnI2NvZGUtYnRuJ30pO1xufTtcblxuLyoqXG4gKiBTaG93IGxvZ2luIGJveCBhbmQgd2lyZSB1cCBoYW5kbGVyc1xuICovXG5ET01JbnRlcmZhY2UucHJvdG90eXBlLnNob3dMb2dpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgJCgnI2xvZ2luLXdpbmRvdyAubWVzc2FnZScpLmhpZGUoKTtcbiAgICAkKCcjbG9naW4td2luZG93Jykuc2hvdygpLnBvc2l0aW9uKHtteTogJ2NlbnRlcicsIGF0OiAnY2VudGVyJywgb2Y6IHdpbmRvd30pO1xuICAgICQoJyN1c2VybG9naW4nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuc2VydmVyTG9naW4oJCgnI3VzZXJuYW1lJykudmFsKCksICQoJyNwYXNzd29yZCcpLnZhbCgpKTtcbiAgICB9KTtcbiAgICAkKCcjZ3Vlc3Rsb2dpbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5zZXJ2ZXJMb2dpbigkKCcjZ3QxJykudmFsKCkgKyAnICcgKyAkKCcjZ3QyJykudmFsKCkpO1xuICAgIH0pO1xufTtcblxuRE9NSW50ZXJmYWNlLnByb3RvdHlwZS5zZXRMb2dpbkVycm9yID0gZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgdmFyIG1zZyA9ICQoJyNsb2dpbi13aW5kb3cgLm1lc3NhZ2UnKTtcbiAgICBpZiAoIWVycm9yKSB7XG4gICAgICAgIG1zZy5oaWRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbXNnLmh0bWwoZXJyb3IpO1xuICAgICAgICBtc2cuc2hvdygpO1xuICAgIH1cbn07XG5cbkRPTUludGVyZmFjZS5wcm90b3R5cGUuaGlkZUxvZ2luID0gZnVuY3Rpb24gKCkge1xuICAgICQoJyNsb2dpbi13aW5kb3cnKS5oaWRlKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERPTUludGVyZmFjZTtcbiIsIi8qKlxuICogTWV0aG9kIGZvciBkcmF3aW5nIHN0YXJmaWVsZHNcbiAqL1xuXG52YXIgU3RhcmZpZWxkID0gZnVuY3Rpb24gKCkge307XG5cblN0YXJmaWVsZC5wcm90b3R5cGUucmFuZG9tTm9ybWFsID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ID0gMDtcbiAgICBmb3IgKHZhciBpPTA7IGk8NjsgaSsrKSB7XG4gICAgICAgIHQgKz0gdGhpcy5nYW1lLnJuZC5ub3JtYWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHQvNjtcbn07XG5cblN0YXJmaWVsZC5wcm90b3R5cGUuZHJhd1N0YXIgPSBmdW5jdGlvbiAoY3R4LCB4LCB5LCBkLCBjb2xvcikge1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHgubW92ZVRvKHgtZCsxLCB5LWQrMSk7XG4gICAgY3R4LmxpbmVUbyh4K2QtMSwgeStkLTEpO1xuICAgIGN0eC5tb3ZlVG8oeC1kKzEsIHkrZC0xKTtcbiAgICBjdHgubGluZVRvKHgrZC0xLCB5LWQrMSk7XG4gICAgY3R4Lm1vdmVUbyh4LCB5LWQpO1xuICAgIGN0eC5saW5lVG8oeCwgeStkKTtcbiAgICBjdHgubW92ZVRvKHgtZCwgeSk7XG4gICAgY3R4LmxpbmVUbyh4K2QsIHkpO1xuICAgIGN0eC5zdHJva2UoKTtcbn07XG5cblN0YXJmaWVsZC5wcm90b3R5cGUuZHJhd1N0YXJGaWVsZCA9IGZ1bmN0aW9uIChjdHgsIHNpemUsIG4pIHtcbiAgICB2YXIgeG0gPSBNYXRoLnJvdW5kKHNpemUvMiArIHRoaXMucmFuZG9tTm9ybWFsKCkqc2l6ZS80KTtcbiAgICB2YXIgeW0gPSBNYXRoLnJvdW5kKHNpemUvMiArIHRoaXMucmFuZG9tTm9ybWFsKCkqc2l6ZS80KTtcbiAgICB2YXIgcXVhZHMgPSBbWzAsMCx4bS0xLHltLTFdLCBbeG0sMCxzaXplLTEseW0tMV0sXG4gICAgICAgIFswLHltLHhtLTEsc2l6ZS0xXSwgW3htLHltLHNpemUtMSxzaXplLTFdXTtcbiAgICB2YXIgY29sb3I7XG4gICAgdmFyIGksIGosIGwsIHE7XG5cbiAgICBuID0gTWF0aC5yb3VuZChuLzQpO1xuICAgIGZvciAoaT0wLCBsPXF1YWRzLmxlbmd0aDsgaTxsOyBpKyspIHtcbiAgICAgICAgcSA9IHF1YWRzW2ldO1xuICAgICAgICBmb3IgKGo9MDsgajxuOyBqKyspIHtcbiAgICAgICAgICAgIGNvbG9yID0gJ2hzbCg2MCwxMDAlLCcgKyB0aGlzLmdhbWUucm5kLmJldHdlZW4oOTAsOTkpICsgJyUpJztcbiAgICAgICAgICAgIHRoaXMuZHJhd1N0YXIoY3R4LFxuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5ybmQuYmV0d2VlbihxWzBdKzcsIHFbMl0tNyksIHRoaXMuZ2FtZS5ybmQuYmV0d2VlbihxWzFdKzcsIHFbM10tNyksXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnJuZC5iZXR3ZWVuKDIsNCksIGNvbG9yKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcmZpZWxkO1xuIiwiLyoqXG4gKiBXb3JsZEFwaS5qc1xuICpcbiAqIEFkZC9yZW1vdmUvbWFuaXB1bGF0ZSBib2RpZXMgaW4gY2xpZW50J3MgcGh5c2ljcyB3b3JsZFxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBXb3JsZEFwaSA9IGZ1bmN0aW9uICgpIHt9O1xuXG52YXIgYm9keVR5cGVzID0ge1xuICAgIFNoaXA6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9TaGlwLmpzJyksXG4gICAgQXN0ZXJvaWQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9Bc3Rlcm9pZC5qcycpLFxuICAgIENyeXN0YWw6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9DcnlzdGFsLmpzJyksXG4gICAgQnVsbGV0OiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvQnVsbGV0LmpzJyksXG4gICAgR2VuZXJpY09yYjogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0dlbmVyaWNPcmIuanMnKSxcbiAgICBQbGFuZXRvaWQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9QbGFuZXRvaWQuanMnKSxcbiAgICBUcmVlOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVHJlZS5qcycpLFxuICAgIFRyYWN0b3JCZWFtOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVHJhY3RvckJlYW0uanMnKSxcbiAgICBTdGFyVGFyZ2V0OiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvU3RhclRhcmdldC5qcycpXG59O1xuXG4vKipcbiAqIEFkZCBib2R5IHRvIHdvcmxkIG9uIGNsaWVudCBzaWRlXG4gKlxuICogQHBhcmFtIHR5cGUge3N0cmluZ30gLSB0eXBlIG5hbWUgb2Ygb2JqZWN0IHRvIGFkZFxuICogQHBhcmFtIGNvbmZpZyB7b2JqZWN0fSAtIHByb3BlcnRpZXMgZm9yIG5ldyBvYmplY3RcbiAqIEByZXR1cm5zIHtQaGFzZXIuU3ByaXRlfSAtIG5ld2x5IGFkZGVkIG9iamVjdFxuICovXG5cbldvcmxkQXBpLnByb3RvdHlwZS5hZGRCb2R5ID0gZnVuY3Rpb24gKHR5cGUsIGNvbmZpZykge1xuICAgIHZhciBjdG9yID0gYm9keVR5cGVzW3R5cGVdO1xuICAgIHZhciBwbGF5ZXJTaGlwID0gZmFsc2U7XG4gICAgaWYgKCFjdG9yKSB7XG4gICAgICAgIHRoaXMubG9nKCdVbmtub3duIGJvZHkgdHlwZTonLCB0eXBlKTtcbiAgICAgICAgdGhpcy5sb2coY29uZmlnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PT0gJ1NoaXAnICYmIGNvbmZpZy5wcm9wZXJ0aWVzLnBsYXllcmlkID09PSB0aGlzLnBsYXllci5pZCkge1xuICAgICAgICAvL2NvbmZpZy50YWcgPSB0aGlzLnBsYXllci51c2VybmFtZTtcbiAgICAgICAgLy9pZiAoY29uZmlnLnByb3BlcnRpZXMucGxheWVyaWQgPT09IHRoaXMucGxheWVyLmlkKSB7XG4gICAgICAgICAgICAvLyBPbmx5IHRoZSBwbGF5ZXIncyBvd24gc2hpcCBpcyB0cmVhdGVkIGFzIGR5bmFtaWMgaW4gdGhlIGxvY2FsIHBoeXNpY3Mgc2ltXG4gICAgICAgICAgICBjb25maWcubWFzcyA9IHRoaXMuY29uZmlnLnBoeXNpY3NQcm9wZXJ0aWVzLlNoaXAubWFzcztcbiAgICAgICAgICAgIHBsYXllclNoaXAgPSB0cnVlO1xuICAgICAgICAvL31cbiAgICB9XG4gICAgdmFyIGJvZHkgPSBuZXcgY3Rvcih0aGlzLmdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLmdhbWUuYWRkLmV4aXN0aW5nKGJvZHkpO1xuICAgIHRoaXMuZ2FtZS5wbGF5ZmllbGQuYWRkKGJvZHkpO1xuICAgIGlmIChwbGF5ZXJTaGlwKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5jYW1lcmEuZm9sbG93KGJvZHkpO1xuICAgICAgICB0aGlzLmdhbWUucGxheWVyU2hpcCA9IGJvZHk7XG4gICAgfVxuICAgIHJldHVybiBib2R5O1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYm9keSBmcm9tIGdhbWUgd29ybGRcbiAqXG4gKiBAcGFyYW0gc3ByaXRlIHtQaGFzZXIuU3ByaXRlfSAtIG9iamVjdCB0byByZW1vdmVcbiAqL1xuV29ybGRBcGkucHJvdG90eXBlLnJlbW92ZUJvZHkgPSBmdW5jdGlvbiAoc3ByaXRlKSB7XG4gICAgc3ByaXRlLmtpbGwoKTtcbiAgICAvLyBSZW1vdmUgbWluaXNwcml0ZVxuICAgIGlmIChzcHJpdGUubWluaXNwcml0ZSkge1xuICAgICAgICBzcHJpdGUubWluaXNwcml0ZS5raWxsKCk7XG4gICAgfVxuICAgIHRoaXMuZ2FtZS5waHlzaWNzLnAyLnJlbW92ZUJvZHkoc3ByaXRlLmJvZHkpO1xufTtcblxuLyoqXG4gKiBDb25maWd1cmUgb2JqZWN0IHdpdGggZ2l2ZW4gcHJvcGVydGllc1xuICpcbiAqIEBwYXJhbSBwcm9wZXJ0aWVzIHtvYmplY3R9XG4gKi9cbi8vV29ybGRBcGkucHJvdG90eXBlLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG4vLyAgICBmb3IgKHZhciBrIGluIHRoaXMudXBkYXRlUHJvcGVydGllcykge1xuLy8gICAgICAgIHRoaXNba10gPSBwcm9wZXJ0aWVzW2tdO1xuLy8gICAgfVxuLy99O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkQXBpO1xuIiwiLyoqIGNsaWVudC5qc1xuICpcbiAqIE1haW4gZW50cnkgcG9pbnQgZm9yIFN0YXJjb2RlciBnYW1lIGNsaWVudFxuICpcbiAqIEB0eXBlIHtTdGFyY29kZXJ8ZXhwb3J0c31cbiAqL1xuXG4vL3JlcXVpcmUoJy4vQmxvY2tseUN1c3RvbS5qcycpO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG5cblxubG9jYWxTdG9yYWdlLmRlYnVnID0gJyc7ICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXNlZCB0byB0b2dnbGUgc29ja2V0LmlvIGRlYnVnZ2luZ1xuXG4vL2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4vLyAgICB2YXIgc3RhcmNvZGVyID0gbmV3IFN0YXJjb2RlcigpO1xuLy8gICAgc3RhcmNvZGVyLnN0YXJ0KCk7XG4vL30pO1xuXG4vLyB0b290cyBtY2dlZVxuXG4kKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3RhcmNvZGVyID0gbmV3IFN0YXJjb2RlcigpO1xuICAgIHN0YXJjb2Rlci5zdGFydCgpO1xufSk7XG4iLCIvKipcbiAqIFBhdGguanNcbiAqXG4gKiBWZWN0b3IgcGF0aHMgc2hhcmVkIGJ5IG11bHRpcGxlIGVsZW1lbnRzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFBJID0gTWF0aC5QSTtcbnZhciBUQVUgPSAyKlBJO1xudmFyIHNpbiA9IE1hdGguc2luO1xudmFyIGNvcyA9IE1hdGguY29zO1xuXG5leHBvcnRzLm9jdGFnb24gPSBbXG4gICAgWzIsMV0sXG4gICAgWzEsMl0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwxXSxcbiAgICBbLTIsLTFdLFxuICAgIFstMSwtMl0sXG4gICAgWzEsLTJdLFxuICAgIFsyLC0xXVxuXTtcblxuZXhwb3J0cy5kMmNyb3NzID0gW1xuICAgIFstMSwtMl0sXG4gICAgWy0xLDJdLFxuICAgIFsyLC0xXSxcbiAgICBbLTIsLTFdLFxuICAgIFsxLDJdLFxuICAgIFsxLC0yXSxcbiAgICBbLTIsMV0sXG4gICAgWzIsMV1cbl07XG5cbmV4cG9ydHMuc3F1YXJlMCA9IFtcbiAgICBbLTEsLTJdLFxuICAgIFsyLC0xXSxcbiAgICBbMSwyXSxcbiAgICBbLTIsMV1cbl07XG5cbmV4cG9ydHMuc3F1YXJlMSA9IFtcbiAgICBbMSwtMl0sXG4gICAgWzIsMV0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwtMV1cbl07XG5cbmV4cG9ydHMuc3RhciA9IFtcbiAgICBbc2luKDApLCBjb3MoMCldLFxuICAgIFtzaW4oMipUQVUvNSksIGNvcygyKlRBVS81KV0sXG4gICAgW3Npbig0KlRBVS81KSwgY29zKDQqVEFVLzUpXSxcbiAgICBbc2luKFRBVS81KSwgY29zKFRBVS81KV0sXG4gICAgW3NpbigzKlRBVS81KSwgY29zKDMqVEFVLzUpXVxuXTtcblxuZXhwb3J0cy5PQ1RSQURJVVMgPSBNYXRoLnNxcnQoNSk7IiwiLyoqXG4gKiBVcGRhdGVQcm9wZXJ0aWVzLmpzXG4gKlxuICogQ2xpZW50L3NlcnZlciBzeW5jYWJsZSBwcm9wZXJ0aWVzIGZvciBnYW1lIG9iamVjdHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2hpcCA9IGZ1bmN0aW9uICgpIHt9O1xuU2hpcC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsnbGluZVdpZHRoJywgJ2xpbmVDb2xvcicsICdmaWxsQ29sb3InLCAnZmlsbEFscGhhJyxcbiAgICAndmVjdG9yU2NhbGUnLCAnc2hhcGUnLCAnc2hhcGVDbG9zZWQnLCAncGxheWVyaWQnLCAnY3J5c3RhbHMnLCAnZGVhZCcsICd0YWcnXTtcblxudmFyIEFzdGVyb2lkID0gZnVuY3Rpb24gKCkge307XG5Bc3Rlcm9pZC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsndmVjdG9yU2NhbGUnXTtcblxudmFyIENyeXN0YWwgPSBmdW5jdGlvbiAoKSB7fTtcbkNyeXN0YWwucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3ZlY3RvclNjYWxlJ107XG5cbnZhciBHZW5lcmljT3JiID0gZnVuY3Rpb24gKCkge307XG5HZW5lcmljT3JiLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lQ29sb3InLCAndmVjdG9yU2NhbGUnXTtcblxudmFyIFBsYW5ldG9pZCA9IGZ1bmN0aW9uICgpIHt9O1xuUGxhbmV0b2lkLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lQ29sb3InLCAnZmlsbENvbG9yJywgJ2xpbmVXaWR0aCcsICdmaWxsQWxwaGEnLCAndmVjdG9yU2NhbGUnLCAnb3duZXInXTtcblxudmFyIFRyZWUgPSBmdW5jdGlvbiAoKSB7fTtcblRyZWUucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3ZlY3RvclNjYWxlJywgJ2xpbmVDb2xvcicsICdncmFwaCcsICdzdGVwJywgJ2RlcHRoJ107XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoKSB7fTtcbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFtdO1xuXG52YXIgVHJhY3RvckJlYW0gPSBmdW5jdGlvbiAoKSB7fTtcblRyYWN0b3JCZWFtLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gW107XG5cbnZhciBTdGFyVGFyZ2V0ID0gZnVuY3Rpb24gKCkge307XG5TdGFyVGFyZ2V0LnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydzdGFycycsICdsaW5lQ29sb3InLCAndmVjdG9yU2NhbGUnXTtcblxuXG5leHBvcnRzLlNoaXAgPSBTaGlwO1xuZXhwb3J0cy5Bc3Rlcm9pZCA9IEFzdGVyb2lkO1xuZXhwb3J0cy5DcnlzdGFsID0gQ3J5c3RhbDtcbmV4cG9ydHMuR2VuZXJpY09yYiA9IEdlbmVyaWNPcmI7XG5leHBvcnRzLkJ1bGxldCA9IEJ1bGxldDtcbmV4cG9ydHMuUGxhbmV0b2lkID0gUGxhbmV0b2lkO1xuZXhwb3J0cy5UcmVlID0gVHJlZTtcbmV4cG9ydHMuVHJhY3RvckJlYW0gPSBUcmFjdG9yQmVhbTtcbmV4cG9ydHMuU3RhclRhcmdldCA9IFN0YXJUYXJnZXQ7XG4iLCIvKipcbiAqIEFzdGVyb2lkLmpzXG4gKlxuICogQ2xpZW50IHNpZGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkFzdGVyb2lkO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBBc3Rlcm9pZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbiAgICAvL3RoaXMuYm9keS5kYW1waW5nID0gMDtcbn07XG5cbkFzdGVyb2lkLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIGEgPSBuZXcgQXN0ZXJvaWQoZ2FtZSwgb3B0aW9ucyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5Bc3Rlcm9pZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuQXN0ZXJvaWQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQXN0ZXJvaWQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShBc3Rlcm9pZC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQXN0ZXJvaWQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkFzdGVyb2lkLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZjAwZmYnO1xuQXN0ZXJvaWQucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwZmYwMCc7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4yNTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFzdGVyb2lkO1xuLy9TdGFyY29kZXIuQXN0ZXJvaWQgPSBBc3Rlcm9pZDtcbiIsIi8qKlxuICogQnVsbGV0LmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb24gb2Ygc2ltcGxlIHByb2plY3RpbGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5CdWxsZXQ7XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgU2ltcGxlUGFydGljbGUuY2FsbCh0aGlzLCBnYW1lLCAnYnVsbGV0Jyk7XG4gICAgdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkJ1bGxldC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZSk7XG5CdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVsbGV0O1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQnVsbGV0LnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShCdWxsZXQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0OyIsIi8qKlxuICogQ3J5c3RhbC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuQ3J5c3RhbDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgQ3J5c3RhbCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkNyeXN0YWwuYWRkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIHZhciBhID0gbmV3IENyeXN0YWwoZ2FtZSwgY29uZmlnKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gYTtcbn07XG5cbkNyeXN0YWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcbkNyeXN0YWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ3J5c3RhbDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKENyeXN0YWwucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKENyeXN0YWwucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkNyeXN0YWwucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnIzAwZmZmZic7XG5DcnlzdGFsLnByb3RvdHlwZS5fZmlsbENvbG9yID0gJyMwMDAwMDAnO1xuQ3J5c3RhbC5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcbkNyeXN0YWwucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuQ3J5c3RhbC5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMDtcbkNyeXN0YWwucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5DcnlzdGFsLnByb3RvdHlwZS5fZ2VvbWV0cnkgPSBbXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLmQyY3Jvc3N9XG5dO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3J5c3RhbDtcbiIsIi8qKlxuICogR2VuZXJpY09yYi5qc1xuICpcbiAqIEJ1aWxkaW5nIGJsb2NrXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5HZW5lcmljT3JiO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBHZW5lcmljT3JiID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuR2VuZXJpY09yYi5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgdmFyIGEgPSBuZXcgR2VuZXJpY09yYihnYW1lLCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBhO1xufTtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmljT3JiO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoR2VuZXJpY09yYi5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoR2VuZXJpY09yYi5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmYwMDAwJztcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwMDAwMCc7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4wO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUuX2dlb21ldHJ5ID0gW1xuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5kMmNyb3NzfVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmljT3JiO1xuIiwiLyoqXG4gKiBQbGFuZXRvaWQuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlBsYW5ldG9pZDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgUGxhbmV0b2lkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG59O1xuXG5QbGFuZXRvaWQuYWRkID0gZnVuY3Rpb24gKGdhbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgcGxhbmV0b2lkID0gbmV3IFBsYW5ldG9pZChnYW1lLCBvcHRpb25zKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gcGxhbmV0b2lkO1xufTtcblxuUGxhbmV0b2lkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5QbGFuZXRvaWQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGxhbmV0b2lkO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoUGxhbmV0b2lkLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShQbGFuZXRvaWQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbi8vUGxhbmV0b2lkLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZjAwZmYnO1xuLy9QbGFuZXRvaWQucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwZmYwMCc7XG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMjU7XG5QbGFuZXRvaWQucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5QbGFuZXRvaWQucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5QbGFuZXRvaWQucHJvdG90eXBlLl9nZW9tZXRyeSA9IFtcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuZDJjcm9zc30sXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLnNxdWFyZTB9LFxuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5zcXVhcmUxfVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGFuZXRvaWQ7XG4iLCIvKipcbiAqIFNoaXAuanNcbiAqXG4gKiBDbGllbnQgc2lkZSBpbXBsZW1lbnRhdGlvblxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuU2hpcDtcbi8vdmFyIEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lLmpzJyk7XG4vL3ZhciBXZWFwb25zID0gcmVxdWlyZSgnLi9XZWFwb25zLmpzJyk7XG5cbnZhciBTaGlwID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xuXG4gICAgaWYgKGNvbmZpZy5tYXNzKSB7XG4gICAgICAgIHRoaXMuYm9keS5tYXNzID0gY29uZmlnLm1hc3M7XG4gICAgfVxuICAgIC8vdGhpcy5lbmdpbmUgPSBFbmdpbmUuYWRkKGdhbWUsICd0aHJ1c3QnLCA1MDApO1xuICAgIC8vdGhpcy5hZGRDaGlsZCh0aGlzLmVuZ2luZSk7XG4gICAgLy90aGlzLndlYXBvbnMgPSBXZWFwb25zLmFkZChnYW1lLCAnYnVsbGV0JywgMTIpO1xuICAgIC8vdGhpcy53ZWFwb25zLnNoaXAgPSB0aGlzO1xuICAgIC8vdGhpcy5hZGRDaGlsZCh0aGlzLndlYXBvbnMpO1xuICAgIHRoaXMudGFnVGV4dCA9IGdhbWUuYWRkLnRleHQoMCwgdGhpcy50ZXh0dXJlLmhlaWdodC8yICsgMSxcbiAgICAgICAgdGhpcy50YWcsIHtmb250OiAnYm9sZCAxOHB4IEFyaWFsJywgZmlsbDogdGhpcy5saW5lQ29sb3IgfHwgJyNmZmZmZmYnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICB0aGlzLnRhZ1RleHQuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLnRhZ1RleHQpO1xuICAgIHRoaXMubG9jYWxTdGF0ZSA9IHtcbiAgICAgICAgdGhydXN0OiAnb2ZmJ1xuICAgIH1cbn07XG5cblNoaXAuYWRkID0gZnVuY3Rpb24gKGdhbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgcyA9IG5ldyBTaGlwKGdhbWUsIG9wdGlvbnMpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHMpO1xuICAgIHJldHVybiBzO1xufTtcblxuU2hpcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuU2hpcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTaGlwO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoU2hpcC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoU2hpcC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuLy9TaGlwLnByb3RvdHlwZS5zZXRMaW5lU3R5bGUgPSBmdW5jdGlvbiAoY29sb3IsIGxpbmVXaWR0aCkge1xuLy8gICAgU3RhcmNvZGVyLlZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0TGluZVN0eWxlLmNhbGwodGhpcywgY29sb3IsIGxpbmVXaWR0aCk7XG4vLyAgICB0aGlzLnRhZ1RleHQuc2V0U3R5bGUoe2ZpbGw6IGNvbG9yfSk7XG4vL307XG5cbi8vU2hpcC5wcm90b3R5cGUuc2hhcGUgPSBbXG4vLyAgICBbLTEsLTFdLFxuLy8gICAgWy0wLjUsMF0sXG4vLyAgICBbLTEsMV0sXG4vLyAgICBbMCwwLjVdLFxuLy8gICAgWzEsMV0sXG4vLyAgICBbMC41LDBdLFxuLy8gICAgWzEsLTFdLFxuLy8gICAgWzAsLTAuNV0sXG4vLyAgICBbLTEsLTFdXG4vL107XG4vL1NoaXAucHJvdG90eXBlLl9saW5lV2lkdGggPSA2O1xuXG5TaGlwLnByb3RvdHlwZS51cGRhdGVBcHBlYXJhbmNlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEZJWE1FOiBQcm9iYWJseSBuZWVkIHRvIHJlZmFjdG9yIGNvbnN0cnVjdG9yIGEgYml0IHRvIG1ha2UgdGhpcyBjbGVhbmVyXG4gICAgVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGVBcHBlYXJhbmNlLmNhbGwodGhpcyk7XG4gICAgaWYgKHRoaXMudGFnVGV4dCkge1xuICAgICAgICAvL3RoaXMudGFnVGV4dC5zZXRTdHlsZSh7ZmlsbDogdGhpcy5saW5lQ29sb3J9KTtcbiAgICAgICAgdGhpcy50YWdUZXh0LmZpbGwgPSB0aGlzLmxpbmVDb2xvcjtcbiAgICAgICAgdGhpcy50YWdUZXh0LnkgPSB0aGlzLnRleHR1cmUuaGVpZ2h0LzIgKyAxO1xuICAgIH1cbn07XG5cblNoaXAucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBWZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMpO1xuICAgIC8vIEZJWE1FOiBOZWVkIHRvIGRlYWwgd2l0aCBwbGF5ZXIgdmVyc3VzIGZvcmVpZ24gc2hpcHNcbiAgICBzd2l0Y2ggKHRoaXMubG9jYWxTdGF0ZS50aHJ1c3QpIHtcbiAgICAgICAgY2FzZSAnc3RhcnRpbmcnOlxuICAgICAgICAgICAgdGhpcy5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QucGxheSgpO1xuICAgICAgICAgICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvci5zdGFydE9uKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0YXRlLnRocnVzdCA9ICdvbic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2h1dGRvd24nOlxuICAgICAgICAgICAgdGhpcy5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3Quc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvci5zdG9wT24odGhpcyk7XG4gICAgICAgICAgICB0aGlzLmxvY2FsU3RhdGUudGhydXN0ID0gJ29mZic7XG4gICAgfVxuICAgIC8vIFBsYXllciBzaGlwIG9ubHlcbiAgICBpZiAodGhpcy5wbGF5ZXJTaGlwKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5pbnZlbnRvcnl0ZXh0LnNldFRleHQodGhpcy5jcnlzdGFscy50b1N0cmluZygpKTtcbiAgICB9XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3RhZycsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RhZztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl90YWcgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaGlwO1xuLy9TdGFyY29kZXIuU2hpcCA9IFNoaXA7XG4iLCIvKipcbiAqIFNpbXBsZVBhcnRpY2xlLmpzXG4gKlxuICogQmFzaWMgYml0bWFwIHBhcnRpY2xlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSBmdW5jdGlvbiAoZ2FtZSwga2V5KSB7XG4gICAgdmFyIHRleHR1cmUgPSBTaW1wbGVQYXJ0aWNsZS5fdGV4dHVyZUNhY2hlW2tleV07XG4gICAgUGhhc2VyLlNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIDAsIDAsIHRleHR1cmUpO1xuICAgIGdhbWUucGh5c2ljcy5wMi5lbmFibGUodGhpcywgZmFsc2UsIGZhbHNlKTtcbiAgICB0aGlzLmJvZHkuY2xlYXJTaGFwZXMoKTtcbiAgICB2YXIgc2hhcGUgPSB0aGlzLmJvZHkuYWRkUGFydGljbGUoKTtcbiAgICBzaGFwZS5zZW5zb3IgPSB0cnVlO1xuICAgIC8vdGhpcy5raWxsKCk7XG59O1xuXG5TaW1wbGVQYXJ0aWNsZS5fdGV4dHVyZUNhY2hlID0ge307XG5cblNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSA9IGZ1bmN0aW9uIChnYW1lLCBrZXksIGNvbG9yLCBzaXplLCBjaXJjbGUpIHtcbiAgICB2YXIgdGV4dHVyZSA9IGdhbWUubWFrZS5iaXRtYXBEYXRhKHNpemUsIHNpemUpO1xuICAgIHRleHR1cmUuY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIGlmIChjaXJjbGUpIHtcbiAgICAgICAgdGV4dHVyZS5jdHguYXJjKHNpemUvMiwgc2l6ZS8yLCBzaXplLzIsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XG4gICAgICAgIHRleHR1cmUuY3R4LmZpbGwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0dXJlLmN0eC5maWxsUmVjdCgwLCAwLCBzaXplLCBzaXplKTtcbiAgICB9XG4gICAgU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZVtrZXldID0gdGV4dHVyZTtcbn07XG5cblNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlNwcml0ZS5wcm90b3R5cGUpO1xuU2ltcGxlUGFydGljbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2ltcGxlUGFydGljbGU7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVQYXJ0aWNsZTtcbi8vU3RhcmNvZGVyLlNpbXBsZVBhcnRpY2xlID0gU2ltcGxlUGFydGljbGU7IiwiLyoqXG4gKiBTdGFyVGFyZ2V0LmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb25cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlN0YXJUYXJnZXQ7XG5cbnZhciBzdGFyID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJykuc3RhcjtcblxudmFyIFN0YXJUYXJnZXQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbn07XG5cblN0YXJUYXJnZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcblN0YXJUYXJnZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3RhclRhcmdldDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJUYXJnZXQucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJUYXJnZXQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cblN0YXJUYXJnZXQucHJvdG90eXBlLmRyYXdQcm9jZWR1cmUgPSBmdW5jdGlvbiAocmVuZGVyU2NhbGUpIHtcbiAgICB2YXIgcHNjID0gdGhpcy5nYW1lLnBoeXNpY3MucDIubXB4aShyZW5kZXJTY2FsZSk7XG4gICAgdmFyIGdzYyA9IHBzYyp0aGlzLnZlY3RvclNjYWxlO1xuICAgIHZhciBsaW5lQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpO1xuICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKDEsIGxpbmVDb2xvciwgMSk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnN0YXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gMCwgayA9IHN0YXIubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHBzYyAqIHRoaXMuc3RhcnNbaV1bMF0gKyBnc2MgKiBzdGFyW2pdWzBdO1xuICAgICAgICAgICAgdmFyIHkgPSBwc2MgKiB0aGlzLnN0YXJzW2ldWzFdICsgZ3NjICogc3RhcltqXVsxXTtcbiAgICAgICAgICAgIGlmIChqID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8oeCwgeSk7XG4gICAgICAgICAgICAgICAgdmFyIHgwID0geDtcbiAgICAgICAgICAgICAgICB2YXIgeTAgPSB5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyh4LCB5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyh4MCwgeTApO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhclRhcmdldDsiLCIvKipcbiAqIFN5bmNCb2R5SW50ZXJmYWNlLmpzXG4gKlxuICogU2hhcmVkIG1ldGhvZHMgZm9yIFZlY3RvclNwcml0ZXMsIFBhcnRpY2xlcywgZXRjLlxuICovXG5cbnZhciBTeW5jQm9keUludGVyZmFjZSA9IGZ1bmN0aW9uICgpIHt9O1xuXG4vKipcbiAqIFNldCBsb2NhdGlvbiBhbmQgYW5nbGUgb2YgYSBwaHlzaWNzIG9iamVjdC4gVmFsdWUgYXJlIGdpdmVuIGluIHdvcmxkIGNvb3JkaW5hdGVzLCBub3QgcGl4ZWxzXG4gKlxuICogQHBhcmFtIHgge251bWJlcn1cbiAqIEBwYXJhbSB5IHtudW1iZXJ9XG4gKiBAcGFyYW0gYSB7bnVtYmVyfVxuICovXG5TeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUuc2V0UG9zQW5nbGUgPSBmdW5jdGlvbiAoeCwgeSwgYSkge1xuICAgIHRoaXMuYm9keS5kYXRhLnBvc2l0aW9uWzBdID0gLSh4IHx8IDApO1xuICAgIHRoaXMuYm9keS5kYXRhLnBvc2l0aW9uWzFdID0gLSh5IHx8IDApO1xuICAgIHRoaXMuYm9keS5kYXRhLmFuZ2xlID0gYSB8fCAwO1xufTtcblxuU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlLmNvbmZpZyA9IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnVwZGF0ZVByb3BlcnRpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBrID0gdGhpcy51cGRhdGVQcm9wZXJ0aWVzW2ldO1xuICAgICAgICBpZiAodHlwZW9mIHByb3BlcnRpZXNba10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzW2tdID0gcHJvcGVydGllc1trXTsgICAgICAgIC8vIEZJWE1FPyBWaXJ0dWFsaXplIHNvbWVob3dcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3luY0JvZHlJbnRlcmZhY2U7IiwiLyoqXG4gKiBUaHJ1c3RHZW5lcmF0b3IuanNcbiAqXG4gKiBHcm91cCBwcm92aWRpbmcgQVBJLCBsYXllcmluZywgYW5kIHBvb2xpbmcgZm9yIHRocnVzdCBwYXJ0aWNsZSBlZmZlY3RzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gcmVxdWlyZSgnLi9TaW1wbGVQYXJ0aWNsZS5qcycpO1xuXG52YXIgX3RleHR1cmVLZXkgPSAndGhydXN0JztcblxuLy8gUG9vbGluZyBwYXJhbWV0ZXJzXG52YXIgX21pblBvb2xTaXplID0gMzAwO1xudmFyIF9taW5GcmVlUGFydGljbGVzID0gMjA7XG52YXIgX3NvZnRQb29sTGltaXQgPSAyMDA7XG52YXIgX2hhcmRQb29sTGltaXQgPSA1MDA7XG5cbi8vIEJlaGF2aW9yIG9mIGVtaXR0ZXJcbnZhciBfcGFydGljbGVzUGVyQnVyc3QgPSA1O1xudmFyIF9wYXJ0aWNsZVRUTCA9IDE1MDtcbnZhciBfcGFydGljbGVCYXNlU3BlZWQgPSA1O1xudmFyIF9jb25lTGVuZ3RoID0gMTtcbnZhciBfY29uZVdpZHRoUmF0aW8gPSAwLjI7XG52YXIgX2VuZ2luZU9mZnNldCA9IC0yMDtcblxudmFyIFRocnVzdEdlbmVyYXRvciA9IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgUGhhc2VyLkdyb3VwLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICB0aGlzLnRocnVzdGluZ1NoaXBzID0ge307XG5cbiAgICAvLyBQcmVnZW5lcmF0ZSBhIGJhdGNoIG9mIHBhcnRpY2xlc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX21pblBvb2xTaXplOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnRpY2xlID0gdGhpcy5hZGQobmV3IFNpbXBsZVBhcnRpY2xlKGdhbWUsIF90ZXh0dXJlS2V5KSk7XG4gICAgICAgIHBhcnRpY2xlLmFscGhhID0gMC41O1xuICAgICAgICBwYXJ0aWNsZS5yb3RhdGlvbiA9IE1hdGguUEkvNDtcbiAgICAgICAgcGFydGljbGUua2lsbCgpO1xuICAgIH1cbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5Hcm91cC5wcm90b3R5cGUpO1xuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRocnVzdEdlbmVyYXRvcjtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS5zdGFydE9uID0gZnVuY3Rpb24gKHNoaXApIHtcbiAgICB0aGlzLnRocnVzdGluZ1NoaXBzW3NoaXAuaWRdID0gc2hpcDtcbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUuc3RvcE9uID0gZnVuY3Rpb24gKHNoaXApIHtcbiAgICBkZWxldGUgdGhpcy50aHJ1c3RpbmdTaGlwc1tzaGlwLmlkXTtcbn07XG5cblRocnVzdEdlbmVyYXRvci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy50aHJ1c3RpbmdTaGlwcyk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBrZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgc2hpcCA9IHRoaXMudGhydXN0aW5nU2hpcHNba2V5c1tpXV07XG4gICAgICAgIHZhciB3ID0gc2hpcC53aWR0aDtcbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKHNoaXAucm90YXRpb24pO1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3Moc2hpcC5yb3RhdGlvbik7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX3BhcnRpY2xlc1BlckJ1cnN0OyBqKyspIHtcbiAgICAgICAgICAgIHZhciBwYXJ0aWNsZSA9IHRoaXMuZ2V0Rmlyc3REZWFkKCk7XG4gICAgICAgICAgICBpZiAoIXBhcnRpY2xlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vdCBlbm91Z2ggdGhydXN0IHBhcnRpY2xlcyBpbiBwb29sJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZCA9IHRoaXMuZ2FtZS5ybmQucmVhbEluUmFuZ2UoLV9jb25lV2lkdGhSYXRpbyp3LCBfY29uZVdpZHRoUmF0aW8qdyk7XG4gICAgICAgICAgICB2YXIgeCA9IHNoaXAueCArIGQqY29zICsgX2VuZ2luZU9mZnNldCpzaW47XG4gICAgICAgICAgICB2YXIgeSA9IHNoaXAueSArIGQqc2luIC0gX2VuZ2luZU9mZnNldCpjb3M7XG4gICAgICAgICAgICBwYXJ0aWNsZS5saWZlc3BhbiA9IF9wYXJ0aWNsZVRUTDtcbiAgICAgICAgICAgIHBhcnRpY2xlLnJlc2V0KHgsIHkpO1xuICAgICAgICAgICAgcGFydGljbGUuYm9keS52ZWxvY2l0eS54ID0gX3BhcnRpY2xlQmFzZVNwZWVkKihfY29uZUxlbmd0aCpzaW4gLSBkKmNvcyk7XG4gICAgICAgICAgICBwYXJ0aWNsZS5ib2R5LnZlbG9jaXR5LnkgPSBfcGFydGljbGVCYXNlU3BlZWQqKC1fY29uZUxlbmd0aCpjb3MgLSBkKnNpbik7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5UaHJ1c3RHZW5lcmF0b3IudGV4dHVyZUtleSA9IF90ZXh0dXJlS2V5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRocnVzdEdlbmVyYXRvcjsiLCIvKipcbiAqIFRvYXN0LmpzXG4gKlxuICogQ2xhc3MgZm9yIHZhcmlvdXMga2luZHMgb2YgcG9wIHVwIG1lc3NhZ2VzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFRvYXN0ID0gZnVuY3Rpb24gKGdhbWUsIHgsIHksIHRleHQsIGNvbmZpZykge1xuICAgIC8vIFRPRE86IGJldHRlciBkZWZhdWx0cywgbWF5YmVcbiAgICBQaGFzZXIuVGV4dC5jYWxsKHRoaXMsIGdhbWUsIHgsIHksIHRleHQsIHtcbiAgICAgICAgZm9udDogJzE0cHQgQXJpYWwnLFxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXG4gICAgICAgIGZpbGw6ICcjZmZhNTAwJ1xuICAgIH0pO1xuICAgIHRoaXMuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcbiAgICAvLyBTZXQgdXAgc3R5bGVzIGFuZCB0d2VlbnNcbiAgICB2YXIgc3BlYyA9IHt9O1xuICAgIGlmIChjb25maWcudXApIHtcbiAgICAgICAgc3BlYy55ID0gJy0nICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmRvd24pIHtcbiAgICAgICAgc3BlYy55ID0gJysnICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmxlZnQpIHtcbiAgICAgICAgc3BlYy54ID0gJy0nICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLnJpZ2h0KSB7XG4gICAgICAgIHNwZWMueCA9ICcrJyArIGNvbmZpZy51cDtcbiAgICB9XG4gICAgc3dpdGNoIChjb25maWcudHlwZSkge1xuICAgICAgICBjYXNlICdzcGlubmVyJzpcbiAgICAgICAgICAgIHRoaXMuZm9udFNpemUgPSAnMjBwdCc7XG4gICAgICAgICAgICBzcGVjLnJvdGF0aW9uID0gY29uZmlnLnJldm9sdXRpb25zID8gY29uZmlnLnJldm9sdXRpb25zICogMiAqIE1hdGguUEkgOiAyICogTWF0aC5QSTtcbiAgICAgICAgICAgIHZhciB0d2VlbiA9IGdhbWUuYWRkLnR3ZWVuKHRoaXMpLnRvKHNwZWMsIGNvbmZpZy5kdXJhdGlvbiwgY29uZmlnLmVhc2luZywgdHJ1ZSk7XG4gICAgICAgICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZChmdW5jdGlvbiAodG9hc3QpIHtcbiAgICAgICAgICAgICAgICB0b2FzdC5raWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gVE9ETzogTW9yZSBraW5kc1xuICAgIH1cbn07XG5cbi8qKlxuICogQ3JlYXRlIG5ldyBUb2FzdCBhbmQgYWRkIHRvIGdhbWVcbiAqXG4gKiBAcGFyYW0gZ2FtZVxuICogQHBhcmFtIHhcbiAqIEBwYXJhbSB5XG4gKiBAcGFyYW0gdGV4dFxuICogQHBhcmFtIGNvbmZpZ1xuICovXG5Ub2FzdC5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSwgdGV4dCwgY29uZmlnKSB7XG4gICAgdmFyIHRvYXN0ID0gbmV3IFRvYXN0KGdhbWUsIHgsIHksIHRleHQsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodG9hc3QpO1xufTtcblxuLy8gQ292ZW5pZW5jZSBtZXRob2RzIGZvciBjb21tb24gY2FzZXNcblxuVG9hc3Quc3BpblVwID0gZnVuY3Rpb24gKGdhbWUsIHgsIHksIHRleHQpIHtcbiAgICB2YXIgdG9hc3QgPSBuZXcgVG9hc3QgKGdhbWUsIHgsIHksIHRleHQsIHtcbiAgICAgICAgdHlwZTogJ3NwaW5uZXInLFxuICAgICAgICByZXZvbHV0aW9uczogMSxcbiAgICAgICAgZHVyYXRpb246IDUwMCxcbiAgICAgICAgZWFzaW5nOiBQaGFzZXIuRWFzaW5nLkVsYXN0aWMuT3V0LFxuICAgICAgICB1cDogMTAwXG4gICAgfSk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodG9hc3QpO1xufTtcblxuVG9hc3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuVGV4dC5wcm90b3R5cGUpO1xuVG9hc3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVG9hc3Q7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9hc3Q7XG4iLCIvKipcbiAqIFRyYWN0b3JCZWFtLmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb24gb2YgYSBzaW5nbGUgdHJhY3RvciBiZWFtIHNlZ21lbnRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL0ZJWE1FOiBOaWNlciBpbXBsZW1lbnRhdGlvblxuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5UcmFjdG9yQmVhbTtcblxudmFyIFRyYWN0b3JCZWFtID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhbGwodGhpcywgZ2FtZSwgJ3RyYWN0b3InKTtcbiAgICB0aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuVHJhY3RvckJlYW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTaW1wbGVQYXJ0aWNsZS5wcm90b3R5cGUpO1xuVHJhY3RvckJlYW0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVHJhY3RvckJlYW07XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShUcmFjdG9yQmVhbS5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoVHJhY3RvckJlYW0ucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhY3RvckJlYW07IiwiLyoqXG4gKiBUcmVlLmpzXG4gKlxuICogQ2xpZW50IHNpZGVcbiAqL1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlRyZWU7XG5cbnZhciBUcmVlID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAxKTtcbn07XG5cblRyZWUuYWRkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIHZhciB0cmVlID0gbmV3IFRyZWUgKGdhbWUsIGNvbmZpZyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcodHJlZSk7XG4gICAgcmV0dXJuIHRyZWU7XG59O1xuXG5UcmVlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5UcmVlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRyZWU7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShUcmVlLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShUcmVlLnByb3RvdHlwZSwgVXBkYXRlUHJvcGVydGllcy5wcm90b3R5cGUpO1xuXG4vKipcbiAqIERyYXcgdHJlZSwgb3ZlcnJpZGluZyBzdGFuZGFyZCBzaGFwZSBhbmQgZ2VvbWV0cnkgbWV0aG9kIHRvIHVzZSBncmFwaFxuICpcbiAqIEBwYXJhbSByZW5kZXJTY2FsZVxuICovXG5UcmVlLnByb3RvdHlwZS5kcmF3UHJvY2VkdXJlID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlKSB7XG4gICAgdmFyIGxpbmVDb2xvciA9IFBoYXNlci5Db2xvci5oZXhUb1JHQih0aGlzLmxpbmVDb2xvcik7XG4gICAgdGhpcy5ncmFwaGljcy5saW5lU3R5bGUoMSwgbGluZUNvbG9yLCAxKTtcbiAgICB0aGlzLl9kcmF3QnJhbmNoKHRoaXMuZ3JhcGgsIHRoaXMuZ2FtZS5waHlzaWNzLnAyLm1weGkodGhpcy52ZWN0b3JTY2FsZSkqcmVuZGVyU2NhbGUsIHRoaXMuZGVwdGgpO1xufTtcblxuVHJlZS5wcm90b3R5cGUuX2RyYXdCcmFuY2ggPSBmdW5jdGlvbiAoZ3JhcGgsIHNjLCBkZXB0aCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gZ3JhcGguYy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkID0gZ3JhcGguY1tpXTtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8oZ3JhcGgueCAqIHNjLCBncmFwaC55ICogc2MpO1xuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVUbyhjaGlsZC54ICogc2MsIGNoaWxkLnkgKiBzYyk7XG4gICAgICAgIGlmIChkZXB0aCA+IHRoaXMuc3RlcCkge1xuICAgICAgICAgICAgdGhpcy5fZHJhd0JyYW5jaChjaGlsZCwgc2MsIGRlcHRoIC0gMSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVHJlZS5wcm90b3R5cGUsICdzdGVwJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RlcDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9zdGVwID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHJlZTsiLCIvKipcbiAqIFNwcml0ZSB3aXRoIGF0dGFjaGVkIEdyYXBoaWNzIG9iamVjdCBmb3IgdmVjdG9yLWxpa2UgZ3JhcGhpY3NcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vL3ZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi8uLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgVmVjdG9yLWJhc2VkIHNwcml0ZXNcbiAqXG4gKiBAcGFyYW0gZ2FtZSB7UGhhc2VyLkdhbWV9IC0gUGhhc2VyIGdhbWUgb2JqZWN0XG4gKiBAcGFyYW0gY29uZmlnIHtvYmplY3R9IC0gUE9KTyB3aXRoIGNvbmZpZyBkZXRhaWxzXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIFZlY3RvclNwcml0ZSA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBQaGFzZXIuU3ByaXRlLmNhbGwodGhpcywgZ2FtZSk7XG5cbiAgICB0aGlzLmdyYXBoaWNzID0gZ2FtZS5tYWtlLmdyYXBoaWNzKCk7XG4gICAgdGhpcy50ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgdGhpcy5taW5pdGV4dHVyZSA9IHRoaXMuZ2FtZS5hZGQucmVuZGVyVGV4dHVyZSgpO1xuICAgIHRoaXMubWluaXNwcml0ZSA9IHRoaXMuZ2FtZS5taW5pbWFwLmNyZWF0ZSgpO1xuICAgIHRoaXMubWluaXNwcml0ZS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuXG4gICAgZ2FtZS5waHlzaWNzLnAyLmVuYWJsZSh0aGlzLCBmYWxzZSwgZmFsc2UpO1xuICAgIHRoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG4gICAgdGhpcy5jb25maWcoY29uZmlnLnByb3BlcnRpZXMpO1xuICAgIHRoaXMudXBkYXRlQXBwZWFyYW5jZSgpO1xuICAgIHRoaXMudXBkYXRlQm9keSgpO1xuICAgIHRoaXMuYm9keS5tYXNzID0gMDtcbn07XG5cbi8qKlxuICogQ3JlYXRlIFZlY3RvclNwcml0ZSBhbmQgYWRkIHRvIGdhbWUgd29ybGRcbiAqXG4gKiBAcGFyYW0gZ2FtZSB7UGhhc2VyLkdhbWV9XG4gKiBAcGFyYW0geCB7bnVtYmVyfSAtIHggY29vcmRcbiAqIEBwYXJhbSB5IHtudW1iZXJ9IC0geSBjb29yZFxuICogQHJldHVybnMge1ZlY3RvclNwcml0ZX1cbiAqL1xuVmVjdG9yU3ByaXRlLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCB4LCB5KSB7XG4gICAgdmFyIHYgPSBuZXcgVmVjdG9yU3ByaXRlKGdhbWUsIHgsIHkpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHYpO1xuICAgIHJldHVybiB2O1xufVxuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3ByaXRlLnByb3RvdHlwZSk7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVmVjdG9yU3ByaXRlO1xuXG4vLyBEZWZhdWx0IG9jdGFnb25cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX3NoYXBlID0gW1xuICAgIFsyLDFdLFxuICAgIFsxLDJdLFxuICAgIFstMSwyXSxcbiAgICBbLTIsMV0sXG4gICAgWy0yLC0xXSxcbiAgICBbLTEsLTJdLFxuICAgIFsxLC0yXSxcbiAgICBbMiwtMV1cbl07XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnI2ZmZmZmZic7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fZmlsbENvbG9yID0gbnVsbDtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMjU7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl92ZWN0b3JTY2FsZSA9IDE7XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUucGh5c2ljc0JvZHlUeXBlID0gJ2NpcmNsZSc7XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0U2hhcGUgPSBmdW5jdGlvbiAoc2hhcGUpIHtcbiAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gICAgdGhpcy51cGRhdGVBcHBlYXJhbmNlKCk7XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnNldExpbmVTdHlsZSA9IGZ1bmN0aW9uIChjb2xvciwgbGluZVdpZHRoKSB7XG4gICAgaWYgKCFsaW5lV2lkdGggfHwgbGluZVdpZHRoIDwgMSkge1xuICAgICAgICBsaW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aCB8fCAxO1xuICAgIH1cbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgdGhpcy5saW5lV2lkdGggPSBsaW5lV2lkdGg7XG4gICAgdGhpcy51cGRhdGVBcHBlYXJhbmNlKCk7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSBjYWNoZWQgYml0bWFwcyBmb3Igb2JqZWN0IGFmdGVyIHZlY3RvciBwcm9wZXJ0aWVzIGNoYW5nZVxuICovXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZUFwcGVhcmFuY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gRHJhdyBmdWxsIHNpemVkXG4gICAgdGhpcy5ncmFwaGljcy5jbGVhcigpO1xuICAgIHRoaXMuZ3JhcGhpY3MuX2N1cnJlbnRCb3VuZHMgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgdGhpcy5kcmF3UHJvY2VkdXJlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLmRyYXdQcm9jZWR1cmUoMSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNoYXBlKSB7XG4gICAgICAgIHRoaXMuZHJhdygxKTtcbiAgICB9XG4gICAgdmFyIGJvdW5kcyA9IHRoaXMuZ3JhcGhpY3MuZ2V0TG9jYWxCb3VuZHMoKTtcbiAgICB0aGlzLnRleHR1cmUucmVzaXplKGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgdHJ1ZSk7XG4gICAgdGhpcy50ZXh0dXJlLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIC1ib3VuZHMueCwgLWJvdW5kcy55LCB0cnVlKTtcbiAgICB0aGlzLnNldFRleHR1cmUodGhpcy50ZXh0dXJlKTtcbiAgICAvLyBEcmF3IHNtYWxsIGZvciBtaW5pbWFwXG4gICAgdmFyIG1hcFNjYWxlID0gdGhpcy5nYW1lLm1pbmltYXAubWFwU2NhbGU7XG4gICAgdGhpcy5ncmFwaGljcy5jbGVhcigpO1xuICAgIHRoaXMuZ3JhcGhpY3MuX2N1cnJlbnRCb3VuZHMgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgdGhpcy5kcmF3UHJvY2VkdXJlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLmRyYXdQcm9jZWR1cmUobWFwU2NhbGUpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zaGFwZSkge1xuICAgICAgICB0aGlzLmRyYXcobWFwU2NhbGUpO1xuICAgIH1cbiAgICBib3VuZHMgPSB0aGlzLmdyYXBoaWNzLmdldExvY2FsQm91bmRzKCk7XG4gICAgdGhpcy5taW5pdGV4dHVyZS5yZXNpemUoYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0LCB0cnVlKTtcbiAgICB0aGlzLm1pbml0ZXh0dXJlLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIC1ib3VuZHMueCwgLWJvdW5kcy55LCB0cnVlKTtcbiAgICB0aGlzLm1pbmlzcHJpdGUuc2V0VGV4dHVyZSh0aGlzLm1pbml0ZXh0dXJlKTtcbiAgICB0aGlzLl9kaXJ0eSA9IGZhbHNlO1xufTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGVCb2R5ID0gZnVuY3Rpb24gKCkge1xuICAgIHN3aXRjaCAodGhpcy5waHlzaWNzQm9keVR5cGUpIHtcbiAgICAgICAgY2FzZSBcImNpcmNsZVwiOlxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNpcmNsZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgciA9IHRoaXMuZ3JhcGhpY3MuZ2V0Qm91bmRzKCk7XG4gICAgICAgICAgICAgICAgdmFyIHJhZGl1cyA9IE1hdGgucm91bmQoTWF0aC5zcXJ0KHIud2lkdGgqIHIuaGVpZ2h0KS8yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmFkaXVzID0gdGhpcy5yYWRpdXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJvZHkuc2V0Q2lyY2xlKHJhZGl1cyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gVE9ETzogTW9yZSBzaGFwZXNcbiAgICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB2ZWN0b3IgdG8gYml0bWFwIG9mIGdyYXBoaWNzIG9iamVjdCBhdCBnaXZlbiBzY2FsZVxuICpcbiAqIEBwYXJhbSByZW5kZXJTY2FsZSB7bnVtYmVyfSAtIHNjYWxlIGZhY3RvciBmb3IgcmVuZGVyXG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChyZW5kZXJTY2FsZSkge1xuICAgIHJlbmRlclNjYWxlID0gcmVuZGVyU2NhbGUgfHwgMTtcbiAgICAvLyBEcmF3IHNpbXBsZSBzaGFwZSwgaWYgZ2l2ZW5cbiAgICBpZiAodGhpcy5zaGFwZSkge1xuICAgICAgICB2YXIgbGluZUNvbG9yID0gUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMubGluZUNvbG9yKTtcbiAgICAgICAgaWYgKHJlbmRlclNjYWxlID09PSAxKSB7XG4gICAgICAgICAgICB2YXIgbGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaW5lV2lkdGggPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICgocmVuZGVyU2NhbGUgPT09IDEpICYmIHRoaXMuZmlsbENvbG9yKSB7ICAgICAgICAvLyBPbmx5IGZpbGwgZnVsbCBzaXplZFxuICAgICAgICAgICAgdmFyIGZpbGxDb2xvciA9IFBoYXNlci5Db2xvci5oZXhUb1JHQih0aGlzLmZpbGxDb2xvcik7XG4gICAgICAgICAgICB2YXIgZmlsbEFscGhhID0gdGhpcy5maWxsQWxwaGEgfHwgMTtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuYmVnaW5GaWxsKGZpbGxDb2xvciwgZmlsbEFscGhhKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVTdHlsZShsaW5lV2lkdGgsIGxpbmVDb2xvciwgMSk7XG4gICAgICAgIHRoaXMuX2RyYXdQb2x5Z29uKHRoaXMuc2hhcGUsIHRoaXMuc2hhcGVDbG9zZWQsIHJlbmRlclNjYWxlKTtcbiAgICAgICAgaWYgKChyZW5kZXJTY2FsZSA9PT0gMSkgJiYgdGhpcy5maWxsQ29sb3IpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuZW5kRmlsbCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIERyYXcgZ2VvbWV0cnkgc3BlYywgaWYgZ2l2ZW4sIGJ1dCBvbmx5IGZvciB0aGUgZnVsbCBzaXplZCBzcHJpdGVcbiAgICBpZiAoKHJlbmRlclNjYWxlID09PSAxKSAmJiB0aGlzLmdlb21ldHJ5KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5nZW9tZXRyeS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBnID0gdGhpcy5nZW9tZXRyeVtpXTtcbiAgICAgICAgICAgIHN3aXRjaCAoZy50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcInBvbHlcIjpcbiAgICAgICAgICAgICAgICAgICAgLy8gRklYTUU6IGRlZmF1bHRzIGFuZCBzdHVmZlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmF3UG9seWdvbihnLnBvaW50cywgZy5jbG9zZWQsIHJlbmRlclNjYWxlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIERyYXcgb3BlbiBvciBjbG9zZWQgcG9seWdvbiBhcyBzZXF1ZW5jZSBvZiBsaW5lVG8gY2FsbHNcbiAqXG4gKiBAcGFyYW0gcG9pbnRzIHtBcnJheX0gLSBwb2ludHMgYXMgYXJyYXkgb2YgW3gseV0gcGFpcnNcbiAqIEBwYXJhbSBjbG9zZWQge2Jvb2xlYW59IC0gaXMgcG9seWdvbiBjbG9zZWQ/XG4gKiBAcGFyYW0gcmVuZGVyU2NhbGUge251bWJlcn0gLSBzY2FsZSBmYWN0b3IgZm9yIHJlbmRlclxuICogQHByaXZhdGVcbiAqL1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fZHJhd1BvbHlnb24gPSBmdW5jdGlvbiAocG9pbnRzLCBjbG9zZWQsIHJlbmRlclNjYWxlKSB7XG4gICAgdmFyIHNjID0gdGhpcy5nYW1lLnBoeXNpY3MucDIubXB4aSh0aGlzLnZlY3RvclNjYWxlKSpyZW5kZXJTY2FsZTtcbiAgICBwb2ludHMgPSBwb2ludHMuc2xpY2UoKTtcbiAgICBpZiAoY2xvc2VkKSB7XG4gICAgICAgIHBvaW50cy5wdXNoKHBvaW50c1swXSk7XG4gICAgfVxuICAgIHRoaXMuZ3JhcGhpY3MubW92ZVRvKHBvaW50c1swXVswXSAqIHNjLCBwb2ludHNbMF1bMV0gKiBzYyk7XG4gICAgZm9yICh2YXIgaSA9IDEsIGwgPSBwb2ludHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubGluZVRvKHBvaW50c1tpXVswXSAqIHNjLCBwb2ludHNbaV1bMV0gKiBzYyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBJbnZhbGlkYXRlIGNhY2hlIGFuZCByZWRyYXcgaWYgc3ByaXRlIGlzIG1hcmtlZCBkaXJ0eVxuICovXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fZGlydHkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2RpcnR5IFZTJyk7XG4gICAgICAgIHRoaXMudXBkYXRlQXBwZWFyYW5jZSgpO1xuICAgIH1cbn07XG5cbi8vIFZlY3RvciBwcm9wZXJ0aWVzIGRlZmluZWQgdG8gaGFuZGxlIG1hcmtpbmcgc3ByaXRlIGRpcnR5IHdoZW4gbmVjZXNzYXJ5XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnbGluZUNvbG9yJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGluZUNvbG9yO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2xpbmVDb2xvciA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2ZpbGxDb2xvcicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGxDb2xvcjtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9maWxsQ29sb3IgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdsaW5lV2lkdGgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9saW5lV2lkdGg7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fbGluZVdpZHRoID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZmlsbEFscGhhJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlsbEFscGhhO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2ZpbGxBbHBoYSA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3NoYXBlQ2xvc2VkJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2hhcGVDbG9zZWQ7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fc2hhcGVDbG9zZWQgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICd2ZWN0b3JTY2FsZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZlY3RvclNjYWxlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX3ZlY3RvclNjYWxlID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnc2hhcGUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFwZTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9zaGFwZSA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2dlb21ldHJ5Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2VvbWV0cnk7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fZ2VvbWV0cnkgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdkZWFkJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVhZDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9kZWFkID0gdmFsO1xuICAgICAgICBpZiAodmFsKSB7XG4gICAgICAgICAgICB0aGlzLmtpbGwoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmV2aXZlKCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZlY3RvclNwcml0ZTtcbi8vU3RhcmNvZGVyLlZlY3RvclNwcml0ZSA9IFZlY3RvclNwcml0ZTsiLCIvKipcbiAqIENvbnRyb2xzLmpzXG4gKlxuICogVmlydHVhbGl6ZSBhbmQgaW1wbGVtZW50IHF1ZXVlIGZvciBnYW1lIGNvbnRyb2xzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxudmFyIENvbnRyb2xzID0gZnVuY3Rpb24gKGdhbWUsIHBhcmVudCkge1xuICAgIFBoYXNlci5QbHVnaW4uY2FsbCh0aGlzLCBnYW1lLCBwYXJlbnQpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuUGx1Z2luLnByb3RvdHlwZSk7XG5Db250cm9scy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb250cm9scztcblxuQ29udHJvbHMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAocXVldWUpIHtcbiAgICB0aGlzLnF1ZXVlID0gcXVldWU7XG4gICAgdGhpcy5jb250cm9scyA9IHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG4gICAgdGhpcy5jb250cm9scy5maXJlID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuQik7XG4gICAgdGhpcy5jb250cm9scy50cmFjdG9yID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVCk7XG4gICAgdGhpcy5qb3lzdGlja1N0YXRlID0ge1xuICAgICAgICB1cDogZmFsc2UsXG4gICAgICAgIGRvd246IGZhbHNlLFxuICAgICAgICBsZWZ0OiBmYWxzZSxcbiAgICAgICAgcmlnaHQ6IGZhbHNlLFxuICAgICAgICBmaXJlOiBmYWxzZVxuICAgIH07XG5cbiAgICAvLyBBZGQgdmlydHVhbCBqb3lzdGljayBpZiBwbHVnaW4gaXMgYXZhaWxhYmxlXG4gICAgaWYgKFBoYXNlci5WaXJ0dWFsSm95c3RpY2spIHtcbiAgICAgICAgdGhpcy5qb3lzdGljayA9IHRoaXMuZ2FtZS5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKFBoYXNlci5WaXJ0dWFsSm95c3RpY2spO1xuICAgIH1cbn07XG5cbnZhciBzZXEgPSAwO1xudmFyIHVwID0gZmFsc2UsIGRvd24gPSBmYWxzZSwgbGVmdCA9IGZhbHNlLCByaWdodCA9IGZhbHNlLCBmaXJlID0gZmFsc2UsIHRyYWN0b3IgPSBmYWxzZTtcblxuQ29udHJvbHMucHJvdG90eXBlLmFkZFZpcnR1YWxDb250cm9scyA9IGZ1bmN0aW9uICh0ZXh0dXJlKSB7XG4gICAgdGV4dHVyZSA9IHRleHR1cmUgfHwgJ2pveXN0aWNrJztcbiAgICB2YXIgc2NhbGUgPSAxOyAgICAgICAgICAgIC8vIEZJWE1FXG4gICAgdGhpcy5zdGljayA9IHRoaXMuam95c3RpY2suYWRkU3RpY2soMCwgMCwgMTAwLHRleHR1cmUpO1xuICAgIC8vdGhpcy5zdGljay5tb3Rpb25Mb2NrID0gUGhhc2VyLlZpcnR1YWxKb3lzdGljay5IT1JJWk9OVEFMO1xuICAgIHRoaXMuc3RpY2suc2NhbGUgPSBzY2FsZTtcbiAgICAvL3RoaXMuZ29idXR0b24gPSB0aGlzLmpveXN0aWNrLmFkZEJ1dHRvbih4ICsgMjAwKnNjYWxlLCB5LCB0ZXh0dXJlLCAnYnV0dG9uMS11cCcsICdidXR0b24xLWRvd24nKTtcbiAgICB0aGlzLmZpcmVidXR0b24gPSB0aGlzLmpveXN0aWNrLmFkZEJ1dHRvbigwLCAwLCB0ZXh0dXJlLCAnYnV0dG9uMS11cCcsICdidXR0b24xLWRvd24nKTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24gPSB0aGlzLmpveXN0aWNrLmFkZEJ1dHRvbigwLCAwLCB0ZXh0dXJlLCAnYnV0dG9uMi11cCcsICdidXR0b24yLWRvd24nKTtcbiAgICB0aGlzLmZpcmVidXR0b24uc2NhbGUgPSBzY2FsZTtcbiAgICAvL3RoaXMuZ29idXR0b24uc2NhbGUgPSBzY2FsZTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24uc2NhbGUgPSBzY2FsZTtcbiAgICB0aGlzLmxheW91dFZpcnR1YWxDb250cm9scyhzY2FsZSk7XG4gICAgdGhpcy5zdGljay5vbk1vdmUuYWRkKGZ1bmN0aW9uIChzdGljaywgZiwgZlgsIGZZKSB7XG4gICAgICAgIGlmIChmWCA+PSAwLjUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5yaWdodCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUubGVmdCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGZYIDw9IC0wLjUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5yaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmxlZnQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUubGVmdCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmWSA+PSAwLjUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGZZIDw9IC0wLjUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudXAgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmRvd24gPSBmYWxzZTs7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudXAgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMuc3RpY2sub25VcC5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUucmlnaHQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gZmFsc2U7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5sZWZ0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gZmFsc2U7XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5maXJlYnV0dG9uLm9uRG93bi5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUuZmlyZSA9IHRydWU7XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5maXJlYnV0dG9uLm9uVXAuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmZpcmUgPSBmYWxzZTtcbiAgICB9LCB0aGlzKTtcbiAgICAvL3RoaXMuZ29idXR0b24ub25Eb3duLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gdHJ1ZTtcbiAgICAvL30sIHRoaXMpO1xuICAgIC8vdGhpcy5nb2J1dHRvbi5vblVwLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgdGhpcy5qb3lzdGlja1N0YXRlLnVwID0gZmFsc2U7XG4gICAgLy99LCB0aGlzKTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24ub25Eb3duLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS50cmFjdG9yID0gdHJ1ZTtcbiAgICB9LCB0aGlzKTtcbiAgICB0aGlzLnRyYWN0b3JidXR0b24ub25VcC5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudHJhY3RvciA9IGZhbHNlO1xuICAgIH0sIHRoaXMpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLmxheW91dFZpcnR1YWxDb250cm9scyA9IGZ1bmN0aW9uIChzY2FsZSkge1xuICAgIHZhciB5ID0gdGhpcy5nYW1lLmhlaWdodCAtIDEyNSAqIHNjYWxlO1xuICAgIHZhciB3ID0gdGhpcy5nYW1lLndpZHRoO1xuICAgIHRoaXMuc3RpY2sucG9zWCA9IDE1MCAqIHNjYWxlO1xuICAgIHRoaXMuc3RpY2sucG9zWSA9IHk7XG4gICAgdGhpcy5maXJlYnV0dG9uLnBvc1ggPSB3IC0gMjUwICogc2NhbGU7XG4gICAgdGhpcy5maXJlYnV0dG9uLnBvc1kgPSB5O1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5wb3NYID0gdyAtIDEyNSAqIHNjYWxlO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5wb3NZID0geTtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB1cCA9IGRvd24gPSBsZWZ0ID0gcmlnaHQgPSBmYWxzZTtcbiAgICB0aGlzLnF1ZXVlLmxlbmd0aCA9IDA7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUucHJlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFRPRE86IFN1cHBvcnQgb3RoZXIgaW50ZXJhY3Rpb25zL21ldGhvZHNcbiAgICB2YXIgY29udHJvbHMgPSB0aGlzLmNvbnRyb2xzO1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuam95c3RpY2tTdGF0ZTtcbiAgICBpZiAoKHN0YXRlLnVwIHx8IGNvbnRyb2xzLnVwLmlzRG93bikgJiYgIXVwKSB7XG4gICAgICAgIHVwID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndXBfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLnVwICYmICFjb250cm9scy51cC5pc0Rvd24gJiYgdXApIHtcbiAgICAgICAgdXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndXBfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKChzdGF0ZS5kb3duIHx8IGNvbnRyb2xzLmRvd24uaXNEb3duKSAmJiAhZG93bikge1xuICAgICAgICBkb3duID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZG93bl9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghc3RhdGUuZG93biAmJiAhY29udHJvbHMuZG93bi5pc0Rvd24gJiYgZG93bikge1xuICAgICAgICBkb3duID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2Rvd25fcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKChzdGF0ZS5yaWdodCB8fCBjb250cm9scy5yaWdodC5pc0Rvd24pICYmICFyaWdodCkge1xuICAgICAgICByaWdodCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3JpZ2h0X3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS5yaWdodCAmJiAhY29udHJvbHMucmlnaHQuaXNEb3duICYmIHJpZ2h0KSB7XG4gICAgICAgIHJpZ2h0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3JpZ2h0X3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUubGVmdCB8fCBjb250cm9scy5sZWZ0LmlzRG93bikgJiYgIWxlZnQpIHtcbiAgICAgICAgbGVmdCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2xlZnRfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLmxlZnQgJiYgIWNvbnRyb2xzLmxlZnQuaXNEb3duICYmIGxlZnQpIHtcbiAgICAgICAgbGVmdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdsZWZ0X3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUuZmlyZSB8fCBjb250cm9scy5maXJlLmlzRG93bikgJiYgIWZpcmUpIHtcbiAgICAgICAgZmlyZSA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2ZpcmVfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLmZpcmUgJiYgIWNvbnRyb2xzLmZpcmUuaXNEb3duICYmIGZpcmUpIHtcbiAgICAgICAgZmlyZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdmaXJlX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUudHJhY3RvciB8fCBjb250cm9scy50cmFjdG9yLmlzRG93bikgJiYgIXRyYWN0b3IpIHtcbiAgICAgICAgdHJhY3RvciA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3RyYWN0b3JfcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKCFzdGF0ZS50cmFjdG9yICYmICFjb250cm9scy50cmFjdG9yLmlzRG93bikgJiYgdHJhY3Rvcikge1xuICAgICAgICB0cmFjdG9yID0gZmFsc2U7Ly9cbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAndHJhY3Rvcl9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbn07XG5cbnZhciBhY3Rpb247ICAgICAgICAgICAgIC8vIE1vZHVsZSBzY29wZSB0byBhdm9pZCBhbGxvY2F0aW9uc1xuXG5Db250cm9scy5wcm90b3R5cGUucHJvY2Vzc1F1ZXVlID0gZnVuY3Rpb24gKGNiLCBjbGVhcikge1xuICAgIHZhciBxdWV1ZSA9IHRoaXMucXVldWU7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBxdWV1ZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgYWN0aW9uID0gcXVldWVbaV07XG4gICAgICAgIGlmIChhY3Rpb24uZXhlY3V0ZWQpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNiKGFjdGlvbik7XG4gICAgICAgIGFjdGlvbi5ldGltZSA9IHRoaXMuZ2FtZS50aW1lLm5vdztcbiAgICAgICAgYWN0aW9uLmV4ZWN1dGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGNsZWFyKSB7XG4gICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgfVxufTtcblxuU3RhcmNvZGVyLkNvbnRyb2xzID0gQ29udHJvbHM7XG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xzOyIsIi8qKlxuICogU3luY0NsaWVudC5qc1xuICpcbiAqIFN5bmMgcGh5c2ljcyBvYmplY3RzIHdpdGggc2VydmVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcbnZhciBVUERBVEVfUVVFVUVfTElNSVQgPSA4O1xuXG52YXIgU3luY0NsaWVudCA9IGZ1bmN0aW9uIChnYW1lLCBwYXJlbnQpIHtcbiAgICBQaGFzZXIuUGx1Z2luLmNhbGwodGhpcywgZ2FtZSwgcGFyZW50KTtcbn07XG5cblN5bmNDbGllbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuUGx1Z2luLnByb3RvdHlwZSk7XG5TeW5jQ2xpZW50LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN5bmNDbGllbnQ7XG5cblxuLyoqXG4gKiBJbml0aWFsaXplIHBsdWdpblxuICpcbiAqIEBwYXJhbSBzb2NrZXQge1NvY2tldH0gLSBzb2NrZXQuaW8gc29ja2V0IGZvciBzeW5jIGNvbm5lY3Rpb25cbiAqIEBwYXJhbSBxdWV1ZSB7QXJyYXl9IC0gY29tbWFuZCBxdWV1ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHNvY2tldCwgcXVldWUpIHtcbiAgICAvLyBUT0RPOiBDb3B5IHNvbWUgY29uZmlnIG9wdGlvbnNcbiAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcbiAgICB0aGlzLmNtZFF1ZXVlID0gcXVldWU7XG4gICAgdGhpcy5leHRhbnQgPSB7fTtcbn07XG5cbi8qKlxuICogU3RhcnQgcGx1Z2luXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgc3RhcmNvZGVyID0gdGhpcy5nYW1lLnN0YXJjb2RlcjtcbiAgICB0aGlzLl91cGRhdGVDb21wbGV0ZSA9IGZhbHNlO1xuICAgIC8vIEZJWE1FOiBOZWVkIG1vcmUgcm9idXN0IGhhbmRsaW5nIG9mIERDL1JDXG4gICAgdGhpcy5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5wYXVzZWQgPSB0cnVlO1xuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdyZWNvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5wYXVzZWQgPSBmYWxzZTtcbiAgICB9KTtcbiAgICAvLyBNZWFzdXJlIGNsaWVudC1zZXJ2ZXIgdGltZSBkZWx0YVxuICAgIHRoaXMuc29ja2V0Lm9uKCd0aW1lc3luYycsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHNlbGYuX2xhdGVuY3kgPSBkYXRhIC0gc2VsZi5nYW1lLnRpbWUubm93O1xuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICB2YXIgcmVhbFRpbWUgPSBkYXRhLnI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gZGF0YS5iLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdmFyIHVwZGF0ZSA9IGRhdGEuYltpXTtcbiAgICAgICAgICAgIHZhciBpZCA9IHVwZGF0ZS5pZDtcbiAgICAgICAgICAgIHZhciBzcHJpdGU7XG4gICAgICAgICAgICB1cGRhdGUudGltZXN0YW1wID0gcmVhbFRpbWU7XG4gICAgICAgICAgICBpZiAoc3ByaXRlID0gc2VsZi5leHRhbnRbaWRdKSB7XG4gICAgICAgICAgICAgICAgLy8gRXhpc3Rpbmcgc3ByaXRlIC0gcHJvY2VzcyB1cGRhdGVcbiAgICAgICAgICAgICAgICBzcHJpdGUudXBkYXRlUXVldWUucHVzaCh1cGRhdGUpO1xuICAgICAgICAgICAgICAgIGlmICh1cGRhdGUucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuY29uZmlnKHVwZGF0ZS5wcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNwcml0ZS51cGRhdGVRdWV1ZS5sZW5ndGggPiBVUERBVEVfUVVFVUVfTElNSVQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBOZXcgc3ByaXRlIC0gY3JlYXRlIGFuZCBjb25maWd1cmVcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdOZXcnLCBpZCwgdXBkYXRlLnQpO1xuICAgICAgICAgICAgICAgIHNwcml0ZSA9IHN0YXJjb2Rlci5hZGRCb2R5KHVwZGF0ZS50LCB1cGRhdGUpO1xuICAgICAgICAgICAgICAgIGlmIChzcHJpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNlcnZlcklkID0gaWQ7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZXh0YW50W2lkXSA9IHNwcml0ZTtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlID0gW3VwZGF0ZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDAsIGwgPSBkYXRhLnJtLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaWQgPSBkYXRhLnJtW2ldO1xuICAgICAgICAgICAgaWYgKHNlbGYuZXh0YW50W2lkXSkge1xuICAgICAgICAgICAgICAgIHN0YXJjb2Rlci5yZW1vdmVCb2R5KHNlbGYuZXh0YW50W2lkXSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHNlbGYuZXh0YW50W2lkXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLyoqXG4gKiBTZW5kIHF1ZXVlZCBjb21tYW5kcyB0byBzZXJ2ZXIgYW5kIGludGVycG9sYXRlIG9iamVjdHMgYmFzZWQgb24gdXBkYXRlcyBmcm9tIHNlcnZlclxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl91cGRhdGVDb21wbGV0ZSkge1xuICAgICAgICB0aGlzLl9zZW5kQ29tbWFuZHMoKTtcbiAgICAgICAgdGhpcy5fcHJvY2Vzc1BoeXNpY3NVcGRhdGVzKCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvbXBsZXRlID0gdHJ1ZTtcbiAgICB9XG4gfTtcblxuU3luY0NsaWVudC5wcm90b3R5cGUucG9zdFJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl91cGRhdGVDb21wbGV0ZSA9IGZhbHNlO1xufTtcblxuXG52YXIgYWN0aW9ucyA9IFtdOyAgICAgICAgICAgICAgIC8vIE1vZHVsZSBzY29wZSB0byBhdm9pZCBhbGxvY2F0aW9uc1xudmFyIGFjdGlvbjtcbi8qKlxuICogU2VuZCBxdWV1ZWQgY29tbWFuZHMgdGhhdCBoYXZlIGJlZW4gZXhlY3V0ZWQgdG8gdGhlIHNlcnZlclxuICpcbiAqIEBwcml2YXRlXG4gKi9cblN5bmNDbGllbnQucHJvdG90eXBlLl9zZW5kQ29tbWFuZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgYWN0aW9ucy5sZW5ndGggPSAwO1xuICAgIGZvciAodmFyIGkgPSB0aGlzLmNtZFF1ZXVlLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xuICAgICAgICBhY3Rpb24gPSB0aGlzLmNtZFF1ZXVlW2ldO1xuICAgICAgICBpZiAoYWN0aW9uLmV4ZWN1dGVkKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnVuc2hpZnQoYWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuY21kUXVldWUuc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdkbycsIGFjdGlvbnMpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdzZW5kaW5nIGFjdGlvbnMnLCBhY3Rpb25zKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEhhbmRsZXMgaW50ZXJwb2xhdGlvbiAvIHByZWRpY3Rpb24gcmVzb2x1dGlvbiBmb3IgcGh5c2ljcyBib2RpZXNcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5fcHJvY2Vzc1BoeXNpY3NVcGRhdGVzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpbnRlcnBUaW1lID0gdGhpcy5nYW1lLnRpbWUubm93ICsgdGhpcy5fbGF0ZW5jeSAtIHRoaXMuZ2FtZS5zdGFyY29kZXIuY29uZmlnLnJlbmRlckxhdGVuY3k7XG4gICAgdmFyIG9pZHMgPSBPYmplY3Qua2V5cyh0aGlzLmV4dGFudCk7XG4gICAgZm9yICh2YXIgaSA9IG9pZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIHNwcml0ZSA9IHRoaXMuZXh0YW50W29pZHNbaV1dO1xuICAgICAgICB2YXIgcXVldWUgPSBzcHJpdGUudXBkYXRlUXVldWU7XG4gICAgICAgIHZhciBiZWZvcmUgPSBudWxsLCBhZnRlciA9IG51bGw7XG5cbiAgICAgICAgLy8gRmluZCB1cGRhdGVzIGJlZm9yZSBhbmQgYWZ0ZXIgaW50ZXJwVGltZVxuICAgICAgICB2YXIgaiA9IDE7XG4gICAgICAgIHdoaWxlIChxdWV1ZVtqXSkge1xuICAgICAgICAgICAgaWYgKHF1ZXVlW2pdLnRpbWVzdGFtcCA+IGludGVycFRpbWUpIHtcbiAgICAgICAgICAgICAgICBhZnRlciA9IHF1ZXVlW2pdO1xuICAgICAgICAgICAgICAgIGJlZm9yZSA9IHF1ZXVlW2otMV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb25lIC0gd2UncmUgYmVoaW5kLlxuICAgICAgICBpZiAoIWJlZm9yZSAmJiAhYWZ0ZXIpIHtcbiAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPj0gMikgeyAgICAvLyBUd28gbW9zdCByZWNlbnQgdXBkYXRlcyBhdmFpbGFibGU/IFVzZSB0aGVtLlxuICAgICAgICAgICAgICAgIGJlZm9yZSA9IHF1ZXVlW3F1ZXVlLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgICAgIGFmdGVyID0gcXVldWVbcXVldWUubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnTGFnZ2luZycsIG9pZHNbaV0pO1xuICAgICAgICAgICAgfSBlbHNlIHsgICAgICAgICAgICAgICAgICAgIC8vIE5vPyBKdXN0IGJhaWxcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdCYWlsaW5nJywgb2lkc1tpXSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdPaycsIGludGVycFRpbWUsIHF1ZXVlLmxlbmd0aCk7XG4gICAgICAgICAgICBxdWV1ZS5zcGxpY2UoMCwgaiAtIDEpOyAgICAgLy8gVGhyb3cgb3V0IG9sZGVyIHVwZGF0ZXNcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzcGFuID0gYWZ0ZXIudGltZXN0YW1wIC0gYmVmb3JlLnRpbWVzdGFtcDtcbiAgICAgICAgdmFyIHQgPSAoaW50ZXJwVGltZSAtIGJlZm9yZS50aW1lc3RhbXApIC8gc3BhbjtcbiAgICAgICAgLy9pZiAodCA8IDAgfHwgdCA+IDEpIHtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coJ3dlaXJkIHRpbWUnLCB0KTtcbiAgICAgICAgLy99XG4gICAgICAgIHQgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCB0KSk7ICAgICAgICAvLyBGSVhNRTogU3RvcGdhcCBmaXggLSBTaG91bGRuJ3QgbmVlZCB0aGlzXG4gICAgICAgIHNwcml0ZS5zZXRQb3NBbmdsZShsaW5lYXIoYmVmb3JlLngsIGFmdGVyLngsIHQpLCBsaW5lYXIoYmVmb3JlLnksIGFmdGVyLnksIHQpLCBsaW5lYXIoYmVmb3JlLmEsIGFmdGVyLmEsIHQpKTtcbiAgICB9XG59O1xuXG4vLyBIZWxwZXJzXG5cbi8qKlxuICogSW50ZXJwb2xhdGUgYmV0d2VlbiB0d28gcG9pbnRzIHdpdGggaGVybWl0ZSBzcGxpbmVcbiAqIE5CIC0gY3VycmVudGx5IHVudXNlZCBhbmQgcHJvYmFibHkgYnJva2VuXG4gKlxuICogQHBhcmFtIHAwIHtudW1iZXJ9IC0gaW5pdGlhbCB2YWx1ZVxuICogQHBhcmFtIHAxIHtudW1iZXJ9IC0gZmluYWwgdmFsdWVcbiAqIEBwYXJhbSB2MCB7bnVtYmVyfSAtIGluaXRpYWwgc2xvcGVcbiAqIEBwYXJhbSB2MSB7bnVtYmVyfSAtIGZpbmFsIHNsb3BlXG4gKiBAcGFyYW0gdCB7bnVtYmVyfSAtIHBvaW50IG9mIGludGVycG9sYXRpb24gKGJldHdlZW4gMCBhbmQgMSlcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gaW50ZXJwb2xhdGVkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGhlcm1pdGUgKHAwLCBwMSwgdjAsIHYxLCB0KSB7XG4gICAgdmFyIHQyID0gdCp0O1xuICAgIHZhciB0MyA9IHQqdDI7XG4gICAgcmV0dXJuICgyKnQzIC0gMyp0MiArIDEpKnAwICsgKHQzIC0gMip0MiArIHQpKnYwICsgKC0yKnQzICsgMyp0MikqcDEgKyAodDMgLSB0MikqdjE7XG59XG5cbi8qKlxuICogSW50ZXJwb2xhdGUgYmV0d2VlbiB0d28gcG9pbnRzIHdpdGggbGluZWFyIHNwbGluZVxuICpcbiAqIEBwYXJhbSBwMCB7bnVtYmVyfSAtIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSBwMSB7bnVtYmVyfSAtIGZpbmFsIHZhbHVlXG4gKiBAcGFyYW0gdCB7bnVtYmVyfSAtIHBvaW50IG9mIGludGVycG9sYXRpb24gKGJldHdlZW4gMCBhbmQgMSlcbiAqIEBwYXJhbSBzY2FsZSB7bnVtYmVyfSAtIHNjYWxlIGZhY3RvciB0byBub3JtYWxpemUgdW5pdHNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gaW50ZXJwb2xhdGVkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGxpbmVhciAocDAsIHAxLCB0LCBzY2FsZSkge1xuICAgIHNjYWxlID0gc2NhbGUgfHwgMTtcbiAgICByZXR1cm4gcDAgKyAocDEgLSBwMCkqdCpzY2FsZTtcbn1cblxuU3RhcmNvZGVyLlNlcnZlclN5bmMgPSBTeW5jQ2xpZW50O1xubW9kdWxlLmV4cG9ydHMgPSBTeW5jQ2xpZW50OyIsIi8qKlxuICogQm9vdC5qc1xuICpcbiAqIEJvb3Qgc3RhdGUgZm9yIFN0YXJjb2RlclxuICogTG9hZCBhc3NldHMgZm9yIHByZWxvYWQgc2NyZWVuIGFuZCBjb25uZWN0IHRvIHNlcnZlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb250cm9scyA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvQ29udHJvbHMuanMnKTtcbnZhciBTeW5jQ2xpZW50ID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9TeW5jQ2xpZW50LmpzJyk7XG5cbnZhciBCb290ID0gZnVuY3Rpb24gKCkge307XG5cbkJvb3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbkJvb3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQm9vdDtcblxudmFyIF9jb25uZWN0ZWQgPSBmYWxzZTtcblxuLyoqXG4gKiBTZXQgcHJvcGVydGllcyB0aGF0IHJlcXVpcmUgYm9vdGVkIGdhbWUgc3RhdGUsIGF0dGFjaCBwbHVnaW5zLCBjb25uZWN0IHRvIGdhbWUgc2VydmVyXG4gKi9cbkJvb3QucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy90aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlO1xuICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRTtcbiAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWU7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBwU2NhbGUgPSB0aGlzLnN0YXJjb2Rlci5jb25maWcucGh5c2ljc1NjYWxlO1xuICAgIHZhciBpcFNjYWxlID0gMS9wU2NhbGU7XG4gICAgdmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5jb25maWcgPSB7XG4gICAgICAgIHB4bTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBpcFNjYWxlKmE7XG4gICAgICAgIH0sXG4gICAgICAgIG1weDogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBmbG9vcihwU2NhbGUqYSk7XG4gICAgICAgIH0sXG4gICAgICAgIHB4bWk6IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gLWlwU2NhbGUqYTtcbiAgICAgICAgfSxcbiAgICAgICAgbXB4aTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBmbG9vcigtcFNjYWxlKmEpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zZXJ2ZXJDb25uZWN0KCk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5jb250cm9scyA9IHRoaXMuZ2FtZS5wbHVnaW5zLmFkZChDb250cm9scyxcbiAgICAvLyAgICB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy90aGlzLmdhbWUuam95c3RpY2sgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oUGhhc2VyLlZpcnR1YWxKb3lzdGljayk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5jb250cm9scyA9IHRoaXMuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihDb250cm9scywgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIC8vIFNldCB1cCBzb2NrZXQuaW8gY29ubmVjdGlvblxuICAgIC8vdGhpcy5zdGFyY29kZXIuc29ja2V0ID0gdGhpcy5zdGFyY29kZXIuaW8odGhpcy5zdGFyY29kZXIuY29uZmlnLnNlcnZlclVyaSxcbiAgICAvLyAgICB0aGlzLnN0YXJjb2Rlci5jb25maWcuaW9DbGllbnRPcHRpb25zKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLnNvY2tldC5vbignc2VydmVyIHJlYWR5JywgZnVuY3Rpb24gKHBsYXllck1zZykge1xuICAgIC8vICAgIC8vIEZJWE1FOiBIYXMgdG8gaW50ZXJhY3Qgd2l0aCBzZXNzaW9uIGZvciBhdXRoZW50aWNhdGlvbiBldGMuXG4gICAgLy8gICAgc2VsZi5zdGFyY29kZXIucGxheWVyID0gcGxheWVyTXNnO1xuICAgIC8vICAgIC8vc2VsZi5zdGFyY29kZXIuc3luY2NsaWVudCA9IHNlbGYuZ2FtZS5wbHVnaW5zLmFkZChTeW5jQ2xpZW50LFxuICAgIC8vICAgIC8vICAgIHNlbGYuc3RhcmNvZGVyLnNvY2tldCwgc2VsZi5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIC8vICAgIHNlbGYuc3RhcmNvZGVyLnN5bmNjbGllbnQgPSBzZWxmLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oU3luY0NsaWVudCxcbiAgICAvLyAgICAgICAgc2VsZi5zdGFyY29kZXIuc29ja2V0LCBzZWxmLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy8gICAgX2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgLy99KTtcbn07XG5cbi8qKlxuICogUHJlbG9hZCBtaW5pbWFsIGFzc2V0cyBmb3IgcHJvZ3Jlc3Mgc2NyZWVuXG4gKi9cbkJvb3QucHJvdG90eXBlLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2Jhcl9sZWZ0JywgJ2Fzc2V0cy9pbWFnZXMvZ3JlZW5CYXJMZWZ0LnBuZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKCdiYXJfbWlkJywgJ2Fzc2V0cy9pbWFnZXMvZ3JlZW5CYXJNaWQucG5nJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2UoJ2Jhcl9yaWdodCcsICdhc3NldHMvaW1hZ2VzL2dyZWVuQmFyUmlnaHQucG5nJyk7XG59O1xuXG4vKipcbiAqIEtpY2sgaW50byBuZXh0IHN0YXRlIG9uY2UgaW5pdGlhbGl6YXRpb24gYW5kIHByZWxvYWRpbmcgYXJlIGRvbmVcbiAqL1xuQm9vdC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnbG9hZGVyJyk7XG59O1xuXG4vKipcbiAqIEFkdmFuY2UgZ2FtZSBzdGF0ZSBvbmNlIG5ldHdvcmsgY29ubmVjdGlvbiBpcyBlc3RhYmxpc2hlZFxuICovXG4vL0Jvb3QucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbi8vICAgIC8vIEZJWE1FOiBkb24ndCB3YWl0IGhlcmUgLSBzaG91bGQgYmUgaW4gY3JlYXRlXG4vLyAgICBpZiAodGhpcy5zdGFyY29kZXIuY29ubmVjdGVkKSB7XG4vLyAgICAgICAgLy90aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ3NwYWNlJyk7XG4vLyAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdsb2dpbicpO1xuLy8gICAgfVxuLy99O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb3Q7IiwiLyoqXG4gKiBMb2FkZXIuanNcbiAqXG4gKiBQaGFzZXIgc3RhdGUgdG8gcHJlbG9hZCBhc3NldHMgYW5kIGRpc3BsYXkgcHJvZ3Jlc3NcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTG9hZGVyID0gZnVuY3Rpb24gKCkge307XG5cbkxvYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuTG9hZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvYWRlcjtcblxuTG9hZGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEluaXQgYW5kIGRyYXcgc3RhcmZpZWxkXG4gICAgdGhpcy5zdGFyY29kZXIuc3RhcmZpZWxkID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSg2MDAsIDYwMCk7XG4gICAgdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZCh0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLmdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0LCB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQpO1xuXG4gICAgLy8gUG9zaXRpb24gcHJvZ3Jlc3MgYmFyXG4gICAgdmFyIGJhcldpZHRoID0gTWF0aC5mbG9vcigwLjQgKiB0aGlzLmdhbWUud2lkdGgpO1xuICAgIHZhciBvcmlnaW5YID0gKHRoaXMuZ2FtZS53aWR0aCAtIGJhcldpZHRoKS8yO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5nYW1lLmFkZC5pbWFnZShvcmlnaW5YLCB0aGlzLmdhbWUud29ybGQuY2VudGVyWSwgJ2Jhcl9sZWZ0Jyk7XG4gICAgbGVmdC5hbmNob3Iuc2V0VG8oMCwgMC41KTtcbiAgICB2YXIgbWlkID0gdGhpcy5nYW1lLmFkZC5pbWFnZShvcmlnaW5YICsgbGVmdC53aWR0aCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclksICdiYXJfbWlkJyk7XG4gICAgbWlkLmFuY2hvci5zZXRUbygwLCAwLjUpO1xuICAgIHZhciByaWdodCA9IHRoaXMuZ2FtZS5hZGQuaW1hZ2Uob3JpZ2luWCArIGxlZnQud2lkdGgsIHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJZLCAnYmFyX3JpZ2h0Jyk7XG4gICAgcmlnaHQuYW5jaG9yLnNldFRvKDAsIDAuNSk7XG4gICAgdmFyIG1pZFdpZHRoID0gYmFyV2lkdGggLSAyICogbGVmdC53aWR0aDtcbiAgICBtaWQud2lkdGggPSAwO1xuICAgIHZhciBsb2FkaW5nVGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dCh0aGlzLmdhbWUud29ybGQuY2VudGVyWCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclkgLSAzNiwgJ0xvYWRpbmcuLi4nLFxuICAgICAgICB7Zm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2ZmZmZmZicsIGFsaWduOiAnY2VudGVyJ30pO1xuICAgIGxvYWRpbmdUZXh0LmFuY2hvci5zZXRUbygwLjUpO1xuICAgIHZhciBwcm9nVGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dChvcmlnaW5YICsgbGVmdC53aWR0aCwgdGhpcy5nYW1lLndvcmxkLmNlbnRlclksICcwJScsXG4gICAgICAgIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmZmZmZmJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgcHJvZ1RleHQuYW5jaG9yLnNldFRvKDAuNSk7XG5cbiAgICB0aGlzLmdhbWUubG9hZC5vbkZpbGVDb21wbGV0ZS5hZGQoZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgIHZhciB3ID0gTWF0aC5mbG9vcihtaWRXaWR0aCAqIHByb2dyZXNzIC8gMTAwKTtcbiAgICAgICAgbWlkLndpZHRoID0gdztcbiAgICAgICAgcmlnaHQueCA9IG1pZC54ICsgdztcbiAgICAgICAgcHJvZ1RleHQuc2V0VGV4dChwcm9ncmVzcyArICclJyk7XG4gICAgICAgIHByb2dUZXh0LnggPSBtaWQueCArIHcvMjtcbiAgICB9LCB0aGlzKTtcbn07XG5cbkxvYWRlci5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPOiBIRCBhbmQgU0QgdmVyc2lvbnNcbiAgICAvLyBGb250c1xuICAgIHRoaXMuZ2FtZS5sb2FkLmJpdG1hcEZvbnQoJ3RpdGxlLWZvbnQnLFxuICAgICAgICAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC5wbmcnLCAnYXNzZXRzL2JpdG1hcGZvbnRzL2thcm5pdm9yZTEyOC54bWwnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KCdyZWFkb3V0LXllbGxvdycsXG4gICAgICAgICdhc3NldHMvYml0bWFwZm9udHMvaGVhdnkteWVsbG93MjQucG5nJywgJ2Fzc2V0cy9iaXRtYXBmb250cy9oZWF2eS15ZWxsb3cyNC54bWwnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygncGxheWVydGhydXN0JywgJ2Fzc2V0cy9zb3VuZHMvdGhydXN0TG9vcC5vZ2cnKTtcbiAgICAvLyBTb3VuZHNcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnY2hpbWUnLCAnYXNzZXRzL3NvdW5kcy9jaGltZS5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnbGV2ZWx1cCcsICdhc3NldHMvc291bmRzL2xldmVsdXAub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ3BsYW50dHJlZScsICdhc3NldHMvc291bmRzL3BsYW50dHJlZS5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnYmlncG9wJywgJ2Fzc2V0cy9zb3VuZHMvYmlncG9wLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdsaXR0bGVwb3AnLCAnYXNzZXRzL3NvdW5kcy9saXR0bGVwb3Aub2dnJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ3RhZ2dlZCcsICdhc3NldHMvc291bmRzL3RhZ2dlZC5vZ2cnKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdWRpbygnbGFzZXInLCAnYXNzZXRzL3NvdW5kcy9sYXNlci5vZ2cnKTtcbiAgICAvLyBTcHJpdGVzaGVldHNcbiAgICB0aGlzLmdhbWUubG9hZC5hdGxhcygnam95c3RpY2snLCAnYXNzZXRzL2pveXN0aWNrL2dlbmVyaWMtam95c3RpY2sucG5nJywgJ2Fzc2V0cy9qb3lzdGljay9nZW5lcmljLWpveXN0aWNrLmpzb24nKTtcbiAgICAvLyBJbWFnZXNcblxufTtcblxuTG9hZGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhcmNvZGVyLmNvbm5lY3RlZCkge1xuICAgICAgICAvL3RoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnc3BhY2UnKTtcbiAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdsb2dpbicpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGVyOyIsIi8qKlxuICogTG9naW4uanNcbiAqXG4gKiBTdGF0ZSBmb3IgZGlzcGxheWluZyBsb2dpbiBzY3JlZW4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIExvZ2luID0gZnVuY3Rpb24gKCkge307XG5cbkxvZ2luLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG5Mb2dpbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMb2dpbjtcblxuTG9naW4ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuc3RhcmNvZGVyLnNob3dMb2dpbigpO1xuICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldC5vbignbG9nZ2VkIGluJywgZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICBzZWxmLnN0YXJjb2Rlci5oaWRlTG9naW4oKTtcbiAgICAgICAgc2VsZi5zdGFyY29kZXIucGxheWVyID0gcGxheWVyO1xuICAgICAgICBzZWxmLmdhbWUuc3RhdGUuc3RhcnQoJ3NwYWNlJyk7XG4gICAgfSk7XG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0Lm9uKCdsb2dpbiBmYWlsdXJlJywgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIHNlbGYuc3RhcmNvZGVyLnNldExvZ2luRXJyb3IoZXJyb3IpO1xuICAgIH0pO1xufTtcblxuLy9Mb2dpbi5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbi8vICAgIHRoaXMuZ2FtZS5sb2FkLmJpdG1hcEZvbnQoJ3RpdGxlLWZvbnQnLFxuLy8gICAgICAgICdhc3NldHMvYml0bWFwZm9udHMva2Fybml2b3JlMTI4LnBuZycsICdhc3NldHMvYml0bWFwZm9udHMva2Fybml2b3JlMTI4LnhtbCcpO1xuLy99O1xuXG5Mb2dpbi5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vdmFyIHN0YXJmaWVsZCA9IHRoaXMuZ2FtZS5tYWtlLmJpdG1hcERhdGEoNjAwLCA2MDApO1xuICAgIC8vdGhpcy5zdGFyY29kZXIuZHJhd1N0YXJGaWVsZCh0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQuY3R4LCA2MDAsIDE2KTtcbiAgICB0aGlzLmdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgdGhpcy5nYW1lLndpZHRoLCB0aGlzLmdhbWUuaGVpZ2h0LCB0aGlzLnN0YXJjb2Rlci5zdGFyZmllbGQpO1xuICAgIHZhciB0aXRsZSA9IHRoaXMuZ2FtZS5hZGQuYml0bWFwVGV4dCh0aGlzLmdhbWUud29ybGQuY2VudGVyWCwgMTI4LCAndGl0bGUtZm9udCcsICdTVEFSQ09ERVInKTtcbiAgICB0aXRsZS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2dpbjtcbiIsIi8qKlxuICogU3BhY2UuanNcbiAqXG4gKiBNYWluIGdhbWUgc3RhdGUgZm9yIFN0YXJjb2RlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9TaW1wbGVQYXJ0aWNsZS5qcycpO1xudmFyIFRocnVzdEdlbmVyYXRvciA9IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9UaHJ1c3RHZW5lcmF0b3IuanMnKTtcbnZhciBNaW5pTWFwID0gcmVxdWlyZSgnLi4vcGhhc2VydWkvTWluaU1hcC5qcycpO1xudmFyIFRvYXN0ID0gcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1RvYXN0LmpzJyk7XG5cbnZhciBDb250cm9scyA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvQ29udHJvbHMuanMnKTtcbnZhciBTeW5jQ2xpZW50ID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9TeW5jQ2xpZW50LmpzJyk7XG5cbnZhciBTcGFjZSA9IGZ1bmN0aW9uICgpIHt9O1xuXG5TcGFjZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TdGF0ZS5wcm90b3R5cGUpO1xuU3BhY2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3BhY2U7XG5cblNwYWNlLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzID0gdGhpcy5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKENvbnRyb2xzLCB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgdGhpcy5zdGFyY29kZXIuc3luY2NsaWVudCA9IHRoaXMuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihTeW5jQ2xpZW50LFxuICAgICAgICB0aGlzLnN0YXJjb2Rlci5zb2NrZXQsIHRoaXMuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICB0aGlzLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZTtcbn07XG5cblNwYWNlLnByb3RvdHlwZS5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSh0aGlzLmdhbWUsIFRocnVzdEdlbmVyYXRvci50ZXh0dXJlS2V5LCAnI2ZmNjYwMCcsIDgpO1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSh0aGlzLmdhbWUsICdidWxsZXQnLCAnIzk5OTk5OScsIDQpO1xuICAgIFNpbXBsZVBhcnRpY2xlLmNhY2hlVGV4dHVyZSh0aGlzLmdhbWUsICd0cmFjdG9yJywgJyNlZWVlZWUnLCA4LCB0cnVlKTtcbiAgICAvL3RoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdwbGF5ZXJ0aHJ1c3QnLCAnYXNzZXRzL3NvdW5kcy90aHJ1c3RMb29wLm9nZycpO1xuICAgIC8vdGhpcy5nYW1lLmxvYWQuYXVkaW8oJ2NoaW1lJywgJ2Fzc2V0cy9zb3VuZHMvY2hpbWUubXAzJyk7XG4gICAgLy90aGlzLmdhbWUubG9hZC5hdGxhcygnam95c3RpY2snLCAnYXNzZXRzL2pveXN0aWNrL2dlbmVyaWMtam95c3RpY2sucG5nJywgJ2Fzc2V0cy9qb3lzdGljay9nZW5lcmljLWpveXN0aWNrLmpzb24nKTtcbiAgICAvL3RoaXMuZ2FtZS5sb2FkLmJpdG1hcEZvbnQoJ3JlYWRvdXQteWVsbG93JyxcbiAgICAvLyAgICAnYXNzZXRzL2JpdG1hcGZvbnRzL2hlYXZ5LXllbGxvdzI0LnBuZycsICdhc3NldHMvYml0bWFwZm9udHMvaGVhdnkteWVsbG93MjQueG1sJyk7XG59O1xuXG5TcGFjZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vY29uc29sZS5sb2coJ2NyZWF0ZScpO1xuICAgIC8vdmFyIHJuZyA9IHRoaXMuZ2FtZS5ybmQ7XG4gICAgdmFyIHdiID0gdGhpcy5zdGFyY29kZXIuY29uZmlnLndvcmxkQm91bmRzO1xuICAgIHZhciBwcyA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy5waHlzaWNzU2NhbGU7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuUDJKUyk7XG4gICAgdGhpcy53b3JsZC5zZXRCb3VuZHMuY2FsbCh0aGlzLndvcmxkLCB3YlswXSpwcywgd2JbMV0qcHMsICh3YlsyXS13YlswXSkqcHMsICh3YlszXS13YlsxXSkqcHMpO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLnAyLnNldEJvdW5kc1RvV29ybGQodHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgLy8gRGVidWdnaW5nXG4gICAgLy90aGlzLmdhbWUudGltZS5hZHZhbmNlZFRpbWluZyA9IHRydWU7XG5cbiAgICAvLyBTZXQgdXAgRE9NXG4gICAgdGhpcy5zdGFyY29kZXIubGF5b3V0RE9NU3BhY2VTdGF0ZSgpO1xuXG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMucmVzZXQoKTtcblxuICAgIC8vIFZpcnR1YWwgam95c3RpY2tcbiAgICB0aGlzLnN0YXJjb2Rlci5jb250cm9scy5hZGRWaXJ0dWFsQ29udHJvbHMoJ2pveXN0aWNrJyk7XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzID0ge307XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzLnN0aWNrID0gdGhpcy5nYW1lLmpveXN0aWNrLmFkZFN0aWNrKFxuICAgIC8vICAgIHRoaXMuZ2FtZS53aWR0aCAtIDE1MCwgdGhpcy5nYW1lLmhlaWdodCAtIDc1LCAxMDAsICdqb3lzdGljaycpO1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5zdGljay5zY2FsZSA9IDAuNTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuZmlyZWJ1dHRvbiA9IHRoaXMuZ2FtZS5qb3lzdGljay5hZGRCdXR0b24odGhpcy5nYW1lLndpZHRoIC0gNTAsIHRoaXMuZ2FtZS5oZWlnaHQgLSA3NSxcbiAgICAvLyAgICAnam95c3RpY2snLCAnYnV0dG9uMS11cCcsICdidXR0b24xLWRvd24nKTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuZmlyZWJ1dHRvbi5zY2FsZSA9IDAuNTtcblxuICAgIC8vIFNvdW5kc1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMgPSB7fTtcbiAgICB0aGlzLmdhbWUuc291bmRzLnBsYXllcnRocnVzdCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ3BsYXllcnRocnVzdCcsIDEsIHRydWUpO1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMuY2hpbWUgPSB0aGlzLmdhbWUuc291bmQuYWRkKCdjaGltZScsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLnBsYW50dHJlZSA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ3BsYW50dHJlZScsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLmJpZ3BvcCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ2JpZ3BvcCcsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLmxpdHRsZXBvcCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ2xpdHRsZXBvcCcsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLnRhZ2dlZCA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ3RhZ2dlZCcsIDEsIGZhbHNlKTtcbiAgICB0aGlzLmdhbWUuc291bmRzLmxhc2VyID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgnbGFzZXInLCAxLCBmYWxzZSk7XG5cbiAgICAvLyBCYWNrZ3JvdW5kXG4gICAgLy92YXIgc3RhcmZpZWxkID0gdGhpcy5nYW1lLm1ha2UuYml0bWFwRGF0YSg2MDAsIDYwMCk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5kcmF3U3RhckZpZWxkKHN0YXJmaWVsZC5jdHgsIDYwMCwgMTYpO1xuICAgIHRoaXMuZ2FtZS5hZGQudGlsZVNwcml0ZSh3YlswXSpwcywgd2JbMV0qcHMsICh3YlsyXS13YlswXSkqcHMsICh3YlszXS13YlsxXSkqcHMsIHRoaXMuc3RhcmNvZGVyLnN0YXJmaWVsZCk7XG5cbiAgICB0aGlzLnN0YXJjb2Rlci5zeW5jY2xpZW50LnN0YXJ0KCk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5zb2NrZXQuZW1pdCgnY2xpZW50IHJlYWR5Jyk7XG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0LmVtaXQoJ3JlYWR5Jyk7XG4gICAgdGhpcy5fc2V0dXBNZXNzYWdlSGFuZGxlcnModGhpcy5zdGFyY29kZXIuc29ja2V0KTtcblxuICAgIC8vIEdyb3VwcyBmb3IgcGFydGljbGUgZWZmZWN0c1xuICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3IgPSBuZXcgVGhydXN0R2VuZXJhdG9yKHRoaXMuZ2FtZSk7XG5cbiAgICAvLyBHcm91cCBmb3IgZ2FtZSBvYmplY3RzXG4gICAgdGhpcy5nYW1lLnBsYXlmaWVsZCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgIC8vIFVJXG4gICAgdGhpcy5nYW1lLnVpID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgIHRoaXMuZ2FtZS51aS5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcblxuICAgIC8vIEludmVudG9yeVxuICAgIHZhciBsYWJlbCA9IHRoaXMuZ2FtZS5tYWtlLnRleHQodGhpcy5nYW1lLndpZHRoIC0gMTAwLCAyNSwgJ0lOVkVOVE9SWScsIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmY5OTAwJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgbGFiZWwuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZChsYWJlbCk7XG4gICAgLy90aGlzLmdhbWUuaW52ZW50b3J5dGV4dCA9IHRoaXMuZ2FtZS5tYWtlLnRleHQodGhpcy5nYW1lLndpZHRoIC0gMTAwLCA1MCwgJzAgY3J5c3RhbHMnLFxuICAgIC8vICAgIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjY2NjMDAwJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgdGhpcy5nYW1lLmludmVudG9yeXRleHQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBUZXh0KHRoaXMuZ2FtZS53aWR0aCAtIDEwMCwgNTAsICdyZWFkb3V0LXllbGxvdycsICcwJyk7XG4gICAgdGhpcy5nYW1lLmludmVudG9yeXRleHQuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZCh0aGlzLmdhbWUuaW52ZW50b3J5dGV4dCk7XG5cbiAgICAvL01pbmlNYXBcbiAgICB0aGlzLmdhbWUubWluaW1hcCA9IG5ldyBNaW5pTWFwKHRoaXMuZ2FtZSwgMzAwLCAzMDApO1xuICAgIHRoaXMuZ2FtZS51aS5hZGQodGhpcy5nYW1lLm1pbmltYXApO1xuICAgIHRoaXMuZ2FtZS54ID0gMTA7XG4gICAgdGhpcy5nYW1lLnkgPSAxMDtcblxuICAgIC8vIEhlbHBlcnNcbiAgICAvL2Z1bmN0aW9uIHJhbmRvbU5vcm1hbCAoKSB7XG4gICAgLy8gICAgdmFyIHQgPSAwO1xuICAgIC8vICAgIGZvciAodmFyIGk9MDsgaTw2OyBpKyspIHtcbiAgICAvLyAgICAgICAgdCArPSBybmcubm9ybWFsKCk7XG4gICAgLy8gICAgfVxuICAgIC8vICAgIHJldHVybiB0LzY7XG4gICAgLy99XG4gICAgLy9cbiAgICAvL2Z1bmN0aW9uIGRyYXdTdGFyIChjdHgsIHgsIHksIGQsIGNvbG9yKSB7XG4gICAgLy8gICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgLy8gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIC8vICAgIGN0eC5tb3ZlVG8oeC1kKzEsIHktZCsxKTtcbiAgICAvLyAgICBjdHgubGluZVRvKHgrZC0xLCB5K2QtMSk7XG4gICAgLy8gICAgY3R4Lm1vdmVUbyh4LWQrMSwgeStkLTEpO1xuICAgIC8vICAgIGN0eC5saW5lVG8oeCtkLTEsIHktZCsxKTtcbiAgICAvLyAgICBjdHgubW92ZVRvKHgsIHktZCk7XG4gICAgLy8gICAgY3R4LmxpbmVUbyh4LCB5K2QpO1xuICAgIC8vICAgIGN0eC5tb3ZlVG8oeC1kLCB5KTtcbiAgICAvLyAgICBjdHgubGluZVRvKHgrZCwgeSk7XG4gICAgLy8gICAgY3R4LnN0cm9rZSgpO1xuICAgIC8vfVxuICAgIC8vXG4gICAgLy9mdW5jdGlvbiBkcmF3U3RhckZpZWxkIChjdHgsIHNpemUsIG4pIHtcbiAgICAvLyAgICB2YXIgeG0gPSBNYXRoLnJvdW5kKHNpemUvMiArIHJhbmRvbU5vcm1hbCgpKnNpemUvNCk7XG4gICAgLy8gICAgdmFyIHltID0gTWF0aC5yb3VuZChzaXplLzIgKyByYW5kb21Ob3JtYWwoKSpzaXplLzQpO1xuICAgIC8vICAgIHZhciBxdWFkcyA9IFtbMCwwLHhtLTEseW0tMV0sIFt4bSwwLHNpemUtMSx5bS0xXSxcbiAgICAvLyAgICAgICAgWzAseW0seG0tMSxzaXplLTFdLCBbeG0seW0sc2l6ZS0xLHNpemUtMV1dO1xuICAgIC8vICAgIHZhciBjb2xvcjtcbiAgICAvLyAgICB2YXIgaSwgaiwgbCwgcTtcbiAgICAvL1xuICAgIC8vICAgIG4gPSBNYXRoLnJvdW5kKG4vNCk7XG4gICAgLy8gICAgZm9yIChpPTAsIGw9cXVhZHMubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgIC8vICAgICAgICBxID0gcXVhZHNbaV07XG4gICAgLy8gICAgICAgIGZvciAoaj0wOyBqPG47IGorKykge1xuICAgIC8vICAgICAgICAgICAgY29sb3IgPSAnaHNsKDYwLDEwMCUsJyArIHJuZy5iZXR3ZWVuKDkwLDk5KSArICclKSc7XG4gICAgLy8gICAgICAgICAgICBkcmF3U3RhcihjdHgsXG4gICAgLy8gICAgICAgICAgICAgICAgcm5nLmJldHdlZW4ocVswXSs3LCBxWzJdLTcpLCBybmcuYmV0d2VlbihxWzFdKzcsIHFbM10tNyksXG4gICAgLy8gICAgICAgICAgICAgICAgcm5nLmJldHdlZW4oMiw0KSwgY29sb3IpO1xuICAgIC8vICAgICAgICB9XG4gICAgLy8gICAgfVxuICAgIC8vfVxuXG59O1xuXG5TcGFjZS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdyZXNpemUnKTtcbn07XG5cblNwYWNlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gRklYTUU6IGp1c3QgYSBtZXNzIGZvciB0ZXN0aW5nXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzLnByb2Nlc3NRdWV1ZShmdW5jdGlvbiAoYSkge1xuICAgICAgICBpZiAoYS50eXBlID09PSAndXBfcHJlc3NlZCcpIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLmxvY2FsU3RhdGUudGhydXN0ID0gJ3N0YXJ0aW5nJztcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QucGxheSgpO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUudGhydXN0Z2VuZXJhdG9yLnN0YXJ0T24oc2VsZi5nYW1lLnBsYXllclNoaXApO1xuICAgICAgICB9IGVsc2UgaWYgKGEudHlwZSA9PT0gJ3VwX3JlbGVhc2VkJykge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnBsYXllclNoaXAubG9jYWxTdGF0ZS50aHJ1c3QgPSAnc2h1dGRvd24nO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUuc291bmRzLnBsYXllcnRocnVzdC5zdG9wKCk7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RvcE9uKHNlbGYuZ2FtZS5wbGF5ZXJTaGlwKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuU3BhY2UucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2NvbnNvbGUubG9nKCcrcmVuZGVyKycpO1xuICAgIC8vaWYgKHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUpIHtcbiAgICAvLyAgICB2YXIgZCA9IHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUucG9zaXRpb24ueCAtIHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUucHJldmlvdXNQb3NpdGlvbi54O1xuICAgIC8vICAgIGNvbnNvbGUubG9nKCdEZWx0YScsIGQsIHRoaXMuZ2FtZS50aW1lLmVsYXBzZWQsIGQgLyB0aGlzLmdhbWUudGltZS5lbGFwc2VkKTtcbiAgICAvL31cbiAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpO1xuICAgIC8vdGhpcy5nYW1lLmRlYnVnLnRleHQoJ0ZwczogJyArIHRoaXMuZ2FtZS50aW1lLmZwcywgNSwgMjApO1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5zdGljay5kZWJ1Zyh0cnVlLCB0cnVlKTtcbiAgICAvL3RoaXMuZ2FtZS5kZWJ1Zy5jYW1lcmFJbmZvKHRoaXMuZ2FtZS5jYW1lcmEsIDEwMCwgMjApO1xuICAgIC8vaWYgKHRoaXMuc2hpcCkge1xuICAgIC8vICAgIHRoaXMuZ2FtZS5kZWJ1Zy5zcHJpdGVJbmZvKHRoaXMuc2hpcCwgNDIwLCAyMCk7XG4gICAgLy99XG59O1xuXG5TcGFjZS5wcm90b3R5cGUuX3NldHVwTWVzc2FnZUhhbmRsZXJzID0gZnVuY3Rpb24gKHNvY2tldCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzb2NrZXQub24oJ21zZyBjcnlzdGFsIHBpY2t1cCcsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5jaGltZS5wbGF5KCk7XG4gICAgICAgIFRvYXN0LnNwaW5VcChzZWxmLmdhbWUsIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLngsIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLnksICcrJyArIHZhbCArICcgY3J5c3RhbHMhJyk7XG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCdtc2cgcGxhbnQgdHJlZScsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5wbGFudHRyZWUucGxheSgpO1xuICAgIH0pO1xuICAgIHNvY2tldC5vbignbXNnIGFzdGVyb2lkIHBvcCcsIGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICAgIGlmIChzaXplID4gMSkge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5iaWdwb3AucGxheSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnNvdW5kcy5saXR0bGVwb3AucGxheSgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCdtc2cgdGFnZ2VkJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBzZWxmLmdhbWUuc291bmRzLnRhZ2dlZC5wbGF5KCk7XG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCdtc2cgbGFzZXInLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMubGFzZXIucGxheSgpO1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGFjZTtcbiIsIi8qKlxuICogTWluaU1hcC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBNaW5pTWFwID0gZnVuY3Rpb24gKGdhbWUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIHZhciB4ciA9IHdpZHRoIC8gdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJXaWR0aDtcbiAgICB2YXIgeXIgPSBoZWlnaHQgLyB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckhlaWdodDtcbiAgICBpZiAoeHIgPD0geXIpIHtcbiAgICAgICAgdGhpcy5tYXBTY2FsZSA9IHhyO1xuICAgICAgICB0aGlzLnhPZmZzZXQgPSAteHIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckxlZnQ7XG4gICAgICAgIHRoaXMueU9mZnNldCA9IC14ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyVG9wICsgKGhlaWdodCAtIHhyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJIZWlnaHQpIC8gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1hcFNjYWxlID0geXI7XG4gICAgICAgIHRoaXMueU9mZnNldCA9IC15ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyVG9wO1xuICAgICAgICB0aGlzLnhPZmZzZXQgPSAteXIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckxlZnQgKyAod2lkdGggLSB5ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyV2lkdGgpIC8gMjtcbiAgICB9XG5cbiAgICB0aGlzLmdyYXBoaWNzID0gZ2FtZS5tYWtlLmdyYXBoaWNzKDAsIDApO1xuICAgIHRoaXMuZ3JhcGhpY3MuYmVnaW5GaWxsKDB4MDBmZjAwLCAwLjIpO1xuICAgIHRoaXMuZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgdGhpcy5ncmFwaGljcy5lbmRGaWxsKCk7XG4gICAgdGhpcy5ncmFwaGljcy5jYWNoZUFzQml0bWFwID0gdHJ1ZTtcbiAgICB0aGlzLmFkZCh0aGlzLmdyYXBoaWNzKTtcbn07XG5cbk1pbmlNYXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbk1pbmlNYXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWluaU1hcDtcblxuTWluaU1hcC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vdGhpcy50ZXh0dXJlLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIDAsIDAsIHRydWUpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5nYW1lLnBsYXlmaWVsZC5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGJvZHkgPSB0aGlzLmdhbWUucGxheWZpZWxkLmNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoIWJvZHkubWluaXNwcml0ZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgYm9keS5taW5pc3ByaXRlLnggPSB0aGlzLndvcmxkVG9NbVgoYm9keS54KTtcbiAgICAgICAgYm9keS5taW5pc3ByaXRlLnkgPSB0aGlzLndvcmxkVG9NbVkoYm9keS55KTtcbiAgICAgICAgYm9keS5taW5pc3ByaXRlLmFuZ2xlID0gYm9keS5hbmdsZTtcbiAgICAvLyAgICB2YXIgeCA9IDEwMCArIGJvZHkueCAvIDQwO1xuICAgIC8vICAgIHZhciB5ID0gMTAwICsgYm9keS55IC8gNDA7XG4gICAgLy8gICAgdGhpcy50ZXh0dXJlLnJlbmRlclhZKGJvZHkuZ3JhcGhpY3MsIHgsIHksIGZhbHNlKTtcbiAgICB9XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZS53b3JsZFRvTW1YID0gZnVuY3Rpb24gKHgpIHtcbiAgICByZXR1cm4geCAqIHRoaXMubWFwU2NhbGUgKyB0aGlzLnhPZmZzZXQ7XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZS53b3JsZFRvTW1ZID0gZnVuY3Rpb24gKHkpIHtcbiAgICByZXR1cm4geSAqIHRoaXMubWFwU2NhbGUgKyB0aGlzLnlPZmZzZXQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1pbmlNYXA7Il19
