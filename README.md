# Starcoder in Phaser

Not much here yet. Just a few hints for installing and running.

## Installation

You need to do `npm install` to get the node modules downloaded.

## Configuration

Game State and Network Protocols

Here is an overview of the major landmarks for game state when a user logs in and the network transitions that drive them.

Player is presented with login form defined in login.html
Player submits credentials over http. This is implemented as an AJAX request to a RESTful(ish) endpoint at /api/login. The content of the request is a JSON encoded Javascript object. For a guest login it's just {tag: SELECTED GAMERTAG}; for a registered login it's {user: USERNAME, pass: PASSWORD}.
The login information is received by the loginPOST function implemented in SessionHandler.js. Assuming the credentials check out, we create a "ticket" with the player's information in a special MongoDB collection, set the unique id of the ticket as a session variable, and redirect to `play.html'.
The server checks for the ticketid session variable before serving play.html. If it's not there it redirects back to login.html.
play.html contains our Phaser application. It starts off in a Phaser state called Boot that preloads a couple assets for a progress bar for the "real" Preload state.
In the boot state we made an AJAX call to the endpoint /api/identity. This in authenticated by the ticketid in the session variable and returns a JSON encoded object with the ticketid value as well as the address of the game server to login to. While we currently have a single server handling login and game logic, this architecture allows for the possibility of separating the two and directing users to an appropriate game server based on whatever business or load balancing logic we want.
After getting a response from REST endpoint, the client initiates a socket.io connection with the specified game server.
One the game server has accepted the connection, the client sends a socket.io 'login' message with the ticketid value. The server checks that the id corresponds with a known and recently logged in user (registered or guest) and replies with a 'loginSuccess' message containing a player data object that will allow the client to recognize itself in physics updates from the server.
Meanwhile, once the Boot state finishes preloading the progress bar assets, it switches to the Preload state where it loads the rest of the game assets.
Once the preloading has finished and the client has received the 'loginSuccess' message, the game switches to the Space state. The create function in the Space state sends a 'ready' message to the server which tells it to start sending physics updates.
Game Objects

Three folders contain files that implement objects in the same world: /src/bodies/client, /src/bodies/server, and /src/bodies/common. The general functions of each piece of the implementation are as follows:

Common

The modules in the /src/bodies/common folder have two properties each. BODY.proto contains properties to be added to the prototypes of both the client and server implementations of the BODY. BODY.updateProperties is an object with property names as keys and strings naming data types as values. These are properties of the object that the sync system will update on the client when they change on the server. It is important that these be defined identically on the client and the server because the sync system creates a table to encode them as numbers to decrease bandwidth.

Client

Most client implementations for bodies are pure boilerplate. Client bodies inherit from VectorSprite and also receive properties from SyncBodyInterface and their implementation from /src/bodies/common as mixins. In the common case where the visual representation of the body is simply given by the path in its shape property nothing else needs to be done. The base methods in VectorSprite will stroke the path according to the lineColor and lineWidth properties and fill according to fillColor and fillAlpha. Alternatively, the geometry property is provided for images composed of multiple different vector components. Currently the implementation only handles polygons.

Bodies with more complex visuals or that use different internal representations of their appearance need to override the drawProcedure(renderScale) method. The renderScale parameter will be less than 1 if the body is being drawn for the minimap. drawProcedure should use the Phaser.Graphics object provide at this.graphics to do its work.

Server

Server implementations inherit from SyncBodyBase. Derived classes need to set serverType and clientType to appropriate identifier strings. Usually these will be the same, but in some situations it may make sense to for different bodies to share implementations on one side but not the other. Four methods are used for collision handling: BeginCollision, EndCollision, BeginSense, and EndSense. Each of these accepts the collided with body as an argument. The XCollision methods are called for collisions with the "physical" extents of the body. The XSense methods are called for collisions with sensors shapes that are part of the body. These are used for detecting collisions that don't correspond with the physical extents of the body, i.e. for Aliens detecting nearby Ships at distance.

Example

Common

