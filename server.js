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

let game = new Game();
let total_players = 0;
let sockets = [];
let names = [null, null, null, null];

// everything is initialised here
io.on('connection', function (socket) {
    let id = total_players++;

    console.log("This is ID " + total_players);
        
    socket.emit('init', id);
    if (id === 0) {
        socket.emit('onturn');
    } else {
        socket.emit('offturn');
    }
    sockets.push(socket);

    socket.on('turn', function (index) {
        // update game state, only it the id is the right player
        if (game.turn == id) {
            let prevturn = game.turn;
            game.make_move(index);
            if (prevturn !== game.turn) {
                sockets[prevturn].emit('offturn');
                sockets[game.turn].emit('onturn');
            }
        }
        update();
        console.log("hi");
    });

    socket.on('name', function(name) {
        names[id] = name;
    })

    socket.on('disconnect', function() {
        console.log("Disconnected :(");
        let i = sockets.indexOf(socket);
        names[i] = null;
        
        sockets.splice(i, 1);
        total_players--;
    })
});

function update() {
    for (let i = 0; i < sockets.length; i++) {
        sockets[i].emit('state', game.players[i]); 
    }
    if (game.trick == null) {
        io.sockets.emit('table', "");
    } else {
        io.sockets.emit('table', game.trick.toString());
    }
}