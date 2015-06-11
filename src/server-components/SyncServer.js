/**
 * Sync.js
 *
 * Mixin for world sync subsystem
 */

var Sync = function () {};

Sync.prototype.initSync = function () {
    var starcoder = this;
    this.nsSync = this.io.of('/sync');
    // New connection
    this.nsSync.on('connect', function (socket) {
        console.log('connect', socket.id);
        var player = starcoder.addPlayer(socket);     // FIXME: details
        socket.emit('new player', player.msgNew());
        socket.on('enter world', function () {
            var ship = starcoder.world.addShip();    // FIXME: API
            player.addShip(ship);
            //socket.emit('new object', [ship.msgNew()]);
        });
        socket.on('do', function (actions) {
            console.log(actions);
        });
    });
    // Send updates
    setInterval(this.sendUpdates.bind(this), this.config.updateInterval);
};

Sync.prototype.sendUpdates = function () {
    var world = this.world;
    var updateCache = {};
    var fullUpdateCache = {};
    var cachePointer;
    var pids = Object.keys(this.players);
    var wtime = world.time;
    var rtime = Date.now();
    for (var i = pids.length - 1; i >= 0; i--) {
        var player = this.players[pids[i]];
        var update = {w: wtime, r: rtime, b: []};
        for (var j = world.bodies.length - 1; j >= 0; j--) {
            var body = world.bodies[j];
            var full = body.newborn || player.newborn;
            if (full) {
                cachePointer = fullUpdateCache;
            } else {
                cachePointer = updateCache;
            }
            var b = cachePointer[body.id];
            if (!b) {
                b = body.getUpdatePacket(full);
                cachePointer[body.id] = b;
            }
            update.b.push(b);
        }
        player.socket.emit('update', update);
        player.newborn = false;
    }
    for (var j = world.bodies.length - 1; j >= 0; j--) {
        body = world.bodies[j];
        if (body.newborn) {
            body.newborn = false;
        }
    }
};

module.exports = Sync;