/**
 * Created by jay on 9/6/15.
 */
'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var Player = require('../players/Player.js');
var Guest = require('../players/Guest');

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

    handleDBError: function (err) {
        // FIXME: be smarter
        console.log('DB Error', err);
    }
};