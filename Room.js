let Game = require('./Game.js');

module.exports = class Room {
    constructor(roomid) {
        this.game = new Game(Math.floor(Math.random() * 4)); // game instance
        this.player_counter = 0;
        this.room_sockets = [null, null, null, null];
        this.player_names = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
        this.roomid = roomid;
        this.currentTurn = 0;
        this.team1Score = 0;
        this.team2Score = 0;
    }

    /**
     * Creates a new game and assigns the new dealer.
     * @param {number} dealer 
     */
    newGame(dealer) {
        this.game = new Game(dealer);
    }
}