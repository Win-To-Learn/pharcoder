/**
 * Created by jay on 5/30/15.
 */

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);


io.on('connect', function (socket) {
    console.log('connect', socket.id);
    socket.on('ready', function () {
        socket.emit('add ship', {x: 0, y: 0, id: socket.id});
    });
});

server.listen(8080);