/**
 * Starcoder-server.js
 *
 * Starcoder master object extended with server only properties and methods
 */
'use strict';

var Starcoder = require('../common/Starcoder.js');

var API = require('./code/API.js');

//var World = require('./bodies/World.js');

/**
 * Initialize Starcoder server
 *
 * @param app {object} - Express app object for REST interface
 * @param io {object} Socket.io object for bidirectional communication
 */
Starcoder.prototype.init = function (app, io) {
    this.app = app;
    this.io = io;
    this.players = {};          // Logged in schema
    this.playerList = [];
    this.implementFeature(require('./../common/components/MsgBufferInterface.js'));
    this.registerField('up', 'boolean');
    this.implementFeature(require('./components/PhysicsWorldInterface.js'));
    this.implementFeature(require('./components/NetworkInterface.js'));
    this.implementFeature(require('./components/SessionHandler.js'));
    this.implementFeature(require('./components/StaticServer.js'));
    this.implementFeature(require('./components/LoginEndpoint.js'));
    this.implementFeature(require('./components/LeaderBoardEndpoint.js'));
    //this.implementFeature(require('./components/ControlEndPoint.js'));
    this.implementFeature(require('./components/ControlInterface.js'));
    this.implementFeature(require('./components/CollisionHandlers.js'));
    this.implementFeature(require('./components/SyncServer.js'));
    this.implementFeature(require('./components/MsgServer.js'));
    this.implementFeature(require('./components/CodeEndpointServer.js'));
    this.implementFeature(require('./components/MongoInterface.js'));
    this.implementFeature(require('./components/TutorialInterface.js'));
    this.implementFeature(require('./components/TicketHandler.js'));
    this.implementFeature(require('./components/MessageInterface.js'));
    this.newLeaderBoardCategory('Ships Tagged');
    this.newLeaderBoardCategory('Tag Streak');
    this.newLeaderBoardCategory('Trees Planted');
    var self = this;
    this.io.set('origins', '*:*'); // no domain when coming from native mobile
    this.io.on('connect', function (socket) {
        //self.pending[socket.id] = socket;
        //for (var i = 0, l = self.onConnectCB.length; i < l; i++) {
        //    self.onConnectCB[i].bind(self, socket)();
        //}
        self.events.emit('connect', socket);
        socket.on('disconnect', self.onDisconnect.bind(self, socket));
    });
    //this.world.start(1/60);
    this.mongoConnect();
    //this.events.on('dbConnected', function () {
    //    setInterval(function () {
    //        self.events.emit('syncTick');
    //    }, self.config.syncInterval);
    //    setInterval(function () {
    //        self.events.emit('netTick');
    //    }, self.config.netInterval);
    //    setInterval(function () {
    //        self.events.emit('physicsTick');
    //    }, self.config.physicsInterval);
    //});
    this.go(function () {
        console.log('Simulation started');
        setInterval(function () {
            self.events.emit('syncTick');
        }, self.config.syncInterval);
        //setInterval(function () {
        //    self.events.emit('netTick');
        //}, self.config.netInterval);
        setInterval(function () {
            self.events.emit('physicsTick');
        }, self.config.physicsInterval);
    });
    API.init(this);
};

Starcoder.prototype.onDisconnect = function (socket) {
    var player = this.players[socket.id];
    if (player) {
        //for (var i = 0, l = this.onDisconnectCB.length; i < l; i++) {
        //    this.onDisconnectCB[i].call(this, socket, player);
        //}
        this.events.emit('disconnect', socket, player);
        var i = this.playerList.indexOf(player);
        this.playerList.splice(i, 1);
        delete this.players[socket.id];
        this.worldapi.removeSyncableBody(player.getShip());
    }
    // TODO: Confirm no other socket.io methods need to be called
};

Starcoder.prototype.onReady = function (player) {
    var self = this;
    this.addPlayer(player);
    this.worldapi.addPlayerShip(player);
    // Set up heartbeat / latency measure
    player.socket.emit('timesync', self.hrtime());
    setInterval(function () {
        player.socket.emit('timesync', self.hrtime());
    }, self.config.timeSyncFreq*1000);
    // Call ready CBs for attached interfaces
    //for (var i = 0, l = self.onReadyCB.length; i < l; i++) {
    //    this.onReadyCB[i].bind(this, player)();
    //}
    this.events.emit('ready', player);
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
