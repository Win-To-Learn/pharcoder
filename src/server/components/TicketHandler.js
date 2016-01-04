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
     * @return {Promise}
     */
    addTicket: function (server, type, identity) {
        var self = this;
        var doc = {server: server, type: type, identity: identity, createdAt: new Date()};
        return this.mongoInsertOne(this.mongoTickets, doc).then(function (ticket) {
            self.cacheObject('tickets', ticket._id.toHexString(), doc, 60000);
            return ticket._id.toHexString();
        });
    },

    /**
     * Get identity associated with ticket on this server, if valid
     * @param {string} id - Id of ticket
     * @param {string} server - Server where access is sought
     * @return {Promise}
     */
    checkTicket: function (id, server) {
        return this.mongoFind(this.mongoTickets, {_id: new ObjectId(id)}, 1).then(function (doc) {
            // TODO: Check server validity
            if (doc) {
                return {type: doc.type, identity: doc.identity};
            } else {
                cb(null);
            }
        });
    }
};