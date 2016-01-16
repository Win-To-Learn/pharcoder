/**
 * MongoInterface.js
 */
'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
//var bcrypt = require('bcryptjs');

var Player = require('../../schema/Player.js');
var Guest = require('../../schema/Guest.js');
var TrialPlayer = require('../../schema/TrialPlayer.js');
var Regime = require('../../schema/Regime.js');

var constructorMap = {
    'Player': Player,
    'Guest': Guest,
    'TrialPlayer': TrialPlayer,
    'Regime': Regime
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
    var ctype = o.cType;
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
            if (o.hasOwnProperty(k) && o[k] && typeof o[k] === 'object') {
                o[k] = save(o[k]);
            }
        }
    }
    if (ctype) {
        o.cType = ctype;
    }
    return o;
};

module.exports = {
    /**
     * Set up cache
     */
    init: function () {
        this.mongoCache = {};
    },

    /**
     * Add object to cache
     * @param {string} cat - Category (basic namespacing)
     * @param {string} id
     * @param {object} o - Object to be cached
     * @param {number} timeout - Cache lifetime of object (ms)
     */
    cacheObject: function (cat, id, o, timeout) {
        var cache = this.mongoCache[cat];
        if (!cache) {
            cache = {};
            this.mongoCache[cat] = cache;
        }
        if (!timeout) {
            timeout = 1e12;     // i.e. a long time
        }
        o.cacheTimeout = Date.now() + timeout;
        cache[id] = o;
    },

    /**
     * Retrieve cached object or null if unavailable or expired
     * @param cat
     * @param id
     * @return {object}
     */
    getCachedObject: function (cat, id) {
        var cache = this.mongoCache[cat];
        if (!cache) {
            return undefined;
        }
        var o = cache[id];
        if (o && o.cacheTimeout < Date.now()) {
            return o;
        }
        return null;
    },

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
            self.mongoRegimes = db.collection('regimes');
            self.events.emit('dbConnected');
            cb();
        })
    },

    /**
     * Interface for querying mongo collection and (usually) returning Starcoder objects
     * @param {Collection} col - Collection to query
     * @param {object} query - Query object
     * @param {number} limit - Limit on number of results (0 => no limit)
     * @param {object} projection - Fields to include or exclude from result
     * @param {boolean} raw - return POJO instead of mapped object
     * @return {Promise}
     */
    mongoFind: function (col, query, limit, projection, raw) {
        var cur = col.find(query, projection);
        if (limit) {
            cur = cur.limit(limit);
            if (limit === 1) {
                var prom = cur.next();
            }
        } else {
            prom = cur.toArray();
        }
        return prom.then(function (res) {
            if (raw) {
                return res;
            } else if (limit && limit === 1) {
                return restore(res);
            } else {
                for (var i = 0, l = res.length; i < l; i++) {
                    res[i] = restore(res[i]);
                }
                return res;
            }
        }, this.handleDBError.bind(this));
    },

    /**
     * Insert a single document into a mongo collection
     * @param {Collection} col - Collection to receive document
     * @param {object} o - Document to insert
     * @return {Promise}
     */
    mongoInsertOne: function (col, o) {
        var doc = save(o);
        if (doc._id && typeof doc._id === 'string') {
            doc._id = new ObjectId(doc._id);
        }
        return col.insertOne(doc, null).then(function (res) {
            if (res.insertedCount === 1) {
                if (typeof o.id !== 'undefined') {
                    o.id = res.insertedId.toHexString();
                }
                return res.ops[0];
            } else {
                return Promise.reason('Problem inserting record into database');
            }
        }, this.handleDBError.bind(this));
    },

    /**
     * Get player by gamertag
     * @param {string} gamertag - Identifier for player
     * @return {Promise}
     */
    getPlayerByGamertag: function (gamertag) {
        var self = this;
        //this.mongoFind(this.mongoPeople, {username: gamertag}, function (player) {
        //    if (player) {
        //        self.cacheObject('player', player.id, player, 10000);
        //        cb(player);
        //    } else {
        //        cb(null);
        //    }
        //}, 1);
        return this.mongoFind(this.mongoPeople, {username: gamertag}, 1).then(function (player) {
            if (player) {
                self.cacheObject('player', player.id, player, 10000);
                return player;
            } else {
                return null;
            }
        })
    },

    /**
     * Get player object by _id key
     * @param {string} id
     * @param {boolean} skipcache - Ignore cache and force DB access
     * @return {Promise}
     */
    getPlayerById: function (id, skipcache) {
        var self = this;
        if (!skipcache) {
            var p = this.getCachedObject('player', id);
        }
        if (!p) {
            return this.mongoFind(this.mongoPeople, {_id: new ObjectId(id)}, 1).then(function (player) {
                if (player) {
                    self.cacheObject('player', id, player, 10000);
                    return player;
                } else {
                    return null;
                }
            });
        } else {
            return Promise.resolve(p);
        }
    },

    /**
     * Get regime info by regime id
     * @param regimeId - Regime id
     * @param {function} cb - Callback to receive results
     */
    getRegimeLoginInfo: function (regimeId, cb) {

    },

    /**
     * Register new player under regime with given code, if possible
     * @param {string} code
     * @param {string} gamertag
     * @param {string} password
     * @return {Promise}
     */
    registerPlayerWithCode: function (code, gamertag, password) {
        var self = this;
        return this.mongoFind(this.mongoRegimes, {regCodes: code}, 1).then(function (regime) {
            if (regime && !regime.regCodeProps[code].expired) {
                // Found regime
                var props = regime.regCodeProps[code];
                if (props.trial) {
                    var player = new TrialPlayer(gamertag, password, regime.id);
                } else {
                    player = new Player(gamertag, password, regime.id);
                }
                return self.mongoInsertOne(self.mongoPeople, player).then(function (res) {
                    if (!props.reusable) {
                        return self.expireCode(regime, code).then(function () {
                            return self.addTicket('FIXME', props.trial ? 'trial' : 'player', player.id);
                        });
                    } else {
                        return self.addTicket('FIXME', props.trial ? 'trial' : 'player', player.id);
                    }
                });
            } else {
                return Promise.reason('Invalid code');
            }
        });
    },

    /**
     * Expire regime code to make unusable
     * @param {Regime} regime
     * @param {string} code
     */
    expireCode: function (regime, code) {
        var fieldSpec = {};
        fieldSpec['regCodeProps.' + code + '.expired'] = true;
        return this.mongoRegimes.updateOne({_id: new ObjectId(regime.id)}, {$set: fieldSpec}).then(function () {
            regime.regCodeProps[code].expired = true;
        });
    },

    getNewGuest: function (tagname, server, cb) {
        this.mongoGuests.insertOne({username: tagname}).then(function (result) {
            cb(result.ops[0]);
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
        console.log(err.stack);
    }
};