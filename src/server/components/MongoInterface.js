/**
 * Created by jay on 9/6/15.
 */
'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var Player = require('../../schema/Player.js');
var Guest = require('../../schema/Guest.js');

var constructorMap = {};


/**
 * Take POJO returned by mongo and add prototypes to known types
 *
 * @param o {object|Array}
 * @returns {*}
 */
function unfreeze (o) {
    if (Array.isArray(o)) {
        // Array - unfreeze each element
        for (var i = 0, l = o.length; i < l; i++) {
            if (typeof o[i] === 'object') {
                o[i] = unfreeze(o[i]);
            }
        }
    } else {
        // Object
        if (o.cType) {
            // Only deal with known constructors
            var ctor = constructorMap[o.cType], proto = ctor.prototype;
            if (proto.restore) {
                // If prototype has a restore function, create a new instance and let it restore state from the old
                var n = Object.create(proto);
                n.restore(o);
                o = n;
            } else {
                // No restore - just add prototype
                o.prototype = proto;
            }
        }
        // Loop through properties and unfreeze recursively
        for (var k in o) {
            if (o.hasOwnProperty(k) && typeof o[k] === 'object') {
                o[k] = unfreeze(o[k]);
            }
        }
    }
    return o;
}

module.exports = {
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

    getPlayerByUsername: function (username, cb) {
        this.mongoPeople.findOne({username: username}).then(cb, this.handleDBError.bind(this));
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
            if (spec.role === 'player') {
                cb(Player.fromDB(record));
            } else {
                cb(Guest.fromDB(record));
            }
        })
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