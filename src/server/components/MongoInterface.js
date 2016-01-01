/**
 * Created by jay on 9/6/15.
 */
'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
//var bcrypt = require('bcryptjs');

var Player = require('../../schema/Player.js');
var Guest = require('../../schema/Guest.js');

var constructorMap = {
    'Player': Player,
    'Guest': Guest
};

/**
 * Take POJO returned by mongo and add prototypes to known types
 *
 * @param o {object|Array}
 * @returns {*}
 */
function restore (o) {
    if (Array.isArray(o)) {
        // Array - restore each element
        for (var i = 0, l = o.length; i < l; i++) {
            if (typeof o[i] === 'object') {
                o[i] = restore(o[i]);
            }
        }
    } else {
        // Object
        // Loop through properties and restore recursively
        for (var k in o) {
            if (o.hasOwnProperty(k) && typeof o[k] === 'object') {
                o[k] = restore(o[k]);
            }
        }
        // Make into appropriate type
        if (o.cType) {
            // Only deal with known constructors
            var ctor = constructorMap[o.cType], proto = ctor.prototype;
            if (proto.restore) {
                // If prototype has a restore function, create a new instance and let it restore state from the old
                var n = Object.create(proto);
                if (n.init) {
                    n.init();
                }
                n.restore(o);
                o = n;
            } else {
                // No restore - assume constructor can handle it
                o = new ctor(o);
            }
        }
    }
    return o;
}

var save = function (o) {
    if (Array.isArray(o)) {
        // Array - save each element
        for (var i = 0, l = o.length; i < l; i++) {
            if (typeof o[i] === 'object') {
                o[i] = save(o[i]);
            }
        }
    } else {
        // Object
        // Make into appropriate type
        if (o.save) {
            o = o.save();
        }
        // Loop through properties and save recursively
        for (var k in o) {
            if (o.hasOwnProperty(k) && typeof o[k] === 'object') {
                o[k] = restore(o[k]);
            }
        }
    }
    return o;
};

module.exports = {
    /**
     * Make initial connection to MongoDB
     * @param {function} cb - Callback on successful connect
     */
    mongoConnect: function (cb) {
        var self = this;
        MongoClient.connect(this.config.mongoUri, function (err, db) {
            if (err) {
                console.log('Could not connect to MongoDB. Exiting.');
                process.exit(1);
            }
            console.log('Connected to MongoDB', db.databaseName);
            self.mongoDB = db;
            self.mongoPeople = db.collection('people');
            self.mongoGuests = db.collection('guests');
            cb();
        })
    },

    //getPlayerByUsername: function (username, cb) {
    //    this.mongoPeople.findOne({username: username}).then(cb, this.handleDBError.bind(this));
    //},

    //checkPlayerLogin: function (gamertag, password, cb) {
    //    this.mongoPeople.findOne({username: gamertag}).then(function (playerRec) {
    //        bcrypt.compare(password, playerRec.password, function (err, match) {
    //
    //        })
    //    }, this.handleDBError.bind(this));
    //},

    /**
     * Interface for querying mongo collection and (usually) returning Starcoder objects
     * @param {Collection} col - Collection to query
     * @param {object} query - Query object
     * @param {function} cb - Callback to receive results
     * @param {number} limit - Limit on number of results (0 => no limit)
     * @param {object} projection - Fields to include or exclude from result
     * @param {boolean} raw - return POJO instead of mapped object
     */
    mongoFind: function (col, query, cb, limit, projection, raw) {
        var self = this;
        var cur = col.find(query, projection);
        if (limit) {
            cur = cur.limit(limit);
            if (limit === 1) {
                var prom = cur.next();
            }
        } else {
            prom = c.toArray();
        }
        prom.then(function (res) {
            if (raw) {
                cb(res);
            } else if (limit && limit === 1) {
                cb(restore(res));
            } else {
                for (var i = 0, l = res.length; i < l; i++) {
                    res[i] = restore(res[i]);
                }
                cb(res);
            }
        }, self.handleDBError.bind(self));
    },

    /**
     * Get subset of player info sufficient to check login
     * @param {string} gamertag - Identifier for player
     * @param {function} cb - Callback to receive results
     */
    getPlayerLoginInfo: function (gamertag, cb) {
        this.mongoFind(this.mongoPeople, {username: gamertag}, cb, 1, {username: 1, password: 1, _id: 1});
    },

    /**
     * Get regime info by regime id
     * @param regimeId - Regime id
     * @param {function} cb - Callback to receive results
     */
    getRegimeLoginInfo: function (regimeId, cb) {

    },

    getPlayerByGamertag: function (gamertag, projection, cb) {
        if (typeof projection === 'function') {
            cb = projection;
            projection = null;
        }
        this.mongoPeople.findOne({username: gamertag}, projection).then(function (record) {
            if (projection) {
                cb(record);
            } else {
                cb(restore(record));
            }
        }, this.handleDBError.bind(this));
    },

    getNewGuest: function (tagname, server, cb) {
        this.mongoGuests.insertOne({username: tagname}).then(function (result) {
            cb(result.ops[0]);
        }, this.handleDBError.bind(this));
    },

    getPlayerOrGuest: function (spec, cb) {
        if (spec.role === 'player') {
            var col = this.mongoPeople;
        } else {
            col = this.mongoGuests;
        }
        col.findOne({_id: ObjectId.createFromHexString(spec._id)}).then(function (record) {
            //if (spec.role === 'player') {
            //    cb(Player.fromDB(record));
            //} else {
            //    cb(Guest.fromDB(record));
            //}
            cb(restore(record));
        }, this.handleDBError.bind(this));
    },

    updatePlayerSnippets: function (player, cb) {
        this.mongoPeople.findOneAndUpdate({_id: player.id}, {$set: {codeSnippets: player.codeSnippets}}).then(cb,
            this.handleDBError.bind(this));
    },

    registerUser: function (username, password, cb) {
        this.mongoPeople.insertOne({username: username, password: password, codeSnippets: {}}).then(function (res) {
            cb(res.ops[0]);
        }, this.handleDBError.bind(this))
    },

    handleDBError: function (err) {
        // FIXME: be smarter
        console.log('DB Error', err);
    }
};