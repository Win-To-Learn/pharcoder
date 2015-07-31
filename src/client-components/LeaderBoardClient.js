/**
 * LeaderBoardClient.js
 */
'use strict';

var LeaderBoardClient = function () {};

LeaderBoardClient.prototype.initLeaderBoardClient = function () {
    this.onConnectCB.push(this.startLeaderBoard);
    this.leaderBoard = {};
    this.leaderBoardCats = [];
    this.leaderBoardState = null;
};

LeaderBoardClient.prototype.startLeaderBoard = function (socket) {
    var self = this;
    socket.on('leaderboard', function (lb) {
        for (var cat in lb) {
            // Record new category
            if (!(cat in self.leaderBoard)) {
                self.leaderBoardCats.push(cat);
            }
            // Start cycling if this is first category
            if (self.leaderBoardState === null) {
                self.leaderBoardState = 0;
                self.game.leaderboard.visible = true;
                setInterval(self.cycleLeaderBoard.bind(self), self.config.leaderBoardClientCycle || 5000);
            }
            // Display if updated board is showing
            if (self.leaderBoardCats[self.leaderBoardState] === cat) {
                self.game.leaderboard.setContent(cat, lb[cat], self.player.id);
            }

            self.leaderBoard[cat] = lb[cat];
        }
    })
};

LeaderBoardClient.prototype.cycleLeaderBoard = function () {
    this.leaderBoardState = (this.leaderBoardState + 1) % this.leaderBoardCats.length;
    var cat = this.leaderBoardCats[this.leaderBoardState];
    this.game.leaderboard.setContent(cat, this.leaderBoard[cat], this.player.id);
};

module.exports = LeaderBoardClient;