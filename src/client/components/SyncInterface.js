/**
 * SyncInterface.js
 * Client side
 */
'use strict';

var UPDATE_QUEUE_LIMIT = 8;

module.exports = {
    init: function () {
        var self = this;
        this.registerField('type', 'string');
        this.knownBodies = {};
        this.events.on('sync', deserializeWorld.bind(this));
    }
};

var deserializeWorld = function () {
    //this.msgBufIn.skip(4);        // First word is length
    var rtime = this.msgBufIn.readUInt32();
    var nRemoved = this.msgBufIn.readUInt16();
    var removed = [];
    for (var i = 0; i < nRemoved; i++) {
        removed.push(this.msgBufIn.readUInt16());
    }
    var nBodies = this.msgBufIn.readUInt16();
    for (i = 0; i < nBodies; i++) {
        var update = deserializeBody(this.msgBufIn);
        var id = update.id;
        //update.timestamp = rtime;
        var sprite;
        if (sprite = this.knownBodies[id]) {
            // Old body
            // Add physics update to queue
            update.physics.timestamp = rtime;
            sprite.updateQueue.push(update.physics);
            // Update non-physics properties if necessary
            if (Object.keys(update.props).length) {
                sprite.config(update.props);
            }
            // Age queue
            if (sprite.updateQueue.length > UPDATE_QUEUE_LIMIT) {
                sprite.updateQueue.shift();
            }
        } else {
            // New body
            sprite = this.addBody(update.props.type, update.props);
            if (sprite) {
                //console.log('Adding', update.props.type, id, 'successful');
                sprite.serverId = id;
                this.knownBodies[id] = sprite;
                sprite.updateQueue = [update.physics];
            }
        }
    }
    // Removed old bodies
    for (i = 0; i < nRemoved; i++) {
        sprite = this.knownBodies[removed[i]];
        if (sprite) {
            this.removeBody(sprite);
            delete this.knownBodies[removed[i]];
        }
    }
};

var deserializeBody = function (buf) {
    var update = {physics: {}, props: {}};
    update.id = buf.readUInt16();
    update.physics.x = buf.readFixed32();
    update.physics.y = buf.readFixed32();
    //update.physics.vx = buf.readFixed32();
    //update.physics.vy = buf.readFixed32();
    update.physics.a = buf.readFixed16();
    //update.physics.av = buf.readFixed16();
    var nFields = buf.readUInt16();
    if (nFields > 0) {
        for (var i = 0; i < nFields; i++) {
            buf.readFieldValue(update.props);
        }
    }
    return update;
};