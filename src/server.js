/**
 * server.js
 */
'use strict';

var commonConfig = require('./common/config.js');
var serverConfig = require('./server/config.js');
var buildConfig = buildConfig || {};

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Starcoder = require('./Starcoder-server.js');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Content-Length, Accept, X-Requested-With, *");
    next();
});

var starcoder = new Starcoder([commonConfig, serverConfig, buildConfig], app, io);


server.listen(process.env.NODE_ENV == 'production' ? 7610 : 8080, starcoder.config.serverAddress || '0.0.0.0');
//server.listen(8080, starcoder.config.serverAddress || '0.0.0.0');