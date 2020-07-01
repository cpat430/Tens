// global variables
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var Room = require('./Room.js');

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

let rooms = new Map();

let sockets = [];

let suits = ["S", "D", "C", "H"];

// everything is initialised here
io.on('connection', function (socket) {
    let id = -1;
    let _roomid;
    let room = null;
    
    sockets.push(socket);
    
    socket.on('new player', function(roomid, pos, name) {
        if (!rooms.has(roomid)) {
            rooms.set(roomid, new Room(roomid));
        }
        
        room = rooms.get(roomid);
        room.room_sockets[pos] = socket;
        id = pos;
        
        console.log("This is ID " + id);  
        socket.emit('init', id);
        socket.emit('initialiseHand', room.game.players[id].hand);
        socket.emit('current-turn', room.game.turn);
        
        if (room.game.players[id].dealer) {
            socket.emit('open-trump-modal');
        }
    });

    socket.on('update-trump', function(trump, id) {

        // set the trump
        room.game.trump = trump;

        // deal the rest of the player's hand
        room.game.deal_cards(room.game.players[id], 13);

        room.room_sockets[id].emit('redraw-hand', room.game.players[id].hand);
    })
    
    socket.on('turn', function (cardId) {
        if (!room) return;

        // update game state, only it the id is the right player
        if (room.game.turn == id) {
            let prevturn = room.game.turn;
            
            let {works, winner, tens, gameOver} = room.game.make_move(cardId); // game turn increases after this

            if (works) {

                if (room.currentTurn == 3) {
                    // take the winner and update their scoreboard
                    for (let i = 0; i < 4; i++) {
                        room.room_sockets[i].emit('update-scoreboard', gameOver, tens, winner);
                    }
                }
                
                // if this is the last turn, remove on the next valid move.
                if (room.currentTurn == 4) {
                    // reset the canvas
                    for (let i = 0; i < 4; i++) {
                        room.room_sockets[i].emit('reset-canvas');
                    }
                    room.currentTurn = 0;

                }
                
                for (let i = 0; i < 4; i++) {
                    let relPlayer = (id - i + 4) % 4;
                    room.room_sockets[i].emit('update-move', cardId, relPlayer);
                }

                // redraw the hand.
                socket.emit('redraw-hand', room.game.players[id].hand);
                
                try {
                    room.room_sockets[prevturn].emit('offturn');
                    room.room_sockets[room.game.turn].emit('onturn'); 
                } catch (e) {
                    console.log("Some window isn't open");
                }           
                
                room.currentTurn++;  
                
                if (gameOver) {
                    
                    let message = "Team" + winner + " won the game";

                    socket.emit('end-of-game', message);
                }

            } else {
                room.room_sockets[prevturn].emit('invalid');
            }

            for (let i = 0; i < 4; i++) {
                room.room_sockets[i].emit('current-turn', room.game.turn);
            }
        }
    });

    socket.on('updateName', function(name) {
        room.player_names[id] = name;
    })
    
    // socket.on('disconnect', function() {
    //     console.log("Disconnected :(");
        
    //     let i = sockets.indexOf(socket);
    //     sockets.splice(i, 1);
        
    //     if (_roomid) {
    //         let j = room_sockets.get(_roomid).indexOf(socket);
    //         room_sockets.get(_roomid).splice(j, 1);
    //     } 
    // })

    // Asked by menu.js, returns if the game exists
    socket.on('roomExistQuery', function(roomid) {
        socket.emit('roomExistResult', room.player_names);
    });

    socket.on('newGame', function(roomid) {

        // find dealer

        let next_dealer = (room.game.dealer + 1) % 4;

        room.newGame(next_dealer);

        for (let i = 0; i < 4; i++) {
            let thissocket = room.room_sockets[i];

            if (thissocket) {
                thissocket.emit('initialiseHand', room.game.players[i].hand);
                thissocket.emit('reset-canvas');
                thissocket.emit('reset-tens-and-tricks');

                if (room.game.players[i].dealer) {
                    thissocket.emit('open-trump-modal');
                }
            }
            
        }
    });

    socket.on('changeName', function(name) {
        if (!room) return;
        
        room.player_names[id] = name;

        for (let i = 0; i < 4; i++) {            
            let thissocket = room.room_sockets[i];

            if (thissocket) {
                thissocket.emit('updateName', id, name);
            }
        }
    })
});

initializeExpress();