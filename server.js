var Game = require('./Game.js');

// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);

const PORT = process.env.PORT || 5000;

app.set('port', PORT);
app.use('/static', express.static(__dirname + '/static'));
app.use('/cards', express.static(__dirname + '/cards'));

// Routing
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'menu.html'));
});

// Routing
app.get('/game', function (request, response) {
    response.sendFile(path.join(__dirname, 'game.html'));
});

server.listen(PORT, function () {
    console.log('Starting server on port 5000');
});

//////////////////////

let all_games = new Map();
let player_counter = new Map();

let sockets = [];
let suits = ["S", "C", "D", "H"];

// everything is initialised here
io.on('connection', function (socket) {
    let id = -1;
    let game = null;
    let turn = 0;

    sockets.push(socket);

    socket.on('new player', function(roomid, name) {
        if (!all_games.has(roomid)) {
            all_games.set(roomid, new Game());
            player_counter.set(roomid, 0);
        }
        game = all_games.get(roomid);

        id = player_counter.get(roomid);
        player_counter.set(roomid, id + 1);

        console.log("This is ID " + id);  
        socket.emit('init', id);
        socket.emit('initialiseHand', game.players[id].hand, suits);

        if (id === 0) {
            socket.emit('onturn');
        } else {
            socket.emit('offturn');
        }
    });

    socket.on('made-move', function(card, player) {
        for (let i = 0; i < 4; i++) {
            socket.emit('update-move', card, player);
        }
    }); 

    socket.on('turn', function (index) {
        // update game state, only it the id is the right player
        if (game.turn == id) {
            let prevturn = game.turn;
            let currentCard = game.players[id].hand[index];
            let works = game.make_move(index); // game turn increases after this
            
            if (works) {
                // let cardId = currentCard.suit.toString() + currentCard.value.toString();

                console.log('emitted valid move');
                for (let i = 0; i < sockets.length; i++) {
                    let relPlayer = (id-i + sockets.length) % sockets.length;
                    sockets[i].emit('update-move', suits, currentCard.suit, currentCard.value, relPlayer);
                }
                sockets[id].emit('valid', currentCard, id);

                if (prevturn !== game.turn) {    

                    sockets[prevturn].emit('offturn');
                    sockets[game.turn].emit('onturn');
                }
            } else {
                game.turn--; // undo the game turn added from the method
                sockets[prevturn].emit('invalid');
            }
        }
    });

    socket.on('disconnect', function() {
        console.log("Disconnected :(");
        let i = sockets.indexOf(socket);
        
        sockets.splice(i, 1);
    })
});

function update() {

    // current_socket.emit('state', game.players[i]);
    // for (let i = 0; i < sockets.length; i++) {
    //     sockets[i].emit('state', game.players[i]); 
    // }

    if (game.trick == null) {
        io.sockets.emit('table', "");
    } else {
        io.sockets.emit('table', game.trick.toString());
    }
}