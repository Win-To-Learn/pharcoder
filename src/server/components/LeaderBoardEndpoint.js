/**
 * LeaderBoardEndpoint.js
 */
'use strict';

module.exports = {
    init: function () {
        var self = this;
        //this.onLoginCB.push(this.addPlayerToLeaderBoard);
        this.leaderBoardCategories = {};
        setInterval(function () {
            var data = {};
            var dataFlag = false;
            for (var cat in self.leaderBoardCategories) {
                var rec = self.leaderBoardCategories[cat];
                if (rec.dirty) {
                    data[cat] = rec.data;
                    dataFlag = true;
                    rec.dirty = false;
                }
            }
            self.io.emit('leaderboard', data);
        }, 1000);
    },

    onReadyCB: function (player) {
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

    onDisconnectCB: function (socket, player) {
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
        }
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