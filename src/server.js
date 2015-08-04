"use strict";

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var serveStatic = require('./serveStatic')(app);
var Starcoder = require('./Starcoder-server.js');

//var argv = require('minimist')(process.argv.slice(2));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var starcoder = new Starcoder(app, io);

server.listen(8080, starcoder.config.serverAddress || '0.0.0.0');

