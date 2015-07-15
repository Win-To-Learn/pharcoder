"use strict";

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var serveStatic = require('./serveStatic')(app);
var Starcoder = require('./Starcoder-server.js');
var starcoder = new Starcoder(app, io);

server.listen(8081);
