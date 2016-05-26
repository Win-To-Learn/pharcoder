/**
 * server.js
 */
'use strict';

require('es6-promise').polyfill();

var commonConfig = require('./common/config.js');
var serverConfig = require('./server/config.js');
var buildConfig = buildConfig || {};

var fs = require('fs');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server, serverConfig.ioServerOptions);
var Starcoder = require('./server/Starcoder-server.js');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Content-Length, Accept, X-Requested-With, *");
    next();
});

buildConfig.version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
var starcoder = new Starcoder([commonConfig, serverConfig, buildConfig], app, io);

//console.log('DBG', process.env.NODE_ENV, 'P', process.env.PORT, 'IP', process.env.IP);

//server.listen(process.env.PORT, starcoder.config.serverAddress || '0.0.0.0');
server.listen(process.env.NODE_ENV == 'production' ? 7610 : 8080, starcoder.config.serverAddress || '0.0.0.0');
console.log('Listening on ', starcoder.config.serverAddress || '0.0.0.0',
    process.env.NODE_ENV == 'production' ? 7610 : 8080);

//server.listen(8080, starcoder.config.serverAddress || '0.0.0.0');