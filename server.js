// global variables
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var Room = require('./Room.js');
const { exists } = require('fs');
const { emit } = require('process');

const PORT = process.env.PORT || 5000;

function initializeExpress() {
    app.set('port', PORT);
    app.use('/', express.static(__dirname + '/'));
    
    app.get('/', function (request, response) {
        response.sendFile(path.join(__dirname, 'menu.html'));
    });

    // app.get('/game', function (request, response) {
    //     response.sendFile(path.join(__dirname, 'game.html'));
    // });

    app.get('/game', function (request, response) {
        console.log(request.query.roomid);
        response.sendFile(path.join(__dirname, 'game.html'), {roomid: request.query.roomid});
    });

    app.get('/test', function (request, response) {
        response.sendFile(path.join(__dirname, 'test.html'));
    });
    
    server.listen(PORT, function () {
        console.log('Starting server on port 5000');
    });
}

// map that contains all the rooms of games
let rooms = new Map();

// the four suits in the game (can probably remove this sometime)
let suits = ["S", "D", "C", "H"];

// everything is initialised here
io.on('connection', function (socket) {
    let id = -1;
    let room = null;
    
    /**
     * Socket listener that detects when a connection is made. 
     * If the room has not been made, a new room with roomid will be made.
     * Otherwise, we get the room from the map and add the socket and id.
     * 
     * Input:   roomid, unique ID to the room.
     *          pos, position the player is sitting in.
     *          name (optional), the name corresponding to the current player.
     */
    socket.on('new player', function(roomid, pos) {
        
        // if the room does not exist, create a new room with the current ID
        if (!rooms.has(roomid)) {
            rooms.set(roomid, new Room(roomid));
        }

        // get the room and add the socket and id to the room.
        room = rooms.get(roomid);

        // if the room is full
        if (room.room_sockets[pos] != null) {
            socket.emit('full-game');
            return;
        }

        room.room_sockets[pos] = socket;
       
        id = pos;

        // initialise the client using the ID.
        socket.emit('init', id);

        // initialise the hand of the current player.
        socket.emit('initialiseHand', room.game.players[id].hand);

        // set the current turn so the client know how the turn arrow should be drawn.
        socket.emit('current-turn', room.game.turn);

        updateAllNames();
        
        // if the player is the dealer, then open the trump modal.
        if (room.game.trump == -1 && room.game.players[id].dealer) {
            socket.emit('open-trump-modal');
        }

        // will need to redraw the status

        let game = room.game;

        let team1Tricks = game.players[0].tricks.length + game.players[2].tricks.length;
        let team1Tens = [...game.players[0].tens, ...game.players[2].tens];
        let team1Score = room.team1Score;
        let team2Tricks = game.players[1].tricks.length + game.players[3].tricks.length;
        let team2Tens = [...game.players[1].tens, ...game.players[3].tens];
        let team2Score = room.team2Score;

        let team1Status = {team1Tricks, team1Tens, team1Score};
        let team2Status = {team2Tricks, team2Tens, team2Score};
        let names = room.player_names;

        socket.emit('redraw-status', game.trick, team1Status, team2Status, names);
    });

    socket.on('disconnect', function() {

        if (room) {
            room.room_sockets[id] = null;
        }
    });

    /**
     * Updates the trump in the game once the dealer chooses the trump.
     * Then deals the rest of the trump chooser's hand and redraws it.
     * Input:   trump, the chosen trump by the player. 
     *          id, the ID of the player who chose the trump 
     */
    socket.on('update-trump', function(trump, id) {

        // set the trump
        room.game.trump = trump;

        // deal the rest of the player's hand
        room.game.deal_cards(room.game.players[id], 13);

        // redraw the hand
        room.room_sockets[id].emit('redraw-hand', room.game.players[id].hand);
    })
    
    /**
     * Makes a turn in the game and checks if there is a winner
     * 
     * Input:   cardID, the id of the card that will be drawn.
     */
    socket.on('turn', function (cardId) {

        // if the room doesn't exist, do nothing.
        if (!room) return;

        // update game state, only it the id is the right player
        if (room.game.turn == id) {

            // save the previous turn from the game.
            let prevturn = room.game.turn;
            
            // Make a move in the game and get the result.
            let {works, winner, tens, gameOver} = room.game.make_move(cardId);

            // if the move 'works' or is valid.
            if (works) {

                // if 4 cards have been played, update the scoreboard.
                if (room.currentTurn == 3) {

                    // take the winner and update their scoreboard
                    for (let i = 0; i < 4; i++) {
                        if (socketExists(room.room_sockets[i])) {
                            room.room_sockets[i].emit('update-scoreboard', gameOver, tens, winner);
                        }
                    }
                }
                
                // if this is the last turn, remove on the next valid move.
                if (room.currentTurn == 4) {

                    // reset the canvas
                    for (let i = 0; i < 4; i++) {
                        if (socketExists(room.room_sockets[i])) {
                            room.room_sockets[i].emit('reset-canvas');
                        }
                    }

                    // reset the current turn counter to 0.
                    room.currentTurn = 0;
                }
                
                // for all the players, draw the card.
                for (let i = 0; i < 4; i++) {

                    // send the relative player of the person who played the card.
                    let relPlayer = (id - i + 4) % 4;

                    // emit the move.
                    if (socketExists(room.room_sockets[i])) {
                        room.room_sockets[i].emit('update-move', cardId, relPlayer);
                    }
                }

                // redraw the hand.
                socket.emit('redraw-hand', room.game.players[id].hand);
                
                // change the player that can make a move.
                try {
                    room.room_sockets[prevturn].emit('offturn');
                    room.room_sockets[room.game.turn].emit('onturn'); 
                } catch (e) {
                    console.log("Some window isn't open");
                }           
                
                // increase the turn number.
                room.currentTurn++;  
                
                // if the game is over, indicate who won.
                if (gameOver) {
                    
                    let message = "Team" + winner + " won the game";

                    // emit the end of game to the client.
                    // for (let i = 0; i < 4; i++) {
                    //     room.room_sockets[i].emit('end-of-game', message);
                    // }
                    socket.emit('end-of-game', message); // TODO: make it so it sends to everyone and gets status.
                    
                }

            } else {

                // if it doesn't work, output invalid
                room.room_sockets[prevturn].emit('invalid');
            }

            // change the current turn for all the clients.
            for (let i = 0; i < 4; i++) {
                
                if (socketExists(room.room_sockets[i])) {
                    room.room_sockets[i].emit('current-turn', room.game.turn);
                }
            }
        }
    });

    /**
     * Update the name of the player.
     */
    socket.on('updateName', function(name) {
        room.player_names[id] = name;
    })

    // Asked by menu.js, returns if the game exists
    socket.on('queryPlayerNames', function(roomid) {
        roomid = roomid.toUpperCase();
        let exist = false, names;
        if (rooms.has(roomid)) {
            exist = true;
            names = [];
            for (let i = 0; i < 4; i++) {
                names.push(rooms.get(roomid).room_sockets[i] ? rooms.get(roomid).player_names[i] : null);
            }
        } 
        
        socket.emit('responsePlayerNames', exist, roomid, names);
    });

    /**
     * create a new game and move the starting player over.
     * 
     * Input:   roomid, the current game room id
     */
    socket.on('newGame', function(roomid) {

        // find next starting player
        let next_dealer = (room.game.dealer + 1) % 4;

        // create the new game with the next player.
        room.newGame(next_dealer);

        // for all the players, update the game.
        for (let i = 0; i < 4; i++) {

            // get the current socket.
            let thissocket = room.room_sockets[i];

            // if the socket exists.
            if (socketExists(thissocket)) {

                // initialise the hand 
                thissocket.emit('initialiseHand', room.game.players[i].hand);

                // reset the canvas
                thissocket.emit('reset-canvas');

                // reset the tens and the tricks.
                thissocket.emit('reset-tens-and-tricks');

                // if the player is the new starting player, open the trump modal.
                if (room.game.players[i].dealer) {
                    thissocket.emit('open-trump-modal');
                }
            }
        }
    });

    /**
     * Change the name of the players at real time for all players
     * 
     * Input:   name, the current players name
     */
    socket.on('changeName', function(name) {

        // if the room doesn't exist, do nothing.
        if (!room) return;
        
        // set the name to the current input name
        room.player_names[id] = name;

        // update the name for all people
        for (let i = 0; i < 4; i++) {
            
            // get the current socket
            let thissocket = room.room_sockets[i];

            // if the socket exists, update the name
            if (socketExists(thissocket)) {
                thissocket.emit('updateName', id, name);
            }
        }
    });

    function updateAllNames() {
        // update the name for all people
        for (let i = 0; i < 4; i++) {
            
            // get the current socket
            let thissocket = room.room_sockets[i];

            // if the socket exists, update the name
            if (thissocket) {
                thissocket.emit('updateName', id, room.player_names[id]);
            }
        }
    };

    /**
     * Checks if a socket exists
     * 
     * @param {Socket} socket 
     * 
     * @return {boolean} exists
     */
    function socketExists(socket) {
        if (socket) {
            return true;
        }

        return false;
    }
});

initializeExpress();