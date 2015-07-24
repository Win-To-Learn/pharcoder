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
    login: require('./phaserstates/Login.js')
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
    this.socket = this.io(this.config.serverUri, this.config.ioClientOptions);
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

},{"./Starcoder.js":2,"./client-components/CodeEndpointClient.js":3,"./client-components/DOMInterface.js":4,"./client-components/Starfield.js":5,"./client-components/WorldApi.js":6,"./phaserstates/Boot.js":25,"./phaserstates/Login.js":26,"./phaserstates/Space.js":27}],2:[function(require,module,exports){
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
        if (event.source === self.dom.codePopup.contentWindow) {
            self.sendCode(event.data);
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
    $('.popup').hide();

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
    TractorBeam: require('../phaserbodies/TractorBeam.js')
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

},{"../phaserbodies/Asteroid.js":10,"../phaserbodies/Bullet.js":11,"../phaserbodies/Crystal.js":12,"../phaserbodies/GenericOrb.js":13,"../phaserbodies/Planetoid.js":14,"../phaserbodies/Ship.js":15,"../phaserbodies/TractorBeam.js":20,"../phaserbodies/Tree.js":21}],7:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
Tree.prototype.updateProperties = ['vectorScale', 'lineColor', 'graph', 'step', 'depth'];

var Bullet = function () {};
Bullet.prototype.updateProperties = [];

var TractorBeam = function () {};
TractorBeam.prototype.updateProperties = [];


exports.Ship = Ship;
exports.Asteroid = Asteroid;
exports.Crystal = Crystal;
exports.GenericOrb = GenericOrb;
exports.Bullet = Bullet;
exports.Planetoid = Planetoid;
exports.Tree = Tree;
exports.TractorBeam = TractorBeam;

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

},{"../Starcoder.js":2,"../common/Paths.js":8,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":17,"./VectorSprite.js":22}],11:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/UpdateProperties.js":9,"./SimpleParticle.js":16,"./SyncBodyInterface.js":17}],12:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":8,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":17,"./VectorSprite.js":22}],13:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":8,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":17,"./VectorSprite.js":22}],14:[function(require,module,exports){
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

},{"../Starcoder.js":2,"../common/Paths.js":8,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":17,"./VectorSprite.js":22}],15:[function(require,module,exports){
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
    if (this.playerid === this.game.starcoder.player.id) {
        this.game.inventorytext.setText(this.crystals.toString());
    }
};

module.exports = Ship;
//Starcoder.Ship = Ship;

},{"../Starcoder.js":2,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":17,"./VectorSprite.js":22}],16:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{"./SimpleParticle.js":16}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/UpdateProperties.js":9,"./SimpleParticle.js":16,"./SyncBodyInterface.js":17}],21:[function(require,module,exports){
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
},{"../Starcoder.js":2,"../common/UpdateProperties.js":9,"./SyncBodyInterface.js":17,"./VectorSprite.js":22}],22:[function(require,module,exports){
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

Controls.prototype.addVirtualControls = function (x, y, scale, texture) {
    texture = texture || 'joystick';
    this.stick = this.joystick.addStick(x, y, 100,texture);
    this.stick.motionLock = Phaser.VirtualJoystick.HORIZONTAL;
    this.stick.scale = scale;
    this.gobutton = this.joystick.addButton(x + 200*scale, y, texture, 'button1-up', 'button1-down');
    this.firebutton = this.joystick.addButton(x + 350*scale, y, texture, 'button2-up', 'button2-down');
    this.tractorbutton = this.joystick.addButton(x + 450*scale, y, texture, 'button3-up', 'button3-down');
    this.firebutton.scale = scale;
    this.gobutton.scale = scale;
    this.tractorbutton.scale = scale;
    this.stick.onMove.add(function () {
        if (this.stick.x >= 0.25) {
            this.joystickState.right = true;
            this.joystickState.left = false;
        } else if (this.stick.x <= -0.25) {
            this.joystickState.right = false;
            this.joystickState.left = true;
        } else {
            this.joystickState.right = false;
            this.joystickState.left = false;
        }
        if (this.stick.y >= 0.25) {
            this.joystickState.down = true;
            this.joystickState.up = false;
        } else if (this.stick.y <= -0.25) {
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
    this.gobutton.onDown.add(function () {
        this.joystickState.up = true;
    }, this);
    this.gobutton.onUp.add(function () {
        this.joystickState.up = false;
    }, this);
    this.tractorbutton.onDown.add(function () {
        this.joystickState.tractor = true;
    }, this);
    this.tractorbutton.onUp.add(function () {
        this.joystickState.tractor = false;
    }, this);
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
},{"../Starcoder-client.js":1}],24:[function(require,module,exports){
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
},{"../Starcoder-client.js":1}],25:[function(require,module,exports){
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

};

/**
 * Kick into next state once initialization and preloading are done
 */
Boot.prototype.create = function () {
    //this.game.state.start('preload');
};

/**
 * Advance game state once network connection is established
 */
Boot.prototype.update = function () {
    // FIXME: don't wait here - should be in create
    if (this.starcoder.connected) {
        //this.game.state.start('space');
        this.game.state.start('login');
    }
};

module.exports = Boot;
},{"../phaserplugins/Controls.js":23,"../phaserplugins/SyncClient.js":24}],26:[function(require,module,exports){
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

Login.prototype.preload = function () {
    this.game.load.bitmapFont('title-font',
        'assets/bitmapfonts/karnivore128.png', 'assets/bitmapfonts/karnivore128.xml');
};

Login.prototype.create = function () {
    var starfield = this.game.make.bitmapData(600, 600);
    this.starcoder.drawStarField(starfield.ctx, 600, 16);
    this.game.add.tileSprite(0, 0, this.game.width, this.game.height, starfield);
    var title = this.game.add.bitmapText(this.game.world.centerX, 128, 'title-font', 'STARCODER');
    title.anchor.setTo(0.5, 0.5);
};

module.exports = Login;

},{}],27:[function(require,module,exports){
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
};

Space.prototype.preload = function () {
    SimpleParticle.cacheTexture(this.game, ThrustGenerator.textureKey, '#ff6600', 8);
    SimpleParticle.cacheTexture(this.game, 'bullet', '#999999', 4);
    SimpleParticle.cacheTexture(this.game, 'tractor', '#eeeeee', 8, true);
    this.game.load.audio('playerthrust', 'assets/sounds/thrustLoop.ogg');
    this.game.load.audio('chime', 'assets/sounds/chime.mp3');
    this.game.load.atlas('joystick', 'assets/joystick/generic-joystick.png', 'assets/joystick/generic-joystick.json');
    this.game.load.bitmapFont('readout-yellow',
        'assets/bitmapfonts/heavy-yellow24.png', 'assets/bitmapfonts/heavy-yellow24.xml');
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
    this.game.time.advancedTiming = true;

    this.starcoder.controls.reset();

    // Virtual joystick
    this.starcoder.controls.addVirtualControls(this.game.width - 275, this.game.height - 100, 0.5, 'joystick');
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

    // Background
    var starfield = this.game.make.bitmapData(600, 600);
    this.starcoder.drawStarField(starfield.ctx, 600, 16);
    this.game.add.tileSprite(wb[0]*ps, wb[1]*ps, (wb[2]-wb[0])*ps, (wb[3]-wb[1])*ps, starfield);

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

//Space.prototype.resize = function () {
//    console.log('resize');
//};

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
};

module.exports = Space;

},{"../phaserbodies/SimpleParticle.js":16,"../phaserbodies/ThrustGenerator.js":18,"../phaserbodies/Toast.js":19,"../phaserplugins/Controls.js":23,"../phaserplugins/SyncClient.js":24,"../phaserui/MiniMap.js":28}],28:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvU3RhcmNvZGVyLWNsaWVudC5qcyIsInNyYy9TdGFyY29kZXIuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvQ29kZUVuZHBvaW50Q2xpZW50LmpzIiwic3JjL2NsaWVudC1jb21wb25lbnRzL0RPTUludGVyZmFjZS5qcyIsInNyYy9jbGllbnQtY29tcG9uZW50cy9TdGFyZmllbGQuanMiLCJzcmMvY2xpZW50LWNvbXBvbmVudHMvV29ybGRBcGkuanMiLCJzcmMvY2xpZW50LmpzIiwic3JjL2NvbW1vbi9QYXRocy5qcyIsInNyYy9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcyIsInNyYy9waGFzZXJib2RpZXMvQXN0ZXJvaWQuanMiLCJzcmMvcGhhc2VyYm9kaWVzL0J1bGxldC5qcyIsInNyYy9waGFzZXJib2RpZXMvQ3J5c3RhbC5qcyIsInNyYy9waGFzZXJib2RpZXMvR2VuZXJpY09yYi5qcyIsInNyYy9waGFzZXJib2RpZXMvUGxhbmV0b2lkLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TaGlwLmpzIiwic3JjL3BoYXNlcmJvZGllcy9TaW1wbGVQYXJ0aWNsZS5qcyIsInNyYy9waGFzZXJib2RpZXMvU3luY0JvZHlJbnRlcmZhY2UuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1RocnVzdEdlbmVyYXRvci5qcyIsInNyYy9waGFzZXJib2RpZXMvVG9hc3QuanMiLCJzcmMvcGhhc2VyYm9kaWVzL1RyYWN0b3JCZWFtLmpzIiwic3JjL3BoYXNlcmJvZGllcy9UcmVlLmpzIiwic3JjL3BoYXNlcmJvZGllcy9WZWN0b3JTcHJpdGUuanMiLCJzcmMvcGhhc2VycGx1Z2lucy9Db250cm9scy5qcyIsInNyYy9waGFzZXJwbHVnaW5zL1N5bmNDbGllbnQuanMiLCJzcmMvcGhhc2Vyc3RhdGVzL0Jvb3QuanMiLCJzcmMvcGhhc2Vyc3RhdGVzL0xvZ2luLmpzIiwic3JjL3BoYXNlcnN0YXRlcy9TcGFjZS5qcyIsInNyYy9waGFzZXJ1aS9NaW5pTWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogU3RhcmNvZGVyLWNsaWVudC5qc1xuICpcbiAqIFN0YXJjb2RlciBtYXN0ZXIgb2JqZWN0IGV4dGVuZGVkIHdpdGggY2xpZW50IG9ubHkgcHJvcGVydGllcyBhbmQgbWV0aG9kc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgV29ybGRBcGkgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL1dvcmxkQXBpLmpzJyk7XG52YXIgRE9NSW50ZXJmYWNlID0gcmVxdWlyZSgnLi9jbGllbnQtY29tcG9uZW50cy9ET01JbnRlcmZhY2UuanMnKTtcbnZhciBDb2RlRW5kcG9pbnRDbGllbnQgPSByZXF1aXJlKCcuL2NsaWVudC1jb21wb25lbnRzL0NvZGVFbmRwb2ludENsaWVudC5qcycpO1xudmFyIFN0YXJmaWVsZCA9IHJlcXVpcmUoJy4vY2xpZW50LWNvbXBvbmVudHMvU3RhcmZpZWxkLmpzJyk7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShTdGFyY29kZXIucHJvdG90eXBlLCBXb3JsZEFwaS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJjb2Rlci5wcm90b3R5cGUsIERPTUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJjb2Rlci5wcm90b3R5cGUsIENvZGVFbmRwb2ludENsaWVudC5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFN0YXJjb2Rlci5wcm90b3R5cGUsIFN0YXJmaWVsZC5wcm90b3R5cGUpO1xuXG52YXIgc3RhdGVzID0ge1xuICAgIGJvb3Q6IHJlcXVpcmUoJy4vcGhhc2Vyc3RhdGVzL0Jvb3QuanMnKSxcbiAgICBzcGFjZTogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvU3BhY2UuanMnKSxcbiAgICBsb2dpbjogcmVxdWlyZSgnLi9waGFzZXJzdGF0ZXMvTG9naW4uanMnKVxufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW8gPSBpbztcbiAgICB0aGlzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoMTgwMCwgOTUwLCBQaGFzZXIuQVVUTywgJ21haW4nKTtcbiAgICAvL3RoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSgxODAwLCA5NTAsIFBoYXNlci5DQU5WQVMsICdtYWluJyk7XG4gICAgdGhpcy5nYW1lLmZvcmNlU2luZ2xlVXBkYXRlID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUuc3RhcmNvZGVyID0gdGhpcztcbiAgICBmb3IgKHZhciBrIGluIHN0YXRlcykge1xuICAgICAgICB2YXIgc3RhdGUgPSBuZXcgc3RhdGVzW2tdKCk7XG4gICAgICAgIHN0YXRlLnN0YXJjb2RlciA9IHRoaXM7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoaywgc3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLmNtZFF1ZXVlID0gW107XG4gICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmxhc3ROZXRFcnJvciA9IG51bGw7XG4gICAgdGhpcy5pbml0RE9NSW50ZXJmYWNlKCk7XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLnNlcnZlckNvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghdGhpcy5zb2NrZXQpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuc29ja2V0O1xuICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxhc3ROZXRFcnJvciA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuc29ja2V0ID0gdGhpcy5pbyh0aGlzLmNvbmZpZy5zZXJ2ZXJVcmksIHRoaXMuY29uZmlnLmlvQ2xpZW50T3B0aW9ucyk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygnc29ja2V0IGNvbm5lY3RlZCcpO1xuICAgICAgICBzZWxmLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHNlbGYubGFzdE5ldEVycm9yID0gbnVsbDtcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbignZXJyb3InLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ3NvY2tldCBlcnJvcicpO1xuICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgIHRoaXMubGFzdE5ldEVycm9yID0gZGF0YTtcbiAgICB9KTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuc2VydmVyTG9naW4gPSBmdW5jdGlvbiAodXNlcm5hbWUsIHBhc3N3b3JkKSB7XG4gICAgdmFyIGxvZ2luID0ge307XG4gICAgaWYgKCFwYXNzd29yZCkge1xuICAgICAgICAvLyBHdWVzdCBsb2dpblxuICAgICAgICBsb2dpbi5nYW1lcnRhZyA9IHVzZXJuYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2luLnVzZXJuYW1lID0gdXNlcm5hbWU7XG4gICAgICAgIGxvZ2luLnBhc3N3b3JkID0gcGFzc3dvcmQ7XG4gICAgfVxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ2xvZ2luJywgbG9naW4pO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ2Jvb3QnKTtcbn07XG5cblN0YXJjb2Rlci5wcm90b3R5cGUuYXR0YWNoUGx1Z2luID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBwbHVnaW4gPSB0aGlzLmdhbWUucGx1Z2lucy5hZGQuYXBwbHkodGhpcy5nYW1lLnBsdWdpbnMsIGFyZ3VtZW50cyk7XG4gICAgcGx1Z2luLnN0YXJjb2RlciA9IHRoaXM7XG4gICAgcGx1Z2luLmxvZyA9IHRoaXMubG9nO1xuICAgIHJldHVybiBwbHVnaW47XG59O1xuXG5TdGFyY29kZXIucHJvdG90eXBlLnJvbGUgPSAnQ2xpZW50JztcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFyY29kZXI7XG4iLCIvKipcbiAqIFN0YXJjb2Rlci5qc1xuICpcbiAqIFNldCB1cCBnbG9iYWwgU3RhcmNvZGVyIG5hbWVzcGFjZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8vdmFyIFN0YXJjb2RlciA9IHtcbi8vICAgIGNvbmZpZzoge1xuLy8gICAgICAgIHdvcmxkQm91bmRzOiBbLTQyMDAsIC00MjAwLCA4NDAwLCA4NDAwXVxuLy9cbi8vICAgIH0sXG4vLyAgICBTdGF0ZXM6IHt9XG4vL307XG5cbnZhciBjb25maWcgPSB7XG4gICAgdmVyc2lvbjogJzAuMScsXG4gICAgc2VydmVyVXJpOiAnaHR0cDovL2xvY2FsaG9zdDo4MDgxJyxcbiAgICAvL3dvcmxkQm91bmRzOiBbLTQyMDAsIC00MjAwLCA4NDAwLCA4NDAwXSxcbiAgICB3b3JsZEJvdW5kczogWy0yMDAsIC0yMDAsIDIwMCwgMjAwXSxcbiAgICBpb0NsaWVudE9wdGlvbnM6IHtcbiAgICAgICAgLy9mb3JjZU5ldzogdHJ1ZVxuICAgICAgICByZWNvbm5lY3Rpb246IGZhbHNlXG4gICAgfSxcbiAgICB1cGRhdGVJbnRlcnZhbDogNTAsXG4gICAgcmVuZGVyTGF0ZW5jeTogMTAwLFxuICAgIHBoeXNpY3NTY2FsZTogMjAsXG4gICAgZnJhbWVSYXRlOiAoMSAvIDYwKSxcbiAgICB0aW1lU3luY0ZyZXE6IDEwLFxuICAgIHBoeXNpY3NQcm9wZXJ0aWVzOiB7XG4gICAgICAgIFNoaXA6IHtcbiAgICAgICAgICAgIG1hc3M6IDEwXG4gICAgICAgIH0sXG4gICAgICAgIEFzdGVyb2lkOiB7XG4gICAgICAgICAgICBtYXNzOiAyMFxuICAgICAgICB9XG4gICAgfSxcbiAgICBnYW1lclRhZ3M6IHtcbiAgICAgICAgMTogW1xuICAgICAgICAgICAgJ3N1cGVyJyxcbiAgICAgICAgICAgICdhd2Vzb21lJyxcbiAgICAgICAgICAgICdyYWluYm93JyxcbiAgICAgICAgICAgICdkb3VibGUnLFxuICAgICAgICAgICAgJ3RyaXBsZScsXG4gICAgICAgICAgICAndmFtcGlyZScsXG4gICAgICAgICAgICAncHJpbmNlc3MnLFxuICAgICAgICAgICAgJ2ljZScsXG4gICAgICAgICAgICAnZmlyZScsXG4gICAgICAgICAgICAncm9ib3QnLFxuICAgICAgICAgICAgJ3dlcmV3b2xmJyxcbiAgICAgICAgICAgICdzcGFya2xlJyxcbiAgICAgICAgICAgICdpbmZpbml0ZScsXG4gICAgICAgICAgICAnY29vbCcsXG4gICAgICAgICAgICAneW9sbycsXG4gICAgICAgICAgICAnc3dhZ2d5J1xuICAgICAgICBdLFxuICAgICAgICAyOiBbXG4gICAgICAgICAgICAndGlnZXInLFxuICAgICAgICAgICAgJ25pbmphJyxcbiAgICAgICAgICAgICdwcmluY2VzcycsXG4gICAgICAgICAgICAncm9ib3QnLFxuICAgICAgICAgICAgJ3BvbnknLFxuICAgICAgICAgICAgJ2RhbmNlcicsXG4gICAgICAgICAgICAncm9ja2VyJyxcbiAgICAgICAgICAgICdtYXN0ZXInLFxuICAgICAgICAgICAgJ2hhY2tlcicsXG4gICAgICAgICAgICAncmFpbmJvdycsXG4gICAgICAgICAgICAna2l0dGVuJyxcbiAgICAgICAgICAgICdwdXBweScsXG4gICAgICAgICAgICAnYm9zcydcbiAgICAgICAgXVxuICAgIH0sXG4gICAgaW5pdGlhbEJvZGllczogW1xuICAgICAgICB7dHlwZTogJ0FzdGVyb2lkJywgbnVtYmVyOiAyNSwgY29uZmlnOiB7XG4gICAgICAgICAgICBwb3NpdGlvbjoge3JhbmRvbTogJ3dvcmxkJ30sXG4gICAgICAgICAgICB2ZWxvY2l0eToge3JhbmRvbTogJ3ZlY3RvcicsIGxvOiAtMTAsIGhpOiAxMH0sXG4gICAgICAgICAgICBhbmd1bGFyVmVsb2NpdHk6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAtNSwgaGk6IDV9LFxuICAgICAgICAgICAgdmVjdG9yU2NhbGU6IHtyYW5kb206ICdmbG9hdCcsIGxvOiAwLjYsIGhpOiAxLjR9LFxuICAgICAgICAgICAgbWFzczogMTBcbiAgICAgICAgfX0sXG4gICAgICAgIC8ve3R5cGU6ICdDcnlzdGFsJywgbnVtYmVyOiAxMCwgY29uZmlnOiB7XG4gICAgICAgIC8vICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnfSxcbiAgICAgICAgLy8gICAgdmVsb2NpdHk6IHtyYW5kb206ICd2ZWN0b3InLCBsbzogLTQsIGhpOiA0LCBub3JtYWw6IHRydWV9LFxuICAgICAgICAvLyAgICB2ZWN0b3JTY2FsZToge3JhbmRvbTogJ2Zsb2F0JywgbG86IDAuNCwgaGk6IDAuOH0sXG4gICAgICAgIC8vICAgIG1hc3M6IDVcbiAgICAgICAgLy99fVxuICAgICAgICB7dHlwZTogJ0h5ZHJhJywgbnVtYmVyOiAxLCBjb25maWc6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDUwfVxuICAgICAgICB9fSxcbiAgICAgICAge3R5cGU6ICdQbGFuZXRvaWQnLCBudW1iZXI6IDYsIGNvbmZpZzoge1xuICAgICAgICAgICAgcG9zaXRpb246IHtyYW5kb206ICd3b3JsZCcsIHBhZDogMzB9LFxuICAgICAgICAgICAgYW5ndWxhclZlbG9jaXR5OiB7cmFuZG9tOiAnZmxvYXQnLCBsbzogLTIsIGhpOiAyfSxcbiAgICAgICAgICAgIHZlY3RvclNjYWxlOiAyLjUsXG4gICAgICAgICAgICBtYXNzOiAxMDBcbiAgICAgICAgfX0sXG4gICAgICAgIC8vIEZJWE1FOiBUcmVlcyBqdXN0IGZvciB0ZXN0aW5nXG4gICAgICAgIC8ve3R5cGU6ICdUcmVlJywgbnVtYmVyOiAxMCwgY29uZmlnOiB7XG4gICAgICAgIC8vICAgIHBvc2l0aW9uOiB7cmFuZG9tOiAnd29ybGQnLCBwYWQ6IDMwfSxcbiAgICAgICAgLy8gICAgdmVjdG9yU2NhbGU6IDEsXG4gICAgICAgIC8vICAgIG1hc3M6IDVcbiAgICAgICAgLy99fVxuICAgIF1cbn07XG5cbnZhciBTdGFyY29kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgLy8gSW5pdGlhbGl6ZXJzIHZpcnR1YWxpemVkIGFjY29yZGluZyB0byByb2xlXG4gICAgdGhpcy5iYW5uZXIoKTtcbiAgICB0aGlzLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAvL3RoaXMuaW5pdE5ldC5jYWxsKHRoaXMpO1xufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5leHRlbmRDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgZm9yICh2YXIgayBpbiBjb25maWcpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWdba10gPSBjb25maWdba107XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vLyBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgY29tbW9uIGNvbmZpZyBvcHRpb25zXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAnd29ybGRXaWR0aCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzJdIC0gdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyV2lkdGgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiAodGhpcy5jb25maWcud29ybGRCb3VuZHNbMl0gLSB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1swXSk7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAnd29ybGRIZWlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RhcmNvZGVyLnByb3RvdHlwZSwgJ3BoYXNlckhlaWdodCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBoeXNpY3NTY2FsZSAqICh0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXSAtIHRoaXMuY29uZmlnLndvcmxkQm91bmRzWzFdKTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJMZWZ0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMF07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyVG9wJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGh5c2ljc1NjYWxlICogdGhpcy5jb25maWcud29ybGRCb3VuZHNbMV07XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdGFyY29kZXIucHJvdG90eXBlLCAncGhhc2VyUmlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1syXTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0YXJjb2Rlci5wcm90b3R5cGUsICdwaGFzZXJCb3R0b20nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5waHlzaWNzU2NhbGUgKiB0aGlzLmNvbmZpZy53b3JsZEJvdW5kc1szXTtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBBZGQgbWl4aW4gcHJvcGVydGllcyB0byB0YXJnZXQuIEFkYXB0ZWQgKHNsaWdodGx5KSBmcm9tIFBoYXNlclxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXRcbiAqIEBwYXJhbSB7b2JqZWN0fSBtaXhpblxuICovXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUgPSBmdW5jdGlvbiAodGFyZ2V0LCBtaXhpbikge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobWl4aW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgdmFyIHZhbCA9IG1peGluW2tleV07XG4gICAgICAgIGlmICh2YWwgJiZcbiAgICAgICAgICAgICh0eXBlb2YgdmFsLmdldCA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgdmFsLnNldCA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgdmFsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gdmFsO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuU3RhcmNvZGVyLnByb3RvdHlwZS5iYW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5sb2coJ1N0YXJjb2RlcicsIHRoaXMucm9sZSwgJ3YnICsgdGhpcy5jb25maWcudmVyc2lvbiwgJ3N0YXJ0ZWQgYXQnLCBEYXRlKCkpO1xufVxuXG4vKipcbiAqIEN1c3RvbSBsb2dnaW5nIGZ1bmN0aW9uIHRvIGJlIGZlYXR1cmVmaWVkIGFzIG5lY2Vzc2FyeVxuICovXG5TdGFyY29kZXIucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhcmNvZGVyO1xuIiwiLyoqXG4gKiBDb2RlRW5kcG9pbnRDbGllbnQuanNcbiAqXG4gKiBNZXRob2RzIGZvciBzZW5kaW5nIGNvZGUgdG8gc2VydmVyIGFuZCBkZWFsaW5nIHdpdGggY29kZSByZWxhdGVkIHJlc3BvbnNlc1xuICovXG5cbnZhciBDb2RlRW5kcG9pbnRDbGllbnQgPSBmdW5jdGlvbiAoKSB7fTtcblxuQ29kZUVuZHBvaW50Q2xpZW50LnByb3RvdHlwZS5zZW5kQ29kZSA9IGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnY29kZScsIGNvZGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2RlRW5kcG9pbnRDbGllbnQ7IiwiLyoqXG4gKiBET01JbnRlcmZhY2UuanNcbiAqXG4gKiBIYW5kbGUgRE9NIGNvbmZpZ3VyYXRpb24vaW50ZXJhY3Rpb24sIGkuZS4gbm9uLVBoYXNlciBzdHVmZlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBET01JbnRlcmZhY2UgPSBmdW5jdGlvbiAoKSB7fTtcblxuRE9NSW50ZXJmYWNlLnByb3RvdHlwZS5pbml0RE9NSW50ZXJmYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLmRvbSA9IHt9OyAgICAgICAgICAgICAgLy8gbmFtZXNwYWNlXG4gICAgdGhpcy5kb20uY29kZUJ1dHRvbiA9ICQoJyNjb2RlLWJ0bicpO1xuICAgIHRoaXMuZG9tLmNvZGVQb3B1cCA9ICQoJyNjb2RlLXBvcHVwJyk7XG4gICAgdGhpcy5kb20ubG9naW5Qb3B1cD0gJCgnI2xvZ2luJyk7XG4gICAgdGhpcy5kb20ubG9naW5CdXR0b24gPSAkKCcjc3VibWl0Jyk7XG5cbiAgICB0aGlzLmRvbS5jb2RlQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5kb20uY29kZVBvcHVwLnRvZ2dsZSgnc2xvdycpO1xuICAgIH0pO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5zb3VyY2UgPT09IHNlbGYuZG9tLmNvZGVQb3B1cC5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICBzZWxmLnNlbmRDb2RlKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL3RoaXMuZG9tLmNvZGVQb3B1cC5oaWRlKCk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gMjsgaSsrKSB7XG4gICAgICAgIHZhciB0YWdzID0gdGhpcy5jb25maWcuZ2FtZXJUYWdzW2ldO1xuICAgICAgICBmb3IgKHZhciBqID0gMCwgbCA9IHRhZ3MubGVuZ3RoOyBqIDwgbDsgaisrKSB7XG4gICAgICAgICAgICAkKCcjZ3QnICsgaSkuYXBwZW5kKCc8b3B0aW9uPicgKyB0YWdzW2pdICsgJzwvb3B0aW9uPicpO1xuICAgICAgICB9XG4gICAgfVxuICAgICQoJy5zZWxlY3QnKS5zZWxlY3RtZW51KCk7XG4gICAgJCgnLmxvZ2luYnV0dG9uJykuYnV0dG9uKHtpY29uczoge3ByaW1hcnk6ICd1aS1pY29uLXRyaWFuZ2xlLTEtZSd9fSk7XG5cbiAgICAkKCcuYWNjb3JkaW9uJykuYWNjb3JkaW9uKHtoZWlnaHRTdHlsZTogJ2NvbnRlbnQnfSk7XG4gICAgJCgnLnBvcHVwJykuaGlkZSgpO1xuXG59O1xuXG4vKipcbiAqIFNob3cgbG9naW4gYm94IGFuZCB3aXJlIHVwIGhhbmRsZXJzXG4gKi9cbkRPTUludGVyZmFjZS5wcm90b3R5cGUuc2hvd0xvZ2luID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAkKCcjbG9naW4td2luZG93IC5tZXNzYWdlJykuaGlkZSgpO1xuICAgICQoJyNsb2dpbi13aW5kb3cnKS5zaG93KCkucG9zaXRpb24oe215OiAnY2VudGVyJywgYXQ6ICdjZW50ZXInLCBvZjogd2luZG93fSk7XG4gICAgJCgnI3VzZXJsb2dpbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5zZXJ2ZXJMb2dpbigkKCcjdXNlcm5hbWUnKS52YWwoKSwgJCgnI3Bhc3N3b3JkJykudmFsKCkpO1xuICAgIH0pO1xuICAgICQoJyNndWVzdGxvZ2luJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnNlcnZlckxvZ2luKCQoJyNndDEnKS52YWwoKSArICcgJyArICQoJyNndDInKS52YWwoKSk7XG4gICAgfSk7XG59O1xuXG5ET01JbnRlcmZhY2UucHJvdG90eXBlLnNldExvZ2luRXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICB2YXIgbXNnID0gJCgnI2xvZ2luLXdpbmRvdyAubWVzc2FnZScpO1xuICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgbXNnLmhpZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBtc2cuaHRtbChlcnJvcik7XG4gICAgICAgIG1zZy5zaG93KCk7XG4gICAgfVxufTtcblxuRE9NSW50ZXJmYWNlLnByb3RvdHlwZS5oaWRlTG9naW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgJCgnI2xvZ2luLXdpbmRvdycpLmhpZGUoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRE9NSW50ZXJmYWNlO1xuIiwiLyoqXG4gKiBNZXRob2QgZm9yIGRyYXdpbmcgc3RhcmZpZWxkc1xuICovXG5cbnZhciBTdGFyZmllbGQgPSBmdW5jdGlvbiAoKSB7fTtcblxuU3RhcmZpZWxkLnByb3RvdHlwZS5yYW5kb21Ob3JtYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHQgPSAwO1xuICAgIGZvciAodmFyIGk9MDsgaTw2OyBpKyspIHtcbiAgICAgICAgdCArPSB0aGlzLmdhbWUucm5kLm5vcm1hbCgpO1xuICAgIH1cbiAgICByZXR1cm4gdC82O1xufTtcblxuU3RhcmZpZWxkLnByb3RvdHlwZS5kcmF3U3RhciA9IGZ1bmN0aW9uIChjdHgsIHgsIHksIGQsIGNvbG9yKSB7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8oeC1kKzEsIHktZCsxKTtcbiAgICBjdHgubGluZVRvKHgrZC0xLCB5K2QtMSk7XG4gICAgY3R4Lm1vdmVUbyh4LWQrMSwgeStkLTEpO1xuICAgIGN0eC5saW5lVG8oeCtkLTEsIHktZCsxKTtcbiAgICBjdHgubW92ZVRvKHgsIHktZCk7XG4gICAgY3R4LmxpbmVUbyh4LCB5K2QpO1xuICAgIGN0eC5tb3ZlVG8oeC1kLCB5KTtcbiAgICBjdHgubGluZVRvKHgrZCwgeSk7XG4gICAgY3R4LnN0cm9rZSgpO1xufTtcblxuU3RhcmZpZWxkLnByb3RvdHlwZS5kcmF3U3RhckZpZWxkID0gZnVuY3Rpb24gKGN0eCwgc2l6ZSwgbikge1xuICAgIHZhciB4bSA9IE1hdGgucm91bmQoc2l6ZS8yICsgdGhpcy5yYW5kb21Ob3JtYWwoKSpzaXplLzQpO1xuICAgIHZhciB5bSA9IE1hdGgucm91bmQoc2l6ZS8yICsgdGhpcy5yYW5kb21Ob3JtYWwoKSpzaXplLzQpO1xuICAgIHZhciBxdWFkcyA9IFtbMCwwLHhtLTEseW0tMV0sIFt4bSwwLHNpemUtMSx5bS0xXSxcbiAgICAgICAgWzAseW0seG0tMSxzaXplLTFdLCBbeG0seW0sc2l6ZS0xLHNpemUtMV1dO1xuICAgIHZhciBjb2xvcjtcbiAgICB2YXIgaSwgaiwgbCwgcTtcblxuICAgIG4gPSBNYXRoLnJvdW5kKG4vNCk7XG4gICAgZm9yIChpPTAsIGw9cXVhZHMubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgICAgICBxID0gcXVhZHNbaV07XG4gICAgICAgIGZvciAoaj0wOyBqPG47IGorKykge1xuICAgICAgICAgICAgY29sb3IgPSAnaHNsKDYwLDEwMCUsJyArIHRoaXMuZ2FtZS5ybmQuYmV0d2Vlbig5MCw5OSkgKyAnJSknO1xuICAgICAgICAgICAgdGhpcy5kcmF3U3RhcihjdHgsXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnJuZC5iZXR3ZWVuKHFbMF0rNywgcVsyXS03KSwgdGhpcy5nYW1lLnJuZC5iZXR3ZWVuKHFbMV0rNywgcVszXS03KSxcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUucm5kLmJldHdlZW4oMiw0KSwgY29sb3IpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFyZmllbGQ7XG4iLCIvKipcbiAqIFdvcmxkQXBpLmpzXG4gKlxuICogQWRkL3JlbW92ZS9tYW5pcHVsYXRlIGJvZGllcyBpbiBjbGllbnQncyBwaHlzaWNzIHdvcmxkXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFdvcmxkQXBpID0gZnVuY3Rpb24gKCkge307XG5cbnZhciBib2R5VHlwZXMgPSB7XG4gICAgU2hpcDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1NoaXAuanMnKSxcbiAgICBBc3Rlcm9pZDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0FzdGVyb2lkLmpzJyksXG4gICAgQ3J5c3RhbDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL0NyeXN0YWwuanMnKSxcbiAgICBCdWxsZXQ6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9CdWxsZXQuanMnKSxcbiAgICBHZW5lcmljT3JiOiByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvR2VuZXJpY09yYi5qcycpLFxuICAgIFBsYW5ldG9pZDogcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1BsYW5ldG9pZC5qcycpLFxuICAgIFRyZWU6IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9UcmVlLmpzJyksXG4gICAgVHJhY3RvckJlYW06IHJlcXVpcmUoJy4uL3BoYXNlcmJvZGllcy9UcmFjdG9yQmVhbS5qcycpXG59O1xuXG4vKipcbiAqIEFkZCBib2R5IHRvIHdvcmxkIG9uIGNsaWVudCBzaWRlXG4gKlxuICogQHBhcmFtIHR5cGUge3N0cmluZ30gLSB0eXBlIG5hbWUgb2Ygb2JqZWN0IHRvIGFkZFxuICogQHBhcmFtIGNvbmZpZyB7b2JqZWN0fSAtIHByb3BlcnRpZXMgZm9yIG5ldyBvYmplY3RcbiAqIEByZXR1cm5zIHtQaGFzZXIuU3ByaXRlfSAtIG5ld2x5IGFkZGVkIG9iamVjdFxuICovXG5cbldvcmxkQXBpLnByb3RvdHlwZS5hZGRCb2R5ID0gZnVuY3Rpb24gKHR5cGUsIGNvbmZpZykge1xuICAgIHZhciBjdG9yID0gYm9keVR5cGVzW3R5cGVdO1xuICAgIHZhciBwbGF5ZXJTaGlwID0gZmFsc2U7XG4gICAgaWYgKCFjdG9yKSB7XG4gICAgICAgIHRoaXMubG9nKCdVbmtub3duIGJvZHkgdHlwZTonLCB0eXBlKTtcbiAgICAgICAgdGhpcy5sb2coY29uZmlnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PT0gJ1NoaXAnICYmIGNvbmZpZy5wcm9wZXJ0aWVzLnBsYXllcmlkID09PSB0aGlzLnBsYXllci5pZCkge1xuICAgICAgICBjb25maWcudGFnID0gdGhpcy5wbGF5ZXIudXNlcm5hbWU7XG4gICAgICAgIC8vIE9ubHkgdGhlIHBsYXllcidzIG93biBzaGlwIGlzIHRyZWF0ZWQgYXMgZHluYW1pYyBpbiB0aGUgbG9jYWwgcGh5c2ljcyBzaW1cbiAgICAgICAgY29uZmlnLm1hc3MgPSB0aGlzLmNvbmZpZy5waHlzaWNzUHJvcGVydGllcy5TaGlwLm1hc3M7XG4gICAgICAgIHBsYXllclNoaXAgPSB0cnVlO1xuICAgIH1cbiAgICB2YXIgYm9keSA9IG5ldyBjdG9yKHRoaXMuZ2FtZSwgY29uZmlnKTtcbiAgICAvL3RoaXMuZ2FtZS5hZGQuZXhpc3RpbmcoYm9keSk7XG4gICAgdGhpcy5nYW1lLnBsYXlmaWVsZC5hZGQoYm9keSk7XG4gICAgaWYgKHBsYXllclNoaXApIHtcbiAgICAgICAgdGhpcy5nYW1lLmNhbWVyYS5mb2xsb3coYm9keSk7XG4gICAgICAgIHRoaXMuZ2FtZS5wbGF5ZXJTaGlwID0gYm9keTtcbiAgICB9XG4gICAgcmV0dXJuIGJvZHk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBib2R5IGZyb20gZ2FtZSB3b3JsZFxuICpcbiAqIEBwYXJhbSBzcHJpdGUge1BoYXNlci5TcHJpdGV9IC0gb2JqZWN0IHRvIHJlbW92ZVxuICovXG5Xb3JsZEFwaS5wcm90b3R5cGUucmVtb3ZlQm9keSA9IGZ1bmN0aW9uIChzcHJpdGUpIHtcbiAgICBzcHJpdGUua2lsbCgpO1xuICAgIC8vIFJlbW92ZSBtaW5pc3ByaXRlXG4gICAgaWYgKHNwcml0ZS5taW5pc3ByaXRlKSB7XG4gICAgICAgIHNwcml0ZS5taW5pc3ByaXRlLmtpbGwoKTtcbiAgICB9XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MucDIucmVtb3ZlQm9keShzcHJpdGUuYm9keSk7XG59O1xuXG4vKipcbiAqIENvbmZpZ3VyZSBvYmplY3Qgd2l0aCBnaXZlbiBwcm9wZXJ0aWVzXG4gKlxuICogQHBhcmFtIHByb3BlcnRpZXMge29iamVjdH1cbiAqL1xuLy9Xb3JsZEFwaS5wcm90b3R5cGUuY29uZmlndXJlID0gZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcbi8vICAgIGZvciAodmFyIGsgaW4gdGhpcy51cGRhdGVQcm9wZXJ0aWVzKSB7XG4vLyAgICAgICAgdGhpc1trXSA9IHByb3BlcnRpZXNba107XG4vLyAgICB9XG4vL307XG5cbm1vZHVsZS5leHBvcnRzID0gV29ybGRBcGk7XG4iLCIvKiogY2xpZW50LmpzXG4gKlxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgU3RhcmNvZGVyIGdhbWUgY2xpZW50XG4gKlxuICogQHR5cGUge1N0YXJjb2RlcnxleHBvcnRzfVxuICovXG5cbi8vcmVxdWlyZSgnLi9CbG9ja2x5Q3VzdG9tLmpzJyk7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxuXG5sb2NhbFN0b3JhZ2UuZGVidWcgPSAnJzsgICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2VkIHRvIHRvZ2dsZSBzb2NrZXQuaW8gZGVidWdnaW5nXG5cbi8vZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbi8vICAgIHZhciBzdGFyY29kZXIgPSBuZXcgU3RhcmNvZGVyKCk7XG4vLyAgICBzdGFyY29kZXIuc3RhcnQoKTtcbi8vfSk7XG5cbiQoZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdGFyY29kZXIgPSBuZXcgU3RhcmNvZGVyKCk7XG4gICAgc3RhcmNvZGVyLnN0YXJ0KCk7XG59KTtcbiIsIi8qKlxuICogUGF0aC5qc1xuICpcbiAqIFZlY3RvciBwYXRocyBzaGFyZWQgYnkgbXVsdGlwbGUgZWxlbWVudHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLm9jdGFnb24gPSBbXG4gICAgWzIsMV0sXG4gICAgWzEsMl0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwxXSxcbiAgICBbLTIsLTFdLFxuICAgIFstMSwtMl0sXG4gICAgWzEsLTJdLFxuICAgIFsyLC0xXVxuXTtcblxuZXhwb3J0cy5kMmNyb3NzID0gW1xuICAgIFstMSwtMl0sXG4gICAgWy0xLDJdLFxuICAgIFsyLC0xXSxcbiAgICBbLTIsLTFdLFxuICAgIFsxLDJdLFxuICAgIFsxLC0yXSxcbiAgICBbLTIsMV0sXG4gICAgWzIsMV1cbl07XG5cbmV4cG9ydHMuc3F1YXJlMCA9IFtcbiAgICBbLTEsLTJdLFxuICAgIFsyLC0xXSxcbiAgICBbMSwyXSxcbiAgICBbLTIsMV1cbl07XG5cbmV4cG9ydHMuc3F1YXJlMSA9IFtcbiAgICBbMSwtMl0sXG4gICAgWzIsMV0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwtMV1cbl07XG5cbmV4cG9ydHMuT0NUUkFESVVTID0gTWF0aC5zcXJ0KDUpOyIsIi8qKlxuICogVXBkYXRlUHJvcGVydGllcy5qc1xuICpcbiAqIENsaWVudC9zZXJ2ZXIgc3luY2FibGUgcHJvcGVydGllcyBmb3IgZ2FtZSBvYmplY3RzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNoaXAgPSBmdW5jdGlvbiAoKSB7fTtcblNoaXAucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ2xpbmVXaWR0aCcsICdsaW5lQ29sb3InLCAnZmlsbENvbG9yJywgJ2ZpbGxBbHBoYScsXG4gICAgJ3ZlY3RvclNjYWxlJywgJ3NoYXBlJywgJ3NoYXBlQ2xvc2VkJywgJ3BsYXllcmlkJywgJ2NyeXN0YWxzJywgJ2RlYWQnXTtcblxudmFyIEFzdGVyb2lkID0gZnVuY3Rpb24gKCkge307XG5Bc3Rlcm9pZC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFsndmVjdG9yU2NhbGUnXTtcblxudmFyIENyeXN0YWwgPSBmdW5jdGlvbiAoKSB7fTtcbkNyeXN0YWwucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3ZlY3RvclNjYWxlJ107XG5cbnZhciBHZW5lcmljT3JiID0gZnVuY3Rpb24gKCkge307XG5HZW5lcmljT3JiLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lQ29sb3InLCAndmVjdG9yU2NhbGUnXTtcblxudmFyIFBsYW5ldG9pZCA9IGZ1bmN0aW9uICgpIHt9O1xuUGxhbmV0b2lkLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gWydsaW5lQ29sb3InLCAnZmlsbENvbG9yJywgJ2xpbmVXaWR0aCcsICdmaWxsQWxwaGEnLCAndmVjdG9yU2NhbGUnLCAnb3duZXInXTtcblxudmFyIFRyZWUgPSBmdW5jdGlvbiAoKSB7fTtcblRyZWUucHJvdG90eXBlLnVwZGF0ZVByb3BlcnRpZXMgPSBbJ3ZlY3RvclNjYWxlJywgJ2xpbmVDb2xvcicsICdncmFwaCcsICdzdGVwJywgJ2RlcHRoJ107XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoKSB7fTtcbkJ1bGxldC5wcm90b3R5cGUudXBkYXRlUHJvcGVydGllcyA9IFtdO1xuXG52YXIgVHJhY3RvckJlYW0gPSBmdW5jdGlvbiAoKSB7fTtcblRyYWN0b3JCZWFtLnByb3RvdHlwZS51cGRhdGVQcm9wZXJ0aWVzID0gW107XG5cblxuZXhwb3J0cy5TaGlwID0gU2hpcDtcbmV4cG9ydHMuQXN0ZXJvaWQgPSBBc3Rlcm9pZDtcbmV4cG9ydHMuQ3J5c3RhbCA9IENyeXN0YWw7XG5leHBvcnRzLkdlbmVyaWNPcmIgPSBHZW5lcmljT3JiO1xuZXhwb3J0cy5CdWxsZXQgPSBCdWxsZXQ7XG5leHBvcnRzLlBsYW5ldG9pZCA9IFBsYW5ldG9pZDtcbmV4cG9ydHMuVHJlZSA9IFRyZWU7XG5leHBvcnRzLlRyYWN0b3JCZWFtID0gVHJhY3RvckJlYW07XG4iLCIvKipcbiAqIEFzdGVyb2lkLmpzXG4gKlxuICogQ2xpZW50IHNpZGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLkFzdGVyb2lkO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBBc3Rlcm9pZCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbiAgICAvL3RoaXMuYm9keS5kYW1waW5nID0gMDtcbn07XG5cbkFzdGVyb2lkLmFkZCA9IGZ1bmN0aW9uIChnYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIGEgPSBuZXcgQXN0ZXJvaWQoZ2FtZSwgb3B0aW9ucyk7XG4gICAgZ2FtZS5hZGQuZXhpc3RpbmcoYSk7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5Bc3Rlcm9pZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuQXN0ZXJvaWQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQXN0ZXJvaWQ7XG5cblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShBc3Rlcm9pZC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQXN0ZXJvaWQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkFzdGVyb2lkLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZjAwZmYnO1xuQXN0ZXJvaWQucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwZmYwMCc7XG5Bc3Rlcm9pZC5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fbGluZVdpZHRoID0gMTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4yNTtcbkFzdGVyb2lkLnByb3RvdHlwZS5fc2hhcGUgPSBQYXRocy5vY3RhZ29uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFzdGVyb2lkO1xuLy9TdGFyY29kZXIuQXN0ZXJvaWQgPSBBc3Rlcm9pZDtcbiIsIi8qKlxuICogQnVsbGV0LmpzXG4gKlxuICogQ2xpZW50IHNpZGUgaW1wbGVtZW50YXRpb24gb2Ygc2ltcGxlIHByb2plY3RpbGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBTaW1wbGVQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vU2ltcGxlUGFydGljbGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5CdWxsZXQ7XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgU2ltcGxlUGFydGljbGUuY2FsbCh0aGlzLCBnYW1lLCAnYnVsbGV0Jyk7XG4gICAgdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkJ1bGxldC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZSk7XG5CdWxsZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQnVsbGV0O1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoQnVsbGV0LnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShCdWxsZXQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0OyIsIi8qKlxuICogQ3J5c3RhbC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuQ3J5c3RhbDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgQ3J5c3RhbCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbn07XG5cbkNyeXN0YWwuYWRkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIHZhciBhID0gbmV3IENyeXN0YWwoZ2FtZSwgY29uZmlnKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gYTtcbn07XG5cbkNyeXN0YWwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcbkNyeXN0YWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ3J5c3RhbDtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKENyeXN0YWwucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKENyeXN0YWwucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbkNyeXN0YWwucHJvdG90eXBlLl9saW5lQ29sb3IgPSAnIzAwZmZmZic7XG5DcnlzdGFsLnByb3RvdHlwZS5fZmlsbENvbG9yID0gJyMwMDAwMDAnO1xuQ3J5c3RhbC5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcbkNyeXN0YWwucHJvdG90eXBlLl9saW5lV2lkdGggPSAxO1xuQ3J5c3RhbC5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMDtcbkNyeXN0YWwucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5DcnlzdGFsLnByb3RvdHlwZS5fZ2VvbWV0cnkgPSBbXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLmQyY3Jvc3N9XG5dO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQ3J5c3RhbDtcbiIsIi8qKlxuICogR2VuZXJpY09yYi5qc1xuICpcbiAqIEJ1aWxkaW5nIGJsb2NrXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uL1N0YXJjb2Rlci5qcycpO1xuXG52YXIgVmVjdG9yU3ByaXRlID0gcmVxdWlyZSgnLi9WZWN0b3JTcHJpdGUuanMnKTtcbnZhciBTeW5jQm9keUludGVyZmFjZSA9IHJlcXVpcmUoJy4vU3luY0JvZHlJbnRlcmZhY2UuanMnKTtcbnZhciBVcGRhdGVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL1VwZGF0ZVByb3BlcnRpZXMuanMnKS5HZW5lcmljT3JiO1xudmFyIFBhdGhzID0gcmVxdWlyZSgnLi4vY29tbW9uL1BhdGhzLmpzJyk7XG5cbnZhciBHZW5lcmljT3JiID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG4gICAgLy90aGlzLnNldFBvc0FuZ2xlKGNvbmZpZy54LCBjb25maWcueSwgY29uZmlnLmEpO1xufTtcblxuR2VuZXJpY09yYi5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgdmFyIGEgPSBuZXcgR2VuZXJpY09yYihnYW1lLCBjb25maWcpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKGEpO1xuICAgIHJldHVybiBhO1xufTtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmljT3JiO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoR2VuZXJpY09yYi5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoR2VuZXJpY09yYi5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmYwMDAwJztcbkdlbmVyaWNPcmIucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwMDAwMCc7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fc2hhcGVDbG9zZWQgPSB0cnVlO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5HZW5lcmljT3JiLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4wO1xuR2VuZXJpY09yYi5wcm90b3R5cGUuX3NoYXBlID0gUGF0aHMub2N0YWdvbjtcblxuR2VuZXJpY09yYi5wcm90b3R5cGUuX2dlb21ldHJ5ID0gW1xuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5kMmNyb3NzfVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmljT3JiO1xuIiwiLyoqXG4gKiBQbGFuZXRvaWQuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlBsYW5ldG9pZDtcbnZhciBQYXRocyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9QYXRocy5qcycpO1xuXG52YXIgUGxhbmV0b2lkID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFZlY3RvclNwcml0ZS5jYWxsKHRoaXMsIGdhbWUsIGNvbmZpZyk7XG59O1xuXG5QbGFuZXRvaWQuYWRkID0gZnVuY3Rpb24gKGdhbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgcGxhbmV0b2lkID0gbmV3IFBsYW5ldG9pZChnYW1lLCBvcHRpb25zKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyhhKTtcbiAgICByZXR1cm4gcGxhbmV0b2lkO1xufTtcblxuUGxhbmV0b2lkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSk7XG5QbGFuZXRvaWQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUGxhbmV0b2lkO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoUGxhbmV0b2lkLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShQbGFuZXRvaWQucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbi8vUGxhbmV0b2lkLnByb3RvdHlwZS5fbGluZUNvbG9yID0gJyNmZjAwZmYnO1xuLy9QbGFuZXRvaWQucHJvdG90eXBlLl9maWxsQ29sb3IgPSAnIzAwZmYwMCc7XG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG4vL1BsYW5ldG9pZC5wcm90b3R5cGUuX2ZpbGxBbHBoYSA9IDAuMjU7XG5QbGFuZXRvaWQucHJvdG90eXBlLl9zaGFwZSA9IFBhdGhzLm9jdGFnb247XG5QbGFuZXRvaWQucHJvdG90eXBlLl9zaGFwZUNsb3NlZCA9IHRydWU7XG5QbGFuZXRvaWQucHJvdG90eXBlLl9nZW9tZXRyeSA9IFtcbiAgICB7dHlwZTogJ3BvbHknLCBjbG9zZWQ6IHRydWUsIHBvaW50czogUGF0aHMuZDJjcm9zc30sXG4gICAge3R5cGU6ICdwb2x5JywgY2xvc2VkOiB0cnVlLCBwb2ludHM6IFBhdGhzLnNxdWFyZTB9LFxuICAgIHt0eXBlOiAncG9seScsIGNsb3NlZDogdHJ1ZSwgcG9pbnRzOiBQYXRocy5zcXVhcmUxfVxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGFuZXRvaWQ7XG4iLCIvKipcbiAqIFNoaXAuanNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLmpzJyk7XG5cbnZhciBWZWN0b3JTcHJpdGUgPSByZXF1aXJlKCcuL1ZlY3RvclNwcml0ZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlNoaXA7XG4vL3ZhciBFbmdpbmUgPSByZXF1aXJlKCcuL0VuZ2luZS5qcycpO1xuLy92YXIgV2VhcG9ucyA9IHJlcXVpcmUoJy4vV2VhcG9ucy5qcycpO1xuXG52YXIgU2hpcCA9IGZ1bmN0aW9uIChnYW1lLCBjb25maWcpIHtcbiAgICBWZWN0b3JTcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCBjb25maWcpO1xuICAgIC8vdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcblxuICAgIGlmIChjb25maWcubWFzcykge1xuICAgICAgICB0aGlzLmJvZHkubWFzcyA9IGNvbmZpZy5tYXNzO1xuICAgIH1cbiAgICAvL3RoaXMuZW5naW5lID0gRW5naW5lLmFkZChnYW1lLCAndGhydXN0JywgNTAwKTtcbiAgICAvL3RoaXMuYWRkQ2hpbGQodGhpcy5lbmdpbmUpO1xuICAgIC8vdGhpcy53ZWFwb25zID0gV2VhcG9ucy5hZGQoZ2FtZSwgJ2J1bGxldCcsIDEyKTtcbiAgICAvL3RoaXMud2VhcG9ucy5zaGlwID0gdGhpcztcbiAgICAvL3RoaXMuYWRkQ2hpbGQodGhpcy53ZWFwb25zKTtcbiAgICB0aGlzLnRhZ1RleHQgPSBnYW1lLmFkZC50ZXh0KDAsIHRoaXMudGV4dHVyZS5oZWlnaHQvMiArIDEsXG4gICAgICAgIGNvbmZpZy50YWcsIHtmb250OiAnYm9sZCAxOHB4IEFyaWFsJywgZmlsbDogdGhpcy5saW5lQ29sb3IgfHwgJyNmZmZmZmYnLCBhbGlnbjogJ2NlbnRlcid9KTtcbiAgICB0aGlzLnRhZ1RleHQuYW5jaG9yLnNldFRvKDAuNSwgMCk7XG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLnRhZ1RleHQpO1xuICAgIHRoaXMubG9jYWxTdGF0ZSA9IHtcbiAgICAgICAgdGhydXN0OiAnb2ZmJ1xuICAgIH1cbn07XG5cblNoaXAuYWRkID0gZnVuY3Rpb24gKGdhbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgcyA9IG5ldyBTaGlwKGdhbWUsIG9wdGlvbnMpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHMpO1xuICAgIHJldHVybiBzO1xufTtcblxuU2hpcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZlY3RvclNwcml0ZS5wcm90b3R5cGUpO1xuU2hpcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTaGlwO1xuXG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoU2hpcC5wcm90b3R5cGUsIFN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZSk7XG5TdGFyY29kZXIubWl4aW5Qcm90b3R5cGUoU2hpcC5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxuLy9TaGlwLnByb3RvdHlwZS5zZXRMaW5lU3R5bGUgPSBmdW5jdGlvbiAoY29sb3IsIGxpbmVXaWR0aCkge1xuLy8gICAgU3RhcmNvZGVyLlZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0TGluZVN0eWxlLmNhbGwodGhpcywgY29sb3IsIGxpbmVXaWR0aCk7XG4vLyAgICB0aGlzLnRhZ1RleHQuc2V0U3R5bGUoe2ZpbGw6IGNvbG9yfSk7XG4vL307XG5cbi8vU2hpcC5wcm90b3R5cGUuc2hhcGUgPSBbXG4vLyAgICBbLTEsLTFdLFxuLy8gICAgWy0wLjUsMF0sXG4vLyAgICBbLTEsMV0sXG4vLyAgICBbMCwwLjVdLFxuLy8gICAgWzEsMV0sXG4vLyAgICBbMC41LDBdLFxuLy8gICAgWzEsLTFdLFxuLy8gICAgWzAsLTAuNV0sXG4vLyAgICBbLTEsLTFdXG4vL107XG4vL1NoaXAucHJvdG90eXBlLl9saW5lV2lkdGggPSA2O1xuXG5TaGlwLnByb3RvdHlwZS51cGRhdGVBcHBlYXJhbmNlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEZJWE1FOiBQcm9iYWJseSBuZWVkIHRvIHJlZmFjdG9yIGNvbnN0cnVjdG9yIGEgYml0IHRvIG1ha2UgdGhpcyBjbGVhbmVyXG4gICAgVmVjdG9yU3ByaXRlLnByb3RvdHlwZS51cGRhdGVBcHBlYXJhbmNlLmNhbGwodGhpcyk7XG4gICAgaWYgKHRoaXMudGFnVGV4dCkge1xuICAgICAgICAvL3RoaXMudGFnVGV4dC5zZXRTdHlsZSh7ZmlsbDogdGhpcy5saW5lQ29sb3J9KTtcbiAgICAgICAgdGhpcy50YWdUZXh0LmZpbGwgPSB0aGlzLmxpbmVDb2xvcjtcbiAgICAgICAgdGhpcy50YWdUZXh0LnkgPSB0aGlzLnRleHR1cmUuaGVpZ2h0LzIgKyAxO1xuICAgIH1cbn07XG5cblNoaXAucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBWZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMpO1xuICAgIC8vIEZJWE1FOiBOZWVkIHRvIGRlYWwgd2l0aCBwbGF5ZXIgdmVyc3VzIGZvcmVpZ24gc2hpcHNcbiAgICBzd2l0Y2ggKHRoaXMubG9jYWxTdGF0ZS50aHJ1c3QpIHtcbiAgICAgICAgY2FzZSAnc3RhcnRpbmcnOlxuICAgICAgICAgICAgdGhpcy5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QucGxheSgpO1xuICAgICAgICAgICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvci5zdGFydE9uKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0YXRlLnRocnVzdCA9ICdvbic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2h1dGRvd24nOlxuICAgICAgICAgICAgdGhpcy5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3Quc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5nYW1lLnRocnVzdGdlbmVyYXRvci5zdG9wT24odGhpcyk7XG4gICAgICAgICAgICB0aGlzLmxvY2FsU3RhdGUudGhydXN0ID0gJ29mZic7XG4gICAgfVxuICAgIC8vIFBsYXllciBzaGlwIG9ubHlcbiAgICBpZiAodGhpcy5wbGF5ZXJpZCA9PT0gdGhpcy5nYW1lLnN0YXJjb2Rlci5wbGF5ZXIuaWQpIHtcbiAgICAgICAgdGhpcy5nYW1lLmludmVudG9yeXRleHQuc2V0VGV4dCh0aGlzLmNyeXN0YWxzLnRvU3RyaW5nKCkpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcDtcbi8vU3RhcmNvZGVyLlNoaXAgPSBTaGlwO1xuIiwiLyoqXG4gKiBTaW1wbGVQYXJ0aWNsZS5qc1xuICpcbiAqIEJhc2ljIGJpdG1hcCBwYXJ0aWNsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8vdmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uLy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gZnVuY3Rpb24gKGdhbWUsIGtleSkge1xuICAgIHZhciB0ZXh0dXJlID0gU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZVtrZXldO1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lLCAwLCAwLCB0ZXh0dXJlKTtcbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHRoaXMsIGZhbHNlLCBmYWxzZSk7XG4gICAgdGhpcy5ib2R5LmNsZWFyU2hhcGVzKCk7XG4gICAgdmFyIHNoYXBlID0gdGhpcy5ib2R5LmFkZFBhcnRpY2xlKCk7XG4gICAgc2hhcGUuc2Vuc29yID0gdHJ1ZTtcbiAgICAvL3RoaXMua2lsbCgpO1xufTtcblxuU2ltcGxlUGFydGljbGUuX3RleHR1cmVDYWNoZSA9IHt9O1xuXG5TaW1wbGVQYXJ0aWNsZS5jYWNoZVRleHR1cmUgPSBmdW5jdGlvbiAoZ2FtZSwga2V5LCBjb2xvciwgc2l6ZSwgY2lyY2xlKSB7XG4gICAgdmFyIHRleHR1cmUgPSBnYW1lLm1ha2UuYml0bWFwRGF0YShzaXplLCBzaXplKTtcbiAgICB0ZXh0dXJlLmN0eC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICBpZiAoY2lyY2xlKSB7XG4gICAgICAgIHRleHR1cmUuY3R4LmFyYyhzaXplLzIsIHNpemUvMiwgc2l6ZS8yLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xuICAgICAgICB0ZXh0dXJlLmN0eC5maWxsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dHVyZS5jdHguZmlsbFJlY3QoMCwgMCwgc2l6ZSwgc2l6ZSk7XG4gICAgfVxuICAgIFNpbXBsZVBhcnRpY2xlLl90ZXh0dXJlQ2FjaGVba2V5XSA9IHRleHR1cmU7XG59O1xuXG5TaW1wbGVQYXJ0aWNsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcblNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNpbXBsZVBhcnRpY2xlO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlUGFydGljbGU7XG4vL1N0YXJjb2Rlci5TaW1wbGVQYXJ0aWNsZSA9IFNpbXBsZVBhcnRpY2xlOyIsIi8qKlxuICogU3luY0JvZHlJbnRlcmZhY2UuanNcbiAqXG4gKiBTaGFyZWQgbWV0aG9kcyBmb3IgVmVjdG9yU3ByaXRlcywgUGFydGljbGVzLCBldGMuXG4gKi9cblxudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gZnVuY3Rpb24gKCkge307XG5cbi8qKlxuICogU2V0IGxvY2F0aW9uIGFuZCBhbmdsZSBvZiBhIHBoeXNpY3Mgb2JqZWN0LiBWYWx1ZSBhcmUgZ2l2ZW4gaW4gd29ybGQgY29vcmRpbmF0ZXMsIG5vdCBwaXhlbHNcbiAqXG4gKiBAcGFyYW0geCB7bnVtYmVyfVxuICogQHBhcmFtIHkge251bWJlcn1cbiAqIEBwYXJhbSBhIHtudW1iZXJ9XG4gKi9cblN5bmNCb2R5SW50ZXJmYWNlLnByb3RvdHlwZS5zZXRQb3NBbmdsZSA9IGZ1bmN0aW9uICh4LCB5LCBhKSB7XG4gICAgdGhpcy5ib2R5LmRhdGEucG9zaXRpb25bMF0gPSAtKHggfHwgMCk7XG4gICAgdGhpcy5ib2R5LmRhdGEucG9zaXRpb25bMV0gPSAtKHkgfHwgMCk7XG4gICAgdGhpcy5ib2R5LmRhdGEuYW5nbGUgPSBhIHx8IDA7XG59O1xuXG5TeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUuY29uZmlnID0gZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMudXBkYXRlUHJvcGVydGllcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGsgPSB0aGlzLnVwZGF0ZVByb3BlcnRpZXNbaV07XG4gICAgICAgIGlmICh0eXBlb2YgcHJvcGVydGllc1trXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXNba10gPSBwcm9wZXJ0aWVzW2tdOyAgICAgICAgLy8gRklYTUU/IFZpcnR1YWxpemUgc29tZWhvd1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW5jQm9keUludGVyZmFjZTsiLCIvKipcbiAqIFRocnVzdEdlbmVyYXRvci5qc1xuICpcbiAqIEdyb3VwIHByb3ZpZGluZyBBUEksIGxheWVyaW5nLCBhbmQgcG9vbGluZyBmb3IgdGhydXN0IHBhcnRpY2xlIGVmZmVjdHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2ltcGxlUGFydGljbGUgPSByZXF1aXJlKCcuL1NpbXBsZVBhcnRpY2xlLmpzJyk7XG5cbnZhciBfdGV4dHVyZUtleSA9ICd0aHJ1c3QnO1xuXG4vLyBQb29saW5nIHBhcmFtZXRlcnNcbnZhciBfbWluUG9vbFNpemUgPSAzMDA7XG52YXIgX21pbkZyZWVQYXJ0aWNsZXMgPSAyMDtcbnZhciBfc29mdFBvb2xMaW1pdCA9IDIwMDtcbnZhciBfaGFyZFBvb2xMaW1pdCA9IDUwMDtcblxuLy8gQmVoYXZpb3Igb2YgZW1pdHRlclxudmFyIF9wYXJ0aWNsZXNQZXJCdXJzdCA9IDU7XG52YXIgX3BhcnRpY2xlVFRMID0gMTUwO1xudmFyIF9wYXJ0aWNsZUJhc2VTcGVlZCA9IDU7XG52YXIgX2NvbmVMZW5ndGggPSAxO1xudmFyIF9jb25lV2lkdGhSYXRpbyA9IDAuMjtcbnZhciBfZW5naW5lT2Zmc2V0ID0gLTIwO1xuXG52YXIgVGhydXN0R2VuZXJhdG9yID0gZnVuY3Rpb24gKGdhbWUpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIHRoaXMudGhydXN0aW5nU2hpcHMgPSB7fTtcblxuICAgIC8vIFByZWdlbmVyYXRlIGEgYmF0Y2ggb2YgcGFydGljbGVzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfbWluUG9vbFNpemU7IGkrKykge1xuICAgICAgICB2YXIgcGFydGljbGUgPSB0aGlzLmFkZChuZXcgU2ltcGxlUGFydGljbGUoZ2FtZSwgX3RleHR1cmVLZXkpKTtcbiAgICAgICAgcGFydGljbGUuYWxwaGEgPSAwLjU7XG4gICAgICAgIHBhcnRpY2xlLnJvdGF0aW9uID0gTWF0aC5QSS80O1xuICAgICAgICBwYXJ0aWNsZS5raWxsKCk7XG4gICAgfVxufTtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLkdyb3VwLnByb3RvdHlwZSk7XG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVGhydXN0R2VuZXJhdG9yO1xuXG5UaHJ1c3RHZW5lcmF0b3IucHJvdG90eXBlLnN0YXJ0T24gPSBmdW5jdGlvbiAoc2hpcCkge1xuICAgIHRoaXMudGhydXN0aW5nU2hpcHNbc2hpcC5pZF0gPSBzaGlwO1xufTtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS5zdG9wT24gPSBmdW5jdGlvbiAoc2hpcCkge1xuICAgIGRlbGV0ZSB0aGlzLnRocnVzdGluZ1NoaXBzW3NoaXAuaWRdO1xufTtcblxuVGhydXN0R2VuZXJhdG9yLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnRocnVzdGluZ1NoaXBzKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBzaGlwID0gdGhpcy50aHJ1c3RpbmdTaGlwc1trZXlzW2ldXTtcbiAgICAgICAgdmFyIHcgPSBzaGlwLndpZHRoO1xuICAgICAgICB2YXIgc2luID0gTWF0aC5zaW4oc2hpcC5yb3RhdGlvbik7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhzaGlwLnJvdGF0aW9uKTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBfcGFydGljbGVzUGVyQnVyc3Q7IGorKykge1xuICAgICAgICAgICAgdmFyIHBhcnRpY2xlID0gdGhpcy5nZXRGaXJzdERlYWQoKTtcbiAgICAgICAgICAgIGlmICghcGFydGljbGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90IGVub3VnaCB0aHJ1c3QgcGFydGljbGVzIGluIHBvb2wnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkID0gdGhpcy5nYW1lLnJuZC5yZWFsSW5SYW5nZSgtX2NvbmVXaWR0aFJhdGlvKncsIF9jb25lV2lkdGhSYXRpbyp3KTtcbiAgICAgICAgICAgIHZhciB4ID0gc2hpcC54ICsgZCpjb3MgKyBfZW5naW5lT2Zmc2V0KnNpbjtcbiAgICAgICAgICAgIHZhciB5ID0gc2hpcC55ICsgZCpzaW4gLSBfZW5naW5lT2Zmc2V0KmNvcztcbiAgICAgICAgICAgIHBhcnRpY2xlLmxpZmVzcGFuID0gX3BhcnRpY2xlVFRMO1xuICAgICAgICAgICAgcGFydGljbGUucmVzZXQoeCwgeSk7XG4gICAgICAgICAgICBwYXJ0aWNsZS5ib2R5LnZlbG9jaXR5LnggPSBfcGFydGljbGVCYXNlU3BlZWQqKF9jb25lTGVuZ3RoKnNpbiAtIGQqY29zKTtcbiAgICAgICAgICAgIHBhcnRpY2xlLmJvZHkudmVsb2NpdHkueSA9IF9wYXJ0aWNsZUJhc2VTcGVlZCooLV9jb25lTGVuZ3RoKmNvcyAtIGQqc2luKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblRocnVzdEdlbmVyYXRvci50ZXh0dXJlS2V5ID0gX3RleHR1cmVLZXk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGhydXN0R2VuZXJhdG9yOyIsIi8qKlxuICogVG9hc3QuanNcbiAqXG4gKiBDbGFzcyBmb3IgdmFyaW91cyBraW5kcyBvZiBwb3AgdXAgbWVzc2FnZXNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVG9hc3QgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSwgdGV4dCwgY29uZmlnKSB7XG4gICAgLy8gVE9ETzogYmV0dGVyIGRlZmF1bHRzLCBtYXliZVxuICAgIFBoYXNlci5UZXh0LmNhbGwodGhpcywgZ2FtZSwgeCwgeSwgdGV4dCwge1xuICAgICAgICBmb250OiAnMTRwdCBBcmlhbCcsXG4gICAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgZmlsbDogJyNmZmE1MDAnXG4gICAgfSk7XG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuICAgIC8vIFNldCB1cCBzdHlsZXMgYW5kIHR3ZWVuc1xuICAgIHZhciBzcGVjID0ge307XG4gICAgaWYgKGNvbmZpZy51cCkge1xuICAgICAgICBzcGVjLnkgPSAnLScgKyBjb25maWcudXA7XG4gICAgfVxuICAgIGlmIChjb25maWcuZG93bikge1xuICAgICAgICBzcGVjLnkgPSAnKycgKyBjb25maWcudXA7XG4gICAgfVxuICAgIGlmIChjb25maWcubGVmdCkge1xuICAgICAgICBzcGVjLnggPSAnLScgKyBjb25maWcudXA7XG4gICAgfVxuICAgIGlmIChjb25maWcucmlnaHQpIHtcbiAgICAgICAgc3BlYy54ID0gJysnICsgY29uZmlnLnVwO1xuICAgIH1cbiAgICBzd2l0Y2ggKGNvbmZpZy50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3NwaW5uZXInOlxuICAgICAgICAgICAgdGhpcy5mb250U2l6ZSA9ICcyMHB0JztcbiAgICAgICAgICAgIHNwZWMucm90YXRpb24gPSBjb25maWcucmV2b2x1dGlvbnMgPyBjb25maWcucmV2b2x1dGlvbnMgKiAyICogTWF0aC5QSSA6IDIgKiBNYXRoLlBJO1xuICAgICAgICAgICAgdmFyIHR3ZWVuID0gZ2FtZS5hZGQudHdlZW4odGhpcykudG8oc3BlYywgY29uZmlnLmR1cmF0aW9uLCBjb25maWcuZWFzaW5nLCB0cnVlKTtcbiAgICAgICAgICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKGZ1bmN0aW9uICh0b2FzdCkge1xuICAgICAgICAgICAgICAgIHRvYXN0LmtpbGwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyBUT0RPOiBNb3JlIGtpbmRzXG4gICAgfVxufTtcblxuLyoqXG4gKiBDcmVhdGUgbmV3IFRvYXN0IGFuZCBhZGQgdG8gZ2FtZVxuICpcbiAqIEBwYXJhbSBnYW1lXG4gKiBAcGFyYW0geFxuICogQHBhcmFtIHlcbiAqIEBwYXJhbSB0ZXh0XG4gKiBAcGFyYW0gY29uZmlnXG4gKi9cblRvYXN0LmFkZCA9IGZ1bmN0aW9uIChnYW1lLCB4LCB5LCB0ZXh0LCBjb25maWcpIHtcbiAgICB2YXIgdG9hc3QgPSBuZXcgVG9hc3QoZ2FtZSwgeCwgeSwgdGV4dCwgY29uZmlnKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyh0b2FzdCk7XG59O1xuXG4vLyBDb3ZlbmllbmNlIG1ldGhvZHMgZm9yIGNvbW1vbiBjYXNlc1xuXG5Ub2FzdC5zcGluVXAgPSBmdW5jdGlvbiAoZ2FtZSwgeCwgeSwgdGV4dCkge1xuICAgIHZhciB0b2FzdCA9IG5ldyBUb2FzdCAoZ2FtZSwgeCwgeSwgdGV4dCwge1xuICAgICAgICB0eXBlOiAnc3Bpbm5lcicsXG4gICAgICAgIHJldm9sdXRpb25zOiAxLFxuICAgICAgICBkdXJhdGlvbjogNTAwLFxuICAgICAgICBlYXNpbmc6IFBoYXNlci5FYXNpbmcuRWxhc3RpYy5PdXQsXG4gICAgICAgIHVwOiAxMDBcbiAgICB9KTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyh0b2FzdCk7XG59O1xuXG5Ub2FzdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5UZXh0LnByb3RvdHlwZSk7XG5Ub2FzdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUb2FzdDtcblxubW9kdWxlLmV4cG9ydHMgPSBUb2FzdDtcbiIsIi8qKlxuICogVHJhY3RvckJlYW0uanNcbiAqXG4gKiBDbGllbnQgc2lkZSBpbXBsZW1lbnRhdGlvbiBvZiBhIHNpbmdsZSB0cmFjdG9yIGJlYW0gc2VnbWVudFxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8vRklYTUU6IE5pY2VyIGltcGxlbWVudGF0aW9uXG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gcmVxdWlyZSgnLi9TaW1wbGVQYXJ0aWNsZS5qcycpO1xudmFyIFN5bmNCb2R5SW50ZXJmYWNlID0gcmVxdWlyZSgnLi9TeW5jQm9keUludGVyZmFjZS5qcycpO1xudmFyIFVwZGF0ZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9jb21tb24vVXBkYXRlUHJvcGVydGllcy5qcycpLlRyYWN0b3JCZWFtO1xuXG52YXIgVHJhY3RvckJlYW0gPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgU2ltcGxlUGFydGljbGUuY2FsbCh0aGlzLCBnYW1lLCAndHJhY3RvcicpO1xuICAgIHRoaXMuc2V0UG9zQW5nbGUoY29uZmlnLngsIGNvbmZpZy55LCBjb25maWcuYSk7XG59O1xuXG5UcmFjdG9yQmVhbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFNpbXBsZVBhcnRpY2xlLnByb3RvdHlwZSk7XG5UcmFjdG9yQmVhbS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUcmFjdG9yQmVhbTtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFRyYWN0b3JCZWFtLnByb3RvdHlwZSwgU3luY0JvZHlJbnRlcmZhY2UucHJvdG90eXBlKTtcblN0YXJjb2Rlci5taXhpblByb3RvdHlwZShUcmFjdG9yQmVhbS5wcm90b3R5cGUsIFVwZGF0ZVByb3BlcnRpZXMucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFjdG9yQmVhbTsiLCIvKipcbiAqIFRyZWUuanNcbiAqXG4gKiBDbGllbnQgc2lkZVxuICovXG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXIuanMnKTtcblxudmFyIFZlY3RvclNwcml0ZSA9IHJlcXVpcmUoJy4vVmVjdG9yU3ByaXRlLmpzJyk7XG52YXIgU3luY0JvZHlJbnRlcmZhY2UgPSByZXF1aXJlKCcuL1N5bmNCb2R5SW50ZXJmYWNlLmpzJyk7XG52YXIgVXBkYXRlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9VcGRhdGVQcm9wZXJ0aWVzLmpzJykuVHJlZTtcblxudmFyIFRyZWUgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgVmVjdG9yU3ByaXRlLmNhbGwodGhpcywgZ2FtZSwgY29uZmlnKTtcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDEpO1xufTtcblxuVHJlZS5hZGQgPSBmdW5jdGlvbiAoZ2FtZSwgY29uZmlnKSB7XG4gICAgdmFyIHRyZWUgPSBuZXcgVHJlZSAoZ2FtZSwgY29uZmlnKTtcbiAgICBnYW1lLmFkZC5leGlzdGluZyh0cmVlKTtcbiAgICByZXR1cm4gdHJlZTtcbn07XG5cblRyZWUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JTcHJpdGUucHJvdG90eXBlKTtcblRyZWUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVHJlZTtcblxuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFRyZWUucHJvdG90eXBlLCBTeW5jQm9keUludGVyZmFjZS5wcm90b3R5cGUpO1xuU3RhcmNvZGVyLm1peGluUHJvdG90eXBlKFRyZWUucHJvdG90eXBlLCBVcGRhdGVQcm9wZXJ0aWVzLnByb3RvdHlwZSk7XG5cbi8qKlxuICogRHJhdyB0cmVlLCBvdmVycmlkaW5nIHN0YW5kYXJkIHNoYXBlIGFuZCBnZW9tZXRyeSBtZXRob2QgdG8gdXNlIGdyYXBoXG4gKlxuICogQHBhcmFtIHJlbmRlclNjYWxlXG4gKi9cblRyZWUucHJvdG90eXBlLmRyYXdQcm9jZWR1cmUgPSBmdW5jdGlvbiAocmVuZGVyU2NhbGUpIHtcbiAgICB2YXIgbGluZUNvbG9yID0gUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMubGluZUNvbG9yKTtcbiAgICB0aGlzLmdyYXBoaWNzLmxpbmVTdHlsZSgxLCBsaW5lQ29sb3IsIDEpO1xuICAgIHRoaXMuX2RyYXdCcmFuY2godGhpcy5ncmFwaCwgdGhpcy5nYW1lLnBoeXNpY3MucDIubXB4aSh0aGlzLnZlY3RvclNjYWxlKSpyZW5kZXJTY2FsZSwgdGhpcy5kZXB0aCk7XG59O1xuXG5UcmVlLnByb3RvdHlwZS5fZHJhd0JyYW5jaCA9IGZ1bmN0aW9uIChncmFwaCwgc2MsIGRlcHRoKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBncmFwaC5jLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSBncmFwaC5jW2ldO1xuICAgICAgICB0aGlzLmdyYXBoaWNzLm1vdmVUbyhncmFwaC54ICogc2MsIGdyYXBoLnkgKiBzYyk7XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubGluZVRvKGNoaWxkLnggKiBzYywgY2hpbGQueSAqIHNjKTtcbiAgICAgICAgaWYgKGRlcHRoID4gdGhpcy5zdGVwKSB7XG4gICAgICAgICAgICB0aGlzLl9kcmF3QnJhbmNoKGNoaWxkLCBzYywgZGVwdGggLSAxKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShUcmVlLnByb3RvdHlwZSwgJ3N0ZXAnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGVwO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX3N0ZXAgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmVlOyIsIi8qKlxuICogU3ByaXRlIHdpdGggYXR0YWNoZWQgR3JhcGhpY3Mgb2JqZWN0IGZvciB2ZWN0b3ItbGlrZSBncmFwaGljc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbi8vdmFyIFN0YXJjb2RlciA9IHJlcXVpcmUoJy4uLy4uL1N0YXJjb2Rlci1jbGllbnQuanMnKTtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBWZWN0b3ItYmFzZWQgc3ByaXRlc1xuICpcbiAqIEBwYXJhbSBnYW1lIHtQaGFzZXIuR2FtZX0gLSBQaGFzZXIgZ2FtZSBvYmplY3RcbiAqIEBwYXJhbSBjb25maWcge29iamVjdH0gLSBQT0pPIHdpdGggY29uZmlnIGRldGFpbHNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgVmVjdG9yU3ByaXRlID0gZnVuY3Rpb24gKGdhbWUsIGNvbmZpZykge1xuICAgIFBoYXNlci5TcHJpdGUuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIHRoaXMuZ3JhcGhpY3MgPSBnYW1lLm1ha2UuZ3JhcGhpY3MoKTtcbiAgICB0aGlzLnRleHR1cmUgPSB0aGlzLmdhbWUuYWRkLnJlbmRlclRleHR1cmUoKTtcbiAgICB0aGlzLm1pbml0ZXh0dXJlID0gdGhpcy5nYW1lLmFkZC5yZW5kZXJUZXh0dXJlKCk7XG4gICAgdGhpcy5taW5pc3ByaXRlID0gdGhpcy5nYW1lLm1pbmltYXAuY3JlYXRlKCk7XG4gICAgdGhpcy5taW5pc3ByaXRlLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG5cbiAgICBnYW1lLnBoeXNpY3MucDIuZW5hYmxlKHRoaXMsIGZhbHNlLCBmYWxzZSk7XG4gICAgdGhpcy5zZXRQb3NBbmdsZShjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5hKTtcbiAgICB0aGlzLmNvbmZpZyhjb25maWcucHJvcGVydGllcyk7XG4gICAgdGhpcy51cGRhdGVBcHBlYXJhbmNlKCk7XG4gICAgdGhpcy51cGRhdGVCb2R5KCk7XG4gICAgdGhpcy5ib2R5Lm1hc3MgPSAwO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgVmVjdG9yU3ByaXRlIGFuZCBhZGQgdG8gZ2FtZSB3b3JsZFxuICpcbiAqIEBwYXJhbSBnYW1lIHtQaGFzZXIuR2FtZX1cbiAqIEBwYXJhbSB4IHtudW1iZXJ9IC0geCBjb29yZFxuICogQHBhcmFtIHkge251bWJlcn0gLSB5IGNvb3JkXG4gKiBAcmV0dXJucyB7VmVjdG9yU3ByaXRlfVxuICovXG5WZWN0b3JTcHJpdGUuYWRkID0gZnVuY3Rpb24gKGdhbWUsIHgsIHkpIHtcbiAgICB2YXIgdiA9IG5ldyBWZWN0b3JTcHJpdGUoZ2FtZSwgeCwgeSk7XG4gICAgZ2FtZS5hZGQuZXhpc3Rpbmcodik7XG4gICAgcmV0dXJuIHY7XG59XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5TcHJpdGUucHJvdG90eXBlKTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBWZWN0b3JTcHJpdGU7XG5cbi8vIERlZmF1bHQgb2N0YWdvblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fc2hhcGUgPSBbXG4gICAgWzIsMV0sXG4gICAgWzEsMl0sXG4gICAgWy0xLDJdLFxuICAgIFstMiwxXSxcbiAgICBbLTIsLTFdLFxuICAgIFstMSwtMl0sXG4gICAgWzEsLTJdLFxuICAgIFsyLC0xXVxuXTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX3NoYXBlQ2xvc2VkID0gdHJ1ZTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2xpbmVDb2xvciA9ICcjZmZmZmZmJztcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX2xpbmVXaWR0aCA9IDE7XG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9maWxsQ29sb3IgPSBudWxsO1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5fZmlsbEFscGhhID0gMC4yNTtcblZlY3RvclNwcml0ZS5wcm90b3R5cGUuX3ZlY3RvclNjYWxlID0gMTtcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5waHlzaWNzQm9keVR5cGUgPSAnY2lyY2xlJztcblxuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5zZXRTaGFwZSA9IGZ1bmN0aW9uIChzaGFwZSkge1xuICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcbiAgICB0aGlzLnVwZGF0ZUFwcGVhcmFuY2UoKTtcbn07XG5cblZlY3RvclNwcml0ZS5wcm90b3R5cGUuc2V0TGluZVN0eWxlID0gZnVuY3Rpb24gKGNvbG9yLCBsaW5lV2lkdGgpIHtcbiAgICBpZiAoIWxpbmVXaWR0aCB8fCBsaW5lV2lkdGggPCAxKSB7XG4gICAgICAgIGxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoIHx8IDE7XG4gICAgfVxuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICB0aGlzLmxpbmVXaWR0aCA9IGxpbmVXaWR0aDtcbiAgICB0aGlzLnVwZGF0ZUFwcGVhcmFuY2UoKTtcbn07XG5cbi8qKlxuICogVXBkYXRlIGNhY2hlZCBiaXRtYXBzIGZvciBvYmplY3QgYWZ0ZXIgdmVjdG9yIHByb3BlcnRpZXMgY2hhbmdlXG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlQXBwZWFyYW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBEcmF3IGZ1bGwgc2l6ZWRcbiAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XG4gICAgdGhpcy5ncmFwaGljcy5fY3VycmVudEJvdW5kcyA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmRyYXdQcm9jZWR1cmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuZHJhd1Byb2NlZHVyZSgxKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUpIHtcbiAgICAgICAgdGhpcy5kcmF3KDEpO1xuICAgIH1cbiAgICB2YXIgYm91bmRzID0gdGhpcy5ncmFwaGljcy5nZXRMb2NhbEJvdW5kcygpO1xuICAgIHRoaXMudGV4dHVyZS5yZXNpemUoYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0LCB0cnVlKTtcbiAgICB0aGlzLnRleHR1cmUucmVuZGVyWFkodGhpcy5ncmFwaGljcywgLWJvdW5kcy54LCAtYm91bmRzLnksIHRydWUpO1xuICAgIHRoaXMuc2V0VGV4dHVyZSh0aGlzLnRleHR1cmUpO1xuICAgIC8vIERyYXcgc21hbGwgZm9yIG1pbmltYXBcbiAgICB2YXIgbWFwU2NhbGUgPSB0aGlzLmdhbWUubWluaW1hcC5tYXBTY2FsZTtcbiAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XG4gICAgdGhpcy5ncmFwaGljcy5fY3VycmVudEJvdW5kcyA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmRyYXdQcm9jZWR1cmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuZHJhd1Byb2NlZHVyZShtYXBTY2FsZSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNoYXBlKSB7XG4gICAgICAgIHRoaXMuZHJhdyhtYXBTY2FsZSk7XG4gICAgfVxuICAgIGJvdW5kcyA9IHRoaXMuZ3JhcGhpY3MuZ2V0TG9jYWxCb3VuZHMoKTtcbiAgICB0aGlzLm1pbml0ZXh0dXJlLnJlc2l6ZShib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIHRydWUpO1xuICAgIHRoaXMubWluaXRleHR1cmUucmVuZGVyWFkodGhpcy5ncmFwaGljcywgLWJvdW5kcy54LCAtYm91bmRzLnksIHRydWUpO1xuICAgIHRoaXMubWluaXNwcml0ZS5zZXRUZXh0dXJlKHRoaXMubWluaXRleHR1cmUpO1xuICAgIHRoaXMuX2RpcnR5ID0gZmFsc2U7XG59O1xuXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLnVwZGF0ZUJvZHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgc3dpdGNoICh0aGlzLnBoeXNpY3NCb2R5VHlwZSkge1xuICAgICAgICBjYXNlIFwiY2lyY2xlXCI6XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuY2lyY2xlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHZhciByID0gdGhpcy5ncmFwaGljcy5nZXRCb3VuZHMoKTtcbiAgICAgICAgICAgICAgICB2YXIgcmFkaXVzID0gTWF0aC5yb3VuZChNYXRoLnNxcnQoci53aWR0aCogci5oZWlnaHQpLzIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByYWRpdXMgPSB0aGlzLnJhZGl1cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRDaXJjbGUocmFkaXVzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBUT0RPOiBNb3JlIHNoYXBlc1xuICAgIH1cbn07XG5cbi8qKlxuICogUmVuZGVyIHZlY3RvciB0byBiaXRtYXAgb2YgZ3JhcGhpY3Mgb2JqZWN0IGF0IGdpdmVuIHNjYWxlXG4gKlxuICogQHBhcmFtIHJlbmRlclNjYWxlIHtudW1iZXJ9IC0gc2NhbGUgZmFjdG9yIGZvciByZW5kZXJcbiAqL1xuVmVjdG9yU3ByaXRlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHJlbmRlclNjYWxlKSB7XG4gICAgcmVuZGVyU2NhbGUgPSByZW5kZXJTY2FsZSB8fCAxO1xuICAgIC8vIERyYXcgc2ltcGxlIHNoYXBlLCBpZiBnaXZlblxuICAgIGlmICh0aGlzLnNoYXBlKSB7XG4gICAgICAgIHZhciBsaW5lQ29sb3IgPSBQaGFzZXIuQ29sb3IuaGV4VG9SR0IodGhpcy5saW5lQ29sb3IpO1xuICAgICAgICBpZiAocmVuZGVyU2NhbGUgPT09IDEpIHtcbiAgICAgICAgICAgIHZhciBsaW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpbmVXaWR0aCA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChyZW5kZXJTY2FsZSA9PT0gMSkgJiYgdGhpcy5maWxsQ29sb3IpIHsgICAgICAgIC8vIE9ubHkgZmlsbCBmdWxsIHNpemVkXG4gICAgICAgICAgICB2YXIgZmlsbENvbG9yID0gUGhhc2VyLkNvbG9yLmhleFRvUkdCKHRoaXMuZmlsbENvbG9yKTtcbiAgICAgICAgICAgIHZhciBmaWxsQWxwaGEgPSB0aGlzLmZpbGxBbHBoYSB8fCAxO1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5iZWdpbkZpbGwoZmlsbENvbG9yLCBmaWxsQWxwaGEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKGxpbmVXaWR0aCwgbGluZUNvbG9yLCAxKTtcbiAgICAgICAgdGhpcy5fZHJhd1BvbHlnb24odGhpcy5zaGFwZSwgdGhpcy5zaGFwZUNsb3NlZCwgcmVuZGVyU2NhbGUpO1xuICAgICAgICBpZiAoKHJlbmRlclNjYWxlID09PSAxKSAmJiB0aGlzLmZpbGxDb2xvcikge1xuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5lbmRGaWxsKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRHJhdyBnZW9tZXRyeSBzcGVjLCBpZiBnaXZlbiwgYnV0IG9ubHkgZm9yIHRoZSBmdWxsIHNpemVkIHNwcml0ZVxuICAgIGlmICgocmVuZGVyU2NhbGUgPT09IDEpICYmIHRoaXMuZ2VvbWV0cnkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmdlb21ldHJ5Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdmFyIGcgPSB0aGlzLmdlb21ldHJ5W2ldO1xuICAgICAgICAgICAgc3dpdGNoIChnLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwicG9seVwiOlxuICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRTogZGVmYXVsdHMgYW5kIHN0dWZmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYXdQb2x5Z29uKGcucG9pbnRzLCBnLmNsb3NlZCwgcmVuZGVyU2NhbGUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogRHJhdyBvcGVuIG9yIGNsb3NlZCBwb2x5Z29uIGFzIHNlcXVlbmNlIG9mIGxpbmVUbyBjYWxsc1xuICpcbiAqIEBwYXJhbSBwb2ludHMge0FycmF5fSAtIHBvaW50cyBhcyBhcnJheSBvZiBbeCx5XSBwYWlyc1xuICogQHBhcmFtIGNsb3NlZCB7Ym9vbGVhbn0gLSBpcyBwb2x5Z29uIGNsb3NlZD9cbiAqIEBwYXJhbSByZW5kZXJTY2FsZSB7bnVtYmVyfSAtIHNjYWxlIGZhY3RvciBmb3IgcmVuZGVyXG4gKiBAcHJpdmF0ZVxuICovXG5WZWN0b3JTcHJpdGUucHJvdG90eXBlLl9kcmF3UG9seWdvbiA9IGZ1bmN0aW9uIChwb2ludHMsIGNsb3NlZCwgcmVuZGVyU2NhbGUpIHtcbiAgICB2YXIgc2MgPSB0aGlzLmdhbWUucGh5c2ljcy5wMi5tcHhpKHRoaXMudmVjdG9yU2NhbGUpKnJlbmRlclNjYWxlO1xuICAgIHBvaW50cyA9IHBvaW50cy5zbGljZSgpO1xuICAgIGlmIChjbG9zZWQpIHtcbiAgICAgICAgcG9pbnRzLnB1c2gocG9pbnRzWzBdKTtcbiAgICB9XG4gICAgdGhpcy5ncmFwaGljcy5tb3ZlVG8ocG9pbnRzWzBdWzBdICogc2MsIHBvaW50c1swXVsxXSAqIHNjKTtcbiAgICBmb3IgKHZhciBpID0gMSwgbCA9IHBvaW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lVG8ocG9pbnRzW2ldWzBdICogc2MsIHBvaW50c1tpXVsxXSAqIHNjKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEludmFsaWRhdGUgY2FjaGUgYW5kIHJlZHJhdyBpZiBzcHJpdGUgaXMgbWFya2VkIGRpcnR5XG4gKi9cblZlY3RvclNwcml0ZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9kaXJ0eSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZGlydHkgVlMnKTtcbiAgICAgICAgdGhpcy51cGRhdGVBcHBlYXJhbmNlKCk7XG4gICAgfVxufTtcblxuLy8gVmVjdG9yIHByb3BlcnRpZXMgZGVmaW5lZCB0byBoYW5kbGUgbWFya2luZyBzcHJpdGUgZGlydHkgd2hlbiBuZWNlc3NhcnlcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdsaW5lQ29sb3InLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9saW5lQ29sb3I7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fbGluZUNvbG9yID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZmlsbENvbG9yJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlsbENvbG9yO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2ZpbGxDb2xvciA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2xpbmVXaWR0aCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpbmVXaWR0aDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9saW5lV2lkdGggPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdmaWxsQWxwaGEnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9maWxsQWxwaGE7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fZmlsbEFscGhhID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnc2hhcGVDbG9zZWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaGFwZUNsb3NlZDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9zaGFwZUNsb3NlZCA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ3ZlY3RvclNjYWxlJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmVjdG9yU2NhbGU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgdGhpcy5fdmVjdG9yU2NhbGUgPSB2YWw7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFZlY3RvclNwcml0ZS5wcm90b3R5cGUsICdzaGFwZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NoYXBlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX3NoYXBlID0gdmFsO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShWZWN0b3JTcHJpdGUucHJvdG90eXBlLCAnZ2VvbWV0cnknLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZW9tZXRyeTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB0aGlzLl9nZW9tZXRyeSA9IHZhbDtcbiAgICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVmVjdG9yU3ByaXRlLnByb3RvdHlwZSwgJ2RlYWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWFkO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHRoaXMuX2RlYWQgPSB2YWw7XG4gICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICAgIHRoaXMua2lsbCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXZpdmUoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVmVjdG9yU3ByaXRlO1xuLy9TdGFyY29kZXIuVmVjdG9yU3ByaXRlID0gVmVjdG9yU3ByaXRlOyIsIi8qKlxuICogQ29udHJvbHMuanNcbiAqXG4gKiBWaXJ0dWFsaXplIGFuZCBpbXBsZW1lbnQgcXVldWUgZm9yIGdhbWUgY29udHJvbHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3RhcmNvZGVyID0gcmVxdWlyZSgnLi4vU3RhcmNvZGVyLWNsaWVudC5qcycpO1xuXG52YXIgQ29udHJvbHMgPSBmdW5jdGlvbiAoZ2FtZSwgcGFyZW50KSB7XG4gICAgUGhhc2VyLlBsdWdpbi5jYWxsKHRoaXMsIGdhbWUsIHBhcmVudCk7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5QbHVnaW4ucHJvdG90eXBlKTtcbkNvbnRyb2xzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENvbnRyb2xzO1xuXG5Db250cm9scy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChxdWV1ZSkge1xuICAgIHRoaXMucXVldWUgPSBxdWV1ZTtcbiAgICB0aGlzLmNvbnRyb2xzID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcbiAgICB0aGlzLmNvbnRyb2xzLmZpcmUgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5CKTtcbiAgICB0aGlzLmNvbnRyb2xzLnRyYWN0b3IgPSB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5UKTtcbiAgICB0aGlzLmpveXN0aWNrU3RhdGUgPSB7XG4gICAgICAgIHVwOiBmYWxzZSxcbiAgICAgICAgZG93bjogZmFsc2UsXG4gICAgICAgIGxlZnQ6IGZhbHNlLFxuICAgICAgICByaWdodDogZmFsc2UsXG4gICAgICAgIGZpcmU6IGZhbHNlXG4gICAgfTtcblxuICAgIC8vIEFkZCB2aXJ0dWFsIGpveXN0aWNrIGlmIHBsdWdpbiBpcyBhdmFpbGFibGVcbiAgICBpZiAoUGhhc2VyLlZpcnR1YWxKb3lzdGljaykge1xuICAgICAgICB0aGlzLmpveXN0aWNrID0gdGhpcy5nYW1lLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oUGhhc2VyLlZpcnR1YWxKb3lzdGljayk7XG4gICAgfVxufTtcblxudmFyIHNlcSA9IDA7XG52YXIgdXAgPSBmYWxzZSwgZG93biA9IGZhbHNlLCBsZWZ0ID0gZmFsc2UsIHJpZ2h0ID0gZmFsc2UsIGZpcmUgPSBmYWxzZSwgdHJhY3RvciA9IGZhbHNlO1xuXG5Db250cm9scy5wcm90b3R5cGUuYWRkVmlydHVhbENvbnRyb2xzID0gZnVuY3Rpb24gKHgsIHksIHNjYWxlLCB0ZXh0dXJlKSB7XG4gICAgdGV4dHVyZSA9IHRleHR1cmUgfHwgJ2pveXN0aWNrJztcbiAgICB0aGlzLnN0aWNrID0gdGhpcy5qb3lzdGljay5hZGRTdGljayh4LCB5LCAxMDAsdGV4dHVyZSk7XG4gICAgdGhpcy5zdGljay5tb3Rpb25Mb2NrID0gUGhhc2VyLlZpcnR1YWxKb3lzdGljay5IT1JJWk9OVEFMO1xuICAgIHRoaXMuc3RpY2suc2NhbGUgPSBzY2FsZTtcbiAgICB0aGlzLmdvYnV0dG9uID0gdGhpcy5qb3lzdGljay5hZGRCdXR0b24oeCArIDIwMCpzY2FsZSwgeSwgdGV4dHVyZSwgJ2J1dHRvbjEtdXAnLCAnYnV0dG9uMS1kb3duJyk7XG4gICAgdGhpcy5maXJlYnV0dG9uID0gdGhpcy5qb3lzdGljay5hZGRCdXR0b24oeCArIDM1MCpzY2FsZSwgeSwgdGV4dHVyZSwgJ2J1dHRvbjItdXAnLCAnYnV0dG9uMi1kb3duJyk7XG4gICAgdGhpcy50cmFjdG9yYnV0dG9uID0gdGhpcy5qb3lzdGljay5hZGRCdXR0b24oeCArIDQ1MCpzY2FsZSwgeSwgdGV4dHVyZSwgJ2J1dHRvbjMtdXAnLCAnYnV0dG9uMy1kb3duJyk7XG4gICAgdGhpcy5maXJlYnV0dG9uLnNjYWxlID0gc2NhbGU7XG4gICAgdGhpcy5nb2J1dHRvbi5zY2FsZSA9IHNjYWxlO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5zY2FsZSA9IHNjYWxlO1xuICAgIHRoaXMuc3RpY2sub25Nb3ZlLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0aWNrLnggPj0gMC4yNSkge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5sZWZ0ID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGljay54IDw9IC0wLjI1KSB7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUucmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5sZWZ0ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5yaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmxlZnQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdGljay55ID49IDAuMjUpIHtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5kb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RpY2sueSA8PSAtMC4yNSkge1xuICAgICAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmRvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUuZG93biA9IGZhbHNlOztcbiAgICAgICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5zdGljay5vblVwLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5yaWdodCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUudXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmxlZnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLmRvd24gPSBmYWxzZTtcbiAgICB9LCB0aGlzKTtcbiAgICB0aGlzLmZpcmVidXR0b24ub25Eb3duLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS5maXJlID0gdHJ1ZTtcbiAgICB9LCB0aGlzKTtcbiAgICB0aGlzLmZpcmVidXR0b24ub25VcC5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmpveXN0aWNrU3RhdGUuZmlyZSA9IGZhbHNlO1xuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMuZ29idXR0b24ub25Eb3duLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IHRydWU7XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5nb2J1dHRvbi5vblVwLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS51cCA9IGZhbHNlO1xuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5vbkRvd24uYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5qb3lzdGlja1N0YXRlLnRyYWN0b3IgPSB0cnVlO1xuICAgIH0sIHRoaXMpO1xuICAgIHRoaXMudHJhY3RvcmJ1dHRvbi5vblVwLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2tTdGF0ZS50cmFjdG9yID0gZmFsc2U7XG4gICAgfSwgdGhpcyk7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdXAgPSBkb3duID0gbGVmdCA9IHJpZ2h0ID0gZmFsc2U7XG4gICAgdGhpcy5xdWV1ZS5sZW5ndGggPSAwO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLnByZVVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPOiBTdXBwb3J0IG90aGVyIGludGVyYWN0aW9ucy9tZXRob2RzXG4gICAgdmFyIGNvbnRyb2xzID0gdGhpcy5jb250cm9scztcbiAgICB2YXIgc3RhdGUgPSB0aGlzLmpveXN0aWNrU3RhdGU7XG4gICAgaWYgKChzdGF0ZS51cCB8fCBjb250cm9scy51cC5pc0Rvd24pICYmICF1cCkge1xuICAgICAgICB1cCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3VwX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS51cCAmJiAhY29udHJvbHMudXAuaXNEb3duICYmIHVwKSB7XG4gICAgICAgIHVwID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3VwX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUuZG93biB8fCBjb250cm9scy5kb3duLmlzRG93bikgJiYgIWRvd24pIHtcbiAgICAgICAgZG93biA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ2Rvd25fcHJlc3NlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLmRvd24gJiYgIWNvbnRyb2xzLmRvd24uaXNEb3duICYmIGRvd24pIHtcbiAgICAgICAgZG93biA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdkb3duX3JlbGVhc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICgoc3RhdGUucmlnaHQgfHwgY29udHJvbHMucmlnaHQuaXNEb3duKSAmJiAhcmlnaHQpIHtcbiAgICAgICAgcmlnaHQgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdyaWdodF9wcmVzc2VkJywgZXhlY3V0ZWQ6IGZhbHNlLCBzZXE6IHNlcSsrfSk7XG4gICAgfVxuICAgIGlmICghc3RhdGUucmlnaHQgJiYgIWNvbnRyb2xzLnJpZ2h0LmlzRG93biAmJiByaWdodCkge1xuICAgICAgICByaWdodCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdyaWdodF9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKHN0YXRlLmxlZnQgfHwgY29udHJvbHMubGVmdC5pc0Rvd24pICYmICFsZWZ0KSB7XG4gICAgICAgIGxlZnQgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdsZWZ0X3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS5sZWZ0ICYmICFjb250cm9scy5sZWZ0LmlzRG93biAmJiBsZWZ0KSB7XG4gICAgICAgIGxlZnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnbGVmdF9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKHN0YXRlLmZpcmUgfHwgY29udHJvbHMuZmlyZS5pc0Rvd24pICYmICFmaXJlKSB7XG4gICAgICAgIGZpcmUgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICdmaXJlX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS5maXJlICYmICFjb250cm9scy5maXJlLmlzRG93biAmJiBmaXJlKSB7XG4gICAgICAgIGZpcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHt0eXBlOiAnZmlyZV9yZWxlYXNlZCcsIGV4ZWN1dGVkOiBmYWxzZSwgc2VxOiBzZXErK30pO1xuICAgIH1cbiAgICBpZiAoKHN0YXRlLnRyYWN0b3IgfHwgY29udHJvbHMudHJhY3Rvci5pc0Rvd24pICYmICF0cmFjdG9yKSB7XG4gICAgICAgIHRyYWN0b3IgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goe3R5cGU6ICd0cmFjdG9yX3ByZXNzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG4gICAgaWYgKCghc3RhdGUudHJhY3RvciAmJiAhY29udHJvbHMudHJhY3Rvci5pc0Rvd24pICYmIHRyYWN0b3IpIHtcbiAgICAgICAgdHJhY3RvciA9IGZhbHNlOy8vXG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7dHlwZTogJ3RyYWN0b3JfcmVsZWFzZWQnLCBleGVjdXRlZDogZmFsc2UsIHNlcTogc2VxKyt9KTtcbiAgICB9XG59O1xuXG52YXIgYWN0aW9uOyAgICAgICAgICAgICAvLyBNb2R1bGUgc2NvcGUgdG8gYXZvaWQgYWxsb2NhdGlvbnNcblxuQ29udHJvbHMucHJvdG90eXBlLnByb2Nlc3NRdWV1ZSA9IGZ1bmN0aW9uIChjYiwgY2xlYXIpIHtcbiAgICB2YXIgcXVldWUgPSB0aGlzLnF1ZXVlO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcXVldWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGFjdGlvbiA9IHF1ZXVlW2ldO1xuICAgICAgICBpZiAoYWN0aW9uLmV4ZWN1dGVkKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYihhY3Rpb24pO1xuICAgICAgICBhY3Rpb24uZXRpbWUgPSB0aGlzLmdhbWUudGltZS5ub3c7XG4gICAgICAgIGFjdGlvbi5leGVjdXRlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChjbGVhcikge1xuICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgIH1cbn07XG5cblN0YXJjb2Rlci5Db250cm9scyA9IENvbnRyb2xzO1xubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sczsiLCIvKipcbiAqIFN5bmNDbGllbnQuanNcbiAqXG4gKiBTeW5jIHBoeXNpY3Mgb2JqZWN0cyB3aXRoIHNlcnZlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTdGFyY29kZXIgPSByZXF1aXJlKCcuLi9TdGFyY29kZXItY2xpZW50LmpzJyk7XG52YXIgVVBEQVRFX1FVRVVFX0xJTUlUID0gODtcblxudmFyIFN5bmNDbGllbnQgPSBmdW5jdGlvbiAoZ2FtZSwgcGFyZW50KSB7XG4gICAgUGhhc2VyLlBsdWdpbi5jYWxsKHRoaXMsIGdhbWUsIHBhcmVudCk7XG59O1xuXG5TeW5jQ2xpZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlBsdWdpbi5wcm90b3R5cGUpO1xuU3luY0NsaWVudC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTeW5jQ2xpZW50O1xuXG5cbi8qKlxuICogSW5pdGlhbGl6ZSBwbHVnaW5cbiAqXG4gKiBAcGFyYW0gc29ja2V0IHtTb2NrZXR9IC0gc29ja2V0LmlvIHNvY2tldCBmb3Igc3luYyBjb25uZWN0aW9uXG4gKiBAcGFyYW0gcXVldWUge0FycmF5fSAtIGNvbW1hbmQgcXVldWVcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChzb2NrZXQsIHF1ZXVlKSB7XG4gICAgLy8gVE9ETzogQ29weSBzb21lIGNvbmZpZyBvcHRpb25zXG4gICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XG4gICAgdGhpcy5jbWRRdWV1ZSA9IHF1ZXVlO1xuICAgIHRoaXMuZXh0YW50ID0ge307XG59O1xuXG4vKipcbiAqIFN0YXJ0IHBsdWdpblxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHN0YXJjb2RlciA9IHRoaXMuZ2FtZS5zdGFyY29kZXI7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGxldGUgPSBmYWxzZTtcbiAgICAvLyBGSVhNRTogTmVlZCBtb3JlIHJvYnVzdCBoYW5kbGluZyBvZiBEQy9SQ1xuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmdhbWUucGF1c2VkID0gdHJ1ZTtcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbigncmVjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmdhbWUucGF1c2VkID0gZmFsc2U7XG4gICAgfSk7XG4gICAgLy8gTWVhc3VyZSBjbGllbnQtc2VydmVyIHRpbWUgZGVsdGFcbiAgICB0aGlzLnNvY2tldC5vbigndGltZXN5bmMnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBzZWxmLl9sYXRlbmN5ID0gZGF0YSAtIHNlbGYuZ2FtZS50aW1lLm5vdztcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlYWxUaW1lID0gZGF0YS5yO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGRhdGEuYi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB1cGRhdGUgPSBkYXRhLmJbaV07XG4gICAgICAgICAgICB2YXIgaWQgPSB1cGRhdGUuaWQ7XG4gICAgICAgICAgICB2YXIgc3ByaXRlO1xuICAgICAgICAgICAgdXBkYXRlLnRpbWVzdGFtcCA9IHJlYWxUaW1lO1xuICAgICAgICAgICAgaWYgKHNwcml0ZSA9IHNlbGYuZXh0YW50W2lkXSkge1xuICAgICAgICAgICAgICAgIC8vIEV4aXN0aW5nIHNwcml0ZSAtIHByb2Nlc3MgdXBkYXRlXG4gICAgICAgICAgICAgICAgc3ByaXRlLnVwZGF0ZVF1ZXVlLnB1c2godXBkYXRlKTtcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlLmNvbmZpZyh1cGRhdGUucHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzcHJpdGUudXBkYXRlUXVldWUubGVuZ3RoID4gVVBEQVRFX1FVRVVFX0xJTUlUKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS51cGRhdGVRdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gTmV3IHNwcml0ZSAtIGNyZWF0ZSBhbmQgY29uZmlndXJlXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnTmV3JywgaWQsIHVwZGF0ZS50KTtcbiAgICAgICAgICAgICAgICBzcHJpdGUgPSBzdGFyY29kZXIuYWRkQm9keSh1cGRhdGUudCwgdXBkYXRlKTtcbiAgICAgICAgICAgICAgICBpZiAoc3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS5zZXJ2ZXJJZCA9IGlkO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmV4dGFudFtpZF0gPSBzcHJpdGU7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS51cGRhdGVRdWV1ZSA9IFt1cGRhdGVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwLCBsID0gZGF0YS5ybS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGlkID0gZGF0YS5ybVtpXTtcbiAgICAgICAgICAgIGlmIChzZWxmLmV4dGFudFtpZF0pIHtcbiAgICAgICAgICAgICAgICBzdGFyY29kZXIucmVtb3ZlQm9keShzZWxmLmV4dGFudFtpZF0pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBzZWxmLmV4dGFudFtpZF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogU2VuZCBxdWV1ZWQgY29tbWFuZHMgdG8gc2VydmVyIGFuZCBpbnRlcnBvbGF0ZSBvYmplY3RzIGJhc2VkIG9uIHVwZGF0ZXMgZnJvbSBzZXJ2ZXJcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fdXBkYXRlQ29tcGxldGUpIHtcbiAgICAgICAgdGhpcy5fc2VuZENvbW1hbmRzKCk7XG4gICAgICAgIHRoaXMuX3Byb2Nlc3NQaHlzaWNzVXBkYXRlcygpO1xuICAgICAgICB0aGlzLl91cGRhdGVDb21wbGV0ZSA9IHRydWU7XG4gICAgfVxuIH07XG5cblN5bmNDbGllbnQucHJvdG90eXBlLnBvc3RSZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fdXBkYXRlQ29tcGxldGUgPSBmYWxzZTtcbn07XG5cblxudmFyIGFjdGlvbnMgPSBbXTsgICAgICAgICAgICAgICAvLyBNb2R1bGUgc2NvcGUgdG8gYXZvaWQgYWxsb2NhdGlvbnNcbnZhciBhY3Rpb247XG4vKipcbiAqIFNlbmQgcXVldWVkIGNvbW1hbmRzIHRoYXQgaGF2ZSBiZWVuIGV4ZWN1dGVkIHRvIHRoZSBzZXJ2ZXJcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5TeW5jQ2xpZW50LnByb3RvdHlwZS5fc2VuZENvbW1hbmRzID0gZnVuY3Rpb24gKCkge1xuICAgIGFjdGlvbnMubGVuZ3RoID0gMDtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5jbWRRdWV1ZS5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgYWN0aW9uID0gdGhpcy5jbWRRdWV1ZVtpXTtcbiAgICAgICAgaWYgKGFjdGlvbi5leGVjdXRlZCkge1xuICAgICAgICAgICAgYWN0aW9ucy51bnNoaWZ0KGFjdGlvbik7XG4gICAgICAgICAgICB0aGlzLmNtZFF1ZXVlLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnZG8nLCBhY3Rpb25zKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnc2VuZGluZyBhY3Rpb25zJywgYWN0aW9ucyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVzIGludGVycG9sYXRpb24gLyBwcmVkaWN0aW9uIHJlc29sdXRpb24gZm9yIHBoeXNpY3MgYm9kaWVzXG4gKlxuICogQHByaXZhdGVcbiAqL1xuU3luY0NsaWVudC5wcm90b3R5cGUuX3Byb2Nlc3NQaHlzaWNzVXBkYXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaW50ZXJwVGltZSA9IHRoaXMuZ2FtZS50aW1lLm5vdyArIHRoaXMuX2xhdGVuY3kgLSB0aGlzLmdhbWUuc3RhcmNvZGVyLmNvbmZpZy5yZW5kZXJMYXRlbmN5O1xuICAgIHZhciBvaWRzID0gT2JqZWN0LmtleXModGhpcy5leHRhbnQpO1xuICAgIGZvciAodmFyIGkgPSBvaWRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBzcHJpdGUgPSB0aGlzLmV4dGFudFtvaWRzW2ldXTtcbiAgICAgICAgdmFyIHF1ZXVlID0gc3ByaXRlLnVwZGF0ZVF1ZXVlO1xuICAgICAgICB2YXIgYmVmb3JlID0gbnVsbCwgYWZ0ZXIgPSBudWxsO1xuXG4gICAgICAgIC8vIEZpbmQgdXBkYXRlcyBiZWZvcmUgYW5kIGFmdGVyIGludGVycFRpbWVcbiAgICAgICAgdmFyIGogPSAxO1xuICAgICAgICB3aGlsZSAocXVldWVbal0pIHtcbiAgICAgICAgICAgIGlmIChxdWV1ZVtqXS50aW1lc3RhbXAgPiBpbnRlcnBUaW1lKSB7XG4gICAgICAgICAgICAgICAgYWZ0ZXIgPSBxdWV1ZVtqXTtcbiAgICAgICAgICAgICAgICBiZWZvcmUgPSBxdWV1ZVtqLTFdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaisrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm9uZSAtIHdlJ3JlIGJlaGluZC5cbiAgICAgICAgaWYgKCFiZWZvcmUgJiYgIWFmdGVyKSB7XG4gICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID49IDIpIHsgICAgLy8gVHdvIG1vc3QgcmVjZW50IHVwZGF0ZXMgYXZhaWxhYmxlPyBVc2UgdGhlbS5cbiAgICAgICAgICAgICAgICBiZWZvcmUgPSBxdWV1ZVtxdWV1ZS5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICBhZnRlciA9IHF1ZXVlW3F1ZXVlLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ0xhZ2dpbmcnLCBvaWRzW2ldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7ICAgICAgICAgICAgICAgICAgICAvLyBObz8gSnVzdCBiYWlsXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnQmFpbGluZycsIG9pZHNbaV0pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnT2snLCBpbnRlcnBUaW1lLCBxdWV1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgcXVldWUuc3BsaWNlKDAsIGogLSAxKTsgICAgIC8vIFRocm93IG91dCBvbGRlciB1cGRhdGVzXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3BhbiA9IGFmdGVyLnRpbWVzdGFtcCAtIGJlZm9yZS50aW1lc3RhbXA7XG4gICAgICAgIHZhciB0ID0gKGludGVycFRpbWUgLSBiZWZvcmUudGltZXN0YW1wKSAvIHNwYW47XG4gICAgICAgIHNwcml0ZS5zZXRQb3NBbmdsZShsaW5lYXIoYmVmb3JlLngsIGFmdGVyLngsIHQpLCBsaW5lYXIoYmVmb3JlLnksIGFmdGVyLnksIHQpLCBsaW5lYXIoYmVmb3JlLmEsIGFmdGVyLmEsIHQpKTtcbiAgICB9XG59O1xuXG4vLyBIZWxwZXJzXG5cbi8qKlxuICogSW50ZXJwb2xhdGUgYmV0d2VlbiB0d28gcG9pbnRzIHdpdGggaGVybWl0ZSBzcGxpbmVcbiAqIE5CIC0gY3VycmVudGx5IHVudXNlZCBhbmQgcHJvYmFibHkgYnJva2VuXG4gKlxuICogQHBhcmFtIHAwIHtudW1iZXJ9IC0gaW5pdGlhbCB2YWx1ZVxuICogQHBhcmFtIHAxIHtudW1iZXJ9IC0gZmluYWwgdmFsdWVcbiAqIEBwYXJhbSB2MCB7bnVtYmVyfSAtIGluaXRpYWwgc2xvcGVcbiAqIEBwYXJhbSB2MSB7bnVtYmVyfSAtIGZpbmFsIHNsb3BlXG4gKiBAcGFyYW0gdCB7bnVtYmVyfSAtIHBvaW50IG9mIGludGVycG9sYXRpb24gKGJldHdlZW4gMCBhbmQgMSlcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gaW50ZXJwb2xhdGVkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGhlcm1pdGUgKHAwLCBwMSwgdjAsIHYxLCB0KSB7XG4gICAgdmFyIHQyID0gdCp0O1xuICAgIHZhciB0MyA9IHQqdDI7XG4gICAgcmV0dXJuICgyKnQzIC0gMyp0MiArIDEpKnAwICsgKHQzIC0gMip0MiArIHQpKnYwICsgKC0yKnQzICsgMyp0MikqcDEgKyAodDMgLSB0MikqdjE7XG59XG5cbi8qKlxuICogSW50ZXJwb2xhdGUgYmV0d2VlbiB0d28gcG9pbnRzIHdpdGggbGluZWFyIHNwbGluZVxuICpcbiAqIEBwYXJhbSBwMCB7bnVtYmVyfSAtIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSBwMSB7bnVtYmVyfSAtIGZpbmFsIHZhbHVlXG4gKiBAcGFyYW0gdCB7bnVtYmVyfSAtIHBvaW50IG9mIGludGVycG9sYXRpb24gKGJldHdlZW4gMCBhbmQgMSlcbiAqIEBwYXJhbSBzY2FsZSB7bnVtYmVyfSAtIHNjYWxlIGZhY3RvciB0byBub3JtYWxpemUgdW5pdHNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IC0gaW50ZXJwb2xhdGVkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGxpbmVhciAocDAsIHAxLCB0LCBzY2FsZSkge1xuICAgIHNjYWxlID0gc2NhbGUgfHwgMTtcbiAgICByZXR1cm4gcDAgKyAocDEgLSBwMCkqdCpzY2FsZTtcbn1cblxuU3RhcmNvZGVyLlNlcnZlclN5bmMgPSBTeW5jQ2xpZW50O1xubW9kdWxlLmV4cG9ydHMgPSBTeW5jQ2xpZW50OyIsIi8qKlxuICogQm9vdC5qc1xuICpcbiAqIEJvb3Qgc3RhdGUgZm9yIFN0YXJjb2RlclxuICogTG9hZCBhc3NldHMgZm9yIHByZWxvYWQgc2NyZWVuIGFuZCBjb25uZWN0IHRvIHNlcnZlclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb250cm9scyA9IHJlcXVpcmUoJy4uL3BoYXNlcnBsdWdpbnMvQ29udHJvbHMuanMnKTtcbnZhciBTeW5jQ2xpZW50ID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9TeW5jQ2xpZW50LmpzJyk7XG5cbnZhciBCb290ID0gZnVuY3Rpb24gKCkge307XG5cbkJvb3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbkJvb3QucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQm9vdDtcblxudmFyIF9jb25uZWN0ZWQgPSBmYWxzZTtcblxuLyoqXG4gKiBTZXQgcHJvcGVydGllcyB0aGF0IHJlcXVpcmUgYm9vdGVkIGdhbWUgc3RhdGUsIGF0dGFjaCBwbHVnaW5zLCBjb25uZWN0IHRvIGdhbWUgc2VydmVyXG4gKi9cbkJvb3QucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy90aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlO1xuICAgIHRoaXMuZ2FtZS5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlJFU0laRTtcbiAgICB0aGlzLmdhbWUucmVuZGVyZXIucmVuZGVyU2Vzc2lvbi5yb3VuZFBpeGVscyA9IHRydWU7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBwU2NhbGUgPSB0aGlzLnN0YXJjb2Rlci5jb25maWcucGh5c2ljc1NjYWxlO1xuICAgIHZhciBpcFNjYWxlID0gMS9wU2NhbGU7XG4gICAgdmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5jb25maWcgPSB7XG4gICAgICAgIHB4bTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBpcFNjYWxlKmE7XG4gICAgICAgIH0sXG4gICAgICAgIG1weDogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBmbG9vcihwU2NhbGUqYSk7XG4gICAgICAgIH0sXG4gICAgICAgIHB4bWk6IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gLWlwU2NhbGUqYTtcbiAgICAgICAgfSxcbiAgICAgICAgbXB4aTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBmbG9vcigtcFNjYWxlKmEpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zZXJ2ZXJDb25uZWN0KCk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5jb250cm9scyA9IHRoaXMuZ2FtZS5wbHVnaW5zLmFkZChDb250cm9scyxcbiAgICAvLyAgICB0aGlzLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy90aGlzLmdhbWUuam95c3RpY2sgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oUGhhc2VyLlZpcnR1YWxKb3lzdGljayk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5jb250cm9scyA9IHRoaXMuc3RhcmNvZGVyLmF0dGFjaFBsdWdpbihDb250cm9scywgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIC8vIFNldCB1cCBzb2NrZXQuaW8gY29ubmVjdGlvblxuICAgIC8vdGhpcy5zdGFyY29kZXIuc29ja2V0ID0gdGhpcy5zdGFyY29kZXIuaW8odGhpcy5zdGFyY29kZXIuY29uZmlnLnNlcnZlclVyaSxcbiAgICAvLyAgICB0aGlzLnN0YXJjb2Rlci5jb25maWcuaW9DbGllbnRPcHRpb25zKTtcbiAgICAvL3RoaXMuc3RhcmNvZGVyLnNvY2tldC5vbignc2VydmVyIHJlYWR5JywgZnVuY3Rpb24gKHBsYXllck1zZykge1xuICAgIC8vICAgIC8vIEZJWE1FOiBIYXMgdG8gaW50ZXJhY3Qgd2l0aCBzZXNzaW9uIGZvciBhdXRoZW50aWNhdGlvbiBldGMuXG4gICAgLy8gICAgc2VsZi5zdGFyY29kZXIucGxheWVyID0gcGxheWVyTXNnO1xuICAgIC8vICAgIC8vc2VsZi5zdGFyY29kZXIuc3luY2NsaWVudCA9IHNlbGYuZ2FtZS5wbHVnaW5zLmFkZChTeW5jQ2xpZW50LFxuICAgIC8vICAgIC8vICAgIHNlbGYuc3RhcmNvZGVyLnNvY2tldCwgc2VsZi5zdGFyY29kZXIuY21kUXVldWUpO1xuICAgIC8vICAgIHNlbGYuc3RhcmNvZGVyLnN5bmNjbGllbnQgPSBzZWxmLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oU3luY0NsaWVudCxcbiAgICAvLyAgICAgICAgc2VsZi5zdGFyY29kZXIuc29ja2V0LCBzZWxmLnN0YXJjb2Rlci5jbWRRdWV1ZSk7XG4gICAgLy8gICAgX2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgLy99KTtcbn07XG5cbi8qKlxuICogUHJlbG9hZCBtaW5pbWFsIGFzc2V0cyBmb3IgcHJvZ3Jlc3Mgc2NyZWVuXG4gKi9cbkJvb3QucHJvdG90eXBlLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG5cbn07XG5cbi8qKlxuICogS2ljayBpbnRvIG5leHQgc3RhdGUgb25jZSBpbml0aWFsaXphdGlvbiBhbmQgcHJlbG9hZGluZyBhcmUgZG9uZVxuICovXG5Cb290LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy90aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ3ByZWxvYWQnKTtcbn07XG5cbi8qKlxuICogQWR2YW5jZSBnYW1lIHN0YXRlIG9uY2UgbmV0d29yayBjb25uZWN0aW9uIGlzIGVzdGFibGlzaGVkXG4gKi9cbkJvb3QucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBGSVhNRTogZG9uJ3Qgd2FpdCBoZXJlIC0gc2hvdWxkIGJlIGluIGNyZWF0ZVxuICAgIGlmICh0aGlzLnN0YXJjb2Rlci5jb25uZWN0ZWQpIHtcbiAgICAgICAgLy90aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ3NwYWNlJyk7XG4gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnbG9naW4nKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb3Q7IiwiLyoqXG4gKiBMb2dpbi5qc1xuICpcbiAqIFN0YXRlIGZvciBkaXNwbGF5aW5nIGxvZ2luIHNjcmVlbi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTG9naW4gPSBmdW5jdGlvbiAoKSB7fTtcblxuTG9naW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuU3RhdGUucHJvdG90eXBlKTtcbkxvZ2luLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvZ2luO1xuXG5Mb2dpbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5zdGFyY29kZXIuc2hvd0xvZ2luKCk7XG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0Lm9uKCdsb2dnZWQgaW4nLCBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgIHNlbGYuc3RhcmNvZGVyLmhpZGVMb2dpbigpO1xuICAgICAgICBzZWxmLnN0YXJjb2Rlci5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICAgIHNlbGYuZ2FtZS5zdGF0ZS5zdGFydCgnc3BhY2UnKTtcbiAgICB9KTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zb2NrZXQub24oJ2xvZ2luIGZhaWx1cmUnLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgc2VsZi5zdGFyY29kZXIuc2V0TG9naW5FcnJvcihlcnJvcik7XG4gICAgfSk7XG59O1xuXG5Mb2dpbi5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KCd0aXRsZS1mb250JyxcbiAgICAgICAgJ2Fzc2V0cy9iaXRtYXBmb250cy9rYXJuaXZvcmUxMjgucG5nJywgJ2Fzc2V0cy9iaXRtYXBmb250cy9rYXJuaXZvcmUxMjgueG1sJyk7XG59O1xuXG5Mb2dpbi5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5kcmF3U3RhckZpZWxkKHN0YXJmaWVsZC5jdHgsIDYwMCwgMTYpO1xuICAgIHRoaXMuZ2FtZS5hZGQudGlsZVNwcml0ZSgwLCAwLCB0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQsIHN0YXJmaWVsZCk7XG4gICAgdmFyIHRpdGxlID0gdGhpcy5nYW1lLmFkZC5iaXRtYXBUZXh0KHRoaXMuZ2FtZS53b3JsZC5jZW50ZXJYLCAxMjgsICd0aXRsZS1mb250JywgJ1NUQVJDT0RFUicpO1xuICAgIHRpdGxlLmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2luO1xuIiwiLyoqXG4gKiBTcGFjZS5qc1xuICpcbiAqIE1haW4gZ2FtZSBzdGF0ZSBmb3IgU3RhcmNvZGVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNpbXBsZVBhcnRpY2xlID0gcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1NpbXBsZVBhcnRpY2xlLmpzJyk7XG52YXIgVGhydXN0R2VuZXJhdG9yID0gcmVxdWlyZSgnLi4vcGhhc2VyYm9kaWVzL1RocnVzdEdlbmVyYXRvci5qcycpO1xudmFyIE1pbmlNYXAgPSByZXF1aXJlKCcuLi9waGFzZXJ1aS9NaW5pTWFwLmpzJyk7XG52YXIgVG9hc3QgPSByZXF1aXJlKCcuLi9waGFzZXJib2RpZXMvVG9hc3QuanMnKTtcblxudmFyIENvbnRyb2xzID0gcmVxdWlyZSgnLi4vcGhhc2VycGx1Z2lucy9Db250cm9scy5qcycpO1xudmFyIFN5bmNDbGllbnQgPSByZXF1aXJlKCcuLi9waGFzZXJwbHVnaW5zL1N5bmNDbGllbnQuanMnKTtcblxudmFyIFNwYWNlID0gZnVuY3Rpb24gKCkge307XG5cblNwYWNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlN0YXRlLnByb3RvdHlwZSk7XG5TcGFjZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTcGFjZTtcblxuU3BhY2UucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMgPSB0aGlzLnN0YXJjb2Rlci5hdHRhY2hQbHVnaW4oQ29udHJvbHMsIHRoaXMuc3RhcmNvZGVyLmNtZFF1ZXVlKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5zeW5jY2xpZW50ID0gdGhpcy5zdGFyY29kZXIuYXR0YWNoUGx1Z2luKFN5bmNDbGllbnQsXG4gICAgICAgIHRoaXMuc3RhcmNvZGVyLnNvY2tldCwgdGhpcy5zdGFyY29kZXIuY21kUXVldWUpO1xufTtcblxuU3BhY2UucHJvdG90eXBlLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgU2ltcGxlUGFydGljbGUuY2FjaGVUZXh0dXJlKHRoaXMuZ2FtZSwgVGhydXN0R2VuZXJhdG9yLnRleHR1cmVLZXksICcjZmY2NjAwJywgOCk7XG4gICAgU2ltcGxlUGFydGljbGUuY2FjaGVUZXh0dXJlKHRoaXMuZ2FtZSwgJ2J1bGxldCcsICcjOTk5OTk5JywgNCk7XG4gICAgU2ltcGxlUGFydGljbGUuY2FjaGVUZXh0dXJlKHRoaXMuZ2FtZSwgJ3RyYWN0b3InLCAnI2VlZWVlZScsIDgsIHRydWUpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdwbGF5ZXJ0aHJ1c3QnLCAnYXNzZXRzL3NvdW5kcy90aHJ1c3RMb29wLm9nZycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF1ZGlvKCdjaGltZScsICdhc3NldHMvc291bmRzL2NoaW1lLm1wMycpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKCdqb3lzdGljaycsICdhc3NldHMvam95c3RpY2svZ2VuZXJpYy1qb3lzdGljay5wbmcnLCAnYXNzZXRzL2pveXN0aWNrL2dlbmVyaWMtam95c3RpY2suanNvbicpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmJpdG1hcEZvbnQoJ3JlYWRvdXQteWVsbG93JyxcbiAgICAgICAgJ2Fzc2V0cy9iaXRtYXBmb250cy9oZWF2eS15ZWxsb3cyNC5wbmcnLCAnYXNzZXRzL2JpdG1hcGZvbnRzL2hlYXZ5LXllbGxvdzI0LnhtbCcpO1xufTtcblxuU3BhY2UucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdjcmVhdGUnKTtcbiAgICAvL3ZhciBybmcgPSB0aGlzLmdhbWUucm5kO1xuICAgIHZhciB3YiA9IHRoaXMuc3RhcmNvZGVyLmNvbmZpZy53b3JsZEJvdW5kcztcbiAgICB2YXIgcHMgPSB0aGlzLnN0YXJjb2Rlci5jb25maWcucGh5c2ljc1NjYWxlO1xuICAgIHRoaXMuZ2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLlAySlMpO1xuICAgIHRoaXMud29ybGQuc2V0Qm91bmRzLmNhbGwodGhpcy53b3JsZCwgd2JbMF0qcHMsIHdiWzFdKnBzLCAod2JbMl0td2JbMF0pKnBzLCAod2JbM10td2JbMV0pKnBzKTtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5wMi5zZXRCb3VuZHNUb1dvcmxkKHRydWUsIHRydWUsIHRydWUsIHRydWUsIGZhbHNlKTtcblxuICAgIC8vIERlYnVnZ2luZ1xuICAgIHRoaXMuZ2FtZS50aW1lLmFkdmFuY2VkVGltaW5nID0gdHJ1ZTtcblxuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzLnJlc2V0KCk7XG5cbiAgICAvLyBWaXJ0dWFsIGpveXN0aWNrXG4gICAgdGhpcy5zdGFyY29kZXIuY29udHJvbHMuYWRkVmlydHVhbENvbnRyb2xzKHRoaXMuZ2FtZS53aWR0aCAtIDI3NSwgdGhpcy5nYW1lLmhlaWdodCAtIDEwMCwgMC41LCAnam95c3RpY2snKTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMgPSB7fTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuc3RpY2sgPSB0aGlzLmdhbWUuam95c3RpY2suYWRkU3RpY2soXG4gICAgLy8gICAgdGhpcy5nYW1lLndpZHRoIC0gMTUwLCB0aGlzLmdhbWUuaGVpZ2h0IC0gNzUsIDEwMCwgJ2pveXN0aWNrJyk7XG4gICAgLy90aGlzLmdhbWUudmNvbnRyb2xzLnN0aWNrLnNjYWxlID0gMC41O1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5maXJlYnV0dG9uID0gdGhpcy5nYW1lLmpveXN0aWNrLmFkZEJ1dHRvbih0aGlzLmdhbWUud2lkdGggLSA1MCwgdGhpcy5nYW1lLmhlaWdodCAtIDc1LFxuICAgIC8vICAgICdqb3lzdGljaycsICdidXR0b24xLXVwJywgJ2J1dHRvbjEtZG93bicpO1xuICAgIC8vdGhpcy5nYW1lLnZjb250cm9scy5maXJlYnV0dG9uLnNjYWxlID0gMC41O1xuXG4gICAgLy8gU291bmRzXG4gICAgdGhpcy5nYW1lLnNvdW5kcyA9IHt9O1xuICAgIHRoaXMuZ2FtZS5zb3VuZHMucGxheWVydGhydXN0ID0gdGhpcy5nYW1lLnNvdW5kLmFkZCgncGxheWVydGhydXN0JywgMSwgdHJ1ZSk7XG4gICAgdGhpcy5nYW1lLnNvdW5kcy5jaGltZSA9IHRoaXMuZ2FtZS5zb3VuZC5hZGQoJ2NoaW1lJywgMSwgZmFsc2UpO1xuXG4gICAgLy8gQmFja2dyb3VuZFxuICAgIHZhciBzdGFyZmllbGQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBEYXRhKDYwMCwgNjAwKTtcbiAgICB0aGlzLnN0YXJjb2Rlci5kcmF3U3RhckZpZWxkKHN0YXJmaWVsZC5jdHgsIDYwMCwgMTYpO1xuICAgIHRoaXMuZ2FtZS5hZGQudGlsZVNwcml0ZSh3YlswXSpwcywgd2JbMV0qcHMsICh3YlsyXS13YlswXSkqcHMsICh3YlszXS13YlsxXSkqcHMsIHN0YXJmaWVsZCk7XG5cbiAgICB0aGlzLnN0YXJjb2Rlci5zeW5jY2xpZW50LnN0YXJ0KCk7XG4gICAgLy90aGlzLnN0YXJjb2Rlci5zb2NrZXQuZW1pdCgnY2xpZW50IHJlYWR5Jyk7XG4gICAgdGhpcy5zdGFyY29kZXIuc29ja2V0LmVtaXQoJ3JlYWR5Jyk7XG4gICAgdGhpcy5fc2V0dXBNZXNzYWdlSGFuZGxlcnModGhpcy5zdGFyY29kZXIuc29ja2V0KTtcblxuICAgIC8vIEdyb3VwcyBmb3IgcGFydGljbGUgZWZmZWN0c1xuICAgIHRoaXMuZ2FtZS50aHJ1c3RnZW5lcmF0b3IgPSBuZXcgVGhydXN0R2VuZXJhdG9yKHRoaXMuZ2FtZSk7XG5cbiAgICAvLyBHcm91cCBmb3IgZ2FtZSBvYmplY3RzXG4gICAgdGhpcy5nYW1lLnBsYXlmaWVsZCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgIC8vIFVJXG4gICAgdGhpcy5nYW1lLnVpID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgIHRoaXMuZ2FtZS51aS5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcblxuICAgIC8vIEludmVudG9yeVxuICAgIHZhciBsYWJlbCA9IHRoaXMuZ2FtZS5tYWtlLnRleHQodGhpcy5nYW1lLndpZHRoIC0gMTAwLCAyNSwgJ0lOVkVOVE9SWScsIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmY5OTAwJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgbGFiZWwuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZChsYWJlbCk7XG4gICAgLy90aGlzLmdhbWUuaW52ZW50b3J5dGV4dCA9IHRoaXMuZ2FtZS5tYWtlLnRleHQodGhpcy5nYW1lLndpZHRoIC0gMTAwLCA1MCwgJzAgY3J5c3RhbHMnLFxuICAgIC8vICAgIHtmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjY2NjMDAwJywgYWxpZ246ICdjZW50ZXInfSk7XG4gICAgdGhpcy5nYW1lLmludmVudG9yeXRleHQgPSB0aGlzLmdhbWUubWFrZS5iaXRtYXBUZXh0KHRoaXMuZ2FtZS53aWR0aCAtIDEwMCwgNTAsICdyZWFkb3V0LXllbGxvdycsICcwJyk7XG4gICAgdGhpcy5nYW1lLmludmVudG9yeXRleHQuYW5jaG9yLnNldFRvKDAuNSk7XG4gICAgdGhpcy5nYW1lLnVpLmFkZCh0aGlzLmdhbWUuaW52ZW50b3J5dGV4dCk7XG5cbiAgICAvL01pbmlNYXBcbiAgICB0aGlzLmdhbWUubWluaW1hcCA9IG5ldyBNaW5pTWFwKHRoaXMuZ2FtZSwgMzAwLCAzMDApO1xuICAgIHRoaXMuZ2FtZS51aS5hZGQodGhpcy5nYW1lLm1pbmltYXApO1xuICAgIHRoaXMuZ2FtZS54ID0gMTA7XG4gICAgdGhpcy5nYW1lLnkgPSAxMDtcblxuICAgIC8vIEhlbHBlcnNcbiAgICAvL2Z1bmN0aW9uIHJhbmRvbU5vcm1hbCAoKSB7XG4gICAgLy8gICAgdmFyIHQgPSAwO1xuICAgIC8vICAgIGZvciAodmFyIGk9MDsgaTw2OyBpKyspIHtcbiAgICAvLyAgICAgICAgdCArPSBybmcubm9ybWFsKCk7XG4gICAgLy8gICAgfVxuICAgIC8vICAgIHJldHVybiB0LzY7XG4gICAgLy99XG4gICAgLy9cbiAgICAvL2Z1bmN0aW9uIGRyYXdTdGFyIChjdHgsIHgsIHksIGQsIGNvbG9yKSB7XG4gICAgLy8gICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgLy8gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIC8vICAgIGN0eC5tb3ZlVG8oeC1kKzEsIHktZCsxKTtcbiAgICAvLyAgICBjdHgubGluZVRvKHgrZC0xLCB5K2QtMSk7XG4gICAgLy8gICAgY3R4Lm1vdmVUbyh4LWQrMSwgeStkLTEpO1xuICAgIC8vICAgIGN0eC5saW5lVG8oeCtkLTEsIHktZCsxKTtcbiAgICAvLyAgICBjdHgubW92ZVRvKHgsIHktZCk7XG4gICAgLy8gICAgY3R4LmxpbmVUbyh4LCB5K2QpO1xuICAgIC8vICAgIGN0eC5tb3ZlVG8oeC1kLCB5KTtcbiAgICAvLyAgICBjdHgubGluZVRvKHgrZCwgeSk7XG4gICAgLy8gICAgY3R4LnN0cm9rZSgpO1xuICAgIC8vfVxuICAgIC8vXG4gICAgLy9mdW5jdGlvbiBkcmF3U3RhckZpZWxkIChjdHgsIHNpemUsIG4pIHtcbiAgICAvLyAgICB2YXIgeG0gPSBNYXRoLnJvdW5kKHNpemUvMiArIHJhbmRvbU5vcm1hbCgpKnNpemUvNCk7XG4gICAgLy8gICAgdmFyIHltID0gTWF0aC5yb3VuZChzaXplLzIgKyByYW5kb21Ob3JtYWwoKSpzaXplLzQpO1xuICAgIC8vICAgIHZhciBxdWFkcyA9IFtbMCwwLHhtLTEseW0tMV0sIFt4bSwwLHNpemUtMSx5bS0xXSxcbiAgICAvLyAgICAgICAgWzAseW0seG0tMSxzaXplLTFdLCBbeG0seW0sc2l6ZS0xLHNpemUtMV1dO1xuICAgIC8vICAgIHZhciBjb2xvcjtcbiAgICAvLyAgICB2YXIgaSwgaiwgbCwgcTtcbiAgICAvL1xuICAgIC8vICAgIG4gPSBNYXRoLnJvdW5kKG4vNCk7XG4gICAgLy8gICAgZm9yIChpPTAsIGw9cXVhZHMubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgIC8vICAgICAgICBxID0gcXVhZHNbaV07XG4gICAgLy8gICAgICAgIGZvciAoaj0wOyBqPG47IGorKykge1xuICAgIC8vICAgICAgICAgICAgY29sb3IgPSAnaHNsKDYwLDEwMCUsJyArIHJuZy5iZXR3ZWVuKDkwLDk5KSArICclKSc7XG4gICAgLy8gICAgICAgICAgICBkcmF3U3RhcihjdHgsXG4gICAgLy8gICAgICAgICAgICAgICAgcm5nLmJldHdlZW4ocVswXSs3LCBxWzJdLTcpLCBybmcuYmV0d2VlbihxWzFdKzcsIHFbM10tNyksXG4gICAgLy8gICAgICAgICAgICAgICAgcm5nLmJldHdlZW4oMiw0KSwgY29sb3IpO1xuICAgIC8vICAgICAgICB9XG4gICAgLy8gICAgfVxuICAgIC8vfVxuXG59O1xuXG4vL1NwYWNlLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4vLyAgICBjb25zb2xlLmxvZygncmVzaXplJyk7XG4vL307XG5cblNwYWNlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gRklYTUU6IGp1c3QgYSBtZXNzIGZvciB0ZXN0aW5nXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuc3RhcmNvZGVyLmNvbnRyb2xzLnByb2Nlc3NRdWV1ZShmdW5jdGlvbiAoYSkge1xuICAgICAgICBpZiAoYS50eXBlID09PSAndXBfcHJlc3NlZCcpIHtcbiAgICAgICAgICAgIHNlbGYuZ2FtZS5wbGF5ZXJTaGlwLmxvY2FsU3RhdGUudGhydXN0ID0gJ3N0YXJ0aW5nJztcbiAgICAgICAgICAgIC8vc2VsZi5nYW1lLnNvdW5kcy5wbGF5ZXJ0aHJ1c3QucGxheSgpO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUudGhydXN0Z2VuZXJhdG9yLnN0YXJ0T24oc2VsZi5nYW1lLnBsYXllclNoaXApO1xuICAgICAgICB9IGVsc2UgaWYgKGEudHlwZSA9PT0gJ3VwX3JlbGVhc2VkJykge1xuICAgICAgICAgICAgc2VsZi5nYW1lLnBsYXllclNoaXAubG9jYWxTdGF0ZS50aHJ1c3QgPSAnc2h1dGRvd24nO1xuICAgICAgICAgICAgLy9zZWxmLmdhbWUuc291bmRzLnBsYXllcnRocnVzdC5zdG9wKCk7XG4gICAgICAgICAgICAvL3NlbGYuZ2FtZS50aHJ1c3RnZW5lcmF0b3Iuc3RvcE9uKHNlbGYuZ2FtZS5wbGF5ZXJTaGlwKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuU3BhY2UucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2NvbnNvbGUubG9nKCcrcmVuZGVyKycpO1xuICAgIC8vaWYgKHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUpIHtcbiAgICAvLyAgICB2YXIgZCA9IHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUucG9zaXRpb24ueCAtIHRoaXMuc3RhcmNvZGVyLnRlbXBzcHJpdGUucHJldmlvdXNQb3NpdGlvbi54O1xuICAgIC8vICAgIGNvbnNvbGUubG9nKCdEZWx0YScsIGQsIHRoaXMuZ2FtZS50aW1lLmVsYXBzZWQsIGQgLyB0aGlzLmdhbWUudGltZS5lbGFwc2VkKTtcbiAgICAvL31cbiAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpO1xuICAgIHRoaXMuZ2FtZS5kZWJ1Zy50ZXh0KCdGcHM6ICcgKyB0aGlzLmdhbWUudGltZS5mcHMsIDUsIDIwKTtcbiAgICAvL3RoaXMuZ2FtZS52Y29udHJvbHMuc3RpY2suZGVidWcodHJ1ZSwgdHJ1ZSk7XG4gICAgLy90aGlzLmdhbWUuZGVidWcuY2FtZXJhSW5mbyh0aGlzLmdhbWUuY2FtZXJhLCAxMDAsIDIwKTtcbiAgICAvL2lmICh0aGlzLnNoaXApIHtcbiAgICAvLyAgICB0aGlzLmdhbWUuZGVidWcuc3ByaXRlSW5mbyh0aGlzLnNoaXAsIDQyMCwgMjApO1xuICAgIC8vfVxufTtcblxuU3BhY2UucHJvdG90eXBlLl9zZXR1cE1lc3NhZ2VIYW5kbGVycyA9IGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc29ja2V0Lm9uKCdtc2cgY3J5c3RhbCBwaWNrdXAnLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHNlbGYuZ2FtZS5zb3VuZHMuY2hpbWUucGxheSgpO1xuICAgICAgICBUb2FzdC5zcGluVXAoc2VsZi5nYW1lLCBzZWxmLmdhbWUucGxheWVyU2hpcC54LCBzZWxmLmdhbWUucGxheWVyU2hpcC55LCAnKycgKyB2YWwgKyAnIGNyeXN0YWxzIScpO1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGFjZTtcbiIsIi8qKlxuICogTWluaU1hcC5qc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBNaW5pTWFwID0gZnVuY3Rpb24gKGdhbWUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBQaGFzZXIuR3JvdXAuY2FsbCh0aGlzLCBnYW1lKTtcblxuICAgIHZhciB4ciA9IHdpZHRoIC8gdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJXaWR0aDtcbiAgICB2YXIgeXIgPSBoZWlnaHQgLyB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckhlaWdodDtcbiAgICBpZiAoeHIgPD0geXIpIHtcbiAgICAgICAgdGhpcy5tYXBTY2FsZSA9IHhyO1xuICAgICAgICB0aGlzLnhPZmZzZXQgPSAteHIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckxlZnQ7XG4gICAgICAgIHRoaXMueU9mZnNldCA9IC14ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyVG9wICsgKGhlaWdodCAtIHhyICogdGhpcy5nYW1lLnN0YXJjb2Rlci5waGFzZXJIZWlnaHQpIC8gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1hcFNjYWxlID0geXI7XG4gICAgICAgIHRoaXMueU9mZnNldCA9IC15ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyVG9wO1xuICAgICAgICB0aGlzLnhPZmZzZXQgPSAteXIgKiB0aGlzLmdhbWUuc3RhcmNvZGVyLnBoYXNlckxlZnQgKyAod2lkdGggLSB5ciAqIHRoaXMuZ2FtZS5zdGFyY29kZXIucGhhc2VyV2lkdGgpIC8gMjtcbiAgICB9XG5cbiAgICB0aGlzLmdyYXBoaWNzID0gZ2FtZS5tYWtlLmdyYXBoaWNzKDAsIDApO1xuICAgIHRoaXMuZ3JhcGhpY3MuYmVnaW5GaWxsKDB4MDBmZjAwLCAwLjIpO1xuICAgIHRoaXMuZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgdGhpcy5ncmFwaGljcy5lbmRGaWxsKCk7XG4gICAgdGhpcy5ncmFwaGljcy5jYWNoZUFzQml0bWFwID0gdHJ1ZTtcbiAgICB0aGlzLmFkZCh0aGlzLmdyYXBoaWNzKTtcbn07XG5cbk1pbmlNYXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuR3JvdXAucHJvdG90eXBlKTtcbk1pbmlNYXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWluaU1hcDtcblxuTWluaU1hcC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vdGhpcy50ZXh0dXJlLnJlbmRlclhZKHRoaXMuZ3JhcGhpY3MsIDAsIDAsIHRydWUpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5nYW1lLnBsYXlmaWVsZC5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGJvZHkgPSB0aGlzLmdhbWUucGxheWZpZWxkLmNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoIWJvZHkubWluaXNwcml0ZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgYm9keS5taW5pc3ByaXRlLnggPSB0aGlzLndvcmxkVG9NbVgoYm9keS54KTtcbiAgICAgICAgYm9keS5taW5pc3ByaXRlLnkgPSB0aGlzLndvcmxkVG9NbVkoYm9keS55KTtcbiAgICAgICAgYm9keS5taW5pc3ByaXRlLmFuZ2xlID0gYm9keS5hbmdsZTtcbiAgICAvLyAgICB2YXIgeCA9IDEwMCArIGJvZHkueCAvIDQwO1xuICAgIC8vICAgIHZhciB5ID0gMTAwICsgYm9keS55IC8gNDA7XG4gICAgLy8gICAgdGhpcy50ZXh0dXJlLnJlbmRlclhZKGJvZHkuZ3JhcGhpY3MsIHgsIHksIGZhbHNlKTtcbiAgICB9XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZS53b3JsZFRvTW1YID0gZnVuY3Rpb24gKHgpIHtcbiAgICByZXR1cm4geCAqIHRoaXMubWFwU2NhbGUgKyB0aGlzLnhPZmZzZXQ7XG59O1xuXG5NaW5pTWFwLnByb3RvdHlwZS53b3JsZFRvTW1ZID0gZnVuY3Rpb24gKHkpIHtcbiAgICByZXR1cm4geSAqIHRoaXMubWFwU2NhbGUgKyB0aGlzLnlPZmZzZXQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1pbmlNYXA7Il19
