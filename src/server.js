/**
 * server.js
 */
'use strict';

//starting point for starcoder

//polyfill runs new code in old browsers
require('es6-promise').polyfill();

//world bounds, framerate, default latency etc.
var commonConfig = require('./common/config.js');

//initial starcoder bodies configs -- initial bodies, mongouri etc.
var serverConfig = require('./server/config.js');

//something from the gulpfile which runs browserify, android build stuff etc.
var buildConfig = buildConfig || {};

var fs = require('fs');
var app = require('express')();
var server = require('http').Server(app);
//ioserveroptions are in config.js
var io = require('socket.io')(server, serverConfig.ioServerOptions);
var Starcoder = require('./server/Starcoder-server.js');

//various browser config options
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Content-Length, Accept, X-Requested-With, *");
    next();
});

buildConfig.version = JSON.parse(fs.readFileSync('../package.json', 'utf8')).version;
var starcoder = new Starcoder([commonConfig, serverConfig, buildConfig], app, io);

//console.log('DBG', process.env.NODE_ENV, 'P', process.env.PORT, 'IP', process.env.IP);

//server.listen(process.env.PORT, starcoder.config.serverAddress || '0.0.0.0');
server.listen(process.env.NODE_ENV == 'production' ? 7610 : 8080, starcoder.config.serverAddress || '0.0.0.0');
console.log('Listening on ', starcoder.config.serverAddress || '0.0.0.0',
    process.env.NODE_ENV == 'production' ? 7610 : 8080);

//server.listen(8080, starcoder.config.serverAddress || '0.0.0.0');