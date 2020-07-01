let Game = require('./Game.js');

module.exports = class Room {
    constructor(roomid) {
        this.game = new Game(Math.floor(Math.random() * 4)); // game instance
        this.player_counter = 0;
        this.room_sockets = [null, null, null, null];
        this.player_names = ['', '', '', ''];
        this.roomid = roomid;
    }

    newGame(dealer) {
        this.game = new Game(dealer);
    }
}