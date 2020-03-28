// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(5000, function () {
    console.log('Starting server on port 5000');
});
/////////////////////////////////////////////////

let total_players = 0;
let current_player = 1; // 1-indexed

io.on('connection', function (socket) {
    let id = -1;
    // on each new player connection, these functions are called
    socket.on('new player', function () {
        total_players++;
        console.log("This is ID " + total_players);
        id = total_players;

        socket.emit('init', id);
    });

    socket.on('turn', function () {
        // update game state, only it the id is the right player
        if (id == current_player) {
            current_player = current_player >= total_players ? 1 : current_player + 1;
        }
    });
});

// continuously updates the state
setInterval(function () {
    io.sockets.emit('state', current_player + "/" + total_players); 
}, 1000 / 60);