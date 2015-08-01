/**
 * Starcoder-server.js
 *
 * Starcoder master object extended with server only properties and methods
 */
'use strict';

var Starcoder = require('./Starcoder.js');
var SyncServer = require('./server-components/SyncServer.js');
var MsgServer = require('./server-components/MsgServer.js');
var ControlEndPoint = require('./server-components/ControlEndPoint.js');
var CollisionHandlers = require('./server-components/CollisionHandlers.js');
var CodeEndpointServer = require('./server-components/CodeEndpointServer.js');
var LoginEndpoint = require('./server-components/LoginEndpoint.js');
var LeaderBoardEndpoint = require('./server-components/LeaderBoardEndpoint.js');

var World = require('./serverbodies/World.js');

//Starcoder.mixinPrototype(Starcoder.prototype, SyncServer.prototype);
//Starcoder.mixinPrototype(Starcoder.prototype, ControlEndPoint.prototype);
//Starcoder.mixinPrototype(Starcoder.prototype, CollisionHandlers.prototype);
//Starcoder.mixinPrototype(Starcoder.prototype, MsgServer.prototype);
//Starcoder.mixinPrototype(Starcoder.prototype, CodeEndpointServer.prototype);
//Starcoder.mixinPrototype(Starcoder.prototype, LoginEndpoint.prototype);
//Starcoder.mixinPrototype(Starcoder.prototype, LeaderBoardEndpoint.prototype);

/**
 * Initialize Starcoder server
 *
 * @param app {object} - Express app object for REST interface
 * @param io {object} Socket.io object for bidirectional communication
 */
Starcoder.prototype.init = function (app, io) {
    this.app = app;
    this.io = io;
    this.players = {};          // Logged in players
    this.pending = {};          // Connections pending login
    this.onConnectCB = [];
    this.onLoginCB = [];
    this.onReadyCB = [];
    this.world = new World(this.config.worldBounds, this.config.initialBodies);
    this.world.starcoder = this;
    this.world.log = this.log;
    //this.initLoginEndpoint();
    this.implementFeature(LoginEndpoint);
    //this.initLeaderBoardEndpoint();
    this.implementFeature(LeaderBoardEndpoint);
    //this.initControlEndPoint();
    this.implementFeature(ControlEndPoint);
    //this.initCollisionHandlers();
    this.implementFeature(CollisionHandlers);
    //this.initSyncServer();
    this.implementFeature(SyncServer);
    //this.initMsgServer();
    this.implementFeature(MsgServer);
    //this.initCodeEndpointServer();
    this.implementFeature(CodeEndpointServer);
    //this.initSessions();
    //this.initRESTEndpoint();
    this.initSocket();
    this.newLeaderBoardCategory('Ships Tagged');
    this.newLeaderBoardCategory('Tag Streak');
    this.newLeaderBoardCategory('Trees Planted');
    this.world.start(1/60);
};

Starcoder.prototype.initSocket = function () {
    var self = this;
    this.io.on('connect', function (socket) {
        self.pending[socket.id] = socket;
        for (var i = 0, l = self.onConnectCB.length; i < l; i++) {
            self.onConnectCB[i].bind(self, socket)();
        }
    });
        //var player = self.newPlayer(socket);     // FIXME: details
        //socket.emit('server ready', player.msgNew());
        //socket.on('login', function (credentials) {
        //    self.checkLogin(credentials,
        //        function (player) {
        //            player.socket = socket;
        //        },
        //        function (msg) {
        //            // FIXME: noop
        //        });
        //});
    //    socket.on('client ready', function () {
    //        self.addPlayer(player);
    //        self.world.addPlayerShip(player);
    //        socket.emit('timesync', self.hrtime());
    //        setInterval(function () {
    //            socket.emit('timesync', self.hrtime());
    //        }, self.config.timeSyncFreq*1000);
    //        //self.attachActions(player);
    //        //self.controlEndPointReady(player);
    //        //self.syncServerReady(player);
    //        for (var i = 0, l = self.clientReadyFunctions.length; i < l; i++) {
    //            self.clientReadyFunctions[i](player);
    //        }
    //    });
    //})
};

Starcoder.prototype.onReady = function (player) {
    var self = this;
    this.addPlayer(player);
    this.world.addPlayerShip(player);
    // Set up heartbeat / latency measure
    player.socket.emit('timesync', self.hrtime());
    setInterval(function () {
        player.socket.emit('timesync', self.hrtime());
    }, self.config.timeSyncFreq*1000);
    // Call ready CBs for attached interfaces
    for (var i = 0, l = self.onReadyCB.length; i < l; i++) {
        this.onReadyCB[i].bind(this, player)();
    }
};

//Starcoder.prototype.newPlayer = function (socket, type, descriptor) {
//    if (!type) {
//        type = Guest;
//    } else {
//        type = Players.playerTypes[type];
//    }
//    var player = new type(socket, descriptor);
//    return player;
//};

Starcoder.prototype.addPlayer = function (player) {
    this.players[player.socket.id] = player;
};

/**
 * Get high resolution time in milliseconds
 *
 * @returns {number}
 */
Starcoder.prototype.hrtime = function () {
    var hr = process.hrtime();
    return Math.floor(hr[0]*1000 + hr[1]*1e-6);
};


Starcoder.prototype.role = 'Server';

// FIXME: Extend object

module.exports = Starcoder;
