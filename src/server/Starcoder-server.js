/**
 * Starcoder-server.js
 *
 * Starcoder master object extended with server only properties and methods
 */
'use strict';

var EventEmitter = require('events').EventEmitter;

var Starcoder = require('../common/Starcoder.js');
var SyncServer = require('./components/SyncServer.js');
var MsgServer = require('./components/MsgServer.js');
var ControlEndPoint = require('./components/ControlEndPoint.js');
var CollisionHandlers = require('./components/CollisionHandlers.js');
var CodeEndpointServer = require('./components/CodeEndpointServer.js');
var LoginEndpoint = require('./components/LoginEndpoint.js');
var LeaderBoardEndpoint = require('./components/LeaderBoardEndpoint.js');
var StaticServer = require('./components/StaticServer.js');
var MongoInterface = require('./components/MongoInterface.js');
var SessionHandler = require('./components/SessionHandler.js');
var TutorialInterface = require('./components/TutorialInterface.js');
var TicketHandler = require('./components/TicketHandler.js');

var API = require('./code/API.js');

var World = require('./bodies/World.js');

/**
 * Initialize Starcoder server
 *
 * @param app {object} - Express app object for REST interface
 * @param io {object} Socket.io object for bidirectional communication
 */
Starcoder.prototype.init = function (app, io) {
    this.app = app;
    this.io = io;
    this.events = new EventEmitter();
    this.players = {};          // Logged in schema
    this.playerList = [];
    this.onConnectCB = [];
    this.onLoginCB = [];
    this.onReadyCB = [];
    this.onDisconnectCB = [];
    this.world = new World(this, this.config.worldBounds, this.config.initialBodies);
    this.world.log = this.log;
    this.implementFeature(SessionHandler);
    this.implementFeature(StaticServer);
    this.implementFeature(LoginEndpoint);
    this.implementFeature(LeaderBoardEndpoint);
    this.implementFeature(ControlEndPoint);
    this.implementFeature(CollisionHandlers);
    this.implementFeature(SyncServer);
    this.implementFeature(MsgServer);
    this.implementFeature(CodeEndpointServer);
    this.implementFeature(MongoInterface);
    this.implementFeature(TutorialInterface);
    this.implementFeature(TicketHandler);
    this.newLeaderBoardCategory('Ships Tagged');
    this.newLeaderBoardCategory('Tag Streak');
    this.newLeaderBoardCategory('Trees Planted');
    var self = this;
    this.io.set('origins', '*:*'); // no domain when coming from native mobile
    this.io.on('connect', function (socket) {
        //self.pending[socket.id] = socket;
        for (var i = 0, l = self.onConnectCB.length; i < l; i++) {
            self.onConnectCB[i].bind(self, socket)();
        }
        socket.on('disconnect', self.onDisconnect.bind(self, socket));
    });
    //this.world.start(1/60);
    this.mongoConnect(function () {
        self.world.start(1/60);
    });
    API.init(this);
};

Starcoder.prototype.onDisconnect = function (socket) {
    var player = this.players[socket.id];
    for (var i = 0, l = this.onDisconnectCB.length; i < l; i++) {
        this.onDisconnectCB[i].call(this, socket, player);
    }
    if (player) {
        i = this.playerList.indexOf(player);
        this.playerList.splice(i, 1);
        delete this.players[socket.id];
        this.world.removeSyncableBody(player.getShip());
    }
    // TODO: Confirm no other socket.io methods need to be called
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

// Not sure this should go here; maybe move into component
Starcoder.prototype.getServerUri = function (player, req) {
    // TODO: Use database
    var serverUri;
    serverUri = this.config.serverUri;
    if (!serverUri) {
        var protocol = this.config.serverProtocol || req.protocol || 'http';
        var host = this.config.serverHost || req.hostname || 'localhost';
        var port = this.config.serverPort || req.port || 7610;
        serverUri = protocol + '://' + host + ':' + port;
    }
    return serverUri;
};

Starcoder.prototype.addPlayer = function (player) {
    this.players[player.socket.id] = player;
    if (player.disambiguate) {
        player.disambiguate(this.playerList);
    }
    this.playerList.push(player);
};

Starcoder.prototype.banner = function () {
    console.log('Starcoder server v' + this.config.version, 'started at', Date());
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

module.exports = Starcoder;
