// global variables
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var Game = require('./Game.js');

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


// game global variables
let all_games = new Map(); // roomid -> 'Game' objects
let player_counter = new Map(); // roomid -> player count
let room_sockets = new Map(); // roomid -> socket Array
let player_names = new Map();

let sockets = [];

let suits = ["S", "C", "D", "H"];
let currentTurn = 0;

// everything is initialised here
io.on('connection', function (socket) {
    let id = -1;
    let game = null;
    let _roomid;
    
    sockets.push(socket);
    
    socket.on('new player', function(roomid, pos, name) {
        if (!all_games.has(roomid)) {
            all_games.set(roomid, new Game());
            player_counter.set(roomid, 0);
            room_sockets.set(roomid, []);
            player_names.set(roomid, ['', '', '', '']);
        }
        
        game = all_games.get(roomid);
        _roomid = roomid;

        if (room_sockets.get(roomid)[pos]) {
            throw "Bad";
        }
        
        room_sockets.get(roomid)[pos] = (socket);

        id = pos;
        
        console.log("This is ID " + id);  
        socket.emit('init', id);
        socket.emit('initialiseHand', game.players[id].hand, suits);
        
        if (id === 0) {
            socket.emit('onturn');
        } else {
            socket.emit('offturn');
        }
    });
    
    // socket.on('made-move', function(card, player) {
    //     for (let i = 0; i < 4; i++) {
    //         socket.emit('update-move', card, player);
    //     }
    // }); 
    
    socket.on('turn', function (cardId) {
        // update game state, only it the id is the right player
        if (game.turn == id) {
            let prevturn = game.turn;
            var currentCard;
            
            var curPlayerHand = game.players[id].hand;
            let index = -1;
            
            // iterate through the players hand and see if the id is equal to the card id
            for (let i = 0; i < curPlayerHand.length; i++) {
                // console.log(curPlayerHand[i]);
                if (curPlayerHand[i].id === cardId) {
                    currentCard = curPlayerHand[i];
                    index = i;
                }
            }
            
            let {works, winner, tens, gameOver} = game.make_move(currentCard.suit, index); // game turn increases after this

            if (works) {

                if (currentTurn === 3) {
                    // take the winner and update their scoreboard
                    for (let i = 0; i < 4; i++) {
                        room_sockets.get(_roomid)[i].emit('update-scoreboard', gameOver, tens, winner);
                    }
                }
                
                // if this is the last turn, remove on the next valid move.
                if (currentTurn === 4) {
                    // reset the canvas
                    for (let i = 0; i < room_sockets.get(_roomid).length; i++) {
                        room_sockets.get(_roomid)[i].emit('reset-canvas');
                    }
                    currentTurn = 0;

                }
                
                for (let i = 0; i < room_sockets.get(_roomid).length; i++) {
                    let relPlayer = (id - i + 4) % 4;
                    room_sockets.get(_roomid)[i].emit('update-move', suits, currentCard.suit, currentCard.value, relPlayer);
                }
                
                socket.emit('valid', currentCard, id);

                // redraw the hand.
                sockets[id].emit('redraw-hand', curPlayerHand);
                
                room_sockets.get(_roomid)[prevturn].emit('offturn');
                room_sockets.get(_roomid)[game.turn].emit('onturn');            
                
                currentTurn++;  
                
                if (gameOver) {
                    
                    let message = "Team" + winner + " won the game";

                    socket.emit('end-of-game', message);
                }

            } else {
                // game.turn--; // undo the game turn added from the method
                room_sockets.get(_roomid)[prevturn].emit('invalid');
            }
        }
    });

    socket.on('updateName', function(name) {
        player_names.get(_roomid)[id] = name;
    })
    
    socket.on('disconnect', function() {
        console.log("Disconnected :(");
        
        let i = sockets.indexOf(socket);
        sockets.splice(i, 1);
        
        if (_roomid) {
            let j = room_sockets.get(_roomid).indexOf(socket);
            room_sockets.get(_roomid).splice(j, 1);
        } 
    })

    // Asked by menu.js, returns if the game exists
    socket.on('roomExistQuery', function(roomid) {
        socket.emit('roomExistResult', player_names.get(roomid));
    });
});

initializeExpress();