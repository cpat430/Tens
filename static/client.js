// keep this!
var socket = io();

socket.emit('new player');

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;

canvas.onclick=move;

function move(e) {
    socket.emit('turn'); // this is the way of having a turn
}

socket.on('init', function(state) {
    let paragraph = document.getElementById('state');
    paragraph.innerHTML = "You are person " + state;

});

socket.on('state', function (state) {
    showState(state);
});

function showState(state) {
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);
    ctx.fillText(state, 400, 300);
}