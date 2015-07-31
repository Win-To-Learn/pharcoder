/**
 * LeaderBoardEndpoint.js
 */
'use strict';

var LeaderBoardEndpoint = function () {};

LeaderBoardEndpoint.prototype.initLeaderBoardEndpoint = function () {
    var self = this;
    this.onLoginCB.push(this.addPlayerToLeaderBoard);
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
};

//LeaderBoardEndpoint.prototype.updateLeaderBoard = function (socket, player) {
//    //setInterval(function () {
//    //    socket.emit('leaderboard', {
//    //        'Ships Tagged': [1,2,3],
//    //        'Trees Planted': [3,2,1],
//    //        'tag Streak': [2,1,3]
//    //    });
//    //}, 3000)
//};

LeaderBoardEndpoint.prototype.newLeaderBoardCategory = function (cat, asc) {
    this.leaderBoardCategories[cat] = {
        data: [],
        dirty: false,
        asc: !!asc
    }
};

LeaderBoardEndpoint.prototype.addPlayerToLeaderBoard = function (socket, player) {
    for (var cat in this.leaderBoardCategories) {
        var rec = this.leaderBoardCategories[cat];
        if (rec.asc) {
            rec.data.push({id: player.id, val: Infinity});
        } else {
            rec.data.push({id: player.id, val: 0});
        }
        rec.dirty = true;
    }
};

/**
 * Update leader board record. Assumes new val is 'better' than old.
 *
 * @param cat {string} - name of category
 * @param playerid {number} - player id number
 * @param val {number} - new value
 */
LeaderBoardEndpoint.prototype.updatePlayerScore = function (cat, playerid, val) {
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
        this.leaderBoardCategories[cat].dirty = true;
    }
};

module.exports = LeaderBoardEndpoint;