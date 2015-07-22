/**
 * Sessions.js
 */
'use strict';

var expressSession = require('express-session');

var Sessions = function () {};

Sessions.prototype.initSessions = function () {
    var session = expressSession({
        secret: 'blahblah',
        resave: false,
        saveUninitialized: false
    });
    this.app.use(session);
    // Use wrapped middlewear for socket io
    this.io.use(function (socket, next) {
        //console.log(socket);
        session(socket.request, socket.request.res, next);
    });
};

module.exports = Sessions;