/**
 * src/common/bodies/TitaniumAsteroid.js
 */
'use strict';

var Paths = require('../Paths.js');

module.exports = {
    proto: {
        _lineColor : '#c0c0c0',
        _fillColor : '#ff0000',
        _shapeClosed : true,
        _lineWidth : 1,
        _fillAlpha : 0.25,
        _shape : Paths.octagon
    },

    updateProperties: {
        vectorScale: 'ufixed16'
    }
};
Server

/**
 * src/server/bodies/TitaniumAsteroid.js
 */
'use strict';

var p2 = require('p2');

var SyncBodyBase = require('./SyncBodyBase.js');

var Crystal = require('./Crystal.js');

var TitaniumAsteroid = function (starcoder, config) {
    SyncBodyBase.call(this, starcoder, config);
    this.damping = 0;
    this.angularDamping = 0;
    this.hits = 0;                  // Record number of bullet hits
};

// Static property
TitaniumAsteroid.material = new p2.Material();      // Materials hold physics properties like physics and restitution

// Boilerplate for prototypal inheritance
TitaniumAsteroid.prototype = Object.create(SyncBodyBase.prototype);
TitaniumAsteroid.prototype.constructor = TitaniumAsteroid;

/* All bodies need a distinct serverType but might share clientType if they have the same look and feel
 * In this case it would probably make more sense to just recycle the generic Asteroid client implementation and
 * use different colors, but as this is just an example, we use a new clientType.
 */
TitaniumAsteroid.prototype.clientType = 'TitaniumAsteroid';
TitaniumAsteroid.prototype.serverType = 'TitaniumAsteroid';

/* Collision groups allow us to limit the number of collisions that should be processed
 * If no group is set explicitly bodies are placed in a generic group
 * Collision groups are a somewhat limited resource (they are implemented as a bitmask), so we don't create new
 * ones for every new body type unless we need to fine tune collision behavior
 */
TitaniumAsteroid.prototype.collisionGroup = 'TitaniumAsteroid';
TitaniumAsteroid.prototype.collisionExclude = ['Tree'];         // List of CollisionGroups body does not collide with

TitaniumAsteroid.prototype.material = TitaniumAsteroid.material;
TitaniumAsteroid.prototype.tractorable = true;      // Can be grabbed by tractor beam

TitaniumAsteroid.prototype.explode = function (respawn) {
    // Add new crystal to world
    this.worldapi.addSyncableBody(Crystal, {
        x: this.position[0],
        y: this.position[1],
        mass: 10
    });
    // Remove self from world
    this.worldapi.removeSyncableBody(this);
    // Replace the asteroid with a new one somewhere randomly in the world
    if (respawn) {
        this.worldapi.addSyncableBody(TitaniumAsteroid, {
            position: {random: 'world'},
            velocity: {random: 'vector', lo: -15, hi: 15},
            angularVelocity: {random: 'float', lo: -15, hi: 15},
            vectorScale: {random: 'float', lo: 0.6, hi: 1.4},
            mass: 7
        });
    }
};
Client

/**
 * src/client/bodies/TitaniumAsteroid.js
 */
'use strict';

var Starcoder = require('../../common/Starcoder.js');

var VectorSprite = require('./VectorSprite.js');
var SyncBodyInterface = require('./SyncBodyInterface.js');

var TitaniumAsteroid = function (game, config) {
    VectorSprite.call(this, game, config);
};

TitaniumAsteroid.add = function (game, options) {
    var a = new TitaniumAsteroid(game, options);
    game.add.existing(a);
    return a;
};

// Boilerplate for prototypal inheritance
TitaniumAsteroid.prototype = Object.create(VectorSprite.prototype);
TitaniumAsteroid.prototype.constructor = TitaniumAsteroid;

// VectorSprite parent provides drawing functions; SyncBodyInterface mixin is for property sync
Starcoder.mixinPrototype(TitaniumAsteroid.prototype, SyncBodyInterface.prototype);

module.exports = TitaniumAsteroid;
