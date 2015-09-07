/**
 * Created by jay on 9/6/15.
 */
'use strict';

var MongoClient = require('mongodb').MongoClient;

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
            cb();
        })
    },

    getPlayerByUsername: function (username, cb) {
        this.mongoPeople.findOne({username: username}).then(cb, this.handleDBError.bind(this));
    },

    handleDBError: function (err) {
        // FIXME: be smarter
        console.log('DB Error', err);
    }
};