/**
 * LeaderBoardEndpoint.js
 */
'use strict';

module.exports = {
    init: function () {
        var self = this;
        //this.login.push(this.addPlayerToLeaderBoard);
        this.leaderBoardCategories = {};
        // Save to DB
        setInterval(function () {
            self.mongoExtra.update({key: 'hiscore'}, {$set: {data: self.leaderBoardPersistentCategories}});
        }, 10000);
        // Update persistent categories
        setInterval(function () {
            for (var cat in self.leaderBoardCategories) {
                var rec = self.leaderBoardCategories[cat];
                var prec = self.leaderBoardPersistentCategories[cat];
                // if (!rec.dirty) {
                //     continue;
                // }
                for (var i = 0; i < rec.data.length; i++) {
                    var d = rec.data[i];
                    if (d.id[0] === 'G') {
                        continue;
                    }
                    var found = false;
                    for (var j = 0; j < prec.data.length; j++) {
                        if (prec.data[j].id === d.id) {
                            found = true;
                            if ((!rec.asc && d.val > prec.data[j].val) || (rec.asc && d.val < prec.data[j].val)) {
                                prec.data[j].val = d.val;
                            }
                        }
                    }
                    if (!found && (!rec.asc && d.val > 0) || (rec.asc && d.val < Infinity)) {
                        prec.data.push({id: d.id, name: self.playersById[d.id].gamertag, val: d.val});
                        prec.dirty = true;
                    }
                }
            }
        }, 5000);
        // Send updates
        setInterval(function () {
            var data = {};
            for (var cat in self.leaderBoardCategories) {
                var rec = self.leaderBoardCategories[cat];
                if (rec.dirty) {
                    data[cat] = rec.data;
                    rec.dirty = false;
                }
            }
            for (cat in self.leaderBoardPersistentCategories) {
                rec = self.leaderBoardPersistentCategories[cat];
                if (rec.dirty) {
                    data['*' + cat + '*'] = rec.data;
                    rec.dirty = false;
                }
            }
            self.io.emit('leaderboard', data);
        }, 1000);
    },

    finalize: function () {
        //console.log('final');
        var self = this;
        this.mongoExtra.find({key: 'hiscore'}).limit(1).next().then(function (res) {
            if (res) {
                //console.log('Path 1');
                self.leaderBoardPersistentCategories = res.data;
            } else {
                //console.log('Path 2');
                self.leaderBoardPersistentCategories = {};
                self.leaderBoardPersistentCategories['Ships Tagged'] = {
                    dirty: true,
                    data: []
                };
                self.leaderBoardPersistentCategories['Trees Planted'] = {
                    dirty: true,
                    data: []
                };
                self.leaderBoardPersistentCategories['Tag Streak'] = {
                    dirty: true,
                    data: []
                };
                self.mongoExtra.insert({key: 'hiscore', data: self.leaderBoardPersistentCategories});
            }
        }, this.handleDBError.bind(this));
    },

    ready: function (player) {
        for (var cat in this.leaderBoardCategories) {
            var rec = this.leaderBoardCategories[cat];
            if (rec.asc) {
                rec.data.push({id: player.id, val: Infinity});
            } else {
                rec.data.push({id: player.id, val: 0});
            }
            rec.dirty = true;
        }
        for (cat in this.leaderBoardPersistentCategories) {
            rec = this.leaderBoardPersistentCategories[cat];
            rec.dirty = true;
        }
    },

    disconnect: function (socket, player) {
        for (var k in this.leaderBoardCategories) {
            var rec = this.leaderBoardCategories[k];
            for (var i = 0, l = rec.data.length; i < l; i++) {
                if (rec.data[i].id === player.id) {
                    rec.data.splice(i, 1);
                    break;
                }
            }
            rec.dirty = true;
        }

    },

    newLeaderBoardCategory: function (cat, asc) {
        this.leaderBoardCategories[cat] = {
            data: [],
            dirty: false,
            asc: !!asc
        };
        // this.leaderBoardPersistentCategories[cat] = {
        //     data: [],
        //     dirty: false,
        //     asc: !!asc
        // }
    },

    addPlayerToLeaderBoard: function (socket, player) {
        for (var cat in this.leaderBoardCategories) {
            var rec = this.leaderBoardCategories[cat];
            if (rec.asc) {
                rec.data.push({id: player.id, val: Infinity});
            } else {
                rec.data.push({id: player.id, val: 0});
            }
            rec.dirty = true;
        }
    },

    /**
     * Update leader board record. Assumes new val is 'better' than old.
     *
     * @param cat {string} - name of category
     * @param playerid {number} - player id number
     * @param val {number} - new value
     */
    updatePlayerScore: function (cat, playerid, val) {
        var data = this.leaderBoardCategories[cat].data;
        var asc = this.leaderBoardCategories[cat].asc;
        var i = 0;
        var prec = null;
        while (i < data.length) {
            if (data[i].id === playerid) {
                prec = data[i];
                prec.val = val;
                break;
            }
            i++;
        }
        var j = i - 1;
        while (j >= 0) {
            if ((!asc && prec.val > data[j].val) || (asc && prec.val < data[j].val)) {
                j--;
            } else {
                break;
            }
        }
        if (++j < i) {
            data.splice(i, 1);
            data.splice(j, 0, prec);
            //this.leaderBoardCategories[cat].dirty = true;
        }
        this.leaderBoardCategories[cat].dirty = true;
    }
};