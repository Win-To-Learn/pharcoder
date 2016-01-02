/**
 * TicketHandler.js
 *
 * Tickets for exchanging authentication info between login and game servers
 */
'use strict';

var ObjectId = require('mongodb').ObjectID;

module.exports = {
    init: function () {
        var self = this;
        this.events.on('dbConnected', function () {
            self.mongoTickets = self.mongoDB.collection('tickets');     // FIXME: use config
        });
    },

    /**
     * Add ticket for a particular identity on a particular server
     * @param {string} server - server
     * @param {string} type - type of login (guest, trial, etc.)
     * @param {string|object} identity - minimal info to pass identity
     * @param {function} cb - Callback to receive result
     */
    addTicket: function (server, type, identity, cb) {
        var self = this;
        var doc = {server: server, type: type, identity: identity, createdAt: new Date()};
        this.mongoInsertOne(this.mongoTickets, doc, function (id) {
            self.cacheObject('tickets', id, doc, 60000);
            cb(id);
        })
    },

    /**
     * Get identity associated with ticket on this server, if valid
     * @param {string} id - Id of ticket
     * @param {string} server - Server where access is sought
     * @param {function} cb - Callback to receive result
     */
    checkTicket: function (id, server, cb) {
        this.mongoFind(this.mongoTickets, {_id: new ObjectId(id)}, function (doc) {
            // TODO: Check server validity
            if (doc) {
                cb({type: doc.type, identity: doc.identity});
            } else {
                cb(null);
            }
        })
    }
};