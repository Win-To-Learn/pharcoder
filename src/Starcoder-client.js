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
